// Lucky Wheel prizes. Every prize is a perk inside the game (a waived bill, a loan written down, a hamper...),
// never a direct cash gift. `needs` limits a prize to players it can actually help.
export const WHEEL_SEGMENTS = [
    { id: 'emi',     label: 'EMI OFF',    title: 'EMI Holiday',       color: '#2f7d6d', weight: 14, kind: 'emi_holiday', needs: 'loans',   icon: require('../../assets/ui_comp/borrow.png'),
      text: 'No loan payments next month, and the bank pauses interest too.' },
    { id: 'loan',    label: 'LOAN CUT',   title: 'Loan Waiver',       color: '#c2547a', weight: 6,  kind: 'loan_cut',    needs: 'loans',   icon: require('../../assets/bank.png'),
      text: '10% of your biggest loan is written off (up to ₹1,50,000), and its EMI shrinks.' },
    { id: 'rent',    label: 'RENT FREE',  title: 'Rent Free',         color: '#3a6fb0', weight: 12, kind: 'rent_free',   needs: 'renting', icon: require('../../assets/ui_comp/home.png'),
      text: 'Your landlord skips next month\'s rent.' },
    { id: 'costs',   label: 'COSTS FREE', title: 'Running Costs Paid', color: '#b4533c', weight: 10, kind: 'costs_free', needs: 'costs',   icon: require('../../assets/cars/honda_city.png'),
      text: 'Fuel, servicing, vet and gadget upkeep are covered next month.' },
    { id: 'hamper',  label: 'HAMPER',     title: 'Grocery Hamper',    color: '#6f9a3a', weight: 16, kind: 'meals',       needs: null,      icon: require('../../assets/ui_comp/food_grocery.png'), amount: 5,
      text: '5 meals were added to your pantry.' },
    { id: 'checkup', label: 'CHECK-UP',   title: 'Free Check-up',     color: '#8a6bc2', weight: 14, kind: 'health',      needs: null,      icon: require('../../assets/ui_comp/hospital.png'), amount: 15,
      text: 'A free health check-up and some rest: +15 health.' },
    { id: 'fest',    label: 'FESTIVAL',   title: 'Festival Day',      color: '#d4a017', weight: 14, kind: 'happiness',   needs: null,      icon: require('../../assets/ui_comp/happyicon.png'), amount: 8,
      text: 'A lovely festival day with family: +8 mood.' },
    { id: 'again',   label: 'SPIN AGAIN', title: 'Spin Again',        color: '#4b5878', weight: 8,  kind: 'again',       needs: null,      icon: require('../../assets/ui_comp/nextbutton.png'),
      text: 'A free spin! No ad needed.' },
];

// ctx = { hasLoans, isRenting, hasRunningCosts } — prizes the player can't use are skipped so a spin is never wasted.
export function isEligible(seg, ctx = {}) {
    if (seg.needs === 'loans') return !!ctx.hasLoans;
    if (seg.needs === 'renting') return !!ctx.isRenting;
    if (seg.needs === 'costs') return !!ctx.hasRunningCosts;
    return true;
}

export function pickSegment(ctx, rand = Math.random) {
    const pool = WHEEL_SEGMENTS.map((s, i) => ({ s, i })).filter(({ s }) => isEligible(s, ctx));
    const total = pool.reduce((n, p) => n + p.s.weight, 0);
    let r = rand() * total;
    for (const p of pool) { r -= p.s.weight; if (r <= 0) return p.i; }
    return pool[pool.length - 1].i;
}
