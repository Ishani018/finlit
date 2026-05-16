import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { useGame } from '../context/GameContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { LOAN_TYPES, calculateEMI, getAdjustedRate } from '../data/loans';

const CREDIT_BANDS = [
    { min: 750, label: 'EXCELLENT', color: '#4ade80' },
    { min: 700, label: 'GOOD',      color: '#a3e635' },
    { min: 650, label: 'FAIR',      color: '#fbbf24' },
    { min: 550, label: 'POOR',      color: '#fb923c' },
    { min: 0,   label: 'BAD',       color: '#f87171' },
];

const FD_OPTIONS = [
    { id: 'fd_3',  months: 3,  rate: 0.065, label: '3 Months',  rateLabel: '6.5% p.a.' },
    { id: 'fd_6',  months: 6,  rate: 0.072, label: '6 Months',  rateLabel: '7.2% p.a.' },
    { id: 'fd_12', months: 12, rate: 0.078, label: '12 Months', rateLabel: '7.8% p.a.' },
    { id: 'fd_24', months: 24, rate: 0.085, label: '24 Months', rateLabel: '8.5% p.a.' },
    { id: 'fd_36', months: 36, rate: 0.090, label: '36 Months', rateLabel: '9.0% p.a.' },
];

const LOAN_TYPE_META = {
    personal_loan:        { name: 'Personal Loan',         icon: 'user',            color: '#f87171' },
    education_loan:       { name: 'Education Loan',        icon: 'graduation-cap',  color: '#818cf8' },
    home_loan:            { name: 'Home Loan',             icon: 'home',            color: '#4ade80' },
    business_loan:        { name: 'Business Loan',         icon: 'briefcase',       color: '#fbbf24' },
    loan_against_property:{ name: 'Loan Against Property', icon: 'building',        color: '#c084fc' },
    'Personal Loan':      { name: 'Personal Loan',         icon: 'user',            color: '#f87171' },
};

