import { useState, useRef, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, Image, TextInput, ScrollView,
    Animated, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { useGame } from '../context/GameContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { JOBS } from '../data/jobs';
import { SPRITE_MAP } from '../data/spriteMap';
import Corners from './Corners';

const { width: SW, height: SH } = Dimensions.get('window');
const PAD = 16;
const CARD_GAP = 10;
const CARD_W = Math.min(Math.floor((SW - PAD * 2 - CARD_GAP) / 2), 185);
const SPRITE_H = 158;

// ─── Sprites ─────────────────────────────────────────────────────────────────
const SPRITES = [
    { id: 'young_pia_1',     image: require('../../assets/sprites/young pia 1.png') },
    { id: 'young_raj_1',     image: require('../../assets/sprites/young raj 1.png') },
    { id: 'young_soms_1',    image: require('../../assets/sprites/young soms 1.png') },
    { id: 'young_soni_1',    image: require('../../assets/sprites/young soni 1.png') },
    { id: 'young_sia_1',     image: require('../../assets/sprites/young sia 1.png') },
    { id: 'young_rahul_1',   image: require('../../assets/sprites/young rahul 1.png') },
    { id: 'young_priya_1',   image: require('../../assets/sprites/young priya 1.png') },
    { id: 'young_kav_1',     image: require('../../assets/sprites/young kav 1.png') },
];

// ─── Trait icons from ui_comp ────────────────────────────────────────────────
const TRAIT_ICONS = {
    young_pia_1:     require('../../assets/ui_comp/investicon.png'),
    young_raj_1:     require('../../assets/ui_comp/career.png'),
    young_priya_1:   require('../../assets/ui_comp/education.png'),
    young_rahul_1:   require('../../assets/ui_comp/saveandearn.png'),
    young_sia_1:     require('../../assets/ui_comp/forsale.png'),
    young_soms_1:    require('../../assets/ui_comp/happyicon.png'),
    young_soni_1:    require('../../assets/ui_comp/familyicon.png'),
    young_kav_1:     require('../../assets/ui_comp/bulb.png'),
};

// ─── Character traits — each affects gameplay ─────────────────────────────────
const TRAITS = {
    young_pia_1:     { name: 'INVESTOR',   color: '#10b981', bg: '#052318', effect: '+8% mutual fund returns',    desc: 'Money makes money.' },
    young_raj_1:     { name: 'HUSTLER',    color: '#f59e0b', bg: '#1a0e00', effect: 'Salary grows 12% faster',   desc: 'Never stops grinding.' },
    young_priya_1:   { name: 'SCHOLAR',    color: '#818cf8', bg: '#0d0e28', effect: 'Education costs -25%',       desc: 'Knowledge is wealth.' },
    young_rahul_1:   { name: 'RISK TAKER', color: '#ef4444', bg: '#1a0505', effect: 'Stock gains x1.2',           desc: 'Go big or go home.' },
    young_sia_1:     { name: 'LANDLORD',   color: '#f97316', bg: '#1a0800', effect: 'Rental income +15%',         desc: 'Real estate royalty.' },
    young_soms_1:    { name: 'MINIMALIST', color: '#06b6d4', bg: '#021820', effect: 'Immune to inflation spikes', desc: 'Less is always more.' },
    young_soni_1:    { name: 'CAREGIVER',  color: '#ec4899', bg: '#1a0510', effect: 'Family costs -20%',          desc: 'Family first, always.' },
    young_kav_1:     { name: 'INFLUENCER', color: '#eab308', bg: '#1a1200', effect: 'More positive life events',  desc: 'The world loves you.' },
};


// ─── Entry / Splash ──────────────────────────────────────────────────────────
function EntryScreen({ onStart, hasSave, onResume }) {
    const blink = useRef(new Animated.Value(1)).current;
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(blink, { toValue: 0, duration: 520, useNativeDriver: true }),
                Animated.timing(blink, { toValue: 1, duration: 520, useNativeDriver: true }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#06080f', alignItems: 'center', justifyContent: 'center', paddingVertical: 36, paddingHorizontal: 40 }}>

            {/* Logo + title — centred */}
            <Animated.View style={{ transform: [{ scale: pulse }], marginBottom: 20, alignItems: 'center' }}>
                <Image source={require('../../assets/icon.png')} style={{ width: 120, height: 120, borderRadius: 22 }} resizeMode="contain" />
            </Animated.View>

            <View style={{ alignItems: 'center', marginBottom: 48 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 82, color: '#0b1228', letterSpacing: 6, position: 'absolute', top: 5, left: 5, lineHeight: 82 }}>FINLIT</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 82, color: '#172860', letterSpacing: 6, position: 'absolute', top: 2, left: 2, lineHeight: 82 }}>FINLIT</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 82, color: '#c8d4f0', letterSpacing: 6, lineHeight: 82 }}>FINLIT</Text>
            </View>

            {/* Icon strip */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 40 }}>
                <Image source={require('../../assets/ui_comp/investicon.png')} style={{ width: 18, height: 18, opacity: 0.45 }} resizeMode="contain" />
                <Image source={require('../../assets/ui_comp/career.png')} style={{ width: 18, height: 18, opacity: 0.45 }} resizeMode="contain" />
                <Image source={require('../../assets/ui_comp/home.png')} style={{ width: 18, height: 18, opacity: 0.45 }} resizeMode="contain" />
                <Image source={require('../../assets/ui_comp/familyicon.png')} style={{ width: 18, height: 18, opacity: 0.45 }} resizeMode="contain" />
                <Image source={require('../../assets/ui_comp/happyicon.png')} style={{ width: 18, height: 18, opacity: 0.45 }} resizeMode="contain" />
            </View>

            {/* Buttons */}
            <View style={{ width: '100%' }}>
                {hasSave ? (
                    <View style={{ width: '100%' }}>
                        <TouchableOpacity onPress={onResume} style={{ borderWidth: 1, borderColor: '#60a5fa', backgroundColor: '#1a2a50', paddingVertical: 14, alignItems: 'center', marginBottom: 12, position: 'relative' }}>
                            <Corners color="#60a5fa" size={5} />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#c8d4f0', letterSpacing: 4 }}>CONTINUE GAME</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onStart} style={{ borderWidth: 1, borderColor: '#1a2a50', backgroundColor: '#0a0f1e', paddingVertical: 12, alignItems: 'center', position: 'relative' }}>
                            <Corners color="#1e3060" size={5} />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#445070', letterSpacing: 4 }}>NEW GAME</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Animated.View style={{ opacity: blink, width: '100%' }}>
                        <TouchableOpacity onPress={onStart} style={{ borderWidth: 1, borderColor: '#1a2a50', paddingVertical: 12, alignItems: 'center', position: 'relative' }}>
                            <Corners color="#1e3060" size={5} />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#60a5fa', letterSpacing: 4 }}>
                                TAP TO BEGIN
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>
        </View>
    );
}

