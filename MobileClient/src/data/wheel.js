// The spin-the-wheel prizes. `weight` is the relative chance; nothing here can hurt the player.
// Cash is kept small next to a life's income, so a day of spins is a treat and not a strategy.
export const WHEEL_SEGMENTS = [
    { id: 'cash2k',   label: '₹2,000',   sub: 'cash',      color: '#2f7d6d', weight: 22, kind: 'cash',      amount: 2000 },
    { id: 'happy8',   label: '+8',       sub: 'mood',      color: '#c2547a', weight: 16, kind: 'happiness', amount: 8 },
    { id: 'cash5k',   label: '₹5,000',   sub: 'cash',      color: '#3a6fb0', weight: 18, kind: 'cash',      amount: 5000 },
    { id: 'health10', label: '+10',      sub: 'health',    color: '#b4533c', weight: 12, kind: 'health',    amount: 10 },
    { id: 'cash10k',  label: '₹10,000',  sub: 'cash',      color: '#8a6bc2', weight: 10, kind: 'cash',      amount: 10000 },
    { id: 'meals3',   label: '3 meals',  sub: 'pantry',    color: '#6f9a3a', weight: 11, kind: 'meals',     amount: 3 },
    { id: 'cash25k',  label: '₹25,000',  sub: 'jackpot',   color: '#d4a017', weight: 3,  kind: 'cash',      amount: 25000 },
    { id: 'again',    label: 'Spin again', sub: 'free',    color: '#4b5878', weight: 8,  kind: 'again',     amount: 0 },
];

export function pickSegment(rand = Math.random) {
    const total = WHEEL_SEGMENTS.reduce((n, s) => n + s.weight, 0);
    let r = rand() * total;
    for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
        r -= WHEEL_SEGMENTS[i].weight;
        if (r <= 0) return i;
    }
    return WHEEL_SEGMENTS.length - 1;
}

export function describeReward(seg) {
    switch (seg.kind) {
        case 'cash':      return `You won ₹${seg.amount.toLocaleString()}!`;
        case 'happiness': return `You feel great: +${seg.amount} mood.`;
        case 'health':    return `You feel stronger: +${seg.amount} health.`;
        case 'meals':     return `${seg.amount} meals were added to your pantry.`;
        case 'again':     return 'A free spin! No ad needed.';
        default:          return '';
    }
}
