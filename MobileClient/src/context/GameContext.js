import React, { createContext, useState, useContext, useEffect } from 'react';
import { JOBS } from '../data/jobs';
import { INVESTMENTS } from '../data/investments';

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
    const [balance, setBalance] = useState(STARTING_BALANCE);
    const [turn, setTurn] = useState({ month: 1, year: 2024 });
    const [history, setHistory] = useState([]);

    // Life Engine State
    const [currentJob, setCurrentJob] = useState(null); // Unemployed

    // Default Housing: Hostel
    // NOTE: In RN, image must be a require() or uri. 
    // We use the object directly from INVESTMENTS (which uses require) or this default.
    const [currentHousing, setCurrentHousing] = useState({
        id: 'hostel',
        name: 'Hostel Room',
        rent: HOSTEL_RENT,
        image: require('../../assets/rooms/hostel.png'),
        type: 'rental'
    });

    const [inventory, setInventory] = useState([]); // Bought investments
    const [dependents, setDependents] = useState([]);

    // Real-Time Engine
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                nextMonth();
            }, 3000); // 3 seconds = 1 month (Fast!)
        }
        return () => clearInterval(interval);
    }, [isPlaying, balance, currentHousing, inventory, currentJob, dependents]);

    // Calculate Net Worth
    const netWorth = balance + inventory.reduce((total, id) => {
        const item = INVESTMENTS.find(inv => inv.id === id);
        return total + (item ? item.cost : 0);
    }, 0);

    const runCrisisEngine = () => {
        // console.log("Crisis Engine Triggered (Placeholder)");
    };

    const checkJobRequirements = (job) => {
        const reqNetWorth = job.req_net_worth || 0;
        if (netWorth < reqNetWorth) {
            return { allowed: false, reason: `Requires Net Worth ₹${reqNetWorth.toLocaleString()}` };
        }
        return { allowed: true };
    };

    const applyForJob = (job) => {
        const check = checkJobRequirements(job);
        if (!check.allowed) {
            return check;
        }

        setCurrentJob(job);
        setHistory(prev => [...prev, {
            date: `${turn.month}/${turn.year}`,
            description: `Started new job: ${job.name}`,
            amount: 0,
            type: 'info'
        }]);
        return { allowed: true };
    };

    const buyInvestment = (item) => {
        if (balance >= item.cost) {
            setBalance(prev => prev - item.cost);
            const newInventory = [...inventory, item.id];
            setInventory(newInventory);

            // If it's a house, move into it!
            if (item.type === 'housing') {
                setCurrentHousing({
                    ...item,
                    rent: 0 // No rent for owned property
                });
            }

            setHistory(prev => [...prev, {
                date: `${turn.month}/${turn.year}`,
                description: `Bought: ${item.name}`,
                amount: -item.cost,
                type: 'expense'
            }]);
            return true;
        }
        return false;
    };

    const nextMonth = () => {
        // 1. Calculations
        const salary = currentJob ? currentJob.salary : 0;

        // Revenue from investments
        let investmentRevenue = 0;
        inventory.forEach(itemId => {
            const item = INVESTMENTS.find(i => i.id === itemId);
            if (item) investmentRevenue += (item.revenue || 0);
        });

        // Expenses
        let rent = 0;
        if (currentHousing.type === 'rental') {
            rent = currentHousing.rent;
        }

        const livingCosts = LIVING_COSTS_BASE + (dependents.length * 2000);

        // Maintenance
        let totalMaintenance = 0;
        inventory.forEach(itemId => {
            const item = INVESTMENTS.find(i => i.id === itemId);
            if (item) totalMaintenance += (item.maintenance || 0);
        });

        const totalIncome = salary + investmentRevenue;
        const totalExpenses = rent + livingCosts + totalMaintenance;
        const netFlow = totalIncome - totalExpenses;

        // 2. Update State
        setBalance(prev => prev + netFlow);

        // 3. History Log
        setHistory(prev => {
            const newHistory = [...prev, {
                date: `${turn.month}/${turn.year}`,
                description: `Monthly Summary`,
                amount: netFlow,
                details: {
                    income: totalIncome,
                    expenses: totalExpenses,
                    housing: currentHousing.name
                },
                type: netFlow >= 0 ? 'income' : 'expense'
            }];
            if (newHistory.length > 50) return newHistory.slice(-50);
            return newHistory;
        });

        // 4. Time Advance
        setTurn(prev => {
            let newMonth = prev.month + 1;
            let newYear = prev.year;
            if (newMonth > 12) {
                newMonth = 1;
                newYear += 1;
            }
            return { month: newMonth, year: newYear };
        });

        runCrisisEngine();
    };

    const value = {
        balance,
        netWorth,
        turn,
        history,
        currentJob,
        currentHousing,
        inventory,
        dependents,
        isPlaying,
        setIsPlaying,
        nextMonth,
        applyForJob,
        checkJobRequirements,
        buyInvestment
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
