import { useState, useRef, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, Image, TextInput, ScrollView,
    Animated, Easing, Dimensions, KeyboardAvoidingView, Platform,
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
const CARD_H = 220;
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
    { id: 'young_sara_1',    image: require('../../assets/sprites/young sara 1.png') },
];

// ─── Character traits — each affects gameplay ─────────────────────────────────
const TRAITS = {
    young_pia_1:     { name: 'INVESTOR',   color: '#10b981', bg: '#052318', effect: '+8% mutual fund returns',    desc: 'Money makes money.' },
    young_raj_1:     { name: 'HUSTLER',    color: '#f59e0b', bg: '#1a0e00', effect: 'Salary grows 12% faster',   desc: 'Never stops grinding.' },
    young_priya_1:   { name: 'SCHOLAR',    color: '#818cf8', bg: '#0d0e28', effect: 'Education costs -25%',       desc: 'Knowledge is wealth.' },
    young_rahul_1:   { name: 'RISK TAKER', color: '#ef4444', bg: '#1a0505', effect: 'Stock gains x1.2',           desc: 'Go big or go home.' },
    young_sara_1:    { name: 'LUCKY',      color: '#a855f7', bg: '#120820', effect: 'Crisis chance -25%',         desc: 'Fortune favours the bold.' },
    young_sia_1:     { name: 'LANDLORD',   color: '#f97316', bg: '#1a0800', effect: 'Rental income +15%',         desc: 'Real estate royalty.' },
    young_soms_1:    { name: 'MINIMALIST', color: '#06b6d4', bg: '#021820', effect: 'Immune to inflation spikes', desc: 'Less is always more.' },
    young_soni_1:    { name: 'CAREGIVER',  color: '#ec4899', bg: '#1a0510', effect: 'Family costs -20%',          desc: 'Family first, always.' },
    young_kav_1:     { name: 'INFLUENCER', color: '#eab308', bg: '#1a1200', effect: 'More positive life events',  desc: 'The world loves you.' },
};


// ─── Carousel constants ───────────────────────────────────────────────────────
const CHAR_W = 58;
const CHAR_H = 110;
const CHAR_GAP = 22;
const CHAR_STEP = CHAR_W + CHAR_GAP;
const PARADE_W = SPRITES.length * CHAR_STEP;
const PARADE_SPRITES = [...SPRITES, ...SPRITES, ...SPRITES];

