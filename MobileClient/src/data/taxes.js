// Indian New Tax Regime (Simplified for game)
// These are annual income slabs

export const INCOME_TAX_SLABS = [
    { upto: 300000, rate: 0 },       // Up to 3L: 0%
    { upto: 700000, rate: 0.05 },    // 3L - 7L: 5%
    { upto: 1000000, rate: 0.10 },   // 7L - 10L: 10%
    { upto: 1200000, rate: 0.15 },   // 10L - 12L: 15%
    { upto: 1500000, rate: 0.20 },   // 12L - 15L: 20%
    { upto: Infinity, rate: 0.30 },  // Above 15L: 30%
];

// Calculate annual income tax using progressive slabs
export const calculateIncomeTax = (annualIncome) => {
    let tax = 0;
    let remaining = annualIncome;
    let prevLimit = 0;

    for (const slab of INCOME_TAX_SLABS) {
        const taxableInSlab = Math.min(remaining, slab.upto - prevLimit);
        if (taxableInSlab <= 0) break;
        tax += taxableInSlab * slab.rate;
        remaining -= taxableInSlab;
        prevLimit = slab.upto;
    }

    return Math.round(tax);
};

// Capital gains tax rates
export const CAPITAL_GAINS = {
    stock_short_term: 0.15,      // < 12 months: 15% of profit
    stock_long_term: 0.10,       // > 12 months: 10% of profit above 1L
    stock_long_term_exempt: 100000, // first 1L exempt
    real_estate_short_term: 0.30, // < 24 months: 30%
    real_estate_long_term: 0.125, // > 24 months: 12.5%
    real_estate_short_term_months: 24,
};

// Tax deduction limits (annual)
export const TAX_DEDUCTIONS = {
    home_loan_interest: 200000,   // Section 24: up to 2L/year
    education_loan_interest: 150000, // Section 80E: up to 1.5L/year
    life_insurance_premium: 150000,  // Section 80C: up to 1.5L/year
};

// ── Two regimes ───────────────────────────────────────────────────────────────
// NEW regime (the default since FY23-24): lower slabs, a ₹75,000 standard deduction and a rebate that makes income up to ₹7L tax-free,
//   but almost no deductions: 80C, 80D, 80CCD(1B), Sec 24(b) on a self-occupied home and 80E do NOT apply.
// OLD regime: higher slabs and a ₹50,000 standard deduction, but those deductions are allowed.
export const OLD_REGIME_SLABS = [
    { upto: 250000, rate: 0 },
    { upto: 500000, rate: 0.05 },
    { upto: 1000000, rate: 0.20 },
    { upto: Infinity, rate: 0.30 },
];
export const STANDARD_DEDUCTION = { new: 75000, old: 50000 };
export const REBATE_87A_LIMIT = { new: 700000, old: 500000 }; // taxable income up to this pays no tax

export const calculateTaxByRegime = (taxableIncome, regime = 'new') => {
    if (taxableIncome <= (REBATE_87A_LIMIT[regime] || 0)) return 0;
    const slabs = regime === 'old' ? OLD_REGIME_SLABS : INCOME_TAX_SLABS;
    let tax = 0, remaining = taxableIncome, prev = 0;
    for (const slab of slabs) {
        const inSlab = Math.min(remaining, slab.upto - prev);
        if (inSlab <= 0) break;
        tax += inSlab * slab.rate; remaining -= inSlab; prev = slab.upto;
    }
    return Math.round(tax);
};