// ─── Age stages definition (shared) ─────────────────────────────────────────
const AGE_STAGES = [
    { label: 'YOUNG',  age: '18–24', suffix: '' },
    { label: 'RISING', age: '25–30', suffix: '_mid' },
    { label: 'PRIME',  age: '31–49', suffix: '_older' },
    { label: 'SENIOR', age: '50+',   suffix: '_senior' },
];

// Age-appropriate flavour text per trait — how the ability matures
const TRAIT_AGE_FLAVOUR = {
    young_pia_1:     ['Just learning to save',      'First SIP running',        'Compounding at full force', 'Wealth quietly multiplying'],
    young_raj_1:     ['Side hustles everywhere',    'Promotions accelerating',  'Peak earning years',        'Legacy income established'],
    young_priya_1:   ['Studying constantly',        'Certs paying off',         'Expert-level knowledge',    'Teaching what she mastered'],
    young_rahul_1:   ['All-in on speculative bets', 'Bigger swings, bigger wins','Portfolio dwarfs peers',   'Legendary risk appetite'],
    young_sia_1:     ['Renting out first room',     'Property #2 acquired',     'Rental empire growing',     'Passive income like salary'],
    young_soms_1:    ['Minimal needs, max savings', 'Immune to FOMO spending',  'Still lives below means',   'Retired early, stress-free'],
    young_soni_1:    ['Family comes first, always', 'Dependents thrive cheaper','Kids grow up secure',       'Generational care secured'],
    young_kav_1:     ['Every post goes viral',      'Collabs add side income',  'Influence converts to cash','Passive income from fame'],
};

