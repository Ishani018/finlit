import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';

const WARN_IMG     = require('../../assets/ui_comp/warning.png');
const BULB_IMG     = require('../../assets/ui_comp/bulb.png');
const LIFESTYLE_IMG = require('../../assets/ui_comp/familyicon.png');
const DEFAULT_IMG  = require('../../assets/ui_comp/inbox.png');
const CUSTODY_IMG  = require('../../assets/ui_comp/custody.png');

const { width: SW, height: SH } = Dimensions.get('window');

const CATEGORY_COLORS = {
    opportunity: '#4ade80',
    dilemma:     '#fbbf24',
    lifestyle:   '#60a5fa',
    crisis:      '#f87171',
};

function getIcon(category) {
    if (category === 'dilemma' || category === 'crisis') return WARN_IMG;
    if (category === 'opportunity') return BULB_IMG;
    if (category === 'lifestyle') return LIFESTYLE_IMG;
    return DEFAULT_IMG;
}

// Shared choice button
function ChoiceButton({ choice, onPress }) {
    return (
        <TouchableOpacity
            onPress={() => onPress(choice)}
            activeOpacity={0.75}
            style={{
                paddingVertical: 14,
                paddingHorizontal: 16,
                backgroundColor: '#0d1020',
                borderRadius: 8,
            }}
        >
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#c8d4f0' }}>
                {choice.label}
            </Text>
        </TouchableOpacity>
    );
}

export default function ChoiceDialog({ event, onChoice }) {
    const slideAnim   = useRef(new Animated.Value(SH)).current;
    const scaleAnim   = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const isCustodyDilemma = event?.id?.startsWith('custody_dilemma') || event?.name === 'Custody Dilemma';

    useEffect(() => {
        if (event) {
            if (isCustodyDilemma) {
                Animated.parallel([
                    Animated.spring(scaleAnim,   { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
                    Animated.timing(opacityAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
                ]).start();
            } else {
                Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 60, useNativeDriver: true }).start();
            }
        } else {
            slideAnim.setValue(SH);
            scaleAnim.setValue(0.9);
            opacityAnim.setValue(0);
        }
    }, [event, isCustodyDilemma]);

    if (!event || !event.choices?.length) return null;

    const accentColor = CATEGORY_COLORS[event.category] || '#a78bfa';
    const iconImg     = getIcon(event.category);

    // ── Custody dilemma — centred modal ──────────────────────────────────────
    if (isCustodyDilemma) {
        return (
            <View style={{ position: 'absolute', inset: 0, zIndex: 600, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.82)' }} />
                <Animated.View style={{ width: Math.min(SW * 0.9, 360), transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
                    <View style={{ backgroundColor: '#08101e', borderRadius: 12, overflow: 'hidden' }}>
                        {/* Header */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, paddingBottom: 12 }}>
                            <Image source={WARN_IMG} style={{ width: 36, height: 36, opacity: 0.85 }} resizeMode="contain" />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: accentColor, letterSpacing: 3 }}>
                                    {event.category?.toUpperCase()} EVENT
                                </Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#c8d4f0', lineHeight: 26 }}>
                                    {event.name}
                                </Text>
                            </View>
                        </View>

                        {/* Image */}
                        <Image source={CUSTODY_IMG} style={{ width: '100%', height: 160 }} resizeMode="contain" />

                        {/* Message */}
                        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#6070a0', lineHeight: 22, textAlign: 'center' }}>
                                {event.message}
                            </Text>
                        </View>

                        {/* Divider */}
                        <View style={{ height: 1, backgroundColor: '#111828', marginHorizontal: 16, marginVertical: 12 }} />

                        {/* Choices */}
                        <View style={{ paddingHorizontal: 16, paddingBottom: 20, gap: 8 }}>
                            {event.choices.map((choice, i) => (
                                <ChoiceButton key={i} choice={choice} onPress={onChoice} />
                            ))}
                        </View>
                    </View>
                </Animated.View>
            </View>
        );
    }

    // ── Standard bottom sheet ─────────────────────────────────────────────────
    return (
        <View style={{ position: 'absolute', inset: 0, zIndex: 600, justifyContent: 'flex-end' }}>
            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)' }} />
            <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
                <View style={{ backgroundColor: '#08101e', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 36 }}>
                    {/* Drag handle */}
                    <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 6 }}>
                        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#1e2840' }} />
                    </View>

                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingBottom: 14 }}>
                        <Image source={iconImg} style={{ width: 40, height: 40 }} resizeMode="contain" />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: accentColor, letterSpacing: 3 }}>
                                {event.category?.toUpperCase()} EVENT
                            </Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', lineHeight: 28 }}>
                                {event.name}
                            </Text>
                        </View>
                    </View>

                    {/* Message */}
                    <View style={{ paddingHorizontal: 18, marginBottom: 18 }}>
                        {typeof event.message === 'string' ? (
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#6070a0', lineHeight: 22 }}>
                                {event.message}
                            </Text>
                        ) : event.message}
                    </View>

                    {/* Choices */}
                    <View style={{ paddingHorizontal: 18, gap: 8 }}>
                        {event.choices.map((choice, i) => (
                            <ChoiceButton key={i} choice={choice} onPress={onChoice} />
                        ))}
                    </View>
                </View>
            </Animated.View>
        </View>
    );
}
