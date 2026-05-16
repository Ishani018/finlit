// Crisis Engine Event Definitions
// Events use dynamic message generators that reference actual dependent names

// Helper to pick a random dependent of a type
const pickDependent = (dependents, type) => {
    const matches = dependents.filter(d => d.type === type);
    return matches.length > 0 ? matches[Math.floor(Math.random() * matches.length)] : null;
};

export const CRISIS_EVENTS = [
    // ============ HEALTH - PLAYER ============
    {
        id: 'food_poisoning',
        name: 'Food Poisoning',
        category: 'health',
        severity: 'minor',
        cost: 5000,
        getMessage: () => 'You ate dodgy street food. Hospital visit + meds = ₹5,000.',
        condition: () => true,
        mitigated_by: 'health',
    },
    {
        id: 'accident',
        name: 'Road Accident',
        category: 'health',
        severity: 'moderate',
        cost: 50000,
        getMessage: () => 'Auto-rickshaw crash on the way to work. Fractured arm, 2 weeks off.',
        condition: () => true,
        mitigated_by: 'health',
    },
    {
        id: 'major_surgery',
        name: 'Major Surgery',
        category: 'health',
        severity: 'major',
        cost: 300000,
        getMessage: () => 'Doctors found something during a routine checkup. Surgery is non-negotiable.',
        condition: (state) => state.playerAge >= 30,
        mitigated_by: 'health',
    },
    {
        id: 'dental_emergency',
        name: 'Dental Emergency',
        category: 'health',
        severity: 'minor',
        cost: 15000,
        getMessage: () => 'Cracked a tooth on a pani puri. Root canal time.',
        condition: () => true,
        mitigated_by: 'health',
    },

    // ============ HEALTH - DEPENDENTS ============
    {
        id: 'spouse_illness',
        name: 'Spouse Falls Ill',
        category: 'health',
        severity: 'moderate',
        cost: 60000,
        getMessage: (state) => {
            const spouse = pickDependent(state.dependents, 'spouse');
            return spouse ? `Your ${spouse.name} has dengue. Hospital stay + treatment costs pile up.` : 'Your spouse is seriously ill.';
        },
        condition: (state) => state.dependents.some(d => d.type === 'spouse'),
        mitigated_by: 'health',
    },
    {
        id: 'child_hospital',
        name: 'Child Hospitalized',
        category: 'health',
        severity: 'moderate',
        cost: 40000,
        getMessage: (state) => {
            const child = pickDependent(state.dependents, 'child');
            return child ? `${child.name} had a high fever and needed to be hospitalized for 3 days.` : 'Your child is in the hospital.';
        },
        condition: (state) => state.dependents.some(d => d.type === 'child'),
        mitigated_by: 'health',
    },
    {
        id: 'parent_emergency',
        name: 'Parent Medical Emergency',
        category: 'health',
        severity: 'major',
        cost: 150000,
        getMessage: (state) => {
            const parent = pickDependent(state.dependents, 'parent');
            return parent ? `${parent.name} had a cardiac episode. ICU + procedures = massive bill.` : 'Your parent needs emergency surgery.';
        },
        condition: (state) => state.dependents.some(d => d.type === 'parent'),
        mitigated_by: 'health',
    },
    {
        id: 'child_school_fee',
        name: 'School Admission Donation',
        category: 'life',
        severity: 'moderate',
        cost: 100000,
        getMessage: (state) => {
            const child = pickDependent(state.dependents, 'child');
            return child ? `${child.name} got into a good school but they want a "donation" of ₹1L.` : 'School demands a hefty admission donation.';
        },
        condition: (state) => state.dependents.some(d => d.type === 'child' && (d.childAgeMonths || 0) >= 18 && (d.childAgeMonths || 0) < 216),
    },

    // ============ MARKET/ECONOMIC ============
    {
        id: 'market_crash',
        name: 'Market Crash',
        category: 'market',
        severity: 'major',
        effect: 'stock_crash',
        stock_drop_min: 0.20,
        stock_drop_max: 0.40,
        getMessage: () => 'BREAKING: Markets tank on global recession fears. Nifty down 30%+.',
        condition: (state) => Object.keys(state.portfolio).some(k => (state.portfolio[k]?.qty || 0) > 0),
    },
    {
        id: 'sector_crash',
        name: 'Sector Crash',
        category: 'market',
        severity: 'moderate',
        effect: 'single_stock_crash',
        stock_drop_min: 0.30,
        stock_drop_max: 0.50,
        getMessage: () => 'Regulatory crackdown on a sector! One of your holdings nosedives.',
        condition: (state) => Object.keys(state.portfolio).some(k => (state.portfolio[k]?.qty || 0) > 0),
    },
    {
        id: 'recession',
        name: 'Recession',
        category: 'market',
        severity: 'major',
        effect: 'salary_cut',
        duration: 6,
        salary_cut_pct: 0.20,
        getMessage: () => 'Economy enters recession. Company-wide 20% salary cuts for 6 months. No layoffs... yet.',
        condition: (state) => state.currentJob !== null,
    },
    {
        id: 'inflation_spike',
        name: 'Inflation Spike',
        category: 'market',
        severity: 'moderate',
        effect: 'living_cost_increase',
        duration: 12,
        cost_increase_pct: 0.30,
        getMessage: () => 'Petrol hits ₹150/L. Tomatoes at ₹200/kg. Everything costs 30% more this year.',
        condition: () => true,
    },
    {
        id: 'spouse_job_loss',
        name: 'Spouse Loses Job',
        category: 'market',
        severity: 'moderate',
        effect: 'spouse_income_loss',
        duration: 6,
        getMessage: (state) => {
            const spouse = pickDependent(state.dependents, 'spouse');
            return spouse ? `${spouse.name} got laid off. Family income drops until they find work.` : 'Your spouse lost their job.';
        },
        condition: (state) => state.dependents.some(d => d.type === 'spouse' && d.isWorking),
    },

    // ============ PROPERTY ============
    {
        id: 'flood_damage',
        name: 'Flood Damage',
        category: 'property',
        severity: 'major',
        cost_pct: 0.15,
        getMessage: () => 'Monsoon flooding damages your property. Walls, wiring, furniture — all ruined.',
        condition: (state) => state.properties.length > 0,
        mitigated_by: 'property',
    },
    {
        id: 'tenant_default',
        name: 'Tenant Stops Paying',
        category: 'property',
        severity: 'moderate',
        effect: 'no_rent',
        duration: 4,
        getMessage: () => 'Your tenant disappeared without paying 4 months rent. Legal battle begins.',
        condition: (state) => state.properties.length > 0,
    },
    {
        id: 'property_tax_hike',
        name: 'Property Tax Hike',
        category: 'property',
        severity: 'moderate',
        cost_pct: 0.02,
        getMessage: () => 'Municipal corporation raised property tax by 30%. One-time reassessment bill.',
        condition: (state) => state.properties.length > 0,
    },
    {
        id: 'major_repairs',
        name: 'Pipe Burst',
        category: 'property',
        severity: 'moderate',
        cost: 200000,
        getMessage: () => 'Main water pipe burst inside the walls. Emergency repair with wall reconstruction.',
        condition: (state) => state.properties.length > 0,
        mitigated_by: 'property',
    },

    // ============ LIFE EVENTS ============
    {
        id: 'parent_care',
        name: 'Parent Needs Care',
        category: 'life',
        severity: 'moderate',
        effect: 'add_dependent',
        dependent_type: 'parent',
        getMessage: () => 'Your parent can no longer live alone. They move in with you. +₹15,000/month expenses.',
        condition: (state) => state.playerAge >= 35 && !state.dependents.some(d => d.type === 'parent'),
    },
    {
        id: 'tax_audit',
        name: 'Tax Audit',
        category: 'life',
        severity: 'major',
        cost: 50000,
        cost_pct_income: 0.30,
        getMessage: () => 'Income Tax notice! Penalty + back-taxes. Should have hired that CA.',
        condition: (state) => state.currentJob && state.currentJob.salary > 500000,
    },
    {
        id: 'lawsuit',
        name: 'Business Lawsuit',
        category: 'life',
        severity: 'major',
        cost: 300000,
        getMessage: () => 'A customer is suing your business. Lawyer retainer + court fees.',
        condition: (state) => state.currentJob && state.currentJob.type.includes('Tier 3'),
    },
    {
        id: 'theft',
        name: 'Online Scam',
        category: 'life',
        severity: 'moderate',
        cost_pct_balance: 0.08,
        getMessage: () => '"Your KYC is expiring!" You clicked the link. 8% of your bank balance — gone.',
        condition: (state) => state.balance > 500000,
    },
    {
        id: 'wedding_expense',
        name: 'Family Wedding',
        category: 'life',
        severity: 'moderate',
        cost: 200000,
        getMessage: (state) => {
            const child = pickDependent(state.dependents, 'child');
            return child && (child.childAgeMonths || 0) > 252
                ? `${child.name} is getting married! You contribute ₹2L to the wedding.`
                : 'Your sibling is getting married. Family expects you to contribute ₹2L.';
        },
        condition: (state) => state.playerAge >= 28 && state.balance > 500000,
    },

    // ============ POSITIVE EVENTS ============
    {
        id: 'work_bonus',
        name: 'Performance Bonus!',
        category: 'positive',
        severity: 'positive',
        effect: 'bonus',
        getMessage: (state) => `Appraisal day! Your manager rated you 5/5. Bonus: ₹${state.currentJob ? state.currentJob.salary.toLocaleString() : '0'}.`,
        condition: (state) => state.currentJob && (state.currentJob.type.includes('Tier 2') || state.currentJob.type.includes('Tier 4')),
    },
    {
        id: 'inheritance',
        name: 'Surprise Inheritance',
        category: 'positive',
        severity: 'positive',
        amount_min: 200000,
        amount_max: 1000000,
        getMessage: () => 'A distant uncle you barely knew left you money in his will. Chacha was loaded!',
        condition: () => true,
    },
    {
        id: 'property_appreciation',
        name: 'Property Boom',
        category: 'positive',
        severity: 'positive',
        effect: 'property_value_up',
        appreciation_pct: 0.15,
        getMessage: () => 'New metro line announced near your property! Prices surge 15% overnight.',
        condition: (state) => state.properties.length > 0,
    },
    {
        id: 'freelance_windfall',
        name: 'Side Hustle Win',
        category: 'positive',
        severity: 'positive',
        amount_min: 50000,
        amount_max: 200000,
        getMessage: () => 'Your weekend side project went viral. Brands are paying you for collabs!',
        condition: (state) => state.currentJob && (state.currentJob.type.includes('Creative') || state.currentJob.type.includes('Tech')),
    },
    {
        id: 'stock_dividend',
        name: 'Dividend Season',
        category: 'positive',
        severity: 'positive',
        effect: 'dividend',
        dividend_pct: 0.03,
        getMessage: () => 'Q4 results are out. Your holdings pay out juicy dividends!',
        condition: (state) => Object.keys(state.portfolio).some(k => (state.portfolio[k]?.qty || 0) > 0),
    },
    {
        id: 'tax_refund',
        name: 'Tax Refund',
        category: 'positive',
        severity: 'positive',
        amount_min: 10000,
        amount_max: 50000,
        getMessage: () => 'ITR processed! Refund credited to your bank account.',
        condition: () => true,
    },
    {
        id: 'child_scholarship',
        name: 'Child Gets Scholarship',
        category: 'positive',
        severity: 'positive',
        amount_min: 30000,
        amount_max: 100000,
        getMessage: (state) => {
            const child = pickDependent(state.dependents, 'child');
            return child ? `${child.name} topped their exams and won a scholarship!` : 'Your child won a scholarship!';
        },
        condition: (state) => state.dependents.some(d => d.type === 'child' && (d.childAgeMonths || 0) >= 60),
    },
    {
        id: 'spouse_promotion',
        name: 'Spouse Gets Promoted',
        category: 'positive',
        severity: 'positive',
        effect: 'spouse_income_boost',
        boost_amount: 10000,
        getMessage: (state) => {
            const spouse = pickDependent(state.dependents, 'spouse');
            return spouse ? `${spouse.name} got promoted at work! Monthly income +₹10,000.` : 'Your spouse got a raise!';
        },
        condition: (state) => state.dependents.some(d => d.type === 'spouse' && d.isWorking),
    },
];

export const CRISIS_WEIGHTS = {
    health: 25,
    market: 15,
    property: 20,
    life: 15,
    positive: 25,
};
