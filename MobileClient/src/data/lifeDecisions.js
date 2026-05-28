// Branching life decisions — each has choices with real consequences
// Fire from real-time timer, not month-gated

export const LIFE_DECISIONS = [
    // ── OPPORTUNITY ──────────────────────────────────────────────────────────
    {
        id: 'startup_pitch',
        name: "Friend's Startup Pitch",
        message: "Your college friend is launching a food-tech startup and needs ₹2L. He's offering 5% equity. Could be the next Swiggy... or another bust.",
        emoji: '🚀',
        category: 'opportunity',
        condition: (s) => s.balance >= 150000 && s.playerAge >= 22 && s.playerAge <= 45,
        choices: [
            { label: 'INVEST ₹2L (5%)', color: '#4ade80', effect: { type: 'equity_bet', amount: 200000, successMult: 9, failMult: 0, chance: 0.35, months: 30, successMsg: "The startup got acquired! Your ₹2L turned into ₹18L.", failMsg: "The startup folded. Your ₹2L is gone." } },
            { label: 'NEGOTIATE 8%', color: '#fbbf24', effect: { type: 'equity_bet', amount: 200000, successMult: 14, failMult: 0, chance: 0.30, months: 30, successMsg: "8% equity paid off big — startup sold, you got ₹28L!", failMsg: "Startup shut down before IPO. ₹2L gone." } },
            { label: 'PASS', color: '#6b7280', effect: { type: 'none' } },
        ],
    },
    {
        id: 'freelance_client',
        name: 'Big Freelance Offer',
        message: "A client wants you to do a 3-month consulting project for ₹1.5L/mo — but you'd have to quit your current job. High reward, high risk.",
        emoji: '💼',
        category: 'opportunity',
        condition: (s) => s.currentJob !== null && s.playerAge <= 50,
        choices: [
            { label: 'QUIT & FREELANCE', color: '#fbbf24', effect: { type: 'freelance_win', income: 150000, months: 3, risk: 0.25, failMsg: 'Client backed out after month 1. You lost your job for nothing.' } },
            { label: 'STAY PUT', color: '#6b7280', effect: { type: 'none' } },
        ],
    },
    {
        id: 'property_deal',
        name: 'Off-Market Property Deal',
        message: "A distressed seller is offering a 2BHK at 30% below market — but you have only 48 hours to decide. No loan, cash only.",
        emoji: '🏠',
        category: 'opportunity',
        condition: (s) => s.balance >= 4000000 && s.playerAge <= 55,
        choices: [
            { label: 'BUY IT (₹45L)', color: '#4ade80', effect: { type: 'cash_spend', amount: 4500000, incomeBonus: 25000, msg: 'Smart move. Property bought ₹19L below market. Renting it out for ₹25K/mo.' } },
            { label: 'PASS', color: '#6b7280', effect: { type: 'none' } },
        ],
    },
    {
        id: 'crypto_tip',
        name: 'Hot Crypto Tip',
        message: "Your cousin made 10x on a new coin. He's sure it'll 100x next month. DYOR... or don't.",
        emoji: '🪙',
        category: 'opportunity',
        condition: (s) => s.balance >= 50000,
        choices: [
            { label: 'YOLO ₹50K', color: '#f87171', effect: { type: 'gamble', amount: 50000, successMult: 8, failMult: 0, chance: 0.20, successMsg: '8x! ₹50K → ₹4L. Sold at the right moment.', failMsg: 'Rug pull. ₹50K gone overnight.' } },
            { label: 'INVEST ₹10K (safer)', color: '#fbbf24', effect: { type: 'gamble', amount: 10000, successMult: 5, failMult: 0, chance: 0.30, successMsg: '5x! ₹10K → ₹50K.', failMsg: 'Coin dead. ₹10K gone.' } },
            { label: 'IGNORE', color: '#6b7280', effect: { type: 'none' } },
        ],
    },

    // ── DILEMMA ───────────────────────────────────────────────────────────────
    {
        id: 'loan_to_friend',
        name: 'Friend Needs Money',
        message: "Your close friend is in a tight spot and needs ₹50K urgently. He promises to return it in 6 months.",
        emoji: '🤝',
        category: 'dilemma',
        condition: (s) => s.balance >= 60000,
        choices: [
            { label: 'LEND ₹50K', color: '#60a5fa', effect: { type: 'lend', amount: 50000, returnChance: 0.60, months: 6, returnMsg: 'Friend returned the full ₹50K on time!', noReturnMsg: 'Friend went quiet. The ₹50K is gone.' } },
            { label: 'GIFT ₹20K', color: '#4ade80', effect: { type: 'cash_spend', amount: 20000, msg: "You gifted ₹20K. Friend was grateful. Relationship intact, wallet lighter.", happiness: 5 } },
            { label: 'DECLINE', color: '#6b7280', effect: { type: 'none', happiness: -3 } },
        ],
    },
    {
        id: 'parents_visit',
        name: 'Parents Want to Move In',
        message: "Your parents are getting older and want to move in with you. This means higher monthly expenses but they'll help with childcare.",
        emoji: '👴',
        category: 'dilemma',
        condition: (s) => s.playerAge >= 30 && !s.dependents?.some(d => d.type === 'parent' && !d.isDead),
        choices: [
            { label: 'MOVE THEM IN', color: '#4ade80', effect: { type: 'add_parents', monthlyCost: 8000, msg: "Parents move in. Living costs go up ₹8K/mo but happiness rises and childcare is sorted.", happiness: 8 } },
            { label: 'SUPPORT FROM AFAR', color: '#fbbf24', effect: { type: 'cash_spend', amount: 5000, recurring: true, months: 60, msg: "You send them ₹5K/mo support. They stay in their home.", happiness: 3 } },
            { label: 'NOT NOW', color: '#6b7280', effect: { type: 'none', happiness: -5 } },
        ],
    },
    {
        id: 'job_relocation',
        name: 'Relocation Offer',
        message: "Your company wants to transfer you to Mumbai with a 40% raise — but your family is settled here. Big salary, big disruption.",
        emoji: '✈️',
        category: 'dilemma',
        condition: (s) => s.currentJob !== null && s.playerAge <= 50,
        choices: [
            { label: 'RELOCATE (+40%)', color: '#4ade80', effect: { type: 'salary_boost', pct: 0.40, costBoost: 0.20, msg: "Moved to Mumbai. 40% raise kicks in, but city costs are 20% higher.", duration: 999 } },
            { label: 'DECLINE', color: '#6b7280', effect: { type: 'none', happiness: -2 } },
        ],
    },
    {
        id: 'side_hustle',
        name: 'Side Hustle Opportunity',
        message: "A friend wants to start a YouTube channel with you about personal finance. Could make nothing — or could blow up.",
        emoji: '🎬',
        category: 'opportunity',
        condition: (s) => s.playerAge <= 45,
        choices: [
            { label: 'GO FOR IT', color: '#a78bfa', effect: { type: 'passive_income', amount: 0, chance: 0.50, maxAmount: 80000, growMonths: 18, msg: "Channel growing slowly... check inbox for updates." } },
            { label: 'NO TIME', color: '#6b7280', effect: { type: 'none' } },
        ],
    },

    // ── LIFESTYLE ─────────────────────────────────────────────────────────────
    {
        id: 'luxury_vacation',
        name: 'Luxury Vacation Deal',
        message: "A 10-day Maldives package just dropped to ₹1.2L for two. Once-in-a-lifetime deal, but it'll dent your savings.",
        emoji: '🏝️',
        category: 'lifestyle',
        condition: (s) => s.balance >= 100000,
        choices: [
            { label: 'BOOK IT', color: '#60a5fa', effect: { type: 'cash_spend', amount: 120000, happiness: 15, msg: "Best trip of your life. Worth every rupee. +15 happiness." } },
            { label: 'STAYCATION ₹20K', color: '#fbbf24', effect: { type: 'cash_spend', amount: 20000, happiness: 6, msg: "Local trip. Relaxing and affordable. +6 happiness." } },
            { label: 'SAVE THE MONEY', color: '#6b7280', effect: { type: 'none' } },
        ],
    },
    {
        id: 'car_upgrade',
        name: 'New Car Deal',
        message: "A dealership is offering 0% EMI on a ₹8L car for 3 years. Your current bike is falling apart.",
        emoji: '🚗',
        category: 'lifestyle',
        condition: (s) => s.playerAge >= 24 && s.netWorth >= 500000,
        choices: [
            { label: 'BUY ON EMI', color: '#60a5fa', effect: { type: 'emi_purchase', amount: 800000, months: 36, happiness: 8, msg: "New car smell. ₹22.2K EMI for 36 months. Happy commuting!" } },
            { label: 'USED CAR ₹2L', color: '#fbbf24', effect: { type: 'cash_spend', amount: 200000, happiness: 4, msg: "Reliable used car. Sensible choice. ₹2L out, saved the rest." } },
            { label: 'KEEP THE BIKE', color: '#6b7280', effect: { type: 'none' } },
        ],
    },
];

