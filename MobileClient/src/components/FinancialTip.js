import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const { height: SH } = Dimensions.get('window');

// First-encounter educational tooltips — shown once per product.
// onDismiss should call markTutorialSeen(tip.key) via context.
export default function FinancialTip({ tip, onDismiss }) {
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        if (tip) {
            Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 70, useNativeDriver: true }).start();
        }
    }, [tip]);

    if (!tip) return null;

    const dismiss = () => {
        Animated.timing(slideAnim, { toValue: 300, duration: 250, useNativeDriver: true }).start(() => onDismiss());
    };

    return (
        <Animated.View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 200,
            transform: [{ translateY: slideAnim }],
        }}>
            <View style={{ backgroundColor: '#08101e', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 22, paddingBottom: 36 }}>
                {/* Drag handle */}
                <View style={{ width: 36, height: 4, backgroundColor: '#1e2840', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />

                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <Image source={require('../../assets/ui_comp/bulb.png')} style={{ width: 28, height: 28 }} resizeMode="contain" />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 3, marginBottom: 2 }}>WHY THIS MATTERS</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#c8d4f0', lineHeight: 26 }}>{tip.title}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={dismiss} style={{ padding: 4, marginLeft: 8 }}>
                        <FontAwesome5 name="times" size={14} color="#2a3560" />
                    </TouchableOpacity>
                </View>

                {/* Body — plain text, no box */}
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#6070a0', lineHeight: 23, marginBottom: 16 }}>
                    {tip.body}
                </Text>

                {/* Stat — subtle left bar, no border box */}
                {tip.stat && (
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                        <View style={{ width: 3, borderRadius: 2, backgroundColor: '#fbbf24' }} />
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#fbbf24', flex: 1, lineHeight: 20 }}>{tip.stat}</Text>
                    </View>
                )}

                <TouchableOpacity onPress={dismiss} activeOpacity={0.85}
                    style={{ backgroundColor: '#1a2e56', borderRadius: 10, padding: 14, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#c8d4f0', letterSpacing: 2 }}>GOT IT</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

// Tip definitions — key must match tutorial keys in GameContext seenTutorials
export const FINANCIAL_TIPS = {
    stocks: {
        key: 'stocks',
        title: 'Stock Market',
        body: 'Buying a stock means you own a tiny piece of a company. If the company grows, your share is worth more. Indian equity markets have delivered ~12% annual returns over 20-year periods — but short-term swings can be brutal.',
        stat: 'Rule: Never invest money in stocks that you will need within 2 years.',
    },
    mf: {
        key: 'mf',
        title: 'Mutual Funds',
        body: 'A mutual fund pools your money with thousands of others to buy a diversified basket of stocks or bonds. A fund manager makes the decisions for you. ELSS funds also give you a ₹1.5L tax deduction under Section 80C.',
        stat: 'Index funds beat 80% of actively managed funds over 10+ years.',
    },
    sip: {
        key: 'sip',
        title: 'SIP — Systematic Investment Plan',
        body: 'A SIP automatically invests a fixed amount every month, regardless of whether markets are up or down. When prices fall, your SIP buys more units. This is called rupee cost averaging — the most powerful investing habit there is.',
        stat: '₹5,000/mo SIP for 30 years at 12% = ₹1.76 Crore. Starting 10 years late = ₹58L.',
    },
    ppf: {
        key: 'ppf',
        title: 'Public Provident Fund (PPF)',
        body: 'PPF is a government-backed savings scheme giving 7.1% tax-free returns guaranteed. Contributions up to ₹1.5L/year are deductible under Section 80C. Maturity proceeds are completely tax-free.',
        stat: '15-year lock-in. Best risk-free, tax-saving instrument available to Indians.',
    },
    nps: {
        key: 'nps',
        title: 'National Pension System (NPS)',
        body: 'NPS is a market-linked pension scheme. Your corpus grows through equity and debt investments. At retirement (60), you get 60% as lump sum (tax-free) and 40% as monthly pension. Extra ₹50,000 deduction under 80CCD(1B) beyond the 80C limit.',
        stat: 'NPS gives you ₹50,000 extra tax deduction — on top of your 80C limit.',
    },
    fd: {
        key: 'fd',
        title: 'Fixed Deposits',
        body: 'FDs give guaranteed returns for a fixed period. Safe but the real return after inflation (7% FD − 6% inflation = 1% real) is low. Best used for your emergency fund and short-term goals, not long-term wealth building.',
        stat: 'Park 6 months of expenses in an FD. That\'s your emergency fund.',
    },
    insurance: {
        key: 'insurance',
        title: 'Insurance — The Real Deal',
        body: 'Term insurance pays your family ₹1 Crore+ if you die. At age 22, this costs ~₹700/month. At age 45, the same cover costs ₹3,000/month. Health insurance covers hospital bills — one serious illness without it can erase years of savings.',
        stat: 'Buy term insurance young. Every year you wait makes it 8–10% more expensive.',
    },
    loans: {
        key: 'loans',
        title: 'Loans & CIBIL Score',
        body: 'Your CIBIL score (300–900) determines if banks lend to you and at what rate. Pay EMIs on time — every on-time payment adds points. Miss payments and your score tanks, making every future loan more expensive. Score above 750 gets you the best rates.',
        stat: 'EMI-to-income ratio: keep it below 40%. Above 50% = danger zone.',
    },
    realestate: {
        key: 'realestate',
        title: 'Real Estate',
        body: 'Property is a tangible asset that generates rental income and appreciates over time. A home loan forces you to build equity instead of paying rent. But real estate is illiquid — you cannot sell it quickly in an emergency.',
        stat: 'Rental yield in India: 2–4%. Capital appreciation: 8–12% in good locations.',
    },
};
