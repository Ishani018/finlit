import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useGame } from '../context/GameContext';
import { LOAN_TYPES, getAdjustedRate } from '../data/loans';

const C = { panel: '#0d1020', border: '#1a2040', sage: '#4ade80', red: '#f87171', gold: '#fbbf24', cream: '#c8d4f0', dim: '#7d8ab0', dark: '#5a6890', lime: '#a3e635', orange: '#fb923c' };
const BANDS = [
    { min: 750, label: 'EXCELLENT', color: '#4ade80' }, { min: 700, label: 'GOOD', color: '#a3e635' },
    { min: 650, label: 'FAIR', color: '#fbbf24' }, { min: 550, label: 'POOR', color: '#fb923c' }, { min: 0, label: 'BAD', color: '#f87171' },
];
const money = (n) => `₹${Math.round(n).toLocaleString()}`;
const RATING = { good: { t: 'GOOD', c: C.sage }, fair: { t: 'FAIR', c: C.gold }, poor: { t: 'POOR', c: C.red }, none: { t: 'NOT YET', c: C.dark } };

// A plain-language CIBIL report: the score, what is moving it, what it unlocks, and what to do next.
export default function CibilPanel({ onShowDialog }) {
    const { creditScore, creditHistory = [], loans, creditCard, currentJob, balance, totalMonthsPlayed, getTotalEMI,
        creditBuilder, creditBuilderDone, startCreditBuilder, CREDIT_BUILDER, spouseIncome } = useGame();
    const [showHow, setShowHow] = useState(false);
    const band = BANDS.find(b => creditScore >= b.min) || BANDS[4];
    const pct = Math.min(Math.max((creditScore - 300) / 600, 0), 1);

    const emi = getTotalEMI ? getTotalEMI() : loans.reduce((s, l) => s + l.emi, 0);
    const salary = currentJob ? currentJob.salary : 0;
    const missed = loans.filter(l => l.missedPayments > 0).length;
    const util = creditCard && creditCard.limit ? creditCard.balance / creditCard.limit : null;
    const dti = salary > 0 ? emi / salary : null;
    const types = new Set(loans.map(l => l.loanTypeId || l.type)).size + (creditCard ? 1 : 0);

    const factors = [
        { name: 'Paying on time', weight: 'Biggest factor',
          r: missed > 0 ? 'poor' : (loans.length || creditCard) ? 'good' : 'none',
          line: missed > 0 ? `${missed} loan${missed > 1 ? 's have' : ' has'} missed payments. Catch up now.` : (loans.length || creditCard) ? 'No missed payments. Each on-time month adds +2.' : 'You have nothing to pay yet, so there is no record.' },
        { name: 'Card usage', weight: 'High',
          r: util === null ? 'none' : util < 0.3 ? 'good' : util < 0.6 ? 'fair' : 'poor',
          line: util === null ? 'No credit card. A card used lightly builds your record.' : `You use ${Math.round(util * 100)}% of your limit. Under 30% is healthy.` },
        { name: 'Debt vs income', weight: 'High',
          r: dti === null ? 'none' : dti < 0.3 ? 'good' : dti < 0.5 ? 'fair' : 'poor',
          line: dti === null ? 'You have no income to measure against.' : emi === 0 ? 'No EMIs. Nothing is stretching your pay.' : `EMIs take ${Math.round(dti * 100)}% of your salary. Over 50% is the debt trap.` },
        { name: 'Credit mix', weight: 'Medium',
          r: types >= 2 ? 'good' : types === 1 ? 'fair' : 'none',
          line: types >= 2 ? 'You handle more than one kind of credit.' : types === 1 ? 'One kind of credit. A second, handled well, helps.' : 'A thin file. Start small and repay on time.' },
        { name: 'Age of record', weight: 'Medium',
          r: totalMonthsPlayed >= 60 ? 'good' : totalMonthsPlayed >= 18 ? 'fair' : 'poor',
          line: `${totalMonthsPlayed} months of history. This only improves with time.` },
    ];

    // what the score unlocks, at your score and at 750
    const loanRows = LOAN_TYPES.filter(l => ['personal_loan', 'home_loan', 'education_loan'].includes(l.id)).map(l => ({
        name: l.name, need: l.min_credit_score, ok: creditScore >= l.min_credit_score,
        now: getAdjustedRate(l.base_interest, creditScore), best: getAdjustedRate(l.base_interest, 750),
    }));

    const hist = creditHistory.slice(-12);
    const hMin = Math.min(...hist.map(h => h.s), creditScore) - 10, hMax = Math.max(...hist.map(h => h.s), creditScore) + 10;
    const since = totalMonthsPlayed - (creditBuilderDone ?? -99);
    const cooling = since < CREDIT_BUILDER.cooldown;
    const monthsLeft = creditBuilder ? Math.max(0, creditBuilder.endMonth - totalMonthsPlayed) : 0;

    const T = (s, st) => <Text style={[{ fontFamily: 'VT323_400Regular' }, st]}>{s}</Text>;

    return (
        <View>
            {/* The score */}
            <View style={{ backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 14 }}>
                {T('YOUR CIBIL SCORE', { fontSize: 12, color: C.dark, letterSpacing: 3 })}
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
                    {T(String(creditScore), { fontSize: 76, color: band.color, lineHeight: 78 })}
                    <View style={{ paddingBottom: 10 }}>
                        {T(band.label, { fontSize: 24, color: band.color, lineHeight: 24 })}
                        {T('300 to 900', { fontSize: 14, color: C.dark })}
                    </View>
                </View>
                <View style={{ height: 10, backgroundColor: '#141b36', marginTop: 6 }}>
                    <View style={{ width: `${pct * 100}%`, height: 10, backgroundColor: band.color }} />
                    {[650, 700, 750].map(m => <View key={m} style={{ position: 'absolute', left: `${((m - 300) / 600) * 100}%`, top: 0, width: 2, height: 10, backgroundColor: '#06080f' }} />)}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    {['300', '650', '700', '750', '900'].map((t, i) => <Text key={i} style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark }}>{t}</Text>)}
                </View>
            </View>

            {/* History */}
            {hist.length > 1 && (
                <View style={{ backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 14 }}>
                    {T('LAST 12 MONTHS', { fontSize: 12, color: C.dark, letterSpacing: 3, marginBottom: 8 })}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 70, gap: 4 }}>
                        {hist.map((h, i) => {
                            const bh = 8 + ((h.s - hMin) / Math.max(1, hMax - hMin)) * 62;
                            const col = (BANDS.find(b => h.s >= b.min) || BANDS[4]).color;
                            return <View key={i} style={{ flex: 1, height: bh, backgroundColor: col, opacity: i === hist.length - 1 ? 1 : 0.55 }} />;
                        })}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                        {T(`${hist[0].s}`, { fontSize: 14, color: C.dim })}
                        {T(hist[hist.length - 1].s >= hist[0].s ? `+${hist[hist.length - 1].s - hist[0].s} since then` : `${hist[hist.length - 1].s - hist[0].s} since then`, { fontSize: 14, color: hist[hist.length - 1].s >= hist[0].s ? C.sage : C.red })}
                    </View>
                </View>
            )}

            {/* Factors */}
            {T('WHAT IS MOVING IT', { fontSize: 12, color: C.dark, letterSpacing: 3, marginBottom: 8 })}
            <View style={{ backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border, marginBottom: 14 }}>
                {factors.map((f, i) => (
                    <View key={f.name} style={{ padding: 12, borderTopWidth: i ? 1 : 0, borderColor: '#141b36' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            {T(f.name, { fontSize: 21, color: C.cream })}
                            {T(RATING[f.r].t, { fontSize: 17, color: RATING[f.r].c, letterSpacing: 2 })}
                        </View>
                        {T(`${f.weight}. ${f.line}`, { fontSize: 15, color: C.dim, lineHeight: 16 })}
                    </View>
                ))}
            </View>

            {/* What it unlocks */}
            {T('WHAT YOUR SCORE GETS YOU', { fontSize: 12, color: C.dark, letterSpacing: 3, marginBottom: 8 })}
            <View style={{ backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border, marginBottom: 14 }}>
                {loanRows.map((r, i) => (
                    <View key={r.name} style={{ padding: 12, borderTopWidth: i ? 1 : 0, borderColor: '#141b36' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            {T(r.name, { fontSize: 21, color: C.cream })}
                            {T(r.ok ? 'APPROVED' : `NEEDS ${r.need}`, { fontSize: 16, color: r.ok ? C.sage : C.red, letterSpacing: 2 })}
                        </View>
                        {T(r.ok ? `Your rate: ${r.now.toFixed(1)}%${r.now > r.best ? `  ·  at 750 it would be ${r.best.toFixed(1)}%` : '  ·  the best rate available'}` : `Reach ${r.need} to be considered.`, { fontSize: 15, color: C.dim })}
                    </View>
                ))}
            </View>

            {/* Credit builder */}
            {T('BUILD IT UP', { fontSize: 12, color: C.dark, letterSpacing: 3, marginBottom: 8 })}
            <View style={{ backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 14 }}>
                {T('Credit builder deposit', { fontSize: 24, color: C.cream })}
                {creditBuilder ? (
                    <View>
                        {T(`${money(creditBuilder.amount)} is locked. ${monthsLeft} month${monthsLeft === 1 ? '' : 's'} to go.`, { fontSize: 17, color: C.gold })}
                        {T(`You get it back with ${Math.round(CREDIT_BUILDER.interestPct * 100)}% interest, and +${CREDIT_BUILDER.points} CIBIL.`, { fontSize: 15, color: C.dim })}
                        <View style={{ height: 8, backgroundColor: '#141b36', marginTop: 8 }}>
                            <View style={{ width: `${Math.min(100, ((totalMonthsPlayed - creditBuilder.startMonth) / CREDIT_BUILDER.months) * 100)}%`, height: 8, backgroundColor: C.gold }} />
                        </View>
                    </View>
                ) : (
                    <View>
                        {T(`Lock ${money(CREDIT_BUILDER.amount)} for ${CREDIT_BUILDER.months} months. It comes back with interest, and the bank reports it: +${CREDIT_BUILDER.points} CIBIL. One every ${CREDIT_BUILDER.cooldown} months.`, { fontSize: 15, color: C.dim, lineHeight: 16, marginBottom: 10 })}
                        <TouchableOpacity activeOpacity={0.85}
                            disabled={cooling || creditScore >= 800 || balance < CREDIT_BUILDER.amount}
                            onPress={() => { const r = startCreditBuilder(); onShowDialog && onShowDialog(r.success ? 'Locked in' : 'Cannot start', r.msg, r.success ? 'success' : 'error'); }}
                            style={{ height: 46, borderRadius: 8, backgroundColor: cooling || creditScore >= 800 || balance < CREDIT_BUILDER.amount ? '#141b36' : C.gold, alignItems: 'center', justifyContent: 'center' }}>
                            {T(creditScore >= 800 ? 'YOUR SCORE IS ALREADY HIGH' : cooling ? `AGAIN IN ${CREDIT_BUILDER.cooldown - since} MONTHS` : balance < CREDIT_BUILDER.amount ? `NEED ${money(CREDIT_BUILDER.amount - balance)} MORE` : `LOCK ${money(CREDIT_BUILDER.amount)}`, { fontSize: 19, letterSpacing: 2, color: cooling || creditScore >= 800 || balance < CREDIT_BUILDER.amount ? C.dim : '#2a1c00' })}
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Ways to move the score */}
            <TouchableOpacity onPress={() => setShowHow(s => !s)} activeOpacity={0.7} style={{ paddingVertical: 6 }}>
                {T(`${showHow ? '▾' : '▸'} EVERY WAY TO RAISE OR LOWER IT`, { fontSize: 14, color: C.gold, letterSpacing: 2 })}
            </TouchableOpacity>
            {showHow && (
                <View style={{ backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 12, marginTop: 6 }}>
                    {[
                        ['+2', 'Every month you pay all EMIs on time', C.sage], ['+5', 'Each credit card payment', C.sage],
                        ['+10', 'Fully repaying a loan', C.sage], [`+${CREDIT_BUILDER.points}`, 'A finished credit builder deposit', C.sage],
                        ['−15', 'Leaving a credit card bill unpaid', C.red], ['−30', 'Missing an EMI', C.red], ['−50', 'A serious default', C.red],
                    ].map(([p, t, col], i) => (
                        <View key={i} style={{ flexDirection: 'row', gap: 12, paddingVertical: 5 }}>
                            {T(p, { fontSize: 22, color: col, width: 52 })}
                            {T(t, { fontSize: 17, color: C.cream, flex: 1 })}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}
