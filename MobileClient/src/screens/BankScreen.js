import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { useGame } from '../context/GameContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { LOAN_TYPES, calculateEMI, getAdjustedRate } from '../data/loans';
import { GOLD_ASSETS } from '../data/gold';

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
    personal_loan:        { name: 'Personal Loan',         icon: 'user',            color: '#f87171', img: require('../../assets/ui_comp/borrow.png') },
    education_loan:       { name: 'Education Loan',        icon: 'graduation-cap',  color: '#818cf8', img: require('../../assets/jobs/coaching centre.png') },
    home_loan:            { name: 'Home Loan',             icon: 'home',            color: '#4ade80', img: require('../../assets/properties/1bhk_starter_apartment.png') },
    business_loan:        { name: 'Business Loan',         icon: 'briefcase',       color: '#fbbf24', img: require('../../assets/properties/CA_Office.png') },
    loan_against_property:{ name: 'Loan Against Property', icon: 'building',        color: '#c084fc', img: require('../../assets/properties/city_apartment_with_2_beds_and_1_bath.png') },
    marriage_loan:        { name: 'Marriage Loan',         icon: 'heart',           color: '#ec4899', img: require('../../assets/properties/investment properties/marraige_banquet_hall.png') },
    'Personal Loan':      { name: 'Personal Loan',         icon: 'user',            color: '#f87171', img: require('../../assets/ui_comp/borrow.png') },
};