export default function BankScreen({ onClose, onShowDialog }) {
    const {
        balance, creditScore, netWorth, currentJob,
        loans, getTotalEMI, takeLoan,
        fixedDeposits, createFD, breakFD,
        prepayLoan,
        caSubscribed, caSubscribedMonth, subscribeCA, cancelCA, itrFiled, CA_MONTHLY_FEE,
        turn, totalMonthsPlayed,
    } = useGame();

    const [tab, setTab] = useState(null); // null = landing | save | borrow | ca
    const [fdAmount, setFdAmount] = useState('50000');
    const [selectedFDOption, setSelectedFDOption] = useState(FD_OPTIONS[2]);
    const [selectedLoanId, setSelectedLoanId] = useState(null);
    const [prepayInput, setPrepayInput] = useState('');

    // Loan application state
    const [applyingLoanId, setApplyingLoanId] = useState(null);
    const [loanAmount, setLoanAmount] = useState('');
    const [loanTenureIdx, setLoanTenureIdx] = useState(1);

    const creditBand = CREDIT_BANDS.find(b => creditScore >= b.min) || CREDIT_BANDS[4];
    const creditPct = Math.min(Math.max((creditScore - 300) / (900 - 300), 0), 1);
    const totalEMI = getTotalEMI ? getTotalEMI() : loans.reduce((s, l) => s + l.emi, 0);
    const totalLoanDebt = loans.reduce((s, l) => s + l.remainingPrincipal, 0);
    const fds = fixedDeposits || [];
    const totalFDValue = fds.reduce((s, fd) => s + fd.currentValue, 0);

    const handleCreateFD = () => {
        const amt = parseInt(fdAmount) || 0;
        if (amt < 10000) { onShowDialog('Min ₹10,000', 'Fixed deposits require a minimum of ₹10,000.', 'error'); return; }
        if (amt > balance) { onShowDialog('Insufficient Funds', `You only have ₹${balance.toLocaleString()}.`, 'error'); return; }
        if (!createFD) { onShowDialog('Coming Soon', 'FD feature launching soon.', 'info'); return; }
        const res = createFD(selectedFDOption.id, amt, selectedFDOption.months, selectedFDOption.rate);
        onShowDialog(res.success ? 'FD Created!' : 'Failed', res.msg, res.success ? 'success' : 'error');
    };

    const maturityAmount = (amt, months, rate) => Math.round(amt * Math.pow(1 + rate / 12, months));

    return (
        <View style={{ flex: 1, backgroundColor: '#06080f' }}>
            {/* Hero header — no close button, breadcrumb handles back */}
            <View style={{ height: 140, position: 'relative', backgroundColor: '#06080f' }}>
                <Image source={require('../../assets/bank.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(6,8,15,0.7)', paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <View>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#fbbf24', letterSpacing: 4 }}>FINLIT BANK</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#c8d4f0', lineHeight: 26 }}>Your Account</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 2 }}>BALANCE</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#4ade80', lineHeight: 26 }}>₹{balance?.toLocaleString()}</Text>
                    </View>
                </View>
            </View>

            {/* Credit score + EMI strip — only in sub-sections */}
            {tab && <View style={{ flexDirection: 'row', backgroundColor: '#0d1020', borderBottomWidth: 1, borderColor: '#1a2040', paddingHorizontal: 14, paddingVertical: 8, gap: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: creditBand.color, lineHeight: 30 }}>{creditScore}</Text>
                    <View>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: creditBand.color, lineHeight: 14 }}>{creditBand.label}</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', lineHeight: 12 }}>CREDIT</Text>
                    </View>
                </View>
                <View style={{ width: 1, backgroundColor: '#1a2040' }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: totalEMI > 0 ? '#f87171' : '#4ade80', lineHeight: 24 }}>
                        {totalEMI > 0 ? `₹${(totalEMI / 1000).toFixed(0)}k/mo` : 'NONE'}
                    </Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', lineHeight: 12 }}>EMI</Text>
                </View>
                <View style={{ width: 1, backgroundColor: '#1a2040' }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#fbbf24', lineHeight: 24 }}>
                        {totalFDValue > 0 ? `₹${(totalFDValue / 1000).toFixed(0)}k` : 'NIL'}
                    </Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', lineHeight: 12 }}>FDs</Text>
                </View>
            </View>}

            {/* Sub-tab back bar — only when inside a section */}
            {tab && (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#070a16', borderBottomWidth: 1, borderColor: '#1a2040', paddingHorizontal: 14, paddingVertical: 10, gap: 10 }}>
                    <TouchableOpacity onPress={() => setTab(null)} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070' }}>‹</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', letterSpacing: 2 }}>BANK</Text>
                    </TouchableOpacity>
                    <View style={{ width: 1, height: 14, backgroundColor: '#1a2040' }} />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#c8d4f0', letterSpacing: 2 }}>{tab === 'save' ? 'SAVE & EARN' : tab === 'borrow' ? 'BORROW' : 'CA RETAINER'}</Text>
                </View>
            )}

            {/* Landing — two big cards */}
            {!tab && (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
                    {/* SAVE & EARN card */}
                    <TouchableOpacity onPress={() => setTab('save')} activeOpacity={0.85}
                        style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#0a0d1a', overflow: 'hidden', marginBottom: 12 }}>
                        <View style={{ height: 150, backgroundColor: '#0d1a12', flexDirection: 'row', alignItems: 'center' }}>
                            {/* Pixel art image — contained, not cropped */}
                            <Image source={require('../../assets/ui_comp/saveandearn.png')} style={{ width: 130, height: 130 }} resizeMode="contain" />
                            <View style={{ flex: 1, padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#fbbf24', letterSpacing: 4, marginBottom: 2 }}>GROW YOUR SAVINGS</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#ffffff', lineHeight: 30 }}>SAVE & EARN</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', marginTop: 4 }}>FDs · CA · ITR</Text>
                                <View style={{ marginTop: 10, backgroundColor: '#06080f', borderWidth: 1, borderColor: '#1e2840', paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#fbbf24', letterSpacing: 2 }}>OPEN ▶</Text>
                                </View>
                            </View>
                        </View>
                        {/* Stats strip */}
                        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#1a2040' }}>
                            <View style={{ flex: 1, padding: 10, alignItems: 'center', borderRightWidth: 1, borderColor: '#1a2040' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 2 }}>CREDIT</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: creditBand.color, lineHeight: 24 }}>{creditScore}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: creditBand.color }}>{creditBand.label}</Text>
                            </View>
                            <View style={{ flex: 1, padding: 10, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 2 }}>FD VALUE</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#fbbf24', lineHeight: 24 }}>{totalFDValue > 0 ? `₹${(totalFDValue/1000).toFixed(0)}k` : 'NIL'}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070' }}>{fds.length} active</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* BORROW card */}
                    <TouchableOpacity onPress={() => setTab('borrow')} activeOpacity={0.85}
                        style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#0a0d1a', overflow: 'hidden' }}>
                        <View style={{ height: 150, backgroundColor: '#1a0d0d', flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={require('../../assets/ui_comp/borrow.png')} style={{ width: 130, height: 130 }} resizeMode="contain" />
                            <View style={{ flex: 1, padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#f87171', letterSpacing: 4, marginBottom: 2 }}>LOANS & CREDIT</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#ffffff', lineHeight: 30 }}>BORROW</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', marginTop: 4 }}>Personal · Home · Business</Text>
                                <View style={{ marginTop: 10, backgroundColor: '#06080f', borderWidth: 1, borderColor: '#1e2840', paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#f87171', letterSpacing: 2 }}>OPEN ▶</Text>
                                </View>
                            </View>
                        </View>
                        {/* Stats strip */}
                        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#1a2040' }}>
                            <View style={{ flex: 1, padding: 10, alignItems: 'center', borderRightWidth: 1, borderColor: '#1a2040' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 2 }}>ACTIVE LOANS</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: loans.length > 0 ? '#f87171' : '#4ade80', lineHeight: 24 }}>{loans.length}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070' }}>{loans.length === 0 ? 'debt free' : 'outstanding'}</Text>
                            </View>
                            <View style={{ flex: 1, padding: 10, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 2 }}>EMI / MO</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: totalEMI > 0 ? '#f87171' : '#4ade80', lineHeight: 24 }}>{totalEMI > 0 ? `₹${(totalEMI/1000).toFixed(0)}k` : 'NONE'}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070' }}>monthly</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* CA RETAINER card */}
                    <TouchableOpacity onPress={() => setTab('ca')} activeOpacity={0.85}
                        style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#0a0d1a', overflow: 'hidden', marginTop: 12 }}>
                        <View style={{ height: 150, backgroundColor: '#0d0d1a', flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={require('../../assets/CA_Office.png')} style={{ width: 130, height: 130 }} resizeMode="contain" />
                            <View style={{ flex: 1, padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#a78bfa', letterSpacing: 4, marginBottom: 2 }}>TAX & COMPLIANCE</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#ffffff', lineHeight: 30 }}>CA RETAINER</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', marginTop: 4 }}>ITR Filing · Tax Savings</Text>
                                <View style={{ marginTop: 10, backgroundColor: '#06080f', borderWidth: 1, borderColor: '#1e2840', paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#a78bfa', letterSpacing: 2 }}>OPEN ▶</Text>
                                </View>
                            </View>
                        </View>
                        {/* Stats strip */}
                        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#1a2040' }}>
                            <View style={{ flex: 1, padding: 10, alignItems: 'center', borderRightWidth: 1, borderColor: '#1a2040' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 2 }}>STATUS</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: caSubscribed ? '#4ade80' : '#445070', lineHeight: 20, marginTop: 2 }}>{caSubscribed ? 'ACTIVE' : 'INACTIVE'}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070' }}>₹2,000/mo</Text>
                            </View>
                            <View style={{ flex: 1, padding: 10, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 2 }}>ITR</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: itrFiled?.[turn?.year] ? '#4ade80' : '#fbbf24', lineHeight: 20, marginTop: 2 }}>
                                    {itrFiled?.[turn?.year] ? 'FILED' : 'PENDING'}
                                </Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070' }}>this year</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {tab && <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>

                {/* ── SAVE & EARN (FD + CA) ── */}
                {tab === 'save' && (
                    <View style={{ gap: 12 }}>

                        {/* Credit score card */}
                        <View style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#0a0d1a', flexDirection: 'row', overflow: 'hidden' }}>
                            <View style={{ width: 3, backgroundColor: creditBand.color }} />
                            <View style={{ flex: 1, padding: 12 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 3, marginBottom: 6 }}>CREDIT SCORE</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: 8 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 48, color: creditBand.color, lineHeight: 50 }}>{creditScore}</Text>
                                    <View style={{ paddingBottom: 4 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: creditBand.color, lineHeight: 20 }}>{creditBand.label}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070' }}>out of 900</Text>
                                    </View>
                                </View>
                                {/* Segmented score bar */}
                                <View style={{ flexDirection: 'row', gap: 2, marginBottom: 6 }}>
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <View key={i} style={{ flex: 1, height: 6, backgroundColor: i < Math.round(creditPct * 10) ? creditBand.color : '#1a2040' }} />
                                    ))}
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    {['BAD', 'POOR', 'FAIR', 'GOOD', 'EXCELLENT'].map(l => (
                                        <Text key={l} style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#2a3560' }}>{l}</Text>
                                    ))}
                                </View>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', marginTop: 8 }}>
                                    {creditScore >= 750 ? 'Best loan rates available to you.' :
                                     creditScore >= 700 ? 'Good rates. Pay EMIs on time to improve.' :
                                     creditScore >= 650 ? 'Fair. Avoid missing EMI payments.' :
                                     'Poor. High interest rates. Pay loans on time.'}
                                </Text>
                            </View>
                        </View>

                        {/* Create FD */}
                        <View style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#0a0d1a', overflow: 'hidden' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fbbf2412', borderBottomWidth: 1, borderColor: '#fbbf2430', paddingHorizontal: 14, paddingVertical: 10 }}>
                                <View style={{ width: 3, height: 16, backgroundColor: '#fbbf24' }} />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#fbbf24', letterSpacing: 3 }}>FIXED DEPOSITS</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', marginLeft: 4 }}>guaranteed returns</Text>
                            </View>
                            <View style={{ padding: 14 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#fbbf24', letterSpacing: 3, marginBottom: 12 }}>OPEN NEW FD</Text>

                            {/* Amount input */}
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 2, marginBottom: 6 }}>AMOUNT</Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                                <View style={{ flex: 1, borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#0d1020', paddingHorizontal: 12, paddingVertical: 8}}>
                                    <TextInput
                                        value={fdAmount}
                                        onChangeText={setFdAmount}
                                        keyboardType="numeric"
                                        style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#c8d4f0' }}
                                        placeholderTextColor="#2a3560"
                                        placeholder="50000"
                                    />
                                </View>
                                {[50000, 100000, 500000].map(amt => (
                                    <TouchableOpacity key={amt} onPress={() => setFdAmount(String(amt))} style={{ borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#070a16', paddingHorizontal: 10, justifyContent: 'center'}}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>₹{(amt / 1000)}K</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Tenor options */}
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 2, marginBottom: 8 }}>TENOR</Text>
                            <View style={{ gap: 6, marginBottom: 14 }}>
                                {FD_OPTIONS.map(opt => {
                                    const isSelected = selectedFDOption.id === opt.id;
                                    const amt = parseInt(fdAmount) || 0;
                                    const maturity = maturityAmount(amt, opt.months, opt.rate);
                                    const gain = maturity - amt;
                                    return (
                                        <TouchableOpacity
                                            key={opt.id}
                                            onPress={() => setSelectedFDOption(opt)}
                                            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderWidth: 1, borderColor: isSelected ? '#fbbf24' : '#1a2040', backgroundColor: isSelected ? '#06080f' : '#0d1020'}}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                <View style={{ width: 10, height: 10, borderWidth: 2, borderColor: isSelected ? '#fbbf24' : '#2a3560', backgroundColor: isSelected ? '#fbbf24' : 'transparent' }} />
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: isSelected ? '#fbbf24' : '#445070' }}>{opt.label}</Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: isSelected ? '#fbbf24' : '#2a3560' }}>{opt.rateLabel}</Text>
                                            </View>
                                            {amt >= 10000 && (
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#4ade80' }}>+₹{gain.toLocaleString()}</Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Maturity summary */}
                            {parseInt(fdAmount) >= 10000 && (
                                <View style={{ borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#0d1020', padding: 10, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between'}}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>Maturity value</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#fbbf24' }}>₹{maturityAmount(parseInt(fdAmount), selectedFDOption.months, selectedFDOption.rate).toLocaleString()}</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                onPress={handleCreateFD}
                                style={{ padding: 14, borderWidth: 1, borderColor: '#fbbf24', backgroundColor: '#06080f', alignItems: 'center'}}
                            >
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#fbbf24', letterSpacing: 2 }}>
                                    LOCK IN FD — {selectedFDOption.rateLabel}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Active FDs */}
                        {fds.length > 0 && (
                            <View>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 3, marginBottom: 8 }}>ACTIVE FDs ({fds.length})</Text>
                                {fds.map(fd => {
                                    const opt = FD_OPTIONS.find(o => o.id === fd.optionId) || FD_OPTIONS[2];
                                    const pct = 1 - (fd.monthsLeft / fd.totalMonths);
                                    const isMatured = fd.monthsLeft <= 0;
                                    return (
                                        <View key={fd.id} style={{ borderWidth: 1, borderColor: isMatured ? '#22c55e' : '#fbbf2440', backgroundColor: isMatured ? '#0d1e12' : '#070a16', padding: 12, marginBottom: 8}}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#c8d4f0' }}>₹{fd.principal.toLocaleString()}</Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#fbbf24' }}>₹{Math.round(fd.currentValue).toLocaleString()}</Text>
                                            </View>
                                            <View style={{ height: 5, backgroundColor: '#06080f', marginBottom: 6}}>
                                                <View style={{ height: '100%', width: `${pct * 100}%`, backgroundColor: isMatured ? '#22c55e' : '#fbbf24'}} />
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070' }}>
                                                    {isMatured ? 'MATURED' : `${fd.monthsLeft}mo left`} · {opt.rateLabel}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        const res = breakFD ? breakFD(fd.id) : { success: false, msg: 'Not available' };
                                                        onShowDialog(res.success ? 'FD Broken' : 'Failed', res.msg, res.success ? 'warning' : 'error');
                                                    }}
                                                    style={{ borderWidth: 1, borderColor: isMatured ? '#22c55e' : '#7f1d1d', paddingHorizontal: 10, paddingVertical: 3}}
                                                >
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: isMatured ? '#4ade80' : '#f87171' }}>
                                                        {isMatured ? 'COLLECT' : 'BREAK'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {fds.length === 0 && (
                            <View style={{ alignItems: 'center', padding: 30}}>
                                <FontAwesome5 name="lock" size={32} color="#1a2040" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#2a3560', marginTop: 12, textAlign: 'center' }}>No active FDs{'\n'}Lock in your savings above</Text>
                            </View>
                        )}
                        </View>{/* end FD card */}
                    </View>
                )}

                {/* ── BORROW (Loans) ── */}
                {tab === 'borrow' && (() => {
                    const salary = currentJob?.salary || 0;

                    // Tenure options per loan type
                    const tenureOptions = (lt) => {
                        const max = lt.max_tenure;
                        if (max <= 12) return [3, 6, 12].filter(x => x <= max);
                        if (max <= 60) return [6, 12, 24, 36, 60].filter(x => x <= max);
                        if (max <= 120) return [12, 24, 60, 84, 120].filter(x => x <= max);
                        return [12, 24, 60, 120, 180, 240].filter(x => x <= max);
                    };

                    // Eligibility check per loan type
                    const getEligibility = (lt) => {
                        const issues = [];
                        if (creditScore < lt.min_credit_score) issues.push(`Credit ${lt.min_credit_score}+ needed (you: ${creditScore})`);
                        if (lt.min_income > 0 && salary < lt.min_income) issues.push(`₹${(lt.min_income / 1000).toFixed(0)}k/mo salary needed`);
                        if (lt.min_net_worth && netWorth < lt.min_net_worth) issues.push(`₹${(lt.min_net_worth / 100000).toFixed(0)}L net worth needed`);
                        return issues;
                    };

                    return (
                        <View style={{ gap: 10 }}>

                            {/* ── BORROW section header ── */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f8717110', borderWidth: 1, borderColor: '#1a2040', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 2 }}>
                                <View style={{ width: 3, height: 16, backgroundColor: '#f87171' }} />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#f87171', letterSpacing: 3 }}>LOAN SCHEMES</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', marginLeft: 4 }}>{creditBand.label.toLowerCase()} credit</Text>
                            </View>

                            {LOAN_TYPES.map(lt => {
                                const meta = LOAN_TYPE_META[lt.id] || { name: lt.name, icon: 'file-invoice-dollar', color: '#f87171' };
                                const issues = getEligibility(lt);
                                const eligible = issues.length === 0;
                                const isOpen = applyingLoanId === lt.id;
                                const adjRate = getAdjustedRate(lt.base_interest, creditScore);
                                const tenures = tenureOptions(lt);
                                const selTenure = tenures[Math.min(loanTenureIdx, tenures.length - 1)];
                                const amt = parseInt(loanAmount) || 0;
                                const previewEMI = amt > 0 && selTenure ? calculateEMI(amt, adjRate, selTenure) : 0;
                                const totalPay = previewEMI * selTenure;
                                const totalInterest = totalPay - amt;

                                return (
                                    <View key={lt.id} style={{ borderWidth: 1, borderColor: isOpen ? meta.color + '60' : '#1a2040', backgroundColor: '#0a0d1a', overflow: 'hidden', flexDirection: 'row' }}>
                                        {/* Left accent bar */}
                                        <View style={{ width: 3, backgroundColor: eligible ? meta.color : '#1e2840' }} />

                                        <View style={{ flex: 1 }}>
                                        {/* Header row — tap to open application */}
                                        <TouchableOpacity
                                            onPress={() => {
                                                setApplyingLoanId(isOpen ? null : lt.id);
                                                setLoanAmount('');
                                                setLoanTenureIdx(1);
                                            }}
                                            activeOpacity={0.8}
                                            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 }}
                                        >
                                            <View style={{ width: 40, height: 40, backgroundColor: eligible ? meta.color + '15' : '#1a2040', borderWidth: 1, borderColor: eligible ? meta.color + '40' : '#1e2840', alignItems: 'center', justifyContent: 'center'}}>
                                                <FontAwesome5 name={meta.icon} size={15} color={eligible ? meta.color : '#2a3560'} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: eligible ? '#c8d4f0' : '#445070', lineHeight: 20 }}>{meta.name}</Text>
                                                    {eligible && (
                                                        <View style={{ backgroundColor: meta.color + '20', borderWidth: 1, borderColor: meta.color + '50', paddingHorizontal: 5, paddingVertical: 1 }}>
                                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: meta.color }}>ELIGIBLE</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: eligible ? meta.color : '#2a3560' }}>{adjRate.toFixed(1)}% p.a. · up to {lt.max_tenure}mo</Text>
                                                {!eligible && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#f87171', marginTop: 1 }}>{issues[0]}</Text>}
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                {lt.max_amount
                                                    ? <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: eligible ? meta.color : '#2a3560' }}>₹{(lt.max_amount / 100000).toFixed(0)}L max</Text>
                                                    : <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>LTV</Text>
                                                }
                                                <FontAwesome5 name={isOpen ? 'chevron-up' : 'chevron-down'} size={10} color={eligible ? meta.color + '80' : '#2a3560'} style={{ marginTop: 4 }} />
                                            </View>
                                        </TouchableOpacity>

                                        {/* Application form */}
                                        {isOpen && (
                                            <View style={{ borderTopWidth: 1, borderColor: meta.color + '25', padding: 12, gap: 10 }}>
                                                {/* Description */}
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', lineHeight: 18 }}>{lt.description}</Text>

                                                {!eligible ? (
                                                    <View style={{ backgroundColor: '#1a0808', borderWidth: 1, borderColor: '#7f1d1d', padding: 10}}>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#f87171' }}>You don't qualify yet:</Text>
                                                        {issues.map((iss, i) => (
                                                            <Text key={i} style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#f8717190', marginTop: 2 }}>• {iss}</Text>
                                                        ))}
                                                    </View>
                                                ) : (
                                                    <>
                                                        {/* Amount input */}
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 2 }}>LOAN AMOUNT</Text>
                                                        <View style={{ flexDirection: 'row', gap: 6 }}>
                                                            <View style={{ flex: 1, borderWidth: 1, borderColor: meta.color + '50', backgroundColor: '#0d1020', paddingHorizontal: 12, paddingVertical: 8}}>
                                                                <TextInput
                                                                    value={loanAmount}
                                                                    onChangeText={setLoanAmount}
                                                                    keyboardType="numeric"
                                                                    placeholder={`Max ₹${lt.max_amount ? (lt.max_amount / 100000).toFixed(0) + 'L' : 'varies'}`}
                                                                    placeholderTextColor="#2a3560"
                                                                    style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#c8d4f0' }}
                                                                />
                                                            </View>
                                                            {lt.max_amount && [0.25, 0.5, 1].map(frac => {
                                                                const a = Math.round(lt.max_amount * frac);
                                                                return (
                                                                    <TouchableOpacity key={frac} onPress={() => setLoanAmount(String(a))} style={{ borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#070a16', paddingHorizontal: 8, justifyContent: 'center'}}>
                                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070' }}>₹{(a / 100000).toFixed(0)}L</Text>
                                                                    </TouchableOpacity>
                                                                );
                                                            })}
                                                        </View>

                                                        {/* Tenure selector */}
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 2, marginTop: 4 }}>TENURE</Text>
                                                        <View style={{ flexDirection: 'row', gap: 6 }}>
                                                            {tenures.map((t, i) => (
                                                                <TouchableOpacity
                                                                    key={t}
                                                                    onPress={() => setLoanTenureIdx(i)}
                                                                    style={{ flex: 1, paddingVertical: 7, alignItems: 'center', borderWidth: 1, borderColor: loanTenureIdx === i ? meta.color : '#1a2040', backgroundColor: loanTenureIdx === i ? meta.color + '18' : '#070a16'}}
                                                                >
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: loanTenureIdx === i ? meta.color : '#445070' }}>
                                                                        {t >= 12 ? `${t / 12}yr` : `${t}mo`}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            ))}
                                                        </View>

                                                        {/* EMI preview */}
                                                        {previewEMI > 0 && (
                                                            <View style={{ borderWidth: 1, borderColor: meta.color + '30', backgroundColor: meta.color + '08', padding: 10}}>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 1 }}>MONTHLY EMI</Text>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: meta.color }}>₹{previewEMI.toLocaleString()}/mo</Text>
                                                                </View>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070' }}>Total interest paid</Text>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#f87171' }}>₹{totalInterest.toLocaleString()}</Text>
                                                                </View>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070' }}>Total repayment</Text>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070' }}>₹{totalPay.toLocaleString()}</Text>
                                                                </View>
                                                                {salary > 0 && (
                                                                    <View style={{ marginTop: 6, height: 3, backgroundColor: '#06080f', borderRadius: 2 }}>
                                                                        <View style={{ height: '100%', width: `${Math.min((previewEMI / salary) * 100, 100)}%`, backgroundColor: previewEMI > salary * 0.4 ? '#f87171' : '#4ade80', borderRadius: 2 }} />
                                                                    </View>
                                                                )}
                                                                {salary > 0 && (
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: previewEMI > salary * 0.4 ? '#f87171' : '#445070', marginTop: 3 }}>
                                                                        EMI = {((previewEMI / salary) * 100).toFixed(0)}% of your salary {previewEMI > salary * 0.4 ? '— high debt burden' : '— manageable'}
                                                                    </Text>
                                                                )}
                                                            </View>
                                                        )}

                                                        {/* Tax tip */}
                                                        {lt.id === 'education_loan' && (
                                                            <View style={{ backgroundColor: '#818cf810', borderWidth: 1, borderColor: '#818cf830', padding: 8}}>
                                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#818cf8' }}>Interest deductible under Sec 80E for up to 8 years</Text>
                                                            </View>
                                                        )}
                                                        {lt.id === 'home_loan' && (
                                                            <View style={{ backgroundColor: '#4ade8010', borderWidth: 1, borderColor: '#4ade8030', padding: 8}}>
                                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#4ade80' }}>Interest up to ₹2L/yr deductible (Sec 24b). Principal under 80C.</Text>
                                                            </View>
                                                        )}

                                                        {/* Apply button */}
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                if (!amt || amt < 10000) { onShowDialog('Invalid Amount', 'Minimum loan amount is ₹10,000.', 'error'); return; }
                                                                const res = takeLoan(lt.id, amt, selTenure);
                                                                onShowDialog(res.success ? 'Loan Approved!' : 'Application Rejected', res.msg, res.success ? 'success' : 'error');
                                                                if (res.success) { setApplyingLoanId(null); setLoanAmount(''); }
                                                            }}
                                                            style={{ paddingVertical: 12, borderWidth: 1, borderColor: meta.color, backgroundColor: meta.color + '18', alignItems: 'center'}}
                                                        >
                                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: meta.color, letterSpacing: 1 }}>
                                                                {previewEMI > 0 ? `APPLY — ₹${previewEMI.toLocaleString()}/mo` : 'APPLY FOR LOAN'}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </>
                                                )}
                                            </View>
                                        )}
                                        </View>
                                    </View>
                                );
                            })}

                            {/* ── Active loans section ── */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0a0d1a', borderWidth: 1, borderColor: '#1a2040', paddingHorizontal: 12, paddingVertical: 10, marginTop: 6, marginBottom: 2 }}>
                                <View style={{ width: 3, height: 16, backgroundColor: '#f87171' }} />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#f87171', letterSpacing: 3 }}>MY ACTIVE LOANS</Text>
                                {loans.length > 0 && <View style={{ marginLeft: 4, backgroundColor: '#f8717120', borderWidth: 1, borderColor: '#f8717140', paddingHorizontal: 6, paddingVertical: 1 }}><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#f87171' }}>{loans.length}</Text></View>}
                            </View>

                            {loans.length === 0 ? (
                                <View style={{ alignItems: 'center', padding: 24, borderWidth: 1, borderColor: '#166534', backgroundColor: '#0d1e12'}}>
                                    <FontAwesome5 name="check-circle" size={28} color="#4ade80" />
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#4ade80', marginTop: 10 }}>Debt Free!</Text>
                                </View>
                            ) : (
                                <>
                                    <View style={{ borderWidth: 1, borderColor: '#7f1d1d', backgroundColor: '#1a0808', padding: 12,}}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#7f1d1d', letterSpacing: 3, marginBottom: 4 }}>TOTAL DEBT</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 34, color: '#f87171', lineHeight: 36 }}>₹{totalLoanDebt.toLocaleString()}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#7f1d1d' }}>₹{totalEMI.toLocaleString()}/mo EMI · {loans.length} loan{loans.length !== 1 ? 's' : ''}</Text>
                                    </View>

                                    {loans.map((loan) => {
                                        const meta = LOAN_TYPE_META[loan.loanTypeId] || LOAN_TYPE_META[loan.type] || { name: loan.type || 'Loan', icon: 'file-invoice-dollar', color: '#f87171' };
                                        const originalPrincipal = loan.principal || loan.totalPrincipal || loan.remainingPrincipal;
                                        const paidPct = originalPrincipal > 0 ? Math.max(0, 1 - (loan.remainingPrincipal / originalPrincipal)) : 0;
                                        const annualRate = (loan.monthlyRate || 0) * 12 * 100;
                                        const monthsLeft = loan.tenureRemaining ?? loan.monthsLeft ?? 0;
                                        const interestThisMonth = Math.round(loan.remainingPrincipal * (loan.monthlyRate || 0));
                                        const totalInterestLeft = Math.max(0, (loan.emi * monthsLeft) - loan.remainingPrincipal);
                                        const isExpanded = selectedLoanId === loan.id;

                                        return (
                                            <View key={loan.id} style={{ borderWidth: 1, borderColor: isExpanded ? meta.color + '80' : '#1a2040', backgroundColor: isExpanded ? meta.color + '06' : '#070a16'}}>
                                                <TouchableOpacity onPress={() => setSelectedLoanId(isExpanded ? null : loan.id)} style={{ padding: 12 }} activeOpacity={0.8}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                        <View style={{ width: 34, height: 34, backgroundColor: meta.color + '18', borderWidth: 1, borderColor: meta.color + '40', alignItems: 'center', justifyContent: 'center'}}>
                                                            <FontAwesome5 name={meta.icon} size={13} color={meta.color} />
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#c8d4f0' }}>{meta.name}</Text>
                                                            {annualRate > 0 && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: meta.color }}>{annualRate.toFixed(1)}% p.a.</Text>}
                                                        </View>
                                                        <View style={{ alignItems: 'flex-end' }}>
                                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 19, color: '#f87171' }}>₹{loan.remainingPrincipal.toLocaleString()}</Text>
                                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070' }}>outstanding</Text>
                                                        </View>
                                                    </View>
                                                    <View style={{ height: 5, backgroundColor: '#06080f', marginBottom: 5}}>
                                                        <View style={{ height: '100%', width: `${paidPct * 100}%`, backgroundColor: meta.color}} />
                                                    </View>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070' }}>EMI ₹{loan.emi.toLocaleString()}/mo · {monthsLeft}mo left</Text>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: meta.color }}>{Math.round(paidPct * 100)}% paid</Text>
                                                    </View>
                                                </TouchableOpacity>

                                                {isExpanded && (
                                                    <View style={{ borderTopWidth: 1, borderColor: '#1a2040', padding: 12, gap: 10 }}>
                                                        <View style={{ flexDirection: 'row', gap: 6 }}>
                                                            {[
                                                                { label: 'THIS MONTH', val: `₹${interestThisMonth.toLocaleString()}`, sub: 'interest', col: '#f87171' },
                                                                { label: 'INTEREST LEFT', val: `₹${Math.round(totalInterestLeft).toLocaleString()}`, sub: 'to pay', col: '#fb923c' },
                                                                { label: 'BORROWED', val: `₹${originalPrincipal.toLocaleString()}`, sub: 'originally', col: '#445070' },
                                                            ].map((s, i) => (
                                                                <View key={i} style={{ flex: 1, backgroundColor: '#0d1020', borderWidth: 1, borderColor: '#1e2840', padding: 8}}>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#2a3560', letterSpacing: 1 }}>{s.label}</Text>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: s.col }}>{s.val}</Text>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#445070' }}>{s.sub}</Text>
                                                                </View>
                                                            ))}
                                                        </View>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 2 }}>MAKE A PAYMENT</Text>
                                                        <View style={{ flexDirection: 'row', gap: 6 }}>
                                                            {[loan.emi, Math.round(loan.emi * 3), Math.round(loan.remainingPrincipal)].map((amt, idx) => (
                                                                <TouchableOpacity key={idx} onPress={() => setPrepayInput(String(amt))} style={{ flex: 1, borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#0d1020', padding: 7, alignItems: 'center'}}>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#445070' }}>{idx === 0 ? '1 EMI' : idx === 1 ? '3 EMIs' : 'FULL'}</Text>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#c8d4f0' }}>₹{amt.toLocaleString()}</Text>
                                                                </TouchableOpacity>
                                                            ))}
                                                        </View>
                                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                                            <View style={{ flex: 1, borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#0d1020', paddingHorizontal: 12, paddingVertical: 8}}>
                                                                <TextInput value={prepayInput} onChangeText={setPrepayInput} keyboardType="numeric" placeholder="Custom amount" placeholderTextColor="#2a3560" style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#c8d4f0' }} />
                                                            </View>
                                                            <TouchableOpacity
                                                                onPress={() => {
                                                                    const amt = parseInt(prepayInput) || 0;
                                                                    if (amt < loan.emi) { onShowDialog('Too Low', `Min ₹${loan.emi.toLocaleString()} (1 EMI).`, 'error'); return; }
                                                                    const res = prepayLoan ? prepayLoan(loan.id, amt) : { success: false, msg: 'Not available' };
                                                                    if (res.success) { setPrepayInput(''); if (amt >= loan.remainingPrincipal) setSelectedLoanId(null); }
                                                                    onShowDialog(res.success ? 'Payment Made' : 'Failed', res.msg, res.success ? 'success' : 'error');
                                                                }}
                                                                style={{ backgroundColor: meta.color, paddingHorizontal: 16, justifyContent: 'center'}}
                                                            >
                                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#000' }}>PAY</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>
                                        );
                                    })}
                                </>
                            )}
                        </View>
                    );
                })()}

                {/* ── CA RETAINER ── */}
                {tab === 'ca' && (() => {
                    const currentMonth = turn?.month || 1;
                    const currentYear = turn?.year || 2024;
                    const monthsToITR = currentMonth <= 7 ? 7 - currentMonth : (12 - currentMonth) + 7;
                    const itrThisYear = itrFiled?.[currentYear];
                    const monthsSubscribed = caSubscribed && caSubscribedMonth != null ? totalMonthsPlayed - caSubscribedMonth : 0;
                    const totalFeesPaid = monthsSubscribed * (CA_MONTHLY_FEE || 2000);

                    return (
                        <View style={{ gap: 12 }}>
                            {/* CA Office banner */}
                            <View style={{ height: 120, position: 'relative', borderWidth: 1, borderColor: '#1a2040', overflow: 'hidden',}}>
                                <Image source={require('../../assets/CA_Office.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,20,0.55)' }} />
                                <View style={{ position: 'absolute', bottom: 12, left: 14 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#fbbf24', letterSpacing: 3 }}>CHARTERED ACCOUNTANT</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0' }}>CA Sharma & Associates</Text>
                                </View>
                                {caSubscribed && (
                                    <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: '#4ade8020', borderWidth: 1, borderColor: '#4ade8060', paddingHorizontal: 8, paddingVertical: 3}}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#4ade80', letterSpacing: 2 }}>ACTIVE</Text>
                                    </View>
                                )}
                            </View>

                            {/* ITR Countdown */}
                            <View style={{ borderWidth: 1, borderColor: itrThisYear ? '#4ade8040' : '#fbbf2440', backgroundColor: itrThisYear ? '#0d1e12' : '#06080f', padding: 14,}}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 3, marginBottom: 4 }}>ITR FILING — FY {currentYear - 1}-{String(currentYear).slice(2)}</Text>
                                {itrThisYear ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <FontAwesome5 name="check-circle" size={20} color="#4ade80" />
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#4ade80' }}>
                                            Filed — {itrThisYear === 'ca' ? 'via CA' : itrThisYear === 'self' ? 'Self Filed' : 'Skipped (Penalty Paid)'}
                                        </Text>
                                    </View>
                                ) : (
                                    <View>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: '#fbbf24' }}>{monthsToITR} months</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070' }}>until July 31 deadline</Text>
                                    </View>
                                )}
                            </View>

                            {/* Subscription card */}
                            <View style={{ borderWidth: 1, borderColor: caSubscribed ? '#a78bfa60' : '#1a2040', backgroundColor: caSubscribed ? '#a78bfa08' : '#070a16', padding: 14,}}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 3, marginBottom: 10 }}>CA RETAINER</Text>

                                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                                    {[
                                        { label: 'MONTHLY FEE', value: '₹2,000/mo', color: '#f87171' },
                                        { label: 'TAX SAVING', value: '~₹25K extra deductions', color: '#4ade80' },
                                        { label: 'ITR FILING', value: 'Included', color: '#a78bfa' },
                                    ].map((s, i) => (
                                        <View key={i} style={{ flex: 1, backgroundColor: '#0d1020', borderWidth: 1, borderColor: '#1e2840', padding: 8}}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#2a3560', letterSpacing: 1 }}>{s.label}</Text>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: s.color }}>{s.value}</Text>
                                        </View>
                                    ))}
                                </View>

                                {caSubscribed && (
                                    <View style={{ borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#0d1020', padding: 10, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between'}}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070' }}>Subscribed for {monthsSubscribed} month{monthsSubscribed !== 1 ? 's' : ''}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070' }}>₹{totalFeesPaid.toLocaleString()} paid</Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    onPress={() => {
                                        const res = caSubscribed ? cancelCA() : subscribeCA();
                                        onShowDialog(res.success ? (caSubscribed ? 'CA Cancelled' : 'CA Subscribed!') : 'Failed', res.msg, res.success ? (caSubscribed ? 'warning' : 'success') : 'error');
                                    }}
                                    style={{ padding: 14, borderWidth: 1, borderColor: caSubscribed ? '#7f1d1d' : '#a78bfa', backgroundColor: caSubscribed ? '#1a0808' : '#1a0f2e', alignItems: 'center'}}
                                >
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: caSubscribed ? '#f87171' : '#a78bfa', letterSpacing: 2 }}>
                                        {caSubscribed ? 'CANCEL SUBSCRIPTION' : 'SUBSCRIBE — ₹2,000/MO'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* What your CA does */}
                            <View style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#0d1020', padding: 12,}}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 3, marginBottom: 8 }}>WHAT YOUR CA DOES</Text>
                                {[
                                    { icon: 'file-alt', color: '#a78bfa', text: 'Files your ITR every July — no penalty, no stress' },
                                    { icon: 'search-dollar', color: '#4ade80', text: 'Finds ₹25,000+ extra tax deductions per year' },
                                    { icon: 'shield-alt', color: '#fbbf24', text: 'Protects you from IT notices and scrutiny' },
                                    { icon: 'chart-line', color: '#fbbf24', text: 'Advises on tax-efficient investment allocation' },
                                ].map((tip, i) => (
                                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                                        <FontAwesome5 name={tip.icon} size={12} color={tip.color} />
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', flex: 1 }}>{tip.text}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })()}

            </ScrollView>}
        </View>
    );
}