// ─── Entry / Splash ──────────────────────────────────────────────────────────
function EntryScreen({ onStart }) {
    const blink   = useRef(new Animated.Value(1)).current;
    const scrollX = useRef(new Animated.Value(-PARADE_W)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(blink, { toValue: 0, duration: 520, useNativeDriver: true }),
                Animated.timing(blink, { toValue: 1, duration: 520, useNativeDriver: true }),
            ])
        ).start();

        const runScroll = () => {
            scrollX.setValue(-PARADE_W);
            Animated.timing(scrollX, {
                toValue: -2 * PARADE_W, duration: 22000,
                easing: Easing.linear, useNativeDriver: true,
            }).start(({ finished }) => { if (finished) runScroll(); });
        };
        runScroll();

    }, []);

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={onStart}
            style={{ flex: 1, backgroundColor: '#06080f', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 36 }}
        >
            <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#151e34', letterSpacing: 5 }}>
                    ━━━━━━━━━━━━━━━━━━━━━
                </Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#1a2440', letterSpacing: 3, marginTop: 3 }}>
                    FINANCIAL LIFE SIMULATOR  v1.0
                </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#151e34', letterSpacing: 8, marginBottom: 2 }}>
                    ▓▓▒▒░░ PRESENTS ░░▒▒▓▓
                </Text>
                <View style={{ alignItems: 'center', height: 88 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 82, color: '#0b1228', letterSpacing: 6, position: 'absolute', top: 5, left: 5, lineHeight: 82 }}>FINLIT</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 82, color: '#172860', letterSpacing: 6, position: 'absolute', top: 2, left: 2, lineHeight: 82 }}>FINLIT</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 82, color: '#c8d4f0', letterSpacing: 6, lineHeight: 82 }}>FINLIT</Text>
                </View>
                <View style={{ height: 1, width: 200, backgroundColor: '#111c34', marginTop: 8, marginBottom: 10 }} />
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#2a4070', letterSpacing: 2, textAlign: 'center' }}>
                    BUILD YOUR WEALTH  •  SHAPE YOUR LIFE
                </Text>
            </View>

            {/* Character parade */}
            <View style={{ width: SW, height: CHAR_H + 26, overflow: 'hidden', paddingTop: 14 }}>
                <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 48, zIndex: 2,
                    shadowColor: '#06080f', shadowOffset: { width: 24, height: 0 }, shadowOpacity: 1, shadowRadius: 24 }} />
                <View pointerEvents="none" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 48, zIndex: 2,
                    shadowColor: '#06080f', shadowOffset: { width: -24, height: 0 }, shadowOpacity: 1, shadowRadius: 24 }} />
                <Animated.View style={{ flexDirection: 'row', alignItems: 'flex-end', transform: [{ translateX: scrollX }], paddingBottom: 4 }}>
                    {PARADE_SPRITES.map((sprite, idx) => (
                        <Image
                            key={`${sprite.id}_${idx}`}
                            source={sprite.image}
                            style={{ width: CHAR_W, height: CHAR_H, marginRight: CHAR_GAP }}
                            resizeMode="contain"
                        />
                    ))}
                </Animated.View>
            </View>

            <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#1a2840', letterSpacing: 2 }}>
                    INVEST  •  EARN  •  RETIRE RICH
                </Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#111828', letterSpacing: 2, marginTop: 2 }}>
                    Age 18 → 75  |  A Lifetime of Decisions
                </Text>
            </View>

            <Animated.View style={{ opacity: blink, alignItems: 'center' }}>
                <View style={{ borderWidth: 1, borderColor: '#1a2a50', paddingHorizontal: 28, paddingVertical: 10, position: 'relative' }}>
                    <Corners color="#1e3060" size={5} />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#60a5fa', letterSpacing: 4 }}>
                        TAP TO BEGIN
                    </Text>
                </View>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#111828', marginTop: 6, letterSpacing: 2 }}>
                    © FINLIT 2024  •  Educational Game
                </Text>
            </Animated.View>
        </TouchableOpacity>
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
    young_sara_1:    ['Lucky breaks early on',      'Dodging crises somehow',   'Charmed financial life',    'Fortune still favouring her'],
    young_sia_1:     ['Renting out first room',     'Property #2 acquired',     'Rental empire growing',     'Passive income like salary'],
    young_soms_1:    ['Minimal needs, max savings', 'Immune to FOMO spending',  'Still lives below means',   'Retired early, stress-free'],
    young_soni_1:    ['Family comes first, always', 'Dependents thrive cheaper','Kids grow up secure',       'Generational care secured'],
    young_kav_1:     ['Every post goes viral',      'Collabs add side income',  'Influence converts to cash','Passive income from fame'],
};

