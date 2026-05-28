import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const WARN_IMG = require('../../assets/ui_comp/warning.png');
const BULB_IMG = require('../../assets/ui_comp/bulb.png');
const LIFESTYLE_IMG = require('../../assets/ui_comp/familyicon.png');
const DEFAULT_IMG = require('../../assets/ui_comp/inbox.png');
const CUSTODY_IMG = require('../../assets/ui_comp/custody.png');

const { width: SW, height: SH } = Dimensions.get('window');

const Corners = ({ color }) => (
    <>
        <View style={{ position: 'absolute', top: 0, left: 0, width: 6, height: 6, backgroundColor: color }} />
        <View style={{ position: 'absolute', top: 0, right: 0, width: 6, height: 6, backgroundColor: color }} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, width: 6, height: 6, backgroundColor: color }} />
        <View style={{ position: 'absolute', bottom: 0, right: 0, width: 6, height: 6, backgroundColor: color }} />
    </>
);

export default function ChoiceDialog({ event, onChoice }) {
    const slideAnim = useRef(new Animated.Value(SH)).current;
    const scaleAnim = useRef(new Animated.Value(0.88)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const isCustodyDilemma = event?.id?.startsWith('custody_dilemma') || event?.name === 'Custody Dilemma';

    useEffect(() => {
        if (event) {
            if (isCustodyDilemma) {
                Animated.parallel([
                    Animated.spring(scaleAnim, {
                        toValue: 1, friction: 8, tension: 50, useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 1, duration: 250, useNativeDriver: true,
                    })
                ]).start();
            } else {
                Animated.spring(slideAnim, {
                    toValue: 0, friction: 9, tension: 60, useNativeDriver: true,
                }).start();
            }
        } else {
            slideAnim.setValue(SH);
            scaleAnim.setValue(0.88);
            opacityAnim.setValue(0);
        }
    }, [event, isCustodyDilemma]);

    if (!event) return null;
    if (!event.choices || event.choices.length === 0) return null;

    const categoryColors = {
        opportunity: '#4ade80',
        dilemma:     '#fbbf24',
        lifestyle:   '#60a5fa',
        crisis:      '#f87171',
    };
    const categoryIcons = {
        opportunity: 'lightbulb',
        dilemma:     'exclamation-triangle',
        lifestyle:   'user',
        crisis:      'bolt',
    };
    const accentColor = categoryColors[event.category] || '#a78bfa';
    const catIcon = categoryIcons[event.category] || 'star';

    if (isCustodyDilemma) {
        const MODAL_W = Math.min(SW * 0.9, 360);
        return (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 600, justifyContent: 'center', alignItems: 'center' }}>
                {/* Backdrop */}
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)' }} />

                <Animated.View style={{
                    width: MODAL_W,
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                }}>
                    <View style={{
                        backgroundColor: '#06080f',
                        borderWidth: 2,
                        borderColor: accentColor,
                        borderRadius: 12,
                        padding: 20,
                        position: 'relative',
                        shadowColor: accentColor,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.5,
                        shadowRadius: 10,
                        elevation: 10,
                    }}>
                        <Corners color={accentColor} />

                        {/* Title Row */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <View style={{ width: 40, height: 40, backgroundColor: accentColor + '15', borderWidth: 1, borderColor: accentColor + '60', alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={WARN_IMG} style={{ width: 24, height: 24 }} resizeMode="contain" />
                            </View>
                            <View>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: accentColor, letterSpacing: 3 }}>
                                    {event.category?.toUpperCase()} EVENT
                                </Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', letterSpacing: 1 }}>
                                    {event.name}
                                </Text>
                            </View>
                        </View>

                        {/* Retro Custody Illustration */}
                        <View style={{
                            borderWidth: 1.5,
                            borderColor: '#1e2840',
                            backgroundColor: '#030508',
                            padding: 6,
                            marginBottom: 14,
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                        }}>
                            <Corners color="#1e2840" />
                            <Image source={CUSTODY_IMG} style={{ width: '100%', height: 160 }} resizeMode="contain" />
                        </View>

                        {/* Message Description */}
                        <View style={{ borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#0a0d1a', padding: 14, marginBottom: 16, position: 'relative' }}>
                            <Corners color={accentColor + '80'} />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#a8b8d8', lineHeight: 22, textAlign: 'center' }}>
                                {event.message}
                            </Text>
                        </View>

                        {/* Choices */}
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#556080', letterSpacing: 3, marginBottom: 10, textAlign: 'center' }}>
                            WHAT DO YOU DO?
                        </Text>
                        <View style={{ gap: 10 }}>
                            {event.choices.map((choice, i) => (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => onChoice(choice)}
                                    style={{
                                        padding: 14,
                                        borderWidth: 1.5,
                                        borderColor: choice.color + '80',
                                        backgroundColor: choice.color + '0d',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 12,
                                        position: 'relative',
                                        borderRadius: 6,
                                    }}
                                    activeOpacity={0.75}
                                >
                                    <Corners color={choice.color} />
                                    <View style={{ width: 24, height: 24, borderWidth: 1, borderColor: choice.color + '80', alignItems: 'center', justifyContent: 'center', backgroundColor: choice.color + '15' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: choice.color }}>
                                            {String.fromCharCode(65 + i)}
                                        </Text>
                                    </View>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: choice.color, flex: 1, letterSpacing: 1 }}>
                                        {choice.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 600, justifyContent: 'flex-end' }}>
            {/* Backdrop */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)' }} />

            <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
                <View style={{ backgroundColor: '#06080f', borderTopWidth: 2, borderColor: accentColor, padding: 20, paddingBottom: 36 }}>
                    {/* Category label */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <View style={{ width: 40, height: 40, backgroundColor: accentColor + '15', borderWidth: 1, borderColor: accentColor + '60', alignItems: 'center', justifyContent: 'center' }}>
                            {event.category === 'dilemma' || event.category === 'crisis'
                                ? <Image source={WARN_IMG} style={{ width: 24, height: 24 }} resizeMode="contain" />
                                : event.category === 'opportunity'
                                ? <Image source={BULB_IMG} style={{ width: 24, height: 24 }} resizeMode="contain" />
                                : event.category === 'lifestyle'
                                ? <Image source={LIFESTYLE_IMG} style={{ width: 24, height: 24 }} resizeMode="contain" />
                                : <Image source={DEFAULT_IMG} style={{ width: 24, height: 24 }} resizeMode="contain" />
                            }
                        </View>
                        <View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: accentColor, letterSpacing: 3 }}>
                                {event.category?.toUpperCase()} EVENT
                            </Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#c8d4f0', letterSpacing: 1 }}>
                                {event.name}
                            </Text>
                        </View>
                    </View>

                    {/* Message */}
                    <View style={{ borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#0a0d1a', padding: 14, marginBottom: 18, position: 'relative' }}>
                        <Corners color={accentColor + '80'} />
                        {typeof event.message === 'string' ? (
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#a8b8d8', lineHeight: 24 }}>
                                {event.message}
                            </Text>
                        ) : (
                            event.message
                        )}
                    </View>

                    {/* Choices */}
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#556080', letterSpacing: 3, marginBottom: 10 }}>
                        WHAT DO YOU DO?
                    </Text>
                    <View style={{ gap: 8 }}>
                        {event.choices.map((choice, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => onChoice(choice)}
                                style={{
                                    padding: 14,
                                    borderWidth: 1,
                                    borderColor: choice.color + '60',
                                    backgroundColor: choice.color + '0d',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 12,
                                    position: 'relative',
                                }}
                                activeOpacity={0.75}
                            >
                                <Corners color={choice.color} />
                                <View style={{ width: 24, height: 24, borderWidth: 1, borderColor: choice.color + '80', alignItems: 'center', justifyContent: 'center', backgroundColor: choice.color + '15' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: choice.color }}>
                                        {String.fromCharCode(65 + i)}
                                    </Text>
                                </View>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: choice.color, flex: 1, letterSpacing: 1 }}>
                                    {choice.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Animated.View>
        </View>
    );
}
