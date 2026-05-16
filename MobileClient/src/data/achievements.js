// Achievement definitions — checked after every month tick
export const ACHIEVEMENTS = [
    // ── WEALTH MILESTONES ────────────────────────────────────────────────────
    { id: 'lakhpati',       name: 'Lakhpati',         desc: 'Reach ₹1 Lakh net worth',     color: '#fbbf24', check: (s) => s.netWorth >= 100000 },
    { id: 'millionaire',    name: 'Ten Lakh Club',     desc: 'Reach ₹10 Lakh net worth',    color: '#60a5fa', check: (s) => s.netWorth >= 1000000 },
    { id: 'crorepati',      name: 'Crorepati',         desc: 'Reach ₹1 Crore net worth',    color: '#a78bfa', check: (s) => s.netWorth >= 10000000 },
    { id: 'ten_crore',      name: 'Ultra Rich',        desc: 'Reach ₹10 Crore net worth',   color: '#f59e0b', check: (s) => s.netWorth >= 100000000 },

    // ── CAREER ───────────────────────────────────────────────────────────────
    { id: 'first_job',      name: 'First Paycheck',    desc: 'Land your first job',          color: '#4ade80', check: (s) => s.currentJob !== null },
    { id: 'high_earner',    name: 'High Earner',       desc: 'Earn ₹2L+/month salary',       color: '#22c55e', check: (s) => s.currentJob?.salary >= 200000 },
    { id: 'boss_level',     name: 'Boss Level',        desc: 'Earn ₹5L+/month salary',       color: '#a78bfa', check: (s) => s.currentJob?.salary >= 500000 },

    // ── EDUCATION ────────────────────────────────────────────────────────────
    { id: 'grad',           name: 'Graduate',          desc: 'Complete any degree',           color: '#818cf8', check: (s) => s.degrees?.length >= 1 },
    { id: 'over_educated',  name: 'Overachiever',      desc: 'Earn 3+ degrees/diplomas',      color: '#6366f1', check: (s) => s.degrees?.length >= 3 },

    // ── REAL ESTATE ──────────────────────────────────────────────────────────
    { id: 'homeowner',      name: 'Homeowner',         desc: 'Buy your first property',       color: '#f97316', check: (s) => s.properties?.length >= 1 },
    { id: 'landlord',       name: 'Landlord',          desc: 'Own 3+ properties',             color: '#fb923c', check: (s) => s.properties?.length >= 3 },
    { id: 'mogul',          name: 'Property Mogul',    desc: 'Own 5+ properties',             color: '#ef4444', check: (s) => s.properties?.length >= 5 },

    // ── INVESTING ────────────────────────────────────────────────────────────
    { id: 'first_stock',    name: 'Stock Picker',      desc: 'Buy your first stock',          color: '#60a5fa', check: (s) => Object.keys(s.portfolio || {}).length >= 1 },
    { id: 'diversified',    name: 'Diversified',       desc: 'Hold 5+ different stocks',      color: '#3b82f6', check: (s) => Object.keys(s.portfolio || {}).filter(k => (s.portfolio[k]?.qty || 0) > 0).length >= 5 },
    { id: 'sip_master',     name: 'SIP Master',        desc: 'Run 3+ active SIPs',            color: '#a78bfa', check: (s) => (s.sipPlans?.length || 0) >= 3 },

    // ── DEBT & SAVINGS ───────────────────────────────────────────────────────
    { id: 'debt_free',      name: 'Debt Free',         desc: 'Clear all loans',               color: '#4ade80', check: (s) => (s.loans?.length || 0) === 0 && s.totalMonthsPlayed > 6 },
    { id: 'emergency_fund', name: 'Safety Net',        desc: 'Hold 6 months of expenses in cash', color: '#22c55e', check: (s) => s.balance >= (s.monthlyExpenses || 20000) * 6 },
    { id: 'ppf_hero',       name: 'PPF Champion',      desc: 'Build ₹10L in PPF',             color: '#fbbf24', check: (s) => (s.ppf?.balance || 0) >= 1000000 },
    { id: 'fd_king',        name: 'FD King',           desc: 'Hold ₹5L in Fixed Deposits',    color: '#f59e0b', check: (s) => (s.fixedDeposits || []).reduce((t, fd) => t + fd.currentValue, 0) >= 500000 },

    // ── FAMILY ───────────────────────────────────────────────────────────────
    { id: 'married',        name: 'Married',           desc: 'Tie the knot',                  color: '#ec4899', check: (s) => s.dependents?.some(d => d.type === 'spouse') },
    { id: 'parent',         name: 'New Parent',        desc: 'Have your first child',         color: '#f472b6', check: (s) => s.dependents?.some(d => d.type === 'child') },
    { id: 'big_family',     name: 'Big Family',        desc: 'Have 3+ dependents',            color: '#e879f9', check: (s) => (s.dependents?.length || 0) >= 3 },

    // ── INSURANCE ────────────────────────────────────────────────────────────
    { id: 'protected',      name: 'Fully Protected',   desc: 'Hold all 3 types of insurance', color: '#22c55e', check: (s) => {
        const types = new Set((s.activeInsurance || []).map(i => i.type));
        return types.has('health') && types.has('life') && types.has('property');
    }},

    // ── SPECIAL ──────────────────────────────────────────────────────────────
    { id: 'early_retire',   name: 'Early Retiree',     desc: 'Retire with ₹1Cr+ corpus by 55',color: '#f59e0b', check: (s) => s.isRetired && (s.ppf?.balance || 0) + (s.nps?.balance || 0) >= 10000000 && s.playerAge <= 55 },
    { id: 'survivor',       name: 'Crisis Survivor',   desc: 'Survive 5 major crisis events', color: '#f87171', check: (s) => (s.crisisCount || 0) >= 5 },
    { id: 'happiness_max',  name: 'Flourishing',       desc: 'Maintain happiness above 80 for 12 months', color: '#4ade80', check: (s) => (s.highHappinessMonths || 0) >= 12 },
];

export const NET_WORTH_MILESTONES = [
    { value: 100000,    label: '₹1 Lakh',    color: '#fbbf24' },
    { value: 1000000,   label: '₹10 Lakh',   color: '#60a5fa' },
    { value: 5000000,   label: '₹50 Lakh',   color: '#a78bfa' },
    { value: 10000000,  label: '₹1 Crore',   color: '#f59e0b' },
    { value: 50000000,  label: '₹5 Crore',   color: '#ef4444' },
    { value: 100000000, label: '₹10 Crore',  color: '#ec4899' },
];
