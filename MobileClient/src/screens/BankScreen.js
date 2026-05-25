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
        turn, totalMonthsPlayed, turnsLeftToday,
        itrSelfFiling, startSelfFiling, getRequiredITRDocs, getITRForms,
        selectITRForm, collectITRDoc, computeITRTaxFull, submitITR,
        goldHoldings, goldPrice, buyGold, sellGold, getGoldValue,
        creditCard, activeCreditCards, openCreditCard, payCreditCardBill, closeCreditCard,
        getFinancialTips,
        dependents,
        retirementBuckets, setupRetirementBuckets, isRetired,
        ppf, nps,
    } = useGame();

    const [tab, setTab] = useState(null); // null=landing | save | borrow | ca | gold | card | retire
    const [fdAmount, setFdAmount] = useState('50000');
    const [selectedFDOption, setSelectedFDOption] = useState(FD_OPTIONS[2]);
    const [selectedLoanId, setSelectedLoanId] = useState(null);
    const [prepayInput, setPrepayInput] = useState('');

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
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#c8d4f0', letterSpacing: 2 }}>
                        {tab === 'save' ? 'SAVE & EARN' : tab === 'ca' ? 'TAXES & ITR' : tab === 'gold' ? 'GOLD' : tab === 'card' ? 'CREDIT CARD' : tab === 'retire' ? 'RETIREMENT BUCKETS' : applyingLoanId ? (LOAN_TYPE_META[applyingLoanId]?.name || 'LOAN') : 'BORROW'}
                    </Text>
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
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', marginTop: 4 }}>Fixed Deposits</Text>
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
                    <TouchableOpacity onPress={() => {
                            if (totalMonthsPlayed < 3) {
                                onShowDialog('Locked', 'Borrowing unlocks in Month 3. Build some history first!', 'error');
                                return;
                            }
                            setTab('borrow');
                        }} activeOpacity={0.85}
                        style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#0a0d1a', overflow: 'hidden', opacity: totalMonthsPlayed < 3 ? 0.5 : 1 }}>
                        <View style={{ height: 150, backgroundColor: '#1a0d0d', flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={require('../../assets/ui_comp/borrow.png')} style={{ width: 130, height: 130 }} resizeMode="contain" />
                            <View style={{ flex: 1, padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#f87171', letterSpacing: 4, marginBottom: 2 }}>LOANS & CREDIT</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#ffffff', lineHeight: 30 }}>BORROW</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', marginTop: 4 }}>Personal · Home · Business</Text>
                                <View style={{ marginTop: 10, backgroundColor: '#06080f', borderWidth: 1, borderColor: '#1e2840', paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#f87171', letterSpacing: 2 }}>{totalMonthsPlayed < 3 ? 'LOCKED 🔒' : 'OPEN ▶'}</Text>
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
                    <TouchableOpacity onPress={() => {
                            if (totalMonthsPlayed < 10) {
                                onShowDialog('Locked', 'CA Services unlock in Month 10. Start managing your own taxes first.', 'error');
                                return;
                            }
                            setTab('ca');
                        }} activeOpacity={0.85}
                        style={{ borderWidth: 1, borderColor: '#a78bfa40', backgroundColor: '#0a0d1a', overflow: 'hidden', marginTop: 12, opacity: totalMonthsPlayed < 10 ? 0.5 : 1 }}>
                        <View style={{ height: 190, backgroundColor: '#0d0d1a', flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={require('../../assets/CA_Office.png')} style={{ width: 170, height: 170 }} resizeMode="contain" />
                            <View style={{ flex: 1, padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#a78bfa', letterSpacing: 4, marginBottom: 2 }}>TAX & COMPLIANCE</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#ffffff', lineHeight: 30 }}>TAXES & ITR</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', marginTop: 4 }}>Self-File · Hire CA · Deductions</Text>
                                <View style={{ marginTop: 10, backgroundColor: '#06080f', borderWidth: 1, borderColor: '#1e2840', paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#a78bfa', letterSpacing: 2 }}>{totalMonthsPlayed < 10 ? 'LOCKED 🔒' : 'OPEN ▶'}</Text>
                                </View>
                            </View>
                        </View>
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

                    {/* CREDIT CARD card */}
                    <TouchableOpacity onPress={() => setTab('card')} activeOpacity={0.85}
                        style={{ borderWidth: 1, borderColor: (activeCreditCards?.length > 0 || creditCard) ? '#60a5fa40' : '#1a2040', backgroundColor: '#0a0d1a', overflow: 'hidden', marginTop: 12 }}>
                        <View style={{ height: 150, backgroundColor: '#000d1a', flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 150, height: 150, alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={require('../../assets/ui_comp/cards landing page icon.png')} style={{ width: 130, height: 130 }} resizeMode="contain" />
                            </View>
                            <View style={{ flex: 1, padding: 14, paddingLeft: 0 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#60a5fa', letterSpacing: 4, marginBottom: 2 }}>BUY NOW, PAY LATER</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#ffffff', lineHeight: 30 }}>CREDIT CARD</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', marginTop: 2 }}>Build credit, get perks</Text>
                                <View style={{ marginTop: 8, backgroundColor: '#06080f', borderWidth: 1, borderColor: '#60a5fa40', paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#60a5fa', letterSpacing: 2 }}>OPEN ▶</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#60a5fa20' }}>
                            <View style={{ flex: 1, padding: 10, alignItems: 'center', borderRightWidth: 1, borderColor: '#60a5fa20' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 2 }}>CARDS HELD</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: (activeCreditCards?.length > 0 || creditCard) ? '#4ade80' : '#445070', lineHeight: 20, marginTop: 2 }}>{(activeCreditCards || (creditCard ? ['standard'] : [])).length}</Text>
                            </View>
                            <View style={{ flex: 1, padding: 10, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 2 }}>OUTSTANDING</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: (creditCard?.balance > 0) ? '#f87171' : '#4ade80', lineHeight: 20, marginTop: 2 }}>
                                    {creditCard?.balance ? `₹${creditCard.balance.toLocaleString()}` : '—'}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* RETIREMENT BUCKETS card */}
                    <TouchableOpacity onPress={() => {
                            if (!(isRetired || totalMonthsPlayed >= 6 || netWorth >= 50000)) {
                                onShowDialog('Locked', 'Retirement Planning unlocks at Month 6, or if you reach ₹50,000 net worth.', 'error');
                                return;
                            }
                            setTab('retire');
                        }} activeOpacity={0.85}
                        style={{ borderWidth: 1, borderColor: '#818cf840', backgroundColor: '#0a0d1a', overflow: 'hidden', marginTop: 12, opacity: !(isRetired || totalMonthsPlayed >= 6 || netWorth >= 50000) ? 0.5 : 1 }}>
                        <View style={{ height: 150, backgroundColor: '#0d0a1a', flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 150, height: 150, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', overflow: 'hidden' }}>
                                <Image source={require('../../assets/ui_comp/retirement_buckets.png')} style={{ width: 150, height: 150 }} resizeMode="contain" />
                            </View>
                            <View style={{ flex: 1, padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#818cf8', letterSpacing: 4, marginBottom: 2 }}>RETIREMENT PLANNING</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#ffffff', lineHeight: 26 }}>BUCKETS</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', marginTop: 2 }}>Now · Soon · Later</Text>
                                <View style={{ marginTop: 8, backgroundColor: '#06080f', borderWidth: 1, borderColor: '#818cf840', paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#818cf8', letterSpacing: 2 }}>
                                        {!(isRetired || totalMonthsPlayed >= 6 || netWorth >= 50000) ? 'LOCKED 🔒' : (retirementBuckets ? 'ACTIVE ✓' : 'SET UP ▶')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* GOLD card */}
                    <TouchableOpacity onPress={() => setTab('gold')} activeOpacity={0.85}
                        style={{ borderWidth: 1, borderColor: '#fbbf2440', backgroundColor: '#0a0d1a', overflow: 'hidden', marginTop: 12 }}>
                        <View style={{ height: 150, backgroundColor: '#150f00', flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 150, height: 150, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', overflow: 'hidden' }}>
                                <Image source={require('../../assets/ui_comp/gold_vault.png')} style={{ width: 150, height: 150 }} resizeMode="contain" />
                            </View>
                            <View style={{ flex: 1, padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#fbbf24', letterSpacing: 4, marginBottom: 2 }}>SAFE HAVEN ASSET</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#ffffff', lineHeight: 30 }}>GOLD</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', marginTop: 2 }}>Digital · SGB · Jewellery</Text>
                                <View style={{ marginTop: 8, backgroundColor: '#06080f', borderWidth: 1, borderColor: '#fbbf2440', paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#fbbf24', letterSpacing: 2 }}>OPEN ▶</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#fbbf2430' }}>
                            <View style={{ flex: 1, padding: 10, alignItems: 'center', borderRightWidth: 1, borderColor: '#fbbf2430' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 2 }}>SPOT PRICE</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#fbbf24', lineHeight: 22 }}>₹{goldPrice?.toLocaleString()}/g</Text>
                            </View>
                            <View style={{ flex: 1, padding: 10, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 2 }}>HOLDINGS</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: totalGoldValue > 0 ? '#fbbf24' : '#445070', lineHeight: 22 }}>
                                    {totalGoldValue > 0 ? `₹${(totalGoldValue / 1000).toFixed(0)}k` : 'NONE'}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Financial Tips */}
                    {tips.length > 0 && (
                        <View style={{ marginTop: 16, borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#070a16' }}>
                            <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#1a2040', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Image source={require('../../assets/ui_comp/bulb.png')} style={{ width: 18, height: 18 }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#fbbf24', letterSpacing: 3 }}>ADVISOR TIPS</Text>
                            </View>
                            {tips.map((tip, i) => (
                                <View key={i} style={{ padding: 12, borderTopWidth: i > 0 ? 1 : 0, borderColor: '#1a2040', flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: tip.color + '20', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                                        <FontAwesome5 name={tip.icon} size={14} color={tip.color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: tip.color, lineHeight: 17 }}>{tip.title}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', lineHeight: 15, marginTop: 3 }}>{tip.body}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}

            {tab && tab !== 'gold' && tab !== 'card' && tab !== 'retire' && <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>

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
                                <Image source={require('../../assets/ui_comp/lock.png')} style={{ width: 32, height: 32, tintColor: '#1a2040' }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#2a3560', marginTop: 12, textAlign: 'center' }}>No active FDs{'\n'}Lock in your savings above</Text>
                            </View>
                        )}
                        </View>{/* end FD card */}
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
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 3, marginBottom: 4 }}>
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
                                                            style={{ flex: 1, borderWidth: 1, borderColor: eligible ? meta.color + '50' : '#1a2040', overflow: 'hidden', backgroundColor: '#0a0d1a' }}
                                                        >
                                                            <View style={{ height: 2, backgroundColor: eligible ? meta.color : '#1e2840' }} />
                                                            <View style={{ height: CARD_H, position: 'relative' }}>
                                                                {meta.img && (
                                                                    <Image source={meta.img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                                                )}
                                                                <View style={{ position: 'absolute', inset: 0, backgroundColor: eligible ? 'rgba(4,6,14,0.48)' : 'rgba(4,6,14,0.72)' }} />
                                                                {eligible ? (
                                                                    <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: meta.color, paddingHorizontal: 6, paddingVertical: 2 }}>
                                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#000', letterSpacing: 1 }}>ELIGIBLE</Text>
                                                                    </View>
                                                                ) : (
                                                                    <View style={{ position: 'absolute', top: 8, right: 8 }}>
                                                                        <Image source={require('../../assets/ui_comp/lock.png')} style={{ width: 16, height: 16, opacity: 0.5 }} resizeMode="contain" />
                                                                    </View>
                                                                )}
                                                                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(4,6,14,0.82)', padding: 8 }}>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: eligible ? '#c8d4f0' : '#445070', lineHeight: 19 }} numberOfLines={1}>{meta.name}</Text>
                                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: eligible ? meta.color : '#2a3560', lineHeight: 15 }}>
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
                            <View style={{ height: 120, position: 'relative', borderWidth: 1, borderColor: meta.color + '50', overflow: 'hidden' }}>
                                <View style={{ height: 2, backgroundColor: meta.color }} />
                                {meta.img && <Image source={meta.img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />}
                                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.6)' }} />
                                <View style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: meta.color, letterSpacing: 4 }}>{adjRate.toFixed(1)}% P.A. · UP TO {lt.max_tenure >= 12 ? `${lt.max_tenure / 12}yr` : `${lt.max_tenure}mo`}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', lineHeight: 28 }}>{meta.name}</Text>
                                </View>
                            </View>

                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070', lineHeight: 18 }}>{lt.description}</Text>

                            {!eligible ? (
                                <View style={{ backgroundColor: '#1a0808', borderWidth: 1, borderColor: '#7f1d1d', padding: 14 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#f87171', marginBottom: 6 }}>You don't qualify yet:</Text>
                                    {issues.map((iss, i) => (
                                        <Text key={i} style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#f8717190', marginTop: 2 }}>• {iss}</Text>
                                    ))}
                                </View>
                            ) : (
                                <>
                                    {/* Amount */}
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 2 }}>LOAN AMOUNT</Text>
                                    <View style={{ flexDirection: 'row', gap: 6 }}>
                                        <View style={{ flex: 1, borderWidth: 1, borderColor: meta.color + '50', backgroundColor: '#0d1020', paddingHorizontal: 12, paddingVertical: 8 }}>
                                            <TextInput value={loanAmount} onChangeText={setLoanAmount} keyboardType="numeric"
                                                placeholder={`Max ₹${lt.max_amount ? (lt.max_amount / 100000).toFixed(0) + 'L' : 'varies'}`}
                                                placeholderTextColor="#2a3560" style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#c8d4f0' }} />
                                        </View>
                                        {lt.max_amount && [0.25, 0.5, 1].map(frac => {
                                            const a = Math.round(lt.max_amount * frac);
                                            return (
                                                <TouchableOpacity key={frac} onPress={() => setLoanAmount(String(a))} style={{ borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#070a16', paddingHorizontal: 8, justifyContent: 'center' }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070' }}>₹{(a / 100000).toFixed(0)}L</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>

                                    {/* Tenure */}
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 2 }}>TENURE</Text>
                                    <View style={{ flexDirection: 'row', gap: 6 }}>
                                        {tenures.map((t, i) => (
                                            <TouchableOpacity key={t} onPress={() => setLoanTenureIdx(i)}
                                                style={{ flex: 1, paddingVertical: 7, alignItems: 'center', borderWidth: 1, borderColor: loanTenureIdx === i ? meta.color : '#1a2040', backgroundColor: loanTenureIdx === i ? meta.color + '18' : '#070a16' }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: loanTenureIdx === i ? meta.color : '#445070' }}>
                                                    {t >= 12 ? `${t / 12}yr` : `${t}mo`}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* EMI preview */}
                                    {previewEMI > 0 && (
                                        <View style={{ borderWidth: 1, borderColor: meta.color + '30', backgroundColor: meta.color + '08', padding: 12 }}>
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
                                        <View style={{ backgroundColor: '#818cf810', borderWidth: 1, borderColor: '#818cf830', padding: 10 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#818cf8' }}>Interest deductible under Sec 80E for up to 8 years</Text>
                                        </View>
                                    )}
                                    {lt.id === 'home_loan' && (
                                        <View style={{ backgroundColor: '#4ade8010', borderWidth: 1, borderColor: '#4ade8030', padding: 10 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#4ade80' }}>Interest up to ₹2L/yr deductible (Sec 24b). Principal under 80C.</Text>
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        onPress={() => {
                                            if (!amt || amt < 10000) { onShowDialog('Invalid Amount', 'Minimum loan amount is ₹10,000.', 'error'); return; }
                                            const res = takeLoan(lt.id, amt, selTenure);
                                            onShowDialog(res.success ? 'Loan Approved!' : 'Application Rejected', res.msg, res.success ? 'success' : 'error');
                                            if (res.success) { setApplyingLoanId(null); setLoanAmount(''); }
                                        }}
                                        style={{ paddingVertical: 14, borderWidth: 1, borderColor: meta.color, backgroundColor: meta.color + '18', alignItems: 'center' }}
                                    >
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: meta.color, letterSpacing: 1 }}>
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

                    return (
                        <View style={{ gap: 12 }}>

                            {/* ── ITR Status Banner ── */}
                            <View style={{
                                borderWidth: 1,
                                borderColor: itrThisYear ? '#4ade8050' : inFilingWindow ? '#fbbf2460' : '#1a2040',
                                backgroundColor: itrThisYear ? '#091a0f' : inFilingWindow ? '#120f03' : '#070a16',
                                padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
                            }}>
                                <FontAwesome5
                                    name={itrThisYear ? 'check-circle' : inFilingWindow ? 'exclamation-circle' : 'clock'}
                                    size={22}
                                    color={itrThisYear ? '#4ade80' : inFilingWindow ? '#fbbf24' : '#2a3560'}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 3 }}>
                                        ITR — FY {currentYear - 1}-{String(currentYear).slice(2)}
                                    </Text>
                                    {itrThisYear ? (
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#4ade80', lineHeight: 22 }}>
                                            {itrThisYear === 'ca' ? 'Filed via CA ✓' : itrThisYear === 'self' ? 'Self Filed ✓' : itrThisYear === 'self_wrong_form' ? 'Filed — wrong form risk ⚠️' : 'Skipped — penalty paid'}
                                        </Text>
                                    ) : inFilingWindow ? (
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#fbbf24', lineHeight: 22 }}>
                                            Due in {monthsToITR} month{monthsToITR !== 1 ? 's' : ''} — Act now
                                        </Text>
                                    ) : (
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#445070', lineHeight: 20 }}>
                                            {monthsToITR} months until July 31 deadline
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* ── HOW DO YOU WANT TO FILE? ── */}
                            {true && (
                                <>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 4, paddingHorizontal: 2 }}>{itrThisYear ? 'NEXT FILING YEAR — PLAN AHEAD' : 'CHOOSE HOW TO FILE YOUR ITR'}</Text>

                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                        {/* CA Option */}
                                        <View style={{
                                            flex: 1, borderWidth: caSubscribed ? 2 : 1,
                                            borderColor: caSubscribed ? '#a78bfa' : '#2a1a5a',
                                            backgroundColor: caSubscribed ? '#0e0920' : '#090614',
                                            overflow: 'hidden',
                                        }}>
                                            <View style={{ height: 4, backgroundColor: caSubscribed ? '#a78bfa' : '#3a1a7a' }} />
                                            <View style={{ padding: 12 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: caSubscribed ? '#a78bfa' : '#4a2a9a', letterSpacing: 3 }}>CA RETAINER</Text>
                                                    {caSubscribed && <FontAwesome5 name="check-circle" size={12} color="#a78bfa" />}
                                                </View>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#c8d4f0', lineHeight: 22, marginBottom: 8 }}>Hire a CA</Text>
                                                {[
                                                    '₹2,000/month',
                                                    'Auto-files every July',
                                                    '+₹25K extra deductions',
                                                    'Notice protection',
                                                ].map((pt, i) => (
                                                    <View key={i} style={{ flexDirection: 'row', gap: 6, marginBottom: 3, alignItems: 'center' }}>
                                                        <View style={{ width: 5, height: 5, backgroundColor: '#a78bfa', borderRadius: 3 }} />
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070', flex: 1 }}>{pt}</Text>
                                                    </View>
                                                ))}
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        const res = caSubscribed ? cancelCA() : subscribeCA();
                                                        onShowDialog(res.success ? (caSubscribed ? 'CA Cancelled' : 'CA Subscribed!') : 'Failed', res.msg, res.success ? (caSubscribed ? 'warning' : 'success') : 'error');
                                                    }}
                                                    style={{ marginTop: 10, padding: 10, borderWidth: 1, borderColor: caSubscribed ? '#7f1d1d' : '#a78bfa', backgroundColor: caSubscribed ? '#1a0808' : '#1a0f2e', alignItems: 'center' }}
                                                >
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: caSubscribed ? '#f87171' : '#a78bfa', letterSpacing: 1 }}>
                                                        {caSubscribed ? 'CANCEL' : 'SUBSCRIBE'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {/* Self-file Option */}
                                        <View style={{
                                            flex: 1, borderWidth: selfFilingInProgress ? 2 : 1,
                                            borderColor: selfFilingInProgress ? '#60a5fa' : '#0a1a3a',
                                            backgroundColor: selfFilingInProgress ? '#030d1f' : '#040912',
                                            overflow: 'hidden',
                                        }}>
                                            <View style={{ height: 4, backgroundColor: selfFilingInProgress ? '#60a5fa' : '#0a2a5a' }} />
                                            <View style={{ padding: 12 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: selfFilingInProgress ? '#60a5fa' : '#0a3a7a', letterSpacing: 3 }}>DIY</Text>
                                                    {selfFilingInProgress && <FontAwesome5 name="spinner" size={12} color="#60a5fa" />}
                                                </View>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#c8d4f0', lineHeight: 22, marginBottom: 8 }}>Self File</Text>
                                                {[
                                                    'Free — no monthly fee',
                                                    'Step-by-step wizard',
                                                    'Learn real tax rules',
                                                    'Pick form, gather docs',
                                                ].map((pt, i) => (
                                                    <View key={i} style={{ flexDirection: 'row', gap: 6, marginBottom: 3, alignItems: 'center' }}>
                                                        <View style={{ width: 5, height: 5, backgroundColor: '#60a5fa', borderRadius: 3 }} />
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070', flex: 1 }}>{pt}</Text>
                                                    </View>
                                                ))}
                                                <TouchableOpacity
                                                    onPress={itrThisYear ? undefined : startSelfFiling}
                                                    disabled={!!itrThisYear}
                                                    style={{ marginTop: 10, padding: 10, borderWidth: 1, borderColor: itrThisYear ? '#1a2040' : '#60a5fa', backgroundColor: '#050f20', alignItems: 'center' }}
                                                >
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: itrThisYear ? '#2a3560' : '#60a5fa', letterSpacing: 1 }}>
                                                        {itrThisYear ? 'FILED THIS YEAR ✓' : selfFilingInProgress ? 'RESUME →' : 'START →'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </>
                            )}

                            {/* ── CA Active Details ── */}
                            {caSubscribed && (
                                <View style={{ borderWidth: 1, borderColor: '#a78bfa40', backgroundColor: '#0a0618', padding: 14, gap: 8 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 3 }}>YOUR CA — CA SHARMA & ASSOCIATES</Text>

                                    <View style={{ height: 90, position: 'relative', overflow: 'hidden' }}>
                                        <Image source={require('../../assets/CA_Office.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,20,0.6)' }} />
                                        <View style={{ position: 'absolute', bottom: 8, left: 12, flexDirection: 'row', gap: 12 }}>
                                            <View style={{ backgroundColor: '#a78bfa20', borderWidth: 1, borderColor: '#a78bfa60', paddingHorizontal: 8, paddingVertical: 3 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#a78bfa', letterSpacing: 2 }}>RETAINER ACTIVE</Text>
                                            </View>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', alignSelf: 'center' }}>{monthsSubscribed} mo · ₹{totalFeesPaid.toLocaleString()} paid</Text>
                                        </View>
                                    </View>

                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        {[
                                            { label: 'MONTHLY', value: '₹2,000', color: '#f87171' },
                                            { label: 'SAVED', value: '~₹25K/yr', color: '#4ade80' },
                                            { label: 'ITR', value: 'Auto July', color: '#a78bfa' },
                                        ].map((s, i) => (
                                            <View key={i} style={{ flex: 1, backgroundColor: '#0d1020', borderWidth: 1, borderColor: '#1e2840', padding: 8, alignItems: 'center' }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#2a3560', letterSpacing: 1 }}>{s.label}</Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: s.color }}>{s.value}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {[
                                        { icon: 'file-alt',      color: '#a78bfa', text: 'Automatically files ITR every July with optimised deductions' },
                                        { icon: 'search-dollar', color: '#4ade80', text: 'Finds ₹25,000+ in extra deductions your employer misses' },
                                        { icon: 'shield-alt',    color: '#fbbf24', text: 'Handles any IT notices — you don\'t deal with the department' },
                                        { icon: 'chart-line',    color: '#60a5fa', text: 'Advises on which investments to show under 80C each April' },
                                    ].map((tip, i) => (
                                        <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                                            <FontAwesome5 name={tip.icon} size={12} color={tip.color} style={{ marginTop: 3 }} />
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', flex: 1 }}>{tip.text}</Text>
                                        </View>
                                    ))}

                                    <TouchableOpacity
                                        onPress={() => {
                                            const res = cancelCA();
                                            onShowDialog('CA Cancelled', res.msg, 'warning');
                                        }}
                                        style={{ borderWidth: 1, borderColor: '#7f1d1d', backgroundColor: '#1a0808', padding: 10, alignItems: 'center', marginTop: 4 }}
                                    >
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#f87171', letterSpacing: 2 }}>CANCEL RETAINER</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* ── Self-filing progress (if in progress) ── */}
                            {selfFilingInProgress && (
                                <View style={{ borderWidth: 1, borderColor: '#60a5fa50', backgroundColor: '#030d1f', padding: 14 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 3, marginBottom: 6 }}>SELF-FILING IN PROGRESS</Text>
                                    {['form_select', 'gather_docs', 'everify'].map((s, i) => {
                                        const labels = ['Pick ITR form', 'Gather documents', 'Compute & e-verify'];
                                        const stepIdx = ['form_select', 'gather_docs', 'everify'].indexOf(itrSelfFiling.step);
                                        const done = i < stepIdx;
                                        const active = i === stepIdx;
                                        return (
                                            <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                                <FontAwesome5 name={done ? 'check-circle' : active ? 'circle' : 'circle'} size={14} color={done ? '#4ade80' : active ? '#60a5fa' : '#1a2040'} />
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: done ? '#4ade80' : active ? '#60a5fa' : '#2a3560' }}>{labels[i]}</Text>
                                            </View>
                                        );
                                    })}
                                    <TouchableOpacity
                                        onPress={startSelfFiling}
                                        style={{ borderWidth: 1, borderColor: '#60a5fa', backgroundColor: '#050f20', padding: 12, alignItems: 'center', marginTop: 8 }}
                                    >
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#60a5fa', letterSpacing: 2 }}>OPEN WIZARD →</Text>
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
                turnsLeftToday={turnsLeftToday}
                onShowDialog={onShowDialog}
            />}

            {/* ── GOLD ── */}
            {tab === 'gold' && (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#fbbf24', letterSpacing: 3, marginBottom: 12 }}>SPOT PRICE: ₹{goldPrice?.toLocaleString()}/g (24k)</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                        {GOLD_ASSETS.map(a => (
                            <TouchableOpacity key={a.id} onPress={() => setSelectedGoldAsset(a)} activeOpacity={0.8}
                                style={{ flex: 1, borderWidth: 1, borderColor: selectedGoldAsset?.id === a.id ? '#fbbf24' : '#1a2040', backgroundColor: selectedGoldAsset?.id === a.id ? '#fbbf2415' : '#070a16', padding: 10, alignItems: 'center' }}>
                                <FontAwesome5 name={a.type === 'bond' ? 'file-contract' : a.type === 'jewellery' ? 'gem' : 'coins'} size={20} color={selectedGoldAsset?.id === a.id ? '#fbbf24' : '#2a3560'} />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: selectedGoldAsset?.id === a.id ? '#fbbf24' : '#445070', marginTop: 6, textAlign: 'center' }}>{a.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {selectedGoldAsset && (
                        <View style={{ borderWidth: 1, borderColor: '#fbbf2430', backgroundColor: '#070a16', padding: 14, marginBottom: 14 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#fbbf24', marginBottom: 6 }}>{selectedGoldAsset.name}</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', lineHeight: 18, marginBottom: 8 }}>{selectedGoldAsset.description}</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#818cf8' }}>Tax: {selectedGoldAsset.taxNote}</Text>
                            {selectedGoldAsset.makingCharges > 0 && (
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#f87171', marginTop: 4 }}>Making charges: {Math.round(selectedGoldAsset.makingCharges * 100)}% (non-recoverable on resale)</Text>
                            )}
                            {selectedGoldAsset.type === 'bond' && (
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#4ade80', marginTop: 4 }}>+ 2.5% annual interest (paid every 6 months)</Text>
                            )}
                        </View>
                    )}
                    <View style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#070a16', padding: 14, marginBottom: 14 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#c8d4f0', letterSpacing: 2, marginBottom: 10 }}>BUY GOLD</Text>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                            <TextInput value={goldGrams} onChangeText={setGoldGrams} keyboardType="decimal-pad"
                                style={{ flex: 1, backgroundColor: '#0d1020', borderWidth: 1, borderColor: '#1a2040', color: '#c8d4f0', fontFamily: 'VT323_400Regular', fontSize: 18, padding: 10 }}
                                placeholder="grams" placeholderTextColor="#2a3560" />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>g</Text>
                        </View>
                        {(() => {
                            const g = parseFloat(goldGrams) || 0;
                            const purity = selectedGoldAsset?.purity || 1;
                            const base = g * (goldPrice || 0) * purity;
                            const making = Math.round(base * (selectedGoldAsset?.makingCharges || 0));
                            const total = Math.round(base + making);
                            return (
                                <View style={{ marginBottom: 10 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070' }}>Base: ₹{Math.round(base).toLocaleString()}{making > 0 ? ` + ₹${making.toLocaleString()} making` : ''}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#fbbf24', marginTop: 4 }}>Total: ₹{total.toLocaleString()}</Text>
                                </View>
                            );
                        })()}
                        <TouchableOpacity onPress={() => {
                            const g = parseFloat(goldGrams);
                            if (!g || g <= 0) { onShowDialog('Invalid', 'Enter a valid gram amount.', 'error'); return; }
                            if (!selectedGoldAsset) { onShowDialog('Select Asset', 'Choose a gold type first.', 'error'); return; }
                            const r = buyGold(selectedGoldAsset.id, g);
                            onShowDialog(r.success ? 'Gold Purchased' : 'Failed', r.msg, r.success ? 'success' : 'error');
                        }} style={{ borderWidth: 1, borderColor: '#fbbf24', backgroundColor: '#fbbf2415', padding: 12, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#fbbf24', letterSpacing: 2 }}>BUY {goldGrams}g →</Text>
                        </TouchableOpacity>
                    </View>
                    {Object.entries(goldHoldings || {}).filter(([, h]) => h?.grams > 0).map(([assetId, h]) => {
                        const asset = GOLD_ASSETS.find(a => a.id === assetId);
                        const purity = asset?.purity || 1;
                        const currentVal = Math.round(h.grams * (goldPrice || 0) * purity);
                        const costBasis = Math.round(h.grams * (h.avgBuyPrice || 0));
                        const gain = currentVal - costBasis;
                        return (
                            <View key={assetId} style={{ borderWidth: 1, borderColor: '#fbbf2430', backgroundColor: '#070a16', padding: 14, marginBottom: 10 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#fbbf24' }}>{asset?.name}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#fbbf24' }}>{h.grams.toFixed(2)}g</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>Value: ₹{currentVal.toLocaleString()}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: gain >= 0 ? '#4ade80' : '#f87171' }}>{gain >= 0 ? '+' : ''}₹{gain.toLocaleString()}</Text>
                                </View>
                                {asset?.type === 'bond' && h.interestAccrued > 0 && (
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#4ade80', marginBottom: 8 }}>Interest earned: ₹{h.interestAccrued.toLocaleString()}</Text>
                                )}
                                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                                    <TextInput value={goldSellGrams} onChangeText={setGoldSellGrams} keyboardType="decimal-pad"
                                        style={{ flex: 1, backgroundColor: '#0d1020', borderWidth: 1, borderColor: '#1a2040', color: '#c8d4f0', fontFamily: 'VT323_400Regular', fontSize: 16, padding: 8 }}
                                        placeholder={`max ${h.grams.toFixed(2)}g`} placeholderTextColor="#2a3560" />
                                    <TouchableOpacity onPress={() => {
                                        const sg = parseFloat(goldSellGrams);
                                        if (!sg || sg <= 0) { onShowDialog('Invalid', 'Enter grams to sell.', 'error'); return; }
                                        const r = sellGold(assetId, sg);
                                        onShowDialog(r.success ? 'Sold' : 'Failed', r.msg, r.success ? 'success' : 'error');
                                        if (r.success) setGoldSellGrams('');
                                    }} style={{ borderWidth: 1, borderColor: '#f87171', backgroundColor: '#f8717115', padding: 10 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#f87171' }}>SELL</Text>
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
                        <View style={{ borderWidth: 1, borderColor: creditCard.balance > 0 ? '#f87171' : '#60a5fa', backgroundColor: '#070a16', padding: 14 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', letterSpacing: 2 }}>TOTAL CREDIT LIMIT</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#60a5fa' }}>₹{creditCard.limit?.toLocaleString()}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', letterSpacing: 2 }}>TOTAL OUTSTANDING</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: creditCard.balance > 0 ? '#f87171' : '#4ade80' }}>₹{creditCard.balance?.toLocaleString()}</Text>
                            </View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070' }}>
                                {creditCard.balance > 0 ? 'Pay before next month to avoid 3%/mo interest' : 'No outstanding bill'}
                            </Text>
                            {creditCard.balance > 0 && (
                                <View style={{ marginTop: 10, gap: 8 }}>
                                    <TextInput value={cardPayInput} onChangeText={setCardPayInput} keyboardType="number-pad"
                                        style={{ backgroundColor: '#0d1020', borderWidth: 1, borderColor: '#1a2040', color: '#c8d4f0', fontFamily: 'VT323_400Regular', fontSize: 18, padding: 10 }}
                                        placeholder={`max ₹${creditCard.balance?.toLocaleString()}`} placeholderTextColor="#2a3560" />
                                    <TouchableOpacity onPress={() => {
                                        const amt = parseInt(cardPayInput) || creditCard.balance;
                                        const r = payCreditCardBill(amt);
                                        onShowDialog(r.success ? 'Paid!' : 'Failed', r.msg, r.success ? 'success' : 'error');
                                        if (r.success) setCardPayInput('');
                                    }} style={{ borderWidth: 1, borderColor: '#60a5fa', backgroundColor: '#60a5fa15', padding: 12, alignItems: 'center' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#60a5fa', letterSpacing: 2 }}>PAY FULL (₹{creditCard.balance?.toLocaleString()}) →</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}

                    {CREDIT_CARDS_DATA.map(card => {
                        const isOwned = activeCreditCards?.includes(card.id) || (card.id === 'standard' && creditCard && !activeCreditCards?.length);
                        return (
                            <View key={card.id} style={{ borderWidth: 1, borderColor: isOwned ? '#4ade8050' : '#1a2040', backgroundColor: '#070a16', padding: 20 }}>
                                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                                    <Image source={card.image} style={{ width: '100%', height: 180 }} resizeMode="contain" />
                                </View>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: isOwned ? '#4ade80' : '#c8d4f0', marginBottom: 4 }}>{card.name}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#60a5fa', marginBottom: 8, fontStyle: 'italic' }}>Perk: {card.perk}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070', lineHeight: 20, marginBottom: 16 }}>{card.desc}</Text>
                                
                                {isOwned ? (
                                    <View style={{ width: '100%', borderWidth: 1, borderColor: '#4ade80', backgroundColor: '#4ade8015', padding: 14, alignItems: 'center' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#4ade80', letterSpacing: 2 }}>CARD ACTIVE ✓</Text>
                                    </View>
                                ) : card.isEligible ? (
                                    <TouchableOpacity onPress={() => {
                                        const r = openCreditCard(card.id);
                                        onShowDialog(r.success ? 'Card Approved!' : 'Failed', r.msg, r.success ? 'success' : 'error');
                                    }} style={{ width: '100%', borderWidth: 1, borderColor: '#60a5fa', backgroundColor: '#60a5fa15', padding: 14, alignItems: 'center' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#60a5fa', letterSpacing: 2 }}>APPLY NOW →</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={{ width: '100%', borderWidth: 1, borderColor: '#1a2040', padding: 14, alignItems: 'center', opacity: 0.5 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#f87171', textAlign: 'center' }}>Not Eligible</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070', textAlign: 'center', marginTop: 4 }}>{card.criteriaText}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            )}

            {/* ── RETIREMENT BUCKETS ── */}
            {tab === 'retire' && (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
                    {!retirementBuckets ? (
                        <View style={{ gap: 12 }}>
                            <View style={{ borderWidth: 1, borderColor: '#818cf8', backgroundColor: '#070a16', padding: 16 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#818cf8', marginBottom: 8 }}>BUCKET STRATEGY</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', lineHeight: 18 }}>
                                    Divide your retirement corpus into 3 buckets based on when you need the money.
                                </Text>
                            </View>
                            {[
                                { key: 'b1', label: 'BUCKET 1 — NOW', color: '#4ade80', desc: '1–2 years of expenses in FDs/savings. Never touches the market.', val: b1Input, set: setB1Input },
                                { key: 'b2', label: 'BUCKET 2 — SOON', color: '#fbbf24', desc: '3–7 years of expenses in PPF/bonds/debt funds.', val: b2Input, set: setB2Input },
                                { key: 'b3', label: 'BUCKET 3 — LATER', color: '#818cf8', desc: 'Everything else in equity. 7+ year horizon.', val: b3Input, set: setB3Input },
                            ].map(b => (
                                <View key={b.key} style={{ borderWidth: 1, borderColor: b.color + '40', backgroundColor: '#070a16', padding: 14 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: b.color, marginBottom: 4 }}>{b.label}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', lineHeight: 18, marginBottom: 10 }}>{b.desc}</Text>
                                    <TextInput value={b.val} onChangeText={b.set} keyboardType="number-pad"
                                        style={{ backgroundColor: '#0d1020', borderWidth: 1, borderColor: '#1a2040', color: '#c8d4f0', fontFamily: 'VT323_400Regular', fontSize: 18, padding: 10 }}
                                        placeholder="₹ amount" placeholderTextColor="#2a3560" />
                                </View>
                            ))}
                            <TouchableOpacity onPress={() => {
                                const b1 = parseInt(b1Input) || 0, b2 = parseInt(b2Input) || 0, b3 = parseInt(b3Input) || 0;
                                const r = setupRetirementBuckets(b1, b2, b3);
                                onShowDialog(r.success ? 'Buckets Configured!' : 'Failed', r.msg, r.success ? 'success' : 'error');
                            }} style={{ borderWidth: 1, borderColor: '#818cf8', backgroundColor: '#818cf815', padding: 14, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#818cf8', letterSpacing: 2 }}>SET UP BUCKETS →</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={{ gap: 12 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#4ade80', letterSpacing: 2 }}>BUCKETS ACTIVE ✓</Text>
                            {[
                                { label: 'BUCKET 1 (NOW)', val: retirementBuckets.bucket1, color: '#4ade80' },
                                { label: 'BUCKET 2 (SOON)', val: retirementBuckets.bucket2, color: '#fbbf24' },
                                { label: 'BUCKET 3 (LATER)', val: retirementBuckets.bucket3, color: '#818cf8' },
                            ].map((b, i) => (
                                <View key={i} style={{ borderWidth: 1, borderColor: b.color + '40', backgroundColor: '#070a16', padding: 14, flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: b.color }}>{b.label}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: b.color }}>₹{b.val?.toLocaleString()}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

// ── ITR Self-Filing Wizard ────────────────────────────────────────────────────
function ITRSelfFilingWizard({ filing, getRequiredITRDocs, getITRForms, selectITRForm, collectITRDoc, computeITRTaxFull, submitITR, turnsLeftToday, onShowDialog }) {
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
            <View style={{ backgroundColor: C.panel, paddingTop: 14, paddingBottom: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderColor: C.border }}>
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
                            <View style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 4 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3, marginBottom: 4 }}>STEP 1 OF 3</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream }}>Which ITR form applies to you?</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, marginTop: 4 }}>Filing with the wrong form can trigger an IT notice. Read carefully.</Text>
                            </View>
                            {forms.map(form => (
                                <TouchableOpacity key={form.id} onPress={() => selectITRForm(form.id)} activeOpacity={0.85}
                                    style={{ borderWidth: 1, borderColor: form.correct ? form.color + '80' : C.border, backgroundColor: form.correct ? form.color + '0a' : C.panel, padding: 14 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: form.correct ? form.color : C.cream }}>{form.name}</Text>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: form.correct ? form.color : C.dark, letterSpacing: 2 }}>{form.tag}</Text>
                                        </View>
                                        {form.correct && (
                                            <View style={{ backgroundColor: form.color + '20', borderWidth: 1, borderColor: form.color + '60', paddingHorizontal: 8, paddingVertical: 2 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: form.color, letterSpacing: 2 }}>✓ APPLICABLE</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim, marginBottom: 6 }}>{form.forWhom}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dark, lineHeight: 17 }}>{form.why}</Text>
                                    <View style={{ marginTop: 10, borderWidth: 1, borderColor: form.correct ? form.color + '60' : C.border, padding: 8, alignItems: 'center' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: form.correct ? form.color : C.dim, letterSpacing: 1 }}>SELECT {form.id}</Text>
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
                            <View style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, padding: 12 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3, marginBottom: 4 }}>STEP 2 OF 3 — FILING AS {formSelected?.id}</Text>
                                {wrongForm && (
                                    <View style={{ backgroundColor: '#7f1d1d', borderWidth: 1, borderColor: '#f87171', padding: 8, marginBottom: 8 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#f87171' }}>⚠️ This form may not be correct for your situation. Filing with the wrong form risks an IT notice.</Text>
                                    </View>
                                )}
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream }}>Collect your documents</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, marginTop: 4 }}>Each document costs 1 daily action. {turns} action{turns !== 1 ? 's' : ''} remaining today.</Text>
                            </View>

                            {docs.map(doc => {
                                const collected = docsCollected.includes(doc.id);
                                return (
                                    <View key={doc.id} style={{ borderWidth: 1, borderColor: collected ? C.sage + '60' : C.border, backgroundColor: collected ? C.sage + '06' : C.panel, padding: 14 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                                            <FontAwesome5 name={doc.icon} size={14} color={collected ? C.sage : C.dim} style={{ marginTop: 3 }} />
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: collected ? C.sage : C.cream }}>{doc.name}</Text>
                                                    {collected && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.sage }}>✓ COLLECTED</Text>}
                                                </View>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.purple, letterSpacing: 2, marginBottom: 4 }}>{doc.section}</Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, lineHeight: 18, marginBottom: 6 }}>{doc.desc}</Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, marginBottom: 8 }}>📍 {doc.source}</Text>
                                                {!collected && (
                                                    <TouchableOpacity
                                                        onPress={async () => {
                                                            const r = await collectITRDoc(doc.id);
                                                            if (!r.success) showToast(r.msg, false);
                                                        }}
                                                        disabled={turns <= 0}
                                                        style={{ borderWidth: 1, borderColor: turns > 0 ? C.blue + '80' : C.border, backgroundColor: turns > 0 ? C.blue + '10' : C.card, paddingVertical: 8, alignItems: 'center' }}
                                                    >
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: turns > 0 ? C.blue : C.dark, letterSpacing: 1 }}>
                                                            {turns > 0 ? 'COLLECT DOCUMENT — 1 ACTION' : 'NO ACTIONS LEFT TODAY'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}

                            {allCollected && (
                                <TouchableOpacity
                                    onPress={() => computeITRTaxFull()}
                                    style={{ borderWidth: 1, borderColor: C.gold, backgroundColor: C.gold + '15', padding: 16, alignItems: 'center', marginTop: 4 }}
                                >
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.gold, letterSpacing: 2 }}>ALL DOCS COLLECTED — COMPUTE TAX →</Text>
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
                            <View style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, padding: 12 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3, marginBottom: 4 }}>STEP 3 OF 3 — TAX COMPUTATION</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream }}>Your Tax Summary — FY {year - 1}-{String(year).slice(2)}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, marginTop: 4 }}>Review every line before you file. This is exactly how the IT department computes your liability.</Text>
                            </View>

                            {/* Income breakdown */}
                            <View style={{ borderWidth: 1, borderColor: C.border, backgroundColor: C.panel, padding: 14 }}>
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
                            <View style={{ borderWidth: 1, borderColor: C.border, backgroundColor: C.panel, padding: 14 }}>
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
                            <View style={{ borderWidth: 1, borderColor: C.border, backgroundColor: C.panel, padding: 14 }}>
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
                            <View style={{ borderWidth: 1, borderColor: C.border, backgroundColor: C.panel, padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3, marginBottom: 8 }}>TDS ALREADY DEDUCTED (TAX CREDIT)</Text>
                                {row('TDS on Salary — by employer [Form 16]', `−${rup(c.estimatedSalaryTDS)}`, C.sage)}
                                {c.bankTDS > 0 && row('TDS on FD Interest — by bank [Form 16A]', `−${rup(c.bankTDS)}`, C.sage)}
                                {row('Total TDS Credit', `−${rup(c.totalTDS)}`, C.sage)}
                                <View style={{ height: 2, backgroundColor: C.border, marginVertical: 8 }} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: isRefund ? C.sage + '10' : C.red + '10', borderWidth: 1, borderColor: isRefund ? C.sage + '60' : C.red + '60', padding: 10 }}>
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
                            <View style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: C.panel, padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3, marginBottom: 6 }}>STEP 4 — E-VERIFY & SUBMIT</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.cream, marginBottom: 8 }}>Filing is not complete until you e-verify. Unverified returns are treated as not filed.</Text>
                                {[
                                    { method: 'Aadhaar OTP', desc: 'OTP sent to Aadhaar-linked mobile. Fastest and most common.', recommended: true },
                                    { method: 'Net Banking', desc: 'Login to your bank and verify via ITR e-verify option.' },
                                    { method: 'Demat Account', desc: 'Via CDSL/NSDL. Requires active demat linked to PAN.' },
                                ].map((m, i) => (
                                    <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                                        <FontAwesome5 name={m.recommended ? 'mobile-alt' : 'landmark'} size={12} color={m.recommended ? C.blue : C.dim} style={{ marginTop: 3 }} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: m.recommended ? C.blue : C.dim }}>{m.method}{m.recommended ? ' (recommended)' : ''}</Text>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark }}>{m.desc}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {wrongForm && (
                                <View style={{ borderWidth: 1, borderColor: C.red + '60', backgroundColor: '#1a0808', padding: 12 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.red }}>⚠️ Wrong ITR form selected — filing will trigger an IT notice (Sec 139(9) defective return). ₹5,000 penalty will be deducted.</Text>
                                </View>
                            )}
                            <View style={{ borderWidth: 1, borderColor: C.border, backgroundColor: C.panel, padding: 12 }}>
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
                                style={{ borderWidth: 1, borderColor: wrongForm ? C.red : C.sage, backgroundColor: wrongForm ? C.red + '15' : C.sage + '18', padding: 16, alignItems: 'center', marginTop: 4 }}
                            >
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: wrongForm ? C.red : C.sage, letterSpacing: 2 }}>
                                    {wrongForm ? 'SUBMIT ANYWAY (RISKY) →' : 'SEND AADHAAR OTP & SUBMIT →'}
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
