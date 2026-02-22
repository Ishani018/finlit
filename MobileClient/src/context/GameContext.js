import React, { createContext, useState, useContext, useEffect } from 'react';
import { JOBS } from '../data/jobs';
import { EDUCATION } from '../data/education';
import { STOCKS } from '../data/stocks';
import { RESIDENTIAL_PROPERTIES, COMMERCIAL_PROPERTIES } from '../data/realEstate';

// Combine both property arrays for backward compatibility
const REAL_ESTATE = [...RESIDENTIAL_PROPERTIES, ...COMMERCIAL_PROPERTIES];

const GameContext = createContext();

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};

// Start State
const STARTING_BALANCE = 5000;
const HOSTEL_RENT = 3000;
const LIVING_COSTS_BASE = 2000;

export const GameProvider = ({ children }) => {
    // --- STATE ---
    const [balance, setBalance] = useState(STARTING_BALANCE);
    const [turn, setTurn] = useState({ month: 1, year: 2024 });
    const [history, setHistory] = useState([]);
    const [currentJob, setCurrentJob] = useState(null); // Unemployed
    const [isPlaying, setIsPlaying] = useState(false);
    const [dependents, setDependents] = useState([]);
    const [playerSprite, setPlayerSprite] = useState(null);
    const [playerName, setPlayerName] = useState("");

    // New Data Structures
    const [degrees, setDegrees] = useState([]); // Array of strings (names)
    const [portfolio, setPortfolio] = useState({}); // { 'stock_id': quantity }
    const [properties, setProperties] = useState([]); // Array of owned property IDs

    // Housing (Derived or Separate State? Keeping state for specific current residence)
    const [currentHousing, setCurrentHousing] = useState({
        id: 'hostel',
        name: 'Hostel Shared Room',
        rent: HOSTEL_RENT,
        type: 'rental',
        image: require('../../assets/rooms/hostel.png')
    });

    // Market Simulation
    const [marketPrices, setMarketPrices] = useState({});

    // --- EFFECTS ---

    // Initialize Market
    useEffect(() => {
        const initialPrices = {};
        STOCKS.forEach(stock => {
            initialPrices[stock.id] = stock.price;
        });
        setMarketPrices(initialPrices);
    }, []);

    // Game Loop
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                nextMonth();
            }, 3000); // 3 seconds = 1 month
        }
        return () => clearInterval(interval);
    }, [isPlaying, balance, currentHousing, properties, portfolio, currentJob, dependents]);

    // --- CALCULATORS ---

    const getStockValue = () => {
        return Object.keys(portfolio).reduce((total, stockId) => {
            const qty = portfolio[stockId] || 0;
            const price = marketPrices[stockId] || 0;
            return total + (qty * price);
        }, 0);
    };

    const getRealEstateValue = () => {
        return properties.reduce((total, id) => {
            const item = REAL_ESTATE.find(p => p.id === id);
            return total + (item ? item.price : 0);
        }, 0);
    };

    const netWorth = balance + getStockValue() + getRealEstateValue();

    // --- ACTIONS ---

    const enrollInCourse = (course) => {
        if (degrees.includes(course.name)) return { success: false, msg: 'Already enrolled/completed.' };
        if (balance < course.cost) return { success: false, msg: 'Insufficient funds.' };

        setBalance(prev => prev - course.cost);
        setDegrees(prev => [...prev, course.name]);

        setHistory(prev => [...prev, {
            date: `${turn.month}/${turn.year}`,
            description: `Enrolled in ${course.name}`,
            amount: -course.cost,
            type: 'expense'
        }]);
        return { success: true, msg: 'Enrolled successfully!' };
    };

    const tradeStock = (stock, qty, action) => {
        const currentPrice = marketPrices[stock.id] || stock.price;
        const cost = currentPrice * qty;

        if (action === 'BUY') {
            if (balance < cost) return { success: false, msg: 'Insufficient funds.' };
            setBalance(prev => prev - cost);
            setPortfolio(prev => ({
                ...prev,
                [stock.id]: (prev[stock.id] || 0) + qty
            }));
            setHistory(prev => [...prev, {
                date: `${turn.month}/${turn.year}`,
                description: `Bought ${qty} ${stock.ticker}`,
                amount: -cost,
                type: 'expense'
            }]);
        } else if (action === 'SELL') {
            const currentQty = portfolio[stock.id] || 0;
            if (currentQty < qty) return { success: false, msg: 'Not enough shares.' };
            setBalance(prev => prev + cost);
            setPortfolio(prev => ({
                ...prev,
                [stock.id]: currentQty - qty
            }));
            setHistory(prev => [...prev, {
                date: `${turn.month}/${turn.year}`,
                description: `Sold ${qty} ${stock.ticker}`,
                amount: cost,
                type: 'income'
            }]);
        }
        return { success: true };
    };

    const buyProperty = (property) => {
        if (properties.includes(property.id)) return { success: false, msg: 'Already owned.' };
        if (balance < property.price) return { success: false, msg: 'Insufficient funds.' };

        setBalance(prev => prev - property.price);
        setProperties(prev => [...prev, property.id]);

        setHistory(prev => [...prev, {
            date: `${turn.month}/${turn.year}`,
            description: `Purchased Property: ${property.name}`,
            amount: -property.price,
            type: 'expense'
        }]);
        return { success: true, msg: 'Property purchased!' };
    };

    const moveIn = (propertyId) => {
        if (!properties.includes(propertyId)) return { success: false, msg: 'You do not own this property.' };

        const property = REAL_ESTATE.find(p => p.id === propertyId);
        if (!property) return { success: false, msg: 'Property not found.' };
        if (property.type !== 'residential') return { success: false, msg: 'You can only live in residential properties.' };

        setCurrentHousing({
            ...property,
            rent: 0 // No rent if owned
        });

        return { success: true, msg: `Moved into ${property.name}!` };
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
        setHistory(prev => [...prev, {
            date: `${turn.month}/${turn.year}`,
            description: `Started Job: ${job.name}`,
            amount: 0,
            type: 'info'
        }]);
        return { allowed: true };
    };

    // --- SMART CA ADVISOR LOGIC ---
    const getCAAdvice = () => {
        // 1. Calculate Financial Baseline
        const livingCosts = LIVING_COSTS_BASE + (dependents.length * 2000);
        let housingCost = 0;
        if (currentHousing.type === 'rental') housingCost = currentHousing.maintenance;
        else if (currentHousing.type === 'owned') housingCost = currentHousing.maintenance;

        let investmentMaintenance = 0;
        properties.forEach(id => {
            const prop = REAL_ESTATE.find(p => p.id === id);
            if (prop && prop.id !== currentHousing.id) investmentMaintenance += (prop.maintenance || 0);
        });

        const totalMonthlyExpenses = livingCosts + housingCost + investmentMaintenance;
        const salary = currentJob ? currentJob.salary : 0;

        // Income from Real Estate
        let realEstateIncome = 0;
        properties.forEach(id => {
            const prop = REAL_ESTATE.find(p => p.id === id);
            if (prop && prop.rent_income) realEstateIncome += prop.rent_income;
        });

        const totalIncome = salary + realEstateIncome;
        const monthlyBurn = totalIncome - totalMonthlyExpenses;
        const emergencyFundTarget = totalMonthlyExpenses * 6; // 6 months expenses

        // --- ADVICE PRIORITY CHAIN ---

        // 0. CRITICAL: Cashflow Negative
        if (monthlyBurn < 0) {
            return `⚠️ DANGER: You are losing ₹${Math.abs(monthlyBurn).toLocaleString()}/month! Downsize your lifestyle or get a better job immediately before you go bankrupt.`;
        }

        // 1. SAFETY: Emergency Fund
        if (balance < totalMonthlyExpenses * 3) {
            return `Calculated Risk: Your monthly expenses are ₹${totalMonthlyExpenses.toLocaleString()}. You need at least ₹${(totalMonthlyExpenses * 3).toLocaleString()} (3 months) in liquid cash. Stop spending and SAVE.`;
        }

        // 2. CAREER: Underemployment
        if (!currentJob) {
            return "You are unemployed. Your primary asset is YOU. Go to the Careers tab and get a job to start generating cashflow.";
        }
        if (currentJob.salary < 30000 && degrees.length === 0 && balance > 50000) {
            return "Stagnation Alert: You're stuck in a low-paying job. Use your savings to buy a Degree at the University. It has the highest ROI.";
        }

        // 3. GROWTH: Idle Cash (Inflation Risk)
        if (balance > emergencyFundTarget && Object.keys(portfolio).length === 0) {
            return `You have excess cash (₹${balance.toLocaleString()}) rotting in the bank. Inflation is eating it. Start an SIP in the 'Invest' tab.`;
        }

        // 4. REAL ESTATE: Rent vs Buy
        if (currentHousing.type === 'rental' && balance > 3000000) { // 30L
            return "Stop throwing money at rent. You have the capital to buy a 'Starter 1BHK'. It builds equity instead of expenses.";
        }

        // 5. WEALTH: Diversification
        const stockCount = Object.keys(portfolio).length;
        if (stockCount === 1 && netWorth > 1000000) {
            return "High Risk: Your entire portfolio is in one stock. One bad market turn could wipe you out. Diversify into at least 3 sectors.";
        }

        // 6. SCALING: Leverage
        if (netWorth > 10000000 && properties.length < 2) {
            return "You have high Net Worth but low passive income. Look at 'Investment Properties' (Tier 3/4) to generate monthly cashflow.";
        }

        // Default: General Wisdom
        const stockValue = Object.values(portfolio).reduce((a, b) => a + b, 0); // Simplified, ideally calculated properly
        if (stockValue > balance * 2) {
            return "Aggressive Stance: You are heavy on stocks. Ensure you keep enough liquid cash for market crashes.";
        }

        return `Status Healthy: Net Worth ₹${netWorth.toLocaleString()}. Keep strict discipline on expenses and reinvest your dividends.`;
    };

    const nextMonth = () => {
        const salary = currentJob ? currentJob.salary : 0;

        // Income from Real Estate Rentals
        let realEstateIncome = 0;
        properties.forEach(id => {
            const prop = REAL_ESTATE.find(p => p.id === id);
            if (prop && prop.rent_income) realEstateIncome += prop.rent_income;
        });

        // Expenses
        let housingCost = 0;
        if (currentHousing.type === 'rental') {
            housingCost = currentHousing.maintenance; // Rent
        } else if (currentHousing.type === 'owned') {
            housingCost = currentHousing.maintenance; // HOA / Maintenance
        }

        // Maintenance on Investment Properties
        let investmentMaintenance = 0;
        properties.forEach(id => {
            const prop = REAL_ESTATE.find(p => p.id === id);
            // If we don't live in it, we pay maintenance
            if (prop && prop.id !== currentHousing.id) {
                investmentMaintenance += (prop.maintenance || 0);
            }
        });

        const livingCosts = LIVING_COSTS_BASE + (dependents.length * 2000);

        const totalIncome = salary + realEstateIncome;
        const totalExpenses = housingCost + investmentMaintenance + livingCosts;
        const netFlow = totalIncome - totalExpenses;

        setBalance(prev => prev + netFlow);

        // Fluctuate Stocks
        setMarketPrices(prevPrices => {
            const newPrices = {};
            STOCKS.forEach(stock => {
                const currentPrice = prevPrices[stock.id] || stock.price;
                const volatility = stock.volatility || 0.05;
                const change = (Math.random() * volatility * 2) - volatility;
                let price = currentPrice * (1 + change);
                if (price < 1) price = 1;
                newPrices[stock.id] = price;
            });
            return newPrices;
        });

        // History Log
        setHistory(prev => {
            const newHistory = [...prev, {
                date: `${turn.month}/${turn.year}`,
                description: `Monthly Summary`,
                amount: netFlow,
                details: { income: totalIncome, expenses: totalExpenses },
                type: netFlow >= 0 ? 'income' : 'expense'
            }];
            if (newHistory.length > 50) return newHistory.slice(-50);
            return newHistory;
        });

        // Time Advance
        setTurn(prev => {
            let m = prev.month + 1;
            let y = prev.year;
            if (m > 12) { m = 1; y++; }
            return { month: m, year: y };
        });

        // Simplistic Crisis Engine hook
        // runCrisisEngine(); 
    };

    const value = {
        balance, netWorth, turn, history, isPlaying, setIsPlaying,
        currentJob, currentHousing, dependents, playerSprite, setPlayerSprite,
        playerName, setPlayerName,
        degrees, portfolio, properties, marketPrices,
        enrollInCourse, tradeStock, buyProperty, moveIn, applyForJob, checkJobRequirements, getCAAdvice,
        nextMonth
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