export default function BankScreen({ onClose, onShowDialog }) {
    const {
        balance, creditScore, netWorth, currentJob,
        loans, getTotalEMI, takeLoan,
        fixedDeposits, createFD, breakFD,
        prepayLoan,
        caSubscribed, caSubscribedMonth, subscribeCA, cancelCA, itrFiled, CA_MONTHLY_FEE,
        turn, totalMonthsPlayed,
        itrSelfFiling, startSelfFiling, getRequiredITRDocs, getITRForms,
        selectITRForm, collectITRDoc, computeITRTaxFull, submitITR,
        goldHoldings, goldPrice, buyGold, sellGold, getGoldValue,
        creditCard, activeCreditCards, openCreditCard, payCreditCardBill, closeCreditCard,
        getFinancialTips,
        dependents, childSavings, transferToChildSavings,
        retirementBuckets, setupRetirementBuckets, isRetired,
        ppf, nps,
    } = useGame();

    const [tab, setTab] = useState(null); // null=landing | save | borrow | ca | gold | card | retire | childSavings
    const [tipsOpen, setTipsOpen] = useState(true);
    const [fdAmount, setFdAmount] = useState('50000');
    const [selectedFDOption, setSelectedFDOption] = useState(FD_OPTIONS[2]);
    const [selectedLoanId, setSelectedLoanId] = useState(null);
    const [prepayInput, setPrepayInput] = useState('');

    // Child savings state
    const [selectedChild, setSelectedChild] = useState(null);
    const [childSaveAmount, setChildSaveAmount] = useState('10000');

    // Loan application state
    const [applyingLoanId, setApplyingLoanId] = useState(null);
    const [loanAmount, setLoanAmount] = useState('');
    const [loanTenureIdx, setLoanTenureIdx] = useState(1);

    // Gold state
    const [selectedGoldAsset, setSelectedGoldAsset] = useState(GOLD_ASSETS[0]);
    const [goldGrams, setGoldGrams] = useState('1');
    const [goldSellGrams, setGoldSellGrams] = useState('');

    // Credit card state
    const [cardPayInput, setCardPayInput] = useState('');

    const CREDIT_CARDS_DATA = [
        {
            id: 'standard',
            name: 'Standard Credit Card',
            image: require('../../assets/ui_comp/credit card.png'),
            desc: 'Pay for purchases this month, settle the bill next month — interest-free. Miss the due date and you pay 36% APR.',
            criteriaText: 'Need credit score ≥ 600',
            isEligible: creditScore >= 600,
            perk: 'Basic cash flow management.'
        },
        {
            id: 'premium',
            name: 'Premium Reserve Card',
            image: require('../../assets/ui_comp/premium credit card.png'),
            desc: 'Exclusive lifestyle perks, airport lounge access, and a massive credit limit. Annual fee of ₹5,000.',
            criteriaText: 'Need score 750+ AND (Net Worth ₹10L OR Salary ₹1L/mo)',
            isEligible: creditScore >= 750 && (netWorth >= 1000000 || (currentJob && currentJob.salary >= 100000)),
            perk: 'Passively boosts happiness.'
        },
        {
            id: 'minor',
            name: 'Supplementary Minor Card',
            image: require('../../assets/ui_comp/supplementary minor account credit card.png'),
            desc: "Build your child's credit history early, giving a massive boost to their college prospects and reducing tuition loans later.",
            criteriaText: 'Must have at least one child (dependent)',
            isEligible: dependents.length > 0,
            perk: 'Unlocks better education loan rates for your child.'
        }
    ];

    // Retirement bucket state
    const [b1Input, setB1Input] = useState('');
    const [b2Input, setB2Input] = useState('');
    const [b3Input, setB3Input] = useState('');

    const creditBand = CREDIT_BANDS.find(b => creditScore >= b.min) || CREDIT_BANDS[4];
    const creditPct = Math.min(Math.max((creditScore - 300) / (900 - 300), 0), 1);
    const totalEMI = getTotalEMI ? getTotalEMI() : loans.reduce((s, l) => s + l.emi, 0);
    const totalLoanDebt = loans.reduce((s, l) => s + l.remainingPrincipal, 0);
    const fds = fixedDeposits || [];
    const totalFDValue = fds.reduce((s, fd) => s + fd.currentValue, 0);
    const totalGoldValue = getGoldValue ? getGoldValue() : 0;
    const tips = getFinancialTips ? getFinancialTips() : [];

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
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#4a5580', letterSpacing: 2 }}>BALANCE</Text>
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
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#4a5580', lineHeight: 12 }}>CREDIT</Text>
                    </View>
                </View>
                <View style={{ width: 1, backgroundColor: '#1a2040' }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: totalEMI > 0 ? '#f87171' : '#4ade80', lineHeight: 24 }}>
                        {totalEMI > 0 ? `₹${(totalEMI / 1000).toFixed(0)}k/mo` : 'NONE'}
                    </Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#4a5580', lineHeight: 12 }}>EMI</Text>
                </View>
                <View style={{ width: 1, backgroundColor: '#1a2040' }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#fbbf24', lineHeight: 24 }}>
                        {totalFDValue > 0 ? `₹${(totalFDValue / 1000).toFixed(0)}k` : 'NIL'}
                    </Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#4a5580', lineHeight: 12 }}>FDs</Text>
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
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#c8d4f0', letterSpacing: 2 }}>
                        {tab === 'save' ? 'SAVE & EARN' : tab === 'ca' ? 'TAXES & ITR' : tab === 'gold' ? 'GOLD' : tab === 'card' ? 'CREDIT CARD' : tab === 'retire' ? 'RETIREMENT BUCKETS' : tab === 'childSavings' ? 'CHILD SAVINGS' : applyingLoanId ? (LOAN_TYPE_META[applyingLoanId]?.name || 'LOAN') : 'BORROW'}
                    </Text>
                </View>
            )}

            {/* Landing cards */}
            {!tab && (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>

                    {/* Primary cards — full width, horizontal layout */}
                    {[
                        { onPress: () => setTab('save'), img: require('../../assets/ui_comp/saveandearn.png'), accent: '#fbbf24', label: 'GROW YOUR SAVINGS', name: 'Save & Earn', sub: 'Fixed Deposits', locked: false, stat1L: 'CREDIT', stat1V: String(creditScore), stat1C: creditBand.color, stat2L: 'FD VALUE', stat2V: totalFDValue > 0 ? `₹${(totalFDValue/1000).toFixed(0)}k` : 'NIL', stat2C: '#fbbf24' },
                        { onPress: () => { if (totalMonthsPlayed < 3) { onShowDialog('Locked', 'Borrowing unlocks in Month 3.', 'error'); return; } setTab('borrow'); }, img: require('../../assets/ui_comp/borrow.png'), accent: '#f87171', label: 'LOANS & CREDIT', name: 'Borrow', sub: 'Personal · Home · Business', locked: totalMonthsPlayed < 3, stat1L: 'ACTIVE LOANS', stat1V: String(loans.length), stat1C: loans.length > 0 ? '#f87171' : '#4ade80', stat2L: 'EMI / MO', stat2V: totalEMI > 0 ? `₹${(totalEMI/1000).toFixed(0)}k` : 'None', stat2C: totalEMI > 0 ? '#f87171' : '#4ade80' },
                    ].map((card, i) => (
                        <TouchableOpacity key={i} onPress={card.onPress} activeOpacity={0.85}
                            style={{ borderRadius: 10, overflow: 'hidden', opacity: card.locked ? 0.5 : 1, backgroundColor: '#08101e', flexDirection: 'row', height: 110, marginBottom: 10 }}>
                            <View style={{ width: 110, height: 110, backgroundColor: '#060810', alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={card.img} style={{ width: 96, height: 96 }} resizeMode="contain" />
                            </View>
                            <View style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 12, justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: card.accent, letterSpacing: 3, marginBottom: 1 }}>{card.label}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0', lineHeight: 24 }}>{card.name}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#2a3860', marginTop: 1 }}>{card.locked ? 'Locked' : card.sub}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 16 }}>
                                    <View>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 1 }}>{card.stat1L}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: card.stat1C, lineHeight: 19 }}>{card.stat1V}</Text>
                                    </View>
                                    <View>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 1 }}>{card.stat2L}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: card.stat2C, lineHeight: 19 }}>{card.stat2V}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* Secondary cards — 2-col grid */}
                    {(() => {
                        const secondary = [
                            { onPress: () => { if (totalMonthsPlayed < 10) { onShowDialog('Locked', 'CA Services unlock in Month 10.', 'error'); return; } setTab('ca'); }, img: require('../../assets/CA_Office.png'), accent: '#a78bfa', name: 'Taxes & ITR', sub: caSubscribed ? 'CA Active' : (itrFiled?.[turn?.year] ? 'Filed' : 'Pending'), locked: totalMonthsPlayed < 10 },
                            { onPress: () => setTab('card'), img: require('../../assets/ui_comp/cards landing page icon.png'), accent: '#60a5fa', name: 'Credit Card', sub: (activeCreditCards?.length > 0 || creditCard) ? 'Active' : 'Build credit', locked: false },
                            { onPress: () => { if (!(isRetired || totalMonthsPlayed >= 6 || netWorth >= 50000)) { onShowDialog('Locked', 'Unlocks at Month 6.', 'error'); return; } setTab('retire'); }, img: require('../../assets/ui_comp/retirement_buckets.png'), accent: '#818cf8', name: 'Retirement', sub: ppf?.balance > 0 ? `₹${(ppf.balance/1000).toFixed(0)}k saved` : 'PPF · NPS', locked: !(isRetired || totalMonthsPlayed >= 6 || netWorth >= 50000) },
                            { onPress: () => { if (!dependents.some(d => d.type === 'child')) { onShowDialog('Locked', 'Need a child first.', 'error'); return; } setTab('childSavings'); }, img: require('../../assets/ui_comp/saving_for_child.png'), accent: '#ec4899', name: 'Child Savings', sub: 'Build their future', locked: !dependents.some(d => d.type === 'child') },
                            { onPress: () => setTab('gold'), img: require('../../assets/ui_comp/gold_vault.png'), accent: '#fbbf24', name: 'Gold', sub: totalGoldValue > 0 ? `₹${(totalGoldValue/1000).toFixed(0)}k held` : `₹${goldPrice?.toLocaleString()}/g`, locked: false },
                        ];
                        const rows = [];
                        for (let i = 0; i < secondary.length; i += 2) {
                            rows.push(
                                <View key={i} style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                                    {secondary.slice(i, i + 2).map((card, j) => (
                                        <TouchableOpacity key={j} onPress={card.onPress} activeOpacity={0.85}
                                            style={{ flex: 1, borderRadius: 10, overflow: 'hidden', opacity: card.locked ? 0.45 : 1, backgroundColor: '#08101e' }}>
                                            <View style={{ height: 130, backgroundColor: '#060810', alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={card.img} style={{ width: 100, height: 100 }} resizeMode="contain" />
                                            </View>
                                            <View style={{ padding: 12 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: card.accent, letterSpacing: 2, marginBottom: 2 }}>{card.locked ? 'LOCKED' : '●'}</Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0', lineHeight: 24 }}>{card.name}</Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#2a3860', marginTop: 2 }}>{card.sub}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                    {secondary.slice(i, i + 2).length === 1 && <View style={{ flex: 1 }} />}
                                </View>
                            );
                        }
                        return rows;
                    })()}

                    {/* Financial Tips — collapsible */}
                    {tips.length > 0 && (
                        <View style={{ marginTop: 16 }}>
                            <TouchableOpacity onPress={() => setTipsOpen(o => !o)} activeOpacity={0.8}
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: tipsOpen ? 10 : 0 }}>
                                <Image source={require('../../assets/ui_comp/bulb.png')} style={{ width: 22, height: 22 }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 3, flex: 1 }}>ADVISOR TIPS</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#2a3560' }}>{tipsOpen ? '▲' : '▼'}</Text>
                            </TouchableOpacity>
                            {tipsOpen && tips.map((tip, i) => (
                                <View key={i} style={{ paddingVertical: 10, borderTopWidth: i > 0 ? 1 : 0, borderColor: '#0f1525', flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                                    <Image source={require('../../assets/ui_comp/bulb.png')} style={{ width: 18, height: 18, marginTop: 2 }} resizeMode="contain" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#c8d4f0', lineHeight: 19 }}>{tip.title}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070', lineHeight: 18, marginTop: 2 }}>{tip.body}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}

            {tab && tab !== 'gold' && tab !== 'card' && tab !== 'retire' && tab !== 'childSavings' && <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>

                {/* ── SAVE & EARN ── */}
                {tab === 'save' && (
                    <View style={{ gap: 24 }}>

                        {/* Credit score — no box, just data */}
                        <View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#4a5580', letterSpacing: 3, marginBottom: 8 }}>CREDIT SCORE</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 14, marginBottom: 12 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 56, color: creditBand.color, lineHeight: 58 }}>{creditScore}</Text>
                                <View style={{ paddingBottom: 6 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: creditBand.color, lineHeight: 24 }}>{creditBand.label}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070' }}>out of 900</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 3, marginBottom: 8 }}>
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <View key={i} style={{ flex: 1, height: 5, borderRadius: 2, backgroundColor: i < Math.round(creditPct * 10) ? creditBand.color : '#1a2040' }} />
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                {['BAD', 'POOR', 'FAIR', 'GOOD', 'EXCELLENT'].map(l => (
                                    <Text key={l} style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#4a5580' }}>{l}</Text>
                                ))}
                            </View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070' }}>
                                {creditScore >= 750 ? 'Best loan rates available to you.' :
                                 creditScore >= 700 ? 'Good rates. Pay EMIs on time to improve.' :
                                 creditScore >= 650 ? 'Fair. Avoid missing EMI payments.' :
                                 'Poor. High interest rates. Pay loans on time.'}
                            </Text>
                        </View>

                        <View style={{ height: 1, backgroundColor: '#0f1525' }} />

                        {/* Fixed Deposits */}
                        <View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#4a5580', letterSpacing: 3, marginBottom: 4 }}>FIXED DEPOSITS</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#fbbf24', lineHeight: 30, marginBottom: 18 }}>Lock In Your Savings</Text>

                            {/* Amount */}
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#4a5580', letterSpacing: 2, marginBottom: 8 }}>AMOUNT</Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                                <View style={{ flex: 1, backgroundColor: '#0d1020', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 }}>
                                    <TextInput
                                        value={fdAmount}
                                        onChangeText={setFdAmount}
                                        keyboardType="numeric"
                                        style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0' }}
                                        placeholderTextColor="#2a3560"
                                        placeholder="50000"
                                    />
                                </View>
                                {[50000, 100000, 500000].map(amt => (
                                    <TouchableOpacity key={amt} onPress={() => setFdAmount(String(amt))}
                                        style={{ backgroundColor: '#0d1020', borderRadius: 8, paddingHorizontal: 12, justifyContent: 'center' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070' }}>₹{amt / 1000}K</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Tenor */}
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#4a5580', letterSpacing: 2, marginBottom: 10 }}>TENOR</Text>
                            <View style={{ gap: 4, marginBottom: 20 }}>
                                {FD_OPTIONS.map(opt => {
                                    const isSelected = selectedFDOption.id === opt.id;
                                    const amt = parseInt(fdAmount) || 0;
                                    const gain = maturityAmount(amt, opt.months, opt.rate) - amt;
                                    return (
                                        <TouchableOpacity key={opt.id} onPress={() => setSelectedFDOption(opt)}
                                            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, paddingHorizontal: 14, borderRadius: 8, backgroundColor: isSelected ? '#141a2e' : 'transparent' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isSelected ? '#fbbf24' : '#2a3560' }} />
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: isSelected ? '#fbbf24' : '#445070' }}>{opt.label}</Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: isSelected ? '#fbbf2499' : '#2a3560' }}>{opt.rateLabel}</Text>
                                            </View>
                                            {amt >= 10000 && (
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#4ade80' }}>+₹{gain.toLocaleString()}</Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {parseInt(fdAmount) >= 10000 && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 4 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070' }}>Maturity value</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#fbbf24' }}>₹{maturityAmount(parseInt(fdAmount), selectedFDOption.months, selectedFDOption.rate).toLocaleString()}</Text>
                                </View>
                            )}

                            <TouchableOpacity onPress={handleCreateFD}
                                style={{ paddingVertical: 16, backgroundColor: '#141a2e', borderRadius: 10, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#fbbf24', letterSpacing: 2 }}>
                                    LOCK IN — {selectedFDOption.rateLabel}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Active FDs */}
                        {fds.length > 0 && (
                            <View style={{ gap: 2 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#4a5580', letterSpacing: 3, marginBottom: 10 }}>ACTIVE FDs ({fds.length})</Text>
                                {fds.map(fd => {
                                    const opt = FD_OPTIONS.find(o => o.id === fd.optionId) || FD_OPTIONS[2];
                                    const pct = 1 - (fd.monthsLeft / fd.totalMonths);
                                    const isMatured = fd.monthsLeft <= 0;
                                    return (
                                        <View key={fd.id} style={{ paddingVertical: 14, borderTopWidth: 1, borderColor: '#0f1525' }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <View>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#4a5580', letterSpacing: 1 }}>{isMatured ? 'MATURED' : `${fd.monthsLeft}mo left`} · {opt.rateLabel}</Text>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0' }}>₹{fd.principal.toLocaleString()}</Text>
                                                </View>
                                                <View style={{ alignItems: 'flex-end' }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#4a5580', letterSpacing: 1 }}>NOW WORTH</Text>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: isMatured ? '#4ade80' : '#fbbf24' }}>₹{Math.round(fd.currentValue).toLocaleString()}</Text>
                                                </View>
                                            </View>
                                            <View style={{ height: 4, backgroundColor: '#0d1020', borderRadius: 2, marginBottom: 10 }}>
                                                <View style={{ height: '100%', width: `${pct * 100}%`, borderRadius: 2, backgroundColor: isMatured ? '#22c55e' : '#fbbf24' }} />
                                            </View>
                                            <TouchableOpacity onPress={() => { const res = breakFD ? breakFD(fd.id) : { success: false, msg: 'Not available' }; onShowDialog(res.success ? 'FD Broken' : 'Failed', res.msg, res.success ? 'warning' : 'error'); }}
                                                style={{ alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 6, backgroundColor: isMatured ? '#0d2218' : '#1a0a0a' }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: isMatured ? '#4ade80' : '#f87171', letterSpacing: 1 }}>
                                                    {isMatured ? 'COLLECT ›' : 'BREAK'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {fds.length === 0 && (
                            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#4a5580', textAlign: 'center' }}>No active FDs — lock in your savings above</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* ── BORROW (Loans) ── */}
                {tab === 'borrow' && (() => {
                    const salary = currentJob?.salary || 0;

                    const tenureOptions = (lt) => {
                        const max = lt.max_tenure;
                        if (max <= 12)  return [3, 6, 12].filter(x => x <= max);
                        if (max <= 60)  return [6, 12, 24, 36, 60].filter(x => x <= max);
                        if (max <= 120) return [12, 24, 60, 84, 120].filter(x => x <= max);
                        return [12, 24, 60, 120, 180, 240].filter(x => x <= max);
                    };

                    const getEligibility = (lt) => {
                        const issues = [];
                        if (creditScore < lt.min_credit_score) issues.push(`Credit ${lt.min_credit_score}+ needed (you: ${creditScore})`);
                        if (lt.min_income > 0 && salary < lt.min_income) issues.push(`₹${(lt.min_income / 1000).toFixed(0)}k/mo salary needed`);
                        if (lt.min_net_worth && netWorth < lt.min_net_worth) issues.push(`₹${(lt.min_net_worth / 100000).toFixed(0)}L net worth needed`);
                        return issues;
                    };

                    // ── Loan type card landing ──
                    if (!applyingLoanId) {
                        const CARD_H = 130;
                        return (
                            <View style={{ gap: 10 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#4a5580', letterSpacing: 3, marginBottom: 4 }}>
                                    CREDIT: <Text style={{ color: creditBand.color }}>{creditScore} {creditBand.label}</Text>
                                </Text>

                                {/* 2-col loan card grid */}
                                {(() => {
                                    const rows = [];
                                    for (let i = 0; i < LOAN_TYPES.length; i += 2) {
                                        const pair = [LOAN_TYPES[i], LOAN_TYPES[i + 1]].filter(Boolean);
                                        rows.push(
                                            <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
                                                {pair.map(lt => {
                                                    const meta = LOAN_TYPE_META[lt.id] || { name: lt.name, color: '#f87171', img: null };
                                                    const issues = getEligibility(lt);
                                                    const eligible = issues.length === 0;
                                                    const adjRate = getAdjustedRate(lt.base_interest, creditScore);
                                                    return (
                                                        <TouchableOpacity
                                                            key={lt.id}
                                                            onPress={() => { setApplyingLoanId(lt.id); setLoanAmount(''); setLoanTenureIdx(1); }}
                                                            activeOpacity={0.8}
                                                            style={{ flex: 1, borderRadius: 10, overflow: 'hidden', backgroundColor: '#08101e', opacity: eligible ? 1 : 0.45 }}
                                                        >
                                                            <View style={{ height: CARD_H, position: 'relative' }}>
                                                                {meta.img && <Image source={meta.img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />}
                                                                <View style={{ position: 'absolute', inset: 0, backgroundColor: eligible ? 'rgba(4,6,14,0.35)' : 'rgba(4,6,14,0.65)' }} />
                                                                {!eligible && <View style={{ position: 'absolute', top: 8, right: 8 }}><Image source={require('../../assets/ui_comp/lock.png')} style={{ width: 24, height: 24 }} resizeMode="contain" /></View>}
                                                                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(4,6,14,0.8)', padding: 8 }}>
                                                                    <View style={{ marginBottom: 1 }}>
                                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: eligible ? '#c8d4f0' : '#445070', lineHeight: 19 }} numberOfLines={1}>{meta.name}</Text>
                                                                    </View>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', lineHeight: 15 }}>
                                                                        {adjRate.toFixed(1)}% · {lt.max_amount ? `₹${(lt.max_amount / 100000).toFixed(0)}L` : 'LTV'}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                                {pair.length === 1 && <View style={{ flex: 1 }} />}
                                            </View>
                                        );
                                    }
                                    return rows;
                                })()}

                                {/* ── Active loans section ── */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, marginTop: 6 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 3, flex: 1 }}>MY ACTIVE LOANS</Text>
                                {loans.length > 0 && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070' }}>{loans.length} active</Text>}
                            </View>

                            {loans.length === 0 ? (
                                <View style={{ alignItems: 'center', padding: 28, backgroundColor: '#08101e', borderRadius: 10 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#4ade80' }}>Debt Free</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#2a4a3a', marginTop: 4 }}>No outstanding loans</Text>
                                </View>
                            ) : (
                                <>
                                    <View style={{ backgroundColor: '#0a0c14', borderRadius: 10, padding: 14, marginBottom: 2 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 3, marginBottom: 4 }}>TOTAL DEBT</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 34, color: '#f87171', lineHeight: 36 }}>₹{totalLoanDebt.toLocaleString()}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>₹{totalEMI.toLocaleString()}/mo EMI · {loans.length} loan{loans.length !== 1 ? 's' : ''}</Text>
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
                                            <View key={loan.id} style={{ borderRadius: 10, overflow: 'hidden', backgroundColor: '#08101e', marginBottom: 8 }}>
                                                <TouchableOpacity onPress={() => setSelectedLoanId(isExpanded ? null : loan.id)} style={{ padding: 14 }} activeOpacity={0.8}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                                        <View style={{ width: 32, height: 32, backgroundColor: '#0a0c14', borderRadius: 8, alignItems: 'center', justifyContent: 'center'}}>
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
                                                    <View style={{ height: 5, backgroundColor: '#06080f', marginBottom: 5, borderRadius: 3 }}>
                                                        <View style={{ height: '100%', width: `${paidPct * 100}%`, backgroundColor: meta.color, borderRadius: 3 }} />
                                                    </View>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070' }}>EMI ₹{loan.emi.toLocaleString()}/mo · {monthsLeft}mo left</Text>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: meta.color }}>{Math.round(paidPct * 100)}% paid</Text>
                                                    </View>
                                                </TouchableOpacity>

                                                {isExpanded && (
                                                    <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 10 }}>
                                                        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 4 }}>
                                                            {[
                                                                { label: 'THIS MONTH', val: `₹${interestThisMonth.toLocaleString()}`, col: '#f87171' },
                                                                { label: 'INTEREST LEFT', val: `₹${Math.round(totalInterestLeft).toLocaleString()}`, col: '#fb923c' },
                                                                { label: 'BORROWED', val: `₹${originalPrincipal.toLocaleString()}`, col: '#445070' },
                                                            ].map((s, i) => (
                                                                <View key={i}>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 1 }}>{s.label}</Text>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: s.col }}>{s.val}</Text>
                                                                </View>
                                                            ))}
                                                        </View>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 2 }}>MAKE A PAYMENT</Text>
                                                        <View style={{ flexDirection: 'row', gap: 6 }}>
                                                            {[loan.emi, Math.round(loan.emi * 3), Math.round(loan.remainingPrincipal)].map((amt, idx) => (
                                                                <TouchableOpacity key={idx} onPress={() => setPrepayInput(String(amt))} style={{ flex: 1, backgroundColor: '#0a0c14', borderRadius: 6, padding: 8, alignItems: 'center' }}>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070' }}>{idx === 0 ? '1 EMI' : idx === 1 ? '3 EMIs' : 'FULL'}</Text>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#c8d4f0' }}>₹{amt.toLocaleString()}</Text>
                                                                </TouchableOpacity>
                                                            ))}
                                                        </View>
                                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                                            <View style={{ flex: 1, backgroundColor: '#0a0c14', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 }}>
                                                                <TextInput value={prepayInput} onChangeText={setPrepayInput} keyboardType="numeric" placeholder="Custom amount" placeholderTextColor="#2a3560" style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#c8d4f0' }} />
                                                            </View>
                                                            <TouchableOpacity
                                                                onPress={() => {
                                                                    const amt = parseInt(prepayInput) || 0;
                                                                    if (amt < loan.emi) { onShowDialog('Too Low', `Min ₹${loan.emi.toLocaleString()} (1 EMI).`, 'error'); return; }
                                                                    if (amt > loan.remainingPrincipal) { onShowDialog('Too High', `Max ₹${loan.remainingPrincipal.toLocaleString()} (outstanding balance).`, 'error'); return; }
                                                                    const res = prepayLoan ? prepayLoan(loan.id, amt) : { success: false, msg: 'Not available' };
                                                                    if (res.success) { setPrepayInput(''); if (amt >= loan.remainingPrincipal) setSelectedLoanId(null); }
                                                                    onShowDialog(res.success ? 'Payment Made' : 'Failed', res.msg, res.success ? 'success' : 'error');
                                                                }}
                                                                style={{ backgroundColor: '#0f2214', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' }}
                                                            >
                                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#4ade80' }}>PAY</Text>
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
                        ); // end card landing
                    } // end !applyingLoanId

                    // ── Loan application detail view ──
                    const lt = LOAN_TYPES.find(l => l.id === applyingLoanId);
                    if (!lt) return null;
                    const meta = LOAN_TYPE_META[lt.id] || { name: lt.name, color: '#f87171', img: null };
                    const issues = getEligibility(lt);
                    const eligible = issues.length === 0;
                    const adjRate = getAdjustedRate(lt.base_interest, creditScore);
                    const tenures = tenureOptions(lt);
                    const selTenure = tenures[Math.min(loanTenureIdx, tenures.length - 1)];
                    const amt = parseInt(loanAmount) || 0;
                    const previewEMI = amt > 0 && selTenure ? calculateEMI(amt, adjRate, selTenure) : 0;
                    const totalPay = previewEMI * selTenure;
                    const totalInterest = totalPay - amt;

                    return (
                        <View style={{ gap: 10 }}>
                            {/* Back to loans */}
                            <TouchableOpacity onPress={() => setApplyingLoanId(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }} activeOpacity={0.7}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070' }}>‹</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', letterSpacing: 2 }}>ALL LOANS</Text>
                            </TouchableOpacity>

                            {/* Hero card */}
                            <View style={{ height: 120, position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
                                {meta.img && <Image source={meta.img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />}
                                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.6)' }} />
                                <View style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: meta.color, letterSpacing: 4 }}>{adjRate.toFixed(1)}% P.A. · UP TO {lt.max_tenure >= 12 ? `${lt.max_tenure / 12}yr` : `${lt.max_tenure}mo`}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', lineHeight: 28 }}>{meta.name}</Text>
                                </View>
                            </View>

                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070', lineHeight: 18 }}>{lt.description}</Text>

                            {!eligible ? (
                                <View style={{ backgroundColor: '#1a0808', borderRadius: 10, padding: 14 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#f87171', marginBottom: 8 }}>You don't qualify yet:</Text>
                                    {issues.map((iss, i) => (
                                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
                                            <Image source={require('../../assets/ui_comp/lock.png')} style={{ width: 18, height: 18, tintColor: '#f87171' }} resizeMode="contain" />
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#f8717190', flex: 1 }}>{iss}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <>
                                    {/* Amount */}
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 2 }}>LOAN AMOUNT</Text>
                                    <View style={{ flexDirection: 'row', gap: 6 }}>
                                        <View style={{ flex: 1, borderRadius: 8, backgroundColor: '#0d1020', paddingHorizontal: 12, paddingVertical: 10 }}>
                                            <TextInput value={loanAmount} onChangeText={setLoanAmount} keyboardType="numeric"
                                                placeholder={`Max ₹${lt.max_amount ? (lt.max_amount / 100000).toFixed(0) + 'L' : 'varies'}`}
                                                placeholderTextColor="#2a3560" style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#c8d4f0' }} />
                                        </View>
                                        {lt.max_amount && [0.25, 0.5, 1].map(frac => {
                                            const a = Math.round(lt.max_amount * frac);
                                            return (
                                                <TouchableOpacity key={frac} onPress={() => setLoanAmount(String(a))} style={{ borderRadius: 8, backgroundColor: '#0d1020', paddingHorizontal: 10, justifyContent: 'center' }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>₹{(a / 100000).toFixed(0)}L</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>

                                    {/* Tenure */}
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 2 }}>TENURE</Text>
                                    <View style={{ flexDirection: 'row', gap: 6 }}>
                                        {tenures.map((t, i) => (
                                            <TouchableOpacity key={t} onPress={() => setLoanTenureIdx(i)}
                                                style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: loanTenureIdx === i ? meta.color + '22' : '#0d1020' }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: loanTenureIdx === i ? meta.color : '#445070' }}>
                                                    {t >= 12 ? `${t / 12}yr` : `${t}mo`}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* EMI preview */}
                                    {previewEMI > 0 && (
                                        <View style={{ borderRadius: 10, backgroundColor: '#0a0d1a', padding: 14 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 1 }}>MONTHLY EMI</Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: meta.color }}>₹{previewEMI.toLocaleString()}/mo</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070' }}>Total interest</Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#f87171' }}>₹{totalInterest.toLocaleString()}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070' }}>Total repayment</Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070' }}>₹{totalPay.toLocaleString()}</Text>
                                            </View>
                                            {salary > 0 && (
                                                <>
                                                    <View style={{ height: 4, backgroundColor: '#06080f', marginBottom: 4 }}>
                                                        <View style={{ height: '100%', width: `${Math.min((previewEMI / salary) * 100, 100)}%`, backgroundColor: previewEMI > salary * 0.4 ? '#f87171' : '#4ade80' }} />
                                                    </View>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: previewEMI > salary * 0.4 ? '#f87171' : '#445070' }}>
                                                        EMI = {((previewEMI / salary) * 100).toFixed(0)}% of salary {previewEMI > salary * 0.4 ? '— high debt burden' : '— manageable'}
                                                    </Text>
                                                </>
                                            )}
                                        </View>
                                    )}

                                    {lt.id === 'education_loan' && (
                                        <View style={{ backgroundColor: '#818cf810', borderRadius: 8, padding: 12 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#818cf8' }}>Interest deductible under Sec 80E for up to 8 years</Text>
                                        </View>
                                    )}
                                    {lt.id === 'home_loan' && (
                                        <View style={{ backgroundColor: '#4ade8010', borderRadius: 8, padding: 12 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#4ade80' }}>Interest up to ₹2L/yr deductible (Sec 24b). Principal under 80C.</Text>
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        onPress={() => {
                                            if (!amt || amt < 10000) { onShowDialog('Invalid Amount', 'Minimum loan amount is ₹10,000.', 'error'); return; }
                                            const res = takeLoan(lt.id, amt, selTenure);
                                            onShowDialog(res.success ? 'Loan Approved!' : 'Application Rejected', res.msg, res.success ? 'success' : 'error');
                                            if (res.success) { setApplyingLoanId(null); setLoanAmount(''); }
                                        }}
                                        style={{ paddingVertical: 16, borderRadius: 10, backgroundColor: meta.color + '22', alignItems: 'center' }}
                                    >
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: meta.color, letterSpacing: 1 }}>
                                            {previewEMI > 0 ? `APPLY — ₹${previewEMI.toLocaleString()}/mo` : 'APPLY FOR LOAN'}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    );
                })()}

                {/* ── TAX & COMPLIANCE ── */}
                {tab === 'ca' && (() => {
                    const currentMonth = turn?.month || 1;
                    const currentYear = turn?.year || 2024;
                    const monthsToITR = currentMonth <= 7 ? 7 - currentMonth : (12 - currentMonth) + 7;
                    const itrThisYear = itrFiled?.[currentYear];
                    const monthsSubscribed = caSubscribed && caSubscribedMonth != null ? totalMonthsPlayed - caSubscribedMonth : 0;
                    const totalFeesPaid = monthsSubscribed * (CA_MONTHLY_FEE || 2000);
                    const inFilingWindow = currentMonth >= 4 && currentMonth <= 7;
                    const selfFilingInProgress = itrSelfFiling && itrSelfFiling.year === currentYear;
                    const itrColor = itrThisYear ? '#4ade80' : inFilingWindow ? '#fbbf24' : '#445070';

                    return (
                        <View style={{ gap: 14 }}>

                            {/* Hero — CA Office image, full focus */}
                            <View style={{ height: 200, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                                <Image source={require('../../assets/CA_Office.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,18,0.35)' }} />
                                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 14, paddingTop: 40, backgroundColor: 'rgba(4,6,18,0.72)' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: itrColor, letterSpacing: 3, marginBottom: 2 }}>
                                        ITR — FY {currentYear - 1}-{String(currentYear).slice(2)}
                                    </Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', lineHeight: 28 }}>
                                        {itrThisYear ? (itrThisYear === 'ca' ? 'Filed via CA' : itrThisYear === 'self' ? 'Self Filed' : 'Filed') :
                                         inFilingWindow ? `Due in ${monthsToITR} month${monthsToITR !== 1 ? 's' : ''}` :
                                         `${monthsToITR}mo until deadline`}
                                    </Text>
                                </View>
                            </View>

                            {/* Filing options label */}
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 3 }}>
                                {itrThisYear ? 'PLAN AHEAD FOR NEXT YEAR' : 'HOW DO YOU WANT TO FILE?'}
                            </Text>

                            {/* CA Option */}
                            <TouchableOpacity onPress={() => { const res = caSubscribed ? cancelCA() : subscribeCA(); onShowDialog(res.success ? (caSubscribed ? 'CA Cancelled' : 'CA Subscribed!') : 'Failed', res.msg, res.success ? (caSubscribed ? 'warning' : 'success') : 'error'); }}
                                style={{ backgroundColor: caSubscribed ? '#0e0a1e' : '#08101e', borderRadius: 10, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#a78bfa', letterSpacing: 3, marginBottom: 2 }}>CA RETAINER · ₹2,000/mo</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0', lineHeight: 24 }}>Hire a CA</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070', marginTop: 4 }}>Auto-files July · +₹25K deductions · notice cover</Text>
                                </View>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: caSubscribed ? '#f87171' : '#a78bfa', letterSpacing: 1, marginLeft: 12 }}>
                                    {caSubscribed ? 'CANCEL ›' : 'HIRE ›'}
                                </Text>
                            </TouchableOpacity>

                            {/* Self-file Option */}
                            <TouchableOpacity onPress={itrThisYear ? undefined : startSelfFiling} disabled={!!itrThisYear}
                                style={{ backgroundColor: '#08101e', borderRadius: 10, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: itrThisYear ? 0.4 : 1 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#60a5fa', letterSpacing: 3, marginBottom: 2 }}>DIY · FREE</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0', lineHeight: 24 }}>Self File</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070', marginTop: 4 }}>Step-by-step wizard · pick form & docs</Text>
                                </View>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#60a5fa', letterSpacing: 1, marginLeft: 12 }}>
                                    {itrThisYear ? 'FILED' : selfFilingInProgress ? 'RESUME ›' : 'START ›'}
                                </Text>
                            </TouchableOpacity>

                            {/* CA stats when subscribed */}
                            {caSubscribed && (
                                <View style={{ backgroundColor: '#08101e', borderRadius: 10, padding: 14, gap: 10 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 3 }}>CA SHARMA & ASSOCIATES</Text>
                                    <View style={{ flexDirection: 'row', gap: 20 }}>
                                        {[{ l: 'MONTHLY', v: '₹2,000', c: '#f87171' }, { l: 'SAVED', v: '~₹25K/yr', c: '#4ade80' }, { l: 'ITR', v: 'Auto July', c: '#a78bfa' }].map((s, i) => (
                                            <View key={i}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 1 }}>{s.l}</Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: s.c }}>{s.v}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    {['Auto-files ITR every July with optimised deductions', 'Finds ₹25,000+ extra deductions', 'Handles IT notices — you don\'t deal with the dept', 'Advises on 80C investments each April'].map((t, i) => (
                                        <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 6, borderTopWidth: i === 0 ? 0 : 1, borderColor: '#0f1525' }}>
                                            <Image source={require('../../assets/ui_comp/taxdept.png')} style={{ width: 22, height: 22 }} resizeMode="contain" />
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070', flex: 1 }}>{t}</Text>
                                        </View>
                                    ))}
                                    <TouchableOpacity onPress={() => { const res = cancelCA(); onShowDialog('CA Cancelled', res.msg, 'warning'); }}
                                        style={{ paddingVertical: 11, backgroundColor: '#2a0a0a', borderRadius: 8, alignItems: 'center', marginTop: 4 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#f87171', letterSpacing: 1 }}>CANCEL RETAINER</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Self-filing progress */}
                            {selfFilingInProgress && (
                                <View style={{ backgroundColor: '#08101e', borderRadius: 10, padding: 14 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 3, marginBottom: 10 }}>SELF-FILING IN PROGRESS</Text>
                                    {[['form_select', 'Pick ITR form'], ['gather_docs', 'Gather documents'], ['everify', 'Compute & e-verify']].map(([s, label], i) => {
                                        const stepIdx = ['form_select', 'gather_docs', 'everify'].indexOf(itrSelfFiling.step);
                                        const done = i < stepIdx;
                                        const active = i === stepIdx;
                                        return (
                                            <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                <Image source={done ? require('../../assets/ui_comp/nextbutton.png') : require('../../assets/ui_comp/lock.png')} style={{ width: 16, height: 16, opacity: active ? 1 : done ? 0.9 : 0.3 }} resizeMode="contain" />
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: done ? '#4ade80' : active ? '#c8d4f0' : '#2a3560' }}>{label}</Text>
                                            </View>
                                        );
                                    })}
                                    <TouchableOpacity onPress={startSelfFiling}
                                        style={{ paddingVertical: 11, backgroundColor: '#050f20', borderRadius: 8, alignItems: 'center', marginTop: 4 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#60a5fa', letterSpacing: 1 }}>OPEN WIZARD</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    );
                })()}

            </ScrollView>}

            {/* Self-Filing Wizard Overlay */}
            {itrSelfFiling && <ITRSelfFilingWizard
                filing={itrSelfFiling}
                getRequiredITRDocs={getRequiredITRDocs}
                getITRForms={getITRForms}
                selectITRForm={selectITRForm}
                collectITRDoc={collectITRDoc}
                computeITRTaxFull={computeITRTaxFull}
                submitITR={submitITR}
                onShowDialog={showDialog}
                onShowDialog={onShowDialog}
            />}

            {/* ── GOLD ── */}
            {tab === 'gold' && (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#fbbf24', letterSpacing: 3, marginBottom: 12 }}>SPOT PRICE: ₹{goldPrice?.toLocaleString()}/g (24k)</Text>
                    {/* Gold type selector */}
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                        {GOLD_ASSETS.map(a => (
                            <TouchableOpacity key={a.id} onPress={() => setSelectedGoldAsset(a)} activeOpacity={0.8}
                                style={{ flex: 1, borderRadius: 10, backgroundColor: selectedGoldAsset?.id === a.id ? '#fbbf2418' : '#08101e', padding: 12, alignItems: 'center' }}>
                                <Image source={require('../../assets/ui_comp/gold_vault.png')} style={{ width: 28, height: 28, marginBottom: 4 }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: selectedGoldAsset?.id === a.id ? '#fbbf24' : '#445070', textAlign: 'center' }}>{a.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {selectedGoldAsset && (
                        <View style={{ borderRadius: 10, backgroundColor: '#08101e', padding: 16, marginBottom: 16 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#fbbf24', marginBottom: 6 }}>{selectedGoldAsset.name}</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070', lineHeight: 20, marginBottom: 10 }}>{selectedGoldAsset.description}</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#818cf8' }}>Tax: {selectedGoldAsset.taxNote}</Text>
                            {selectedGoldAsset.makingCharges > 0 && (
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#f87171', marginTop: 4 }}>Making charges: {Math.round(selectedGoldAsset.makingCharges * 100)}%</Text>
                            )}
                            {selectedGoldAsset.type === 'bond' && (
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#4ade80', marginTop: 4 }}>+ 2.5% annual interest (paid every 6 months)</Text>
                            )}
                        </View>
                    )}

                    {/* Buy section */}
                    <View style={{ borderRadius: 10, backgroundColor: '#08101e', padding: 16, marginBottom: 16 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070', letterSpacing: 3, marginBottom: 12 }}>BUY GOLD</Text>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                            <View style={{ flex: 1, backgroundColor: '#0d1020', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 }}>
                                <TextInput value={goldGrams} onChangeText={setGoldGrams} keyboardType="decimal-pad"
                                    style={{ color: '#c8d4f0', fontFamily: 'VT323_400Regular', fontSize: 20 }}
                                    placeholder="grams" placeholderTextColor="#2a3560" />
                            </View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070' }}>g</Text>
                        </View>
                        {(() => {
                            const g = parseFloat(goldGrams) || 0;
                            const purity = selectedGoldAsset?.purity || 1;
                            const base = g * (goldPrice || 0) * purity;
                            const making = Math.round(base * (selectedGoldAsset?.makingCharges || 0));
                            const total = Math.round(base + making);
                            return g > 0 ? (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>{making > 0 ? `₹${Math.round(base).toLocaleString()} + ₹${making.toLocaleString()} making` : `₹${Math.round(base).toLocaleString()}`}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#fbbf24' }}>₹{total.toLocaleString()}</Text>
                                </View>
                            ) : null;
                        })()}
                        <TouchableOpacity onPress={() => {
                            const g = parseFloat(goldGrams);
                            if (!g || g <= 0) { onShowDialog('Invalid', 'Enter a valid gram amount.', 'error'); return; }
                            if (!selectedGoldAsset) { onShowDialog('Select Asset', 'Choose a gold type first.', 'error'); return; }
                            const r = buyGold(selectedGoldAsset.id, g);
                            onShowDialog(r.success ? 'Gold Purchased' : 'Failed', r.msg, r.success ? 'success' : 'error');
                        }} style={{ borderRadius: 10, backgroundColor: '#1a1400', paddingVertical: 14, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#fbbf24', letterSpacing: 2 }}>BUY {goldGrams || '0'}g ›</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Holdings */}
                    {Object.entries(goldHoldings || {}).filter(([, h]) => h?.grams > 0).map(([assetId, h]) => {
                        const asset = GOLD_ASSETS.find(a => a.id === assetId);
                        const purity = asset?.purity || 1;
                        const currentVal = Math.round(h.grams * (goldPrice || 0) * purity);
                        const costBasis = Math.round(h.grams * (h.avgBuyPrice || 0));
                        const gain = currentVal - costBasis;
                        return (
                            <View key={assetId} style={{ borderRadius: 10, backgroundColor: '#08101e', padding: 16, marginBottom: 10 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#fbbf24' }}>{asset?.name}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#fbbf24' }}>{h.grams.toFixed(2)}g</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#c8d4f0' }}>₹{currentVal.toLocaleString()}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: gain >= 0 ? '#4ade80' : '#f87171' }}>{gain >= 0 ? '+' : ''}₹{gain.toLocaleString()}</Text>
                                </View>
                                {asset?.type === 'bond' && h.interestAccrued > 0 && (
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#4ade80', marginBottom: 10 }}>Interest earned: ₹{h.interestAccrued.toLocaleString()}</Text>
                                )}
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 1, backgroundColor: '#0d1020', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
                                        <TextInput value={goldSellGrams} onChangeText={setGoldSellGrams} keyboardType="decimal-pad"
                                            style={{ color: '#c8d4f0', fontFamily: 'VT323_400Regular', fontSize: 16 }}
                                            placeholder={`max ${h.grams.toFixed(2)}g`} placeholderTextColor="#2a3560" />
                                    </View>
                                    <TouchableOpacity onPress={() => {
                                        const sg = parseFloat(goldSellGrams);
                                        if (!sg || sg <= 0) { onShowDialog('Invalid', 'Enter grams to sell.', 'error'); return; }
                                        const r = sellGold(assetId, sg);
                                        onShowDialog(r.success ? 'Sold' : 'Failed', r.msg, r.success ? 'success' : 'error');
                                        if (r.success) setGoldSellGrams('');
                                    }} style={{ borderRadius: 8, backgroundColor: '#1a0808', paddingHorizontal: 16, justifyContent: 'center' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#f87171' }}>SELL ›</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}

            {/* ── CREDIT CARD ── */}
            {tab === 'card' && (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 40, gap: 16 }}>
                    {/* Sticky Dashboard if they have any card */}
                    {activeCreditCards?.length > 0 && creditCard && (
                        <View style={{ borderRadius: 10, backgroundColor: '#08101e', padding: 16 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                <View>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070', letterSpacing: 2 }}>OUTSTANDING</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 32, color: creditCard.balance > 0 ? '#f87171' : '#4ade80', lineHeight: 34 }}>₹{creditCard.balance?.toLocaleString()}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070', letterSpacing: 2 }}>LIMIT</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#60a5fa' }}>₹{creditCard.limit?.toLocaleString()}</Text>
                                </View>
                            </View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070', marginBottom: creditCard.balance > 0 ? 14 : 0 }}>
                                {creditCard.balance > 0 ? 'Pay before next month to avoid 3%/mo interest' : 'No outstanding bill'}
                            </Text>
                            {creditCard.balance > 0 && (
                                <View style={{ gap: 10 }}>
                                    <View style={{ backgroundColor: '#0d1020', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 }}>
                                        <TextInput value={cardPayInput} onChangeText={setCardPayInput} keyboardType="number-pad"
                                            style={{ color: '#c8d4f0', fontFamily: 'VT323_400Regular', fontSize: 20 }}
                                            placeholder={`max ₹${creditCard.balance?.toLocaleString()}`} placeholderTextColor="#2a3560" />
                                    </View>
                                    <TouchableOpacity onPress={() => {
                                        const amt = parseInt(cardPayInput) || creditCard.balance;
                                        const r = payCreditCardBill(amt);
                                        onShowDialog(r.success ? 'Paid!' : 'Failed', r.msg, r.success ? 'success' : 'error');
                                        if (r.success) setCardPayInput('');
                                    }} style={{ borderRadius: 10, backgroundColor: '#0d1a2e', paddingVertical: 14, alignItems: 'center' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#60a5fa', letterSpacing: 2 }}>PAY ₹{creditCard.balance?.toLocaleString()} ›</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}

                    {CREDIT_CARDS_DATA.map(card => {
                        const isOwned = activeCreditCards?.includes(card.id) || (card.id === 'standard' && creditCard && !activeCreditCards?.length);
                        return (
                            <View key={card.id} style={{ borderRadius: 10, backgroundColor: '#08101e', overflow: 'hidden' }}>
                                <Image source={card.image} style={{ width: '100%', height: 180 }} resizeMode="contain" />
                                <View style={{ padding: 16 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: isOwned ? '#4ade80' : '#c8d4f0', marginBottom: 4 }}>{card.name}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#60a5fa', marginBottom: 8 }}>Perk: {card.perk}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070', lineHeight: 20, marginBottom: 16 }}>{card.desc}</Text>
                                    {isOwned ? (
                                        <View style={{ borderRadius: 10, backgroundColor: '#0d1e12', paddingVertical: 14, alignItems: 'center' }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#4ade80', letterSpacing: 2 }}>CARD ACTIVE ✓</Text>
                                        </View>
                                    ) : card.isEligible ? (
                                        <TouchableOpacity onPress={() => {
                                            const r = openCreditCard(card.id);
                                            onShowDialog(r.success ? 'Card Approved!' : 'Failed', r.msg, r.success ? 'success' : 'error');
                                        }} style={{ borderRadius: 10, backgroundColor: '#0d1a2e', paddingVertical: 14, alignItems: 'center' }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#60a5fa', letterSpacing: 2 }}>APPLY NOW ›</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={{ borderRadius: 10, backgroundColor: '#0d1020', paddingVertical: 14, alignItems: 'center', opacity: 0.5 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#f87171' }}>Not Eligible</Text>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', marginTop: 4 }}>{card.criteriaText}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}

            {/* ── RETIREMENT BUCKETS ── */}
            {tab === 'retire' && (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
                    {!retirementBuckets ? (
                        <View style={{ gap: 14 }}>
                            <View style={{ borderRadius: 10, backgroundColor: '#08101e', padding: 16 }}>
                                <Image source={require('../../assets/ui_comp/retirement_buckets.png')} style={{ width: 48, height: 48, marginBottom: 10 }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#818cf8', marginBottom: 6 }}>Bucket Strategy</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070', lineHeight: 20 }}>
                                    Divide your retirement corpus into 3 buckets based on when you need the money.
                                </Text>
                            </View>
                            {[
                                { key: 'b1', label: 'BUCKET 1 — NOW', color: '#4ade80', desc: '1–2 years of expenses in FDs/savings. Never touches the market.', val: b1Input, set: setB1Input },
                                { key: 'b2', label: 'BUCKET 2 — SOON', color: '#fbbf24', desc: '3–7 years of expenses in PPF/bonds/debt funds.', val: b2Input, set: setB2Input },
                                { key: 'b3', label: 'BUCKET 3 — LATER', color: '#818cf8', desc: 'Everything else in equity. 7+ year horizon.', val: b3Input, set: setB3Input },
                            ].map(b => (
                                <View key={b.key} style={{ borderRadius: 10, backgroundColor: '#08101e', padding: 16 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: b.color, letterSpacing: 2, marginBottom: 4 }}>{b.label}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070', lineHeight: 20, marginBottom: 12 }}>{b.desc}</Text>
                                    <View style={{ backgroundColor: '#0d1020', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 }}>
                                        <TextInput value={b.val} onChangeText={b.set} keyboardType="number-pad"
                                            style={{ color: '#c8d4f0', fontFamily: 'VT323_400Regular', fontSize: 20 }}
                                            placeholder="₹ amount" placeholderTextColor="#2a3560" />
                                    </View>
                                </View>
                            ))}
                            <TouchableOpacity onPress={() => {
                                const b1 = parseInt(b1Input) || 0, b2 = parseInt(b2Input) || 0, b3 = parseInt(b3Input) || 0;
                                const r = setupRetirementBuckets(b1, b2, b3);
                                onShowDialog(r.success ? 'Buckets Configured!' : 'Failed', r.msg, r.success ? 'success' : 'error');
                            }} style={{ borderRadius: 10, backgroundColor: '#818cf820', paddingVertical: 16, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#818cf8', letterSpacing: 2 }}>SET UP BUCKETS ›</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={{ gap: 10 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#4ade80', letterSpacing: 3, marginBottom: 4 }}>BUCKETS ACTIVE ✓</Text>
                            {[
                                { label: 'Bucket 1 — Now', val: retirementBuckets.bucket1, color: '#4ade80', sub: 'FDs & savings · short term' },
                                { label: 'Bucket 2 — Soon', val: retirementBuckets.bucket2, color: '#fbbf24', sub: 'PPF · bonds · 3–7 years' },
                                { label: 'Bucket 3 — Later', val: retirementBuckets.bucket3, color: '#818cf8', sub: 'Equity · 7+ year horizon' },
                            ].map((b, i) => (
                                <View key={i} style={{ borderRadius: 10, backgroundColor: '#08101e', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: b.color }}>{b.label}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070' }}>{b.sub}</Text>
                                    </View>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: b.color }}>₹{b.val?.toLocaleString()}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}

            {/* ── CHILD SAVINGS ── */}
            {tab === 'childSavings' && (() => {
                const children = dependents.filter(d => d.type === 'child');
                
                if (children.length === 0) return null;
                if (!selectedChild && children.length > 0) {
                    // Normally shouldn't update state during render, but this is a fallback.
                    // Ideally handled in the onPress when opening the tab, but it's safe here.
                }

                const activeChildId = selectedChild || children[0].id;

                return (
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
                        <View style={{ gap: 14 }}>
                            <View style={{ borderRadius: 10, backgroundColor: '#08101e', padding: 16, alignItems: 'center' }}>
                                <Image source={require('../../assets/ui_comp/saving_for_child.png')} style={{ width: 64, height: 64, marginBottom: 10 }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#ec4899', lineHeight: 30 }}>Child Savings</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070', textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
                                    Build wealth for your children. They start their life with this when they take over your legacy.
                                </Text>
                            </View>

                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070', letterSpacing: 3, marginTop: 8 }}>SELECT CHILD</Text>
                            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                                {children.map(child => (
                                    <TouchableOpacity key={child.id} onPress={() => setSelectedChild(child.id)}
                                        style={{ borderRadius: 10, backgroundColor: selectedChild === child.id ? '#ec489920' : '#08101e', padding: 14, flex: 1, minWidth: '30%', alignItems: 'center' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: selectedChild === child.id ? '#ec4899' : '#c8d4f0' }}>{child.name}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070', marginTop: 2 }}>{Math.floor(child.childAgeMonths / 12)}yr</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {activeChildId && (() => {
                                const activeChild = children.find(c => c.id === activeChildId);
                                const balance = childSavings?.[activeChildId] || 0;
                                return (
                                    <View style={{ borderRadius: 10, backgroundColor: '#08101e', padding: 16, marginTop: 4 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070', letterSpacing: 2 }}>{activeChild?.name?.toUpperCase() || 'CHILD'}'S BALANCE</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 40, color: '#fbbf24', lineHeight: 42, marginBottom: 18 }}>₹{balance.toLocaleString()}</Text>

                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070', letterSpacing: 2, marginBottom: 10 }}>DEPOSIT</Text>
                                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                                            <View style={{ flex: 1, backgroundColor: '#0d1020', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 }}>
                                                <TextInput value={childSaveAmount} onChangeText={setChildSaveAmount} keyboardType="number-pad"
                                                    style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#fff' }}
                                                    placeholderTextColor="#445070" placeholder="₹ amount" />
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                                            {[5000, 10000, 50000].map(amt => (
                                                <TouchableOpacity key={amt} onPress={() => setChildSaveAmount(amt.toString())}
                                                    style={{ flex: 1, borderRadius: 8, backgroundColor: '#0d1020', paddingVertical: 10, alignItems: 'center' }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070' }}>+{amt/1000}k</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        <TouchableOpacity 
                                            onPress={() => {
                                                const amt = parseInt(childSaveAmount, 10);
                                                if (isNaN(amt) || amt <= 0) {
                                                    onShowDialog('Invalid', 'Enter a valid amount', 'error');
                                                    return;
                                                }
                                                const res = transferToChildSavings(activeChildId, amt);
                                                onShowDialog(res.success ? 'Transferred' : 'Failed', res.msg, res.success ? 'success' : 'error');
                                                if (res.success) setChildSaveAmount('');
                                            }}
                                            style={{ backgroundColor: '#ec489922', borderRadius: 10, paddingVertical: 16, alignItems: 'center' }}
                                        >
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#ec4899', letterSpacing: 2 }}>TRANSFER ›</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })()}
                        </View>
                    </ScrollView>
                );
            })()}
        </View>
    );
}

// ── ITR Self-Filing Wizard ────────────────────────────────────────────────────
function ITRSelfFilingWizard({ filing, getRequiredITRDocs, getITRForms, selectITRForm, collectITRDoc, computeITRTaxFull, submitITR, onShowDialog }) {
    const { step, formSelected, docsCollected, computation, wrongForm, year } = filing;
    const [toast, setToast] = useState(null);
    const showToast = (msg, ok) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2800); };

    const C = {
        bg: '#06080f', panel: '#0d1020', card: '#070a16', border: '#1a2040',
        blue: '#60a5fa', gold: '#fbbf24', sage: '#4ade80', red: '#f87171',
        purple: '#a78bfa', cream: '#c8d4f0', dim: '#445070', dark: '#2a3560',
    };

    const STEPS = [
        { key: 'form_select', label: 'PICK FORM' },
        { key: 'gather_docs', label: 'GET DOCS' },
        { key: 'everify',     label: 'REVIEW & FILE' },
    ];
    const currentStepIdx = STEPS.findIndex(s => s.key === step);

    const rup = (n) => `₹${Math.abs(Math.round(n)).toLocaleString()}`;
    const row = (label, value, color = C.cream, indent = false) => (
        <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingLeft: indent ? 16 : 0, borderBottomWidth: 0.5, borderColor: C.border + '60' }}>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: indent ? C.dim : C.cream, flex: 1 }}>{label}</Text>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color }}>{value}</Text>
        </View>
    );

    return (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: C.bg, zIndex: 100 }}>
            {/* Header */}
            <View style={{ backgroundColor: C.panel, paddingTop: 14, paddingBottom: 10, paddingHorizontal: 14 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 4 }}>INCOME TAX RETURN — FY {year - 1}-{String(year).slice(2)}</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: C.cream, lineHeight: 28 }}>Self-Filing Wizard</Text>
                {/* Step progress */}
                <View style={{ flexDirection: 'row', marginTop: 10, gap: 4 }}>
                    {STEPS.map((s, i) => (
                        <View key={s.key} style={{ flex: 1 }}>
                            <View style={{ height: 3, backgroundColor: i <= currentStepIdx ? C.blue : C.border, marginBottom: 3 }} />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 9, color: i === currentStepIdx ? C.blue : i < currentStepIdx ? C.sage : C.dark, letterSpacing: 1 }}>{s.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 60 }}>

                {/* ── STEP 1: Form Selection ── */}
                {step === 'form_select' && (() => {
                    const forms = getITRForms();
                    return (
                        <View style={{ gap: 10 }}>
                            <View style={{ backgroundColor: '#08101e', borderRadius: 10, padding: 14, marginBottom: 4 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3, marginBottom: 4 }}>STEP 1 OF 3</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.cream }}>Which ITR form applies to you?</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim, marginTop: 6 }}>Filing with the wrong form can trigger an IT notice. Read carefully.</Text>
                            </View>
                            {forms.map(form => (
                                <TouchableOpacity key={form.id} onPress={() => selectITRForm(form.id)} activeOpacity={0.85}
                                    style={{ borderRadius: 10, backgroundColor: form.correct ? form.color + '12' : '#08101e', padding: 16 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: form.correct ? form.color : C.cream }}>{form.name}</Text>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: form.correct ? form.color : C.dark, letterSpacing: 2 }}>{form.tag}</Text>
                                        </View>
                                        {form.correct && (
                                            <View style={{ backgroundColor: form.color + '20', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: form.color, letterSpacing: 1 }}>✓ APPLICABLE</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, marginBottom: 6 }}>{form.forWhom}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dark, lineHeight: 18 }}>{form.why}</Text>
                                    <View style={{ marginTop: 12, borderRadius: 8, backgroundColor: form.correct ? form.color + '18' : '#0d1020', paddingVertical: 10, alignItems: 'center' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: form.correct ? form.color : C.dim, letterSpacing: 1 }}>SELECT {form.id} ›</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    );
                })()}

                {/* ── STEP 2: Gather Documents ── */}
                {step === 'gather_docs' && (() => {
                    const docs = getRequiredITRDocs();
                    const allCollected = docs.every(d => docsCollected.includes(d.id));
                    const turns = turnsLeftToday();
                    return (
                        <View style={{ gap: 10 }}>
                            <View style={{ backgroundColor: '#08101e', borderRadius: 10, padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3, marginBottom: 4 }}>STEP 2 OF 3 — FILING AS {formSelected?.id}</Text>
                                {wrongForm && (
                                    <View style={{ backgroundColor: '#1a0808', borderRadius: 8, padding: 10, marginBottom: 10 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#f87171' }}>This form may not be correct. Filing wrong risks an IT notice.</Text>
                                    </View>
                                )}
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.cream }}>Collect your documents</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim, marginTop: 6 }}>Each document costs 1 daily action. {turns} action{turns !== 1 ? 's' : ''} remaining today.</Text>
                            </View>

                            {docs.map(doc => {
                                const collected = docsCollected.includes(doc.id);
                                return (
                                    <View key={doc.id} style={{ borderRadius: 10, backgroundColor: collected ? '#0a1a10' : '#08101e', padding: 16 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: collected ? C.sage : C.cream }}>{doc.name}</Text>
                                            {collected && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.sage }}>✓</Text>}
                                        </View>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.purple, letterSpacing: 2, marginBottom: 4 }}>{doc.section}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim, lineHeight: 18, marginBottom: 6 }}>{doc.desc}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, marginBottom: collected ? 0 : 12 }}>{doc.source}</Text>
                                        {!collected && (
                                            <TouchableOpacity
                                                onPress={async () => {
                                                    const r = await collectITRDoc(doc.id);
                                                    if (!r.success) showToast(r.msg, false);
                                                }}
                                                disabled={turns <= 0}
                                                style={{ borderRadius: 8, backgroundColor: turns > 0 ? C.blue + '18' : '#0d1020', paddingVertical: 10, alignItems: 'center', opacity: turns > 0 ? 1 : 0.5 }}
                                            >
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: turns > 0 ? C.blue : C.dark, letterSpacing: 1 }}>
                                                    {turns > 0 ? 'COLLECT — 1 ACTION ›' : 'NO ACTIONS LEFT TODAY'}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })}

                            {allCollected && (
                                <TouchableOpacity onPress={() => computeITRTaxFull()}
                                    style={{ borderRadius: 10, backgroundColor: C.gold + '18', paddingVertical: 16, alignItems: 'center', marginTop: 4 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.gold, letterSpacing: 2 }}>COMPUTE TAX ›</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })()}

                {/* ── STEP 3: Tax Computation ── */}
                {step === 'everify' && computation && (() => {
                    const c = computation;
                    const isRefund = c.netPayable < 0;
                    return (
                        <View style={{ gap: 10 }}>
                            <View style={{ backgroundColor: '#08101e', borderRadius: 10, padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3, marginBottom: 4 }}>STEP 3 OF 3 — TAX COMPUTATION</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.cream }}>Your Tax Summary — FY {year - 1}-{String(year).slice(2)}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim, marginTop: 6 }}>Review every line before you file.</Text>
                            </View>

                            {/* Income breakdown */}
                            <View style={{ borderRadius: 10, backgroundColor: '#08101e', padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3, marginBottom: 8 }}>INCOME HEADS</Text>
                                {c.annualSalary > 0 && row('Gross Salary (annual)', rup(c.annualSalary), C.cream)}
                                {c.annualSalary > 0 && row('Less: Standard Deduction [Sec 16(ia)]', `−${rup(c.standardDeduction)}`, C.sage, true)}
                                {c.annualSalary > 0 && row('Income from Salary', rup(c.netSalary), C.cream)}
                                {c.fdInterestTotal > 0 && row('FD Interest Income [Sec 56(2)(id)]', `+${rup(c.fdInterestTotal)}`, C.gold)}
                                {c.savingsInterest > 0 && row('Savings Interest (gross)', rup(c.savingsInterest), C.cream)}
                                {c.savingsInterest > 0 && row('Less: 80TTA exemption (up to ₹10,000)', `−${rup(Math.min(c.savingsInterest, 10000))}`, C.sage, true)}
                                {c.savingsInterestTaxable > 0 && row('Taxable savings interest', rup(c.savingsInterestTaxable), C.gold)}
                                {c.rentalIncomeGross > 0 && row('Rental Income (gross)', rup(c.rentalIncomeGross), C.cream)}
                                {c.rentalIncomeGross > 0 && row('Less: 30% standard deduction [Sec 24(a)]', `−${rup(c.rentalMunicipalDeduction)}`, C.sage, true)}
                                {c.netRentalIncome > 0 && row('Net Rental Income', rup(c.netRentalIncome), C.gold)}
                                <View style={{ height: 1, backgroundColor: C.border, marginVertical: 6 }} />
                                {row('GROSS TOTAL INCOME', rup(c.grossTotalIncome), C.cream)}
                            </View>

                            {/* Deductions */}
                            <View style={{ borderRadius: 10, backgroundColor: '#08101e', padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3, marginBottom: 8 }}>DEDUCTIONS</Text>
                                {c.sec80C > 0 && (
                                    <>
                                        {row('Section 80C (max ₹1,50,000)', '', C.sage)}
                                        {c.ppf80C > 0 && row('  PPF contributions', rup(c.ppf80C), C.dim, true)}
                                        {c.lifeInsPremAnnual > 0 && row('  Life insurance premium', rup(c.lifeInsPremAnnual), C.dim, true)}
                                        {c.homeLoanPrincipalAnnual > 0 && row('  Home loan principal repaid', rup(c.homeLoanPrincipalAnnual), C.dim, true)}
                                        {row('  80C Total (capped at ₹1.5L)', `−${rup(c.sec80C)}`, C.sage, true)}
                                    </>
                                )}
                                {c.sec80CCD > 0 && row('Section 80CCD(1B) — NPS (extra ₹50K)', `−${rup(c.sec80CCD)}`, C.sage)}
                                {c.sec80D > 0 && (
                                    <>
                                        {row('Section 80D — Health Insurance (max ₹25K)', '', C.sage)}
                                        {row('  Premium paid', rup(c.healthInsPremAnnual), C.dim, true)}
                                        {row('  80D deduction (capped)', `−${rup(c.sec80D)}`, C.sage, true)}
                                    </>
                                )}
                                {c.sec24b > 0 && (
                                    <>
                                        {row('Section 24(b) — Home Loan Interest (max ₹2L)', '', C.sage)}
                                        {row('  Interest paid', rup(c.homeLoanInterestAnnual), C.dim, true)}
                                        {row('  24(b) deduction (capped)', `−${rup(c.sec24b)}`, C.sage, true)}
                                    </>
                                )}
                                <View style={{ height: 1, backgroundColor: C.border, marginVertical: 6 }} />
                                {row('Total Deductions', `−${rup(c.totalDeductions)}`, C.sage)}
                                {row('NET TAXABLE INCOME', rup(c.taxableIncome), C.cream)}
                            </View>

                            {/* Tax slabs */}
                            <View style={{ borderRadius: 10, backgroundColor: '#08101e', padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3, marginBottom: 8 }}>TAX COMPUTATION (NEW REGIME)</Text>
                                {[
                                    { range: '₹0 – ₹3,00,000', rate: '0%' },
                                    { range: '₹3,00,001 – ₹7,00,000', rate: '5%' },
                                    { range: '₹7,00,001 – ₹10,00,000', rate: '10%' },
                                    { range: '₹10,00,001 – ₹12,00,000', rate: '15%' },
                                    { range: '₹12,00,001 – ₹15,00,000', rate: '20%' },
                                    { range: 'Above ₹15,00,000', rate: '30%' },
                                ].map((slab, i) => (
                                    <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>{slab.range}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>{slab.rate}</Text>
                                    </View>
                                ))}
                                <View style={{ height: 1, backgroundColor: C.border, marginVertical: 6 }} />
                                {row('Income Tax on Normal Income', rup(c.incomeTax), C.red)}
                                {row('4% Health & Education Cess [Sec 2(14C)]', rup(c.cess), C.red)}
                                {row('TOTAL TAX LIABILITY', rup(c.totalTaxLiability), C.red)}
                            </View>

                            {/* TDS credits */}
                            <View style={{ borderRadius: 10, backgroundColor: '#08101e', padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3, marginBottom: 8 }}>TDS ALREADY DEDUCTED (TAX CREDIT)</Text>
                                {row('TDS on Salary — by employer [Form 16]', `−${rup(c.estimatedSalaryTDS)}`, C.sage)}
                                {c.bankTDS > 0 && row('TDS on FD Interest — by bank [Form 16A]', `−${rup(c.bankTDS)}`, C.sage)}
                                {row('Total TDS Credit', `−${rup(c.totalTDS)}`, C.sage)}
                                <View style={{ height: 2, backgroundColor: C.border, marginVertical: 8 }} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: isRefund ? '#0d1e12' : '#1a0808', borderRadius: 8, padding: 12 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: isRefund ? C.sage : C.red }}>
                                        {isRefund ? '✓ REFUND DUE' : 'TAX PAYABLE'}
                                    </Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: isRefund ? C.sage : C.red }}>
                                        {rup(c.netPayable)}
                                    </Text>
                                </View>
                                {isRefund && (
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, marginTop: 6 }}>
                                        Refund will be credited to your bank account within 30 days of filing and e-verification.
                                    </Text>
                                )}
                                {!isRefund && c.netPayable > 0 && (
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, marginTop: 6 }}>
                                        Pay via Challan 280 on incometax.gov.in before submitting ITR. Unpaid tax attracts 1% interest per month under Sec 234B.
                                    </Text>
                                )}
                            </View>

                            {/* E-Verify */}
                            <View style={{ borderRadius: 10, backgroundColor: '#08101e', padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3, marginBottom: 6 }}>STEP 4 — E-VERIFY & SUBMIT</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.cream, marginBottom: 12 }}>Filing is not complete until you e-verify.</Text>
                                {[
                                    { method: 'Aadhaar OTP', desc: 'OTP sent to Aadhaar-linked mobile. Fastest and most common.', recommended: true },
                                    { method: 'Net Banking', desc: 'Login to your bank and verify via ITR e-verify option.' },
                                    { method: 'Demat Account', desc: 'Via CDSL/NSDL. Requires active demat linked to PAN.' },
                                ].map((m, i) => (
                                    <View key={i} style={{ flexDirection: 'row', gap: 10, paddingVertical: 8, borderTopWidth: i === 0 ? 0 : 1, borderColor: '#0f1525' }}>
                                        <Image source={require('../../assets/ui_comp/taxdept.png')} style={{ width: 20, height: 20, opacity: m.recommended ? 1 : 0.4 }} resizeMode="contain" />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: m.recommended ? C.blue : C.dim }}>{m.method}{m.recommended ? ' (recommended)' : ''}</Text>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dark }}>{m.desc}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {wrongForm && (
                                <View style={{ borderRadius: 10, backgroundColor: '#1a0808', padding: 14 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.red }}>Wrong ITR form selected — filing will trigger an IT notice (Sec 139(9)). ₹5,000 penalty will be deducted.</Text>
                                </View>
                            )}
                            <View style={{ borderRadius: 10, backgroundColor: '#08101e', padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3, marginBottom: 6 }}>FILING COSTS</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim }}>Portal convenience fee</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.red }}>₹499</Text>
                                </View>
                                {(computation?.netPayable || 0) > 0 && (
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim }}>Self-assessment tax (Challan 280)</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.red }}>₹{Math.round(computation.netPayable).toLocaleString()}</Text>
                                    </View>
                                )}
                                {wrongForm && (
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.red }}>IT notice penalty (wrong form)</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.red }}>₹5,000</Text>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    const r = submitITR();
                                    if (!r) return;
                                    if (!r.success) { showToast(r.msg, false); return; }
                                    if (r.wrongForm) {
                                        onShowDialog('Filed with Notice Risk', `ITR submitted but the IT department flagged it as a defective return (Sec 139(9)). ₹5,000 penalty deducted.\n\nAlways double-check your ITR form before filing.`, 'warning');
                                    } else if (r.refund > 0) {
                                        onShowDialog('ITR Filed! Refund Due', `E-verified via Aadhaar OTP. ITR-${formSelected?.id} submitted for FY ${year - 1}-${String(year).slice(2)}.\n\n₹${r.refund.toLocaleString()} refund will be credited within 30 days.`, 'success');
                                    } else {
                                        onShowDialog('ITR Filed!', `E-verified via Aadhaar OTP. ITR-${formSelected?.id} submitted for FY ${year - 1}-${String(year).slice(2)}. Acknowledgement number generated. Keep it for your records.`, 'success');
                                    }
                                }}
                                style={{ borderRadius: 10, backgroundColor: wrongForm ? '#1a0808' : '#0d1e12', paddingVertical: 16, alignItems: 'center', marginTop: 4 }}
                            >
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: wrongForm ? C.red : C.sage, letterSpacing: 2 }}>
                                    {wrongForm ? 'SUBMIT ANYWAY (RISKY) ›' : 'SEND AADHAAR OTP & SUBMIT ›'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })()}


            </ScrollView>

            {toast && (
                <View style={{ position: 'absolute', bottom: 16, left: 14, right: 14, backgroundColor: toast.ok ? '#166534' : '#7f1d1d', padding: 12, borderWidth: 1, borderColor: toast.ok ? '#4ade80' : '#f87171' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: toast.ok ? '#4ade80' : '#f87171', textAlign: 'center' }}>{toast.msg}</Text>
                </View>
            )}
        </View>
    );
}
