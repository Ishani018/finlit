import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { FINANCIAL_TIPS } from './FinancialTip';

const HAPPY_ICON  = require('../../assets/ui_comp/happyicon.png');
const INVEST_ICON = require('../../assets/ui_comp/investicon.png');
const HOME_ICON   = require('../../assets/ui_comp/home.png');
const CAREER_ICON = require('../../assets/ui_comp/career.png');
const HEALTH_ICON = require('../../assets/ui_comp/healthicon.png');
const SAVE_ICON   = require('../../assets/ui_comp/saveandearn.png');
const FAMILY_ICON = require('../../assets/ui_comp/familyicon.png');
const NEXT_ICON   = require('../../assets/ui_comp/nextbutton.png');

const { height: SH, width: SW } = Dimensions.get('window');

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function NetWorthBar({ history }) {
    if (!history || history.length < 2) return null;
    const vals = history.slice(-12).map(h => h.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const isUp = vals[vals.length - 1] >= vals[0];
    const barColor = isUp ? '#4ade80' : '#f87171';
    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 40 }}>
            {vals.map((v, i) => {
                const h = Math.max(3, ((v - min) / range) * 36);
                const isLast = i === vals.length - 1;
                return (
                    <View key={i} style={{
                        flex: 1, height: h,
                        backgroundColor: isLast ? barColor : barColor + '55',
                        borderRadius: 2,
                    }} />
                );
            })}
        </View>
    );
}

const ROW_ICONS = { Salary: CAREER_ICON, Rental: HOME_ICON, Spouse: FAMILY_ICON, Dividend: INVEST_ICON, Pension: SAVE_ICON, Living: HAPPY_ICON, Housing: HOME_ICON, EMI: SAVE_ICON, Tax: INVEST_ICON, Insurance: HEALTH_ICON, SIP: INVEST_ICON, Tuition: FAMILY_ICON };

function Row({ label, value, color }) {
    const icon = ROW_ICONS[label];
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            {icon
                ? <Image source={icon} style={{ width: 16, height: 16, marginRight: 6 }} resizeMode="contain" />
                : <View style={{ width: 15 }} />
            }
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#556080', flex: 1, lineHeight: 16 }}>{label}</Text>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color, lineHeight: 18 }}>{value}</Text>
        </View>
    );
}

