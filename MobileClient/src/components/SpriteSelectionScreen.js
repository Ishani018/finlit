import { useState, useRef, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, Image, TextInput, ScrollView,
    Animated, Dimensions, KeyboardAvoidingView, Platform, Modal, Keyboard,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { JOBS } from '../data/jobs';
import { SPRITE_MAP } from '../data/spriteMap';
import Corners from './Corners';
import PlayerSprite from './PlayerSprite';
import CustomiseScreen from './CustomiseScreen';

const { width: SW, height: SH } = Dimensions.get('window');
const PAD = 16;
const CARD_GAP = 10;
const CARD_W = Math.min(Math.floor((SW - PAD * 2 - CARD_GAP) / 2), 185);
const SPRITE_H = 158;

// ─── Sprites ─────────────────────────────────────────────────────────────────
const SPRITES = [
    { id: 'young_pia_1',     image: require('../../assets/sprites/young_pia_1.png') },
    { id: 'young_raj_1',     image: require('../../assets/sprites/young_raj_1.png') },
    { id: 'young_soms_1',    image: require('../../assets/sprites/young_soms_1.png') },
    { id: 'young_soni_1',    image: require('../../assets/sprites/young_soni_1.png') },
    { id: 'young_sia_1',     image: require('../../assets/sprites/young_sia_1.png') },
    { id: 'young_rahul_1',   image: require('../../assets/sprites/young_rahul_1.png') },
    { id: 'young_priya_1',   image: require('../../assets/sprites/young_priya_1.png') },
    { id: 'young_kav_1',     image: require('../../assets/sprites/young_kav_1.png') },
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


// ─── Shared bits ─────────────────────────────────────────────────────────────
const ROOM_BG = require('../../assets/hostel.png');
const VAULT = require('../../assets/ui_comp/investicon.png');
const NAMES = { young_pia_1: 'PIA', young_raj_1: 'RAJ', young_soms_1: 'SOMS', young_soni_1: 'SONI', young_sia_1: 'SIA', young_rahul_1: 'RAHUL', young_priya_1: 'PRIYA', young_kav_1: 'KAV' };
const NAME_IDEAS = ['Meera', 'Aarav', 'Zoya', 'Kabir', 'Ananya', 'Dev'];
const GOLD = '#fbbf24';

function StepHeader({ step, title, onBack }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: PAD, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#1a2040', backgroundColor: '#06080f' }}>
            {onBack ? (
                <TouchableOpacity onPress={onBack} activeOpacity={0.7}><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: '#7d8ab0', lineHeight: 26 }}>‹</Text></TouchableOpacity>
            ) : null}
            <View>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#5a6890', letterSpacing: 4 }}>{step}</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', lineHeight: 26 }}>{title}</Text>
            </View>
        </View>
    );
}

// Half-body hero: room art behind, painted sprite cropped at the waist.
function Hero({ height, children, sprite, look, spriteId }) {
    const sh = height / 0.56, sw = sh * 0.363;
    return (
        <View style={{ height, overflow: 'hidden', backgroundColor: '#0a0e22', alignItems: 'center' }}>
            <Image source={ROOM_BG} style={{ position: 'absolute', left: -40, top: -30, width: SW + 120, height: height + 160, opacity: 0.28 }} resizeMode="cover" />
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 60, backgroundColor: 'rgba(6,8,15,0.55)' }} />
            <PlayerSprite source={sprite} spriteId={spriteId} age={18} look={look} style={{ position: 'absolute', top: 14, width: sw, height: sh }} />
            {children}
        </View>
    );
}

