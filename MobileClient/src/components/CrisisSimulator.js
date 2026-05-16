import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, ScrollView, Image, Dimensions } from 'react-native';

const { height: SH } = Dimensions.get('window');
const WARN_IMG  = require('../../assets/ui_comp/warning.png');
const BULB_IMG  = require('../../assets/ui_comp/bulb.png');

// ── Scenario definitions ──────────────────────────────────────────────────────

const SCENARIOS = [
    {
        id: 'job_loss',
        name: 'Job Loss',
        subtitle: '6 months with no income',
        color: '#f87171',
        simulate(s) {
            const salary      = s.currentJob?.salary || 0;
            const emi         = s.loans.reduce((t, l) => t + l.emi, 0);
            const living      = 15000;
            const burn        = emi + living;
            const runway      = burn > 0 ? Math.floor(s.balance / burn) : 999;
            const covered     = runway >= 6;
            const outcome     = runway >= 6 ? 'SURVIVED' : runway >= 3 ? 'CLOSE CALL' : 'CRITICAL';
            const incomeGap   = salary * 6;

            const rows = [
                { label: 'Monthly burn (EMI + living)', value: `₹${burn.toLocaleString()}`, bad: burn > s.balance / 3 },
                { label: 'Months your savings last',    value: runway >= 999 ? '∞' : `${runway} mo`, bad: runway < 6 },
                { label: 'Income gap over 6 months',    value: `₹${incomeGap.toLocaleString()}`, bad: true },
                { label: 'Emergency fund needed',        value: `₹${(burn * 6).toLocaleString()}`, bad: s.balance < burn * 6 },
            ];

            const tip = covered
                ? 'Solid emergency fund. Keep it in a liquid FD, not stocks.'
                : `You need ₹${(burn * 6 - s.balance).toLocaleString()} more in liquid savings. Park it in an FD.`;

            const defence = salary > 0 ? `₹${s.balance.toLocaleString()} liquid savings` : 'No active job to lose';
            return { outcome, rows, tip, defence };
        },
    },
    {
        id: 'medical',
        name: 'Medical Emergency',
        subtitle: '₹3L sudden hospitalisation',
        color: '#fb923c',
        simulate(s) {
            const BILL       = 300000;
            const healthPlan = s.activeInsurance.find(i => ['health_basic','health_premium','family_floater'].includes(i.planId));
            const coverage   = healthPlan
                ? (healthPlan.planId === 'health_premium' ? 0.9 : healthPlan.planId === 'family_floater' ? 0.75 : 0.6)
                : 0;
            const covered_amt = Math.round(BILL * coverage);
            const oop        = BILL - covered_amt;
            const canPay     = s.balance >= oop;
            const outcome    = coverage >= 0.75 ? 'SURVIVED' : (canPay ? 'CLOSE CALL' : 'CRITICAL');

            const rows = [
                { label: 'Hospital bill',         value: `₹${BILL.toLocaleString()}`,          bad: true },
                { label: 'Insurance covers',       value: coverage > 0 ? `₹${covered_amt.toLocaleString()} (${Math.round(coverage*100)}%)` : '₹0 — none', bad: coverage === 0 },
                { label: 'Out of pocket',          value: `₹${oop.toLocaleString()}`,           bad: oop > s.balance },
                { label: 'Balance after',          value: `₹${(s.balance - oop).toLocaleString()}`, bad: s.balance - oop < 0 },
            ];

            const tip = coverage > 0
                ? 'Good — insurance softened the blow. Consider upgrading to 90% coverage.'
                : 'No health insurance means the full bill hits your savings. Basic cover costs ~₹1,500/mo.';

            const defence = healthPlan
                ? `${healthPlan.planId.replace('_',' ').toUpperCase()} (${Math.round(coverage*100)}% cover)`
                : 'No health insurance';
            return { outcome, rows, tip, defence };
        },
    },
    {
        id: 'market_crash',
        name: 'Market Crash',
        subtitle: 'Equities drop 40% overnight',
        color: '#a78bfa',
        simulate(s) {
            const stockVal = Object.entries(s.portfolio).reduce((t, [id, { qty }]) => {
                return t + qty * (s.marketPrices[id] || 0);
            }, 0);
            const mfVal = Object.entries(s.mfPortfolio).reduce((t, [id, { units }]) => {
                return t + units * (s.mfNavs[id] || 0);
            }, 0);
            const exposed    = stockVal + mfVal;
            const loss       = Math.round(exposed * 0.4);
            const newNW      = s.netWorth - loss;
            const pctLoss    = s.netWorth > 0 ? Math.round((loss / s.netWorth) * 100) : 0;
            const sipMonths  = s.sipPlans?.length > 0 ? 'SIPs buying cheaper units — rupee cost averaging kicks in.' : null;
            const outcome    = pctLoss <= 15 ? 'SURVIVED' : pctLoss <= 35 ? 'CLOSE CALL' : 'CRITICAL';

            const rows = [
                { label: 'Equity exposure',         value: `₹${exposed.toLocaleString()}`,        bad: pctLoss > 20 },
                { label: 'Paper loss (-40%)',        value: `-₹${loss.toLocaleString()}`,           bad: true },
                { label: 'Net worth after crash',    value: `₹${newNW.toLocaleString()}`,           bad: newNW < 0 },
                { label: 'Net worth impact',         value: `${pctLoss}% decline`,                  bad: pctLoss > 25 },
            ];

            const tip = sipMonths
                ? sipMonths + ' Don\'t sell in panic — markets recover.'
                : pctLoss > 35
                ? 'Too much in equities. Rebalance: some PPF, FD, and bonds to cushion crashes.'
                : 'Manageable. Keep SIPs running through the dip — you\'ll average down.';

            const defence = exposed > 0
                ? `₹${exposed.toLocaleString()} in equities (${Math.round(exposed/Math.max(s.netWorth,1)*100)}% of net worth)`
                : 'No equity exposure';
            return { outcome, rows, tip, defence };
        },
    },
    {
        id: 'property_damage',
        name: 'Property Damage',
        subtitle: 'Flood/fire destroys your home',
        color: '#fbbf24',
        simulate(s) {
            const REPAIR     = 250000;
            const hasProp    = s.properties.length > 0;
            const propIns    = s.activeInsurance.find(i => i.planId === 'property_insurance');
            const coverage   = propIns ? 0.8 : 0;
            const oop        = hasProp ? Math.round(REPAIR * (1 - coverage)) : 0;
            const canPay     = s.balance >= oop;
            const outcome    = !hasProp ? 'SURVIVED' : (coverage > 0 && canPay) ? 'SURVIVED' : canPay ? 'CLOSE CALL' : 'CRITICAL';

            const rows = hasProp ? [
                { label: 'Estimated repair cost',   value: `₹${REPAIR.toLocaleString()}`,       bad: true },
                { label: 'Insurance covers (80%)',   value: propIns ? `₹${Math.round(REPAIR*0.8).toLocaleString()}` : '₹0 — none', bad: !propIns },
                { label: 'Out of pocket',            value: `₹${oop.toLocaleString()}`,          bad: oop > s.balance },
                { label: 'Balance after',            value: `₹${(s.balance - oop).toLocaleString()}`, bad: s.balance < oop },
            ] : [
                { label: 'Properties owned',         value: 'None — no exposure', bad: false },
                { label: 'Action needed',            value: 'Buy property first', bad: false },
            ];

            const tip = !hasProp
                ? 'You don\'t own property yet — this risk doesn\'t apply to you.'
                : propIns
                ? 'Property insurance is paying off. Premium = 0.5% of value/year — well worth it.'
                : 'You own property with no insurance. One flood = ₹2.5L+ out of pocket. Fix this.';

            const defence = propIns ? 'Property insurance (80% cover)' : hasProp ? 'No property insurance' : 'No property owned';
            return { outcome, rows, tip, defence };
        },
    },
    {
        id: 'family_emergency',
        name: 'Family Emergency',
        subtitle: 'Parent needs urgent care (₹1.5L)',
        color: '#ec4899',
        simulate(s) {
            const COST       = 150000;
            const hasParent  = s.dependents.some(d => d.type === 'parent');
            const famIns     = s.activeInsurance.find(i => ['family_floater','health_premium'].includes(i.planId));
            const coverage   = famIns ? (famIns.planId === 'health_premium' ? 0.9 : 0.75) : 0;
            const oop        = hasParent ? Math.round(COST * (1 - coverage)) : 0;
            const canPay     = s.balance >= oop;
            const outcome    = !hasParent ? 'SURVIVED' : (coverage > 0 && canPay) ? 'SURVIVED' : canPay ? 'CLOSE CALL' : 'CRITICAL';

            const rows = hasParent ? [
                { label: 'Emergency cost',           value: `₹${COST.toLocaleString()}`,         bad: true },
                { label: 'Family plan covers',       value: famIns ? `₹${Math.round(COST*coverage).toLocaleString()} (${Math.round(coverage*100)}%)` : '₹0', bad: !famIns },
                { label: 'Out of pocket',            value: `₹${oop.toLocaleString()}`,          bad: oop > s.balance * 0.3 },
                { label: 'Balance after',            value: `₹${(s.balance - oop).toLocaleString()}`, bad: s.balance < oop },
            ] : [
                { label: 'Parents as dependents',    value: 'None added', bad: false },
                { label: 'Tip',                      value: 'Add parents in Family tab', bad: false },
            ];

            const tip = !hasParent
                ? 'No parent dependents. If you support parents, add them in the Family tab to track costs.'
                : famIns
                ? 'Family floater / premium insurance cushions the blow well.'
                : 'No family insurance — ₹1.5L hits your savings directly. A family floater costs ₹3,500/mo.';

            const defence = famIns
                ? `${famIns.planId === 'family_floater' ? 'Family Floater' : 'Premium Health'} (${Math.round(coverage*100)}% cover)`
                : hasParent ? 'No family insurance' : 'No parent dependents';
            return { outcome, rows, tip, defence };
        },
    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const OUTCOME_STYLE = {
    SURVIVED:   { color: '#4ade80', label: 'SURVIVED',   border: '#4ade8040' },
    'CLOSE CALL': { color: '#fbbf24', label: 'CLOSE CALL', border: '#fbbf2440' },
    CRITICAL:   { color: '#f87171', label: 'CRITICAL',   border: '#f8717140' },
};

function ResultRow({ label, value, bad }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070', flex: 1, lineHeight: 16 }}>{label}</Text>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: bad ? '#f87171' : '#4ade80', lineHeight: 18 }}>{value}</Text>
        </View>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CrisisSimulator({ visible, gameState, onClose }) {
    const slideAnim = useRef(new Animated.Value(SH)).current;
    const [selected, setSelected] = useState(null);
    const [result, setResult]     = useState(null);

    useEffect(() => {
        if (visible) {
            setSelected(null);
            setResult(null);
            slideAnim.setValue(SH);
            Animated.spring(slideAnim, { toValue: 0, friction: 14, tension: 100, useNativeDriver: true }).start();
        } else {
            Animated.timing(slideAnim, { toValue: SH, duration: 220, useNativeDriver: true }).start();
        }
    }, [visible]);

    const runScenario = (scenario) => {
        setSelected(scenario);
        setResult(scenario.simulate(gameState));
    };

    const os = result ? OUTCOME_STYLE[result.outcome] || OUTCOME_STYLE['CLOSE CALL'] : null;

    return (
        <Animated.View pointerEvents={visible ? 'auto' : 'none'} style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, top: 0,
            zIndex: 600, transform: [{ translateY: slideAnim }],
        }}>
            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.98)' }} />

            <View style={{ flex: 1 }}>
                {/* Header bar */}
                <View style={{ backgroundColor: '#070910', borderBottomWidth: 1, borderColor: '#1a2040', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#f87171', letterSpacing: 4 }}>WHAT IF?</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#c8d4f0', lineHeight: 26 }}>CRISIS SIMULATOR</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={{ borderWidth: 1, borderColor: '#1e2840', padding: 8 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>✕ CLOSE</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                    {/* ── SCENARIO PICKER ── */}
                    {!result && (
                        <>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#2a3860', letterSpacing: 3, marginBottom: 14 }}>
                                PICK A SCENARIO — SEE IF YOU SURVIVE IT
                            </Text>
                            {SCENARIOS.map(sc => (
                                <TouchableOpacity
                                    key={sc.id}
                                    onPress={() => runScenario(sc)}
                                    activeOpacity={0.75}
                                    style={{
                                        borderWidth: 1, borderColor: sc.color + '50',
                                        backgroundColor: sc.color + '08',
                                        padding: 16, marginBottom: 10,
                                        flexDirection: 'row', alignItems: 'center', gap: 14,
                                    }}
                                >
                                    <View style={{ width: 42, height: 42, backgroundColor: sc.color + '15', borderWidth: 1, borderColor: sc.color + '50', alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={WARN_IMG} style={{ width: 24, height: 24 }} resizeMode="contain" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: sc.color, lineHeight: 22 }}>{sc.name}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070', lineHeight: 16 }}>{sc.subtitle}</Text>
                                    </View>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: sc.color + '80' }}>▶</Text>
                                </TouchableOpacity>
                            ))}
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#1a2840', letterSpacing: 2, textAlign: 'center', marginTop: 8 }}>
                                READ-ONLY — NO GAME STATE CHANGES
                            </Text>
                        </>
                    )}

                    {/* ── RESULTS VIEW ── */}
                    {result && selected && (
                        <>
                            {/* Outcome verdict */}
                            <View style={{ borderWidth: 2, borderColor: os.border, backgroundColor: os.color + '08', padding: 16, marginBottom: 16, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 4, marginBottom: 4 }}>VERDICT</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 44, color: os.color, lineHeight: 46 }}>{os.label}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: selected.color, marginTop: 4 }}>{selected.name} — {selected.subtitle}</Text>
                            </View>

                            {/* Your defences */}
                            <View style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#06080f', padding: 12, marginBottom: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 3, marginBottom: 8 }}>YOUR DEFENCES</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#c8d4f0', lineHeight: 20 }}>{result.defence}</Text>
                            </View>

                            {/* Number breakdown */}
                            <View style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#06080f', padding: 14, marginBottom: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 3, marginBottom: 10 }}>BREAKDOWN</Text>
                                {result.rows.map((row, i) => <ResultRow key={i} {...row} />)}
                            </View>

                            {/* Tip */}
                            <View style={{ borderWidth: 1, borderColor: '#fbbf2430', backgroundColor: '#fbbf2408', padding: 14, marginBottom: 20, flexDirection: 'row', gap: 10 }}>
                                <Image source={BULB_IMG} style={{ width: 20, height: 20, marginTop: 1 }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#8090c0', flex: 1, lineHeight: 20 }}>{result.tip}</Text>
                            </View>

                            {/* Try another */}
                            <TouchableOpacity
                                onPress={() => { setSelected(null); setResult(null); }}
                                style={{ borderWidth: 1, borderColor: '#3b82f6', backgroundColor: '#0a1428', paddingVertical: 14, alignItems: 'center' }}
                                activeOpacity={0.8}
                            >
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#60a5fa', letterSpacing: 2, lineHeight: 22 }}>◀ TRY ANOTHER</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </ScrollView>
            </View>
        </Animated.View>
    );
}
