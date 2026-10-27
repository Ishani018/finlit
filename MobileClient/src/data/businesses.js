// SIDE HUSTLES / BUSINESS OWNERSHIP
// A business is a one-time-purchase income asset: upfront cost, then a monthly
// revenue roll (randomised within a range) minus a fixed running cost, with a
// small monthly chance of failure (total loss of future income, no refund).
// Deliberately NOT a guaranteed-profit machine — running cost + failure risk
// keep it from being a risk-free money glitch; prereqs gate it behind having
// already built some financial standing.
//
// These used to be Tier 3 "small business" career jobs (owning one replaced
// your salary job entirely). Moved here so a business is something you own
// alongside your job, and you can own more than one at a time.

export const MAX_CONCURRENT_BUSINESSES = 2;

export const BUSINESS_TYPES = [
    {
        id: 'small_candle',
        name: 'Candle Business',
        tier: 1,
        cost: 50000,
        min_net_worth: 0,
        min_credit_score: 550,
        req_degrees: [],
        revenue_range: [15000, 26000],
        running_cost: 6000,
        failure_chance: 0.03,
        salvage_pct: 0.3,
        image: require('../../assets/jobs/small_candle_business.png'),
        description: 'Niche aesthetic product. Great for online sales or gift shops.',
    },
    {
        id: 'maggi_cafe',
        name: 'Maggi Cafe',
        tier: 1,
        cost: 200000,
        min_net_worth: 0,
        min_credit_score: 550,
        req_degrees: [],
        revenue_range: [30000, 50000],
        running_cost: 12000,
        failure_chance: 0.035,
        salvage_pct: 0.3,
        image: require('../../assets/jobs/maggi_cafe.png'),
        description: 'Student favorite. Low cost to set up, high volume of cheap sales.',
    },
    {
        id: 'dosashop',
        name: 'Dosa Shop',
        tier: 1,
        cost: 300000,
        min_net_worth: 0,
        min_credit_score: 580,
        req_degrees: [],
        revenue_range: [60000, 100000],
        running_cost: 24000,
        failure_chance: 0.03,
        salvage_pct: 0.3,
        image: require('../../assets/jobs/dosashop.png'),
        description: 'High profit margin. Batter is cheap, but Dosa sells for a premium price.',
    },
    {
        id: 'juice_shop',
        name: 'Juice Shop',
        tier: 1,
        cost: 200000,
        min_net_worth: 0,
        min_credit_score: 550,
        req_degrees: [],
        revenue_range: [34000, 56000],
        running_cost: 13000,
        failure_chance: 0.04,
        salvage_pct: 0.3,
        image: require('../../assets/jobs/juice_bar.png'),
        description: 'Seasonal spikes. High profit on liquids and ice, low cost of goods.',
    },
    {
        id: 'sandwich_shop',
        name: 'Sandwich Shop',
        tier: 1,
        cost: 400000,
        min_net_worth: 0,
        min_credit_score: 580,
        req_degrees: [],
        revenue_range: [38000, 62000],
        running_cost: 15000,
        failure_chance: 0.035,
        salvage_pct: 0.3,
        image: require('../../assets/jobs/sandwich_shop.png'),
        description: 'Lunch rush is your only real income time. Location matters more than food.',
    },
    {
        id: 'tailor',
        name: 'Tailor Business',
        tier: 1,
        cost: 200000,
        min_net_worth: 0,
        min_credit_score: 550,
        req_degrees: ['Vocational Training'],
        revenue_range: [30000, 50000],
        running_cost: 10000,
        failure_chance: 0.02,
        salvage_pct: 0.35,
        image: require('../../assets/jobs/tailor_business.png'),
        description: 'Custom fits command higher prices than ready-made clothes.',
    },
    {
        id: 'irani_cafe',
        name: 'Irani Cafe',
        tier: 2,
        cost: 500000,
        min_net_worth: 0,
        min_credit_score: 600,
        req_degrees: [],
        revenue_range: [45000, 75000],
        running_cost: 18000,
        failure_chance: 0.02,
        salvage_pct: 0.35,
        image: require('../../assets/jobs/irani_cafe.png'),
        description: 'Heritage value. Loyal customer base ensures steady, reliable profit.',
    },
    {
        id: 'florist',
        name: 'Florist',
        tier: 2,
        cost: 300000,
        min_net_worth: 0,
        min_credit_score: 600,
        req_degrees: [],
        revenue_range: [45000, 75000],
        running_cost: 18000,
        failure_chance: 0.045,
        salvage_pct: 0.25,
        image: require('../../assets/jobs/florist_and_bouquet_shop.png'),
        description: 'High risk inventory (flowers rot). High markup on weddings and holidays.',
    },
    {
        id: 'boots_workshop',
        name: 'Boots Workshop',
        tier: 2,
        cost: 400000,
        min_net_worth: 0,
        min_credit_score: 620,
        req_degrees: ['Vocational Training'],
        revenue_range: [38000, 62000],
        running_cost: 15000,
        failure_chance: 0.025,
        salvage_pct: 0.4,
        image: require('../../assets/jobs/boots_workshop.png'),
        description: 'Specialized leather goods. Durable products justify high prices.',
    },
    {
        id: 'print_shop',
        name: 'Print Shop',
        tier: 2,
        cost: 800000,
        min_net_worth: 0,
        min_credit_score: 650,
        req_degrees: [],
        revenue_range: [34000, 56000],
        running_cost: 13000,
        failure_chance: 0.025,
        salvage_pct: 0.45,
        image: require('../../assets/jobs/print_shop.png'),
        description: 'B2B service. Steady work from local businesses and students.',
    },
    {
        id: 'kirana_store',
        name: 'Grocery Store',
        tier: 2,
        cost: 500000,
        min_net_worth: 0,
        min_credit_score: 620,
        req_degrees: [],
        revenue_range: [23000, 37000],
        running_cost: 9000,
        failure_chance: 0.02,
        salvage_pct: 0.4,
        image: require('../../assets/jobs/kirana_store.png'),
        description: "Tiny margins, but everyone needs groceries. A volume game with long hours.",
    },
    {
        id: 'hardware_shop',
        name: 'Hardware Shop',
        tier: 2,
        cost: 1000000,
        min_net_worth: 0,
        min_credit_score: 650,
        req_degrees: [],
        revenue_range: [42000, 68000],
        running_cost: 16000,
        failure_chance: 0.02,
        salvage_pct: 0.45,
        image: require('../../assets/jobs/hardware_shop.png'),
        description: 'Selling tools is safer than using them. Steady local demand for repairs.',
    },
    {
        id: 'juice_bar',
        name: 'Juice Bar (Premium)',
        tier: 2,
        cost: 800000,
        min_net_worth: 0,
        min_credit_score: 650,
        req_degrees: [],
        revenue_range: [53000, 87000],
        running_cost: 21000,
        failure_chance: 0.04,
        salvage_pct: 0.3,
        image: require('../../assets/jobs/juice_bar.png'),
        description: 'Similar to juice shop but trendier. Higher prices for "organic" branding.',
    },
    {
        id: 'hairdresser',
        name: 'Hairdresser (Salon)',
        tier: 2,
        cost: 500000,
        min_net_worth: 0,
        min_credit_score: 650,
        req_degrees: ['Vocational Training'],
        revenue_range: [49000, 81000],
        running_cost: 19000,
        failure_chance: 0.015,
        salvage_pct: 0.35,
        image: require('../../assets/jobs/hairdresser.png'),
        description: 'Recession-proof. Everyone needs a haircut. Tips add to the income.',
    },
    {
        id: 'pet_grooming',
        name: 'Pet Grooming Shop',
        tier: 2,
        cost: 600000,
        min_net_worth: 0,
        min_credit_score: 650,
        req_degrees: [],
        revenue_range: [68000, 112000],
        running_cost: 27000,
        failure_chance: 0.025,
        salvage_pct: 0.35,
        image: require('../../assets/jobs/pet_grooming_shop.png'),
        description: 'Luxury service for pets. Growing market with high customer retention.',
    },
    {
        id: 'sweet_shop',
        name: 'Sweet Shop',
        tier: 3,
        cost: 1000000,
        min_net_worth: 800000,
        min_credit_score: 680,
        req_degrees: [],
        revenue_range: [76000, 124000],
        running_cost: 30000,
        failure_chance: 0.03,
        salvage_pct: 0.3,
        image: require('../../assets/jobs/sweet_shop.png'),
        description: 'High volume during festivals. Perishable inventory requires careful management.',
    },
];

