export const INSURANCE_PLANS = [
    {
        id: 'health_basic',
        name: 'Basic Health Insurance',
        type: 'health',
        premium: 1500, // per month
        coverage: 0.6, // 60% of medical costs
        description: 'Covers 60% of medical expenses. Essential safety net for emergencies.'
    },
    {
        id: 'health_premium',
        name: 'Premium Health Insurance',
        type: 'health',
        premium: 4000,
        coverage: 0.9, // 90% of medical costs
        description: 'Covers 90% of medical expenses including specialist care and surgeries.'
    },
    {
        id: 'life_basic',
        name: 'Term Life Insurance',
        type: 'life',
        premium: 2000,
        payout: 2000000, // 20L payout
        description: 'Pays ₹20L to dependents on critical life setback. Tax deductible up to ₹1.5L/year.'
    },
    {
        id: 'life_premium',
        name: 'Premium Life Insurance',
        type: 'life',
        premium: 5000,
        payout: 5000000, // 50L payout
        description: 'Pays ₹50L to dependents. Higher coverage for breadwinners with families.'
    },
    {
        id: 'property_insurance',
        name: 'Property Insurance',
        type: 'property',
        premium_rate: 0.005,
        coverage: 0.8,
        description: 'Covers 80% of property damage from floods, earthquakes, and fires. Premium = 0.5% of property value/year.'
    },
    {
        id: 'family_floater',
        name: 'Family Floater Plan',
        type: 'family',
        premium: 3500,
        coverage: 0.75,
        description: 'Single plan covering your entire family. 75% of medical costs for spouse and all children included.'
    },
    {
        id: 'child_education',
        name: 'Child Education Cover',
        type: 'family',
        premium: 2000,
        payout: 1500000,
        description: 'Pays ₹15L towards your child\'s education if you face a critical setback. Protects their future.'
    },
];
