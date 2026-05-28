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
const HAPPY_ICON  = require('../../assets/ui_comp/happyicon.png');
const HEALTH_ICON = require('../../assets/ui_comp/healthicon.png');

const getChoiceImage = (choice, event) => {
    if (event.isBaby) return event.image;
    if (event.isHospital) return HOSPITAL_IMG;
    const l = choice.label.toLowerCase();
    if (l.includes('quiet') || l.includes('dinner')) return QUIET_IMG;
    if (l.includes('house party') || l.includes('big house')) return PARTY_IMG;
    if (l.includes('lavish')) return LAVISH_IMG;
    if (l.includes('broke')) return BROKE_IMG;
    return WARN_IMG;
};

export default function BirthdayDialog({ event, onChoice }) {
    const { width: W } = useWindowDimensions();

    // Cap modal at 340px so it never overflows on web
    const MODAL_W = Math.min(W * 0.86, 340);
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
    
    let cakeImage = BDAY_CAKE;
    if (event.isHospital) cakeImage = WARN_IMG;
    else if (event.isBaby) cakeImage = WARN_IMG;
    else if (event.dependentType === 'spouse') cakeImage = SPOUSE_CAKE;
    else if (event.dependentType === 'child') cakeImage = CHILD_CAKE;

    const ACCENT = event.isHospital ? '#f87171' : (isDependent ? '#a855f7' : '#ec4899');
    const TEXT_PRIMARY = event.isHospital ? '#fecaca' : (isDependent ? '#e9d5ff' : '#fbcfe8');
    const TEXT_SECONDARY = event.isHospital ? '#fca5a5' : (isDependent ? '#c084fc' : '#f472b6');

    const snapToCard = (i) => {
        setActiveIndex(i);
        scrollRef.current?.scrollTo({ x: i * (CARD_W + 10), animated: true });
    };
    


    return (
        // Absolute overlay — stays within the game view like ChoiceDialog
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, justifyContent: 'center', alignItems: 'center' }}>
            {/* Semi-transparent backdrop (same opacity as ChoiceDialog) */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)' }} />

            {/* Popup */}
            <Animated.View style={{
                width: MODAL_W,
                backgroundColor: '#06080f',
                borderRadius: 14,
                borderWidth: 2,
                borderColor: '#1a2040',
                overflow: 'hidden',
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
            }}>
                {/* ── Header: cake + title in a row ── */}
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0a0d1a', paddingHorizontal: 12, paddingVertical: 10, gap: 10 }}>
                    <Image source={cakeImage} style={{ width: 68, height: 68 }} resizeMode="contain" />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: TEXT_PRIMARY, letterSpacing: 1 }}>
                            {event.name}
                        </Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: TEXT_SECONDARY }}>
                            {event.message}
                        </Text>
                    </View>
                </View>

                <View style={{ height: 2, backgroundColor: ACCENT + '60' }} />

                {/* ── Dots + label ── */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingTop: 8, paddingBottom: 4 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#556080', letterSpacing: 3 }}>
                        SWIPE TO CHOOSE
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 5 }}>
                        {choices.map((c, i) => (
                            <TouchableOpacity key={i} onPress={() => snapToCard(i)}>
                                <View style={{
                                    width: i === activeIndex ? 16 : 6, height: 6,
                                    borderRadius: 3,
                                    backgroundColor: i === activeIndex ? (c.color || ACCENT) : '#334155',
                                }} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ── Swipeable cards ── */}
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    snapToInterval={CARD_W + 10}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 14, gap: 10, paddingBottom: 6 }}
                    onMomentumScrollEnd={(e) => {
                        const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_W + 10));
                        setActiveIndex(Math.max(0, Math.min(idx, choices.length - 1)));
                    }}
                >
                    {choices.map((choice, index) => {
                        const eff = choice.effect;
                        const img = getChoiceImage(choice, event);
                        const isActive = index === activeIndex;

                        return (
                            <View key={index} style={{
                                width: CARD_W,
                                borderRadius: 10,
                                overflow: 'hidden',
                                borderWidth: 1.5,
                                borderColor: isActive ? '#334155' : '#1a2040',
                                backgroundColor: '#0c1020',
                            }}>
                                {/* Room scene — taller so the full room is visible */}
                                <Image
                                    source={img}
                                    style={{ width: CARD_W, height: 280 }}
                                    resizeMode="cover"
                                />
                                <View style={{ height: 2, backgroundColor: choice.color }} />

                                {/* Card body */}
                                <View style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#e2e8f0' }}>
                                            {choice.label}
                                        </Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#f87171' }}>
                                            {eff.amount > 0 ? `₹${eff.amount.toLocaleString()}` : 'Free'}
                                        </Text>
                                    </View>

                                    {/* Stat chips */}
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                                        {eff.happiness !== undefined && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#111827', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 }}>
                                                <Image source={HAPPY_ICON} style={{ width: 10, height: 10 }} resizeMode="contain" />
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: eff.happiness >= 0 ? '#86efac' : '#f87171' }}>
                                                    {eff.happiness > 0 ? '+' : ''}{eff.happiness}
                                                </Text>
                                            </View>
                                        )}
                                        {eff.health !== undefined && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#111827', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 }}>
                                                <Image source={HEALTH_ICON} style={{ width: 10, height: 10 }} resizeMode="contain" />
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: eff.health >= 0 ? '#86efac' : '#f87171' }}>
                                                    {eff.health > 0 ? '+' : ''}{eff.health} HP
                                                </Text>
                                            </View>
                                        )}
                                        {eff.salaryBonusPct > 0 && (
                                            <View style={{ backgroundColor: '#111827', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#fbbf24' }}>
                                                    +{(eff.salaryBonusPct * 100).toFixed(0)}% Salary
                                                </Text>
                                            </View>
                                        )}
                                        {eff.creditScore > 0 && (
                                            <View style={{ backgroundColor: '#111827', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#fbbf24' }}>
                                                    +{eff.creditScore} CIBIL
                                                </Text>
                                            </View>
                                        )}
                                        {eff.spouseIncomeBoost > 0 && (
                                            <View style={{ backgroundColor: '#111827', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#fbbf24' }}>
                                                    +{(eff.spouseIncomeBoost * 100).toFixed(0)}% Spouse
                                                </Text>
                                            </View>
                                        )}
                                        {eff.childSavingsBoost > 0 && (
                                            <View style={{ backgroundColor: '#111827', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#fbbf24' }}>
                                                    +₹{eff.childSavingsBoost.toLocaleString()} savings
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>

                {/* ── Confirm button ── */}
                <View style={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 16 }}>
                    <TouchableOpacity
                        onPress={() => onChoice(choices[activeIndex])}
                        activeOpacity={0.8}
                        style={{
                            backgroundColor: choices[activeIndex]?.color || ACCENT,
                            borderRadius: 8,
                            paddingVertical: 12,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#06080f', letterSpacing: 2 }}>
                            {event.isHospital ? 'CONFIRM' : 'CELEBRATE'} — {choices[activeIndex]?.label?.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}
