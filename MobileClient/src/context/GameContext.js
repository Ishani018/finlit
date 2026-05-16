import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JOBS } from '../data/jobs';
import { EDUCATION } from '../data/education';
import { STOCKS } from '../data/stocks';
import { MUTUAL_FUNDS } from '../data/mutualFunds';
import { RESIDENTIAL_PROPERTIES, COMMERCIAL_PROPERTIES } from '../data/realEstate';
import { INSURANCE_PLANS } from '../data/insurance';
import { LOAN_TYPES, calculateEMI, getAdjustedRate } from '../data/loans';
import { calculateIncomeTax, CAPITAL_GAINS, TAX_DEDUCTIONS } from '../data/taxes';
import { CRISIS_EVENTS, CRISIS_WEIGHTS } from '../data/crisisEvents';
import { LIFE_DECISIONS, BUDGET_EVENTS } from '../data/lifeDecisions';
import { ACHIEVEMENTS, NET_WORTH_MILESTONES } from '../data/achievements';
import { GROCERY_ITEMS, MONTHLY_HEALTH_DRAIN, SICK_LEAVE_THRESHOLD, CRITICAL_HEALTH_THRESHOLD } from '../data/groceries';

const REAL_ESTATE = [...RESIDENTIAL_PROPERTIES, ...COMMERCIAL_PROPERTIES];

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
const STARTING_CREDIT_SCORE = 650;
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

    // --- DEPENDENTS ---
    const [dependents, setDependents] = useState([]);
    const [loans, setLoans] = useState([]);
    const [activeInsurance, setActiveInsurance] = useState([]);
    const [creditScore, setCreditScore] = useState(STARTING_CREDIT_SCORE);
    const [activeEffects, setActiveEffects] = useState([]);
    const [activeEnrollment, setActiveEnrollment] = useState(null);
    const [stockNews, setStockNews] = useState([]);
    const [lastCrisisEvent, setLastCrisisEvent] = useState(null);
    const [eventInbox, setEventInbox] = useState([]);
    const [lastMonthTax, setLastMonthTax] = useState(0);
    const [lastMonthEMI, setLastMonthEMI] = useState(0);
    const [netWorthHistory, setNetWorthHistory] = useState([]);
    const [lastMonthFlow, setLastMonthFlow] = useState(null);
    const [monthlyRecap, setMonthlyRecap] = useState(null);
    const [pendingJobOffer, setPendingJobOffer] = useState(null);
    const [lastHappiness, setLastHappiness] = useState(50);
    const [pendingDecision, setPendingDecision] = useState(null);
    const [firedDecisions, setFiredDecisions] = useState([]);
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

    // Daily turn budget — resets at midnight, persisted in AsyncStorage
    const DAILY_TURN_LIMIT = 6;
    const [dailyTurns, setDailyTurns] = useState({ date: '', count: 0 });
    const dailyTurnsRef = useRef({ date: '', count: 0 });

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

    const todayStr = () => new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

    const canAdvanceTurn = () => {
        const today = todayStr();
        const { date, count } = dailyTurnsRef.current;
        if (date !== today) return true; // new day — reset
        return count < DAILY_TURN_LIMIT;
    };

    const consumeTurn = async () => {
        const today = todayStr();
        const prev = dailyTurnsRef.current;
        const newState = prev.date !== today
            ? { date: today, count: 1 }
            : { date: today, count: prev.count + 1 };
        dailyTurnsRef.current = newState;
        setDailyTurns(newState);
        try { await AsyncStorage.setItem('finlit_daily_turns', JSON.stringify(newState)); } catch (_) {}
    };

    const turnsLeftToday = () => {
        const today = todayStr();
        const { date, count } = dailyTurnsRef.current;
        if (date !== today) return DAILY_TURN_LIMIT;
        return Math.max(0, DAILY_TURN_LIMIT - count);
    };

    const stateRef = useRef({});
    useEffect(() => {
        stateRef.current = {
            balance, currentJob, currentHousing, properties, portfolio,
            dependents, loans, activeInsurance, creditScore, activeEffects,
            marketPrices, degrees, totalMonthsPlayed, turn, gameOver,
            activeEnrollment, mfPortfolio, mfNavs, sipPlans, ppf, nps,
            marketCycle, priceHistory, fixedDeposits,
            happiness, isRetired, achievements, firedDecisions,
            crisisCount, highHappinessMonths, monthlyExpenses, lastNetWorthMilestone,
            history, eventInbox, netWorthHistory, lastMonthFlow,
            caSubscribed, caSubscribedMonth, itrFiled,
            health, pantry, sickLeaveMonths,
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
        loadGame().then(() => setSaveLoaded(true));
    }, []);

    // Auto-save whenever totalMonthsPlayed increments (after all state settles)
    useEffect(() => {
        if (!saveLoaded || totalMonthsPlayed === 0) return;
        saveGame();
    }, [totalMonthsPlayed, saveLoaded]);

    // --- DERIVED VALUES ---
    const playerAge = STARTING_AGE + Math.floor(totalMonthsPlayed / 12);

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

    // --- GAME LOOP — auto-mode only when player opts in (4s/month) ---
    useEffect(() => {
        let interval;
        if (isPlaying && !gameOver) {
            interval = setInterval(() => { nextMonth(); }, 4000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, gameOver, balance, currentHousing, properties, portfolio,
        currentJob, dependents, loans, activeInsurance, activeEffects, creditScore,
        totalMonthsPlayed, activeEnrollment, mfPortfolio, mfNavs, sipPlans, ppf, nps, marketCycle, isRetired]);

    // =========================================================================
    // CALCULATORS
    // =========================================================================

    const getDependentCosts = () => {
        let cost = 0;
        for (const dep of dependents) {
            if (dep.type === 'spouse') cost += 5000;
            else if (dep.type === 'child') {
                const childAge = dep.childAgeMonths || 0;
                if (childAge < 60) cost += 8000;
                else if (childAge < 216) cost += 12000;
                else if (childAge < 252) cost += 25000;
            } else if (dep.type === 'parent') {
                cost += 15000;
            }
        }
        return cost;
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
        setCurrentJob(job);
        addHistory(`Started Job: ${job.name}`, 0, 'info');
        return { allowed: true };
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

    const marry = () => {
        if (dependents.some(d => d.type === 'spouse')) return { success: false, msg: 'Already married.' };
        const weddingCost = 500000;
        if (balance < weddingCost) return { success: false, msg: `Need ₹${weddingCost.toLocaleString()} for wedding expenses.` };
        setBalance(prev => prev - weddingCost);
        const isWorking = Math.random() > 0.5;
        const spouseIncome = isWorking ? (20000 + Math.floor(Math.random() * 20000)) : 0;
        setDependents(prev => [...prev, {
            id: `spouse_${Date.now()}`, type: 'spouse', name: 'Spouse',
            monthAdded: totalMonthsPlayed, isWorking, income: spouseIncome,
        }]);
        addHistory(`Got Married! ${isWorking ? `Spouse earns ₹${spouseIncome.toLocaleString()}/mo` : 'Spouse is homemaker'}`, -weddingCost, 'expense');
        return { success: true, msg: `Congratulations! ${isWorking ? `Spouse earns ₹${spouseIncome.toLocaleString()}/mo` : ''}` };
    };

    const haveChild = () => {
        if (!dependents.some(d => d.type === 'spouse')) return { success: false, msg: 'Must be married first.' };
        const childCount = dependents.filter(d => d.type === 'child').length;
        if (childCount >= 3) return { success: false, msg: 'Maximum 3 children.' };
        const gender = Math.random() < 0.5 ? 'female' : 'male';
        const childNames = { female: ['Priya', 'Ananya', 'Kavya'], male: ['Arjun', 'Rohan', 'Dev'] };
        const name = childNames[gender][childCount] || `Child ${childCount + 1}`;
        setDependents(prev => [...prev, {
            id: `child_${Date.now()}`, type: 'child',
            name, gender, monthAdded: totalMonthsPlayed, childAgeMonths: 0, health: 80,
        }]);
        addHistory(`New ${gender === 'female' ? 'daughter' : 'son'} born!`, 0, 'info');
        return { success: true, msg: `Congratulations on your new ${gender === 'female' ? 'daughter' : 'son'}!` };
    };

    const feedDependent = (dependentId, healthAmount) => {
        setDependents(prev => prev.map(d =>
            d.id === dependentId ? { ...d, health: Math.min(100, (d.health ?? 80) + healthAmount) } : d
        ));
    };

    // =========================================================================
    // TUTORIALS & PROGRESSIVE UNLOCKS
    // =========================================================================

    const markTutorialSeen = (key) => setSeenTutorials(prev => new Set([...prev, key]));

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
        ppf:         { unlocked: playerAge >= 20, requirement: 'Age 20+' },
        insurance:   { unlocked: true },
        loans:       { unlocked: true },
        mf:          { unlocked: playerAge >= 22, requirement: 'Age 22+ — start after your first job' },
        sip:         { unlocked: playerAge >= 22, requirement: 'Age 22+ — start after your first job' },
        stocks:      { unlocked: playerAge >= 22, requirement: 'Age 22+ — needs a basic income first' },
        nps:         { unlocked: playerAge >= 25, requirement: 'Age 25+ — plan for retirement early' },
        realestate:  { unlocked: playerAge >= 24 && netWorth >= 200000, requirement: 'Age 24+ with ₹2L net worth' },
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
            setPendingDecision(null);
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
        } else if (eff.type === 'ppf_boost') {
            const amount = Math.min(eff.amount || 50000, balance);
            setBalance(prev => prev - amount);
            setPpf(prev => ({ ...prev, balance: prev.balance + amount, contributionsThisYear: prev.contributionsThisYear + amount }));
        } else if (eff.type === 'market_boost') {
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
            const year = stateRef.current.turn?.year || 0;
            setItrFiled(prev => ({ ...prev, [year]: 'self' }));
            msg = 'ITR filed by yourself. Basic deductions applied.';
        } else if (eff.type === 'itr_skip') {
            const year = stateRef.current.turn?.year || 0;
            if (balance >= 5000) setBalance(prev => prev - 5000);
            setItrFiled(prev => ({ ...prev, [year]: 'skip' }));
            msg = 'Late filing penalty: ₹5,000 deducted.';
        }
        if (eff.happiness && eff.type !== 'cash_spend' && eff.type !== 'emi_purchase') {
            setHappiness(prev => Math.max(0, Math.min(100, prev + eff.happiness)));
        }
        setPendingDecision(null);
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
        const state = { balance, currentJob, currentHousing, properties, portfolio, dependents, playerAge, netWorth, loans };
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
                financialImpact = -Math.round(balance * event.cost_pct_balance * (1 - effectiveMitigation));
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

        const crisisEntry = {
            id: `${event.id}_${totalMonthsPlayed}`,
            name: event.name,
            message,
            category: event.category,
            severity: event.severity || 'minor',
            impact: financialImpact,
            month: totalMonthsPlayed,
            read: false,
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
        // Daily turn limit — prevents real-time salary farming
        if (!canAdvanceTurn()) {
            setIsPlaying(false);
            return;
        }
        consumeTurn();

        // True end of life — legacy screen
        if (totalMonthsPlayed >= GAME_END_MONTH) {
            const score = calculateFinalScore();
            setFinalScore(score);
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
        let housingCost = currentHousing.maintenance || 0;
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
        if (turn.month === 7 && !pendingDecision) {
            const gameYear = turn.year;
            if (!itrFiled[gameYear] && (currentJob || netWorth > 250000)) {
                setPendingDecision({
                    id: `itr_${gameYear}`,
                    name: 'ITR Filing Deadline',
                    emoji: '📄',
                    category: 'dilemma',
                    message: `July 31st — your Income Tax Return for FY ${gameYear - 1}-${String(gameYear).slice(2)} is due.\n\n${caSubscribed ? 'Your CA has prepared your return with optimised deductions. File now to stay compliant.' : "You don't have a CA. File yourself (basic deductions) or hire one for ₹3,000. Skipping costs ₹5,000 in late fees."}`,
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
        if (turn.month === 2 && !pendingDecision) {
            const yearIndex = Math.floor(totalMonthsPlayed / 12);
            const budgetEvent = BUDGET_EVENTS[yearIndex % BUDGET_EVENTS.length];
            setPendingDecision({ ...budgetEvent, isBudget: true });
            setIsPlaying(false);
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

        // Happiness — the other dimension of a good life
        const qualityScore = currentHousing.life_quality || 2;
        const housingEffect  = (qualityScore - 5) * 0.25;
        const debtStress     = -(totalLoanOutstanding / 10000000) * 0.4;
        const familyWarmth   = Math.min(dependents.length * 0.3, 1.2);
        const jobSatisfaction = currentJob ? 0.15 : -0.4;
        const financeStress  = netFlow < 0 ? -0.5 : 0.1;
        const happinessDelta = Math.round((housingEffect + debtStress + familyWarmth + jobSatisfaction + financeStress) * 10) / 10;
        setLastHappiness(happiness);
        const newHappiness = Math.max(0, Math.min(100, happiness + happinessDelta));
        setHappiness(newHappiness);

        // Track high-happiness streak
        if (newHappiness > 80) setHighHappinessMonths(prev => prev + 1);

        // ── HEALTH DRAIN & SICK LEAVE ──────────────────────────────────────────
        const currentHealth = stateRef.current.health ?? 80;
        const newHealth = Math.max(0, currentHealth - MONTHLY_HEALTH_DRAIN);
        setHealth(newHealth);

        if (newHealth < CRITICAL_HEALTH_THRESHOLD && currentJob) {
            // Forced sick leave — lose half salary this month
            const sickPenalty = Math.round(currentJob.salary * 0.5);
            setBalance(prev => prev - sickPenalty);
            setSickLeaveMonths(prev => prev + 1);
            setLastCrisisEvent({
                id: `sick_leave_${totalMonthsPlayed}`,
                name: 'SICK LEAVE',
                message: `Your health (${Math.round(newHealth)}/100) forced you to take sick leave this month. You lost half your salary: -₹${sickPenalty.toLocaleString()}. Buy food from the grocery store to recover.`,
                category: 'crisis',
                impact: -sickPenalty,
            });
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

        // Age children + decay dependent health each month
        setDependents(prev => prev.map(d => {
            if (d.type === 'child') {
                const newHealth = Math.max(0, (d.health ?? 80) - 7);
                return { ...d, childAgeMonths: (d.childAgeMonths || 0) + CHILD_AGING_RATE, health: newHealth };
            }
            if (d.type === 'parent') {
                return { ...d, health: Math.max(0, (d.health ?? 70) - 10) };
            }
            return d;
        }));

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

        // Fluctuate Stock Prices (with market cycle influence)
        const cycleEffect = marketCycle.phase === 'bull' ? 0.008 : marketCycle.phase === 'bear' ? -0.007 : 0;
        setMarketPrices(prevPrices => {
            const newPrices = {};
            STOCKS.forEach(stock => {
                const currentPrice = prevPrices[stock.id] || stock.price;
                const volatility = stock.volatility || 0.05;
                const randomChange = (Math.random() * volatility * 2) - volatility;
                let price = currentPrice * (1 + randomChange + cycleEffect);
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
        setActiveEffects(prev => {
            const nextEffects = [];
            prev.forEach(effect => {
                const nextRemaining = effect.remainingMonths - 1;

                if (effect.type === 'recurring_expense') {
                    if (effect.monthlyAmount) {
                        setBalance(prev => prev - effect.monthlyAmount);
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
                            setBalance(prev => prev + amount);
                            const e = { id: `passive_income_success_${Date.now()}`, name: 'Passive Income', message: effect.msg || 'Your side project paid off!', category: 'positive', impact: amount, month: totalMonthsPlayed, read: false };
                            setEventInbox(prev => [e, ...prev].slice(0, 50));
                            setLastCrisisEvent(e);
                        } else {
                            const e = { id: `passive_income_fail_${Date.now()}`, name: 'Passive Income Failed', message: 'Your side project did not generate revenue this time.', category: 'crisis', impact: 0, month: totalMonthsPlayed, read: false };
                            setEventInbox(prev => [e, ...prev].slice(0, 50));
                            setLastCrisisEvent(e);
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
                            setCurrentJob(prev => (prev && prev.isFreelance ? null : prev));
                            const e = { id: `freelance_fail_${Date.now()}`, name: 'Freelance Client Lost', message: 'Client backed out after month 1. You lost your job for nothing.', category: 'crisis', impact: 0, month: totalMonthsPlayed, read: false };
                            setEventInbox(prev => [e, ...prev].slice(0, 50));
                            setLastCrisisEvent(e);
                            return;
                        }
                        nextEffect = { ...nextEffect, riskChecked: true };
                    }
                    if (nextRemaining <= 0) {
                        setCurrentJob(prev => (prev && prev.isFreelance ? null : prev));
                        if (effect.totalPayout > 0) {
                            setBalance(prev => prev + effect.totalPayout);
                        }
                        const e = { id: `freelance_success_${Date.now()}`, name: 'Freelance Success', message: `Your freelance project completed and paid ₹${(effect.totalPayout || 0).toLocaleString()}!`, category: 'positive', impact: effect.totalPayout || 0, month: totalMonthsPlayed, read: false };
                        setEventInbox(prev => [e, ...prev].slice(0, 50));
                        setLastCrisisEvent(e);
                        return;
                    }
                    nextEffects.push(nextEffect);
                    return;
                }

                if (nextRemaining > 0) {
                    nextEffects.push({ ...effect, remainingMonths: nextRemaining });
                }
            });
            return nextEffects;
        });

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

        // Stock news (15% chance, with market cycle awareness)
        if (Math.random() < 0.15) {
            const newsTemplates = [
                { headline: 'RBI holds repo rate at 6.5% — markets steady', sector: 'FINANCE', trend: 0.02 },
                { headline: 'Nifty hits all-time high on strong FII inflows', sector: 'MARKET', trend: 0.04 },
                { headline: 'TCS, Infosys report strong Q2 earnings', sector: 'IT', trend: 0.05 },
                { headline: 'Crude oil spikes — inflation concerns resurface', sector: 'ENERGY', trend: -0.03 },
                { headline: 'FII selling continues — Nifty under pressure', sector: 'MARKET', trend: -0.04 },
                { headline: 'Gold at record high on global uncertainty', sector: 'COMMODITY', trend: 0.04 },
                { headline: 'RBI cuts rates by 25bps — rally in bond markets', sector: 'FINANCE', trend: 0.03 },
                { headline: 'Zomato turns profitable — stock jumps 8%', sector: 'TECH', trend: 0.07 },
                { headline: 'Adani group stocks volatile on short-seller report', sector: 'ENERGY', trend: -0.08 },
                { headline: 'SEBI tightens F&O rules — retail investors cautious', sector: 'MARKET', trend: -0.02 },
                { headline: 'Budget 2025: ₹1L LTCG exemption increased to ₹1.5L', sector: 'MARKET', trend: 0.03 },
                { headline: 'Banking NPAs at decade low — sector re-rates', sector: 'BANKING', trend: 0.05 },
                { headline: 'SIP inflows cross ₹25,000 crore for 6th straight month', sector: 'MARKET', trend: 0.02 },
                { headline: 'Crypto regulation bill passed — BTC ETF rally', sector: 'CRYPTO', trend: 0.10 },
                { headline: 'Small-cap index corrects 12% — buy or panic?', sector: 'MARKET', trend: -0.06 },
                { headline: 'IRCTC launches new premium train service — stock +5%', sector: 'PSU', trend: 0.05 },
                { headline: 'Monsoon deficit — agri outlook weak, FMCG hit', sector: 'FMCG', trend: -0.03 },
                { headline: 'Reliance Jio IPO plans confirmed — Reliance surges', sector: 'ENERGY', trend: 0.06 },
            ];
            const news = newsTemplates[Math.floor(Math.random() * newsTemplates.length)];
            setStockNews(prev => [{ ...news, date: `${turn.month}/${turn.year}` }, ...prev].slice(0, 20));
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

    const value = {
        // Core
        balance, netWorth, turn, history, isPlaying, setIsPlaying,
        gameSpeed, setGameSpeed,
        currentJob, currentHousing, playerSprite, setPlayerSprite,
        playerName, setPlayerName,
        playerBirthday, setPlayerBirthday,
        degrees, portfolio, properties, marketPrices, priceHistory,
        totalMonthsPlayed, playerAge, gameOver, finalScore,
        netWorthHistory, lastMonthFlow, monthlyRecap,

        // Actions
        enrollInCourse, enrollWithLoan, dropOut, activeEnrollment,
        tradeStock, buyProperty, buyAndMoveIn, moveIn, applyForJob,
        checkJobRequirements, getCAAdvice, nextMonth, sellProperty,
        stockNews,

        // Mutual Funds
        mfNavs, mfPortfolio, buyMF, sellMF, getMFValue,

        // SIP
        sipPlans, addSIP, cancelSIP,

        // Retirement
        ppf, nps, contributePPF, contributeNPS,
        fixedDeposits, createFD, breakFD,

        // Market
        marketCycle,

        // Loans
        loans, creditScore, totalLoanOutstanding,
        takeLoan, prepayLoan, buyPropertyWithLoan,

        // Insurance
        activeInsurance, buyInsurance, cancelInsurance,

        // Dependents
        dependents, marry, haveChild, feedDependent, getDependentCosts, getSpouseIncome,

        // Crisis
        lastCrisisEvent, activeEffects, setLastCrisisEvent,
        eventInbox, markEventRead, markAllEventsRead,

        // Financial details
        lastMonthTax, lastMonthEMI,
        getInsurancePremiums, getTotalEMI, getMonthlyTax,

        // Endgame
        calculateFinalScore,
        RETIREMENT_MONTH,
        GAME_END_MONTH,

        // Retirement phase
        isRetired, pensionIncome, corpusDrawdown, bucketListDone,

        // Career
        pendingJobOffer, setPendingJobOffer,

        // Wellbeing
        happiness, monthlyExpenses,

        // Life Decisions & Achievements
        pendingDecision, setPendingDecision, resolveDecision,
        achievements, newAchievement, setNewAchievement,
        crisisCount, highHappinessMonths,
        majorCrisisFlash,

        // Early retirement
        retireEarly,

        // Tutorials & progressive unlocks
        seenTutorials, markTutorialSeen, getProductUnlocks,

        // CA subscription
        caSubscribed, caSubscribedMonth, subscribeCA, cancelCA, itrFiled,
        CA_MONTHLY_FEE: 2000,

        // Health & Grocery
        health, pantry, sickLeaveMonths, buyGrocery, consumeFood,

        // Persistence
        saveGame, loadGame, deleteSave, saveLoaded,

        // Daily turn budget
        turnsLeftToday, DAILY_TURN_LIMIT, dailyTurns,
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