// Deterministic-ish random revenue roll within the business's range
export const rollBusinessRevenue = (business) => {
    const [lo, hi] = business.revenue_range;
    return Math.round(lo + Math.random() * (hi - lo));
};

// =============================================================================
// STAFFING — hire workers and a manager so a business doesn't have to be
// grinded solo on top of a real job. Unstaffed (no manager), a business earns
// less and fails more often, and the strain costs the player happiness/health
// each month. A manager removes the strain and the penalties; workers add a
// skill-scaled revenue bonus, but only really pay off once there's a manager
// to direct them.
// =============================================================================

export const MAX_WORKERS_PER_BUSINESS = 3;

const STAFF_FIRST_NAMES = [
    'Aarav', 'Vihaan', 'Aditya', 'Rohan', 'Kabir', 'Ishaan', 'Arjun', 'Dev',
    'Karan', 'Nikhil', 'Ananya', 'Diya', 'Ishita', 'Meera', 'Priya', 'Riya',
    'Sneha', 'Tanya', 'Zoya', 'Kavya',
];
const STAFF_LAST_NAMES = [
    'Sharma', 'Verma', 'Gupta', 'Iyer', 'Nair', 'Patel', 'Reddy', 'Singh',
    'Mehta', 'Joshi', 'Khan', 'Das', 'Rao', 'Kapoor', 'Bansal',
];

