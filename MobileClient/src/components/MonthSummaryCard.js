import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Image, ScrollView } from 'react-native';
import { FINANCIAL_TIPS } from './FinancialTip';

const HAPPY_ICON  = require('../../assets/ui_comp/happyicon.png');
const INVEST_ICON = require('../../assets/ui_comp/investicon.png');
const HOME_ICON   = require('../../assets/ui_comp/home.png');
const CAREER_ICON = require('../../assets/ui_comp/career.png');
const HEALTH_ICON = require('../../assets/ui_comp/healthicon.png');
const SAVE_ICON   = require('../../assets/ui_comp/saveandearn.png');
const FAMILY_ICON = require('../../assets/ui_comp/familyicon.png');
const NEXT_ICON   = require('../../assets/ui_comp/nextbutton.png');
const BORROW_ICON = require('../../assets/ui_comp/borrow.png');
const WARN_ICON   = require('../../assets/ui_comp/warning.png');

const { height: SH } = Dimensions.get('window');

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function NetWorthBar({ history }) {
    if (!history || history.length < 2) return null;
    const vals = history.slice(-12).map(h => h.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const isUp = vals[vals.length - 1] >= vals[0];
    const barColor = isUp ? '#4ade80' : '#f87171';
    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 36 }}>
            {vals.map((v, i) => {
                const h = Math.max(3, ((v - min) / range) * 32);
                const isLast = i === vals.length - 1;
                return (
                    <View key={i} style={{ flex: 1, height: h, backgroundColor: isLast ? barColor : barColor + '44', borderRadius: 2 }} />
                );
            })}
        </View>
    );
}

const ROW_ICONS = {
    Salary: CAREER_ICON, Rental: HOME_ICON, Spouse: FAMILY_ICON,
    Dividend: INVEST_ICON, Pension: SAVE_ICON, Living: HAPPY_ICON,
    Housing: HOME_ICON, EMI: BORROW_ICON, Tax: INVEST_ICON,
    Insurance: HEALTH_ICON, SIP: INVEST_ICON, Tuition: FAMILY_ICON,
};

function Row({ label, value, color }) {
    const icon = ROW_ICONS[label];
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
            {icon
                ? <Image source={icon} style={{ width: 15, height: 15, marginRight: 7 }} resizeMode="contain" />
                : <View style={{ width: 22 }} />
            }
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#556080', flex: 1 }}>{label}</Text>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color }}>{value}</Text>
        </View>
    );
}

