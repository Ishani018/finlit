import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JOBS } from '../data/jobs';
import { EDUCATION } from '../data/education';
import { STOCKS, STOCK_SECTORS, NEWS_SECTOR_MAP } from '../data/stocks';
import { MUTUAL_FUNDS } from '../data/mutualFunds';
import { RESIDENTIAL_PROPERTIES, COMMERCIAL_PROPERTIES } from '../data/realEstate';
import { INSURANCE_PLANS } from '../data/insurance';
import { LOAN_TYPES, calculateEMI, getAdjustedRate } from '../data/loans';
import { calculateIncomeTax, CAPITAL_GAINS, TAX_DEDUCTIONS } from '../data/taxes';
import { CRISIS_EVENTS, CRISIS_WEIGHTS } from '../data/crisisEvents';
import { LIFE_DECISIONS, BUDGET_EVENTS } from '../data/lifeDecisions';
import { ACHIEVEMENTS, NET_WORTH_MILESTONES } from '../data/achievements';
import { GROCERY_ITEMS, MONTHLY_HEALTH_DRAIN, SICK_LEAVE_THRESHOLD, CRITICAL_HEALTH_THRESHOLD } from '../data/groceries';
import { FAMILY_DEMANDS } from '../data/familyDemands';
import { getSpriteImage } from '../data/spriteMap';
import { GOLD_ASSETS, GOLD_PRICE_PER_GRAM_BASE } from '../data/gold';
import { Platform, Text, Image } from 'react-native';
import Constants from 'expo-constants';

const REAL_ESTATE = [...RESIDENTIAL_PROPERTIES, ...COMMERCIAL_PROPERTIES];

const getApiBase = () => {
    if (Platform.OS === 'web') return 'http://localhost:8000/api';
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.hostUri;
    if (hostUri) return `http://${hostUri.split(':')[0]}:8000/api`;
    if (Platform.OS === 'android') return 'http://10.0.2.2:8000/api';
    return 'http://192.168.1.18:8000/api';
};
const API_BASE = getApiBase();

const GameContext = createContext();

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame must be used within a GameProvider');
    return context;
};

// Constants
const STARTING_BALANCE = 50000;
const HOSTEL_MAINTENANCE = 3000;
const LIVING_COSTS_BASE = 2000;
const STARTING_AGE = 18;
const RETIREMENT_MONTH = 480; // Age 58 — career ends, retirement begins
const GAME_END_MONTH = 684;   // Age 75 — end of life, legacy screen
const STARTING_CREDIT_SCORE = 600;
const CHILD_AGING_RATE = 3;
const PPF_ANNUAL_RATE = 0.071;
const PPF_MAX_ANNUAL = 150000;

// Trait modifiers keyed by sprite id
const TRAIT_MODIFIERS = {
    young_pia_1:     { mfReturnBonus: 0.08 },
    young_raj_1:     { salaryGrowthBonus: 0.12 },
    young_priya_1:   { tuitionDiscount: 0.25 },
    young_karthik_1: { loanRateReduction: 0.015 },
    young_riya_1:    { livingCostDiscount: 0.10 },
    young_rahul_1:   { stockGainMultiplier: 1.2 },
    young_sara_1:    { crisisChanceReduction: 0.25 },
    young_sia_1:     { rentalBonus: 0.15 },
    young_soms_1:    { inflationImmune: true },
    young_soni_1:    { familyCostDiscount: 0.20 },
    young_kav_1:     { positiveEventBoost: true },
};

