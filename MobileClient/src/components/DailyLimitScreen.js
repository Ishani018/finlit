import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Image, Dimensions } from 'react-native';

const { height: SH } = Dimensions.get('window');

const WARN_IMG = require('../../assets/ui_comp/warning.png');
const BULB_IMG = require('../../assets/ui_comp/bulb.png');
const HOME_IMG = require('../../assets/ui_comp/home.png');

function getSecondsUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight - now) / 1000);
}

function formatCountdown(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const TIPS = [
    'While you wait — review your net worth trend on the home screen.',
    'Check your insurance coverage. One gap can erase years of savings.',
    'Look at your CIBIL score. Every on-time EMI payment helps.',
    'A SIP started today beats a larger investment started next year.',
    'Your emergency fund should cover 6 months of expenses.',
    'Term insurance is cheapest when you are young. Don\'t delay.',
    'PPF gives 7.1% tax-free. Hard to beat for risk-free savings.',
    'Diversify: stocks for growth, FD for stability, PPF for tax savings.',
];

export default function DailyLimitScreen({ visible, turnsUsed, dailyLimit, monthsPlayedToday, onDismiss, onCrisisSimulator }) {
    const slideAnim = useRef(new Animated.Value(visible ? 0 : SH)).current;
    const [countdown, setCountdown] = useState(getSecondsUntilMidnight());
    const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

    useEffect(() => {
        if (visible) {
            slideAnim.setValue(SH);
            Animated.spring(slideAnim, { toValue: 0, friction: 14, tension: 100, useNativeDriver: true }).start();
        } else {
            Animated.timing(slideAnim, { toValue: SH, duration: 250, useNativeDriver: true }).start();
        }
    }, [visible]);

    useEffect(() => {
        if (!visible) return;
        setCountdown(getSecondsUntilMidnight());
        const id = setInterval(() => setCountdown(getSecondsUntilMidnight()), 1000);
        return () => clearInterval(id);
    }, [visible]);

    return (
        <Animated.View pointerEvents={visible ? 'auto' : 'none'} style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, top: 0,
            zIndex: 500, transform: [{ translateY: slideAnim }],
        }}>
            {/* Backdrop */}
            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.97)' }} />

            <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 32 }}>
                {/* Red accent top */}
                <View style={{ height: 2, backgroundColor: '#f87171' }} />

                <View style={{ backgroundColor: '#070910', borderWidth: 1, borderTopWidth: 0, borderColor: '#1a2040', padding: 20 }}>

                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                        <View style={{ width: 44, height: 44, backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717160', alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={WARN_IMG} style={{ width: 26, height: 26 }} resizeMode="contain" />
                        </View>
                        <View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#f87171', letterSpacing: 4 }}>DAILY LIMIT REACHED</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', lineHeight: 28 }}>DAY COMPLETE</Text>
                        </View>
                    </View>

                    {/* Stats row */}
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                        <View style={{ flex: 1, borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#06080f', padding: 12, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 2 }}>TURNS USED</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 32, color: '#fbbf24', lineHeight: 34 }}>{turnsUsed}/{dailyLimit}</Text>
                        </View>
                        <View style={{ flex: 1, borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#06080f', padding: 12, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 2 }}>MONTHS SIMULATED</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 32, color: '#4ade80', lineHeight: 34 }}>{monthsPlayedToday}</Text>
                        </View>
                    </View>

                    {/* Countdown */}
                    <View style={{ borderWidth: 1, borderColor: '#fbbf2430', backgroundColor: '#fbbf2408', padding: 14, marginBottom: 16, alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#664400', letterSpacing: 3, marginBottom: 4 }}>RESETS AT MIDNIGHT IN</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 38, color: '#fbbf24', lineHeight: 40, letterSpacing: 4 }}>
                            {formatCountdown(countdown)}
                        </Text>
                    </View>

                    {/* Tip */}
                    <View style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#070a16', padding: 12, marginBottom: 18, flexDirection: 'row', gap: 8 }}>
                        <Image source={BULB_IMG} style={{ width: 20, height: 20, opacity: 0.7 }} resizeMode="contain" />
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#556080', flex: 1, lineHeight: 18 }}>{tip}</Text>
                    </View>

                    {/* Crisis Simulator CTA */}
                    <TouchableOpacity
                        onPress={onCrisisSimulator}
                        activeOpacity={0.8}
                        style={{ borderWidth: 1, borderColor: '#f8717160', backgroundColor: '#f8717108', paddingVertical: 14, alignItems: 'center', marginBottom: 10 }}
                    >
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#f87171', letterSpacing: 2, lineHeight: 22 }}>⚡ CRISIS SIMULATOR</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070', letterSpacing: 1 }}>CAN YOUR FINANCES SURVIVE?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onDismiss}
                        activeOpacity={0.8}
                        style={{ borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#06080f', paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 }}
                    >
                        <Image source={HOME_IMG} style={{ width: 18, height: 18, opacity: 0.5 }} resizeMode="contain" />
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#445070', letterSpacing: 2, lineHeight: 20 }}>BACK HOME</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
}