// ─── Character detail page ────────────────────────────────────────────────────
function CharacterDetailView({ sprite, trait, onBack, onSelect }) {
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

                {/* Trait badge */}
                <View style={{
                    position: 'absolute', top: 14, right: 14,
                    paddingHorizontal: 10, paddingVertical: 4,
                    borderWidth: 1, borderColor: trait.color + '55',
                    backgroundColor: trait.bg || '#0a0c18',
                }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: trait.color, letterSpacing: 3 }}>{trait.name}</Text>
                </View>

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
                <View style={{ paddingHorizontal: PAD, paddingTop: 12, paddingBottom: 12, borderBottomWidth: 1, borderColor: '#0d1228' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: trait.color, letterSpacing: 2, lineHeight: 30 }}>{trait.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#2a3860', lineHeight: 17 }}>"{trait.desc}"</Text>
                        <View style={{ width: 3, height: 3, backgroundColor: '#1a2440' }} />
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: trait.color + 'cc', lineHeight: 17 }}>{trait.effect}</Text>
                    </View>
                </View>

                {/* Life path label */}
                <View style={{ paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: '#0d1228' }} />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#1e2840', letterSpacing: 5 }}>YOUR LIFE PATH</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: '#0d1228' }} />
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

                {/* ── CHOOSE button — inside scroll, right below timeline ── */}
                <View style={{ paddingHorizontal: PAD, paddingTop: 6 }}>
                    {/* Decorative label */}
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#1a2440', letterSpacing: 4, textAlign: 'center', marginBottom: 8 }}>
                        BEGIN YOUR JOURNEY AS
                    </Text>
                    <TouchableOpacity
                        onPress={onSelect}
                        activeOpacity={0.8}
                        style={{ position: 'relative', overflow: 'hidden' }}
                    >
                        {/* Colored top accent line */}
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: trait.color }} />
                        {/* Dark body */}
                        <View style={{
                            backgroundColor: trait.bg || '#0a0c18',
                            borderWidth: 1, borderTopWidth: 0,
                            borderColor: trait.color + '60',
                            paddingVertical: 16,
                            alignItems: 'center',
                        }}>
                            <Corners color={trait.color + '40'} size={7} />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: trait.color, letterSpacing: 3, lineHeight: 26 }}>
                                CHOOSE  {trait.name}  ▶
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