// ── BUDGET DAY EVENTS (one fires every February) ────────────────────────────
export const BUDGET_EVENTS = [
    {
        id: 'budget_infra',
        name: 'Union Budget — Infra Push',
        emoji: '📋',
        category: 'opportunity',
        message: "FM announces ₹10L crore infra spend. PSU stocks rally 12%. Standard deduction raised to ₹75K. Where does your money go?",
        choices: [
            { label: 'BUY PSU STOCKS NOW', color: '#4ade80', effect: { type: 'market_boost', sector: 'PSU', pct: 0.12, msg: 'PSU stocks surged on infra push. Smart move.' } },
            { label: 'MAX OUT PPF (80C)', color: '#60a5fa', effect: { type: 'ppf_boost', amount: 50000, msg: 'Topped up PPF ₹50K. Tax saved, corpus growing.' } },
            { label: 'WAIT AND WATCH', color: '#6b7280', effect: { type: 'none' } },
        ],
    },
    {
        id: 'budget_tax_cut',
        name: 'Union Budget — Tax Relief',
        emoji: '📋',
        category: 'opportunity',
        message: "Good news! Income tax slabs revised. You get ₹30K extra annually. New regime now default — do you switch?",
        choices: [
            { label: 'SWITCH TO NEW REGIME', color: '#4ade80', effect: { type: 'cash_spend', amount: -30000, msg: 'Switched to new regime. ₹30K extra in your pocket this year!', happiness: 5 } },
            { label: 'STAY OLD REGIME (deductions)', color: '#fbbf24', effect: { type: 'none', msg: 'Kept old regime. Your deductions still outweigh the slab benefit.', happiness: 2 } },
            { label: 'CONSULT A CA LATER', color: '#6b7280', effect: { type: 'none' } },
        ],
    },
    {
        id: 'budget_capital_gains',
        name: 'Union Budget — LTCG Hike',
        emoji: '📋',
        category: 'dilemma',
        message: "LTCG tax hiked from 10% to 12.5%. Markets sell off 5% on the news. Book profits before the year ends?",
        choices: [
            { label: 'BOOK PROFITS NOW', color: '#fbbf24', effect: { type: 'sell_all_stocks', pct: 0.5, msg: 'Booked 50% of stock profits before the new rate kicks in.' } },
            { label: 'HOLD LONG-TERM', color: '#4ade80', effect: { type: 'none', msg: 'Stayed put. You believe in your picks for the next decade.' } },
            { label: 'BUY THE DIP', color: '#60a5fa', effect: { type: 'market_dip_buy', amount: 50000, msg: 'Deployed ₹50K into the market dip. Patience pays.' } },
        ],
    },
    {
        id: 'budget_housing',
        name: 'Union Budget — Housing Push',
        emoji: '📋',
        category: 'opportunity',
        message: "FM doubles interest subsidy for first-time homebuyers. Home loan EMIs just got cheaper. Time to buy?",
        choices: [
            { label: 'APPLY FOR HOME LOAN', color: '#4ade80', effect: { type: 'none', msg: 'Applied for subsidised home loan. Check BANK for options.', happiness: 3 } },
            { label: 'INVEST IN REITS INSTEAD', color: '#60a5fa', effect: { type: 'cash_spend', amount: 50000, happiness: 4, msg: 'Bought ₹50K in REITs. Real estate exposure without the EMI headache.' } },
            { label: 'NOT FOR ME', color: '#6b7280', effect: { type: 'none' } },
        ],
    },
];
