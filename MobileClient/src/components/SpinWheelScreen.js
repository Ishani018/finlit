import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, Dimensions, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WHEEL_SEGMENTS, pickSegment } from '../data/wheel';
import { ADS_ENABLED, MAX_SPINS_PER_DAY } from '../config/ads';
import { initAds, showRewardedAd, AD_IS_SIMULATED, SIMULATED_AD_SECONDS } from '../services/rewardedAd';

const TAB_STACK = 124;   // the End Month dock and tab bar sit over the bottom of full screens
const PAD = 14;
const STORE_KEY = 'finlit_wheel_v1';
const C = { bg: '#06080f', panel: '#0d1020', border: '#1a2040', gold: '#fbbf24', cream: '#c8d4f0', dim: '#7d8ab0', dark: '#5a6890', red: '#f87171', sage: '#4ade80' };
const N = WHEEL_SEGMENTS.length;
const SEG = 360 / N;

const WHEEL_BASE = require('../../assets/ui_comp/wheel_base.png');   // pixel-art wheel, drawn at 192px and enlarged 4x

// The painted wheel with each prize's own icon and short name, turned to sit in its wedge.
function Wheel({ size }) {
    const c = size / 2, iconSize = Math.round(size * 0.115), ring = c * 0.67;
    return (
        <View style={{ width: size, height: size }}>
            <Image source={WHEEL_BASE} style={{ width: size, height: size, imageRendering: 'pixelated' }} resizeMode="stretch" />
            {WHEEL_SEGMENTS.map((s, i) => (
                <View key={s.id} pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: size, height: size, transform: [{ rotate: `${i * SEG}deg` }], alignItems: 'center' }}>
                    <View style={{ marginTop: c - ring - iconSize * 0.2, alignItems: 'center', width: size * 0.26 }}>
                        <Image source={s.icon} style={{ width: iconSize, height: iconSize }} resizeMode="contain" />
                        <Text numberOfLines={1} style={{ fontFamily: 'VT323_400Regular', fontSize: Math.round(size * 0.04), color: '#fff', textShadowColor: '#0a0e22', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 0, letterSpacing: 0 }}>{s.label}</Text>
                    </View>
                </View>
            ))}
            <View pointerEvents="none" style={{ position: 'absolute', left: c - 22, top: c - 22, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#fbbf24' }}>SPIN</Text>
            </View>
        </View>
    );
}

const today = () => new Date().toDateString();

