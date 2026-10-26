// SIDE HUSTLES / BUSINESS OWNERSHIP
// A business is a one-time-purchase income asset: upfront cost, then a monthly
// revenue roll (randomised within a range) minus a fixed running cost, with a
// small monthly chance of failure (total loss of future income, no refund).
// Deliberately NOT a guaranteed-profit machine — running cost + failure risk
// keep it from being a risk-free money glitch; prereqs gate it behind having
// already built some financial standing.

export const MAX_CONCURRENT_BUSINESSES = 2;

export const BUSINESS_TYPES = [
    {
        id: 'food_cart',
        name: 'Street Food Cart',
        tier: 1,
        cost: 120000,
        min_net_worth: 0,
        min_credit_score: 550,
        revenue_range: [6000, 16000],
        running_cost: 3500,
        failure_chance: 0.035,
        salvage_pct: 0.35,
        description: 'Low-cost mobile food stall. Cheap to start, but thin margins and weather-dependent footfall.',
    },
    {
        id: 'ecommerce_store',
        name: 'Online Store',
        tier: 1,
        cost: 200000,
        min_net_worth: 100000,
        min_credit_score: 600,
        revenue_range: [5000, 24000],
        running_cost: 5000,
        failure_chance: 0.04,
        salvage_pct: 0.3,
        description: 'Sell products online out of a small warehouse. Scales well but highly competitive — returns swing wildly month to month.',
    },
    {
        id: 'tuition_centre',
        name: 'Tuition Centre',
        tier: 1,
        cost: 150000,
        min_net_worth: 50000,
        min_credit_score: 580,
        revenue_range: [8000, 18000],
        running_cost: 2500,
        failure_chance: 0.02,
        salvage_pct: 0.4,
        description: 'Coach students after hours. Steady, low-risk income but capped by how many students you can realistically teach.',
    },
    {
        id: 'cafe',
        name: 'Small Café',
        tier: 2,
        cost: 900000,
        min_net_worth: 600000,
        min_credit_score: 660,
        revenue_range: [20000, 55000],
        running_cost: 22000,
        failure_chance: 0.03,
        salvage_pct: 0.4,
        description: 'A proper storefront café. Good upside once it finds regulars, but rent, staff and spoilage eat into every bad month.',
    },
    {
        id: 'gym',
        name: 'Neighbourhood Gym',
        tier: 2,
        cost: 1400000,
        min_net_worth: 900000,
        min_credit_score: 680,
        revenue_range: [30000, 68000],
        running_cost: 30000,
        failure_chance: 0.025,
        salvage_pct: 0.35,
        description: 'Membership-driven fitness studio. Reliable recurring revenue, but equipment upkeep and trainer salaries are a fixed drag.',
    },
    {
        id: 'consulting_firm',
        name: 'Consulting Firm',
        tier: 2,
        cost: 350000,
        min_net_worth: 400000,
        min_credit_score: 700,
        revenue_range: [15000, 50000],
        running_cost: 8000,
        failure_chance: 0.03,
        salvage_pct: 0.25,
        description: 'Freelance your expertise at scale. High-margin but feast-or-famine — client pipeline dries up some months.',
    },
    {
        id: 'manufacturing_unit',
        name: 'Small Manufacturing Unit',
        tier: 3,
        cost: 3200000,
        min_net_worth: 2800000,
        min_credit_score: 720,
        revenue_range: [70000, 160000],
        running_cost: 58000,
        failure_chance: 0.02,
        salvage_pct: 0.45,
        description: 'Produces goods at scale for wholesale buyers. The biggest cheque size, but also the biggest fixed costs if demand dips.',
    },
];

// Deterministic-ish random revenue roll within the business's range
export const rollBusinessRevenue = (business) => {
    const [lo, hi] = business.revenue_range;
    return Math.round(lo + Math.random() * (hi - lo));
};
