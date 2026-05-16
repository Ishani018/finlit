export const LOAN_TYPES = [
    {
        id: 'personal_loan',
        name: 'Personal Loan',
        type: 'unsecured',
        max_amount: 500000, // 5L
        base_interest: 12, // 12% p.a.
        max_tenure: 60, // 5 years in months
        min_income: 15000, // minimum monthly salary
        min_credit_score: 600,
        description: 'Unsecured loan for any purpose. High interest rate, no collateral needed.'
    },
    {
        id: 'education_loan',
        name: 'Education Loan',
        type: 'education',
        max_amount: 5000000, // 50L (covers any degree)
        base_interest: 8, // 8% p.a.
        max_tenure: 120, // 10 years
        min_income: 0, // students can take it
        min_credit_score: 500,
        description: 'Low-interest loan for education. Interest is tax deductible up to ₹1.5L/year.'
    },
    {
        id: 'home_loan',
        name: 'Home Loan',
        type: 'secured',
        ltv: 0.8, // Loan-to-value: can borrow up to 80% of property price
        base_interest: 8.5, // 8.5% p.a.
        max_tenure: 240, // 20 years
        min_income: 0, // checked as EMI < income/3
        min_credit_score: 650,
        description: 'Mortgage for buying property. Interest deductible up to ₹2L/year. EMI must be < 1/3 of income.'
    },
    {
        id: 'business_loan',
        name: 'Business Loan',
        type: 'unsecured',
        max_amount: 5000000, // 50L
        base_interest: 14, // 14% p.a.
        max_tenure: 84, // 7 years
        min_income: 50000,
        min_credit_score: 700,
        min_net_worth: 2000000, // 20L
        description: 'Capital for starting or scaling a business. Requires strong financials.'
    },
    {
        id: 'loan_against_property',
        name: 'Loan Against Property',
        type: 'secured',
        ltv: 0.6, // 60% of owned property value
        base_interest: 10, // 10% p.a.
        max_tenure: 180, // 15 years
        min_income: 0,
        min_credit_score: 600,
        description: 'Borrow against property you already own. Lower rate than personal loan.'
    }
];

// EMI formula: P × r × (1+r)^n / ((1+r)^n - 1)
export const calculateEMI = (principal, annualRate, tenureMonths) => {
    const r = annualRate / 100 / 12; // monthly rate
    if (r === 0) return principal / tenureMonths;
    const factor = Math.pow(1 + r, tenureMonths);
    return Math.round(principal * r * factor / (factor - 1));
};

// Get interest rate adjusted by credit score
export const getAdjustedRate = (baseRate, creditScore) => {
    if (creditScore >= 800) return baseRate - 1.0;
    if (creditScore >= 750) return baseRate - 0.5;
    if (creditScore >= 700) return baseRate;
    if (creditScore >= 650) return baseRate + 0.5;
    if (creditScore >= 600) return baseRate + 1.5;
    return baseRate + 3.0; // poor credit
};