// ─── Entry / Splash ──────────────────────────────────────────────────────────
function EntryScreen({ onStart, hasSave, onResume }) {
    const blink = useRef(new Animated.Value(1)).current;
    const bob = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.timing(blink, { toValue: 0.25, duration: 700, useNativeDriver: true }),
            Animated.timing(blink, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])).start();
        Animated.loop(Animated.sequence([
            Animated.timing(bob, { toValue: -6, duration: 1400, useNativeDriver: true }),
            Animated.timing(bob, { toValue: 0, duration: 1400, useNativeDriver: true }),
        ])).start();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#06080f' }}>
            <View style={{ flex: 1, overflow: 'hidden' }}>
                <Image source={ROOM_BG} style={{ position: 'absolute', left: -60, top: 0, width: SW + 200, height: SH * 0.78, opacity: 0.55 }} resizeMode="cover" />
                {Array.from({ length: 10 }).map((_, i) => (
                    <View key={i} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${85 - i * 7}%`, backgroundColor: 'rgba(6,8,15,0.16)' }} />
                ))}
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
                    <Animated.View style={{ transform: [{ translateY: bob }], marginBottom: 14 }}>
                        <Image source={require('../../assets/icon.png')} style={{ width: 120, height: 120, borderRadius: 24 }} resizeMode="contain" />
                    </Animated.View>
                    <View style={{ alignItems: 'center', marginBottom: 10 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 84, color: '#0b1228', letterSpacing: 8, position: 'absolute', top: 5, left: 5, lineHeight: 84 }}>FINLIT</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 84, color: '#172860', letterSpacing: 8, position: 'absolute', top: 2, left: 2, lineHeight: 84 }}>FINLIT</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 84, color: '#c8d4f0', letterSpacing: 8, lineHeight: 84 }}>FINLIT</Text>
                    </View>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#9db4e0', textAlign: 'center', lineHeight: 22 }}>Live a whole life. See what{'\n'}money does to it.</Text>
                </View>
            </View>

            <View style={{ paddingHorizontal: 26, paddingBottom: 30, paddingTop: 8 }}>
                {hasSave ? (
                    <View>
                        <TouchableOpacity onPress={onResume} activeOpacity={0.85} style={{ backgroundColor: '#1a2e56', borderRadius: 10, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#c8d4f0', letterSpacing: 4 }}>CONTINUE GAME</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onStart} activeOpacity={0.85} style={{ height: 40, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#5a6890', letterSpacing: 4 }}>NEW GAME</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Animated.View style={{ opacity: blink }}>
                        <TouchableOpacity onPress={onStart} activeOpacity={0.85} style={{ backgroundColor: '#1a2e56', borderRadius: 10, height: 52, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', letterSpacing: 5 }}>TAP TO BEGIN</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 14 }}>
                    {['investicon', 'career', 'home', 'familyicon', 'happyicon'].map(n => null)}
                    <Image source={require('../../assets/ui_comp/investicon.png')} style={{ width: 18, height: 18, opacity: 0.5 }} resizeMode="contain" />
                    <Image source={require('../../assets/ui_comp/career.png')} style={{ width: 18, height: 18, opacity: 0.5 }} resizeMode="contain" />
                    <Image source={require('../../assets/ui_comp/home.png')} style={{ width: 18, height: 18, opacity: 0.5 }} resizeMode="contain" />
                    <Image source={require('../../assets/ui_comp/familyicon.png')} style={{ width: 18, height: 18, opacity: 0.5 }} resizeMode="contain" />
                    <Image source={require('../../assets/ui_comp/happyicon.png')} style={{ width: 18, height: 18, opacity: 0.5 }} resizeMode="contain" />
                </View>
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

// ─── Step 1: Choose character ────────────────────────────────────────────────
function CharacterDetail({ startIdx, setSelectedIdx, onBack, onNext, childMode, childName }) {
    const [idx, setIdx] = useState(startIdx ?? 6);
    const sprite = SPRITES[idx], trait = TRAITS[sprite.id], flavour = TRAIT_AGE_FLAVOUR[sprite.id] || [];
    const [stage, setStage] = useState(0);
    const heroH = Math.min(SH * 0.40, 340);
    const thumbW = Math.floor((SW - PAD * 2 - 7 * 6) / 8);
    const stageSrc = SPRITE_MAP[sprite.id + AGE_STAGES[stage].suffix] || sprite.image;

    return (
        <View style={{ flex: 1, backgroundColor: '#06080f' }}>
            <StepHeader step={childMode ? 'NEXT GENERATION' : 'STEP 1 OF 2'} title={childMode ? `Pick a look for ${childName || 'your child'}` : 'Choose your character'} onBack={onBack} />

            <Hero height={heroH} sprite={stageSrc} spriteId={null}>
                {!childMode && (
                    <View style={{ position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(13,16,32,0.9)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: trait.color + '66' }}>
                        {TRAIT_ICONS[sprite.id] ? <Image source={TRAIT_ICONS[sprite.id]} style={{ width: 14, height: 14 }} resizeMode="contain" /> : null}
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#c8d4f0', letterSpacing: 1 }}>{trait.name}</Text>
                    </View>
                )}
            </Hero>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: PAD, paddingTop: 10, paddingBottom: 10 }} showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 34, color: trait.color, letterSpacing: 2, lineHeight: 34 }}>{NAMES[sprite.id]}</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#7d8ab0' }}>{trait.desc}</Text>
                    </View>
                    {!childMode && (
                        <View style={{ backgroundColor: '#0d2a1f', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, maxWidth: '55%' }}>
                            <Text numberOfLines={1} style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#4ade80' }}>{trait.effect}</Text>
                        </View>
                    )}
                </View>

                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#5a6890', letterSpacing: 4, marginTop: 12, marginBottom: 6 }}>ALL CHARACTERS</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                    {SPRITES.map((sp, i) => (
                        <TouchableOpacity key={sp.id} onPress={() => { setIdx(i); setStage(0); }} activeOpacity={0.8}
                            style={{ width: thumbW, height: 54, borderRadius: 8, overflow: 'hidden', backgroundColor: '#0d1020', borderWidth: 1, borderColor: i === idx ? '#818cf8' : '#1e2840' }}>
                            <Image source={sp.image} style={{ width: thumbW * 1.7, height: 54 * 4.2, marginLeft: -thumbW * 0.35, marginTop: -2 }} resizeMode="stretch" />
                        </TouchableOpacity>
                    ))}
                </View>

                {!childMode && (
                    <View style={{ marginTop: 12, backgroundColor: '#0d1020', borderWidth: 1, borderColor: '#1a2040', borderRadius: 12, padding: 10 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#5a6890', letterSpacing: 4, marginBottom: 8 }}>LIFE PATH · TAP TO PREVIEW</Text>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                            {AGE_STAGES.map((a, i) => {
                                const img = SPRITE_MAP[sprite.id + a.suffix] || (a.suffix === '' ? sprite.image : null);
                                const on = i === stage;
                                return (
                                    <TouchableOpacity key={a.label} onPress={() => setStage(i)} activeOpacity={0.8} style={{ flex: 1, alignItems: 'center' }}>
                                        <View style={{ width: '100%', height: 92, borderRadius: 8, overflow: 'hidden', backgroundColor: on ? '#141b36' : '#0a0d1a', borderWidth: 1, borderColor: on ? trait.color : '#1a2040', opacity: on ? 1 : 0.42 }}>
                                            {img ? <Image source={img} style={{ position: 'absolute', top: 2, left: '-30%', width: '160%', height: 220 }} resizeMode="contain" /> : null}
                                        </View>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: on ? trait.color : '#5a6890', lineHeight: 16, marginTop: 4 }}>{a.label}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#5a6890', lineHeight: 12 }}>{a.age}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#c8d4f0', marginTop: 8 }}>{AGE_STAGES[stage].age}: {flavour[stage] || ''}</Text>
                    </View>
                )}
            </ScrollView>

            <View style={{ paddingHorizontal: PAD, paddingTop: 8, paddingBottom: 14, borderTopWidth: 1, borderColor: '#1a2040', backgroundColor: '#06080f' }}>
                <TouchableOpacity onPress={() => { setSelectedIdx(idx); onNext(); }} activeOpacity={0.85}
                    style={{ height: 50, borderRadius: 10, backgroundColor: '#818cf8', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#0a0e22', letterSpacing: 4 }}>{childMode ? 'SELECT THIS LOOK' : `PLAY AS ${NAMES[sprite.id]}`}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Step 1: Browse characters (card grid). Tapping a card opens its profile. ─────────────────────────
function PickSpriteScreen({ selectedIdx, setSelectedIdx, onNext, childMode, childName, detailIdx, setDetailIdx }) {

    if (detailIdx !== null) {
        return (
            <CharacterDetail
                startIdx={detailIdx}
                setSelectedIdx={setSelectedIdx}
                childMode={childMode}
                childName={childName}
                onBack={() => setDetailIdx(null)}
                onNext={onNext}
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
                    {childMode ? `PICK A SPRITE FOR ${childName ? childName.toUpperCase() : 'YOUR CHILD'}` : 'CHOOSE YOUR PLAYER'}
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
                                        overflow: 'hidden', borderRadius: 12, position: 'relative',
                                    }}
                                >
                                    <View style={{ height: SPRITE_H, overflow: 'hidden', borderRadius: 12, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 }}>
                                        <Image source={sprite.image} style={{ width: CARD_W, height: SPRITE_H * 1.55 }} resizeMode="contain" />
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
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function DropdownField({ label, value, options, onSelect, flex = 1, error }) {
    const [open, setOpen] = useState(false);
    return (
        <View style={{ flex }}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => { Keyboard.dismiss(); setOpen(true); }}
                style={{
                    paddingVertical: 13, paddingHorizontal: 12, backgroundColor: '#0d1428', borderRadius: 8,
                    borderWidth: 1, borderColor: error ? '#f87171' : '#1e2e50',
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                }}
            >
                <Text numberOfLines={1} style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: value ? '#c8d4f0' : '#2a3860', flexShrink: 1 }}>
                    {value ? value.label : label}
                </Text>
                <Text style={{ color: '#445070', fontSize: 12, marginLeft: 4 }}>▼</Text>
            </TouchableOpacity>
            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <TouchableOpacity activeOpacity={1} onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 30 }}>
                    <View style={{ maxHeight: SH * 0.55, backgroundColor: '#0d1428', borderRadius: 10, borderWidth: 1, borderColor: '#1e2e50', overflow: 'hidden' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070', letterSpacing: 3, padding: 12 }}>{label.toUpperCase()}</Text>
                        <ScrollView>
                            {options.map(o => (
                                <TouchableOpacity key={o.value} onPress={() => { onSelect(o.value); setOpen(false); }}
                                    style={{ paddingVertical: 12, paddingHorizontal: 16, backgroundColor: value && value.value === o.value ? '#1a2e56' : 'transparent' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0' }}>{o.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

function NameScreen({ selectedIdx, onBack, onConfirm }) {
    const [nameInput, setNameInput] = useState('');
    const [look, setLook] = useState({ head: null, neck: null, hair: null });
    const [showCustomise, setShowCustomise] = useState(false);
    const [bDay, setBDay] = useState(null);
    const [bMonth, setBMonth] = useState(null);
    const [nameError, setNameError] = useState('');
    const [bdayError, setBdayError] = useState('');

    const monthOptions = MONTH_NAMES.map((m, i) => ({ value: i + 1, label: m.slice(0, 3) + ' (' + String(i + 1).padStart(2, '0') + ')' }));
    // Only the day and month matter (birthdays), so no year is asked for. 2000 is a leap year, so 29 Feb stays available.
    const daysInMonth = bMonth ? new Date(2000, bMonth, 0).getDate() : 31;
    const dayOptions = Array.from({ length: daysInMonth }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
    const pad = n => String(n).padStart(2, '0');
    const find = (opts, v) => (v == null ? null : opts.find(o => o.value === v) || null);

    const selected = SPRITES[selectedIdx];
    const heroH = Math.min(SH * 0.30, 250);
    const trimmed = nameInput.trim();
    const dressed = look.head || look.neck || look.hair;

    const handleStart = () => {
        if (trimmed.length < 2) { setNameError('Name must be at least 2 characters.'); return; }
        if (!bDay || !bMonth) { setBdayError('Please pick the day and month of your birthday.'); return; }
        if (bDay > new Date(2000, bMonth, 0).getDate()) { setBdayError('That date does not exist.'); return; }
        onConfirm(trimmed, `${pad(bDay)}/${pad(bMonth)}/2000`, look);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#06080f' }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <StepHeader step="STEP 2 OF 2" title="Name your character" onBack={onBack} />
                <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
                    <Hero height={heroH} sprite={selected.image} spriteId={selected.id} look={look}>
                        <View style={{ position: 'absolute', bottom: 10, alignSelf: 'center', minWidth: 160, paddingHorizontal: 20, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: GOLD, backgroundColor: 'rgba(6,8,15,0.92)', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: GOLD, letterSpacing: 4 }}>{(trimmed || NAMES[selected.id]).toUpperCase()}</Text>
                        </View>
                    </Hero>

                    <View style={{ paddingHorizontal: PAD, paddingTop: 12 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#5a6890', letterSpacing: 4, marginBottom: 6 }}>WHAT SHOULD EVERYONE CALL YOU?</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1020', borderRadius: 12, borderWidth: 1, borderColor: nameError ? '#f87171' : GOLD, paddingHorizontal: 14, height: 56 }}>
                            <TextInput
                                value={nameInput}
                                onChangeText={t => { setNameInput(t.slice(0, 20)); setNameError(''); }}
                                placeholder="Type a name"
                                placeholderTextColor="#2a3860"
                                selectionColor={GOLD}
                                underlineColorAndroid="transparent"
                                maxLength={20}
                                returnKeyType="done"
                                style={[{ flex: 1, fontFamily: 'VT323_400Regular', fontSize: 30, color: '#c8d4f0', letterSpacing: 2, padding: 0 }, Platform.OS === 'web' ? { outlineStyle: 'none' } : null]}
                            />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#7d8ab0' }}>{nameInput.length} / 20</Text>
                        </View>
                        {nameError ? <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#f87171', marginTop: 4 }}>{nameError}</Text> : null}
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#7d8ab0', marginTop: 6 }}>This name appears on your plate, your bank and your family's messages.</Text>

                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#5a6890', letterSpacing: 4, marginTop: 12, marginBottom: 6 }}>NEED IDEAS?</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                            {NAME_IDEAS.map(n => (
                                <TouchableOpacity key={n} onPress={() => { setNameInput(n); setNameError(''); }} activeOpacity={0.8} style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14, backgroundColor: '#141b36' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#a8b4d8' }}>{n}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#5a6890', letterSpacing: 4, marginTop: 12, marginBottom: 6 }}>BIRTHDAY</Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: bdayError ? 4 : 0 }}>
                            <DropdownField label="Day" flex={1} error={bdayError} value={find(dayOptions, bDay)} options={dayOptions} onSelect={v => { setBDay(v); setBdayError(''); }} />
                            <DropdownField label="Month" flex={1.6} error={bdayError} value={find(monthOptions, bMonth)} options={monthOptions} onSelect={v => { setBMonth(v); setBdayError(''); }} />
                        </View>
                        {bdayError ? <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#f87171' }}>{bdayError}</Text> : null}

                        <TouchableOpacity onPress={() => { Keyboard.dismiss(); setShowCustomise(true); }} activeOpacity={0.85}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, backgroundColor: '#0d1020', borderWidth: 1, borderColor: '#1a2040', borderRadius: 12, padding: 10 }}>
                            <Image source={require('../../assets/ui_comp/happyicon.png')} style={{ width: 30, height: 30 }} resizeMode="contain" />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#c8d4f0', lineHeight: 20 }}>Customise your look</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#7d8ab0' }}>{dressed ? 'Looking good. Tap to change.' : 'Beanies, scarves and hair pins. Optional.'}</Text>
                            </View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#7d8ab0' }}>›</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <View style={{ paddingHorizontal: PAD, paddingTop: 8, paddingBottom: 14, borderTopWidth: 1, borderColor: '#1a2040', backgroundColor: '#06080f' }}>
                    <TouchableOpacity onPress={handleStart} activeOpacity={0.85} style={{ height: 50, borderRadius: 10, backgroundColor: '#818cf8', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#0a0e22', letterSpacing: 4 }}>START AS {(trimmed || NAMES[selected.id]).toUpperCase()}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {showCustomise && (
                <CustomiseScreen
                    spriteId={selected.id}
                    name={nameInput}
                    look={look}
                    title="Your look"
                    saveLabel="DONE"
                    startAge={18}
                    onClose={() => setShowCustomise(false)}
                    onSave={({ name, look: l }) => { setLook(l); if (name) setNameInput(name); setShowCustomise(false); }}
                />
            )}
        </View>
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
    const { setPlayerSprite, setPlayerName, setPlayerBirthday, setPlayerLook, applyForJob, startNextGeneration, resetGame } = useGame();
    const [step, setStep]           = useState(childMode ? 1 : 0);
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [detailIdx, setDetailIdx] = useState(null);   // which profile is open; kept so Back from the name step returns to it

    const handleConfirm = (name, bday, look) => {
        if (childMode) {
            startNextGeneration(selectedIdx);
            if (onStart) onStart();
            return;
        }

        const spriteId = SPRITES[selectedIdx].id;
        setPlayerName(name);
        setPlayerSprite(spriteId);
        if (bday) setPlayerBirthday(bday);
        if (look) setPlayerLook(look);
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
                    detailIdx={detailIdx}
                    setDetailIdx={setDetailIdx}
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