export const GameProvider = ({ children }) => {
    // --- CORE STATE ---
    const [balance, setBalance] = useState(STARTING_BALANCE);
    const [turn, setTurn] = useState({ month: 1, year: 2024 });
    const [totalMonthsPlayed, setTotalMonthsPlayed] = useState(0);
    const [history, setHistory] = useState([]);
    const [currentJob, setCurrentJob] = useState(null);
    const [pendingApplications, setPendingApplications] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameSpeed, setGameSpeed] = useState(1);
    const [playerSprite, setPlayerSprite] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [playerBirthday, setPlayerBirthday] = useState(null);
    // Derived — no extra state needed; recompute from playerSprite
    const trait = TRAIT_MODIFIERS[playerSprite] || {};
    const [gameOver, setGameOver] = useState(false);
    const [finalScore, setFinalScore] = useState(null);
    const [isRetired, setIsRetired] = useState(false);
    const [pensionIncome, setPensionIncome] = useState(0);
    const [corpusDrawdown, setCorpusDrawdown] = useState(0);
    const [bucketListDone, setBucketListDone] = useState([]);
    const [happiness, setHappiness] = useState(50); // 0–100; the other dimension of a good life
    
    // Legacy / Dynasty Mode States
    const [generation, setGeneration] = useState(1);
    const [childSavings, setChildSavings] = useState({}); // { [dependentId]: balance }
    const [legacySummary, setLegacySummary] = useState(null);
    const [isLegacyMode, setIsLegacyMode] = useState(false);
    const [dailyTurns, setDailyTurns] = useState({ date: new Date().toDateString(), count: 0 });
    const dailyTurnsRef = useRef({ date: new Date().toDateString(), count: 0 });

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem('finlit_daily_turns');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    setDailyTurns(parsed);
                    dailyTurnsRef.current = parsed;
                }
            } catch (_) {}
        })();
    }, []);

    // Education & Portfolio
    const [degrees, setDegrees] = useState([]);
    const [portfolio, setPortfolio] = useState({});
    const [properties, setProperties] = useState([]);
    const [propertyBuyMonths, setPropertyBuyMonths] = useState({});

    // Housing
    const [currentHousing, setCurrentHousing] = useState({
        id: 'hostel',
        name: 'Hostel Shared Room',
        maintenance: HOSTEL_MAINTENANCE,
        category: 'rental',
        life_quality: 2,
        image: require('../../assets/rooms/hostel.png'),
    });

    // Market
    const [marketPrices, setMarketPrices] = useState({});
    const [priceHistory, setPriceHistory] = useState({}); // { stockId: [p1..p12] }

    // Market Cycle: bull/bear/sideways
    const [marketCycle, setMarketCycle] = useState({ phase: 'sideways', monthsLeft: 12 });

    // --- MUTUAL FUNDS ---
    const [mfNavs, setMfNavs] = useState({});
    const [mfPortfolio, setMfPortfolio] = useState({}); // { mfId: { units, avgNav, buyMonth } }

    // --- SIP PLANS ---
    // [{ id, type:'stock'|'mf', assetId, amount, startMonth, totalInvested }]
    const [sipPlans, setSipPlans] = useState([]);

    // --- RETIREMENT ACCOUNTS ---
    const [ppf, setPpf] = useState({ balance: 0, contributionsThisYear: 0, totalContributions: 0 });
    const [nps, setNps] = useState({ balance: 0, equityPct: 60 });
    const [fixedDeposits, setFixedDeposits] = useState([]);

    // --- GOLD ---
    // goldHoldings: { digital_gold: { grams, avgBuyPrice, buyMonth }, sgb: { grams, avgBuyPrice, buyMonth, interestAccrued }, gold_jewellery: { grams, avgBuyPrice, buyMonth } }
    const [goldHoldings, setGoldHoldings] = useState({});
    const [goldPrice, setGoldPrice] = useState(GOLD_PRICE_PER_GRAM_BASE); // ₹ per gram, 24k

    // --- CREDIT CARD ---
    const [creditCard, setCreditCard] = useState(null); // null = not active | { limit, balance, dueMonth, apr, totalSpent }
    const [activeCreditCards, setActiveCreditCards] = useState([]); // e.g. ['standard', 'premium', 'minor']

    // --- DEPENDENTS ---
    const [dependents, setDependents] = useState([]);
    const [expectingChild, setExpectingChild] = useState(null);
    const [timesMarried, setTimesMarried] = useState(0);
    const [loans, setLoans] = useState([]);
    const [activeInsurance, setActiveInsurance] = useState([]);
    const [creditScore, setCreditScore] = useState(STARTING_CREDIT_SCORE);
    const [activeEffects, setActiveEffects] = useState([]);
    const [activeEnrollment, setActiveEnrollment] = useState(null);
    const [stockNews, setStockNews] = useState([]);
    const [lastCrisisEvent, setLastCrisisEvent] = useState(null);
    const [eventInbox, setEventInbox] = useState([]);
    const [pendingFamilyDemand, setPendingFamilyDemand] = useState(null);
    const [pendingCreditCardOffer, setPendingCreditCardOffer] = useState(false);
    const [demandCooldowns, setDemandCooldowns] = useState({});
    const [lastMonthTax, setLastMonthTax] = useState(0);
    const [lastMonthEMI, setLastMonthEMI] = useState(0);
    const [netWorthHistory, setNetWorthHistory] = useState([]);
    const [lastMonthFlow, setLastMonthFlow] = useState(null);
    const [monthlyRecap, setMonthlyRecap] = useState(null);
    const [pendingJobOffer, setPendingJobOffer] = useState(null);
    const [pendingJobInterview, setPendingJobInterview] = useState(null);
    const [lastHappiness, setLastHappiness] = useState(50);
    const [pendingDecision, setPendingDecision] = useState(null);
    const [pendingDecisionQueue, setPendingDecisionQueue] = useState([]);
    const [firedDecisions, setFiredDecisions] = useState([]);
    // Tracks the last birthday party choice for the Celebration Room visual
    const [lastCelebrationChoice, setLastCelebrationChoice] = useState(null); // { label, who: 'player'|depName }
    const [achievements, setAchievements] = useState([]);
    const [newAchievement, setNewAchievement] = useState(null);
    const [lastNetWorthMilestone, setLastNetWorthMilestone] = useState(0);
    const [crisisCount, setCrisisCount] = useState(0);
    const [highHappinessMonths, setHighHappinessMonths] = useState(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState(20000);
    const [majorCrisisFlash, setMajorCrisisFlash] = useState(false);
    const [seenTutorials, setSeenTutorials] = useState(new Set());
    const [caSubscribed, setCaSubscribed] = useState(false);
    const [caSubscribedMonth, setCaSubscribedMonth] = useState(null);
    const [itrFiled, setItrFiled] = useState({}); // { [year]: 'ca' | 'self' | 'skip' }

    // Health & Grocery
    const [health, setHealth] = useState(80); // 0–100
    const [pantry, setPantry] = useState([]); // [{ itemId, qty }]
    const [sickLeaveMonths, setSickLeaveMonths] = useState(0); // consecutive months of sick leave

    const stateRef = useRef({});
    useEffect(() => {
        stateRef.current = {
            balance, currentJob, pendingApplications, pendingDecision, pendingJobInterview, currentHousing, properties, portfolio,
            dependents, loans, activeInsurance, creditScore, activeEffects,
            marketPrices, degrees, totalMonthsPlayed, turn, gameOver,
            activeEnrollment, mfPortfolio, mfNavs, sipPlans, ppf, nps,
            marketCycle, priceHistory, fixedDeposits,
            goldHoldings, goldPrice, creditCard, activeCreditCards,
            happiness, isRetired, achievements, firedDecisions,
            crisisCount, highHappinessMonths, monthlyExpenses, lastNetWorthMilestone,
            history, eventInbox, netWorthHistory, lastMonthFlow,
            caSubscribed, caSubscribedMonth, itrFiled,
            health, pantry, sickLeaveMonths,
            generation, childSavings, legacySummary, isLegacyMode,
            playerSprite, playerName, playerBirthday,
            timesMarried,
            playerAge: STARTING_AGE + Math.floor(totalMonthsPlayed / 12),
            netWorth: balance + Object.keys(portfolio).reduce((t, id) => t + (portfolio[id]?.qty || 0) * (marketPrices[id] || 0), 0),
        };
    });

    // =========================================================================
    // PERSISTENCE — AsyncStorage save / load
    // =========================================================================

    const SAVE_KEY = 'finlit_save_v1';

    const saveGame = useCallback(async (extraState = {}) => {
        try {
            const snapshot = {
                balance: stateRef.current.balance,
                turn: stateRef.current.turn,
                totalMonthsPlayed: stateRef.current.totalMonthsPlayed,
                history: stateRef.current.history?.slice(-50) || [],
                currentJob: stateRef.current.currentJob,
                pendingApplications: stateRef.current.pendingApplications,
                pendingDecision: stateRef.current.pendingDecision,
                pendingJobInterview: stateRef.current.pendingJobInterview,
                currentHousingId: stateRef.current.currentHousing?.id || 'hostel',
                playerSprite, playerName, playerBirthday,
                degrees: stateRef.current.degrees,
                portfolio: stateRef.current.portfolio,
                properties: stateRef.current.properties,
                propertyBuyMonths,
                marketPrices: stateRef.current.marketPrices,
                priceHistory: stateRef.current.priceHistory,
                marketCycle: stateRef.current.marketCycle,
                mfNavs: stateRef.current.mfNavs,
                mfPortfolio: stateRef.current.mfPortfolio,
                sipPlans: stateRef.current.sipPlans,
                ppf: stateRef.current.ppf,
                nps: stateRef.current.nps,
                fixedDeposits: stateRef.current.fixedDeposits,
                goldHoldings: stateRef.current.goldHoldings,
                goldPrice: stateRef.current.goldPrice,
                creditCard: stateRef.current.creditCard,
                activeCreditCards: stateRef.current.activeCreditCards,
                dependents: stateRef.current.dependents,
                loans: stateRef.current.loans,
                activeInsurance: stateRef.current.activeInsurance,
                creditScore: stateRef.current.creditScore,
                activeEffects: stateRef.current.activeEffects,
                activeEnrollment: stateRef.current.activeEnrollment,
                eventInbox,
                firedDecisions: stateRef.current.firedDecisions,
                achievements: stateRef.current.achievements,
                lastNetWorthMilestone: stateRef.current.lastNetWorthMilestone,
                crisisCount: stateRef.current.crisisCount,
                highHappinessMonths: stateRef.current.highHappinessMonths,
                netWorthHistory,
                happiness: stateRef.current.happiness,
                monthlyExpenses: stateRef.current.monthlyExpenses,
                isRetired: stateRef.current.isRetired,
                pensionIncome,
                corpusDrawdown,
                bucketListDone,
                lastMonthTax,
                lastMonthEMI,
                caSubscribed,
                caSubscribedMonth,
                itrFiled,
                seenTutorials: [...seenTutorials],
                health: stateRef.current.health,
                pantry: stateRef.current.pantry,
                sickLeaveMonths: stateRef.current.sickLeaveMonths,
                generation: stateRef.current.generation,
                childSavings: stateRef.current.childSavings,
                legacySummary: stateRef.current.legacySummary,
                isLegacyMode: stateRef.current.isLegacyMode,
                timesMarried: stateRef.current.timesMarried,
                ...extraState,
            };
            await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
        } catch (e) {
            console.warn('Save failed:', e);
        }
    }, [playerSprite, playerName, playerBirthday, propertyBuyMonths, eventInbox, netWorthHistory,
        pensionIncome, corpusDrawdown, bucketListDone, lastMonthTax, lastMonthEMI,
        caSubscribed, caSubscribedMonth, itrFiled, seenTutorials]);

    const loadGame = useCallback(async () => {
        try {
            const raw = await AsyncStorage.getItem(SAVE_KEY);
            if (!raw) return false;
            const s = JSON.parse(raw);

            if (s.balance !== undefined) setBalance(s.balance);
            if (s.turn) setTurn(s.turn);
            if (s.totalMonthsPlayed !== undefined) setTotalMonthsPlayed(s.totalMonthsPlayed);
            if (s.history) setHistory(s.history);
            if (s.currentJob !== undefined) setCurrentJob(s.currentJob);
            if (s.pendingApplications !== undefined) setPendingApplications(s.pendingApplications);
            if (s.pendingDecision !== undefined) {
                // Auto-fix: if pendingDecision has a salary but no choices, it was incorrectly saved as a job interview
                if (s.pendingDecision && s.pendingDecision.salary && !s.pendingDecision.choices) {
                    setPendingJobInterview(s.pendingDecision);
                    setPendingDecision(null);
                } else {
                    setPendingDecision(s.pendingDecision);
                }
            }
            if (s.pendingJobInterview !== undefined) setPendingJobInterview(s.pendingJobInterview);
            if (s.isPlaying !== undefined) setIsPlaying(s.isPlaying);
            if (s.playerSprite) setPlayerSprite(s.playerSprite);
            if (s.playerName) setPlayerName(s.playerName);
            if (s.playerBirthday) setPlayerBirthday(s.playerBirthday);
            if (s.degrees) setDegrees(s.degrees);
            if (s.portfolio) setPortfolio(s.portfolio);
            if (s.properties) setProperties(s.properties);
            if (s.propertyBuyMonths) setPropertyBuyMonths(s.propertyBuyMonths);
            if (s.marketPrices) setMarketPrices(s.marketPrices);
            if (s.priceHistory) setPriceHistory(s.priceHistory);
            if (s.marketCycle) setMarketCycle(s.marketCycle);
            if (s.mfNavs) setMfNavs(s.mfNavs);
            if (s.mfPortfolio) setMfPortfolio(s.mfPortfolio);
            if (s.sipPlans) setSipPlans(s.sipPlans);
            if (s.ppf) setPpf(s.ppf);
            if (s.nps) setNps(s.nps);
            if (s.fixedDeposits) setFixedDeposits(s.fixedDeposits);
            if (s.goldHoldings) setGoldHoldings(s.goldHoldings);
            if (s.goldPrice) setGoldPrice(s.goldPrice);
            if (s.creditCard !== undefined) setCreditCard(s.creditCard);
            if (s.activeCreditCards) setActiveCreditCards(s.activeCreditCards);
            if (s.dependents) setDependents(s.dependents);
            if (s.loans) setLoans(s.loans);
            if (s.activeInsurance) setActiveInsurance(s.activeInsurance);
            if (s.creditScore !== undefined) setCreditScore(s.creditScore);
            if (s.activeEffects) setActiveEffects(s.activeEffects);
            if (s.activeEnrollment !== undefined) setActiveEnrollment(s.activeEnrollment);
            if (s.eventInbox) setEventInbox(s.eventInbox);
            if (s.firedDecisions) setFiredDecisions(s.firedDecisions);
            if (s.achievements) setAchievements(s.achievements);
            if (s.lastNetWorthMilestone !== undefined) setLastNetWorthMilestone(s.lastNetWorthMilestone);
            if (s.crisisCount !== undefined) setCrisisCount(s.crisisCount);
            if (s.highHappinessMonths !== undefined) setHighHappinessMonths(s.highHappinessMonths);
            if (s.netWorthHistory) setNetWorthHistory(s.netWorthHistory);
            if (s.happiness !== undefined) setHappiness(s.happiness);
            if (s.monthlyExpenses !== undefined) setMonthlyExpenses(s.monthlyExpenses);
            if (s.isRetired !== undefined) setIsRetired(s.isRetired);
            if (s.pensionIncome !== undefined) setPensionIncome(s.pensionIncome);
            if (s.corpusDrawdown !== undefined) setCorpusDrawdown(s.corpusDrawdown);
            if (s.bucketListDone) setBucketListDone(s.bucketListDone);
            if (s.lastMonthTax !== undefined) setLastMonthTax(s.lastMonthTax);
            if (s.lastMonthEMI !== undefined) setLastMonthEMI(s.lastMonthEMI);
            if (s.caSubscribed !== undefined) setCaSubscribed(s.caSubscribed);
            if (s.caSubscribedMonth !== undefined) setCaSubscribedMonth(s.caSubscribedMonth);
            if (s.itrFiled) setItrFiled(s.itrFiled);
            if (s.seenTutorials) setSeenTutorials(new Set(s.seenTutorials));
            if (s.health !== undefined) setHealth(s.health);
            if (s.pantry) setPantry(s.pantry);
            if (s.sickLeaveMonths !== undefined) setSickLeaveMonths(s.sickLeaveMonths);
            if (s.generation !== undefined) setGeneration(s.generation);
            if (s.childSavings) setChildSavings(s.childSavings);
            if (s.legacySummary) setLegacySummary(s.legacySummary);
            if (s.isLegacyMode !== undefined) setIsLegacyMode(s.isLegacyMode);
            if (s.timesMarried !== undefined) setTimesMarried(s.timesMarried);

            // Reconstruct currentHousing from id (avoids serializing require() image)
            if (s.currentHousingId) {
                if (s.currentHousingId === 'hostel') {
                    setCurrentHousing({ id: 'hostel', name: 'Hostel Shared Room', maintenance: HOSTEL_MAINTENANCE, category: 'rental', life_quality: 2, image: require('../../assets/rooms/hostel.png') });
                } else {
                    const prop = REAL_ESTATE.find(p => p.id === s.currentHousingId);
                    if (prop) setCurrentHousing({ ...prop, maintenance: prop.maintenance || 0 });
                }
            }

            return true;
        } catch (e) {
            console.warn('Load failed:', e);
            return false;
        }
    }, []);

    const deleteSave = useCallback(async () => {
        await AsyncStorage.removeItem(SAVE_KEY);
    }, []);

    // Load on mount
    const [saveLoaded, setSaveLoaded] = useState(false);
    useEffect(() => {
        loadGame().then(() => {
            setTimeout(() => setSaveLoaded(true), 2000);
        });
    }, []);

    // Auto-save whenever totalMonthsPlayed increments (after all state settles)
    useEffect(() => {
        if (!saveLoaded || totalMonthsPlayed === 0) return;
        saveGame();
    }, [totalMonthsPlayed, saveLoaded]);

    // --- DERIVED VALUES ---
    let playerAge = STARTING_AGE + Math.floor(totalMonthsPlayed / 12);
    let _bdayMonth = 1;
    if (playerBirthday && playerBirthday.includes('/')) {
        _bdayMonth = parseInt(playerBirthday.split('/')[1], 10);
    }
    if (totalMonthsPlayed > 0 && _bdayMonth <= turn.month) {
        playerAge += 1;
    }

    const getStockValue = useCallback(() => {
        return Object.keys(portfolio).reduce((total, stockId) => {
            const holding = portfolio[stockId];
            const qty = holding?.qty || 0;
            const price = marketPrices[stockId] || 0;
            return total + (qty * price);
        }, 0);
    }, [portfolio, marketPrices]);

    const getMFValue = useCallback(() => {
        return Object.keys(mfPortfolio).reduce((total, mfId) => {
            const holding = mfPortfolio[mfId];
            const units = holding?.units || 0;
            const nav = mfNavs[mfId] || 0;
            return total + (units * nav);
        }, 0);
    }, [mfPortfolio, mfNavs]);

    const getRealEstateValue = useCallback(() => {
        return properties.reduce((total, id) => {
            const item = REAL_ESTATE.find(p => p.id === id);
            return total + (item ? item.price : 0);
        }, 0);
    }, [properties]);

    const getFDValue = () => fixedDeposits.reduce((s, fd) => s + fd.currentValue, 0);
    const netWorth = balance + getStockValue() + getMFValue() + getRealEstateValue() + ppf.balance + nps.balance + getFDValue();
    const totalLoanOutstanding = loans.reduce((sum, l) => sum + l.remainingPrincipal, 0);

    // --- INITIALIZE MARKET ---
    useEffect(() => {
        const initialPrices = {};
        STOCKS.forEach(stock => { initialPrices[stock.id] = stock.price; });
        setMarketPrices(initialPrices);

        const initialNavs = {};
        MUTUAL_FUNDS.forEach(mf => { initialNavs[mf.id] = mf.nav; });
        setMfNavs(initialNavs);
    }, []);

    // --- GAME LOOP — Remove the auto-play ticker to make the game strictly turn-based (click to advance)
    useEffect(() => {
        // We still need this useEffect to clear the interval if it existed, but we won't set one.
        // The game will only advance when the user clicks "Next Month".
        return () => {};
    }, [isPlaying, gameOver, balance, currentHousing, properties, portfolio,
        currentJob, dependents, loans, activeInsurance, activeEffects, creditScore,
        totalMonthsPlayed, activeEnrollment, mfPortfolio, mfNavs, sipPlans, ppf, nps, marketCycle, isRetired]);

    // =========================================================================
    // CALCULATORS
    // =========================================================================

    const PRESCHOOL_TIER_EXTRA = { home: 0, playschool: 2000, montessori: 8000 };
    const SCHOOL_TIER_EXTRA    = { government: 0, private: 5000, international: 15000 };

    const getDependentCosts = () => {
        let cost = 0;
        for (const dep of dependents) {
            if (dep.type === 'spouse') cost += 5000;
            else if (dep.type === 'child') {
                const childAge = dep.childAgeMonths || 0;
                if (dep.custody === 'ex') {
                    if (childAge < 216) {
                        cost += 10000; // Flat Child Support Alimony
                    }
                } else {
                    if (childAge < 12) {
                        cost += 8000; // infant
                    } else if (childAge < 60) {
                        cost += 8000;
                        cost += PRESCHOOL_TIER_EXTRA[dep.preschoolTier || 'home'] || 0;
                    } else if (childAge < 216) {
                        cost += 12000;
                        cost += SCHOOL_TIER_EXTRA[dep.schoolTier || 'government'] || 0;
                    } else if (childAge < 252) {
                        cost += 25000; // college support
                    }
                }
            } else if (dep.type === 'parent') {
                cost += 15000;
                if (dep.caretaker) cost += 8000;
            }
        }
        return cost;
    };

    const setChildSchoolTier = (depId, tier) => {
        if (!['government', 'private', 'international'].includes(tier)) return;
        setDependents(prev => prev.map(d => d.id === depId ? { ...d, schoolTier: tier } : d));
    };

    const setChildPreschoolTier = (depId, tier) => {
        if (!['home', 'playschool', 'montessori'].includes(tier)) return;
        setDependents(prev => prev.map(d => d.id === depId ? { ...d, preschoolTier: tier } : d));
    };

    const getSpouseIncome = () => {
        const spouse = dependents.find(d => d.type === 'spouse' && d.isWorking);
        if (!spouse) return 0;
        const spouseLoss = activeEffects.find(e => e.type === 'spouse_income_loss');
        if (spouseLoss) return 0;
        return spouse.income || 0;
    };

    const getInsurancePremiums = () => {
        let total = 0;
        for (const ins of activeInsurance) {
            const plan = INSURANCE_PLANS.find(p => p.id === ins.planId);
            if (!plan) continue;
            if (plan.type === 'property') {
                const propValue = getRealEstateValue();
                total += Math.round((propValue * plan.premium_rate) / 12);
            } else {
                total += plan.premium;
            }
        }
        return total;
    };

    const getTotalEMI = () => loans.reduce((sum, l) => sum + l.emi, 0);

    const getMonthlyTax = () => {
        const salary = currentJob ? currentJob.salary : 0;
        let realEstateIncome = 0;
        properties.forEach(id => {
            const prop = REAL_ESTATE.find(p => p.id === id);
            if (prop && prop.rental_income) realEstateIncome += prop.rental_income;
        });
        const spouseIncome = getSpouseIncome();
        const annualIncome = (salary + realEstateIncome + spouseIncome) * 12;

        let deductions = 0;

        const homeLoans = loans.filter(l => l.loanTypeId === 'home_loan');
        if (homeLoans.length > 0) {
            const annualHomeLoanInterest = homeLoans.reduce((sum, l) => sum + (l.remainingPrincipal * l.monthlyRate * 12), 0);
            deductions += Math.min(annualHomeLoanInterest, TAX_DEDUCTIONS.home_loan_interest);
        }

        const eduLoans = loans.filter(l => l.loanTypeId === 'education_loan');
        if (eduLoans.length > 0) {
            const annualEduInterest = eduLoans.reduce((sum, l) => sum + (l.remainingPrincipal * l.monthlyRate * 12), 0);
            deductions += Math.min(annualEduInterest, TAX_DEDUCTIONS.education_loan_interest);
        }

        const lifeIns = activeInsurance.filter(i => {
            const plan = INSURANCE_PLANS.find(p => p.id === i.planId);
            return plan && plan.type === 'life';
        });
        if (lifeIns.length > 0) {
            const annualLifePremium = lifeIns.reduce((sum, ins) => {
                const plan = INSURANCE_PLANS.find(p => p.id === ins.planId);
                return sum + (plan ? plan.premium * 12 : 0);
            }, 0);
            deductions += Math.min(annualLifePremium, TAX_DEDUCTIONS.life_insurance_premium);
        }

        // PPF deduction (Section 80C, max 1.5L/year)
        if (ppf.contributionsThisYear > 0) {
            deductions += Math.min(ppf.contributionsThisYear, 150000);
        }

        // NPS deduction (Section 80CCD, max 50K/year additional)
        if (nps.balance > 0 && nps.contributionsThisYear > 0) {
            deductions += Math.min(nps.contributionsThisYear, 50000);
        }

        // CA subscription: extra ₹25,000 deduction via professional tax planning
        if (caSubscribed) deductions += 25000;

        const taxableIncome = Math.max(0, annualIncome - deductions);
        const annualTax = calculateIncomeTax(taxableIncome);
        return Math.round(annualTax / 12);
    };

    // =========================================================================
    // ACTIONS
    // =========================================================================

    const enrollInCourse = (course) => {
        if (degrees.includes(course.name)) return { success: false, msg: 'Already completed this degree.' };
        if (activeEnrollment) return { success: false, msg: `Already studying ${activeEnrollment.courseName}. Finish first.` };
        const missing = (course.req_degrees || []).filter(d => !degrees.includes(d));
        if (missing.length > 0) return { success: false, msg: `Prerequisites missing: ${missing.join(', ')}` };
        const tuition = course.monthly_tuition || 0;
        if (balance < tuition) return { success: false, msg: `Need ₹${tuition.toLocaleString()} for first month's tuition.` };
        setBalance(prev => prev - tuition);
        setActiveEnrollment({
            courseId: course.id,
            courseName: course.name,
            monthsRemaining: (course.duration || 12) - 1,
            monthlyTuition: tuition,
        });
        addHistory(`Started studying: ${course.name}`, -tuition, 'expense');
        return { success: true, msg: `Enrolled in ${course.name}! ${course.duration} months, ₹${tuition.toLocaleString()}/mo tuition.` };
    };

    const enrollWithLoan = (course) => {
        if (degrees.includes(course.name)) return { success: false, msg: 'Already completed.' };
        if (activeEnrollment) return { success: false, msg: `Already studying ${activeEnrollment.courseName}.` };
        const missing = (course.req_degrees || []).filter(d => !degrees.includes(d));
        if (missing.length > 0) return { success: false, msg: `Prerequisites missing: ${missing.join(', ')}` };
        const totalCost = (course.monthly_tuition || 0) * (course.duration || 12);
        const loanResult = takeLoan('education_loan', totalCost, 120);
        if (!loanResult.success) return loanResult;
        setActiveEnrollment({
            courseId: course.id,
            courseName: course.name,
            monthsRemaining: (course.duration || 12),
            monthlyTuition: 0,
        });
        addHistory(`Started studying: ${course.name} (Education Loan, EMI: ₹${loanResult.emi.toLocaleString()})`, 0, 'info');
        return { success: true, msg: `Enrolled with loan! Duration: ${course.duration} months. EMI: ₹${loanResult.emi.toLocaleString()}/mo` };
    };

    const dropOut = () => {
        if (!activeEnrollment) return { success: false, msg: 'Not studying anything.' };
        const name = activeEnrollment.courseName;
        setActiveEnrollment(null);
        addHistory(`Dropped out of ${name}`, 0, 'info');
        return { success: true, msg: `Dropped out of ${name}. Tuition paid so far is lost.` };
    };

    const tradeStock = (stock, qty, action) => {
        const currentPrice = marketPrices[stock.id] || stock.price;
        const cost = currentPrice * qty;

        if (action === 'BUY') {
            if (balance < cost) return { success: false, msg: 'Insufficient funds.' };
            setBalance(prev => prev - cost);
            setPortfolio(prev => {
                const existing = prev[stock.id] || { qty: 0, avgPrice: 0, buyMonth: totalMonthsPlayed };
                const totalQty = existing.qty + qty;
                const newAvg = ((existing.avgPrice * existing.qty) + (currentPrice * qty)) / totalQty;
                return { ...prev, [stock.id]: { qty: totalQty, avgPrice: newAvg, buyMonth: existing.buyMonth } };
            });
            addHistory(`Bought ${qty} ${stock.ticker} @ ₹${Math.round(currentPrice).toLocaleString()}`, -cost, 'expense');
        } else if (action === 'SELL') {
            const holding = portfolio[stock.id];
            const currentQty = holding?.qty || 0;
            if (currentQty < qty) return { success: false, msg: 'Not enough shares.' };

            const gainMult = trait.stockGainMultiplier || 1;
            const effectivePrice = currentPrice > (holding.avgPrice || 0)
                ? (holding.avgPrice || 0) + (currentPrice - (holding.avgPrice || 0)) * gainMult
                : currentPrice;
            const profit = (effectivePrice - (holding.avgPrice || 0)) * qty;
            let capGainsTax = 0;
            if (profit > 0) {
                const holdingMonths = totalMonthsPlayed - (holding.buyMonth || 0);
                // Crypto (BTC) taxed at flat 30% on gains regardless of holding period
                if (stock.sector === 'Crypto') {
                    capGainsTax = Math.round(profit * 0.30);
                } else if (holdingMonths < 12) {
                    capGainsTax = Math.round(profit * CAPITAL_GAINS.stock_short_term);
                } else {
                    const taxableProfit = Math.max(0, profit - CAPITAL_GAINS.stock_long_term_exempt);
                    capGainsTax = Math.round(taxableProfit * CAPITAL_GAINS.stock_long_term);
                }
            }

            const effectiveSaleValue = effectivePrice * qty;
            const netProceeds = effectiveSaleValue - capGainsTax;
            setBalance(prev => prev + netProceeds);
            setPortfolio(prev => {
                const newQty = currentQty - qty;
                if (newQty <= 0) {
                    const { [stock.id]: _, ...rest } = prev;
                    return rest;
                }
                return { ...prev, [stock.id]: { ...holding, qty: newQty } };
            });
            addHistory(`Sold ${qty} ${stock.ticker}${capGainsTax > 0 ? ` (Tax: ₹${capGainsTax.toLocaleString()})` : ''}`, netProceeds, 'income');
        }
        return { success: true };
    };

    // --- MUTUAL FUND TRADING ---
    const buyMF = (mf, amount) => {
        if (amount < mf.minLumpsum) return { success: false, msg: `Minimum lumpsum: ₹${mf.minLumpsum.toLocaleString()}` };
        if (balance < amount) return { success: false, msg: 'Insufficient funds.' };
        const currentNav = mfNavs[mf.id] || mf.nav;
        const units = amount / currentNav;
        setBalance(prev => prev - amount);
        setMfPortfolio(prev => {
            const existing = prev[mf.id] || { units: 0, avgNav: 0, buyMonth: totalMonthsPlayed };
            const totalUnits = existing.units + units;
            const newAvgNav = ((existing.avgNav * existing.units) + (currentNav * units)) / totalUnits;
            return { ...prev, [mf.id]: { units: totalUnits, avgNav: newAvgNav, buyMonth: existing.buyMonth } };
        });
        addHistory(`Bought ${mf.name} (${units.toFixed(3)} units @ ₹${Math.round(currentNav)})`, -amount, 'expense');
        return { success: true, msg: `Bought ${units.toFixed(3)} units of ${mf.name}` };
    };

    const sellMF = (mf, units) => {
        const holding = mfPortfolio[mf.id];
        if (!holding || holding.units < units) return { success: false, msg: 'Not enough units.' };
        const currentNav = mfNavs[mf.id] || mf.nav;
        const proceeds = units * currentNav;
        const profit = (currentNav - holding.avgNav) * units;
        let capGainsTax = 0;
        if (profit > 0) {
            const holdingMonths = totalMonthsPlayed - (holding.buyMonth || 0);
            if (holdingMonths < 12) {
                capGainsTax = Math.round(profit * CAPITAL_GAINS.stock_short_term);
            } else {
                const taxableProfit = Math.max(0, profit - CAPITAL_GAINS.stock_long_term_exempt);
                capGainsTax = Math.round(taxableProfit * CAPITAL_GAINS.stock_long_term);
            }
        }
        const netProceeds = proceeds - capGainsTax;
        setBalance(prev => prev + netProceeds);
        setMfPortfolio(prev => {
            const newUnits = holding.units - units;
            if (newUnits <= 0.001) {
                const { [mf.id]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [mf.id]: { ...holding, units: newUnits } };
        });
        addHistory(`Sold ${units.toFixed(3)} units of ${mf.name}${capGainsTax > 0 ? ` (Tax: ₹${capGainsTax.toLocaleString()})` : ''}`, netProceeds, 'income');
        return { success: true, msg: `Redeemed ₹${Math.round(netProceeds).toLocaleString()} from ${mf.name}` };
    };

    // --- SIP MANAGEMENT ---
    const addSIP = (type, assetId, amount) => {
        const minAmount = type === 'mf'
            ? (MUTUAL_FUNDS.find(m => m.id === assetId)?.minSIP || 500)
            : 100;
        if (amount < minAmount) return { success: false, msg: `Minimum SIP: ₹${minAmount.toLocaleString()}/month` };
        const existing = sipPlans.find(s => s.assetId === assetId);
        if (existing) return { success: false, msg: 'SIP already active for this asset.' };
        const sipId = `sip_${Date.now()}`;
        setSipPlans(prev => [...prev, { id: sipId, type, assetId, amount, startMonth: totalMonthsPlayed, totalInvested: 0 }]);
        const name = type === 'mf'
            ? MUTUAL_FUNDS.find(m => m.id === assetId)?.name
            : STOCKS.find(s => s.id === assetId)?.name;
        addHistory(`SIP Started: ₹${amount.toLocaleString()}/mo in ${name}`, 0, 'info');
        return { success: true, msg: `SIP of ₹${amount.toLocaleString()}/mo started for ${name}` };
    };

    const cancelSIP = (sipId) => {
        setSipPlans(prev => prev.filter(s => s.id !== sipId));
        return { success: true, msg: 'SIP cancelled.' };
    };

    // --- PPF / NPS ---
    const contributePPF = (amount) => {
        if (amount < 500) return { success: false, msg: 'Minimum PPF contribution: ₹500' };
        if (ppf.contributionsThisYear + amount > PPF_MAX_ANNUAL) {
            return { success: false, msg: `Max PPF per year: ₹1,50,000. Remaining: ₹${(PPF_MAX_ANNUAL - ppf.contributionsThisYear).toLocaleString()}` };
        }
        if (balance < amount) return { success: false, msg: 'Insufficient funds.' };
        setBalance(prev => prev - amount);
        setPpf(prev => ({
            ...prev,
            balance: prev.balance + amount,
            contributionsThisYear: prev.contributionsThisYear + amount,
            totalContributions: prev.totalContributions + amount,
        }));
        addHistory(`PPF Contribution (80C deduction eligible)`, -amount, 'expense');
        return { success: true, msg: `₹${amount.toLocaleString()} added to PPF. Tax deduction under Section 80C.` };
    };

    const contributeNPS = (amount, equityPct = 60) => {
        if (amount < 500) return { success: false, msg: 'Minimum NPS contribution: ₹500' };
        if (balance < amount) return { success: false, msg: 'Insufficient funds.' };
        setBalance(prev => prev - amount);
        setNps(prev => ({
            ...prev,
            balance: prev.balance + amount,
            equityPct,
            contributionsThisYear: (prev.contributionsThisYear || 0) + amount,
        }));
        addHistory(`NPS Contribution (80CCD tax benefit)`, -amount, 'expense');
        return { success: true, msg: `₹${amount.toLocaleString()} added to NPS. Extra ₹50,000 deduction under 80CCD.` };
    };

    // --- FIXED DEPOSITS ---
    const createFD = (optionId, amount, months, rate) => {
        if (balance < amount) return { success: false, msg: 'Insufficient balance.' };
        if (amount < 10000) return { success: false, msg: 'Minimum FD amount is ₹10,000.' };
        const fd = { id: `fd_${Date.now()}`, optionId, principal: amount, currentValue: amount, totalMonths: months, monthsLeft: months, rate, createdAt: totalMonthsPlayed };
        setBalance(prev => prev - amount);
        setFixedDeposits(prev => [...prev, fd]);
        return { success: true, msg: `₹${amount.toLocaleString()} locked for ${months} months at ${(rate * 100).toFixed(1)}% p.a.` };
    };

    const breakFD = (fdId) => {
        const fd = fixedDeposits.find(f => f.id === fdId);
        if (!fd) return { success: false, msg: 'FD not found.' };
        const penalty = fd.monthsLeft > 0 ? 0.01 : 0; // 1% penalty for early break
        const payout = Math.round(fd.currentValue * (1 - penalty));
        setBalance(prev => prev + payout);
        setFixedDeposits(prev => prev.filter(f => f.id !== fdId));
        return { success: true, msg: `₹${payout.toLocaleString()} credited${penalty > 0 ? ' (1% early break penalty applied)' : ' — fully matured!'}` };
    };

    // --- GOLD ---
    const getGoldValue = () => {
        let total = 0;
        Object.entries(goldHoldings).forEach(([assetId, holding]) => {
            if (!holding || holding.grams <= 0) return;
            const asset = GOLD_ASSETS.find(a => a.id === assetId);
            if (!asset) return;
            const purity = asset.purity || 1;
            total += Math.round(holding.grams * goldPrice * purity);
        });
        return total;
    };

    const buyGold = (assetId, grams) => {
        const asset = GOLD_ASSETS.find(a => a.id === assetId);
        if (!asset) return { success: false, msg: 'Invalid gold type.' };
        if (grams < asset.minGrams) return { success: false, msg: `Minimum buy: ${asset.minGrams}g` };
        const purity = asset.purity || 1;
        const basePrice = grams * goldPrice * purity;
        const makingFee = Math.round(basePrice * (asset.makingCharges || 0));
        const totalCost = Math.round(basePrice + makingFee);
        if (balance < totalCost) return { success: false, msg: 'Insufficient funds.' };
        setBalance(prev => prev - totalCost);
        setGoldHoldings(prev => {
            const existing = prev[assetId] || { grams: 0, avgBuyPrice: 0, buyMonth: totalMonthsPlayed, interestAccrued: 0 };
            const totalGrams = existing.grams + grams;
            const newAvg = ((existing.avgBuyPrice * existing.grams) + (totalCost / grams * grams)) / totalGrams;
            return { ...prev, [assetId]: { ...existing, grams: totalGrams, avgBuyPrice: Math.round(newAvg) } };
        });
        const makingNote = makingFee > 0 ? ` (incl. ₹${makingFee.toLocaleString()} making charges)` : '';
        addHistory(`Bought ${grams}g ${asset.name}${makingNote}`, -totalCost, 'expense');
        return { success: true, msg: `${grams}g ${asset.name} purchased for ₹${totalCost.toLocaleString()}${makingNote}` };
    };

    const sellGold = (assetId, grams) => {
        const asset = GOLD_ASSETS.find(a => a.id === assetId);
        const holding = goldHoldings[assetId];
        if (!asset || !holding || holding.grams <= 0) return { success: false, msg: 'No gold holding to sell.' };
        if (grams > holding.grams) return { success: false, msg: `You only have ${holding.grams.toFixed(2)}g.` };
        const purity = asset.purity || 1;
        let salePrice = Math.round(grams * goldPrice * purity);
        // Jewellery: jeweller buyback at 20% discount
        if (asset.type === 'jewellery') salePrice = Math.round(salePrice * 0.80);
        // SGB: can only sell after 5 years (60 months)
        if (asset.type === 'bond' && (totalMonthsPlayed - (holding.buyMonth || 0)) < 60) {
            return { success: false, msg: 'SGBs lock in for 5 years. You can exit from month 60 onwards.' };
        }
        setBalance(prev => prev + salePrice);
        setGoldHoldings(prev => {
            const newGrams = holding.grams - grams;
            if (newGrams <= 0) {
                const { [assetId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [assetId]: { ...holding, grams: newGrams } };
        });
        addHistory(`Sold ${grams}g ${asset.name}`, salePrice, 'income');
        return { success: true, msg: `Sold ${grams}g for ₹${salePrice.toLocaleString()}` };
    };

    // --- CREDIT CARD ---
    const openCreditCard = (type = 'standard') => {
        if (activeCreditCards.includes(type)) return { success: false, msg: 'Already have this card.' };
        
        let additionalLimit = 0;
        
        if (type === 'standard') {
            if (creditScore < 600) return { success: false, msg: `Credit score too low (${creditScore}). Need 600+.` };
            additionalLimit = creditScore >= 750 ? 150000 : creditScore >= 700 ? 100000 : 50000;
        } else if (type === 'premium') {
            if (creditScore < 750) return { success: false, msg: `Credit score too low (${creditScore}). Need 750+.` };
            if (netWorth < 1000000 && (!currentJob || currentJob.salary < 100000)) return { success: false, msg: 'Need ₹10L Net Worth OR ₹1L/mo salary.' };
            if (balance < 5000) return { success: false, msg: 'Need ₹5,000 for annual fee.' };
            setBalance(prev => prev - 5000); // Annual fee deducted upfront
            additionalLimit = 300000;
        } else if (type === 'minor') {
            if (dependents.length === 0) return { success: false, msg: 'You need a child to issue a supplementary card.' };
            additionalLimit = 10000; // Small limit for minor
        }

        setActiveCreditCards(prev => [...prev, type]);
        
        if (!creditCard) {
            setCreditCard({ limit: additionalLimit, balance: 0, dueMonth: totalMonthsPlayed + 1, apr: 0.36, totalSpent: 0 });
        } else {
            setCreditCard(prev => ({ ...prev, limit: prev.limit + additionalLimit }));
        }
        
        addHistory(`${type.toUpperCase()} Credit Card activated`, 0, 'info');
        return { success: true, msg: `${type.toUpperCase()} Credit Card activated! Added ₹${additionalLimit.toLocaleString()} to limit.` };
    };

    const chargeToCard = (amount, label) => {
        if (!creditCard) return { success: false, msg: 'No credit card.' };
        if (creditCard.balance + amount > creditCard.limit) return { success: false, msg: `Over credit limit (₹${creditCard.limit.toLocaleString()}).` };
        setCreditCard(prev => ({ ...prev, balance: prev.balance + amount, totalSpent: prev.totalSpent + amount }));
        addHistory(`[Card] ${label}`, 0, 'info');
        return { success: true };
    };

    const payCreditCardBill = (amount) => {
        if (!creditCard) return { success: false, msg: 'No credit card.' };
        if (balance < amount) return { success: false, msg: 'Insufficient funds.' };
        const payment = Math.min(amount, creditCard.balance);
        setBalance(prev => prev - payment);
        setCreditCard(prev => ({ ...prev, balance: Math.max(0, prev.balance - payment), dueMonth: totalMonthsPlayed + 1 }));
        if (payment > 0) setCreditScore(prev => Math.min(900, prev + 5));
        addHistory(`Credit card payment`, -payment, 'expense');
        return { success: true, msg: `₹${payment.toLocaleString()} paid. ${creditCard.balance - payment > 0 ? `Remaining: ₹${(creditCard.balance - payment).toLocaleString()}` : 'Bill fully cleared!'}` };
    };

    const closeCreditCard = () => {
        if (!creditCard) return { success: false, msg: 'No credit card.' };
        if (creditCard.balance > 0) return { success: false, msg: `Clear your outstanding balance of ₹${creditCard.balance.toLocaleString()} first.` };
        setCreditCard(null);
        return { success: true, msg: 'Credit card closed.' };
    };

    // --- REAL ESTATE ---
    const buyProperty = (property) => {
        if (properties.includes(property.id)) return { success: false, msg: 'Already owned.' };
        if (balance < property.price) return { success: false, msg: 'Insufficient funds.' };
        setBalance(prev => prev - property.price);
        setProperties(prev => [...prev, property.id]);
        setPropertyBuyMonths(prev => ({ ...prev, [property.id]: totalMonthsPlayed }));
        addHistory(`Purchased Property: ${property.name}`, -property.price, 'expense');
        return { success: true, msg: 'Property purchased!' };
    };

    const buyPropertyWithLoan = (property, downPaymentPct = 0.20) => {
        if (properties.includes(property.id)) return { success: false, msg: 'Already owned.' };
        const downPayment = Math.round(property.price * downPaymentPct);
        const loanAmount = property.price - downPayment;
        if (balance < downPayment) return { success: false, msg: `Need ₹${downPayment.toLocaleString()} down payment.` };
        const loanResult = takeLoan('home_loan', loanAmount, 240, property.id);
        if (!loanResult.success) return loanResult;
        setBalance(prev => prev - downPayment);
        setProperties(prev => [...prev, property.id]);
        setPropertyBuyMonths(prev => ({ ...prev, [property.id]: totalMonthsPlayed }));
        addHistory(`Purchased ${property.name} (Down: ₹${downPayment.toLocaleString()}, Loan: ₹${loanAmount.toLocaleString()})`, -downPayment, 'expense');
        return { success: true, msg: `Property purchased! Down: ₹${downPayment.toLocaleString()}, EMI: ₹${loanResult.emi.toLocaleString()}/mo` };
    };

    const sellProperty = (propertyId) => {
        if (!properties.includes(propertyId)) return { success: false, msg: "You don't own this property." };
        if (currentHousing.id === propertyId) return { success: false, msg: 'Move out before selling your home.' };
        const prop = REAL_ESTATE.find(p => p.id === propertyId);
        if (!prop) return { success: false, msg: 'Property not found.' };
        const salePrice = prop.price;
        const linkedLoans = loans.filter(l => l.linkedAsset === propertyId);
        const loanRepayment = linkedLoans.reduce((sum, l) => sum + l.remainingPrincipal, 0);
        const netSale = salePrice - loanRepayment;
        setBalance(prev => prev + netSale);
        setProperties(prev => prev.filter(id => id !== propertyId));
        setPropertyBuyMonths(prev => { const { [propertyId]: _, ...rest } = prev; return rest; });
        if (linkedLoans.length > 0) setLoans(prev => prev.filter(l => l.linkedAsset !== propertyId));
        addHistory(`Sold ${prop.name} (Net: ₹${netSale.toLocaleString()})`, netSale, 'income');
        return { success: true, msg: `Sold for ₹${salePrice.toLocaleString()}${loanRepayment > 0 ? ` (Loan repaid: ₹${loanRepayment.toLocaleString()})` : ''}` };
    };

    const moveIn = (propertyId) => {
        if (!properties.includes(propertyId)) return { success: false, msg: 'You do not own this property.' };
        const property = REAL_ESTATE.find(p => p.id === propertyId);
        if (!property) return { success: false, msg: 'Property not found.' };
        if (property.category !== 'residential') return { success: false, msg: 'You can only live in residential properties.' };
        setCurrentHousing({ ...property, maintenance: property.maintenance || 0 });
        return { success: true, msg: `Moved into ${property.name}!` };
    };

    const rentProperty = (propertyId) => {
        const property = REAL_ESTATE.find(p => p.id === propertyId);
        if (!property) return { success: false, msg: 'Property not found.' };
        if (property.category !== 'residential') return { success: false, msg: 'You can only rent residential properties.' };
        const rentAmount = property.rental_income || property.maintenance || 0;
        setCurrentHousing({ ...property, category: 'rental', maintenance: rentAmount });
        return { success: true, msg: `Rented ${property.name} for ₹${rentAmount.toLocaleString()}/mo!` };
    };

    const markEventRead = (eventId) => {
        setEventInbox(prev => prev.map(e => e.id === eventId ? { ...e, read: true } : e));
    };

    const markAllEventsRead = () => {
        setEventInbox(prev => prev.map(e => ({ ...e, read: true })));
    };

    const buyAndMoveIn = (property, useLoan = false) => {
        if (property.category !== 'residential') return { success: false, msg: 'Can only live in residential properties.' };
        let buyRes;
        if (useLoan) {
            buyRes = buyPropertyWithLoan(property);
        } else {
            buyRes = buyProperty(property);
        }
        if (!buyRes.success) return buyRes;
        setCurrentHousing({ ...property, maintenance: property.maintenance || 0 });
        return { success: true, msg: `Welcome home! ${buyRes.msg}` };
    };

    const checkJobRequirements = (job) => {
        const reqNetWorth = job.req_net_worth || 0;
        const reqDegrees = job.req_degrees || [];
        if (netWorth < reqNetWorth) return { allowed: false, reason: `Net Worth < ₹${reqNetWorth.toLocaleString()}` };
        const missing = reqDegrees.filter(d => !degrees.includes(d));
        if (missing.length > 0) return { allowed: false, reason: `Missing: ${missing.join(', ')}` };
        return { allowed: true };
    };

    const applyForJob = (job) => {
        const check = checkJobRequirements(job);
        if (!check.allowed) return check;

        if (job.type.startsWith('Tier 1')) {
            setCurrentJob(job);
            addHistory(`Started Gig: ${job.name}`, 0, 'info');
            return { allowed: true, msg: 'Hired instantly!' };
        }

        if (pendingApplications.some(a => a.id === job.id)) {
            return { allowed: false, reason: 'Application already pending.' };
        }

        setPendingApplications(prev => [...prev, { ...job, appliedMonth: totalMonthsPlayed }]);
        addHistory(`Applied for: ${job.name}`, 0, 'info');
        return { allowed: true, msg: 'Application submitted! Check back next month.' };
    };

    // ─── JOB INTERVIEW RESOLUTION ────────────────────────────────────────────
    const resolveInterview = useCallback((choice, job) => {
        setPendingJobInterview(null);
        
        let success = false;
        const roll = Math.random();
        success = roll <= choice.successChance;
        
        if (choice.healthModifier !== 0) {
            setHealth(prev => Math.max(0, Math.min(100, prev + choice.healthModifier)));
        }
        if (choice.happinessModifier !== 0) {
            setHappiness(prev => Math.max(0, Math.min(100, prev + choice.happinessModifier)));
        }

        if (success) {
            const finalSalary = Math.round(job.salary * choice.salaryMultiplier);
            const finalJob = { ...job, salary: finalSalary };
            setCurrentJob(finalJob);
            const successEvent = {
                id: `job_acc_${Date.now()}`,
                name: '🎉 Interview Passed!',
                message: `${choice.successMsg}\n\nYou start your new role as ${job.name} making ₹${finalSalary.toLocaleString()}/mo.`,
                category: 'positive',
                impact: 0,
                month: totalMonthsPlayed,
                read: false
            };
            setEventInbox(prev => [successEvent, ...prev].slice(0, 50));
            setLastCrisisEvent(successEvent);
            addHistory(`Hired: ${job.name} at ₹${finalSalary.toLocaleString()}`, 0, 'info');
        } else {
            const failEvent = {
                id: `job_rej_int_${Date.now()}`,
                name: '❌ Interview Failed',
                message: `${choice.failMsg}\n\nYour application for ${job.name} has been rejected. You can try applying again next month.`,
                category: 'negative',
                impact: 0,
                month: totalMonthsPlayed,
                read: false
            };
            setEventInbox(prev => [failEvent, ...prev].slice(0, 50));
            setLastCrisisEvent(failEvent);
            addHistory(`Rejected: ${job.name}`, 0, 'info');
        }
        // Do NOT setIsPlaying(true) here — player manually advances months
    }, [totalMonthsPlayed]);

    // =========================================================================
    // RESET GAME (New Game from Main Menu)
    // =========================================================================
    const resetGame = () => {
        setTotalMonthsPlayed(0);
        setHistory([]);
        setCurrentJob(null);
        setPendingApplications([]);
        setDegrees([]);
        setPortfolio({});
        setProperties([]);
        setPropertyBuyMonths({});
        setCurrentHousing({ id: 'hostel', name: 'Hostel Shared Room', maintenance: HOSTEL_MAINTENANCE, category: 'rental', life_quality: 2, image: require('../../assets/rooms/hostel.png') });
        setDependents([]);
        setExpectingChild(null);
        setTimesMarried(0);
        setLoans([]);
        setActiveInsurance([]);
        setCreditScore(600);
        setActiveEffects([]);
        setActiveEnrollment(null);
        setEventInbox([]);
        setFiredDecisions([]);
        setAchievements([]);
        setCrisisCount(0);
        setHighHappinessMonths(0);
        setNetWorthHistory([]);
        setHappiness(50);
        setMonthlyExpenses(20000);
        setIsRetired(false);
        setPensionIncome(0);
        setCorpusDrawdown(0);
        setBucketListDone([]);
        setLastMonthTax(0);
        setLastMonthEMI(0);
        setCaSubscribed(false);
        setCaSubscribedMonth(null);
        setItrFiled({});
        setHealth(80);
        setPantry([]);
        setSickLeaveMonths(0);
        setMfPortfolio({});
        setSipPlans([]);
        setPpf({ balance: 0, contributionsThisYear: 0, totalContributions: 0 });
        setNps({ balance: 0, equityPct: 60 });
        setFixedDeposits([]);
        setGoldHoldings({});
        setCreditCard(null);
        setActiveCreditCards([]);
        setMarketCycle({ phase: 'sideways', monthsLeft: 12 });
        setBalance(STARTING_BALANCE);
        setPlayerSprite(null);
        setPlayerName('');
        setPlayerBirthday(null);
        setGeneration(1);
        setGameOver(false);
        setIsLegacyMode(false);
        setChildSavings({});
    };

    // =========================================================================
    // LOAN SYSTEM
    // =========================================================================

    const takeLoan = (loanTypeId, amount, tenureMonths, linkedAsset = null) => {
        const loanType = LOAN_TYPES.find(l => l.id === loanTypeId);
        if (!loanType) return { success: false, msg: 'Invalid loan type.' };
        if (creditScore < loanType.min_credit_score)
            return { success: false, msg: `Credit score too low. Need ${loanType.min_credit_score}, you have ${creditScore}.` };
        if (loanType.min_income > 0) {
            const salary = currentJob ? currentJob.salary : 0;
            if (salary < loanType.min_income)
                return { success: false, msg: `Need monthly income >= ₹${loanType.min_income.toLocaleString()}.` };
        }
        if (loanType.min_net_worth && netWorth < loanType.min_net_worth)
            return { success: false, msg: `Need net worth >= ₹${loanType.min_net_worth.toLocaleString()}.` };

        let maxAllowed = loanType.max_amount || Infinity;
        if (loanType.ltv && loanTypeId === 'loan_against_property')
            maxAllowed = Math.round(getRealEstateValue() * loanType.ltv);
        if (amount > maxAllowed)
            return { success: false, msg: `Max loan amount: ₹${maxAllowed.toLocaleString()}.` };

        const adjustedRate = Math.max(1, getAdjustedRate(loanType.base_interest, creditScore) - (trait.loanRateReduction || 0));
        const emi = calculateEMI(amount, adjustedRate, tenureMonths);

        if (loanTypeId === 'home_loan') {
            const salaryIncome = currentJob ? currentJob.salary : 0;
            const rentalIncome = properties.reduce((s, id) => {
                const p = REAL_ESTATE.find(x => x.id === id);
                return s + (p?.rental_income || 0);
            }, 0);
            const totalIncome = salaryIncome + getSpouseIncome() + rentalIncome;
            if (totalIncome > 0 && emi > totalIncome * 0.5)
                return { success: false, msg: `EMI ₹${emi.toLocaleString()}/mo is more than 50% of your income (₹${totalIncome.toLocaleString()}/mo). Reduce loan amount or tenure.` };
        }

        const monthlyRate = adjustedRate / 100 / 12;
        const loanId = `loan_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        setLoans(prev => [...prev, {
            id: loanId, loanTypeId, principal: amount, remainingPrincipal: amount,
            emi, monthlyRate, tenureRemaining: tenureMonths,
            monthsTaken: totalMonthsPlayed, missedPayments: 0, linkedAsset,
        }]);
        if (loanTypeId !== 'home_loan') setBalance(prev => prev + amount);
        addHistory(`Loan Approved: ₹${amount.toLocaleString()} @ ${adjustedRate.toFixed(1)}% (EMI: ₹${emi.toLocaleString()})`, amount, 'info');
        return { success: true, emi, loanId };
    };

    const prepayLoan = (loanId, amount) => {
        const loan = loans.find(l => l.id === loanId);
        if (!loan) return { success: false, msg: 'Loan not found.' };
        if (balance < amount) return { success: false, msg: 'Insufficient funds.' };
        const actualPayment = Math.min(amount, loan.remainingPrincipal);
        setBalance(prev => prev - actualPayment);
        setLoans(prev => prev.map(l => {
            if (l.id !== loanId) return l;
            const newPrincipal = l.remainingPrincipal - actualPayment;
            if (newPrincipal <= 0) return null;
            const newEmi = calculateEMI(newPrincipal, l.monthlyRate * 12 * 100, l.tenureRemaining);
            return { ...l, remainingPrincipal: newPrincipal, emi: newEmi };
        }).filter(Boolean));
        addHistory(`Prepaid ₹${actualPayment.toLocaleString()} on loan`, -actualPayment, 'expense');
        return { success: true, msg: `Prepaid ₹${actualPayment.toLocaleString()}.` };
    };

    // =========================================================================
    // INSURANCE
    // =========================================================================

    const buyInsurance = (planId) => {
        if (activeInsurance.some(i => i.planId === planId)) return { success: false, msg: 'Already have this insurance.' };
        const plan = INSURANCE_PLANS.find(p => p.id === planId);
        if (!plan) return { success: false, msg: 'Invalid plan.' };
        setActiveInsurance(prev => [...prev, { planId, type: plan.type }]);
        addHistory(`Bought Insurance: ${plan.name}`, 0, 'info');
        return { success: true, msg: `${plan.name} activated!` };
    };

    const cancelInsurance = (planId) => {
        setActiveInsurance(prev => prev.filter(i => i.planId !== planId));
        return { success: true, msg: 'Insurance cancelled.' };
    };

    // =========================================================================
    // GROCERY & HEALTH
    // =========================================================================

    const buyGrocery = (itemId, qty = 1) => {
        const item = GROCERY_ITEMS.find(g => g.id === itemId);
        if (!item) return { success: false, msg: 'Item not found.' };
        const totalCost = item.price * qty;
        if (stateRef.current.balance < totalCost) return { success: false, msg: 'Not enough cash.' };
        setBalance(prev => prev - totalCost);
        setPantry(prev => {
            const existing = prev.find(p => p.itemId === itemId);
            if (existing) return prev.map(p => p.itemId === itemId ? { ...p, qty: p.qty + qty } : p);
            return [...prev, { itemId, qty }];
        });
        addHistory(`Bought ${item.name} x${qty}`, -totalCost, 'expense');
        return { success: true, msg: `${item.name} added to pantry!` };
    };

    const consumeFood = (itemId) => {
        const entry = stateRef.current.pantry.find(p => p.itemId === itemId);
        if (!entry || entry.qty < 1) return { success: false, msg: 'Nothing left in pantry.' };
        const item = GROCERY_ITEMS.find(g => g.id === itemId);
        if (!item) return { success: false, msg: 'Unknown item.' };
        setPantry(prev => prev.map(p => p.itemId === itemId ? { ...p, qty: p.qty - 1 } : p).filter(p => p.qty > 0));
        setHealth(prev => Math.min(100, prev + item.healthRestore));
        setHappiness(prev => Math.min(100, prev + (item.happiness || 0)));
        return { success: true, msg: `+${item.healthRestore} health!`, item };
    };

    // =========================================================================
    // DEPENDENTS
    // =========================================================================

    const INDIAN_MALE_NAMES = ['Aarav', 'Vihaan', 'Aditya', 'Rohan', 'Arjun', 'Sai', 'Karan', 'Rahul', 'Vikram', 'Sanjay', 'Amit', 'Anil', 'Raj', 'Suresh', 'Ramesh', 'Harish', 'Nitin', 'Prakash', 'Sunil', 'Vijay'];
    const INDIAN_FEMALE_NAMES = ['Aadya', 'Diya', 'Ananya', 'Priya', 'Kavya', 'Neha', 'Pooja', 'Riya', 'Shruti', 'Sneha', 'Swati', 'Tanvi', 'Vidya', 'Maya', 'Meera', 'Nandini', 'Radha', 'Sita', 'Gita', 'Lata'];

    const marry = (spouseName, spouseSprite) => {
        if (dependents.some(d => d.type === 'spouse')) return { success: false, msg: 'Already married.' };
        const houseCapacity = currentHousing.capacity || 2;
        
        // Only active (cohabiting) dependents count towards house capacity
        const activeDeps = dependents.filter(d => d.custody !== 'ex');
        if (activeDeps.length + 2 > houseCapacity) return { success: false, msg: `Your house is too small! Capacity is ${houseCapacity}. Upgrade your home first.` };
        
        const weddingCost = 500000;
        if (balance < weddingCost) return { success: false, msg: `Need ₹${weddingCost.toLocaleString()} for wedding expenses.` };
        setBalance(prev => prev - weddingCost);
        const isWorking = Math.random() > 0.5;
        const spouseIncome = isWorking ? (20000 + Math.floor(Math.random() * 20000)) : 0;
        
        let finalName = spouseName || 'Spouse';
        if ((spouseSprite && spouseSprite.startsWith('groom')) || spouseName === 'Groom') {
            finalName = INDIAN_MALE_NAMES[Math.floor(Math.random() * INDIAN_MALE_NAMES.length)];
        } else if ((spouseSprite && spouseSprite.startsWith('bride')) || spouseName === 'Bride') {
            finalName = INDIAN_FEMALE_NAMES[Math.floor(Math.random() * INDIAN_FEMALE_NAMES.length)];
        }
        
        let playerBday = null;
        if (playerBirthday && playerBirthday.includes('/')) playerBday = parseInt(playerBirthday.split('/')[1], 10);
        let bMonth = Math.floor(Math.random() * 12) + 1;
        while (bMonth === playerBday) bMonth = Math.floor(Math.random() * 12) + 1;
        
        const newTimesMarried = timesMarried + 1;
        setTimesMarried(newTimesMarried);

        // 20% chance of a stepchild from previous marriage if remarrying (2nd+ spouse)
        const hasStepChild = newTimesMarried > 1 && Math.random() < 0.20;
        let stepChildEntry = null;
        const newSpouseId = `spouse_${Date.now()}`;

        if (hasStepChild) {
            const gender = Math.random() < 0.5 ? 'female' : 'male';
            const ageYr = 4 + Math.floor(Math.random() * 8); // age 4 to 11
            const childName = gender === 'female' 
                ? INDIAN_FEMALE_NAMES[Math.floor(Math.random() * INDIAN_FEMALE_NAMES.length)]
                : INDIAN_MALE_NAMES[Math.floor(Math.random() * INDIAN_MALE_NAMES.length)];
            
            stepChildEntry = {
                id: `dep_child_${Date.now()}_step`,
                type: 'child',
                name: childName,
                gender,
                ageMonths: ageYr * 12,
                childAgeMonths: ageYr * 12,
                health: 100,
                schoolTier: ageYr >= 5 ? 'government' : 'none',
                preschoolTier: ageYr < 5 ? 'home' : 'none',
                hobby: 'none',
                isStepChild: true,
                spouseId: newSpouseId,
                bdayMonth: Math.floor(Math.random() * 12) + 1 === playerBday ? (playerBday % 12) + 1 : Math.floor(Math.random() * 12) + 1,
            };
        }

        setDependents(prev => {
            const next = [...prev, {
                id: newSpouseId, type: 'spouse',
                name: finalName,
                spouseSprite: spouseSprite || 'bride',
                monthAdded: totalMonthsPlayed, isWorking, income: spouseIncome,
                bdayMonth: bMonth, happiness: 70,
                marriageNumber: newTimesMarried,
            }];
            if (stepChildEntry) next.push(stepChildEntry);
            return next;
        });

        addHistory(`Got Married! ${isWorking ? `Spouse earns ₹${spouseIncome.toLocaleString()}/mo` : 'Spouse is homemaker'}`, -weddingCost, 'expense');
        
        let msg = `Congratulations! You got married to ${finalName}! ${isWorking ? `Spouse earns ₹${spouseIncome.toLocaleString()}/mo` : 'Spouse is homemaker'}`;
        if (stepChildEntry) {
            msg += `\n\n👶 STEPCHILD: Welcomed ${stepChildEntry.name} (age ${Math.floor(stepChildEntry.childAgeMonths / 12)}) into your family!`;
        }
        return { success: true, msg };
    };

    const haveChild = () => {
        const spouse = dependents.find(d => d.type === 'spouse');
        if (!spouse) return { success: false, msg: 'Must be married first.' };
        if (expectingChild) return { success: false, msg: 'You are already expecting a child!' };
        const activeChildrenWithCurrentSpouse = dependents.filter(d => d.type === 'child' && d.custody !== 'ex' && d.spouseId === spouse.id).length;
        if (activeChildrenWithCurrentSpouse >= 3) return { success: false, msg: 'Maximum 3 children with your current spouse.' };
        const gender = Math.random() < 0.5 ? 'female' : 'male';
        
        setExpectingChild({ name: '', gender, remaining: 9, spouseId: spouse.id });
        addHistory('Expecting a baby!', 0, 'info');
        return { success: true, msg: `You are expecting a baby! They will arrive in 9 months. Upgrade your housing before then if needed!` };
    };

    const feedDependent = (dependentId, healthAmount) => {
        setDependents(prev => prev.map(d =>
            d.id === dependentId ? { ...d, health: Math.min(100, (d.health ?? 80) + healthAmount) } : d
        ));
    };

    const PARENT_SETUP_COST = 25000;
    const addParent = (parentType) => {
        const houseCapacity = currentHousing.capacity || 2;
        if (dependents.length + 2 > houseCapacity) return { success: false, msg: `Your house is too small! Capacity is ${houseCapacity}. Upgrade your home first.` };
        const existing = dependents.filter(d => d.type === 'parent');
        if (existing.length >= 2) return { success: false, msg: 'Both parents are already living with you.' };
        if (existing.some(d => d.parentType === parentType))
            return { success: false, msg: `${parentType === 'mother' ? 'Mother' : 'Father'} is already with you.` };
        if (balance < PARENT_SETUP_COST)
            return { success: false, msg: `Need ₹${PARENT_SETUP_COST.toLocaleString()} for moving and home setup.` };
        const name = parentType === 'mother' ? 'Mother' : 'Father';
        setBalance(prev => prev - PARENT_SETUP_COST);
        setDependents(prev => [...prev, {
            id: `parent_${Date.now()}`, type: 'parent', parentType,
            name, monthAdded: totalMonthsPlayed, health: 70,
        }]);
        setActiveEffects(prev => prev.filter(e => !e.id.startsWith('parent_allowance_') && !e.id.startsWith('parent_neglect_')));
        addHistory(`${name} moved in — setup costs`, -PARENT_SETUP_COST, 'expense');
        return { success: true, msg: `${name} is now living with you. ₹15,000/mo care cost added.` };
    };

    // =========================================================================
    // TUTORIALS & PROGRESSIVE UNLOCKS
    // =========================================================================

    const markTutorialSeen = (key) => setSeenTutorials(prev => new Set([...prev, key]));

    const resolveFamilyDemand = (accepted) => {
        if (!pendingFamilyDemand) return;
        const { demand, dep } = pendingFamilyDemand;
        if (accepted) {
            if (balance < demand.cost) { setPendingFamilyDemand(null); return; }
            setBalance(prev => prev - demand.cost);
            if (demand.accept.happinessBoost) setHappiness(prev => Math.min(100, prev + demand.accept.happinessBoost));
            if (dep && (demand.accept.depHealthBoost || demand.accept.depHappinessBoost)) {
                setDependents(prev => prev.map(d => d.id === dep.id ? {
                    ...d,
                    health: demand.accept.depHealthBoost ? Math.min(100, (d.health ?? 80) + demand.accept.depHealthBoost) : d.health,
                    happiness: demand.accept.depHappinessBoost ? Math.min(100, (d.happiness ?? 70) + demand.accept.depHappinessBoost) : d.happiness,
                } : d));
            }
            addHistory(demand.getTitle(dep), -demand.cost, 'expense');
        } else {
            if (demand.decline.happinessPenalty) setHappiness(prev => Math.max(0, prev + demand.decline.happinessPenalty));
            if (dep && (demand.decline.depHealthPenalty || demand.decline.depHappinessBoost)) {
                setDependents(prev => prev.map(d => d.id === dep.id ? {
                    ...d,
                    health: demand.decline.depHealthPenalty ? Math.max(0, (d.health ?? 80) + demand.decline.depHealthPenalty) : d.health,
                    happiness: demand.decline.depHappinessBoost ? Math.max(0, (d.happiness ?? 70) + demand.decline.depHappinessBoost) : d.happiness,
                } : d));
            }
        }
        setDemandCooldowns(prev => ({ ...prev, [demand.id]: totalMonthsPlayed }));
        setPendingFamilyDemand(null);
    };

    const GIFT_CHILD_COST = 2000;
    const giftChild = (depId) => {
        if (balance < GIFT_CHILD_COST) return { success: false, msg: `Need ₹${GIFT_CHILD_COST.toLocaleString()} to buy a gift.` };
        setBalance(prev => prev - GIFT_CHILD_COST);
        setDependents(prev => prev.map(d => d.id === depId ? { ...d, health: Math.min(100, (d.health ?? 80) + 5) } : d));
        setHappiness(prev => Math.min(100, prev + 2));
        addHistory('Bought gift for child', -GIFT_CHILD_COST, 'expense');
        return { success: true, msg: 'Child is very happy! Health and your happiness increased.' };
    };

    const transferToChildSavings = (childId, amount) => {
        if (balance < amount) return { success: false, msg: `Insufficient funds.` };
        setBalance(prev => prev - amount);
        setChildSavings(prev => ({
            ...prev,
            [childId]: (prev[childId] || 0) + amount
        }));
        const child = dependents.find(d => d.id === childId);
        addHistory(`Transferred to ${child?.name || 'Child'}'s savings`, -amount, 'investment');
        return { success: true, msg: `Successfully saved ₹${amount.toLocaleString()} for ${child?.name || 'child'}.` };
    };

    const MEDICINE_COST = 5000;
    const buyMedicine = (depId) => {
        if (balance < MEDICINE_COST) return { success: false, msg: `Need ₹${MEDICINE_COST.toLocaleString()} for medicine.` };
        setBalance(prev => prev - MEDICINE_COST);
        setDependents(prev => prev.map(d => d.id === depId ? { ...d, health: Math.min(100, (d.health ?? 70) + 20) } : d));
        addHistory('Medicine for parent', -MEDICINE_COST, 'expense');
        return { success: true, msg: 'Medicine purchased. +20 HP' };
    };

    const CARETAKER_MONTHLY = 8000;
    const toggleCaretaker = (depId) => {
        setDependents(prev => prev.map(d => d.id === depId ? { ...d, caretaker: !d.caretaker } : d));
    };

    const planVacation = () => {
        const familySize = 1 + dependents.length;
        const cost = familySize * 5000;
        if (balance < cost) return { success: false, msg: `Need ₹${cost.toLocaleString()} for the vacation (₹5,000 × ${familySize} people).` };
        setBalance(prev => prev - cost);
        setHappiness(prev => Math.min(100, prev + 15));
        addHistory(`Family vacation (${familySize} people)`, -cost, 'expense');
        return { success: true, msg: `Great memories made! +15 happiness. Cost: ₹${cost.toLocaleString()}` };
    };

    const buyPharmacyItem = (item, recipientId) => {
        if (balance < item.price) return { success: false, msg: 'Not enough balance.' };
        setBalance(prev => prev - item.price);
        if (recipientId === 'self') {
            setHealth(prev => Math.min(100, prev + item.healthRestore));
        } else {
            setDependents(prev => prev.map(d => d.id === recipientId
                ? { ...d, health: Math.min(100, (d.health ?? 80) + item.healthRestore) }
                : d
            ));
        }
        addHistory(`${item.name}`, -item.price, 'expense');
        return { success: true, msg: `+${item.healthRestore} HP!` };
    };

    const buyClothesItem = (item) => {
        if (balance < item.price) return { success: false, msg: 'Not enough balance.' };
        setBalance(prev => prev - item.price);
        if (item.happinessBoost) setHappiness(prev => Math.min(100, prev + item.happinessBoost));
        if (item.for === 'child' && item.healthBoost > 0) {
            const child = dependents.find(d => d.type === 'child');
            if (child) setDependents(prev => prev.map(d => d.id === child.id
                ? { ...d, health: Math.min(100, (d.health ?? 80) + item.healthBoost) }
                : d
            ));
        }
        addHistory(`${item.name}`, -item.price, 'expense');
        return { success: true, msg: `Bought ${item.name}! +${item.happinessBoost} happiness` };
    };

    const renameDependent = (depId, newName) => {
        if (!newName || !newName.trim()) return;
        setDependents(prev => prev.map(d => d.id === depId ? { ...d, name: newName.trim() } : d));
    };

    // ── ITR SELF-FILING WIZARD ────────────────────────────────────────────────
    const [itrSelfFiling, setItrSelfFiling] = useState(null);
    // null = not active
    // { year, step: 'form_select'|'gather_docs'|'compute'|'everify', formSelected, docsCollected[], computation, wrongForm }

    const getRequiredITRDocs = () => {
        const docs = [];
        if (currentJob) {
            docs.push({
                id: 'form16', name: 'Form 16', source: 'HR department / employer email (by June 15)',
                section: 'Salary & TDS — Sec 192',
                desc: 'Part A: TDS deducted and deposited with the government, verified against Form 26AS. Part B: Salary breakup — basic, HRA, LTA, perquisites, employer PF. Every salaried employer must issue Form 16 by June 15. If yours is delayed, demand it — it\'s legally required.',
                icon: 'briefcase',
            });
        }
        docs.push({
            id: 'form26as', name: 'Form 26AS / AIS', source: 'incometax.gov.in → e-File → Income Tax Returns → View Form 26AS',
            section: 'Tax Credit & Annual Information',
            desc: 'The master tax record. Part A: all TDS deducted by employer, banks, demat. Part B: TCS. Part C: advance tax paid. The AIS (Annual Information Statement) is the upgraded version — shows property transactions, dividend, interest, securities purchases, mutual fund redemptions, foreign remittances, GST data. CRITICAL: every figure in your ITR must match AIS/26AS or you\'ll get a notice.',
            icon: 'landmark',
        });
        if (fixedDeposits.length > 0) {
            docs.push({
                id: 'form16a', name: 'Form 16A — Bank TDS Certificate', source: 'Bank net banking → Requests → Form 16A / TDS Certificate',
                section: 'Other Income — Sec 194A',
                desc: 'Banks deduct 10% TDS if your FD interest exceeds ₹40,000/year (₹50,000 for senior citizens). Form 16A proves this TDS. You must declare the FULL FD interest as income — not just the amount after TDS. The TDS is then claimed as credit. Missing this is a common reason for IT notices.',
                icon: 'university',
            });
        }
        const hasStocks = Object.keys(portfolio).some(k => (portfolio[k]?.qty || 0) > 0);
        const hasMFs = Object.keys(mfPortfolio).some(k => (mfPortfolio[k]?.units || 0) > 0);
        if (hasStocks || hasMFs) {
            docs.push({
                id: 'capital_gains', name: 'Capital Gains Statement', source: 'Zerodha: Console → Tax P&L / CAMS/MFCentral for mutual funds',
                section: 'Capital Gains — Sec 111A, 112A',
                desc: 'Equity STCG (held < 12 months): taxed @15% flat under Sec 111A. Equity LTCG (held ≥ 12 months): first ₹1 lakh per year is EXEMPT, above that taxed @10% under Sec 112A — no indexation. Debt MF gains (post Apr 2023): taxed at your slab rate. Brokers and AMCs provide a P&L / gains report; get it for the full financial year (Apr–Mar).',
                icon: 'chart-line',
            });
        }
        const homeLoans = loans.filter(l => l.loanTypeId === 'home_loan');
        if (homeLoans.length > 0) {
            docs.push({
                id: 'home_loan_cert', name: 'Home Loan Interest Certificate', source: 'Bank / housing finance company portal → Loan Account → Interest Certificate',
                section: 'Sec 24(b) & 80C',
                desc: 'Shows interest paid and principal repaid during the financial year. Interest deductible up to ₹2,00,000/year under Sec 24(b) for self-occupied property (UNLIMITED if property is rented out). Principal repaid qualifies under Sec 80C (within the ₹1.5L combined cap). Pre-construction interest: deductible in 5 equal instalments from the year construction completes.',
                icon: 'home',
            });
        }
        if ((ppf.contributionsThisYear || 0) > 0 || (nps.contributionsThisYear || 0) > 0) {
            docs.push({
                id: 'sec80c_proof', name: '80C / 80CCD Investment Proof', source: 'PPF: bank passbook/statement. NPS: CAS statement from nps.nsdl.com or Protean',
                section: 'Sec 80C (max ₹1.5L) + Sec 80CCD(1B) (extra ₹50K for NPS)',
                desc: 'PPF contributions (max ₹1.5L/year) save up to ₹46,800 tax at the 30% bracket under 80C. NPS gets an ADDITIONAL ₹50,000 deduction under Sec 80CCD(1B) — completely separate from the 80C limit. Combined, these two instruments alone can save ₹62,400 in tax per year. Both are also exempt at maturity (EEE and exempt-exempt respectively).',
                icon: 'piggy-bank',
            });
        }
        const lifeIns = activeInsurance.some(i => INSURANCE_PLANS.find(p => p.id === i.planId)?.type === 'life');
        const healthIns = activeInsurance.some(i => INSURANCE_PLANS.find(p => p.id === i.planId)?.type === 'health');
        if (lifeIns || healthIns) {
            docs.push({
                id: 'insurance_receipts', name: 'Insurance Premium Receipts', source: 'Insurer app / LIC branch / email receipts',
                section: 'Sec 80C (life) & Sec 80D (health)',
                desc: 'Life insurance premium: deductible under 80C within the ₹1.5L cap. Term insurance is the most cost-efficient. Health insurance: 80D allows ₹25,000 for self/spouse/children; additional ₹25,000 for parents (₹50,000 if parents are 60+). The health insurance deduction is over and above 80C — completely separate.',
                icon: 'shield-alt',
            });
        }
        if (properties.length > 0) {
            docs.push({
                id: 'property_tax', name: 'Municipal Property Tax Receipt', source: 'Municipal corporation portal / physical receipt from registrar',
                section: 'House Property Income — Sec 22–27',
                desc: 'If property is rented: declare full rental income, then deduct municipal taxes paid + standard 30% deduction (for repairs, maintenance — no bills needed) + home loan interest. Net rental income is added to total income and taxed. If self-occupied with loan: only interest deduction (up to ₹2L) — no standard deduction, no municipal tax deduction.',
                icon: 'city',
            });
        }
        return docs;
    };

    const getITRForms = () => {
        const hasStocks = Object.keys(portfolio).some(k => (portfolio[k]?.qty || 0) > 0);
        const hasMFs = Object.keys(mfPortfolio).some(k => (mfPortfolio[k]?.units || 0) > 0);
        const hasCapGains = hasStocks || hasMFs;
        const multiProperty = properties.length > 1;
        const annualSalary = currentJob ? currentJob.salary * 12 : 0;
        const aboveFiftyLakh = annualSalary > 5000000;
        return [
            {
                id: 'ITR-1', name: 'ITR-1', tag: 'SALARIED',
                forWhom: 'Salary + one house property + interest income. Income below ₹50 lakh.',
                why: 'Sahaj (meaning "simple") is the most common form for salaried Indians. Pre-filled by the IT portal using employer TDS data. Cannot use this if you have capital gains, more than one property, or income above ₹50L.',
                correct: currentJob != null && !hasCapGains && !multiProperty && !aboveFiftyLakh,
                color: '#4ade80',
            },
            {
                id: 'ITR-2', name: 'ITR-2', tag: 'INVESTORS',
                forWhom: 'Salaried + capital gains (stocks, MFs, property) or multiple properties. Any income level.',
                why: 'Required if you have sold any equity shares, mutual funds, or property during the year — even if at a loss. Also needed for foreign income, director in a company, or lottery winnings. More complex than ITR-1 but mandatory for investors.',
                correct: currentJob != null && (hasCapGains || multiProperty || aboveFiftyLakh),
                color: '#60a5fa',
            },
            {
                id: 'ITR-3', name: 'ITR-3', tag: 'BUSINESS',
                forWhom: 'Business or professional income: freelancers, consultants, proprietors, partners in firms.',
                why: 'For those earning from business or profession. Requires maintaining books of accounts. Also covers salary income — if you have both salary and business income, ITR-3 is the one. NOT applicable for salaried employees without any business income.',
                correct: false,
                color: '#fbbf24',
            },
            {
                id: 'ITR-4', name: 'ITR-4', tag: 'PRESUMPTIVE',
                forWhom: 'Small businesses/professionals under presumptive taxation (Sec 44AD/44ADA). Income below ₹50L.',
                why: 'Presumptive taxation lets small businesses declare 8% of turnover (or 50% of gross receipts for professionals) as income without detailed accounts. Simpler but NOT for salaried individuals. Choosing this when you\'re salaried is a common — and expensive — mistake.',
                correct: false,
                color: '#f87171',
            },
        ];
    };

    const startSelfFiling = () => {
        const year = turn?.year || 2024;
        if (itrFiled?.[year]) return;
        // Don't reset if already in progress for the same year
        if (itrSelfFiling && itrSelfFiling.year === year) return;
        setItrSelfFiling({ year, step: 'form_select', formSelected: null, docsCollected: [], computation: null, wrongForm: false });
    };

    const selectITRForm = (formId) => {
        const forms = getITRForms();
        const form = forms.find(f => f.id === formId);
        if (!form) return;
        setItrSelfFiling(prev => ({
            ...prev,
            step: 'gather_docs',
            formSelected: form,
            wrongForm: !form.correct,
        }));
    };

    const collectITRDoc = async (docId) => {
        setItrSelfFiling(prev => ({
            ...prev,
            docsCollected: prev.docsCollected.includes(docId) ? prev.docsCollected : [...prev.docsCollected, docId],
        }));
        return { success: true };
    };

    const computeITRTaxFull = () => {
        const annualSalary = currentJob ? currentJob.salary * 12 : 0;
        const standardDeduction = Math.min(annualSalary, 50000);
        const netSalary = annualSalary - standardDeduction;

        const fdInterestTotal = fixedDeposits.reduce((sum, fd) => {
            const monthsActive = fd.totalMonths - fd.monthsLeft;
            const fraction = Math.min(monthsActive, 12) / 12;
            return sum + Math.round(fd.principal * fd.rate * fraction);
        }, 0);
        const savingsInterest = Math.round(balance * 0.035);
        const savingsInterestTaxable = Math.max(0, savingsInterest - 10000); // 80TTA exempts up to ₹10K

        let rentalIncomeGross = 0;
        properties.forEach(id => {
            const prop = REAL_ESTATE.find(p => p.id === id);
            if (prop?.rental_income) rentalIncomeGross += prop.rental_income * 12;
        });
        const rentalMunicipalDeduction = Math.round(rentalIncomeGross * 0.3);
        const netRentalIncome = rentalIncomeGross - rentalMunicipalDeduction;

        const grossTotalIncome = netSalary + fdInterestTotal + savingsInterestTaxable + netRentalIncome;

        // 80C deductions
        const ppf80C = Math.min(ppf.contributionsThisYear || 0, 150000);
        const lifeInsPremAnnual = activeInsurance.reduce((sum, i) => {
            const plan = INSURANCE_PLANS.find(p => p.id === i.planId);
            return plan?.type === 'life' ? sum + plan.premium * 12 : sum;
        }, 0);
        const homeLoansAll = loans.filter(l => l.loanTypeId === 'home_loan');
        const homeLoanPrincipalAnnual = homeLoansAll.reduce((sum, l) => {
            const principal = Math.max(0, l.emi - l.remainingPrincipal * l.monthlyRate);
            return sum + Math.round(principal * 12);
        }, 0);
        const sec80C = Math.min(ppf80C + lifeInsPremAnnual + homeLoanPrincipalAnnual, 150000);

        const sec80CCD = Math.min(nps.contributionsThisYear || 0, 50000);

        const healthInsPremAnnual = activeInsurance.reduce((sum, i) => {
            const plan = INSURANCE_PLANS.find(p => p.id === i.planId);
            return plan?.type === 'health' ? sum + plan.premium * 12 : sum;
        }, 0);
        const sec80D = Math.min(healthInsPremAnnual, 25000);

        const homeLoanInterestAnnual = homeLoansAll.reduce((sum, l) => {
            return sum + Math.round(l.remainingPrincipal * l.monthlyRate * 12);
        }, 0);
        const sec24b = Math.min(homeLoanInterestAnnual, 200000);

        const totalDeductions = sec80C + sec80CCD + sec80D + sec24b;
        const taxableIncome = Math.max(0, grossTotalIncome - totalDeductions);

        const incomeTax = calculateIncomeTax(taxableIncome);
        const cess = Math.round(incomeTax * 0.04);
        const totalTaxLiability = incomeTax + cess;

        // TDS credits
        const salaryFraction = grossTotalIncome > 0 ? netSalary / grossTotalIncome : 1;
        const estimatedSalaryTDS = Math.round(incomeTax * 0.96 * salaryFraction);
        const bankTDS = fdInterestTotal > 40000 ? Math.round(fdInterestTotal * 0.10) : 0;
        const totalTDS = estimatedSalaryTDS + bankTDS;

        const netPayable = totalTaxLiability - totalTDS;

        const computation = {
            annualSalary, standardDeduction, netSalary,
            fdInterestTotal, savingsInterest, savingsInterestTaxable,
            rentalIncomeGross, rentalMunicipalDeduction, netRentalIncome,
            grossTotalIncome,
            ppf80C, lifeInsPremAnnual, homeLoanPrincipalAnnual, sec80C,
            sec80CCD,
            healthInsPremAnnual, sec80D,
            homeLoanInterestAnnual, sec24b,
            totalDeductions, taxableIncome,
            incomeTax, cess, totalTaxLiability,
            estimatedSalaryTDS, bankTDS, totalTDS,
            netPayable,
        };
        setItrSelfFiling(prev => ({ ...prev, step: 'everify', computation }));
        return computation;
    };

    const ITR_SELF_FILING_FEE = 499; // portal convenience fee (like actual Cleartax/IndiaFilings charge)
    const submitITR = () => {
        if (!itrSelfFiling) return;
        const { year, computation, wrongForm } = itrSelfFiling;

        // Filing fee — even self-filing costs time + portal fee
        if (balance < ITR_SELF_FILING_FEE) {
            return { success: false, msg: `Need ₹${ITR_SELF_FILING_FEE} portal convenience fee to submit.` };
        }
        setBalance(prev => prev - ITR_SELF_FILING_FEE);
        addHistory(`ITR Portal Filing Fee`, -ITR_SELF_FILING_FEE, 'expense');

        // Self-assessment tax if owed
        if (computation?.netPayable > 0) {
            if (balance - ITR_SELF_FILING_FEE < computation.netPayable) {
                return { success: false, msg: `Need ₹${computation.netPayable.toLocaleString()} for self-assessment tax (Challan 280).` };
            }
            setBalance(prev => prev - computation.netPayable);
            addHistory(`Self-Assessment Tax — Challan 280 (FY ${year - 1}-${String(year).slice(2)})`, -computation.netPayable, 'expense');
        } else if (computation?.netPayable < 0) {
            // Refund takes time — delayed 1 month in real life, instant here for simplicity
            const refund = Math.abs(computation.netPayable);
            setBalance(prev => prev + refund);
            addHistory(`ITR Refund — FY ${year - 1}-${String(year).slice(2)} (Sec 244A interest included)`, refund, 'income');
        }

        // Wrong form: higher notice risk + ₹5,000 penalty deducted immediately
        if (wrongForm) {
            const noticePenalty = 5000;
            setBalance(prev => prev - noticePenalty);
            addHistory(`IT Notice — incorrect ITR form filed (Sec 139(9) defective return)`, -noticePenalty, 'expense');
            setHappiness(prev => Math.max(0, prev - 10));
        }

        setItrFiled(prev => ({ ...prev, [year]: wrongForm ? 'self_wrong_form' : 'self' }));
        setItrSelfFiling(null);
        return { success: true, refund: (computation?.netPayable || 0) < 0 ? Math.abs(computation.netPayable) : 0, wrongForm };
    };

    const UPSKILL_COST = 50000;
    const UPSKILL_MONTHS = 6;
    const upskillSpouse = () => {
        const spouse = dependents.find(d => d.type === 'spouse');
        if (!spouse) return { success: false, msg: 'Not married.' };
        if (spouse.isWorking) return { success: false, msg: 'Spouse is already working.' };
        if (spouse.upskilling) return { success: false, msg: 'Spouse is already enrolled in a course.' };
        if (balance < UPSKILL_COST) return { success: false, msg: `Need ₹${UPSKILL_COST.toLocaleString()} for the course.` };
        setBalance(prev => prev - UPSKILL_COST);
        setDependents(prev => prev.map(d =>
            d.type === 'spouse' ? { ...d, upskilling: true, upskillingMonthsLeft: UPSKILL_MONTHS } : d
        ));
        addHistory('Spouse enrolled in upskilling course', -UPSKILL_COST, 'expense');
        return { success: true, msg: `Spouse enrolled! They will start earning in ${UPSKILL_MONTHS} months.` };
    };

    const DIVORCE_PENALTY = 200000;
    const divorce = () => {
        // Find if they have any active children before removing spouse/modifying dependents
        const activeChildren = stateRef.current.dependents?.filter(d => d.type === 'child' && d.custody !== 'ex') || [];
        const hasChildren = activeChildren.length > 0;

        setDependents(prev => prev.filter(d => d.type !== 'spouse'));
        setBalance(prev => Math.max(0, prev - DIVORCE_PENALTY));
        setHappiness(prev => Math.max(0, prev - 30));
        addHistory('Divorce settlement', -DIVORCE_PENALTY, 'expense');

        if (hasChildren) {
            setPendingDecision({
                id: `custody_dilemma_${totalMonthsPlayed}`,
                name: 'Custody Dilemma',
                emoji: '⚖️',
                category: 'dilemma',
                message: 'With the divorce finalized, you must decide who keeps custody of the children. If you let your ex-spouse take custody, you will pay ₹10,000/mo per child in child support.',
                choices: [
                    { label: 'Keep Custody (Full Expenses)', color: '#4ade80', effect: { type: 'custody_keep', msg: 'You kept custody of your children. Full living and education costs apply.' } },
                    { label: 'Ex Takes Custody (₹10k/mo child support)', color: '#f87171', effect: { type: 'custody_ex_spouse', msg: 'Your ex-spouse has taken custody. You will pay ₹10,000/mo per child in support payments.' } }
                ]
            });
            setIsPlaying(false);
        }

        return { success: true };
    };

    const CA_MONTHLY_FEE = 2000;
    const subscribeCA = () => {
        if (caSubscribed) return { success: false, msg: 'Already subscribed.' };
        if (balance < CA_MONTHLY_FEE) return { success: false, msg: `Need ₹${CA_MONTHLY_FEE.toLocaleString()} for first month's retainer.` };
        setBalance(prev => prev - CA_MONTHLY_FEE);
        setCaSubscribed(true);
        setCaSubscribedMonth(totalMonthsPlayed);
        addHistory('CA Subscription started — ₹2,000/mo retainer', -CA_MONTHLY_FEE, 'expense');
        return { success: true, msg: 'CA subscribed! ₹2,000/mo retainer. You get optimised tax deductions + ITR filing.' };
    };
    const cancelCA = () => {
        setCaSubscribed(false);
        setCaSubscribedMonth(null);
        addHistory('CA Subscription cancelled', 0, 'info');
        return { success: true, msg: 'CA subscription cancelled.' };
    };

    // Returns which invest/finance products are unlocked at the current age/net worth.
    // Locked products show a padlock in the UI with the unlock requirement.
    const getProductUnlocks = () => ({
        fd:          { unlocked: true },
        ppf:         { unlocked: true },
        insurance:   { unlocked: true },
        loans:       { unlocked: true },
        mf:          { unlocked: true },
        sip:         { unlocked: true },
        stocks:      { unlocked: true },
        nps:         { unlocked: playerAge >= 20, requirement: 'Age 20+ — NPS is a long-term retirement plan' },
        realestate:  { unlocked: netWorth >= 200000, requirement: 'Need ₹2L net worth to buy property' },
    });

    // =========================================================================
    // CA ADVISOR
    // =========================================================================

    const getCAAdvice = () => {
        const livingCosts = LIVING_COSTS_BASE + getDependentCosts();
        const housingCost = currentHousing.maintenance || 0;
        let investmentMaintenance = 0;
        properties.forEach(id => {
            const prop = REAL_ESTATE.find(p => p.id === id);
            if (prop && prop.id !== currentHousing.id) investmentMaintenance += (prop.maintenance || 0);
        });
        const totalEMI = getTotalEMI();
        const insurancePremiums = getInsurancePremiums();
        const monthlyTax = getMonthlyTax();
        const salary = currentJob ? currentJob.salary : 0;
        let realEstateIncome = 0;
        properties.forEach(id => {
            const prop = REAL_ESTATE.find(p => p.id === id);
            if (prop && prop.rental_income) realEstateIncome += prop.rental_income;
        });
        const spouseIncome = getSpouseIncome();
        const totalIncome = salary + realEstateIncome + spouseIncome;
        const totalExpenses = livingCosts + housingCost + investmentMaintenance + totalEMI + insurancePremiums + monthlyTax;
        const monthlyBurn = totalIncome - totalExpenses;
        const retirementCorpus = ppf.balance + nps.balance;

        if (totalMonthsPlayed > 420) {
            return `Retirement in ${RETIREMENT_MONTH - totalMonthsPlayed} months! PPF+NPS corpus: ₹${retirementCorpus.toLocaleString()}. Focus on clearing loans and building passive income.`;
        }
        if (monthlyBurn < 0) {
            return `DANGER: Losing ₹${Math.abs(monthlyBurn).toLocaleString()}/mo! Income: ₹${totalIncome.toLocaleString()} vs Expenses: ₹${totalExpenses.toLocaleString()}. Cut costs or earn more — fast.`;
        }
        if (totalEMI > totalIncome * 0.5) {
            return `EMI STRESS: Loan payments (₹${totalEMI.toLocaleString()}) are ${Math.round(totalEMI/totalIncome*100)}% of income. Risk of default!`;
        }
        if (dependents.length > 0 && activeInsurance.length === 0) {
            return `You have ${dependents.length} dependents but NO insurance! One hospital bill could wipe your savings.`;
        }
        if (balance < totalExpenses * 3) {
            return `Emergency fund low. Need ₹${(totalExpenses * 3).toLocaleString()} (3 months expenses) in cash. You have ₹${balance.toLocaleString()}.`;
        }
        if (!currentJob) {
            return 'You are unemployed. Go to Careers to start earning. Without income, every month depletes your savings.';
        }
        if (ppf.balance === 0 && nps.balance === 0 && playerAge > 25 && netWorth > 300000) {
            return `No retirement savings yet. Start PPF (7.1% guaranteed, tax-free) or NPS (market-linked). Small contributions today = big corpus at 58.`;
        }
        if (sipPlans.length === 0 && netWorth > 200000 && balance > totalExpenses * 6) {
            return `Start a monthly SIP. Even ₹2,000/mo in a Nifty Index Fund for 30 years compounds to ~₹70 lakhs. Time in market beats timing the market.`;
        }
        if (marketCycle.phase === 'bear' && Object.keys(portfolio).length > 0) {
            return `Bear market detected. This is actually the best time to BUY more — you get shares cheaper. Don't panic sell. Stay invested.`;
        }
        if (marketCycle.phase === 'bull' && Object.keys(portfolio).length > 0) {
            return `Bull market running. Great time to review if your portfolio is too concentrated. Consider booking some profits if one stock is >40% of portfolio.`;
        }
        if (monthlyTax > 20000 && ppf.contributionsThisYear < 100000) {
            return `Tax Alert: Paying ₹${monthlyTax.toLocaleString()}/mo tax. Contribute to PPF (Section 80C) and NPS (80CCD) to reduce taxable income by up to ₹2L/year.`;
        }
        if (currentHousing.category === 'rental' && balance > 500000) {
            return 'Stop paying rent. Take a Home Loan with 20% down payment — you build equity instead of paying a landlord.';
        }
        const stockCount = Object.keys(portfolio).filter(k => (portfolio[k]?.qty || 0) > 0).length;
        if (stockCount === 1 && netWorth > 1000000) {
            return 'High Concentration Risk: All stock eggs in one basket. Diversify into at least 3-4 different sectors.';
        }
        if (creditScore < 650) {
            return `Credit Score ${creditScore} is poor. Pay all EMIs on time — every on-time payment adds +2 points. Low score = higher loan interest rates.`;
        }
        return `Finances healthy. Net Worth: ₹${netWorth.toLocaleString()}, Age ${playerAge}. Monthly surplus: ₹${monthlyBurn.toLocaleString()}. Keep investing systematically.`;
    };

    // =========================================================================
    // CRISIS ENGINE
    // =========================================================================

    const getEligibleCrisisEvents = (state) => CRISIS_EVENTS.filter(e => {
        if (totalMonthsPlayed < 12 && e.severity === 'major') return false;
        if (e.minMonthsPlayed && totalMonthsPlayed < e.minMonthsPlayed) return false;
        if (typeof e.condition === 'function') return e.condition(state);
        return true;
    });

    const getCrisisEventWeight = (event) => {
        const baseWeight = (CRISIS_WEIGHTS[event.category] || 10) * (event.relevanceWeight || 1);
        return trait.positiveEventBoost && event.category === 'positive'
            ? Math.max(0, baseWeight * 2)
            : Math.max(0, baseWeight);
    };

    const chooseWeightedCrisisEvent = (events) => {
        const totalWeight = events.reduce((sum, event) => sum + getCrisisEventWeight(event), 0);
        if (totalWeight <= 0) return null;
        let roll = Math.random() * totalWeight;
        for (const event of events) {
            roll -= getCrisisEventWeight(event);
            if (roll <= 0) return event;
        }
        return events[events.length - 1];
    };

    const runCrisisEngine = () => {
        // No crises in first 3 months — player is still finding their feet
        if (totalMonthsPlayed < 3) return null;
        const crisisThreshold = 0.08 * (1 - (trait.crisisChanceReduction || 0));
        if (Math.random() > crisisThreshold) return null;
        const state = { balance, currentJob, currentHousing, properties, portfolio, dependents, playerAge, netWorth, loans, activeInsurance, monthlyExpenses, totalMonthsPlayed };
        const eligible = getEligibleCrisisEvents(state);
        if (eligible.length === 0) return null;
        const selected = chooseWeightedCrisisEvent(eligible);
        return selected ? applyCrisisEvent(selected) : null;
    };

    // =========================================================================
    // LIFE DECISIONS
    // =========================================================================
    const triggerLifeDecision = () => {
        if (pendingDecision) return; // one at a time
        const state = stateRef.current;
        const eligible = LIFE_DECISIONS.filter(d =>
            d.condition(state) &&
            !state.firedDecisions?.includes(d.id) // don't repeat
        );
        if (eligible.length === 0) return;
        const decision = eligible[Math.floor(Math.random() * eligible.length)];
        setPendingDecision(decision);
        setFiredDecisions(prev => [...prev, decision.id]);
    };

    const resolveDecision = (choice) => {
        const eff = choice.effect;
        if (!eff || eff.type === 'none') {
            if (eff?.happiness) setHappiness(prev => Math.max(0, Math.min(100, prev + eff.happiness)));
            if (pendingDecisionQueue && pendingDecisionQueue.length > 0) {
                setPendingDecision(pendingDecisionQueue[0]);
                setPendingDecisionQueue(pendingDecisionQueue.slice(1));
            } else {
                setPendingDecision(null);
            }
            return { msg: "You passed on this one." };
        }
        let msg = eff.msg || '';
        if (eff.type === 'cash_spend') {
            if (eff.amount < 0) {
                // Negative spend = refund/bonus
                setBalance(prev => prev + Math.abs(eff.amount));
            } else if (balance >= eff.amount) {
                setBalance(prev => prev - eff.amount);
            } else { msg = "Not enough balance."; }
            if (eff.happiness) setHappiness(prev => Math.max(0, Math.min(100, prev + eff.happiness)));
        } else if (eff.type === 'birthday_celebration') {
            if (balance >= eff.amount) {
                setBalance(prev => prev - eff.amount);
                if (eff.happiness) setHappiness(prev => Math.max(0, Math.min(100, prev + eff.happiness)));
                if (eff.dependentId) {
                    setDependents(prev => prev.map(d => {
                        if (d.id === eff.dependentId) {
                            const newD = { ...d, lastCelebratedYear: (d.lastCelebratedYear || (turn.year - 1)) + 1 };
                            if (eff.happiness && d.type === 'spouse') {
                                newD.happiness = Math.max(0, Math.min(100, (d.happiness || 70) + (eff.happiness / 2)));
                            }
                            return newD;
                        }
                        return d;
                    }));
                }
                if (eff.health) setHealth(prev => Math.max(0, Math.min(100, prev + eff.health)));
                if (eff.creditScore) setCreditScore(prev => Math.min(900, prev + eff.creditScore));
                
                // Networking salary boost
                if (eff.salaryBonusPct && currentJob) {
                    setCurrentJob(prev => ({ ...prev, salary: Math.round(prev.salary * (1 + eff.salaryBonusPct)) }));
                }
                // Spouse income boost
                if (eff.spouseIncomeBoost && dependents.some(d => d.type === 'spouse' && d.isWorking)) {
                    setDependents(prev => prev.map(d => 
                        (d.type === 'spouse' && d.isWorking) ? { ...d, income: Math.round(d.income * (1 + eff.spouseIncomeBoost)) } : d
                    ));
                }
                // Child savings boost
                if (eff.childSavingsBoost && eff.dependentId) {
                    setChildSavings(prev => ({
                        ...prev, [eff.dependentId]: (prev[eff.dependentId] || 0) + eff.childSavingsBoost
                    }));
                }
                // Remember what party was picked for the Celebration Room
                setLastCelebrationChoice({
                    label: choice.label,
                    who: pendingDecision?.name?.includes('Birthday,') ? pendingDecision.name.replace('Happy Birthday, ', '').replace('!', '') : 'player',
                });
                
                const msgEntry = {
                    id: `bday_${Date.now()}`,
                    name: eff.choiceLabel || 'Birthday Celebration',
                    message: eff.msg || 'You celebrated a birthday.',
                    category: eff.amount > 0 ? 'expense' : 'neutral',
                    impact: -eff.amount,
                    month: totalMonthsPlayed,
                    who: pendingDecision?.name?.includes('Birthday,') ? pendingDecision.name.replace('Happy Birthday, ', '').replace('!', '') : 'player',
                    read: false,
                };
                setEventInbox(prev => [msgEntry, ...prev].slice(0, 50));
            } else {
                msg = "Not enough balance to throw this party.";
            }
        } else if (eff.type === 'ppf_boost') {
            // Boost all stock prices by pct
            setMarketPrices(prev => {
                const next = { ...prev };
                STOCKS.forEach(s => { next[s.id] = (prev[s.id] || s.price) * (1 + (eff.pct || 0.1)); });
                return next;
            });
        } else if (eff.type === 'market_dip_buy') {
            const amount = Math.min(eff.amount || 50000, balance);
            if (amount > 0) {
                setBalance(prev => prev - amount);
                // Invest in first available stock
                const stock = STOCKS[0];
                const price = stateRef.current.marketPrices?.[stock.id] || stock.price;
                const qty = Math.floor(amount / price);
                if (qty > 0) {
                    setPortfolio(prev => {
                        const existing = prev[stock.id] || { qty: 0, avgPrice: 0, buyMonth: stateRef.current.totalMonthsPlayed };
                        const totalQty = existing.qty + qty;
                        const newAvg = ((existing.avgPrice * existing.qty) + (price * qty)) / totalQty;
                        return { ...prev, [stock.id]: { qty: totalQty, avgPrice: newAvg, buyMonth: existing.buyMonth } };
                    });
                }
            }
        } else if (eff.type === 'sell_all_stocks') {
            // Sell pct of all stock holdings
            const sellPct = eff.pct || 0.5;
            let proceeds = 0;
            setPortfolio(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(id => {
                    const holding = next[id];
                    if (!holding || holding.qty <= 0) return;
                    const sellQty = Math.floor(holding.qty * sellPct);
                    if (sellQty > 0) {
                        const price = stateRef.current.marketPrices?.[id] || 0;
                        proceeds += sellQty * price;
                        const newQty = holding.qty - sellQty;
                        if (newQty <= 0) { delete next[id]; } else { next[id] = { ...holding, qty: newQty }; }
                    }
                });
                return next;
            });
            if (proceeds > 0) setBalance(prev => prev + Math.round(proceeds * 0.875)); // ~12.5% LTCG
        } else if (eff.type === 'gamble' || eff.type === 'equity_bet') {
            if (balance >= eff.amount) {
                setBalance(prev => prev - eff.amount);
                // Schedule payoff
                const success = Math.random() < eff.chance;
                setTimeout(() => {
                    if (success) {
                        const gain = Math.round(eff.amount * eff.successMult);
                        setBalance(prev => prev + gain);
                        const entry = { id: `decision_win_${Date.now()}`, name: 'Decision Paid Off', message: eff.successMsg, category: 'positive', impact: gain - eff.amount, month: stateRef.current.totalMonthsPlayed, read: false };
                        setEventInbox(prev => [entry, ...prev].slice(0, 50));
                        setLastCrisisEvent(entry);
                    } else {
                        const entry = { id: `decision_fail_${Date.now()}`, name: 'Decision Failed', message: eff.failMsg, category: 'crisis', impact: -eff.amount, month: stateRef.current.totalMonthsPlayed, read: false };
                        setEventInbox(prev => [entry, ...prev].slice(0, 50));
                        setLastCrisisEvent(entry);
                    }
                }, (eff.months || 12) * 1000); // simulate time passing (1s per month)
            } else { msg = "Not enough balance."; }
        } else if (eff.type === 'cash_spend' && eff.recurring) {
            if (eff.amount < 0) {
                setBalance(prev => prev + Math.abs(eff.amount));
            } else if (balance >= eff.amount) {
                setBalance(prev => prev - eff.amount);
                if (eff.months && eff.months > 1) {
                    setActiveEffects(prev => [...prev, {
                        id: `recurring_${Date.now()}`,
                        type: 'recurring_expense',
                        remainingMonths: eff.months - 1,
                        monthlyAmount: eff.amount,
                        description: eff.msg || 'Recurring expense',
                    }] );
                }
            } else {
                msg = 'Not enough balance.';
            }
            if (eff.happiness) setHappiness(prev => Math.max(0, Math.min(100, prev + eff.happiness)));
        } else if (eff.type === 'cash_spend') {
            if (eff.amount < 0) {
                // Negative spend = refund/bonus
                setBalance(prev => prev + Math.abs(eff.amount));
            } else if (balance >= eff.amount) {
                setBalance(prev => prev - eff.amount);
            } else { msg = 'Not enough balance.'; }
            if (eff.happiness) setHappiness(prev => Math.max(0, Math.min(100, prev + eff.happiness)));
        } else if (eff.type === 'freelance_win') {
            const contractMonths = eff.months || 3;
            const payout = eff.income || 0;
            const contractId = `freelance_${Date.now()}`;
            setCurrentJob({ id: contractId, name: 'Freelance Contractor', salary: 0, isFreelance: true, contractMonthsRemaining: contractMonths, contractPayout: payout });
            setActiveEffects(prev => [...prev, {
                id: contractId,
                type: 'freelance_contract',
                remainingMonths: contractMonths,
                initialMonths: contractMonths,
                totalPayout: payout,
                risk: eff.risk ?? 0.25,
                riskChecked: false,
            }] );
            const entry = { id: contractId, name: 'Freelance Contract', message: msg || eff.msg || 'You left your job to freelance. The first month is risky.', category: 'positive', impact: 0, month: stateRef.current.totalMonthsPlayed, read: false };
            setEventInbox(prev => [entry, ...prev].slice(0, 50));
            setLastCrisisEvent(entry);
            if (eff.happiness) setHappiness(prev => Math.max(0, Math.min(100, prev + eff.happiness)));
        } else if (eff.type === 'passive_income') {
            const entry = { id: `passive_income_${Date.now()}`, name: 'Side Hustle Started', message: eff.msg || 'Your passive income project is off to a slow start.', category: 'positive', impact: 0, month: stateRef.current.totalMonthsPlayed, read: false };
            setActiveEffects(prev => [...prev, {
                id: entry.id,
                type: 'passive_income_project',
                remainingMonths: eff.growMonths || 18,
                chance: eff.chance ?? 0.5,
                maxAmount: eff.maxAmount || 80000,
                msg: eff.msg,
            }] );
            setEventInbox(prev => [entry, ...prev].slice(0, 50));
            setLastCrisisEvent(entry);
            if (eff.happiness) setHappiness(prev => Math.max(0, Math.min(100, prev + eff.happiness)));
        } else if (eff.type === 'add_parents') {
            if (!dependents.some(d => d.type === 'parent')) {
                setDependents(prev => [...prev, { id: `parent_${Date.now()}`, type: 'parent', name: 'Aging Parent', monthAdded: totalMonthsPlayed, health: 70 }]);
            } else {
                msg = 'Your parent is already living with you.';
            }
        } else if (eff.type === 'custody_keep') {
            setDependents(prev => prev.map(d => d.type === 'child' && d.custody === undefined ? { ...d, custody: 'player' } : d));
            setHappiness(prev => Math.min(100, prev + 15));
            msg = eff.msg || 'You kept custody of your children.';
        } else if (eff.type === 'custody_ex_spouse') {
            setDependents(prev => prev.map(d => d.type === 'child' && d.custody === undefined ? { ...d, custody: 'ex' } : d));
            setHappiness(prev => Math.max(0, prev - 20));
            msg = eff.msg || 'Your ex-spouse took custody. You will pay child support.';
        } else if (eff.type === 'parent_move_in') {
            setDependents(prev => [...prev, { id: `parent_${Date.now()}`, type: 'parent', parentType: 'elderly', name: 'Elderly Parent', monthAdded: totalMonthsPlayed, health: 70 }]);
            msg = 'Your parent has moved in with you. They appreciate your support.';
        } else if (eff.type === 'parent_support_allowance') {
            if (balance >= 10000) setBalance(prev => prev - 10000);
            setActiveEffects(prev => [...prev, {
                id: `parent_allowance_${Date.now()}`,
                type: 'recurring_expense',
                remainingMonths: 240, // 20 years
                monthlyAmount: 10000,
                description: 'Parent Support Allowance'
            }]);
            msg = 'You agreed to send ₹10,000/mo to support your parent.';
        } else if (eff.type === 'parent_decline') {
            setActiveEffects(prev => [...prev, {
                id: `parent_neglect_${Date.now()}`,
                type: 'parent_neglect',
                remainingMonths: 120 // Guilt lasts for 10 years
            }]);
            msg = 'You declined to help. You feel a heavy guilt weighing on you.';
            setHappiness(prev => Math.max(0, prev - 15));
        } else if (eff.type === 'salary_boost') {
            const oldSalary = currentJob ? currentJob.salary : 0;
            if (currentJob) {
                setCurrentJob(prev => prev ? { ...prev, salary: Math.round(prev.salary * (1 + (eff.pct || 0))) } : prev);
            }
            if (eff.costBoost) {
                setActiveEffects(prev => [...prev, {
                    id: `salary_boost_${Date.now()}`,
                    type: 'living_cost_increase',
                    remainingMonths: eff.duration || 12,
                    pct: eff.costBoost,
                }] );
            }
            const impact = oldSalary ? Math.round(oldSalary * (eff.pct || 0) * 12) : 0;
            const entry = { id: `decision_${Date.now()}`, name: 'Relocation Decision', message: eff.msg, category: 'positive', impact, month: stateRef.current.totalMonthsPlayed, read: false };
            setEventInbox(prev => [entry, ...prev].slice(0, 50));
            if (eff.happiness) setHappiness(prev => Math.max(0, Math.min(100, prev + eff.happiness)));
        } else if (eff.type === 'lend') {
            if (balance >= eff.amount) {
                setBalance(prev => prev - eff.amount);
                setTimeout(() => {
                    const returned = Math.random() < eff.returnChance;
                    if (returned) {
                        setBalance(prev => prev + eff.amount);
                        const e = { id: `lend_${Date.now()}`, name: 'Friend Repaid', message: eff.returnMsg, category: 'positive', impact: eff.amount, month: stateRef.current.totalMonthsPlayed, read: false };
                        setEventInbox(prev => [e, ...prev].slice(0, 50));
                        setLastCrisisEvent(e);
                    } else {
                        const e = { id: `lend_fail_${Date.now()}`, name: 'Money Not Returned', message: eff.noReturnMsg, category: 'crisis', impact: -eff.amount, month: stateRef.current.totalMonthsPlayed, read: false };
                        setEventInbox(prev => [e, ...prev].slice(0, 50));
                        setLastCrisisEvent(e);
                    }
                }, (eff.months || 6) * 2000);
            }
        } else if (eff.type === 'emi_purchase') {
            const emi = Math.round(eff.amount / eff.months);
            const newLoan = { id: `loan_decision_${Date.now()}`, type: 'Personal Loan', remainingPrincipal: eff.amount, totalPrincipal: eff.amount, emi, monthlyRate: 0, monthsLeft: eff.months, tenureRemaining: eff.months };
            setLoans(prev => [...prev, newLoan]);
            if (eff.happiness) setHappiness(prev => Math.max(0, Math.min(100, prev + eff.happiness)));
        } else if (eff.type === 'itr_ca') {
            // Filed via subscribed CA — tax savings already baked into getMonthlyTax
            const year = stateRef.current.turn?.year || 0;
            setItrFiled(prev => ({ ...prev, [year]: 'ca' }));
            msg = 'ITR filed! Your CA optimised your deductions.';
        } else if (eff.type === 'itr_ca_onetime') {
            // Hired CA one-time for ₹3,000
            const year = stateRef.current.turn?.year || 0;
            if (balance >= 3000) {
                setBalance(prev => prev - 3000);
                setItrFiled(prev => ({ ...prev, [year]: 'ca' }));
                msg = 'CA hired for ₹3,000. ITR filed with optimised deductions.';
            } else { msg = 'Not enough balance to hire a CA.'; }
        } else if (eff.type === 'itr_self') {
            startSelfFiling();
            msg = 'Opening ITR filing wizard. Go to Bank → CA tab to complete your filing.';
        } else if (eff.type === 'itr_skip') {
            const year = stateRef.current.turn?.year || 0;
            if (balance >= 5000) setBalance(prev => prev - 5000);
            setItrFiled(prev => ({ ...prev, [year]: 'skip' }));
            msg = 'Late filing penalty: ₹5,000 deducted.';
        }
        if (eff.happiness && eff.type !== 'cash_spend' && eff.type !== 'emi_purchase' && eff.type !== 'birthday_celebration') {
            setHappiness(prev => Math.max(0, Math.min(100, prev + eff.happiness)));
        }
        
        if (pendingDecisionQueue && pendingDecisionQueue.length > 0) {
            setPendingDecision(pendingDecisionQueue[0]);
            setPendingDecisionQueue(pendingDecisionQueue.slice(1));
        } else {
            setPendingDecision(null);
        }
        
        return { msg };
    };

    // =========================================================================
    // ACHIEVEMENTS
    // =========================================================================
    const checkAchievements = (state) => {
        ACHIEVEMENTS.forEach(ach => {
            if (!state.achievements?.includes(ach.id) && ach.check(state)) {
                setAchievements(prev => {
                    if (prev.includes(ach.id)) return prev;
                    setNewAchievement(ach);
                    return [...prev, ach.id];
                });
            }
        });
        // Net worth milestones
        NET_WORTH_MILESTONES.forEach(m => {
            if (state.netWorth >= m.value && state.lastNetWorthMilestone < m.value) {
                setLastNetWorthMilestone(m.value);
                setNewAchievement({ ...m, isMilestone: true, name: `${m.label} Net Worth!` });
            }
        });
    };

    const applyCrisisEvent = (event) => {
        let financialImpact = 0;
        const state = { balance, currentJob, currentHousing, properties, portfolio, dependents, playerAge, netWorth, loans, activeInsurance, activeEffects };
        let message = event.getMessage ? event.getMessage(state) : (event.message || event.name);

        const hasHealthInsurance = activeInsurance.some(i => {
            const p = INSURANCE_PLANS.find(pl => pl.id === i.planId);
            return p && p.type === 'health';
        });
        const hasPropertyInsurance = activeInsurance.some(i => {
            const p = INSURANCE_PLANS.find(pl => pl.id === i.planId);
            return p && p.type === 'property';
        });

        let mitigationRate = 0;
        if (event.mitigated_by === 'health' && hasHealthInsurance) {
            const bestHealth = activeInsurance.reduce((best, ins) => {
                const p = INSURANCE_PLANS.find(pl => pl.id === ins.planId);
                if (p && p.type === 'health' && p.coverage > best) return p.coverage;
                return best;
            }, 0);
            mitigationRate = bestHealth;
        } else if (event.mitigated_by === 'property' && hasPropertyInsurance) {
            mitigationRate = 0.8;
        }

        if (event.category === 'positive') {
            if (event.effect === 'bonus' && currentJob) {
                financialImpact = currentJob.salary;
                setBalance(prev => prev + financialImpact);
            } else if (event.effect === 'dividend') {
                financialImpact = Math.round(getStockValue() * (event.dividend_pct || 0.03));
                setBalance(prev => prev + financialImpact);
            } else if (event.effect === 'property_value_up') {
                // Appreciate owned properties: pay out 8% of their total purchase value as realised gain
                const propGain = properties.reduce((sum, pid) => {
                    const p = REAL_ESTATE.find(x => x.id === pid);
                    return sum + (p ? Math.round(p.price * 0.08) : 0);
                }, 0);
                if (propGain > 0) {
                    financialImpact = propGain;
                    setBalance(prev => prev + propGain);
                    message += ` Your properties appreciated — gain: ₹${propGain.toLocaleString()}.`;
                } else {
                    message += ' No owned properties to appreciate yet.';
                }
            } else if (event.amount_min !== undefined) {
                financialImpact = event.amount_min + Math.floor(Math.random() * (event.amount_max - event.amount_min));
                setBalance(prev => prev + financialImpact);
            }
        } else {
            // Emergency fund reduces crisis cost by 50% if balance covers 6 months of expenses
            const emergencyFundActive = balance >= (monthlyExpenses || 20000) * 6;
            const emergencyReduction = emergencyFundActive ? 0.5 : 0;

            if (event.category === 'crisis' || event.severity === 'major') {
                setCrisisCount(prev => prev + 1);
                setMajorCrisisFlash(true);
                setTimeout(() => setMajorCrisisFlash(false), 1200);
            }

            if (event.cost) {
                const rawCost = event.cost;
                const effectiveMitigation = Math.min(1, mitigationRate + emergencyReduction);
                financialImpact = -Math.round(rawCost * (1 - effectiveMitigation));
                setBalance(prev => prev + financialImpact);
            } else if (event.cost_pct) {
                if (properties.length > 0) {
                    const randomPropId = properties[Math.floor(Math.random() * properties.length)];
                    const prop = REAL_ESTATE.find(p => p.id === randomPropId);
                    if (prop) {
                        const rawCost = Math.round(prop.price * event.cost_pct);
                        const effectiveMitigation = Math.min(1, mitigationRate + emergencyReduction);
                        financialImpact = -Math.round(rawCost * (1 - effectiveMitigation));
                        setBalance(prev => prev + financialImpact);
                    }
                }
            } else if (event.cost_pct_balance) {
                const effectiveMitigation = Math.min(1, emergencyReduction);
                financialImpact = -Math.round(balance * event.cost_pct_balance * (1 - emergencyReduction));
                setBalance(prev => prev + financialImpact);
            } else if (event.cost_pct_income) {
                const income = currentJob ? currentJob.salary : 0;
                financialImpact = -Math.round((event.cost + Math.round(income * event.cost_pct_income)) * (1 - emergencyReduction));
                setBalance(prev => prev + financialImpact);
            }

            if (event.effect === 'salary_cut') {
                setActiveEffects(prev => [...prev, { id: event.id, type: 'salary_cut', remainingMonths: event.duration, pct: event.salary_cut_pct }]);
            } else if (event.effect === 'living_cost_increase') {
                setActiveEffects(prev => [...prev, { id: event.id, type: 'living_cost_increase', remainingMonths: event.duration, pct: event.cost_increase_pct }]);
            } else if (event.effect === 'stock_crash') {
                const dropPct = event.stock_drop_min + Math.random() * (event.stock_drop_max - event.stock_drop_min);
                setMarketPrices(prev => {
                    const newPrices = { ...prev };
                    Object.keys(newPrices).forEach(k => { newPrices[k] = Math.max(1, newPrices[k] * (1 - dropPct)); });
                    return newPrices;
                });
                // Also crash MF NAVs
                setMfNavs(prev => {
                    const newNavs = { ...prev };
                    Object.keys(newNavs).forEach(k => { newNavs[k] = Math.max(1, newNavs[k] * (1 - dropPct * 0.7)); });
                    return newNavs;
                });
                // Move market to bear phase
                setMarketCycle({ phase: 'bear', monthsLeft: 6 + Math.floor(Math.random() * 12) });
            } else if (event.effect === 'single_stock_crash') {
                const stockIds = Object.keys(marketPrices);
                if (stockIds.length > 0) {
                    const targetId = stockIds[Math.floor(Math.random() * stockIds.length)];
                    const dropPct = event.stock_drop_min + Math.random() * (event.stock_drop_max - event.stock_drop_min);
                    setMarketPrices(prev => ({ ...prev, [targetId]: Math.max(1, prev[targetId] * (1 - dropPct)) }));
                }
            } else if (event.effect === 'no_rent') {
                if (properties.length > 0) {
                    const randomPropId = properties[Math.floor(Math.random() * properties.length)];
                    setActiveEffects(prev => [...prev, { id: event.id, type: 'no_rent', remainingMonths: event.duration, propertyId: randomPropId }]);
                }
            } else if (event.effect === 'add_dependent') {
                if (!dependents.some(d => d.type === 'parent')) {
                    setDependents(prev => [...prev, { id: `parent_${Date.now()}`, type: 'parent', name: 'Aging Parent', monthAdded: totalMonthsPlayed, health: 70 }]);
                }
            } else if (event.effect === 'spouse_income_loss') {
                setActiveEffects(prev => [...prev, { id: event.id, type: 'spouse_income_loss', remainingMonths: event.duration || 6 }]);
            } else if (event.effect === 'spouse_income_boost') {
                setDependents(prev => prev.map(d => {
                    if (d.type === 'spouse' && d.isWorking) return { ...d, income: (d.income || 0) + (event.boost_amount || 10000) };
                    return d;
                }));
            }
        }

        if (mitigationRate > 0 && event.category !== 'positive') {
            message += ` (Insurance covered ${Math.round(mitigationRate * 100)}%)`;
        }

        let eventImage = null;
        if (event.id.includes('spouse')) {
            const spouse = stateRef.current.dependents.find(d => d.type === 'spouse');
            if (spouse) {
                const currentPlayerAge = 18 + Math.floor(totalMonthsPlayed / 12);
                const src = getSpriteImage(spouse.spriteId, currentPlayerAge);
                if (src) eventImage = { isSprite: true, source: src };
            }
        } else if (event.id.includes('child')) {
            const child = stateRef.current.dependents.find(d => d.type === 'child' && message.includes(d.name)) || stateRef.current.dependents.find(d => d.type === 'child');
            if (child) {
                const src = getSpriteImage(child.spriteId, (child.childAgeMonths || 0) / 12);
                if (src) eventImage = { isSprite: true, source: src };
            }
        } else if (event.id.includes('parent')) {
            eventImage = require('../../assets/ui_comp/familyicon.png');
        }

        const crisisEntry = {
            id: `${event.id}_${totalMonthsPlayed}`,
            name: event.name,
            message,
            category: event.category,
            severity: event.severity || 'minor',
            impact: financialImpact,
            month: totalMonthsPlayed,
            read: false,
            image: eventImage
        };
        setEventInbox(prev => [crisisEntry, ...prev].slice(0, 50));
        setLastCrisisEvent(crisisEntry);
        const isMajor = event.severity === 'major' || (financialImpact < -100000);
        if (isMajor) {
            setIsPlaying(false);
        }
        addHistory(`[EVENT] ${event.name}: ${financialImpact !== 0 ? (financialImpact > 0 ? '+' : '') + '₹' + Math.abs(financialImpact).toLocaleString() : 'Effect applied'}`, financialImpact, event.category === 'positive' ? 'income' : 'expense');
        return crisisEntry;
    };

    // =========================================================================
    // ENDGAME SCORING
    // =========================================================================

    const calculateFinalScore = () => {
        const passiveIncome = (() => {
            let income = 0;
            properties.forEach(id => {
                const prop = REAL_ESTATE.find(p => p.id === id);
                if (prop && prop.rental_income) income += prop.rental_income;
            });
            return income;
        })();
        const educatedChildren = dependents.filter(d => d.type === 'child' && (d.childAgeMonths || 0) >= 252).length;
        const retirementBonus = Math.min((ppf.balance + nps.balance) * 0.5, 5000000);
        const happinessMultiplier = 0.6 + (happiness / 100) * 0.8; // 0.6× (miserable) to 1.4× (thriving)
        const score = Math.round((netWorth + (passiveIncome * 120) - totalLoanOutstanding
            + (educatedChildren * 500000) + (activeInsurance.length > 0 ? 200000 : 0)
            + retirementBonus) * happinessMultiplier);
        let rank;
        if (score < 1000000) rank = 'Still Struggling';
        else if (score < 5000000) rank = 'Middle Class';
        else if (score < 20000000) rank = 'Upper Middle Class';
        else if (score < 100000000) rank = 'Wealthy';
        else if (score < 500000000) rank = 'Ultra Rich';
        else rank = 'Business Tycoon';
        return { score, rank, passiveIncome, educatedChildren, retirementCorpus: ppf.balance + nps.balance };
    };

    const startNextGeneration = (newSpriteIdx) => {
        if (!legacySummary) return;
        const newSpriteId = SPRITES[newSpriteIdx].id;
        
        // Check eldest child education & credit score buff
        let startsWithDegree = null;
        let startsWithGoodCredit = false;
        if (legacySummary.eldestChild) {
            if (legacySummary.eldestChild.schoolTier === 'Top Tier') {
                startsWithDegree = { id: 'business_admin', name: 'Business Administration', cost: 1000000, duration: 36 };
            }
            // Check if Gen 1 had supplementary cards
            startsWithGoodCredit = activeCreditCards.some(cc => CREDIT_CARDS.find(c => c.id === cc.cardId)?.isMinor);
        }

        // Full Reset of State (except generation logic)
        setTotalMonthsPlayed(0);
        setHistory([]);
        setCurrentJob(null);
        setPendingApplications([]);
        setDegrees(startsWithDegree ? [startsWithDegree] : []);
        setPortfolio({});
        setProperties([]);
        setPropertyBuyMonths({});
        setCurrentHousing({ id: 'hostel', name: 'Hostel Shared Room', maintenance: HOSTEL_MAINTENANCE, category: 'rental', life_quality: 2, image: require('../../assets/rooms/hostel.png') });
        setDependents([]);
        setExpectingChild(null);
        setTimesMarried(0);
        setLoans([]);
        setActiveInsurance([]);
        setCreditScore(startsWithGoodCredit ? 750 : 600);
        setActiveEffects([]);
        setActiveEnrollment(null);
        setEventInbox([]);
        setFiredDecisions([]);
        setAchievements([]);
        setCrisisCount(0);
        setHighHappinessMonths(0);
        setNetWorthHistory([]);
        setHappiness(50);
        setMonthlyExpenses(20000);
        setIsRetired(false);
        setPensionIncome(0);
        setCorpusDrawdown(0);
        setBucketListDone([]);
        setLastMonthTax(0);
        setLastMonthEMI(0);
        setCaSubscribed(false);
        setCaSubscribedMonth(null);
        setItrFiled({});
        setHealth(80);
        setPantry([]);
        setSickLeaveMonths(0);
        setMfPortfolio({});
        setSipPlans([]);
        setPpf({ balance: 0, contributionsThisYear: 0, totalContributions: 0 });
        setNps({ balance: 0, contributionsThisYear: 0 });
        setFixedDeposits([]);
        setGoldHoldings({});
        setCreditCard(null);
        setActiveCreditCards([]);
        setMarketCycle({ phase: 'sideways', monthsLeft: 12 });
        setBalance(STARTING_BALANCE);
        setPlayerSprite(newSpriteId);
        setPlayerName('');
        setPlayerBirthday(null);
        setGeneration(prev => prev + 1);
        setGameOver(false);
        setIsLegacyMode(false);
        setChildSavings({});
    };

    // =========================================================================
    // FINANCIAL TIPS
    // =========================================================================
    const getFinancialTips = () => {
        const tips = [];
        const salary = currentJob?.salary || 0;
        const annualIncome = salary * 12;
        const ppfContrib = ppf.contributionsThisYear || 0;
        const npsContrib = nps.contributionsThisYear || 0;
        const hasHealthIns = activeInsurance.some(i => INSURANCE_PLANS.find(p => p.id === i.planId)?.type === 'health');
        const hasLifeIns = activeInsurance.some(i => INSURANCE_PLANS.find(p => p.id === i.planId)?.type === 'life');
        const stockCount = Object.values(portfolio).filter(h => h?.qty > 0).length;
        const mfCount = Object.values(mfPortfolio).filter(h => h?.units > 0).length;
        const goldGrams = Object.values(goldHoldings).reduce((s, h) => s + (h?.grams || 0), 0);
        const totalEMI = getTotalEMI();
        const totalDebt = loans.reduce((s, l) => s + l.remainingPrincipal, 0);

        if (annualIncome > 500000 && ppfContrib < 150000)
            tips.push({ icon: 'piggy-bank', color: '#4ade80', title: 'Maximise 80C (PPF)', body: `You can still invest ₹${(150000 - ppfContrib).toLocaleString()} more in PPF this year. At your tax slab, that saves up to ₹46,800 in taxes.` });

        if (annualIncome > 500000 && npsContrib < 50000)
            tips.push({ icon: 'umbrella', color: '#818cf8', title: '80CCD — Extra ₹50k Deduction', body: 'NPS gives you an additional ₹50,000 tax deduction beyond the 80C limit. This is separate — invest now to claim both.' });

        if (!hasHealthIns && dependents.length > 0)
            tips.push({ icon: 'shield-alt', color: '#f87171', title: 'No Health Insurance!', body: `You have ${dependents.length} dependents but zero health cover. One hospitalisation can wipe ₹3–10L. A family floater costs ₹1,500–2,500/mo.` });

        if (!hasLifeIns && dependents.some(d => d.type === 'spouse' || d.type === 'child'))
            tips.push({ icon: 'heart', color: '#ec4899', title: 'Get Term Life Insurance', body: 'You have dependents but no life insurance. A ₹1 crore term cover costs ₹700–1,200/mo. The cheapest protection your family can have.' });

        if (salary > 0 && totalEMI > salary * 0.5)
            tips.push({ icon: 'exclamation-triangle', color: '#f87171', title: 'EMI Stress — Danger Zone', body: `Your EMIs (₹${totalEMI.toLocaleString()}) eat ${Math.round(totalEMI / salary * 100)}% of income. Above 50% is the debt trap — prepay the highest-rate loan first.` });

        if (creditScore < 700 && loans.length > 0)
            tips.push({ icon: 'chart-line', color: '#fb923c', title: 'Low CIBIL Costs You Money', body: `Your score (${creditScore}) adds 1.5–2% to every loan rate. Pay EMIs on time for 6+ months to cross 700 — saves thousands in interest.` });

        if (stockCount === 0 && mfCount === 0 && goldGrams === 0 && salary > 20000)
            tips.push({ icon: 'chart-bar', color: '#60a5fa', title: 'Start Investing Now', body: 'You hold no market assets. Inflation silently erodes cash savings. Even ₹1,000/month in a Nifty 50 index fund historically grows 12–14% p.a.' });

        if (goldGrams === 0 && salary > 30000)
            tips.push({ icon: 'coins', color: '#fbbf24', title: 'No Gold in Portfolio', body: 'Gold is counter-cyclical — it rises when stocks fall. Consider 5–10% of your portfolio in Sovereign Gold Bonds: 2.5% annual interest + capital gains tax-free at maturity.' });

        if (sipPlans.length === 0 && (stockCount > 0 || mfCount > 0))
            tips.push({ icon: 'sync', color: '#34d399', title: 'Set Up SIPs', body: 'Lump-sum investing requires market timing. SIPs average out the cost over time (rupee-cost averaging). Set up a monthly SIP and forget it.' });

        const totalAssets = balance + getStockValue() + getMFValue() + getRealEstateValue() + ppf.balance + nps.balance + getFDValue();
        if (totalDebt > 0 && totalDebt > totalAssets * 0.5)
            tips.push({ icon: 'balance-scale', color: '#f87171', title: 'Debt > 50% of Net Assets', body: 'Your loans exceed half your total assets. Focus on reducing debt before expanding investments — guaranteed debt reduction beats uncertain investment returns.' });

        if (playerAge >= 45 && (ppf.balance + nps.balance) < 2000000)
            tips.push({ icon: 'clock', color: '#fb923c', title: 'Retirement Corpus Too Low', body: `At age ${playerAge}, your PPF+NPS corpus is ₹${(ppf.balance + nps.balance).toLocaleString()}. You need ₹1–2 Cr to retire comfortably. Maximise contributions now.` });

        return tips.slice(0, 4); // Show top 4 most relevant
    };

    // =========================================================================
    // REAL MARKET SEED
    // =========================================================================
    // Called once on game start to initialise prices from live NSE data via backend.
    const fetchRealSeedPrices = async () => {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 8000);
            const res = await fetch(`${API_BASE}/market/seed-prices`, { signal: controller.signal });
            clearTimeout(timer);
            if (!res.ok) return;
            const json = await res.json();
            const realPrices = json?.data || {};
            if (Object.keys(realPrices).length === 0) return;
            setMarketPrices(prev => {
                const next = { ...prev };
                STOCKS.forEach(s => {
                    if (realPrices[s.ticker] !== undefined) {
                        next[s.id] = realPrices[s.ticker];
                    }
                });
                return next;
            });
        } catch (_) {
            // Backend unavailable — simulation continues from default prices
        }
    };

    // Seed real prices once when the game starts (marketPrices is empty on first run)
    useEffect(() => {
        if (Object.keys(marketPrices).length === 0) {
            fetchRealSeedPrices();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // =========================================================================
    // RETIREMENT BUCKETS
    // =========================================================================
    const [retirementBuckets, setRetirementBuckets] = useState(null);
    // null = not set | { bucket1: ₹ (1yr expenses in FD), bucket2: ₹ (5yr in bonds/PPF), bucket3: ₹ (equity/growth) }

    const setupRetirementBuckets = (bucket1Amt, bucket2Amt, bucket3Amt) => {
        const total = bucket1Amt + bucket2Amt + bucket3Amt;
        const corpus = ppf.balance + nps.balance + balance;
        if (total > corpus) return { success: false, msg: 'Bucket total exceeds available corpus.' };
        setRetirementBuckets({ bucket1: bucket1Amt, bucket2: bucket2Amt, bucket3: bucket3Amt, setupMonth: totalMonthsPlayed });
        return { success: true, msg: 'Retirement buckets configured. Bucket 1 covers your near-term expenses; Bucket 3 stays invested for long-term growth.' };
    };

    const retireEarly = () => {
        const corpus = ppf.balance + nps.balance;
        if (corpus < 10000000) return { success: false, msg: 'Need at least ₹1 Crore in PPF + NPS corpus to retire early.' };
        if (playerAge < 45) return { success: false, msg: 'Must be at least 45 to retire early.' };
        setIsRetired(true);
        setIsPlaying(false);
        const monthly = Math.round(corpus * 0.04 / 12);
        setPensionIncome(monthly);
        setCorpusDrawdown(monthly);
        setCurrentJob(null);
        setLastCrisisEvent({
            id: 'early_retirement',
            name: 'EARLY RETIREMENT!',
            message: `You retire at age ${playerAge} — ahead of your time!\n\nCorpus: ₹${corpus.toLocaleString()}\nMonthly pension: ₹${monthly.toLocaleString()}/mo\n\nThe rest of life is yours.`,
            category: 'positive', impact: 0,
        });
        return { success: true };
    };

    // =========================================================================
    // REAL-TIME RANDOM EVENT TIMER
    // Fires minor/moderate inbox events on a real-world timer (not month-gated)
    // =========================================================================
    const applyCrisisRef = useRef(null);
    useEffect(() => { applyCrisisRef.current = applyCrisisEvent; });

    useEffect(() => {
        if (gameOver) return;
        const scheduleNext = () => {
            const delay = 40000 + Math.random() * 80000; // 40-120s
            return setTimeout(() => {
                const state = stateRef.current;
                if (state.gameOver) return;
                // Real-time events don't fire in the first 6 months
                if ((state.totalMonthsPlayed || 0) < 6) {
                    timerRef.current = scheduleNext();
                    return;
                }
                // 40% chance life decision, 60% chance minor crisis
                if (Math.random() < 0.4) {
                    // Life decision
                    if (!state.pendingDecision) {
                        const eligible = LIFE_DECISIONS.filter(d =>
                            d.condition(state) && !(state.firedDecisions || []).includes(d.id)
                        );
                        if (eligible.length > 0) {
                            const decision = eligible[Math.floor(Math.random() * eligible.length)];
                            setPendingDecision(decision);
                            setFiredDecisions(prev => [...prev, decision.id]);
                            setIsPlaying(false);
                        }
                    }
                } else {
                    // Minor crisis
                    const eligible = CRISIS_EVENTS.filter(e =>
                        e.severity !== 'major' && e.condition(state)
                    );
                    if (eligible.length > 0 && applyCrisisRef.current) {
                        const event = eligible[Math.floor(Math.random() * eligible.length)];
                        applyCrisisRef.current(event);
                    }
                }
                timerRef.current = scheduleNext();
            }, delay);
        };
        const timerRef = { current: scheduleNext() };
        return () => clearTimeout(timerRef.current);
    }, [gameOver]);

    // =========================================================================
    // MONTHLY TICK
    // =========================================================================

    const nextMonth = () => {
        if (pendingDecision) return;
        const decisionsToQueue = [];
        const today = new Date().toDateString();
        const newTurns = (dailyTurnsRef.current.date === today) 
            ? { date: today, count: dailyTurnsRef.current.count + 1 }
            : { date: today, count: 1 };
        setDailyTurns(newTurns);
        dailyTurnsRef.current = newTurns;
        AsyncStorage.setItem('finlit_daily_turns', JSON.stringify(newTurns));

        // True end of life — legacy screen
        if (totalMonthsPlayed >= GAME_END_MONTH && !gameOver) {
            const score = calculateFinalScore();
            setFinalScore(score);
            
            // --- Legacy Generation Splitting ---
            const currentNetWorth = balance + getStockValue() + getMFValue() + getGoldValue() + getPropertyTotalValue() + ppf.balance + nps.balance;
            const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.principal, 0);
            const totalChildSavingsAmt = Object.values(childSavings).reduce((sum, amt) => sum + amt, 0);
            
            // Calculate Estate Taxes
            let estateTaxRate = 0.20; // 20% default
            if (caSubscribed) estateTaxRate = 0.05; // 5% if CA retained
            
            const netAssets = currentNetWorth - totalLoanAmount - totalChildSavingsAmt;
            const estateTaxAmount = Math.max(0, netAssets * estateTaxRate);
            const inheritancePool = Math.max(0, netAssets - estateTaxAmount);
            
            const children = dependents.filter(d => d.type === 'child');
            const numChildren = Math.max(1, children.length); // If 0, pretend adopted heir
            
            const generalInheritance = Math.floor(inheritancePool / numChildren);
            
            // The user will play as the eldest child (or heir)
            let eldestChild = null;
            if (children.length > 0) {
                eldestChild = [...children].sort((a, b) => b.childAgeMonths - a.childAgeMonths)[0];
            }
            
            const eldestSavings = eldestChild && childSavings[eldestChild.id] ? childSavings[eldestChild.id] : 0;
            const startingGenBalance = eldestSavings + generalInheritance;
            
            setLegacySummary({
                age: playerAge,
                netWorth: currentNetWorth - totalLoanAmount,
                estateTaxRate: estateTaxRate * 100,
                estateTaxAmount,
                totalChildSavings: totalChildSavingsAmt,
                numChildren: children.length,
                generalInheritance,
                eldestSavings,
                startingGenBalance,
                eldestChild
            });

            setGameOver(true);
            setIsPlaying(false);
            return;
        }

        // Retirement trigger — career ends, new phase begins
        if (totalMonthsPlayed === RETIREMENT_MONTH && !isRetired) {
            setIsRetired(true);
            setIsPlaying(false);
            const corpus = ppf.balance + nps.balance;
            const monthly = Math.round(corpus * 0.04 / 12); // 4% safe withdrawal rate
            setPensionIncome(monthly);
            setCorpusDrawdown(monthly);
            setLastCrisisEvent({
                id: 'retirement_trigger',
                name: 'YOU HAVE RETIRED',
                message: `Congratulations! After 40 years of work you retire at age 58.\n\nCorpus: ₹${corpus.toLocaleString()}\nMonthly pension: ₹${monthly.toLocaleString()}/mo\n\nYou have 17 more years. Manage your wealth wisely — healthcare costs will rise.`,
                category: 'positive',
                impact: 0,
            });
            return;
        }

        // ── RETIREMENT PHASE (age 58–75) ───────────────────────────────────────
        if (isRetired) {
            // Income: pension + rental + dividends
            let retirementIncome = pensionIncome;
            properties.forEach(id => {
                const prop = REAL_ESTATE.find(p => p.id === id);
                if (prop?.rental_income) retirementIncome += Math.round(prop.rental_income * (1 + (trait.rentalBonus || 0)));
            });

            // Quarterly dividends
            let dividendIncome = 0;
            if (totalMonthsPlayed % 3 === 0) {
                STOCKS.forEach(stock => {
                    if (stock.dividendYield > 0) {
                        const holding = portfolio[stock.id];
                        if (holding?.qty > 0) {
                            const price = marketPrices[stock.id] || stock.price;
                            dividendIncome += Math.round((price * holding.qty * stock.dividendYield) / 100 / 4);
                        }
                    }
                });
                if (dividendIncome > 0) setBalance(prev => prev + dividendIncome);
            }

            // Healthcare cost escalates with age; happiness reduces it (happier = healthier)
            const retirementAge = 58 + Math.floor((totalMonthsPlayed - RETIREMENT_MONTH) / 12);
            const happinessHealthBonus = happiness >= 70 ? 0.85 : happiness <= 30 ? 1.20 : 1.0;
            const healthcareCost = Math.round((2000 + (retirementAge - 58) * 400) * happinessHealthBonus);

            // Living costs (lower — no commute, no work expenses)
            const retirementLiving = Math.round((LIVING_COSTS_BASE + getDependentCosts()) * 0.75);
            const housingCost = currentHousing.maintenance || 0;
            const totalEMI = getTotalEMI();
            const totalExpenses = retirementLiving + healthcareCost + housingCost + totalEMI;

            const netFlow = retirementIncome + dividendIncome - totalExpenses;
            setBalance(prev => prev + netFlow);
            setLastMonthFlow({ amount: netFlow, income: retirementIncome, expenses: totalExpenses });
            setMonthlyRecap({
                month: turn.month, year: turn.year,
                income: { salary: 0, rental: retirementIncome - pensionIncome, spouse: 0, dividend: dividendIncome, pension: pensionIncome },
                expenses: { housing: housingCost, living: retirementLiving, healthcare: healthcareCost, emi: totalEMI },
                netFlow,
            });

            // Retirement-specific crisis events (healthcare, family)
            if (Math.random() < 0.06) {
                const retirementEvents = [
                    { name: 'Major Surgery', message: 'Hip replacement surgery needed. A big but necessary expense.', impact: -350000, category: 'crisis' },
                    { name: 'Heart Checkup', message: 'Routine cardiac checkup revealed minor issues. Managed with medication.', impact: -45000, category: 'crisis' },
                    { name: "Child's Wedding", message: "Your child is getting married! A joyful but expensive occasion.", impact: -800000, category: 'crisis' },
                    { name: 'Grandchild Born', message: 'You have a grandchild! You gift ₹1L to welcome the new arrival.', impact: -100000, category: 'positive' },
                    { name: 'Travel Bucket List', message: 'You finally took that Europe trip you always dreamed of. Worth every rupee.', impact: -250000, category: 'positive' },
                    { name: 'Property Appreciated', message: 'Your property value surged 20%. Great time to consider selling.', impact: 0, category: 'positive' },
                    { name: 'Eye Surgery', message: 'Cataract surgery — quick recovery, clear vision restored.', impact: -80000, category: 'crisis' },
                    { name: 'Pension Bonus', message: 'Government announces one-time senior citizen relief. Extra ₹50k credited.', impact: 50000, category: 'positive' },
                    { name: 'Medical Emergency', message: 'Sudden hospitalisation for a week. Insurance covered most of it.', impact: activeInsurance.length > 0 ? -50000 : -400000, category: 'crisis' },
                    { name: 'Inheritance Received', message: 'A distant relative left you something in their will.', impact: 300000, category: 'positive' },
                ];
                const ev = retirementEvents[Math.floor(Math.random() * retirementEvents.length)];
                if (ev.impact !== 0) setBalance(prev => prev + ev.impact);
                const retirementEntry = { ...ev, id: `retirement_${Date.now()}`, month: totalMonthsPlayed, read: false };
                setEventInbox(prev => [retirementEntry, ...prev].slice(0, 50));
                setLastCrisisEvent(retirementEntry);
                setIsPlaying(false);
            }

            setTurn(prev => {
                let m = prev.month + 1, y = prev.year;
                if (m > 12) { m = 1; y++; }
                return { month: m, year: y };
            });
            setTotalMonthsPlayed(prev => prev + 1);
            return;
        }
        // ── END RETIREMENT PHASE ───────────────────────────────────────────────

        // ── JOB APPLICATION EVALUATION ─────────────────────────────────────────
        if (pendingApplications.length > 0) {
            const currentApp = pendingApplications[0];
            const baseChance = 0.60;
            const roll = Math.random();
            
            if (roll <= baseChance) {
                setPendingJobInterview(currentApp);
                setIsPlaying(false);
            } else {
                const rejEvent = {
                    id: `job_rej_${Date.now()}`,
                    name: '📋 Application Update',
                    message: `Unfortunately, ${currentApp.name} decided to move forward with other candidates.\n\nYour application has been rejected. You are free to re-apply or try other positions.`,
                    category: 'negative',
                    impact: 0,
                    month: totalMonthsPlayed + 1,
                    read: false
                };
                setEventInbox(prev => [rejEvent, ...prev].slice(0, 50));
                setLastCrisisEvent(rejEvent);
                setIsPlaying(false);
            }
            setPendingApplications(prev => prev.slice(1));
        }

        const salary = currentJob ? currentJob.salary : 0;
        const salaryCutEffect = activeEffects.find(e => e.type === 'salary_cut');
        const effectiveSalary = salaryCutEffect ? Math.round(salary * (1 - salaryCutEffect.pct)) : salary;

        // Real Estate income
        let realEstateIncome = 0;
        properties.forEach(id => {
            const prop = REAL_ESTATE.find(p => p.id === id);
            if (!prop || !prop.rental_income) return;
            const noRentEffect = activeEffects.find(e => e.type === 'no_rent' && e.propertyId === id);
            if (!noRentEffect) realEstateIncome += Math.round(prop.rental_income * (1 + (trait.rentalBonus || 0)));
        });

        const spouseIncome = getSpouseIncome();

        // Dividend income (quarterly — every 3 months)
        let dividendIncome = 0;
        if (totalMonthsPlayed % 3 === 0) {
            STOCKS.forEach(stock => {
                if (stock.dividendYield && stock.dividendYield > 0) {
                    const holding = portfolio[stock.id];
                    if (holding && holding.qty > 0) {
                        const currentPrice = marketPrices[stock.id] || stock.price;
                        dividendIncome += Math.round((currentPrice * holding.qty * stock.dividendYield) / 100 / 4);
                    }
                }
            });
            if (dividendIncome > 0) {
                setBalance(prev => prev + dividendIncome);
                addHistory(`Dividend income (Q${Math.ceil((totalMonthsPlayed % 12) / 3)})`, dividendIncome, 'income');
            }
        }

        // --- EXPENSES ---
        let housingCost = 0;
        if (properties.includes(currentHousing.id)) {
            housingCost = currentHousing.maintenance || 0;
        } else {
            housingCost = currentHousing.rental_income || currentHousing.maintenance || 0;
        }
        let investmentMaintenance = 0;
        properties.forEach(id => {
            const prop = REAL_ESTATE.find(p => p.id === id);
            if (prop && prop.id !== currentHousing.id) investmentMaintenance += (prop.maintenance || 0);
        });
        const yearsPassed = Math.floor(totalMonthsPlayed / 12);
        const inflationMultiplier = Math.pow(1.025, yearsPassed); // 2.5% annual inflation on living costs
        let livingCosts = Math.round(LIVING_COSTS_BASE * inflationMultiplier) + getDependentCosts();
        if (trait.familyCostDiscount) livingCosts = Math.round(livingCosts * (1 - trait.familyCostDiscount));
        if (trait.livingCostDiscount) livingCosts = Math.round(livingCosts * (1 - trait.livingCostDiscount));
        const inflationEffect = activeEffects.find(e => e.type === 'living_cost_increase');
        if (inflationEffect && !trait.inflationImmune) livingCosts = Math.round(livingCosts * (1 + inflationEffect.pct));
        const totalEMI = getTotalEMI();
        const insurancePremiums = getInsurancePremiums();
        const monthlyTax = getMonthlyTax();
        const rawTuition = activeEnrollment ? (activeEnrollment.monthlyTuition || 0) : 0;
        const tuitionCost = trait.tuitionDiscount ? Math.round(rawTuition * (1 - trait.tuitionDiscount)) : rawTuition;

        // --- PROCESS SIPs ---
        let totalSIPDeducted = 0;
        setSipPlans(prevSips => {
            const updated = prevSips.map(sip => {
                if (sip.type === 'stock') {
                    const stock = STOCKS.find(s => s.id === sip.assetId);
                    if (!stock) return sip;
                    const currentPrice = marketPrices[sip.assetId] || stock.price;
                    const qty = Math.floor(sip.amount / currentPrice);
                    if (qty > 0 && balance - totalSIPDeducted >= sip.amount) {
                        const cost = qty * currentPrice;
                        totalSIPDeducted += cost;
                        setPortfolio(prev => {
                            const existing = prev[sip.assetId] || { qty: 0, avgPrice: 0, buyMonth: totalMonthsPlayed };
                            const totalQty = existing.qty + qty;
                            const newAvg = ((existing.avgPrice * existing.qty) + (currentPrice * qty)) / totalQty;
                            return { ...prev, [sip.assetId]: { qty: totalQty, avgPrice: newAvg, buyMonth: existing.buyMonth } };
                        });
                        return { ...sip, totalInvested: (sip.totalInvested || 0) + cost };
                    }
                } else if (sip.type === 'mf') {
                    const mf = MUTUAL_FUNDS.find(m => m.id === sip.assetId);
                    if (!mf) return sip;
                    const currentNav = mfNavs[sip.assetId] || mf.nav;
                    if (balance - totalSIPDeducted >= sip.amount) {
                        const units = sip.amount / currentNav;
                        totalSIPDeducted += sip.amount;
                        setMfPortfolio(prev => {
                            const existing = prev[sip.assetId] || { units: 0, avgNav: 0, buyMonth: totalMonthsPlayed };
                            const totalUnits = existing.units + units;
                            const newAvgNav = ((existing.avgNav * existing.units) + (currentNav * units)) / totalUnits;
                            return { ...prev, [sip.assetId]: { units: totalUnits, avgNav: newAvgNav, buyMonth: existing.buyMonth } };
                        });
                        return { ...sip, totalInvested: (sip.totalInvested || 0) + sip.amount };
                    }
                }
                return sip;
            });
            return updated;
        });

        const caFee = caSubscribed ? 2000 : 0;
        const totalIncome = effectiveSalary + realEstateIncome + spouseIncome;
        const totalExpenses = housingCost + investmentMaintenance + livingCosts + totalEMI + insurancePremiums + monthlyTax + tuitionCost + totalSIPDeducted + caFee;
        const netFlow = totalIncome - totalExpenses;

        // Annual salary raise (3–7% base, HUSTLER gets extra 12%)
        if (currentJob && totalMonthsPlayed > 0 && totalMonthsPlayed % 12 === 0) {
            const baseRaise = 0.03 + Math.random() * 0.04;
            const raiseRate = baseRaise + (trait.salaryGrowthBonus || 0);
            const newSalary = Math.round(currentJob.salary * (1 + raiseRate));
            setCurrentJob(prev => prev ? { ...prev, salary: newSalary } : prev);
            const raiseEntry = {
                id: `raise_${totalMonthsPlayed}`, name: '💰 Annual Raise!',
                message: `You got a ${Math.round(raiseRate * 100)}% pay rise at ${currentJob.name}. New salary: ₹${newSalary.toLocaleString()}/mo.`,
                category: 'positive', impact: (newSalary - currentJob.salary) * 12, month: totalMonthsPlayed, read: false,
            };
            setEventInbox(prev => [raiseEntry, ...prev].slice(0, 50));
            addHistory(`Annual raise! +${Math.round(raiseRate * 100)}%  ₹${currentJob.salary.toLocaleString()} → ₹${newSalary.toLocaleString()}`, newSalary - currentJob.salary, 'income');
        }

        // ITR filing deadline — every July (month 7), fired once per game year
        if (turn.month === 7 && !pendingDecision && totalMonthsPlayed >= 6) {
            const gameYear = turn.year;
            if (!itrFiled[gameYear] && (currentJob || netWorth > 250000)) {
                decisionsToQueue.push({
                    id: `itr_${gameYear}`,
                    name: 'ITR Filing Deadline',
                    emoji: '📄',
                    category: 'dilemma',
                    message: `July 31st — your Income Tax Return for FY ${gameYear - 1}-${String(gameYear).slice(2)} is due.\n\n${caSubscribed ? 'Your CA has prepared your return with optimised deductions. File now to stay compliant.' : "You don't have a CA. Self-file step-by-step (collect documents, pick the right form, compute your tax) or hire a CA for ₹3,000 one-time. Skipping costs ₹5,000 in late fees."}`,
                    choices: caSubscribed
                        ? [
                            { label: 'File with CA', color: '#4ade80', effect: { type: 'itr_ca' } },
                            { label: 'Skip (₹5,000 penalty)', color: '#f87171', effect: { type: 'itr_skip' } },
                          ]
                        : [
                            { label: 'File myself (free)', color: '#60a5fa', effect: { type: 'itr_self' } },
                            { label: 'Hire CA — ₹3,000', color: '#4ade80', effect: { type: 'itr_ca_onetime' } },
                            { label: 'Skip (₹5,000 penalty)', color: '#f87171', effect: { type: 'itr_skip' } },
                          ],
                });
                setIsPlaying(false);
            }
        }

        // Budget Day — every February (month 2), fire a budget choice event
        if (turn.month === 2 && !pendingDecision && totalMonthsPlayed >= 2) {
            const yearIndex = Math.floor(totalMonthsPlayed / 12);
            const budgetEvent = BUDGET_EVENTS[yearIndex % BUDGET_EVENTS.length];
            decisionsToQueue.push({ ...budgetEvent, isBudget: true });
            setIsPlaying(false);
        }

        // ── BIRTHDAY MECHANICS ──
        let bdayMonth = 1; // Default to January if not set or parse fails
        if (playerBirthday && playerBirthday.includes('/')) {
            bdayMonth = parseInt(playerBirthday.split('/')[0], 10); // format is M/D, take [0] for month
        }

        const getOrdinal = (n) => {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };

        let playerBdayYearToCelebrate = null;
        if (bdayMonth && totalMonthsPlayed > 0 && !pendingDecision) {
            const startYear = 2024;
            for (let y = startYear; y <= turn.year; y++) {
                if (!firedDecisions.includes(`bday_${y}`)) {
                    if (y === turn.year && turn.month === bdayMonth) {
                        playerBdayYearToCelebrate = y;
                        break;
                    }
                }
            }
        }

        if (playerBdayYearToCelebrate !== null) {
            const bdayDecisionId = `bday_${playerBdayYearToCelebrate}`;
            let currentAge = 18 + Math.floor(totalMonthsPlayed / 12);
            if (bdayMonth <= turn.month) currentAge += 1;

            // Family Gift logic on Player's Birthday
            if (dependents.length > 0) {
                let giftCash = 0;
                let giftMsg = '';
                const spouse = dependents.find(d => d.type === 'spouse');
                const parents = dependents.filter(d => d.type === 'parent');

                if (spouse && (spouse.happiness || 70) > 50) {
                    const spouseGift = 3000 + Math.floor(Math.random() * 5000);
                    giftCash += spouseGift;
                    giftMsg += `Your spouse gave you a beautiful birthday gift worth ₹${spouseGift.toLocaleString()}! `;
                }

                if (parents.length > 0) {
                    const goldGrams = parents.length * 1;
                    setGoldHoldings(prev => {
                        const existing = prev['gold_24k'] || { grams: 0, avgBuyPrice: goldPrice, buyMonth: totalMonthsPlayed, interestAccrued: 0 };
                        return { ...prev, ['gold_24k']: { ...existing, grams: existing.grams + goldGrams } };
                    });
                    giftMsg += `Your parents blessed you with ${goldGrams}g of 24K Gold! `;
                }

                if (giftCash > 0 || parents.length > 0) {
                    if (giftCash > 0) setBalance(prev => prev + giftCash);
                    setEventInbox(prev => [{
                        id: `bday_gift_${totalMonthsPlayed}`, name: '🎁 Family Birthday Gifts',
                        message: giftMsg.trim(),
                        category: 'positive', impact: giftCash, month: totalMonthsPlayed, read: false,
                    }, ...prev].slice(0, 50));
                }
            }

            // Milestone Checks
            if (currentAge === 30 && (netWorth < 500000 && !currentHousing.id.includes('own'))) {
                setLastCrisisEvent({
                    id: `midlife_30_${totalMonthsPlayed}`, name: 'Mid-Life Review: Age 30',
                    message: `You turned 30. You don't own a home and your net worth is below ₹5L. You feel behind your peers. (-20 Happiness)`,
                    category: 'crisis', impact: 0,
                });
                setHappiness(prev => Math.max(0, prev - 20));
                setFiredDecisions(prev => [...prev, bdayDecisionId]);
                setIsPlaying(false);
            } else if (currentAge === 40 && health < 50) {
                setLastCrisisEvent({
                    id: `midlife_40_${totalMonthsPlayed}`, name: 'Mid-Life Review: Age 40',
                    message: `You turned 40 but your health is poor (${Math.round(health)}/100). You've developed chronic back pain. (-15 Max Health)`,
                    category: 'crisis', impact: 0,
                });
                setHealth(prev => Math.max(0, prev - 15));
                setFiredDecisions(prev => [...prev, bdayDecisionId]);
                setIsPlaying(false);
            } else if (currentAge === 50 && (ppf.balance + nps.balance) < 1000000) {
                setLastCrisisEvent({
                    id: `midlife_50_${totalMonthsPlayed}`, name: 'Mid-Life Review: Age 50',
                    message: `You turned 50. Your retirement corpus (PPF+NPS) is only ₹${(ppf.balance + nps.balance).toLocaleString()}. You have 8 years left to build a nest egg! (-25 Happiness)`,
                    category: 'crisis', impact: 0,
                });
                setHappiness(prev => Math.max(0, prev - 25));
                setFiredDecisions(prev => [...prev, bdayDecisionId]);
                setIsPlaying(false);
            } else if (!pendingDecision) {
                // Regular Birthday Party (Forced)
                decisionsToQueue.push({
                    id: `bday_${playerBdayYearToCelebrate}`,
                    name: `Happy ${getOrdinal(currentAge)} Birthday!`,
                    emoji: '🎂',
                    category: 'dilemma',
                    isBirthday: true,
                    message: `It's your birthday! How do you want to celebrate?`,
                    choices: [
                        { label: 'Quiet Dinner', color: '#60a5fa', effect: { type: 'birthday_celebration', choiceLabel: 'Quiet Dinner', amount: 1500, happiness: 15, health: 15, msg: 'A peaceful, restorative evening.' } },
                        { label: 'House Party', color: '#4ade80', effect: { type: 'birthday_celebration', choiceLabel: 'House Party', amount: 10000, happiness: 25, salaryBonusPct: 0.05, msg: 'You networked with friends! Small 5% salary bump!' } },
                        { label: 'Lavish Bash', color: '#f87171', effect: { type: 'birthday_celebration', choiceLabel: 'Lavish Bash', amount: 40000, happiness: 50, creditScore: 40, health: -10, msg: 'A wild party! Huge status boost but you feel hungover.' } },
                        ...(balance < 1500 ? [{ label: 'Broke Birthday', color: '#445070', effect: { type: 'birthday_celebration', choiceLabel: 'Broke Birthday', amount: 0, happiness: -15, health: -5, msg: 'A lonely, broke birthday.' } }] : [])
                    ],
                });
                setFiredDecisions(prev => [...prev, bdayDecisionId]);
                setIsPlaying(false);
            }
        } else if (!pendingDecision && totalMonthsPlayed > 0) {
            // Dependent Birthdays — check if they missed a past birthday or are due for this year's
            const bdayDependent = dependents.find(d => {
                if (d.isDead || d.bdayMonth === undefined || d.custody === 'ex') return false;
                const lastCel = d.lastCelebratedYear || (turn.year - 1);
                if (lastCel === turn.year - 1 && turn.month === d.bdayMonth) return true;
                return false;
            });
            
            if (bdayDependent) {
                const yearToCelebrate = (bdayDependent.lastCelebratedYear || (turn.year - 1)) + 1;
                const isSpouse = bdayDependent.type === 'spouse';
                const age = Math.floor((totalMonthsPlayed - bdayDependent.monthAdded) / 12) + (isSpouse ? 25 : 1); // rough age
                
                let choices = [
                    { label: 'Quiet Family Dinner', color: '#60a5fa', effect: { type: 'birthday_celebration', choiceLabel: 'Quiet Family Dinner', amount: 2500, happiness: 20, health: 10, dependentId: bdayDependent.id, msg: 'A lovely, peaceful family dinner.' } },
                    { label: 'Big House Party', color: '#4ade80', effect: { type: 'birthday_celebration', choiceLabel: 'Big House Party', amount: 12000, happiness: 30, spouseIncomeBoost: isSpouse ? 0.10 : 0, childSavingsBoost: isSpouse ? 0 : 10000, dependentId: bdayDependent.id, msg: isSpouse ? 'Great party! Spouse got a 10% raise!' : 'Fun kids party! You also put ₹10,000 into their savings.' } },
                    { label: 'Lavish Celebration', color: '#f87171', effect: { type: 'birthday_celebration', choiceLabel: 'Lavish Celebration', amount: 45000, happiness: 60, creditScore: 25, spouseIncomeBoost: isSpouse ? 0.20 : 0, childSavingsBoost: isSpouse ? 0 : 25000, dependentId: bdayDependent.id, msg: 'An unforgettable bash! Huge happiness and status boost.' } }
                ];
                
                let message = `How do you want to celebrate?`;
                
                if (isSpouse) {
                    const suggestionIndex = Math.floor(Math.random() * 3);
                    const suggestedChoice = choices[suggestionIndex];
                    const hintMsg = `Hint: ${bdayDependent.name} wants a ${suggestedChoice.label}.`;
                    message += `\n\n${hintMsg}`;
                    
                    choices = choices.map((choice, index) => {
                        if (index === suggestionIndex) {
                            choice.effect.happiness += 20;
                            choice.effect.msg += ` ${bdayDependent.name} is absolutely thrilled you listened!`;
                        } else {
                            choice.effect.happiness -= 40;
                            choice.effect.msg += ` However, ${bdayDependent.name} is visibly upset that you ignored their hint...`;
                        }
                        return choice;
                    });
                }
                
                if (balance < 2500) {
                    choices.push({ label: 'Skip Party (Too Broke)', color: '#445070', effect: { type: 'birthday_celebration', choiceLabel: 'Skip Party', amount: 0, happiness: isSpouse ? -50 : -20, dependentId: bdayDependent.id, msg: 'Your family is severely disappointed.' } });
                }
                decisionsToQueue.push({
                    id: `dep_bday_${bdayDependent.id}_${totalMonthsPlayed}`,
                    name: `Happy ${getOrdinal(age)} Birthday, ${bdayDependent.name}!`,
                    emoji: '🎂',
                    category: 'dilemma',
                    isBirthday: true,
                    dependentType: bdayDependent.type,
                    message,
                    choices,
                });
                setDependents(prev => prev.map(d => d.id === bdayDependent.id ? { ...d, lastCelebratedYear: yearToCelebrate } : d));
                setIsPlaying(false);
            }
        }

        // Career advancement offer — every 24–36 months with a job, 35% chance
        if (currentJob && totalMonthsPlayed > 0 && totalMonthsPlayed % 24 === 0 && Math.random() < 0.35) {
            const betterJobs = JOBS.filter(j => {
                const meetsReq = (j.req_degrees || []).every(d => degrees.includes(d)) && netWorth >= (j.req_net_worth || 0);
                return meetsReq && j.salary > currentJob.salary * 1.15 && j.id !== currentJob.id;
            });
            if (betterJobs.length > 0) {
                const offer = betterJobs[Math.floor(Math.random() * Math.min(betterJobs.length, 3))];
                setPendingJobOffer(offer);
                const offerEntry = {
                    id: `job_offer_${totalMonthsPlayed}`, name: '📨 Job Offer!',
                    message: `${offer.name} wants to hire you — ₹${offer.salary.toLocaleString()}/mo vs your current ₹${currentJob.salary.toLocaleString()}/mo. Check CAREERS to decide.`,
                    category: 'positive', impact: 0, month: totalMonthsPlayed, read: false,
                };
                setEventInbox(prev => [offerEntry, ...prev].slice(0, 50));
                setLastCrisisEvent(offerEntry);
                setIsPlaying(false);
            }
        }

        setBalance(prev => prev + netFlow);

        // ── SPOUSE HAPPINESS & DIVORCE MECHANICS ──
        if (totalMonthsPlayed > 0 && !pendingDecision) {
            const spouse = stateRef.current.dependents.find(d => d.type === 'spouse');
            if (spouse) {
                let delta = -0.5;
                if (happiness > 80) delta += 1.0;
                if (currentHousing.life_quality < 4) delta -= 1.0;
                if (totalLoanOutstanding > 5000000) delta -= 1.0;
                const currentSpouseHappiness = spouse.happiness !== undefined ? spouse.happiness : 70;
                const newSpouseHappiness = Math.max(0, Math.min(100, currentSpouseHappiness + delta));
                setDependents(prev => prev.map(d => d.id === spouse.id ? { ...d, happiness: newSpouseHappiness } : d));
                if (newSpouseHappiness < 30 && Math.random() < 0.15) {
                    divorce();
                    setLastCrisisEvent({
                        id: `divorce_${totalMonthsPlayed}`, name: 'Divorce',
                        message: `Your spouse was too unhappy and decided to leave you. You paid ₹2,00,000 in settlement.`,
                        category: 'crisis', impact: -200000, month: totalMonthsPlayed, read: false
                    });
                    setIsPlaying(false);
                }
            }
        }

        // ── ELDERLY PARENT MECHANIC ──
        if (totalMonthsPlayed > 0 && !pendingDecision) {
            const numParents = stateRef.current.dependents.filter(d => d.type === 'parent').length;
            if (playerAge >= 28 && numParents < 2 && Math.random() < 0.035) {
                const parentOptions = [];
                if (currentHousing.capacity >= stateRef.current.dependents.length + 2) {
                    parentOptions.push({ label: 'Move Them In', color: '#4ade80', effect: { type: 'parent_move_in' } });
                }
                parentOptions.push({ label: 'Send ₹10,000/mo', color: '#60a5fa', effect: { type: 'parent_support_allowance' } });
                parentOptions.push({ label: 'Neglect Them', color: '#f87171', effect: { type: 'parent_decline' } });

                decisionsToQueue.push({
                    id: `parent_request_${totalMonthsPlayed}`,
                    name: 'Family Obligation',
                    emoji: '👴',
                    category: 'dilemma',
                    message: 'Your elderly parent is struggling to live alone and needs your support.',
                    choices: parentOptions,
                });
                setIsPlaying(false);
            }
        }

        // Happiness — the other dimension of a good life
        const qualityScore = currentHousing.life_quality || 2;
        const housingEffect  = (qualityScore - 5) * 0.25;
        const debtStress     = -(totalLoanOutstanding / 10000000) * 0.4;
        const familyWarmth   = Math.min(dependents.length * 0.3, 1.2);
        const jobSatisfaction = currentJob ? 0.15 : -0.4;
        const financeStress  = netFlow < 0 ? -0.5 : 0.1;
        const neglectEffect = activeEffects.find(e => e.type === 'parent_neglect');
        const neglectStress = neglectEffect ? -1.0 : 0;
        const happinessDelta = Math.round((housingEffect + debtStress + familyWarmth + jobSatisfaction + financeStress + neglectStress) * 10) / 10;
        setLastHappiness(happiness);
        const newHappiness = Math.max(0, Math.min(100, happiness + happinessDelta));
        setHappiness(newHappiness);

        // Track high-happiness streak
        if (newHappiness > 80) setHighHappinessMonths(prev => prev + 1);

        // ── LOW PANTRY WARNING ─────────────────────────────────────────────────
        const totalPantryQty = (stateRef.current.pantry || []).reduce((s, p) => s + (p.qty || 0), 0);
        if (totalPantryQty <= 2 && totalPantryQty >= 0) {
            const hasSpouse = stateRef.current.dependents.some(d => d.type === 'spouse');
            const hasKids = stateRef.current.dependents.some(d => d.type === 'child');
            let message = totalPantryQty === 0
                ? 'Your pantry is completely empty. Your health will drain faster without food. Buy groceries from the Shop.'
                : `Only ${totalPantryQty} item${totalPantryQty === 1 ? '' : 's'} left in the pantry. Stock up from the Shop to keep health topped up.`;

            if (hasSpouse && hasKids) {
                const spouse = stateRef.current.dependents.find(d => d.type === 'spouse');
                message = totalPantryQty === 0
                    ? `"The pantry is completely empty! You don't need to feed me, but we need food for the kids. Please buy groceries from the Shop!" — ${spouse.name}`
                    : `"We only have ${totalPantryQty} item${totalPantryQty === 1 ? '' : 's'} left in the pantry! I can take care of myself, but we need food for the kids. Stock up from the Shop!" — ${spouse.name}`;
            }

            const pantryEntry = {
                id: `low_pantry_${totalMonthsPlayed}`, name: '🥘 Stock Up On Food!',
                message,
                category: 'crisis', impact: 0, month: totalMonthsPlayed, read: false,
            };
            setEventInbox(prev => {
                // Don't spam — only add if last pantry warning was >3 months ago
                const lastWarn = prev.find(e => e.id?.startsWith('low_pantry_'));
                const lastWarnMonth = lastWarn ? parseInt(lastWarn.id.replace('low_pantry_', '')) : -99;
                if (totalMonthsPlayed - lastWarnMonth < 3) return prev;
                return [pantryEntry, ...prev].slice(0, 50);
            });
        }

        // ── HEALTH DRAIN & SICK LEAVE ──────────────────────────────────────────
        const currentHealth = stateRef.current.health ?? 80;
        const newHealth = Math.max(0, currentHealth - MONTHLY_HEALTH_DRAIN);
        setHealth(newHealth);

        if (newHealth < 5) {
            // Severe consequence: Hospitalization
            const covered = (activeInsurance || []).some(i => i.planId && i.planId.includes('health'));
            const bill = covered ? 10000 : 150000 + Math.floor(Math.random() * 50000);
            
            setHealth(30); // Restore to 30 to prevent immediate re-hospitalization next month
            decisionsToQueue.push({
                id: `hospital_${totalMonthsPlayed}`,
                name: 'HOSPITALIZED!',
                emoji: '🏥',
                category: 'dilemma',
                isHospital: true,
                message: covered
                    ? 'You collapsed from exhaustion. Insurance covered most of it.'
                    : 'You collapsed from exhaustion and malnutrition.',
                bill,
                choices: [
                    { label: 'Pay Bill', color: '#f87171', effect: { type: 'cash_spend', amount: bill, msg: 'Paid hospital bill. Buy groceries to stay healthy!' } }
                ]
            });
            setIsPlaying(false);
        } else if (newHealth < CRITICAL_HEALTH_THRESHOLD && currentJob) {
            // Forced sick leave — lose half salary this month
            const sickPenalty = Math.round(currentJob.salary * 0.5);
            setSickLeaveMonths(prev => prev + 1);
            decisionsToQueue.push({
                id: `sick_leave_${totalMonthsPlayed}`,
                name: 'SICK LEAVE',
                emoji: '🤒',
                category: 'dilemma',
                isHospital: true,
                message: `Health at ${Math.round(newHealth)}/100. You had to take sick leave this month.`,
                bill: sickPenalty,
                choices: [
                    { label: 'Take Rest', color: '#fbbf24', effect: { type: 'cash_spend', amount: sickPenalty, msg: 'Recovered slightly. Buy groceries to stay healthy!' } }
                ]
            });
            setIsPlaying(false);
        } else if (newHealth < SICK_LEAVE_THRESHOLD && currentJob) {
            setSickLeaveMonths(prev => prev + 1);
        } else {
            setSickLeaveMonths(0);
        }

        // Track monthly expenses for emergency fund calc
        setMonthlyExpenses(totalExpenses || 20000);

        setLastMonthTax(monthlyTax);
        setLastMonthEMI(totalEMI);
        setLastMonthFlow({ amount: netFlow, income: totalIncome, expenses: totalExpenses });

        // Monthly recap for UI
        setMonthlyRecap({
            month: turn.month, year: turn.year,
            income: { salary: effectiveSalary, rental: realEstateIncome, spouse: spouseIncome, dividend: dividendIncome },
            expenses: { housing: housingCost, maintenance: investmentMaintenance, living: livingCosts, emi: totalEMI, insurance: insurancePremiums, tax: monthlyTax, tuition: tuitionCost, sip: totalSIPDeducted },
            netFlow, happinessDelta,
        });

        // Net worth history
        if (totalMonthsPlayed % 6 === 0) {
            setNetWorthHistory(prev => [...prev, { month: totalMonthsPlayed, value: balance + netFlow + getStockValue() + getMFValue() + getRealEstateValue() + ppf.balance + nps.balance }]);
        }

        // Education progress
        if (activeEnrollment) {
            if (activeEnrollment.monthsRemaining <= 1) {
                setDegrees(prev => [...prev, activeEnrollment.courseName]);
                addHistory(`Graduated: ${activeEnrollment.courseName}!`, 0, 'info');
                setActiveEnrollment(null);
            } else {
                setActiveEnrollment(prev => prev ? { ...prev, monthsRemaining: prev.monthsRemaining - 1 } : null);
            }
        }

        // Loan processing
        setLoans(prev => prev.map(loan => {
            const interestPortion = loan.remainingPrincipal * loan.monthlyRate;
            const principalPortion = loan.emi - interestPortion;
            const newRemaining = Math.max(0, loan.remainingPrincipal - principalPortion);
            const newTenure = loan.tenureRemaining - 1;
            if (newRemaining <= 0 || newTenure <= 0) return null;
            return { ...loan, remainingPrincipal: newRemaining, tenureRemaining: newTenure };
        }).filter(Boolean));

        // Missed EMI check — drop CIBIL and cascade to higher future loan rates
        if (balance + netFlow < 0 && totalEMI > 0) {
            const prevScore = creditScore;
            const newScore = Math.max(300, prevScore - 30);
            setCreditScore(newScore);
            setLoans(prev => prev.map(l => ({ ...l, missedPayments: l.missedPayments + 1 })));
            // Cascade notification — player needs to see the consequence
            const cascadeEntry = {
                id: `cibil_drop_${Date.now()}`, name: 'CIBIL Score Dropped',
                message: `Missed EMI this month. CIBIL: ${prevScore} → ${newScore}. Future loans will cost ${newScore < 650 ? '1.5–3%' : '0.5%'} more in interest. Pay EMIs on time to recover.`,
                category: 'crisis', impact: 0, month: totalMonthsPlayed, read: false,
            };
            setEventInbox(prev => [cascadeEntry, ...prev].slice(0, 50));
            if (newScore < 600 && prevScore >= 600) {
                // Crossed below 600 — major warning
                setLastCrisisEvent({ ...cascadeEntry, name: 'CIBIL Below 600 — Loan Access At Risk', message: `Your CIBIL score dropped to ${newScore}. Banks may reject your loan applications. You need 3+ months of on-time payments to recover. This is the debt spiral — break it now.` });
                setIsPlaying(false);
            }
        } else if (totalEMI > 0) {
            setCreditScore(prev => Math.min(900, prev + 2));
        }

        // Loan default (3 missed)
        setLoans(prev => {
            const defaulted = prev.filter(l => l.missedPayments >= 3);
            if (defaulted.length > 0) {
                defaulted.forEach(l => {
                    if (l.linkedAsset) {
                        setProperties(p => p.filter(id => id !== l.linkedAsset));
                        if (currentHousing.id === l.linkedAsset) {
                            setCurrentHousing({ id: 'hostel', name: 'Hostel Shared Room', maintenance: HOSTEL_MAINTENANCE, category: 'rental', image: require('../../assets/rooms/hostel.png') });
                        }
                        addHistory(`LOAN DEFAULT: ${l.linkedAsset} seized by bank!`, 0, 'expense');
                    }
                });
            }
            return prev.filter(l => l.missedPayments < 3);
        });

        // Expecting Child logic
        if (expectingChild) {
            const activeDeps = dependents.filter(d => d.custody !== 'ex');
            if (expectingChild.remaining <= 1) {
                // Baby is born!
                const totalPeople = activeDeps.length + 2; // Player + active dependents + 1 new baby
                const capacity = currentHousing.capacity || 2;
                
                let emergencyMoveMsg = '';
                if (totalPeople > capacity) {
                    // Emergency move!
                    const eligibleHouses = REAL_ESTATE.filter(p => p.category === 'residential' && (p.capacity || 0) >= totalPeople);
                    if (eligibleHouses.length > 0) {
                        eligibleHouses.sort((a, b) => (a.rental_income || a.maintenance || 0) - (b.rental_income || b.maintenance || 0));
                        const newHousing = eligibleHouses[0];
                        const penalty = 50000 + (newHousing.rental_income || newHousing.maintenance || 0);
                        setCurrentHousing(newHousing);
                        setBalance(prev => prev - penalty);
                        emergencyMoveMsg = `\n\n🚨 EMERGENCY MOVE: Your house was too small for the baby! You were forced to move to a ${newHousing.name}, costing ₹${penalty.toLocaleString()} in last-minute moving fees and deposits.`;
                    }
                }
                
                // Resolve baby name dynamically if empty
                const finalChildName = expectingChild.name || (expectingChild.gender === 'female' 
                    ? INDIAN_FEMALE_NAMES[Math.floor(Math.random() * INDIAN_FEMALE_NAMES.length)]
                    : INDIAN_MALE_NAMES[Math.floor(Math.random() * INDIAN_MALE_NAMES.length)]);

                // Add the child (with custody undefined initially)
                setDependents(prev => [...prev, {
                    id: `dep_child_${Date.now()}`,
                    type: 'child',
                    name: finalChildName,
                    gender: expectingChild.gender,
                    ageMonths: 0,
                    childAgeMonths: 0,
                    health: 100,
                    schoolTier: 'none',
                    preschoolTier: 'none',
                    hobby: 'none',
                    spouseId: expectingChild.spouseId,
                    bdayMonth: turn.month,
                    monthAdded: totalMonthsPlayed,
                }]);
                setExpectingChild(null);
                
                // If divorced from the child's other parent, trigger Custody Dilemma for the newborn
                const currentSpouse = dependents.find(d => d.type === 'spouse');
                const isExSpouseChild = !currentSpouse || currentSpouse.id !== expectingChild.spouseId;

                if (isExSpouseChild) {
                    decisionsToQueue.push({
                        id: `custody_dilemma_newborn_${totalMonthsPlayed}`,
                        name: 'Custody Dilemma',
                        emoji: '⚖️',
                        category: 'dilemma',
                        message: `With the divorce from your ex-spouse finalized, you must decide who keeps custody of the newborn baby, ${finalChildName}. If you let your ex-spouse take custody, you will pay ₹10,000/mo in child support.`,
                        choices: [
                            { label: 'Keep Custody (Full Expenses)', color: '#4ade80', effect: { type: 'custody_keep', msg: `You kept custody of your newborn, ${finalChildName}. Full living and education costs apply.` } },
                            { label: 'Ex Takes Custody (₹10k/mo child support)', color: '#f87171', effect: { type: 'custody_ex_spouse', msg: `Your ex-spouse has taken custody of the newborn, ${finalChildName}. You will pay ₹10,000/mo in support payments.` } }
                        ]
                    });
                }

                decisionsToQueue.push({
                    id: `child_born_${totalMonthsPlayed}`,
                    name: 'A New Life! 🍼',
                    isBaby: true,
                    gender: expectingChild.gender,
                    message: `${finalChildName} is finally here! A healthy baby ${expectingChild.gender.toLowerCase()} has joined your family. Your life will never be the same.${emergencyMoveMsg}`,
                    category: emergencyMoveMsg ? 'crisis' : 'positive',
                    choices: [{ label: 'Welcome to the world!', color: '#4ade80', effect: { type: 'none' } }],
                    image: expectingChild.gender === 'Female' ? require('../../assets/ui_comp/welcomebabygirl.png') : require('../../assets/ui_comp/welcomebabyboy.png')
                });
            } else {
                const remaining = expectingChild.remaining - 1;
                setExpectingChild({ ...expectingChild, remaining });

                const totalPeople = activeDeps.length + 2; // Player + active dependents + 1 new baby
                const capacity = currentHousing.capacity || 2;
                if (capacity < totalPeople) {
                    const capacityWarning = {
                        id: `housing_warning_${totalMonthsPlayed}`, name: 'Housing Alert',
                        message: (
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#c8d4f0', lineHeight: 28 }}>
                                Your baby is arriving in {remaining} months!{"\n\n"}
                                Your current house ({currentHousing.name}) has a capacity of {capacity}, but you will need capacity for {totalPeople}. Please buy or rent a bigger house from the Shop <Image source={require('../../assets/ui_comp/forsale.png')} style={{width: 24, height: 24}} resizeMode="contain" /> to avoid massive emergency moving fees.
                            </Text>
                        ),
                        category: 'crisis', impact: 0, month: totalMonthsPlayed, read: false,
                        image: require('../../assets/ui_comp/home.png')
                    };
                    setEventInbox(prev => {
                        if (prev.some(e => e.id === capacityWarning.id)) return prev;
                        return [capacityWarning, ...prev].slice(0, 50);
                    });
                    setLastCrisisEvent(capacityWarning);
                    setIsPlaying(false);
                }
            }
        }

        // Age children + decay dependent health each month
        const nextDependents = [];
        let setGamePaused = false;
        // Declared here so they're in scope for both dependents.forEach and activeEffects.forEach below
        let newInboxEvents = [];
        let latestCrisis = null;
        let lostFreelanceJob = false;
        let balanceDelta = 0;
        const nextEffects = [];

        dependents.forEach(d => {
            if (d.isDead) {
                nextDependents.push(d);
                return;
            }
            if (d.type === 'child') {
                const newHealth = Math.max(0, (d.health ?? 80) - 7);
                if (newHealth <= 0) {
                    const deathEntry = {
                        id: `child_death_${d.id}_${Date.now()}`, name: 'Tragic Loss',
                        message: `Your child, ${d.name}, has tragically passed away from neglect. The grief is devastating. Funeral costs ₹30,000. This will be on your record.`,
                        category: 'crisis', impact: -30000, month: totalMonthsPlayed, read: false,
                        image: require('../../assets/ui_comp/gravestone.png')
                    };
                    newInboxEvents.push(deathEntry);
                    latestCrisis = deathEntry;
                    setBalance(prev => Math.max(0, prev - 30000)); // funeral cost
                    setHappiness(prev => Math.max(0, prev - 80));
                    setHealth(prev => Math.max(0, prev - 15)); // grief takes physical toll
                    setCreditScore(prev => Math.max(300, prev - 50)); // social stigma hits credit/reputation
                    setGamePaused = true;
                    nextDependents.push({ ...d, health: 0, isDead: true });
                    return;
                }
                // Warning: child health critical — will die within 1-3 months
                if (newHealth <= 21 && newHealth > 0 && !d.healthWarnedAt) {
                    const warnEntry = {
                        id: `child_health_warn_${d.id}_${totalMonthsPlayed}`,
                        name: `⚠️ ${d.name}'s Health Is Critical!`,
                        message: `${d.name}'s health has dropped to ${Math.round(newHealth)}/100. Without proper nutrition they will not survive much longer. Buy groceries immediately!`,
                        category: 'crisis', impact: 0, month: totalMonthsPlayed, read: false,
                        image: require('../../assets/ui_comp/healthicon.png'),
                    };
                    newInboxEvents.push(warnEntry);
                    latestCrisis = warnEntry;
                    setGamePaused = true;
                    // mark warned so this only fires once per near-death episode
                    nextDependents.push({ ...d, childAgeMonths: (d.childAgeMonths || 0) + 3, health: newHealth, healthWarnedAt: totalMonthsPlayed });
                    return; // skip duplicate push below
                }
                const prevAge = d.childAgeMonths || 0;
                const newAge = prevAge + CHILD_AGING_RATE;
                const newAge = prevAge + CHILD_AGING_RATE;
                // Child turns 18 (216 child-months) — fire career outcome event
                if (prevAge < 216 && newAge >= 216 && !d.careerOutcome) {
                    const nw = stateRef.current.balance || 0;
                    const tier = d.schoolTier || 'government';
                    const preTier = d.preschoolTier || 'home';
                    // Education tiers boost effective networth for career outcomes
                    const tierBoost    = tier === 'international' ? 5000000 : tier === 'private' ? 1500000 : 0;
                    const preTierBoost = preTier === 'montessori' ? 1000000 : preTier === 'playschool' ? 300000 : 0;
                    const effectiveNw = nw + tierBoost + preTierBoost;
                    let outcome, careerName, careerIncome;
                    if (effectiveNw > 10000000) { outcome = 'elite'; careerName = 'IIT/IIM Graduate'; careerIncome = 150000; }
                    else if (effectiveNw > 3000000) { outcome = 'professional'; careerName = 'Professional (Engineer/Doctor)'; careerIncome = 80000; }
                    else if (effectiveNw > 800000) { outcome = 'graduate'; careerName = 'College Graduate'; careerIncome = 35000; }
                    else { outcome = 'vocational'; careerName = 'Skilled Trades'; careerIncome = 20000; }
                    const childEntry = {
                        id: `child_adult_${d.id}`, name: `${d.name} Turns 18!`,
                        message: `${d.name} has grown up! Based on the opportunities you provided, they pursued ${careerName} and will earn ₹${careerIncome.toLocaleString()}/mo. They'll be independent from next month — no more child expenses.`,
                        category: 'positive', impact: 0, month: totalMonthsPlayed, read: false,
                    };
                    newInboxEvents.push(childEntry);
                    latestCrisis = childEntry;
                    setGamePaused = true;
                    nextDependents.push({ ...d, childAgeMonths: newAge, health: newHealth, careerOutcome: outcome, careerName, careerIncome });
                    return;
                }
                nextDependents.push({ ...d, childAgeMonths: newAge, health: newHealth });
                return;
            }
            if (d.type === 'parent') {
                const decay = d.caretaker ? 4 : 10;
                const newHealth = Math.max(0, (d.health ?? 70) - decay);
                if (newHealth <= 0) {
                    const deathEntry = {
                        id: `parent_death_${d.id}_${Date.now()}`, name: 'Loss of a Parent',
                        message: `Your parent, ${d.name}, has passed away. The funeral costs ₹50,000 and your grief will weigh on you for months.`,
                        category: 'crisis', impact: -50000, month: totalMonthsPlayed, read: false,
                        image: require('../../assets/ui_comp/gravestone.png')
                    };
                    newInboxEvents.push(deathEntry);
                    latestCrisis = deathEntry;
                    setBalance(prev => Math.max(0, prev - 50000)); // funeral cost
                    setHappiness(prev => Math.max(0, prev - 60));
                    setHealth(prev => Math.max(0, prev - 10)); // grief affects player health
                    setGamePaused = true;
                    nextDependents.push({ ...d, health: 0, isDead: true });
                    return;
                }
                // Warning: parent health critical — will die within 1-2 months
                if (newHealth <= (decay * 2) && newHealth > 0 && !d.healthWarnedAt) {
                    const warnEntry = {
                        id: `parent_health_warn_${d.id}_${totalMonthsPlayed}`,
                        name: `⚠️ ${d.name} Needs Urgent Care!`,
                        message: `${d.name}'s health has deteriorated to ${Math.round(newHealth)}/100. ${d.caretaker ? 'Even with a caretaker, they' : 'Without a caretaker, they'} may not survive much longer. Consider buying them a caretaker from the Family tab.`,
                        category: 'crisis', impact: 0, month: totalMonthsPlayed, read: false,
                        image: require('../../assets/ui_comp/healthicon.png'),
                    };
                    newInboxEvents.push(warnEntry);
                    latestCrisis = warnEntry;
                    setGamePaused = true;
                    nextDependents.push({ ...d, health: newHealth, healthWarnedAt: totalMonthsPlayed });
                    return;
                }
                nextDependents.push({ ...d, health: newHealth });
                return;
            }
            if (d.type === 'spouse' && d.upskilling) {
                const left = (d.upskillingMonthsLeft || 1) - 1;
                if (left <= 0) {
                    const newIncome = 25000 + Math.floor(Math.random() * 20000);
                    nextDependents.push({ ...d, upskilling: false, upskillingMonthsLeft: 0, isWorking: true, income: newIncome });
                    return;
                }
                nextDependents.push({ ...d, upskillingMonthsLeft: left });
                return;
            }
            // Spouse career progression — salary raise every 36 months
            if (d.type === 'spouse' && d.isWorking && !d.upskilling) {
                const monthsSinceRaise = totalMonthsPlayed - (d.lastRaiseMonth ?? d.monthAdded ?? 0);
                if (monthsSinceRaise >= 36) {
                    const raiseRate = 0.04 + Math.random() * 0.06; // 4–10%
                    const newIncome = Math.round((d.income || 0) * (1 + raiseRate));
                    const raiseEntry = {
                        id: `spouse_raise_${totalMonthsPlayed}`, name: `${d.name} Got a Raise!`,
                        message: `${d.name}'s career is growing — ${Math.round(raiseRate * 100)}% salary increase. New income: ₹${newIncome.toLocaleString()}/mo.`,
                        category: 'positive', impact: (newIncome - (d.income || 0)) * 12, month: totalMonthsPlayed, read: false,
                    };
                    newInboxEvents.push(raiseEntry);
                    nextDependents.push({ ...d, income: newIncome, lastRaiseMonth: totalMonthsPlayed });
                    return;
                }
            }
            nextDependents.push(d);
        });

        // Merge nextDependents with prev state to prevent overwriting new children added during nextMonth
        setDependents(prev => prev.map(p => {
            const aged = nextDependents.find(n => n.id === p.id);
            if (aged) return { ...p, ...aged };
            return p;
        }));
        if (happinessDelta !== 0) {
            setHappiness(prev => Math.max(0, Math.min(100, prev + happinessDelta)));
        }
        if (setGamePaused) {
            setIsPlaying(false);
        }

        // Family demand events — random every 2-4 months
        if (!pendingFamilyDemand && dependents.length > 0 && Math.random() < 0.35) {
            const state = { dependents, balance, totalMonthsPlayed };
            const eligible = FAMILY_DEMANDS.filter(d => {
                const lastFired = demandCooldowns[d.id] || 0;
                return totalMonthsPlayed - lastFired >= d.cooldown && d.condition(state);
            });
            if (eligible.length > 0) {
                const demand = eligible[Math.floor(Math.random() * eligible.length)];
                const dep = dependents.find(d => d.type === demand.character && d.custody !== 'ex');
                if (dep) {
                    setPendingFamilyDemand({ demand, dep });
                }
            }
        }

        // Credit Card popup offer
        if (!activeCreditCards.includes('standard') && !activeCreditCards.includes('premium') && creditScore >= 600 && Math.random() < 0.10) {
            setPendingCreditCardOffer(true);
        }

        // Reset PPF yearly contributions counter every 12 months
        if (totalMonthsPlayed % 12 === 11) {
            setPpf(prev => ({ ...prev, contributionsThisYear: 0 }));
            setNps(prev => ({ ...prev, contributionsThisYear: 0 }));
        }

        // PPF interest (7.1% annual, monthly compounding)
        if (ppf.balance > 0) {
            const monthlyRate = PPF_ANNUAL_RATE / 12;
            setPpf(prev => ({ ...prev, balance: Math.round(prev.balance * (1 + monthlyRate)) }));
        }

        // NPS returns (8-14% annual depending on equity %, market cycle)
        if (nps.balance > 0) {
            const baseReturn = 0.08;
            const equityBonus = (nps.equityPct / 100) * 0.06;
            const cycleAdj = marketCycle.phase === 'bull' ? 0.01 : marketCycle.phase === 'bear' ? -0.005 : 0;
            const monthlyReturn = (baseReturn + equityBonus + cycleAdj) / 12;
            setNps(prev => ({ ...prev, balance: Math.round(prev.balance * (1 + monthlyReturn)) }));
        }

        // FD monthly interest accrual
        setFixedDeposits(prev => prev.map(fd => {
            if (fd.monthsLeft <= 0) return fd;
            const monthlyRate = fd.rate / 12;
            return { ...fd, currentValue: Math.round(fd.currentValue * (1 + monthlyRate)), monthsLeft: fd.monthsLeft - 1 };
        }));

        // Gold price fluctuation (avg ~8% p.a., 2% monthly volatility, market-cycle influenced)
        setGoldPrice(prev => {
            const trendPerMonth = 0.08 / 12; // 8% annual trend
            const volatility = 0.02;
            const randomChange = (Math.random() * volatility * 2) - volatility;
            // Gold is counter-cyclical: rises in bear markets
            const cycleEffect = marketCycle.phase === 'bear' ? 0.005 : marketCycle.phase === 'bull' ? -0.002 : 0;
            return Math.round(prev * (1 + trendPerMonth + randomChange + cycleEffect));
        });

        // SGB interest (2.5% p.a. on original issue price, paid semi-annually)
        if (totalMonthsPlayed > 0 && totalMonthsPlayed % 6 === 0) {
            const sgbHolding = goldHoldings['sgb'];
            if (sgbHolding && sgbHolding.grams > 0) {
                const issuePrice = sgbHolding.avgBuyPrice || goldPrice;
                const semiAnnualInterest = Math.round(sgbHolding.grams * issuePrice * 0.025 / 2);
                if (semiAnnualInterest > 0) {
                    setBalance(prev => prev + semiAnnualInterest);
                    setGoldHoldings(prev => ({ ...prev, sgb: { ...prev.sgb, interestAccrued: (prev.sgb?.interestAccrued || 0) + semiAnnualInterest } }));
                    addHistory(`SGB interest (2.5% p.a.)`, semiAnnualInterest, 'income');
                }
            }
        }

        // Credit card monthly reconciliation
        if (creditCard && creditCard.balance > 0) {
            const monthsOverdue = totalMonthsPlayed - creditCard.dueMonth;
            if (monthsOverdue >= 0) {
                // Interest at 3% per month (36% APR)
                const monthlyInterest = Math.round(creditCard.balance * (creditCard.apr / 12));
                setCreditCard(prev => ({ ...prev, balance: prev.balance + monthlyInterest, dueMonth: totalMonthsPlayed + 1 }));
                setCreditScore(prev => Math.max(300, prev - 15));
                const cardEntry = {
                    id: `card_interest_${totalMonthsPlayed}`, name: 'Credit Card Interest',
                    message: `Unpaid credit card bill of ₹${creditCard.balance.toLocaleString()} accrued ₹${monthlyInterest.toLocaleString()} in interest (36% APR). Pay immediately to stop the spiral. CIBIL score dropped.`,
                    category: 'crisis', impact: -monthlyInterest, month: totalMonthsPlayed, read: false,
                };
                setEventInbox(prev => [cardEntry, ...prev].slice(0, 50));
                setLastCrisisEvent(cardEntry);
                setIsPlaying(false);
            }
        }

        // Market Cycle update
        setMarketCycle(prev => {
            const newMonthsLeft = prev.monthsLeft - 1;
            if (newMonthsLeft <= 0) {
                const rand = Math.random();
                let newPhase, duration;
                if (rand < 0.45) { newPhase = 'bull'; duration = 18 + Math.floor(Math.random() * 18); }
                else if (rand < 0.75) { newPhase = 'bear'; duration = 6 + Math.floor(Math.random() * 12); }
                else { newPhase = 'sideways'; duration = 6 + Math.floor(Math.random() * 6); }
                return { phase: newPhase, monthsLeft: duration };
            }
            return { ...prev, monthsLeft: newMonthsLeft };
        });

        // Fluctuate Stock Prices — sector-correlated Gaussian walk with mean reversion
        const cycleEffect = marketCycle.phase === 'bull' ? 0.008 : marketCycle.phase === 'bear' ? -0.007 : 0;
        // One sector shock per sector per month (stocks within a sector move together)
        const sectorShocks = {};
        Object.keys(STOCK_SECTORS).forEach(sec => {
            sectorShocks[sec] = (Math.random() * 0.04) - 0.02; // ±2% sector swing
        });
        setMarketPrices(prevPrices => {
            const newPrices = {};
            STOCKS.forEach(stock => {
                const currentPrice = prevPrices[stock.id] || stock.price;
                const vol = (stock.volatility || 0.05) * 0.5; // monthly vol ≈ annual/sqrt(12) but scaled
                // Box-Muller Gaussian
                const u1 = Math.max(1e-10, Math.random()), u2 = Math.random();
                const gauss = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                const stockNoise = gauss * vol;
                // Sector correlation (60% weight on sector, 40% idiosyncratic)
                const sectorBias = (sectorShocks[stock.sector] || 0) * 0.6;
                // Mild mean reversion — pull back if price drifts >3x or <0.2x of base
                const basePrice = stock.price;
                const ratio = currentPrice / basePrice;
                const reversion = ratio > 3 ? -0.015 : ratio < 0.2 ? 0.015 : 0;
                const totalChange = cycleEffect + sectorBias + stockNoise * 0.4 + reversion;
                let price = currentPrice * (1 + totalChange);
                if (price < 1) price = 1;
                newPrices[stock.id] = price;
            });
            return newPrices;
        });

        // Track price history (last 12 data points per stock)
        setPriceHistory(prev => {
            const next = { ...prev };
            STOCKS.forEach(stock => {
                const arr = next[stock.id] || [];
                next[stock.id] = [...arr, marketPrices[stock.id] || stock.price].slice(-12);
            });
            return next;
        });

        // Update MF NAVs
        setMfNavs(prevNavs => {
            const newNavs = {};
            MUTUAL_FUNDS.forEach(mf => {
                const currentNav = prevNavs[mf.id] || mf.nav;
                const randomChange = (Math.random() * mf.volatility * 2) - mf.volatility;
                const mfBonus = (trait.mfReturnBonus || 0) / 12;
                let nav = currentNav * (1 + randomChange + cycleEffect * 0.8 + mfBonus);
                if (nav < 1) nav = 1;
                newNavs[mf.id] = nav;
            });
            return newNavs;
        });

        // Decay effects and apply decision-based consequences
        // (newInboxEvents, latestCrisis, lostFreelanceJob, balanceDelta, nextEffects declared above)

        activeEffects.forEach(effect => {
            const nextRemaining = effect.remainingMonths - 1;

            if (effect.type === 'recurring_expense') {
                if (effect.monthlyAmount) {
                    balanceDelta -= effect.monthlyAmount;
                    addHistory(effect.description || 'Recurring payment', -effect.monthlyAmount, 'expense');
                }
                if (nextRemaining > 0) {
                    nextEffects.push({ ...effect, remainingMonths: nextRemaining });
                }
                return;
            }

            if (effect.type === 'passive_income_project') {
                if (nextRemaining <= 0) {
                    const success = Math.random() < (effect.chance ?? 0.5);
                    const amount = Math.round(Math.random() * (effect.maxAmount || 80000));
                    if (success && amount > 0) {
                        balanceDelta += amount;
                        const e = { id: `passive_income_success_${Date.now()}`, name: 'Passive Income', message: effect.msg || 'Your side project paid off!', category: 'positive', impact: amount, month: totalMonthsPlayed, read: false };
                        newInboxEvents.push(e);
                        latestCrisis = e;
                    } else {
                        const e = { id: `passive_income_fail_${Date.now()}`, name: 'Passive Income Failed', message: 'Your side project did not generate revenue this time.', category: 'crisis', impact: 0, month: totalMonthsPlayed, read: false };
                        newInboxEvents.push(e);
                        latestCrisis = e;
                    }
                    return;
                }
                nextEffects.push({ ...effect, remainingMonths: nextRemaining });
                return;
            }

            if (effect.type === 'freelance_contract') {
                let nextEffect = { ...effect, remainingMonths: nextRemaining };
                if (!effect.riskChecked && effect.remainingMonths === effect.initialMonths) {
                    const survived = Math.random() >= (effect.risk ?? 0.25);
                    if (!survived) {
                        lostFreelanceJob = true;
                        const e = { id: `freelance_fail_${Date.now()}`, name: 'Freelance Client Lost', message: 'Client backed out after month 1. You lost your job for nothing.', category: 'crisis', impact: 0, month: totalMonthsPlayed, read: false };
                        newInboxEvents.push(e);
                        latestCrisis = e;
                        return;
                    }
                    nextEffect = { ...nextEffect, riskChecked: true };
                }
                if (nextRemaining <= 0) {
                    lostFreelanceJob = true;
                    if (effect.totalPayout > 0) {
                        balanceDelta += effect.totalPayout;
                    }
                    const e = { id: `freelance_success_${Date.now()}`, name: 'Freelance Success', message: `Your freelance project completed and paid ₹${(effect.totalPayout || 0).toLocaleString()}!`, category: 'positive', impact: effect.totalPayout || 0, month: totalMonthsPlayed, read: false };
                    newInboxEvents.push(e);
                    latestCrisis = e;
                    return;
                }
                nextEffects.push(nextEffect);
                return;
            }

            if (nextRemaining > 0) {
                nextEffects.push({ ...effect, remainingMonths: nextRemaining });
            }
        });

        setActiveEffects(nextEffects);
        if (balanceDelta !== 0) setBalance(prev => prev + balanceDelta);
        if (lostFreelanceJob) setCurrentJob(prev => (prev && prev.isFreelance ? null : prev));
        if (newInboxEvents.length > 0) {
            setEventInbox(prev => [...newInboxEvents, ...prev].slice(0, 50));
        }
        if (latestCrisis) setLastCrisisEvent(latestCrisis);

        // History log
        setHistory(prev => {
            const newHistory = [...prev, {
                date: `${turn.month}/${turn.year}`,
                description: 'Monthly Summary',
                amount: netFlow,
                details: { income: totalIncome, expenses: totalExpenses, tax: monthlyTax, emi: totalEMI, insurance: insurancePremiums },
                type: netFlow >= 0 ? 'income' : 'expense',
            }];
            if (newHistory.length > 50) return newHistory.slice(-50);
            return newHistory;
        });

        // Time advance
        setTurn(prev => {
            let m = prev.month + 1;
            let y = prev.year;
            if (m > 12) { m = 1; y++; }
            return { month: m, year: y };
        });
        setTotalMonthsPlayed(prev => prev + 1);

        // Stock news (18% chance) — fires news event and directly shocks affected stocks
        if (Math.random() < 0.18) {
            const newsTemplates = [
                // RBI / Macro
                { headline: 'RBI holds repo rate at 6.5% — markets cheer steady stance', sector: 'Banking', trend: 0.025 },
                { headline: 'RBI cuts repo rate 25bps — banking and NBFC stocks rally', sector: 'Banking', trend: 0.04 },
                { headline: 'RBI raises rates to curb inflation — rate-sensitives fall', sector: 'Banking', trend: -0.035 },
                { headline: 'India CPI eases to 4.1% — Nifty gains on rate-cut hopes', sector: 'MARKET', trend: 0.025 },
                { headline: 'Rupee hits record low vs USD — IT export earnings boost', sector: 'IT', trend: 0.03 },
                { headline: 'Rupee strengthens — IT sector margin pressure rises', sector: 'IT', trend: -0.02 },
                // IT
                { headline: 'TCS, Infosys report strong Q2 on AI deal wins', sector: 'IT', trend: 0.05 },
                { headline: 'US recession fears — IT outsourcing spend under pressure', sector: 'IT', trend: -0.04 },
                { headline: 'Wipro wins ₹5,000 Cr multi-year cloud deal', sector: 'IT', trend: 0.06 },
                { headline: 'HCL Tech raises FY26 revenue guidance on strong order book', sector: 'IT', trend: 0.04 },
                // Banking
                { headline: 'Banking NPAs at decade low — sector re-rates sharply higher', sector: 'Banking', trend: 0.05 },
                { headline: 'HDFC Bank Q3 PAT up 18% — analyst upgrades flow in', sector: 'Banking', trend: 0.04 },
                { headline: 'SBI reports record profit on improved asset quality', sector: 'Banking', trend: 0.05 },
                { headline: 'SEBI tightens F&O rules — retail traders pull back', sector: 'MARKET', trend: -0.015 },
                { headline: 'Bajaj Finance surpasses 90M customer milestone', sector: 'NBFC', trend: 0.05 },
                { headline: 'Credit card defaults rising — NBFC stocks under pressure', sector: 'NBFC', trend: -0.04 },
                // Energy / Infra
                { headline: 'Crude oil spikes to $95 — inflation concerns surface', sector: 'MARKET', trend: -0.025 },
                { headline: 'Reliance Jio announces 5G rollout in 400 cities', sector: 'Energy', trend: 0.06 },
                { headline: 'Govt ₹10L Cr infra push — L&T bags massive contracts', sector: 'Infra', trend: 0.07 },
                { headline: 'Adani short-seller report resurfaces — stocks plunge', sector: 'Energy', trend: -0.09 },
                { headline: 'Solar tariff policy change boosts Adani Green, Tata Power', sector: 'Energy', trend: 0.05 },
                // Auto
                { headline: 'EV sales cross 2L units — Tata Motors leads the charge', sector: 'Auto', trend: 0.07 },
                { headline: 'Maruti Suzuki records highest-ever monthly bookings', sector: 'Auto', trend: 0.05 },
                { headline: 'Semiconductor shortage disrupts auto production schedules', sector: 'Auto', trend: -0.04 },
                // Pharma / FMCG
                { headline: 'Sun Pharma gets US FDA nod for blockbuster oncology drug', sector: 'Pharma', trend: 0.08 },
                { headline: 'ITC Hotels demerger complete — value unlocking rally', sector: 'FMCG', trend: 0.06 },
                { headline: 'Good monsoon forecast lifts FMCG rural demand outlook', sector: 'FMCG', trend: 0.04 },
                { headline: 'HUL faces margin pressure from palm oil price surge', sector: 'FMCG', trend: -0.03 },
                // Consumer
                { headline: 'DMart Q4 revenue up 22% on festive and quick-commerce surge', sector: 'Consumer', trend: 0.05 },
                { headline: 'Titan Tanishq jewellery posts record quarterly sales', sector: 'Consumer', trend: 0.05 },
                { headline: 'Indian Hotels Taj expands to 250 properties globally', sector: 'Consumer', trend: 0.04 },
                // Telecom
                { headline: 'Airtel 5G subscriber base crosses 100M milestone', sector: 'Telecom', trend: 0.06 },
                { headline: 'Jio-Airtel spectrum auction drives up capex concerns', sector: 'Telecom', trend: -0.03 },
                // Macro / Index
                { headline: 'FII inflows surge ₹30,000 Cr — Nifty hits all-time high', sector: 'MARKET', trend: 0.04 },
                { headline: 'FII selling hits ₹25,000 Cr — markets bleed red across board', sector: 'MARKET', trend: -0.05 },
                { headline: 'Union Budget: LTCG exemption raised, infra spending doubled', sector: 'MARKET', trend: 0.04 },
                { headline: 'India GDP grows 7.8% — global investors rush to Indian equities', sector: 'MARKET', trend: 0.05 },
                { headline: 'SIP inflows cross ₹25,000 Cr for 6th consecutive month', sector: 'MARKET', trend: 0.02 },
                { headline: 'Small-cap index corrects 15% — mass panic or golden opportunity?', sector: 'MARKET', trend: -0.07 },
                // Tech / High-risk
                { headline: 'Zomato turns cash-flow positive — stock jumps 11%', sector: 'Tech', trend: 0.10 },
                { headline: 'Swiggy rapid commerce beats Blinkit in monthly orders', sector: 'Tech', trend: 0.07 },
                { headline: 'Paytm loses payment gateway licence — stock crashes', sector: 'Tech', trend: -0.12 },
                // Commodity
                { headline: 'Gold at ₹82,000/10g record high — safe-haven demand spikes', sector: 'Commodity', trend: 0.05 },
                { headline: 'Global risk-off drives Gold BeES ETF inflows to 3-year high', sector: 'Commodity', trend: 0.04 },
                { headline: 'Vedanta announces ₹20/share special dividend', sector: 'Mining', trend: 0.08 },
                // Crypto
                { headline: 'Crypto regulation bill passed — BTC ETF investors cheer', sector: 'Crypto', trend: 0.12 },
                { headline: 'CBDT clarifies 30% flat tax on crypto — BTCETF volumes drop', sector: 'Crypto', trend: -0.08 },
                // IRCTC / PSU
                { headline: 'IRCTC launches Vande Bharat premium ticketing — stock +5%', sector: 'PSU', trend: 0.05 },
            ];
            const news = newsTemplates[Math.floor(Math.random() * newsTemplates.length)];
            setStockNews(prev => [{ ...news, date: `${turn.month}/${turn.year}` }, ...prev].slice(0, 25));

            // Apply news shock directly to affected stock prices
            const affectedSector = NEWS_SECTOR_MAP[news.sector] || news.sector;
            const affectedIds = affectedSector ? (STOCK_SECTORS[affectedSector] || []) : null;
            setMarketPrices(prev => {
                const next = { ...prev };
                if (affectedIds) {
                    affectedIds.forEach(id => {
                        if (next[id]) next[id] = Math.max(1, next[id] * (1 + news.trend * 0.5));
                    });
                } else {
                    // Market-wide: smaller shock to all stocks
                    STOCKS.forEach(s => {
                        if (next[s.id]) next[s.id] = Math.max(1, next[s.id] * (1 + news.trend * 0.15));
                    });
                }
                return next;
            });
        }

        // Check achievements after every tick
        const achState = {
            ...stateRef.current,
            netWorth: balance + netFlow + getStockValue() + getMFValue() + getRealEstateValue() + ppf.balance + nps.balance + getFDValue(),
            happiness: newHappiness,
            highHappinessMonths: highHappinessMonths + (newHappiness > 80 ? 1 : 0),
        };
        checkAchievements(achState);

        runCrisisEngine();

        if (decisionsToQueue.length > 0) {
            setPendingDecision(decisionsToQueue[0]);
            setPendingDecisionQueue(decisionsToQueue.slice(1));
        } else {
            setPendingDecisionQueue([]);
        }
    };

    // =========================================================================
    // HELPERS
    // =========================================================================

    const addHistory = (description, amount, type) => {
        setHistory(prev => {
            const newHistory = [...prev, { date: `${turn.month}/${turn.year}`, description, amount, type }];
            if (newHistory.length > 50) return newHistory.slice(-50);
            return newHistory;
        });
    };

    // =========================================================================
    // CONTEXT VALUE
    // =========================================================================

    const getCurrentObjective = useCallback(() => {
        if (totalMonthsPlayed === 0) {
            const hasJob = !!currentJob;
            const hasFood = (pantry || []).length > 0;
            return {
                title: 'Getting Started',
                desc: 'Complete these before advancing time.',
                steps: [
                    { id: 'job', label: 'Find a Job', icon: require('../../assets/ui_comp/career.png'), done: hasJob, action: { tab: 'career' } },
                    { id: 'food', label: 'Buy Groceries', icon: require('../../assets/ui_comp/groceryshop.png'), done: hasFood, action: { tab: 'home', subTab: 'shop' } },
                    { id: 'next', label: 'Advance to Next Month', icon: require('../../assets/ui_comp/nextbutton.png'), done: false, action: { isAdvanceTime: true } }
                ]
            };
        }
        if (totalMonthsPlayed === 1 && balance < 10000) {
            return {
                title: 'Emergency Fund',
                desc: 'Keep some cash for emergencies.',
                steps: [
                    { id: 'save', label: 'Save ₹10,000 in Bank', icon: require('../../assets/ui_comp/saveandearn.png'), done: balance >= 10000, action: { tab: 'money', subTab: 'bank' } }
                ]
            };
        }
        return null;
    }, [totalMonthsPlayed, currentJob, pantry, balance]);
    const DAILY_TURN_LIMIT = 30;
    const turnsLeftToday = () => {
        const today = new Date().toDateString();
        const { date, count } = dailyTurnsRef.current || dailyTurns;
        if (date !== today) return DAILY_TURN_LIMIT;
        return Math.max(0, DAILY_TURN_LIMIT - count);
    };

    const value = {
        // Core
        balance, netWorth, turn, history, isPlaying, setIsPlaying,
        gameSpeed, setGameSpeed,
        currentJob, pendingApplications, pendingJobInterview, setPendingJobInterview, resolveInterview, currentHousing, playerSprite, setPlayerSprite,
        playerName, setPlayerName,
        playerBirthday, setPlayerBirthday,
        degrees, portfolio, properties, marketPrices, priceHistory,
        totalMonthsPlayed, playerAge, gameOver, finalScore,
        netWorthHistory, lastMonthFlow, monthlyRecap,

        // Actions
        enrollInCourse, enrollWithLoan, dropOut, activeEnrollment,
        tradeStock, buyProperty, buyAndMoveIn, moveIn, rentProperty, applyForJob,
        checkJobRequirements, getCAAdvice, nextMonth, sellProperty,
        stockNews,

        // Mutual Funds
        mfNavs, mfPortfolio, buyMF, sellMF, getMFValue,

        // SIP
        sipPlans, addSIP, cancelSIP,

        // Retirement
        ppf, nps, contributePPF, contributeNPS,
        fixedDeposits, createFD, breakFD,

        // Gold
        goldHoldings, goldPrice, goldAssets: GOLD_ASSETS, buyGold, sellGold, getGoldValue,

        // Credit card
        creditCard, activeCreditCards, openCreditCard, chargeToCard, payCreditCardBill, closeCreditCard,

        // Financial tips
        getFinancialTips,

        // Retirement buckets
        retirementBuckets, setupRetirementBuckets,

        // Real market seeding
        fetchRealSeedPrices,

        // Market
        marketCycle,

        // Loans
        loans, creditScore, totalLoanOutstanding,
        takeLoan, prepayLoan, buyPropertyWithLoan,

        // Insurance
        activeInsurance, buyInsurance, cancelInsurance,

        // Dependents
        dependents, marry, haveChild, feedDependent, addParent, getDependentCosts, getSpouseIncome,
        upskillSpouse, divorce, giftChild, buyMedicine, toggleCaretaker, planVacation,
        buyPharmacyItem, buyClothesItem, setChildSchoolTier, setChildPreschoolTier, renameDependent,
        transferToChildSavings,
        itrSelfFiling, startSelfFiling, getRequiredITRDocs, getITRForms,
        selectITRForm, collectITRDoc, computeITRTaxFull, submitITR,
        pendingFamilyDemand, resolveFamilyDemand,

        // Crisis
        lastCrisisEvent, activeEffects, setLastCrisisEvent,
        eventInbox, markEventRead, markAllEventsRead,

        // Financial details
        lastMonthTax, lastMonthEMI,
        getInsurancePremiums, getTotalEMI, getMonthlyTax,

        // Endgame
        calculateFinalScore, startNextGeneration,
        RETIREMENT_MONTH,
        GAME_END_MONTH,

        // Retirement phase
        isRetired, pensionIncome, corpusDrawdown, bucketListDone,

        // Legacy / Dynasty Mode
        generation, childSavings, legacySummary, isLegacyMode,
        setGeneration, setChildSavings, setLegacySummary, setIsLegacyMode,

        // Career
        pendingJobOffer, setPendingJobOffer,

        // Wellbeing
        happiness, monthlyExpenses,

        // Life Decisions & Achievements
        pendingDecision, setPendingDecision, resolveDecision,
        achievements, newAchievement, setNewAchievement,
        crisisCount, highHappinessMonths,
        majorCrisisFlash,
        lastCelebrationChoice,

        // Early retirement
        retireEarly,

        // Tutorials & progressive unlocks
        seenTutorials, markTutorialSeen, getProductUnlocks,
        getCurrentObjective,

        // CA subscription
        caSubscribed, caSubscribedMonth, subscribeCA, cancelCA, itrFiled,
        CA_MONTHLY_FEE: 2000,

        // Health & Grocery
        health, pantry, sickLeaveMonths, buyGrocery, consumeFood,

        // Persistence
        saveGame, loadGame, deleteSave, saveLoaded,

        // New Mechanics
        expectingChild, setExpectingChild, timesMarried, setTimesMarried, resetGame,
        turnsLeftToday, DAILY_TURN_LIMIT, dailyTurns,
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
