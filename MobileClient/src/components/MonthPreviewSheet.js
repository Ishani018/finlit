import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';

const C = {
    bg:    '#0d1020',
    line:  '#1a2040',
    cream: '#c8d4f0',
    dim:   '#7d8ab0',
    sage:  '#4ade80',
    red:   '#f87171',
    gold:  '#fbbf24',
    blue:  '#60a5fa',
    violet: '#a78bfa',
};

const ICONS = {
    salary:    require('../../assets/ui_comp/career.png'),
    rental:    require('../../assets/ui_comp/forsale.png'),
    spouse:    require('../../assets/ui_comp/familyicon.png'),
    taxi:      require('../../assets/ui_comp/career.png'),
    car:       require('../../assets/ui_comp/borrow.png'),
    housing:   require('../../assets/ui_comp/home.png'),
    living:    require('../../assets/ui_comp/groceryshop.png'),
    emi:       require('../../assets/ui_comp/borrow.png'),
    insurance: require('../../assets/ui_comp/healthinsurance.png'),
    tax:       require('../../assets/ui_comp/taxdept.png'),
    tuition:   require('../../assets/ui_comp/education.png'),
    sip:       require('../../assets/ui_comp/investicon.png'),
    ca:        require('../../assets/ui_comp/saveandearn.png'),
};
const WARN_ICON = require('../../assets/ui_comp/warning.png');

const INCOME_ROWS = [
    ['salary', 'Salary'],
    ['rental', 'Rent from your properties'],
    ['spouse', 'Partner income'],
    ['taxi', 'Vehicle earnings'],
];
const EXPENSE_ROWS = [
    ['housing', 'Rent and upkeep'],
    ['living', 'Living costs'],
    ['car', 'Car running costs'],
    ['emi', 'Loan EMIs'],
    ['insurance', 'Insurance premiums'],
    ['tax', 'Income tax'],
    ['tuition', 'Course fees'],
    ['sip', 'SIP investments'],
    ['ca', 'CA subscription'],
];

const WARN_STYLE = {
    bad:  { bg: '#2a0d0d', border: '#7a2a2a', title: C.red,  body: '#e8a8a8' },
    warn: { bg: '#2a1f08', border: '#5c4410', title: C.gold, body: '#d9c48a' },
    info: { bg: '#101a36', border: '#22305c', title: C.blue, body: '#9db4e0' },
};

const money = (n) => `₹${Math.abs(Math.round(n)).toLocaleString()}`;

function SectionLabel({ text, color }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <View style={{ height: 1, width: 10, backgroundColor: color + '80' }} />
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color, letterSpacing: 3 }}>{text}</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: color + '25' }} />
        </View>
    );
}

function Row({ icon, label, value, color }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Image source={icon} style={{ width: 22, height: 22 }} resizeMode="contain" />
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 19, color: C.cream }}>{label}</Text>
            </View>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 19, color }}>{value}</Text>
        </View>
    );
}

// Bottom sheet shown when the player taps NEXT MONTH. `preview` comes from
// useGame().getMonthPreview(); `onAction` receives 'grocery' or 'insure'.
export default function MonthPreviewSheet({ visible, preview, monthLabel, onConfirm, onCancel, onAction }) {
    if (!visible || !preview) return null;
    const { income, expenses, net, balanceAfter, healthBefore, healthAfter, warnings } = preview;
    const incomeRows = INCOME_ROWS.filter(([k]) => income[k] > 0);
    const expenseRows = EXPENSE_ROWS.filter(([k]) => expenses[k] > 0);
    const netColor = net >= 0 ? C.sage : C.red;

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 600, justifyContent: 'flex-end' }}>
            <TouchableOpacity activeOpacity={1} onPress={onCancel} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(3,4,9,0.78)' }} />
            <View style={{ backgroundColor: C.bg, borderTopWidth: 1, borderColor: '#2a3560', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '88%', paddingTop: 10 }}>
                <View style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: '#2a3560', alignSelf: 'center', marginBottom: 10 }} />
                <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: C.cream, lineHeight: 30 }}>Before you end {monthLabel}</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim, marginBottom: 14 }}>This is an estimate. Events and business income are not included.</Text>

                    {incomeRows.length > 0 && (
                        <View style={{ marginBottom: 12 }}>
                            <SectionLabel text="COMING IN" color={C.sage} />
                            {incomeRows.map(([k, label]) => <Row key={k} icon={ICONS[k]} label={label} value={`+${money(income[k])}`} color={C.sage} />)}
                        </View>
                    )}

                    <View style={{ marginBottom: 12 }}>
                        <SectionLabel text="GOING OUT" color={C.red} />
                        {expenseRows.map(([k, label]) => (
                            <Row key={k} icon={ICONS[k]} label={label} value={`−${money(expenses[k])}`} color={k === 'sip' ? C.violet : C.red} />
                        ))}
                    </View>

                    <View style={{ borderTopWidth: 1, borderColor: C.line, paddingTop: 10, marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: C.cream }}>{net >= 0 ? 'You keep' : 'You lose'}</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: netColor }}>{net >= 0 ? '+' : '−'}{money(net)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim }}>Cash after the month</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: balanceAfter < 0 ? C.red : C.dim }}>
                                {balanceAfter < 0 ? '−' : ''}{money(balanceAfter - net)} → {balanceAfter < 0 ? '−' : ''}{money(balanceAfter)}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim }}>Health</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: healthAfter < 30 ? C.gold : C.dim }}>{Math.round(healthBefore)} → {Math.round(healthAfter)}</Text>
                        </View>
                    </View>

                    {warnings.map(w => {
                        const st = WARN_STYLE[w.level] || WARN_STYLE.info;
                        return (
                            <View key={w.id} style={{ flexDirection: 'row', gap: 10, backgroundColor: st.bg, borderWidth: 1, borderColor: st.border, borderRadius: 10, padding: 12, marginBottom: 8 }}>
                                <Image source={WARN_ICON} style={{ width: 26, height: 26, marginTop: 2 }} resizeMode="contain" />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: st.title, lineHeight: 20 }}>{w.title}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: st.body, lineHeight: 17, marginTop: 2 }}>{w.body}</Text>
                                    {w.action ? (
                                        <TouchableOpacity onPress={() => onAction && onAction(w.action)} activeOpacity={0.8} style={{ marginTop: 6 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.blue }}>{w.actionLabel} ›</Text>
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>

                <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 22, gap: 8, borderTopWidth: 1, borderColor: C.line }}>
                    <TouchableOpacity onPress={onConfirm} activeOpacity={0.85} style={{ height: 52, borderRadius: 10, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#2a1c00', letterSpacing: 2 }}>END {String(monthLabel).toUpperCase()} ›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onCancel} activeOpacity={0.7} style={{ height: 34, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 19, color: C.dim }}>Not yet</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