export default function MonthSummaryCard({ recap, netWorthHistory, currentBalance, loans = [], totalEMI = 0, onContinue }) {
    const slideAnim = useRef(new Animated.Value(SH)).current;
    const [tip] = useState(() => {
        const tips = Object.values(FINANCIAL_TIPS);
        return tips[Math.floor(Math.random() * tips.length)];
    });

    useEffect(() => {
        slideAnim.setValue(SH);
        Animated.spring(slideAnim, { toValue: 0, friction: 16, tension: 100, useNativeDriver: true }).start();
    }, [recap]);

    if (!recap) return null;

    const { month, year, income = {}, expenses = {}, netFlow = 0, happinessDelta } = recap;
    const totalIncome   = Object.values(income).reduce((s, v) => s + (v || 0), 0);
    const totalExpenses = Object.values(expenses).reduce((s, v) => s + (v || 0), 0);
    const isPositive    = netFlow >= 0;
    const flowColor     = isPositive ? '#4ade80' : '#f87171';
    const monthLabel    = MONTHS[(month - 1) % 12];

    const prevNW = netWorthHistory.length >= 2 ? netWorthHistory[netWorthHistory.length - 2]?.value : null;
    const currNW = netWorthHistory.length >= 1 ? netWorthHistory[netWorthHistory.length - 1]?.value : currentBalance;
    const nwDelta = prevNW != null ? currNW - prevNW : null;

    const hasLoans = loans.length > 0 && totalEMI > 0;

    return (
        <Animated.View style={{ position: 'absolute', inset: 0, zIndex: 600, transform: [{ translateY: slideAnim }] }}>
            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.97)' }} />

            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28, paddingTop: 20 }}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    {/* ── Header ── */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#4a5580', letterSpacing: 4 }}>MONTH SUMMARY</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 36, color: '#c8d4f0', lineHeight: 38 }}>{monthLabel} {year}</Text>
                        </View>
                        {happinessDelta !== undefined && (
                            <View style={{ alignItems: 'center', gap: 3, marginTop: 6 }}>
                                <Image source={HAPPY_ICON} style={{ width: 26, height: 26 }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: happinessDelta >= 0 ? '#fbbf24' : '#f87171' }}>
                                    {happinessDelta >= 0 ? '+' : ''}{Math.round(happinessDelta)}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* ── Net flow big number ── */}
                    <View style={{ alignItems: 'center', paddingVertical: 20, marginBottom: 4 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#4a5580', letterSpacing: 3, marginBottom: 4 }}>NET FLOW THIS MONTH</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 54, color: flowColor, lineHeight: 56 }}>
                            {isPositive ? '+' : ''}₹{Math.abs(netFlow).toLocaleString()}
                        </Text>
                        {nwDelta !== null && (
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: nwDelta >= 0 ? '#4ade80' : '#f87171', marginTop: 4 }}>
                                Net worth {nwDelta >= 0 ? '▲' : '▼'} ₹{Math.abs(nwDelta).toLocaleString()}
                            </Text>
                        )}
                    </View>

                    <View style={{ height: 1, backgroundColor: '#141a2e', marginBottom: 18 }} />

                    {/* ── Income / Expenses ── */}
                    <View style={{ flexDirection: 'row', gap: 16, marginBottom: 18 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#4a5580', letterSpacing: 3, marginBottom: 10 }}>INCOME</Text>
                            {income.salary > 0    && <Row label="Salary"   value={`+₹${income.salary.toLocaleString()}`}   color="#4ade80" />}
                            {income.rental > 0    && <Row label="Rental"   value={`+₹${income.rental.toLocaleString()}`}   color="#4ade80" />}
                            {income.spouse > 0    && <Row label="Spouse"   value={`+₹${income.spouse.toLocaleString()}`}   color="#4ade80" />}
                            {income.dividend > 0  && <Row label="Dividend" value={`+₹${income.dividend.toLocaleString()}`} color="#fbbf24" />}
                            {income.pension > 0   && <Row label="Pension"  value={`+₹${income.pension.toLocaleString()}`}  color="#60a5fa" />}
                            {totalIncome === 0    && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#4a5580' }}>—</Text>}
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#4ade80', marginTop: 8 }}>₹{totalIncome.toLocaleString()}</Text>
                        </View>
                        <View style={{ width: 1, backgroundColor: '#141a2e' }} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#4a5580', letterSpacing: 3, marginBottom: 10 }}>EXPENSES</Text>
                            {expenses.living    > 0 && <Row label="Living"    value={`-₹${expenses.living.toLocaleString()}`}    color="#f87171" />}
                            {expenses.housing   > 0 && <Row label="Housing"   value={`-₹${expenses.housing.toLocaleString()}`}   color="#f87171" />}
                            {expenses.emi       > 0 && <Row label="EMI"       value={`-₹${expenses.emi.toLocaleString()}`}       color="#f87171" />}
                            {expenses.tax       > 0 && <Row label="Tax"       value={`-₹${expenses.tax.toLocaleString()}`}       color="#f87171" />}
                            {expenses.insurance > 0 && <Row label="Insurance" value={`-₹${expenses.insurance.toLocaleString()}`} color="#f87171" />}
                            {expenses.sip       > 0 && <Row label="SIP"       value={`-₹${expenses.sip.toLocaleString()}`}       color="#a78bfa" />}
                            {expenses.tuition   > 0 && <Row label="Tuition"   value={`-₹${expenses.tuition.toLocaleString()}`}   color="#f87171" />}
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#f87171', marginTop: 8 }}>₹{totalExpenses.toLocaleString()}</Text>
                        </View>
                    </View>

                    {/* ── Net worth trend ── */}
                    {netWorthHistory.length >= 2 && (
                        <View style={{ marginBottom: 18 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#4a5580', letterSpacing: 3, marginBottom: 8 }}>NET WORTH TREND</Text>
                            <NetWorthBar history={netWorthHistory} />
                        </View>
                    )}

                    {/* ── EMI Alert (only when loans active) ── */}
                    {hasLoans && (
                        <View style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 18 }}>
                            <Image source={BORROW_ICON} style={{ position: 'absolute', width: '100%', height: '100%' }} resizeMode="cover" />
                            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(18,4,4,0.88)' }} />
                            <View style={{ padding: 16, position: 'relative' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <Image source={WARN_ICON} style={{ width: 22, height: 22 }} resizeMode="contain" />
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#f87171', letterSpacing: 3 }}>
                                        EMI DEDUCTED THIS MONTH
                                    </Text>
                                </View>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 34, color: '#f87171', lineHeight: 36 }}>
                                    ₹{totalEMI.toLocaleString()}
                                </Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#f8717188', marginTop: 2 }}>
                                    {loans.length} active loan{loans.length !== 1 ? 's' : ''} · pay on time to protect your CIBIL
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* ── Uncle Fin tip ── */}
                    {tip && (
                        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 20, backgroundColor: '#070a14', borderRadius: 10, padding: 14 }}>
                            <View style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden' }}>
                                <Image source={require('../../assets/ui_comp/uncle_fin.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#4a5580', letterSpacing: 2, marginBottom: 3 }}>UNCLE FIN SAYS</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#a8b8d8', lineHeight: 18 }}>{tip.stat || tip.body || tip.title}</Text>
                            </View>
                        </View>
                    )}

                    {/* ── Continue ── */}
                    <TouchableOpacity
                        onPress={onContinue}
                        activeOpacity={0.8}
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, backgroundColor: '#0d1428', paddingVertical: 18, borderRadius: 12 }}
                    >
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#c8d4f0', letterSpacing: 2 }}>NEXT MONTH</Text>
                        <Image source={NEXT_ICON} style={{ width: 28, height: 28 }} resizeMode="contain" />
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Animated.View>
    );
}