const randomStaffName = () => {
    const f = STAFF_FIRST_NAMES[Math.floor(Math.random() * STAFF_FIRST_NAMES.length)];
    const l = STAFF_LAST_NAMES[Math.floor(Math.random() * STAFF_LAST_NAMES.length)];
    return `${f} ${l}`;
};

// Generates a fresh batch of generic candidates for a role on a given business.
// Not persisted — regenerated each time the hiring panel is opened.
export const generateStaffCandidates = (business, role, count = 3) => {
    const baseWage = role === 'manager'
        ? Math.round(business.running_cost * 1.1)
        : Math.round(business.running_cost * 0.45);
    return Array.from({ length: count }, () => {
        const skill = 1 + Math.floor(Math.random() * 5); // 1-5 stars
        const wage = Math.round(baseWage * (0.75 + skill * 0.1));
        return {
            id: `cand_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            name: randomStaffName(),
            role, skill, wage,
        };
    });
};

// Monthly economics for one owned business, given its current staffing.
export const getStaffedEconomics = (business, owned) => {
    const manager = owned.manager || null;
    const workers = owned.workers || [];
    const workerSkillSum = workers.reduce((s, w) => s + w.skill, 0);
    const wageCost = (manager?.wage || 0) + workers.reduce((s, w) => s + w.wage, 0);

    const revenueMultiplier = manager
        ? 1 + workerSkillSum * 0.03   // workers pay off once there's a manager directing them
        : 1 - Math.min(0.5, workerSkillSum * 0.01); // mostly wasted without oversight
    const soloMultiplier = manager ? 1 : 0.75;       // running it solo on top of a job hurts output
    const failureMultiplier = manager ? 0.7 : 1.5;

    return {
        wageCost,
        revenueMultiplier: revenueMultiplier * soloMultiplier,
        failureMultiplier,
        isUnstaffed: !manager,
    };
};
