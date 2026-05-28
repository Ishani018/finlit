import { useRef, useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, Animated,
    Image, ScrollView, useWindowDimensions,
} from 'react-native';

const BDAY_CAKE   = require('../../assets/ui_comp/birthday_cake.png');
const SPOUSE_CAKE = require('../../assets/ui_comp/spouse_birthday.png');
const CHILD_CAKE  = require('../../assets/ui_comp/children_birthday_cake.png');
const HOSPITAL_IMG = require('../../assets/ui_comp/hospital.png');
const QUIET_IMG   = require('../../assets/ui_comp/quiet dinner.png');
const PARTY_IMG   = require('../../assets/ui_comp/house party birthday.png');
const LAVISH_IMG  = require('../../assets/ui_comp/lavish birthday bash.png');
const BROKE_IMG   = require('../../assets/ui_comp/brokebirthday.png');
const WARN_IMG    = require('../../assets/ui_comp/warning.png');

const getChoiceImage = (choice, event) => {
    if (!choice || !choice.label) return WARN_IMG;
    if (event.isBaby) return event.image;
    if (event.isHospital) return HOSPITAL_IMG;
    const l = choice.label.toLowerCase();
    if (l.includes('quiet') || l.includes('dinner')) return QUIET_IMG;
    if (l.includes('house party') || l.includes('big house')) return PARTY_IMG;
    if (l.includes('lavish')) return LAVISH_IMG;
    if (l.includes('broke') || l.includes('skip')) return BROKE_IMG;
    return WARN_IMG;
};