export default function MonthSummaryCard({ recap, netWorthHistory, currentBalance, onContinue }) {
    const slideAnim = useRef(new Animated.Value(SH)).current;
    const [tip] = useState(() => {
        const tips = Object.values(FINANCIAL_TIPS);
        return tips[Math.floor(Math.random() * tips.length)];
    });

    useEffect(() => {
        slideAnim.setValue(SH);
        Animated.spring(slideAnim, {
            toValue: 0, friction: 18, tension: 120, useNativeDriver: true,
        }).start();
    }, [recap]);

    if (!recap) return null;

    const { month, year, income = {}, expenses = {}, netFlow = 0, happinessDelta } = recap;
    const totalIncome = Object.values(income).reduce((s, v) => s + (v || 0), 0);
    const totalExpenses = Object.values(expenses).reduce((s, v) => s + (v || 0), 0);
    const isPositive = netFlow >= 0;
    const flowColor = isPositive ? '#4ade80' : '#f87171';
    const monthLabel = MONTHS[(month - 1) % 12];

    const prevNW = netWorthHistory.length >= 2
        ? netWorthHistory[netWorthHistory.length - 2]?.value
        : null;
    const currNW = netWorthHistory.length >= 1
        ? netWorthHistory[netWorthHistory.length - 1]?.value
        : currentBalance;
    const nwDelta = prevNW != null ? currNW - prevNW : null;

    return (
        <Animated.View style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, top: 0,
            zIndex: 600,
            transform: [{ translateY: slideAnim }],
        }}>
            {/* Backdrop */}
            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.96)' }} />

            {/* Card */}
            <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 28 }}>

                <View style={{ backgroundColor: '#0a0d1a', borderRadius: 12, padding: 20 }}>

                    {/* Month + happiness row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#4a5580', letterSpacing: 4 }}>MONTH SUMMARY</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: '#c8d4f0', lineHeight: 32 }}>{monthLabel} {year}</Text>
                        </View>
                        {happinessDelta !== undefined && (
                            <View style={{ alignItems: 'center', gap: 2, marginTop: 4 }}>
                                <Image source={HAPPY_ICON} style={{ width: 18, height: 18, opacity: happinessDelta >= 0 ? 0.9 : 0.4 }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: happinessDelta >= 0 ? '#fbbf24' : '#f87171' }}>
                                    {happinessDelta >= 0 ? '+' : ''}{happinessDelta.toFixed(0)}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Net flow — no box, just large centred number */}
                    <View style={{ alignItems: 'center', paddingVertical: 16, marginBottom: 4 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#4a5580', letterSpacing: 3, marginBottom: 2 }}>NET FLOW</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 46, color: flowColor, lineHeight: 48 }}>
                            {isPositive ? '+' : ''}₹{Math.abs(netFlow).toLocaleString()}
                        </Text>
                        {nwDelta !== null && (
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: nwDelta >= 0 ? '#4ade80' : '#f87171', marginTop: 2, opacity: 0.8 }}>
                                Net worth {nwDelta >= 0 ? '▲' : '▼'} ₹{Math.abs(nwDelta).toLocaleString()}
                            </Text>
                        )}
                    </View>

                    {/* Thin divider */}
                    <View style={{ height: 1, backgroundColor: '#141a2e', marginBottom: 14 }} />

                    {/* Income / Expenses — flat rows, no column borders */}
                    <View style={{ flexDirection: 'row', gap: 16, marginBottom: 14 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#4a5580', letterSpacing: 3, marginBottom: 8 }}>INCOME</Text>
                            {income.salary > 0 && <Row label="Salary" value={`+₹${income.salary.toLocaleString()}`} color="#4ade80" />}
                            {income.rental > 0 && <Row label="Rental" value={`+₹${income.rental.toLocaleString()}`} color="#4ade80" />}
                            {income.spouse > 0 && <Row label="Spouse" value={`+₹${income.spouse.toLocaleString()}`} color="#4ade80" />}
                            {income.dividend > 0 && <Row label="Dividend" value={`+₹${income.dividend.toLocaleString()}`} color="#fbbf24" />}
                            {income.pension > 0 && <Row label="Pension" value={`+₹${income.pension.toLocaleString()}`} color="#60a5fa" />}
                            {totalIncome === 0 && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#4a5580' }}>—</Text>}
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#4ade80', marginTop: 6 }}>₹{totalIncome.toLocaleString()}</Text>
                        </View>
                        <View style={{ width: 1, backgroundColor: '#141a2e' }} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#4a5580', letterSpacing: 3, marginBottom: 8 }}>EXPENSES</Text>
                            {expenses.living > 0 && <Row label="Living" value={`-₹${expenses.living.toLocaleString()}`} color="#f87171" />}
                            {expenses.housing > 0 && <Row label="Housing" value={`-₹${expenses.housing.toLocaleString()}`} color="#f87171" />}
                            {expenses.emi > 0 && <Row label="EMI" value={`-₹${expenses.emi.toLocaleString()}`} color="#f87171" />}
                            {expenses.tax > 0 && <Row label="Tax" value={`-₹${expenses.tax.toLocaleString()}`} color="#f87171" />}
                            {expenses.insurance > 0 && <Row label="Insurance" value={`-₹${expenses.insurance.toLocaleString()}`} color="#f87171" />}
                            {expenses.sip > 0 && <Row label="SIP" value={`-₹${expenses.sip.toLocaleString()}`} color="#a78bfa" />}
                            {expenses.tuition > 0 && <Row label="Tuition" value={`-₹${expenses.tuition.toLocaleString()}`} color="#f87171" />}
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#f87171', marginTop: 6 }}>₹{totalExpenses.toLocaleString()}</Text>
                        </View>
                    </View>

                    {/* Net worth bar chart */}
                    {netWorthHistory.length >= 2 && (
                        <View style={{ marginBottom: 14 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#4a5580', letterSpacing: 3, marginBottom: 6 }}>NET WORTH TREND</Text>
                            <NetWorthBar history={netWorthHistory} />
                        </View>
                    )}

                    {/* Uncle Fin's Tip — no border box */}
                    {tip && (
                        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 18, backgroundColor: '#070a14', borderRadius: 8, padding: 12 }}>
                            <View style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden' }}>
                                <Image source={require('../../assets/ui_comp/uncle_fin.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#4a5580', letterSpacing: 2, marginBottom: 3 }}>UNCLE FIN SAYS</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#a8b8d8', lineHeight: 17 }}>{tip.stat || tip.body || tip.title}</Text>
                            </View>
                        </View>
                    )}

                    {/* Continue button */}
                    <TouchableOpacity
                        onPress={onContinue}
                        activeOpacity={0.8}
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#080d1a', paddingVertical: 14, borderRadius: 8 }}
                    >
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0', letterSpacing: 2, lineHeight: 24 }}>CONTINUE</Text>
                        <Image source={NEXT_ICON} style={{ width: 24, height: 24 }} resizeMode="contain" />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
}