// ─── Character detail page ────────────────────────────────────────────────────
function CharacterDetailView({ sprite, trait, childMode, onBack, onSelect }) {
    const flavour = TRAIT_AGE_FLAVOUR[sprite.id] || [];
    const heroH   = SH * 0.40;

    return (
        <View style={{ flex: 1, backgroundColor: '#06080f' }}>

            {/* ── HERO — spotlight effect ── */}
            <View style={{ height: heroH, backgroundColor: '#04060d', overflow: 'hidden' }}>
                {/* BACK button */}
                <TouchableOpacity
                    onPress={onBack}
                    activeOpacity={0.7}
                    style={{
                        position: 'absolute', top: 14, left: 14, zIndex: 10,
                        flexDirection: 'row', alignItems: 'center', gap: 6,
                        backgroundColor: 'rgba(4,6,14,0.72)',
                        borderWidth: 1, borderColor: '#1a2440',
                        paddingHorizontal: 10, paddingVertical: 5,
                    }}
                >
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070', letterSpacing: 2, lineHeight: 18 }}>◀  BACK</Text>
                </TouchableOpacity>


                <Image
                    source={sprite.image}
                    style={{ position: 'absolute', bottom: 0, alignSelf: 'center', width: SW * 0.50, height: heroH * 0.92 }}
                    resizeMode="contain"
                />
            </View>

            {/* ── SCROLLABLE REST ── */}
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 28 }}
            >
                {/* Trait strip */}
                {!childMode && (
                    <View style={{ paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderColor: '#0d1228', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        {TRAIT_ICONS[sprite.id] && (
                            <View style={{ width: 40, height: 40, backgroundColor: '#0a0d1a', borderWidth: 1, borderColor: '#1a2440', alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={TRAIT_ICONS[sprite.id]} style={{ width: 22, height: 22, opacity: 0.7 }} resizeMode="contain" />
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', letterSpacing: 2, lineHeight: 28 }}>{trait.name}</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#2a3860', lineHeight: 17 }}>{trait.desc}  ·  <Text style={{ color: '#4a5a80' }}>{trait.effect}</Text></Text>
                        </View>
                    </View>
                )}

                {/* Life path label */}
                <View style={{ paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Image source={require('../../assets/ui_comp/career.png')} style={{ width: 12, height: 12, opacity: 0.45 }} resizeMode="contain" />
                    <View style={{ flex: 1, height: 1, backgroundColor: '#0d1228' }} />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#1e2840', letterSpacing: 5 }}>{childMode ? 'GROWTH STAGES' : 'YOUR LIFE PATH'}</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: '#0d1228' }} />
                    <Image source={require('../../assets/ui_comp/career.png')} style={{ width: 12, height: 12, opacity: 0.45 }} resizeMode="contain" />
                </View>

                {/* Timeline horizontal scroll */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: PAD, paddingTop: 6, paddingBottom: 12, gap: 0, alignItems: 'flex-start' }}
                >
                    {AGE_STAGES.map((stage, i) => {
                        const variantKey = sprite.id + stage.suffix;
                        const img = SPRITE_MAP[variantKey] || (stage.suffix === '' ? sprite.image : null);
                        const has = !!img;
                        return (
                            <View key={stage.label} style={{ width: 90, alignItems: 'center', marginRight: 6 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 19, color: has ? trait.color : '#1e2840', lineHeight: 21, letterSpacing: 1 }}>
                                    {stage.age}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 4 }}>
                                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: has ? trait.color : '#1a2440' }} />
                                    {i < AGE_STAGES.length - 1 && (
                                        <View style={{ flex: 1, height: 1, backgroundColor: '#1a2440' }} />
                                    )}
                                </View>
                                <View style={{ opacity: has ? 1 : 0.18 }}>
                                    <Image source={has ? img : sprite.image} style={{ width: 76, height: 114 }} resizeMode="contain" />
                                </View>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: has ? '#c8d4f0' : '#1e2840', lineHeight: 14, marginTop: 4, textAlign: 'center', letterSpacing: 1 }}>
                                    {stage.label}
                                </Text>
                                {flavour[i] ? (
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: has ? '#3a4a6a' : '#111828', lineHeight: 12, textAlign: 'center', marginTop: 2 }}>
                                        {flavour[i]}
                                    </Text>
                                ) : null}
                            </View>
                        );
                    })}
                </ScrollView>

                {/* ── CHOOSE button ── */}
                <View style={{ paddingHorizontal: PAD, paddingTop: 10 }}>
                    <TouchableOpacity
                        onPress={onSelect}
                        activeOpacity={0.8}
                        style={{
                            backgroundColor: '#08101e',
                            borderWidth: 1,
                            borderColor: '#1a2440',
                            paddingVertical: 14,
                            alignItems: 'center',
                            position: 'relative',
                        }}
                    >
                        <Corners color="#2a3a5a" size={5} />
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0', letterSpacing: 3, lineHeight: 24 }}>
                            {childMode ? 'SELECT THIS LOOK  ▶' : 'BEGIN JOURNEY  ▶'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

// ─── Step 1: Browse characters ────────────────────────────────────────────────
function PickSpriteScreen({ selectedIdx, setSelectedIdx, onNext, childMode, childName }) {
    const [detailIdx, setDetailIdx] = useState(null);

    if (detailIdx !== null) {
        const sprite = SPRITES[detailIdx];
        return (
            <CharacterDetailView
                sprite={sprite}
                trait={TRAITS[sprite.id]}
                childMode={childMode}
                onBack={() => setDetailIdx(null)}
                onSelect={() => { setSelectedIdx(detailIdx); onNext(); }}
            />
        );
    }

    const rows = [];
    for (let i = 0; i < SPRITES.length; i += 2) rows.push(SPRITES.slice(i, i + 2));

    return (
        <View style={{ flex: 1, backgroundColor: '#06080f' }}>
            {/* Header */}
            <View style={{ alignItems: 'center', paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderColor: '#0a0f1e' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#1a2440', letterSpacing: 5 }}>FINLIT  v1.0</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#c8d4f0', letterSpacing: 2, lineHeight: 28, textAlign: 'center', paddingHorizontal: 20 }}>
                    {childMode ? `PICK A SPRITE TO REPRESENT ${childName ? childName.toUpperCase() : 'YOUR CHILD'}` : 'CHOOSE YOUR CLASS'}
                </Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#2a3a5a', letterSpacing: 1, marginTop: 4 }}>
                    Tap a character to see their full profile
                </Text>
            </View>

            {/* 2-column card grid */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 14 }}
                showsVerticalScrollIndicator={false}
            >
                {rows.map((row, rowIdx) => (
                    <View key={rowIdx} style={{ flexDirection: 'row', marginBottom: CARD_GAP }}>
                        {row.map((sprite, colIdx) => {
                            const idx   = rowIdx * 2 + colIdx;
                            const isSel = idx === selectedIdx;
                            const t     = TRAITS[sprite.id];
                            return (
                                <TouchableOpacity
                                    key={sprite.id}
                                    onPress={() => setDetailIdx(idx)}
                                    activeOpacity={0.85}
                                    style={{
                                        width: CARD_W,
                                        marginRight: colIdx === 0 ? CARD_GAP : 0,
                                        backgroundColor: isSel ? t.bg || '#0a0c18' : '#06080f',
                                        overflow: 'hidden', position: 'relative',
                                    }}
                                >
                                    {isSel && (
                                        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: t.color, zIndex: 5 }} />
                                    )}
                                    <View style={{ height: SPRITE_H, overflow: 'hidden', alignItems: 'center', paddingTop: 6 }}>
                                        <Image source={sprite.image} style={{ width: CARD_W, height: CARD_W * 1.75 }} resizeMode="contain" />
                                    </View>
                                    <View style={{ height: 1, backgroundColor: '#0d1228' }} />
                                    <View style={{ flex: 1, paddingHorizontal: 8, paddingTop: 6, paddingBottom: 8, justifyContent: 'center' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                            {!childMode && TRAIT_ICONS[sprite.id] && (
                                                <Image source={TRAIT_ICONS[sprite.id]} style={{ width: 13, height: 13, opacity: isSel ? 0.8 : 0.45 }} resizeMode="contain" />
                                            )}
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: isSel ? t.color : '#4a5580', letterSpacing: 1, lineHeight: 20 }}>
                                                {childMode ? 'SELECT' : t.name}
                                            </Text>
                                        </View>
                                        {!childMode && (
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: isSel ? '#a0b0d0' : '#222a40', lineHeight: 15, marginTop: 1 }}>
                                                {t.effect}
                                            </Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </ScrollView>

            {/* Footer hint */}
            <View style={{ paddingVertical: 10, alignItems: 'center', borderTopWidth: 1, borderColor: '#0a0f1e', backgroundColor: '#06080f' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#1a2440', letterSpacing: 2 }}>
                    TAP ANY CHARACTER TO VIEW FULL PROFILE
                </Text>
            </View>
        </View>
    );
}

// ─── Step 2: Enter name ───────────────────────────────────────────────────────
function NameScreen({ selectedIdx, onBack, onConfirm }) {
    const [nameInput, setNameInput] = useState('');
    const [bdayInput, setBdayInput] = useState('');
    const [nameError, setNameError] = useState('');
    const [bdayError, setBdayError] = useState('');

    const selected = SPRITES[selectedIdx];
    const heroH    = SH * 0.42;

    const handleStart = () => {
        const trimmedName = nameInput.trim();
        if (trimmedName.length < 2) { setNameError('Name must be at least 2 characters.'); return; }
        
        const trimmedBday = bdayInput.trim();
        const bdayRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        if (!bdayRegex.test(trimmedBday)) {
            setBdayError('Enter a valid birthday in DD/MM/YYYY format.');
            return;
        }

        onConfirm(trimmedName, trimmedBday);
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#06080f' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

            {/* ── HERO — full character visible ── */}
            <View style={{ height: heroH, backgroundColor: '#030407', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Image
                    source={selected.image}
                    style={{ width: SW * 0.52, height: heroH * 0.94 }}
                    resizeMode="contain"
                />
            </View>

            {/* ── FORM ── */}
            <View style={{ flex: 1, paddingHorizontal: PAD, paddingTop: 20, paddingBottom: 16 }}>

                {/* Label row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: '#0d1228' }} />
                    <Image source={require('../../assets/ui_comp/career.png')} style={{ width: 12, height: 12, opacity: 0.45 }} resizeMode="contain" />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 4 }}>WHO ARE YOU?</Text>
                    <Image source={require('../../assets/ui_comp/career.png')} style={{ width: 12, height: 12, opacity: 0.45 }} resizeMode="contain" />
                    <View style={{ flex: 1, height: 1, backgroundColor: '#0d1228' }} />
                </View>

                {/* Name input */}
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 3, marginBottom: 5 }}>YOUR NAME</Text>
                <TextInput
                    value={nameInput}
                    onChangeText={t => { setNameInput(t); setNameError(''); }}
                    placeholder="Enter your name..."
                    placeholderTextColor="#1e2a48"
                    style={{
                        fontFamily: 'VT323_400Regular', fontSize: 24, color: '#c8d4f0',
                        paddingVertical: 12, paddingHorizontal: 14,
                        borderLeftWidth: 3, borderLeftColor: nameError ? '#f87171' : '#3b82f6',
                        borderTopWidth: 0, borderRightWidth: 0, borderBottomWidth: 0,
                        backgroundColor: '#080d1a',
                        marginBottom: 4,
                    }}
                    underlineColorAndroid="transparent"
                    maxLength={20}
                    autoFocus
                    returnKeyType="done"
                />
                {nameError
                    ? <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#f87171', marginBottom: 10 }}>{nameError}</Text>
                    : <View style={{ height: 12 }} />
                }

                {/* DOB input */}
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 3, marginBottom: 5 }}>DATE OF BIRTH</Text>
                <TextInput
                    value={bdayInput}
                    onChangeText={t => { setBdayInput(t); setBdayError(''); }}
                    placeholder="DD / MM / YYYY"
                    placeholderTextColor="#1a2440"
                    style={{
                        fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0',
                        paddingVertical: 12, paddingHorizontal: 14,
                        borderLeftWidth: 3, borderLeftColor: bdayError ? '#f87171' : '#1a2840',
                        borderTopWidth: 0, borderRightWidth: 0, borderBottomWidth: 0,
                        backgroundColor: '#080d1a',
                        marginBottom: 4,
                    }}
                    underlineColorAndroid="transparent"
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                />
                {bdayError
                    ? <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#f87171', marginBottom: 10 }}>{bdayError}</Text>
                    : <View style={{ height: 20 }} />
                }

                {/* Buttons */}
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'stretch' }}>
                    <TouchableOpacity
                        onPress={onBack}
                        style={{ paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#080d1a' }}
                    >
                        <Image source={require('../../assets/ui_comp/nextbutton.png')} style={{ width: 20, height: 20, transform: [{ scaleX: -1 }], opacity: 0.4 }} resizeMode="contain" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleStart}
                        activeOpacity={0.85}
                        style={{ flex: 1, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#080d1a', position: 'relative' }}
                    >
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0', letterSpacing: 3, lineHeight: 24 }}>BEGIN</Text>
                        <Image source={require('../../assets/ui_comp/nextbutton.png')} style={{ width: 22, height: 22 }} resizeMode="contain" />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
// Starting job per sprite — flavourful but all Tier 1 (no requirements)
const STARTER_JOBS = {
    young_pia_1:     'home_baker',
    young_raj_1:     'code_debugger',
    young_priya_1:   'music_teacher',
    young_rahul_1:   'streamer',
    young_sia_1:     'photographer',
    young_soms_1:    'govt_job',
    young_soni_1:    'backup_singer',
    young_kav_1:     'yoga_teacher',
};

export default function SpriteSelectionScreen({ childMode = false, childName = '', hasSave = false, onResume, onStart }) {
    const { setPlayerSprite, setPlayerName, setPlayerBirthday, applyForJob, startNextGeneration, resetGame } = useGame();
    const [step, setStep]           = useState(childMode ? 1 : 0);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const soundRef = useRef(null);

    // Music starts immediately when this screen mounts (first thing user sees)
    useEffect(() => {
        (async () => {
            try {
                await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
                const { sound } = await Audio.Sound.createAsync(
                    require('../../assets/music/Digital_Dawn.mp3'),
                    { isLooping: true, volume: 0.5 }
                );
                soundRef.current = sound;
                await sound.playAsync();
            } catch (_) {}
        })();
        return () => { if (soundRef.current) soundRef.current.unloadAsync(); };
    }, []);

    const handleConfirm = (name, bday) => {
        if (soundRef.current) soundRef.current.stopAsync();
        
        if (childMode) {
            startNextGeneration(selectedIdx);
            if (onStart) onStart();
            return;
        }

        const spriteId = SPRITES[selectedIdx].id;
        setPlayerName(name);
        setPlayerSprite(spriteId);
        if (bday) setPlayerBirthday(bday);
        const starterJobId = STARTER_JOBS[spriteId];
        if (starterJobId) {
            const job = JOBS.find(j => j.id === starterJobId);
            if (job) applyForJob(job);
        }
        if (onStart) onStart();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#06080f' }}>
            {step === 0 && <EntryScreen onStart={() => { if (!childMode) resetGame(); setStep(1); }} hasSave={hasSave} onResume={onResume} />}
            {step === 1 && (
                <PickSpriteScreen
                    selectedIdx={selectedIdx}
                    setSelectedIdx={setSelectedIdx}
                    onNext={() => setStep(2)}
                    childMode={childMode}
                    childName={childName}
                />
            )}
            {step === 2 && (
                <NameScreen
                    selectedIdx={selectedIdx}
                    onBack={() => setStep(1)}
                    onConfirm={handleConfirm}
                />
            )}
        </SafeAreaView>
    );
}