export default function BirthdayDialog({ event, onChoice }) {
    const { width: W } = useWindowDimensions();

    const MODAL_W = Math.min(W * 0.92, 380);
    const CARD_W  = MODAL_W - 28;

    const scaleAnim   = useRef(new Animated.Value(0.88)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (event) {
            setActiveIndex(0);
            Animated.parallel([
                Animated.spring(scaleAnim,   { toValue: 1, friction: 7, tension: 55, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
            setTimeout(() => scrollRef.current?.scrollTo({ x: 0, animated: false }), 50);
        } else {
            scaleAnim.setValue(0.88);
            opacityAnim.setValue(0);
        }
    }, [event]);

    if (!event) return null;

    const choices = event.choices || [];
    const isDependent = event.name.includes(',');
    const multiChoice = choices.length > 1;

    let cakeImage = BDAY_CAKE;
    if (event.isHospital) cakeImage = WARN_IMG;
    else if (event.isBaby) cakeImage = WARN_IMG;
    else if (event.dependentType === 'spouse') cakeImage = SPOUSE_CAKE;
    else if (event.dependentType === 'child') cakeImage = CHILD_CAKE;

    const ACCENT = event.isHospital ? '#f87171' : (isDependent ? '#a855f7' : '#ec4899');
    const TEXT_PRIMARY = event.isHospital ? '#fecaca' : (isDependent ? '#e9d5ff' : '#fbcfe8');

    const snapToCard = (i) => {
        setActiveIndex(i);
        scrollRef.current?.scrollTo({ x: i * (CARD_W + 10), animated: true });
    };


    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 600, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.78)' }} />

            <Animated.View style={{ width: MODAL_W, backgroundColor: '#07090f', borderRadius: 12, overflow: 'hidden', transform: [{ scale: scaleAnim }], opacity: opacityAnim, shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 12 }}>

                {/* ── Header ── */}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, gap: 12 }}>
                    <Image source={cakeImage} style={{ width: 48, height: 48 }} resizeMode="contain" />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: TEXT_PRIMARY, lineHeight: 24 }}>
                            {event.name}
                        </Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070', lineHeight: 17, marginTop: 2 }}>
                            {event.message}
                        </Text>
                        {event.isHospital && event.bill != null && (
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#f87171', lineHeight: 26, marginTop: 4 }}>
                                ₹{event.bill.toLocaleString()} bill
                            </Text>
                        )}
                    </View>
                </View>

                {/* ── Card carousel ── */}
                <View style={{ position: 'relative' }}>
                    <ScrollView
                        ref={scrollRef}
                        horizontal
                        snapToInterval={CARD_W + 10}
                        snapToAlignment="start"
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        scrollEnabled={multiChoice}
                        contentContainerStyle={{ paddingHorizontal: 14, gap: 10, paddingBottom: 8, paddingTop: 2 }}
                        onMomentumScrollEnd={(e) => {
                            const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_W + 10));
                            setActiveIndex(Math.max(0, Math.min(idx, choices.length - 1)));
                        }}
                    >
                        {choices.map((choice, index) => {
                            const img = getChoiceImage(choice, event);
                            const eff2 = choice.effect;
                            const active = index === activeIndex;

                            // Build stat strings inline — no pill badges
                            const stats = [];
                            if (eff2.happiness !== undefined) stats.push({ label: eff2.happiness > 0 ? `+${eff2.happiness} 😊` : `${eff2.happiness} 😊`, positive: eff2.happiness >= 0 });
                            if (eff2.health !== undefined) stats.push({ label: eff2.health > 0 ? `+${eff2.health} HP` : `${eff2.health} HP`, positive: eff2.health >= 0 });
                            if (eff2.salaryBonusPct > 0) stats.push({ label: `+${(eff2.salaryBonusPct * 100).toFixed(0)}% salary`, positive: true });
                            if (eff2.creditScore > 0) stats.push({ label: `+${eff2.creditScore} CIBIL`, positive: true });
                            if (eff2.spouseIncomeBoost > 0) stats.push({ label: `+${(eff2.spouseIncomeBoost * 100).toFixed(0)}% spouse`, positive: true });
                            if (eff2.childSavingsBoost > 0) stats.push({ label: `+₹${eff2.childSavingsBoost.toLocaleString()} savings`, positive: true });

                            return (
                                <View key={index} style={{ width: CARD_W, borderRadius: 8, overflow: 'hidden', opacity: active ? 1 : 0.5 }}>
                                    <View style={{ height: 300, position: 'relative' }}>
                                        <Image source={img} style={{ width: CARD_W, height: 300 }} resizeMode="cover" />
                                        {/* Gradient scrim — no hard border */}
                                        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, backgroundColor: 'rgba(5,7,12,0.0)' }} pointerEvents="none" />
                                        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 14, paddingBottom: 12, paddingTop: 40, backgroundColor: 'rgba(5,7,14,0.78)' }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 21, color: '#d0daf0', flex: 1 }}>{choice.label}</Text>
                                                {!event.isHospital && (
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: eff2.amount > 0 ? '#f87171' : '#4ade80', marginLeft: 8 }}>
                                                        {eff2.amount > 0 ? `-₹${eff2.amount.toLocaleString()}` : 'Free'}
                                                    </Text>
                                                )}
                                            </View>
                                            {stats.length > 0 && (
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#556080', marginTop: 1 }}>
                                                    {stats.map(s => s.label).join('  ·  ')}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>

                    {multiChoice && activeIndex > 0 && (
                        <View style={{ position: 'absolute', left: 4, top: 0, bottom: 0, justifyContent: 'center', pointerEvents: 'box-none' }}>
                            <TouchableOpacity onPress={() => snapToCard(activeIndex - 1)}
                                style={{ width: 32, height: 48, backgroundColor: 'rgba(6,8,15,0.75)', borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#8090b8' }}>◀</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {multiChoice && activeIndex < choices.length - 1 && (
                        <View style={{ position: 'absolute', right: 4, top: 0, bottom: 0, justifyContent: 'center', pointerEvents: 'box-none' }}>
                            <TouchableOpacity onPress={() => snapToCard(activeIndex + 1)}
                                style={{ width: 32, height: 48, backgroundColor: 'rgba(6,8,15,0.75)', borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#8090b8' }}>▶</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* ── Dot indicators ── */}
                {multiChoice && (
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 8 }}>
                        {choices.map((c, i) => (
                            <TouchableOpacity key={i} onPress={() => snapToCard(i)} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
                                <View style={{ width: i === activeIndex ? 18 : 6, height: 4, borderRadius: 2, backgroundColor: i === activeIndex ? (c.color || ACCENT) : '#1e2840' }} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* ── Confirm button ── */}
                <View style={{ paddingHorizontal: 14, paddingBottom: 16, paddingTop: multiChoice ? 0 : 8 }}>
                    <TouchableOpacity
                        onPress={() => onChoice(choices[activeIndex])}
                        activeOpacity={0.8}
                        style={{ backgroundColor: choices[activeIndex]?.color || ACCENT, borderRadius: 8, paddingVertical: 13, alignItems: 'center' }}
                    >
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#06080f', letterSpacing: 2 }}>
                            {choices[activeIndex]?.label?.toUpperCase()} ▶
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}