// Props: onClose(), onReward(segment) applies the prize to the game, getContext() -> { hasLoans, isRenting, hasRunningCosts }.
export default function SpinWheelScreen({ onClose, onReward, getContext }) {
    const size = Math.min(Dimensions.get('window').width - 2 * PAD - 24, 330);
    const spin = useRef(new Animated.Value(0)).current;
    const rotation = useRef(0);                 // accumulated degrees, so each spin continues from where the last stopped
    const [used, setUsed] = useState(0);        // paid (ad) spins used today
    const [freeSpin, setFreeSpin] = useState(false);
    const [phase, setPhase] = useState('idle'); // idle | ad | spinning | result
    const [secs, setSecs] = useState(SIMULATED_AD_SECONDS);
    const [result, setResult] = useState(null);
    const [note, setNote] = useState(null);

    useEffect(() => {
        initAds();
        AsyncStorage.getItem(STORE_KEY).then(raw => {
            try { const s = JSON.parse(raw || '{}'); setUsed(s.date === today() ? (s.count || 0) : 0); } catch (e) { setUsed(0); }
        }).catch(() => {});
    }, []);

    const left = Math.max(0, MAX_SPINS_PER_DAY - used);
    const canSpin = phase === 'idle' && (freeSpin || left > 0);

    const runSpin = (paid) => {
        const idx = pickSegment(getContext ? getContext() : {});
        const seg = WHEEL_SEGMENTS[idx];
        const turns = 5 + Math.floor(Math.random() * 2);
        const jitter = (Math.random() - 0.5) * (SEG * 0.6);                 // land anywhere inside the wedge, not always dead centre
        const base = Math.ceil(rotation.current / 360) * 360;
        const target = base + turns * 360 - idx * SEG - jitter;
        rotation.current = target;
        setPhase('spinning');
        Animated.timing(spin, { toValue: target, duration: 4800, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
            setResult(seg);
            setPhase('result');
            if (seg.kind === 'again') setFreeSpin(true);
            else if (onReward) onReward(seg);
        });
        if (paid) {
            const n = used + 1;
            setUsed(n);
            AsyncStorage.setItem(STORE_KEY, JSON.stringify({ date: today(), count: n })).catch(() => {});
        }
    };

    const start = async () => {
        if (!canSpin) return;
        setNote(null); setResult(null);
        if (freeSpin) { setFreeSpin(false); runSpin(false); return; }
        if (!ADS_ENABLED) { runSpin(true); return; }
        setPhase('ad'); setSecs(SIMULATED_AD_SECONDS);
        let timer = null;
        if (AD_IS_SIMULATED) timer = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
        const r = await showRewardedAd();
        if (timer) clearInterval(timer);
        if (r.rewarded) runSpin(true);
        else { setPhase('idle'); setNote('No ad was available, or it was closed early. Try again in a moment.'); }
    };

    const deg = spin.interpolate({ inputRange: [0, 360 * 100], outputRange: ['0deg', `${360 * 100}deg`] });

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderColor: C.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={phase === 'spinning' ? undefined : onClose} activeOpacity={0.7}><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: C.dim, lineHeight: 26 }}>‹</Text></TouchableOpacity>
                    <View>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, letterSpacing: 4 }}>WATCH · SPIN · WIN</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: C.cream, lineHeight: 28 }}>Lucky Wheel</Text>
                    </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3 }}>SPINS LEFT TODAY</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: left > 0 ? C.gold : C.dark, lineHeight: 22 }}>{left} / {MAX_SPINS_PER_DAY}</Text>
                </View>
            </View>

            <View style={{ flex: 1, alignItems: 'center', paddingTop: 26 }}>
                <View style={{ width: size, height: size + 18, alignItems: 'center' }}>
                    {/* pointer */}
                    <View style={{ position: 'absolute', top: 0, zIndex: 5, width: 0, height: 0, borderLeftWidth: 13, borderRightWidth: 13, borderTopWidth: 24, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: C.gold }} />
                    <Animated.View style={{ marginTop: 14, transform: [{ rotate: deg }] }}>
                        <Wheel size={size} />
                    </Animated.View>
                </View>

                <View style={{ width: '100%', paddingHorizontal: PAD, marginTop: 16, minHeight: 112 }}>
                    {phase === 'result' && result ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12 }}>
                            <Image source={result.icon} style={{ width: 52, height: 52 }} resizeMode="contain" />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: C.gold, lineHeight: 24 }}>{result.title}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim, lineHeight: 17 }}>{result.text}</Text>
                            </View>
                        </View>
                    ) : phase === 'ad' ? (
                        <View style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.cream }}>Your ad is playing…</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim }}>{AD_IS_SIMULATED ? `Test ad · ${secs}s (real ads show on the phone build)` : 'Watch it to the end to earn the spin.'}</Text>
                        </View>
                    ) : note ? (
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.red, textAlign: 'center' }}>{note}</Text>
                    ) : (
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim, textAlign: 'center' }}>
                            {left > 0 || freeSpin ? 'Watch a short ad to spin. Prizes are perks in your life: waived EMIs and rent, loan write-offs, groceries, check-ups.' : 'No spins left today. Come back tomorrow!'}
                        </Text>
                    )}
                </View>

                <View style={{ position: 'absolute', left: PAD, right: PAD, bottom: TAB_STACK + 10 }}>
                    <TouchableOpacity onPress={start} disabled={!canSpin} activeOpacity={0.85}
                        style={{ height: 52, borderRadius: 8, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', opacity: canSpin ? 1 : 0.35 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#2a1c00', letterSpacing: 3 }}>
                            {phase === 'spinning' ? 'SPINNING…' : phase === 'ad' ? 'WATCHING…' : freeSpin ? 'FREE SPIN' : left > 0 ? 'WATCH AD · SPIN' : 'COME BACK TOMORROW'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
