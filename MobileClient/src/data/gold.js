// Gold Investment Assets
// Three types: Digital Gold (spot price), Sovereign Gold Bonds (SGB), Physical Jewellery
// All prices in ₹ per gram (24k benchmark)

export const GOLD_PRICE_PER_GRAM_BASE = 7200; // ₹ per gram, 24k benchmark

export const GOLD_ASSETS = [
    {
        id: 'digital_gold',
        name: 'Digital Gold',
        type: 'digital',
        minGrams: 0.1,
        makingCharges: 0,
        liquidity: 'instant',
        taxNote: 'LTCG @20% with indexation if held >3 years',
        description: 'Buy pure 24k gold in fractions as small as 0.1g. No making charges, stored in certified vaults. Sell anytime at live market price. Best for small regular accumulation.',
    },
    {
        id: 'sgb',
        name: 'Sovereign Gold Bond',
        type: 'bond',
        minGrams: 1,
        makingCharges: 0,
        liquidity: '8-year lock (exit after 5)',
        interestRate: 0.025, // 2.5% annual interest on quantity × issue price
        taxNote: 'Capital gains EXEMPT at maturity. 2.5% annual interest taxable as income.',
        description: 'RBI-issued bonds linked to gold price. You earn 2.5% p.a. interest on top of gold appreciation. Zero capital gains tax if held to 8-year maturity. The most tax-efficient gold investment.',
    },
    {
        id: 'gold_jewellery',
        name: '22K Gold Jewellery',
        type: 'jewellery',
        minGrams: 10,
        makingCharges: 0.12, // 12% making charges on purchase
        liquidity: 'sell at 20% discount (jeweller buyback)',
        purity: 0.916, // 22k = 91.6% pure
        taxNote: 'LTCG @20% with indexation if held >3 years',
        description: 'Traditional gold jewellery. 22k purity (91.6%). Making charges of 12% are a sunk cost — you only get spot price on resale. Emotional and cultural value, but worst returns of the three.',
    },
];

export const getGoldPrice = (assetId, basePrice, monthsHeld = 0) => {
    // Gold appreciates ~8% p.a. on average with volatility
    return basePrice;
};