// ─── Step 1: Browse characters ────────────────────────────────────────────────
function PickSpriteScreen({ selectedIdx, setSelectedIdx, onNext }) {
    const [detailIdx, setDetailIdx] = useState(null);

    if (detailIdx !== null) {
        const sprite = SPRITES[detailIdx];
        return (
            <CharacterDetailView
                sprite={sprite}
                trait={TRAITS[sprite.id]}
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
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#c8d4f0', letterSpacing: 2, lineHeight: 32 }}>
                    CHOOSE YOUR CLASS
                </Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#2a3a5a', letterSpacing: 1, marginTop: 1 }}>
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
                                    activeOpacity={0.8}
                                    style={{
                                        width: CARD_W, height: CARD_H,
                                        marginRight: colIdx === 0 ? CARD_GAP : 0,
                                        backgroundColor: isSel ? t.bg : '#06080f',
                                        borderWidth: isSel ? 2 : 1,
                                        borderColor: isSel ? t.color : '#111828',
                                        overflow: 'hidden', position: 'relative',
                                    }}
                                >
                                    {isSel && <Corners color={t.color} size={5} />}
                                    {isSel && (
                                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.color, opacity: 0.04 }} />
                                    )}
                                    <View style={{ height: SPRITE_H, overflow: 'hidden', alignItems: 'center', paddingTop: 6 }}>
                                        <Image source={sprite.image} style={{ width: CARD_W, height: CARD_W * 1.75 }} resizeMode="contain" />
                                    </View>
                                    <View style={{ height: 1, backgroundColor: isSel ? t.color : '#0d1228', opacity: isSel ? 0.4 : 1 }} />
                                    <View style={{ flex: 1, paddingHorizontal: 8, paddingTop: 6, justifyContent: 'center' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: isSel ? t.color : '#4a5580', letterSpacing: 1, lineHeight: 20 }}>
                                            {t.name}
                                        </Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: isSel ? '#a0b0d0' : '#222a40', lineHeight: 16, marginTop: 1 }}>
                                            {t.effect}
                                        </Text>
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

    const selected = SPRITES[selectedIdx];
    const heroH    = SH * 0.42;

    const handleStart = () => {
        const trimmed = nameInput.trim();
        if (trimmed.length < 2) { setNameError('Name must be at least 2 characters.'); return; }
        onConfirm(trimmed, bdayInput.trim() || null);
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

            {/* Thin divider */}
            <View style={{ height: 1, backgroundColor: '#0a0f1e' }} />

            {/* ── FORM ── */}
            <View style={{ flex: 1, paddingHorizontal: PAD, paddingTop: 22, paddingBottom: 16 }}>

                {/* Section label */}
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#1a2440', letterSpacing: 5, lineHeight: 14, marginBottom: 4 }}>
                    ── NAME YOUR CHARACTER ──
                </Text>

                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 34, color: '#c8d4f0', letterSpacing: 1, lineHeight: 36, marginBottom: 22 }}>
                    WHAT'S YOUR{'\n'}NAME?
                </Text>

                {/* Name input */}
                <TextInput
                    value={nameInput}
                    onChangeText={t => { setNameInput(t); setNameError(''); }}
                    placeholder="Enter your name..."
                    placeholderTextColor="#1a2440"
                    style={{
                        fontFamily: 'VT323_400Regular', fontSize: 24, color: '#c8d4f0',
                        paddingVertical: 12, paddingHorizontal: 14,
                        borderWidth: 1, borderColor: nameError ? '#f87171' : '#1a2440',
                        backgroundColor: '#030407',
                        marginBottom: 4,
                    }}
                    underlineColorAndroid="transparent"
                    maxLength={20}
                    autoFocus
                    returnKeyType="done"
                />
                {nameError
                    ? <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#f87171', marginBottom: 10, lineHeight: 16 }}>{nameError}</Text>
                    : <View style={{ height: 10 }} />
                }

                {/* DOB input */}
                <TextInput
                    value={bdayInput}
                    onChangeText={setBdayInput}
                    placeholder="Birthday  DD/MM/YYYY  (optional)"
                    placeholderTextColor="#111828"
                    style={{
                        fontFamily: 'VT323_400Regular', fontSize: 20, color: '#2a3a5a',
                        paddingVertical: 10, paddingHorizontal: 14,
                        borderWidth: 1, borderColor: '#0d1228',
                        backgroundColor: '#030407',
                        marginBottom: 26,
                    }}
                    underlineColorAndroid="transparent"
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                />

                {/* Buttons — neutral palette, no trait colour */}
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'stretch' }}>
                    <TouchableOpacity
                        onPress={onBack}
                        style={{ paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#111828', backgroundColor: '#030407' }}
                    >
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#2a3560', lineHeight: 20 }}>◀ BACK</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleStart}
                        activeOpacity={0.85}
                        style={{ flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#c8d4f0', backgroundColor: '#030407', position: 'relative' }}
                    >
                        <Corners color="#c8d4f0" size={5} />
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0', letterSpacing: 2, lineHeight: 24 }}>START  ▶</Text>
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
    young_sara_1:    'dance_teacher',
    young_sia_1:     'photographer',
    young_soms_1:    'govt_job',
    young_soni_1:    'backup_singer',
    young_kav_1:     'yoga_teacher',
};

export default function SpriteSelectionScreen() {
    const { setPlayerSprite, setPlayerName, setPlayerBirthday, applyForJob } = useGame();
    const [step, setStep]           = useState(0);
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
        const spriteId = SPRITES[selectedIdx].id;
        setPlayerName(name);
        setPlayerSprite(spriteId);
        if (bday) setPlayerBirthday(bday);
        const starterJobId = STARTER_JOBS[spriteId];
        if (starterJobId) {
            const job = JOBS.find(j => j.id === starterJobId);
            if (job) applyForJob(job);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#06080f' }}>
            {step === 0 && <EntryScreen onStart={() => setStep(1)} />}
            {step === 1 && (
                <PickSpriteScreen
                    selectedIdx={selectedIdx}
                    setSelectedIdx={setSelectedIdx}
                    onNext={() => setStep(2)}
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
