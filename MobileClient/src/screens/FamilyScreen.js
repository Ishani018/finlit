import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { INSURANCE_PLANS } from '../data/insurance';
import { GROCERY_ITEMS } from '../data/groceries';
import { getSpriteImage } from '../data/spriteMap';
import PixelDialog from '../components/PixelDialog';

const PAD = 14;
const GAP = 10;

const C = {
    bg:       '#06080f',
    panel:    '#0d1020',
    card:     '#070a16',
    border:   '#1a2040',
    borderLt: '#1e2840',
    gold:     '#fbbf24',
    blue:     '#3b82f6',
    red:      '#f87171',
    sage:     '#4ade80',
    pink:     '#ec4899',
    cream:    '#c8d4f0',
    dim:      '#445070',
    dark:     '#2a3560',
};

const BANNER_IMG  = require('../../assets/achivements/family portrait.png');
const BANQUET_IMG = require('../../assets/properties/investment properties/marraige_banquet_hall.png');

const DEP_IMAGES = {
    baby_son:           require('../../assets/dependents/baby son.png'),
    baby_daughter:      require('../../assets/dependents/baby daughter.png'),
    toddler_son:        require('../../assets/dependents/toddler son.png'),
    toddler_daughter:   require('../../assets/dependents/toddler daughter.png'),
    preschool_son:      require('../../assets/dependents/pre schooler son.png'),
    preschool_daughter: require('../../assets/dependents/pre schooler daughter.png'),
    teenage_son:        require('../../assets/dependents/teenage son.png'),
    teenage_daughter:   require('../../assets/dependents/teenage daughter.png'),
    elderly_parents:    require('../../assets/dependents/elderly parents couple.png'),
    elderly_mother:     require('../../assets/dependents/elderlymother.png'),
    elderly_father:     require('../../assets/dependents/elderlyfather.png'),
    elderly_couple:     require('../../assets/dependents/elderly parents couple.png'),
    adopted_baby:       require('../../assets/dependents/adopted baby.png'),
};

const INSURE_COLORS = { health: '#f87171', life: '#3b82f6', home: '#fbbf24' };
const INSURE_IMAGES = {
    health: require('../../assets/jobs/chemist drugstore.png'),
    life:   require('../../assets/bank.png'),
    home:   require('../../assets/properties/1bhk_starter_apartment.png'),
};

const GROOM_IMG = require('../../assets/sprites/groom.png');
const GROOM_V2_IMG = require('../../assets/sprites/groom version 2.png');
const GROOM_V3_IMG = require('../../assets/sprites/groom version 3.png');
const BRIDE_IMG = require('../../assets/sprites/bride.png');
const BRIDE_V2_IMG = require('../../assets/sprites/bride version 2.png');
const BRIDE_V3_IMG = require('../../assets/sprites/bride version 3.png');

const GROOM_NORMAL_IMG = require('../../assets/sprites/groom normal clothes.png');
const GROOM_V2_NORMAL_IMG = require('../../assets/sprites/groom version 2 normal clothes.png');
const GROOM_V3_NORMAL_IMG = require('../../assets/sprites/groom version 3 normal clothes.png');
const BRIDE_NORMAL_IMG = require('../../assets/sprites/bride normal clothes.png');
const BRIDE_V2_NORMAL_IMG = require('../../assets/sprites/bride version 2 normal clothes.png');
const BRIDE_V3_NORMAL_IMG = require('../../assets/sprites/bride version 3 normal clothes.png');

const SPOUSE_IMAGES = {
    groom: GROOM_NORMAL_IMG, groom_v1: GROOM_NORMAL_IMG, groom_v2: GROOM_V2_NORMAL_IMG, groom_v3: GROOM_V3_NORMAL_IMG,
    bride: BRIDE_NORMAL_IMG, bride_v1: BRIDE_NORMAL_IMG, bride_v2: BRIDE_V2_NORMAL_IMG, bride_v3: BRIDE_V3_NORMAL_IMG,
};

const getSpouseImage = (s) => SPOUSE_IMAGES[s] || null;

const getChildImage = (gender, ageMonths) => {
    const f = gender === 'female';
    if (ageMonths < 12)  return f ? DEP_IMAGES.baby_daughter     : DEP_IMAGES.baby_son;
    if (ageMonths < 60)  return f ? DEP_IMAGES.toddler_daughter   : DEP_IMAGES.toddler_son;
    if (ageMonths < 216) return f ? DEP_IMAGES.preschool_daughter : DEP_IMAGES.preschool_son;
    return                      f ? DEP_IMAGES.teenage_daughter   : DEP_IMAGES.teenage_son;
};

const getChildStage = (ageMonths) => {
    if (ageMonths < 12)  return { label: 'INFANT',      color: '#ec4899', cost: '₹8k/mo' };
    if (ageMonths < 60)  return { label: 'TODDLER',     color: '#ec4899', cost: '₹8k/mo' };
    if (ageMonths < 144) return { label: 'SCHOOL',      color: '#3b82f6', cost: '₹12k/mo' };
    if (ageMonths < 216) return { label: 'HIGH SCHOOL', color: '#818cf8', cost: '₹12k/mo' };
    if (ageMonths < 252) return { label: 'COLLEGE',     color: '#a78bfa', cost: '₹25k/mo' };
    return                      { label: 'INDEPENDENT', color: '#4ade80', cost: '₹0/mo' };
};

const hpColor = (hp) => hp >= 60 ? C.sage : hp >= 30 ? C.gold : C.red;

const SectionLabel = ({ label }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22, marginBottom: 12 }}>
        <View style={{ height: 1, width: 10, backgroundColor: C.blue + '60' }} />
        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, letterSpacing: 3 }}>{label}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
    </View>
);

// ── Square-ish person card (player, spouse, parent) ───────────────────────────
// flex:1 so they fill a 2-col row evenly
function PersonCard({ image, headCrop, topCrop, contain, name, tag, color, sub1, sub2, hp, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.85 : 1}
            style={{ flex: 1, borderWidth: 1, borderColor: C.border, backgroundColor: C.panel, overflow: 'hidden' }}>

            <View style={{ width: '100%', aspectRatio: 0.85, backgroundColor: C.card, overflow: 'hidden', position: 'relative' }}>
                {image ? (
                    headCrop
                        ? <Image source={image} style={{ width: '170%', height: '170%', position: 'absolute', top: '8%', left: '-35%' }} resizeMode="contain" />
                        : topCrop
                        ? <Image source={image} style={{ width: '100%', height: '200%', position: 'absolute', top: 0 }} resizeMode="contain" />
                        : contain
                        ? <Image source={image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                        : <Image source={image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome5 name="user" size={48} color={color + '50'} />
                    </View>
                )}
                {/* Tag badge */}
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(6,8,15,0.82)', borderTopWidth: 1, borderColor: color + '40', paddingVertical: 5, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color, letterSpacing: 2 }}>{tag}</Text>
                </View>
            </View>

            {/* Info strip */}
            <View style={{ padding: 10 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream, lineHeight: 22 }} numberOfLines={1}>{name}</Text>
                {sub1 ? <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color, lineHeight: 17, marginTop: 3 }} numberOfLines={1}>{sub1}</Text> : null}
                {sub2 ? <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, marginTop: 2 }} numberOfLines={1}>{sub2}</Text> : null}
                {hp !== undefined && (
                    <View style={{ marginTop: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dim, letterSpacing: 2 }}>HEALTH</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: hpColor(hp) }}>{Math.round(hp)}</Text>
                        </View>
                        <View style={{ height: 4, backgroundColor: C.bg }}>
                            <View style={{ height: '100%', width: `${hp}%`, backgroundColor: hpColor(hp) }} />
                        </View>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

// ── Empty spouse slot ─────────────────────────────────────────────────────────
function EmptySpouseCard({ onPress }) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}
            style={{ flex: 1, borderWidth: 1, borderColor: C.pink + '35', borderStyle: 'dashed', backgroundColor: C.panel, overflow: 'hidden' }}>
            {/* Banquet hall image */}
            <View style={{ width: '100%', aspectRatio: 0.85, overflow: 'hidden', position: 'relative' }}>
                <Image source={BANQUET_IMG} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,8,15,0.55)' }} />
                <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <FontAwesome5 name="heart" size={32} color={C.pink + '90'} />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.pink + 'cc', letterSpacing: 2 }}>+ SPOUSE</Text>
                </View>
            </View>
            <View style={{ padding: 10 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 19, color: C.pink + 'aa' }}>Get Married</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dark, marginTop: 3 }}>₹5L wedding cost</Text>
            </View>
        </TouchableOpacity>
    );
}

// ── Child card (fits in 2-col grid) ──────────────────────────────────────────
function ChildCard({ child, onPress }) {
    const stage = getChildStage(child.childAgeMonths || 0);
    const ageYr = Math.floor((child.childAgeMonths || 0) / 12);
    const img   = getChildImage(child.gender, child.childAgeMonths || 0);
    const hp    = child.health ?? 80;
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}
            style={{ flex: 1, borderWidth: 1, borderColor: stage.color + '45', backgroundColor: C.panel, overflow: 'hidden' }}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: stage.color }} />
            <View style={{ width: '100%', aspectRatio: 0.85, overflow: 'hidden', position: 'relative' }}>
                <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,8,15,0.08)' }} />
                <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: stage.color, paddingHorizontal: 7, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#000', letterSpacing: 1 }}>{stage.label}</Text>
                </View>
                <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(6,8,15,0.85)', borderWidth: 1, borderColor: stage.color + '50', paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: stage.color }}>{ageYr}yr</Text>
                </View>
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: stage.color, paddingVertical: 5, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#000', letterSpacing: 1 }}>{child.gender === 'female' ? 'DAUGHTER' : 'SON'}</Text>
                </View>
            </View>
            <View style={{ padding: 10 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream, lineHeight: 22 }} numberOfLines={1}>{child.name}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: stage.color }}>{stage.cost}</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: hpColor(hp) }}>{Math.round(hp)}HP</Text>
                </View>
                <View style={{ height: 4, backgroundColor: C.bg, marginTop: 7 }}>
                    <View style={{ height: '100%', width: `${hp}%`, backgroundColor: hpColor(hp) }} />
                </View>
            </View>
        </TouchableOpacity>
    );
}

// ── Add child card ────────────────────────────────────────────────────────────
function AddChildCard({ onPress }) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}
            style={{ flex: 1, borderWidth: 1, borderColor: C.blue + '35', borderStyle: 'dashed', backgroundColor: C.panel, overflow: 'hidden' }}>
            <View style={{ width: '100%', aspectRatio: 0.85, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.blue + '06' }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: C.blue + '40', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 32, color: C.blue + '70', lineHeight: 34 }}>+</Text>
                </View>
            </View>
            <View style={{ padding: 10 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 19, color: C.blue + 'aa' }}>Have a Child</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dark, marginTop: 3 }}>9 Months Wait</Text>
            </View>
        </TouchableOpacity>
    );
}

// ── Expecting child card ────────────────────────────────────────────────────────────
function ExpectingChildCard({ data }) {
    const babyImg = data.gender === 'female' ? DEP_IMAGES.baby_daughter : DEP_IMAGES.baby_son;
    return (
        <View
            style={{ flex: 1, borderWidth: 1, borderColor: C.pink + '50', backgroundColor: C.panel, overflow: 'hidden' }}>
            <View style={{ width: '100%', aspectRatio: 0.85, alignItems: 'center', justifyContent: 'center', backgroundColor: C.pink + '08' }}>
                <Image source={babyImg} style={{ width: '80%', height: '80%', opacity: 0.4 }} resizeMode="contain" />
                <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: C.pink, paddingHorizontal: 7, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#000', letterSpacing: 1 }}>EXPECTING</Text>
                </View>
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(6,8,15,0.85)', paddingVertical: 5, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.cream, letterSpacing: 1 }}>{data.remaining} MONTHS LEFT</Text>
                </View>
            </View>
            <View style={{ padding: 10 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 19, color: C.pink + 'cc' }}>{data.name || 'Baby'} (9mo)</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, marginTop: 3 }}>Needs 1 extra capacity!</Text>
            </View>
        </View>
    );
}

// ── Add parent card ───────────────────────────────────────────────────────────
function AddParentCard({ onPress }) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}
            style={{ flex: 1, borderWidth: 1, borderColor: C.gold + '35', borderStyle: 'dashed', backgroundColor: C.panel, overflow: 'hidden' }}>
            <View style={{ width: '100%', aspectRatio: 0.85, overflow: 'hidden', position: 'relative' }}>
                <Image source={DEP_IMAGES.elderly_couple} style={{ width: '100%', height: '200%', position: 'absolute', top: 0 }} resizeMode="contain" />
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,8,15,0.65)' }} />
                <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: C.gold + '50', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: C.gold + '80', lineHeight: 30 }}>+</Text>
                    </View>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.gold + 'cc', letterSpacing: 2 }}>+ PARENT</Text>
                </View>
            </View>
            <View style={{ padding: 10 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 19, color: C.gold + 'aa' }}>Take In Parent</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dark, marginTop: 3 }}>₹25k setup · ₹15k/mo</Text>
            </View>
        </TouchableOpacity>
    );
}

// ── Add parent pick modal ─────────────────────────────────────────────────────
function AddParentPickModal({ existingParents, onPick, onClose }) {
    const hasMother = existingParents.some(p => p.parentType === 'mother');
    const hasFather = existingParents.some(p => p.parentType === 'father');
    const options = [
        !hasMother && { id: 'mother', name: 'Mother', color: C.pink, label: 'MOTHER', img: DEP_IMAGES.elderly_mother },
        !hasFather && { id: 'father', name: 'Father', color: C.blue, label: 'FATHER', img: DEP_IMAGES.elderly_father },
    ].filter(Boolean);

    return (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.97)', zIndex: 200, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '92%', maxWidth: 380, borderWidth: 1, borderColor: C.borderLt, backgroundColor: C.bg, overflow: 'hidden' }}>
                <View style={{ height: 110, overflow: 'hidden', position: 'relative' }}>
                    <Image source={DEP_IMAGES.elderly_parents} style={{ width: '100%', height: '220%', position: 'absolute', top: 0 }} resizeMode="contain" />
                    <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,8,15,0.6)' }} />
                    <View style={{ position: 'absolute', inset: 0, justifyContent: 'flex-end', padding: 14 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.gold, letterSpacing: 4 }}>LIFE EVENT</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: C.cream, lineHeight: 28 }}>Who moves in?</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderWidth: 1, borderColor: C.border, backgroundColor: 'rgba(6,8,15,0.8)', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome5 name="times" size={12} color={C.dim} />
                    </TouchableOpacity>
                </View>

                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, textAlign: 'center', paddingVertical: 10 }}>
                    ₹25,000 setup  ·  ₹15,000/mo care
                </Text>

                <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 16, gap: 12 }}>
                    {options.map(p => (
                        <TouchableOpacity key={p.id} onPress={() => onPick(p)} activeOpacity={0.85}
                            style={{ flex: 1, borderWidth: 1.5, borderColor: p.color + '60', backgroundColor: C.panel, overflow: 'hidden' }}>
                            <View style={{ height: 3, backgroundColor: p.color }} />
                            {/* Portrait with top-half crop */}
                            <View style={{ width: '100%', aspectRatio: 0.85, overflow: 'hidden', position: 'relative', backgroundColor: C.card }}>
                                <Image source={p.img} style={{ width: '100%', height: '200%', position: 'absolute', top: '8%' }} resizeMode="contain" />
                                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,8,15,0.18)' }} />
                                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(6,8,15,0.82)', borderTopWidth: 1, borderColor: p.color + '40', paddingVertical: 5, alignItems: 'center' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: p.color, letterSpacing: 2 }}>{p.label}</Text>
                                </View>
                            </View>
                            <View style={{ padding: 10, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream }}>{p.name}</Text>
                            </View>
                            <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                                <View style={{ borderWidth: 1, borderColor: p.color + '50', backgroundColor: p.color + '12', paddingVertical: 8, alignItems: 'center' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: p.color, letterSpacing: 2 }}>TAKE IN</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                    {options.length === 0 && (
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim, textAlign: 'center', flex: 1, padding: 20 }}>Both parents are already with you.</Text>
                    )}
                </View>
            </View>
        </View>
    );
}

// ── Insurance tile ────────────────────────────────────────────────────────────
function InsuranceTile({ plan, isActive, onPress }) {
    const color = INSURE_COLORS[plan.type] || C.dim;
    const img   = INSURE_IMAGES[plan.type];
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}
            style={{ flex: 1, borderWidth: 1, borderColor: isActive ? color + '80' : C.border, backgroundColor: C.panel, overflow: 'hidden' }}>
            {isActive && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 2, backgroundColor: color }} />}
            <View style={{ height: 100, overflow: 'hidden' }}>
                {img ? <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                     : <View style={{ flex: 1, backgroundColor: color + '15' }} />}
                <View style={{ position: 'absolute', inset: 0, backgroundColor: isActive ? 'rgba(6,8,15,0.3)' : 'rgba(6,8,15,0.65)' }} />
                {isActive && (
                    <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: color, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome5 name="check" size={10} color="#000" />
                    </View>
                )}
            </View>
            <View style={{ padding: 10 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: isActive ? C.cream : C.dim }} numberOfLines={1}>
                    {plan.name.split(' ')[0].toUpperCase()}
                </Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: isActive ? color : C.dark, marginTop: 2 }}>
                    {isActive ? '✓ ACTIVE' : `₹${(plan.premium || 0).toLocaleString()}/mo`}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

// ── Dependent detail overlay ──────────────────────────────────────────────────
const PRESCHOOL_TIERS = [
    { id: 'home',       label: 'HOME CARE',    extraCost: 0,    color: '#4ade80', desc: 'Cared for at home. No extra cost.', outcome: 'No career boost' },
    { id: 'playschool', label: 'PLAYSCHOOL',   extraCost: 2000, color: '#60a5fa', desc: '₹2k/mo. Basic structured play and socialisation.', outcome: 'Small career boost' },
    { id: 'montessori', label: 'MONTESSORI',   extraCost: 8000, color: '#fbbf24', desc: '₹8k/mo. Child-led early learning, strong cognitive foundation.', outcome: 'Meaningful career boost' },
];

const SCHOOL_TIERS = [
    { id: 'government',    label: 'GOVT SCHOOL',     extraCost: 0,     color: '#4ade80', desc: 'Free education. Solid foundation, standard outcomes.', outcome: 'Graduate / Vocational' },
    { id: 'private',       label: 'PRIVATE SCHOOL',  extraCost: 5000,  color: '#60a5fa', desc: '₹5k/mo extra. Better facilities and teacher quality.', outcome: 'Graduate / Professional boost' },
    { id: 'international', label: 'INTL SCHOOL',     extraCost: 15000, color: '#fbbf24', desc: '₹15k/mo extra. Top-tier education and career opportunities.', outcome: 'Professional / Elite boost' },
];

function DependentDetail({ dep, pantry, onFeed, onClose, showDialog, totalMonthsPlayed, upskillSpouse, divorce, giftChild, buyMedicine, toggleCaretaker, planVacation, activeInsurance, ppf, fixedDeposits, dependents, setChildSchoolTier, setChildPreschoolTier }) {
    const isChild  = dep.type === 'child';
    const isParent = dep.type === 'parent';
    const isSpouse = dep.type === 'spouse';
    const hp       = dep.health ?? 80;
    const hCol     = hpColor(hp);
    const stage    = isChild ? getChildStage(dep.childAgeMonths || 0) : null;

    const parentImg = dep.parentType === 'mother' ? DEP_IMAGES.elderly_mother
                    : dep.parentType === 'father'  ? DEP_IMAGES.elderly_father
                    : DEP_IMAGES.elderly_couple;
    const img      = isChild  ? getChildImage(dep.gender, dep.childAgeMonths || 0)
                   : isParent ? parentImg
                   : isSpouse ? (getSpouseImage(dep.spouseSprite) || BRIDE_IMG)
                   : null;

    const pantryItems = (pantry || []).filter(p => p.qty > 0);
    const statusText  = hp >= 70 ? 'Healthy and happy!'
                      : hp >= 40 ? 'Could use some food and care.'
                      : hp >= 20 ? 'Not well — feed them soon.'
                      : 'Critical! Needs immediate care.';

    const monthsMarried = isSpouse ? Math.max(0, (totalMonthsPlayed || 0) - (dep.monthAdded || 0)) : 0;
    const spouseColor   = (dep.spouseSprite || '').startsWith('groom') ? C.blue : C.pink;

    return (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: C.bg, zIndex: 50 }}>
            <View style={{ backgroundColor: C.panel, paddingTop: 14, paddingBottom: 12, paddingHorizontal: PAD, borderBottomWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: C.cream }}>{dep.name}</Text>
                <TouchableOpacity onPress={onClose} style={{ width: 34, height: 34, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome5 name="times" size={13} color={C.dim} />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>

                {/* Portrait banner */}
                <View style={{ height: 220, borderWidth: 1, borderColor: (isSpouse ? spouseColor : stage?.color || C.gold) + '35', overflow: 'hidden', marginBottom: GAP, position: 'relative' }}>
                    {img && (
                        isSpouse
                            ? <Image source={img} style={{ width: '100%', height: '200%', position: 'absolute', top: 0 }} resizeMode="contain" />
                            : <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                    )}
                    <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,8,15,0.15)' }} />
                    {stage && (
                        <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: stage.color, paddingHorizontal: 8, paddingVertical: 3 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#000', letterSpacing: 1 }}>{stage.label}</Text>
                        </View>
                    )}
                    {isParent && (
                        <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: C.gold, paddingHorizontal: 8, paddingVertical: 3 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#000', letterSpacing: 1 }}>PARENT</Text>
                        </View>
                    )}
                    {isSpouse && (
                        <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: spouseColor, paddingHorizontal: 8, paddingVertical: 3 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#000', letterSpacing: 1 }}>SPOUSE</Text>
                        </View>
                    )}
                </View>

                {/* Spouse-specific stat cards */}
                {isSpouse && (
                    <>
                        <View style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
                            <View style={{ flex: 1, backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, padding: 12, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dim, marginBottom: 4, letterSpacing: 2 }}>MARRIED</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: spouseColor, lineHeight: 22 }}>{monthsMarried} <Text style={{ fontSize: 13 }}>mo</Text></Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, padding: 12, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dim, marginBottom: 4, letterSpacing: 2 }}>INCOME</Text>
                                {dep.isWorking
                                    ? <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.sage, lineHeight: 20 }}>+₹{(dep.income || 0).toLocaleString()}</Text>
                                    : <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim, lineHeight: 20 }}>Homemaker</Text>
                                }
                            </View>
                            <View style={{ flex: 1, backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, padding: 12, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dim, marginBottom: 4, letterSpacing: 2 }}>COST</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.red, lineHeight: 20 }}>-₹5k</Text>
                            </View>
                        </View>

                        <View style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: spouseColor + '25', padding: 14, marginBottom: GAP }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim, letterSpacing: 2 }}>HAPPINESS</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: hpColor(dep.happiness || 70) }}>{Math.round(dep.happiness || 70)}/100</Text>
                            </View>
                            <View style={{ height: 6, backgroundColor: C.bg }}>
                                <View style={{ height: '100%', width: `${Math.round(dep.happiness || 70)}%`, backgroundColor: hpColor(dep.happiness || 70) }} />
                            </View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, marginTop: 8 }}>
                                {dep.upskilling
                                    ? `Studying... ${dep.upskillingMonthsLeft || 0} months left before they start earning.`
                                    : dep.isWorking ? 'Working and supporting the household.'
                                    : 'Manages the home and keeps the family together.'}
                            </Text>
                        </View>

                        {/* Insurance status */}
                        {(() => {
                            const covered = (activeInsurance || []).some(i => {
                                const plan = INSURANCE_PLANS.find(p => p.id === i.planId);
                                return plan?.type === 'health';
                            });
                            return (
                                <View style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: covered ? C.sage + '40' : C.red + '30', padding: 14, marginBottom: GAP, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, letterSpacing: 2 }}>HEALTH INSURANCE</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: covered ? C.sage : C.red, marginTop: 3 }}>
                                            {covered ? 'Family covered' : 'Not insured'}
                                        </Text>
                                    </View>
                                    <View style={{ width: 10, height: 10, backgroundColor: covered ? C.sage : C.red }} />
                                </View>
                            );
                        })()}

                        {/* Upskill — only if homemaker and not already studying */}
                        {!dep.isWorking && !dep.upskilling && (
                            <TouchableOpacity
                                onPress={() => showDialog('Upskill Spouse',
                                    'Enroll your spouse in a 6-month career course for ₹50,000. They will start earning ₹25k–₹45k/mo after.',
                                    'warning', () => {
                                        const r = upskillSpouse();
                                        if (!r.success) showDialog('Cannot Upskill', r.msg, 'info', onClose);
                                        else onClose();
                                    }
                                )}
                                style={{ borderWidth: 1, borderColor: C.blue + '60', backgroundColor: C.blue + '10', padding: 14, marginBottom: GAP, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                                <View>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.blue, letterSpacing: 1 }}>UPSKILL SPOUSE</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>₹50,000 · 6-month course · earns after</Text>
                                </View>
                                <FontAwesome5 name="graduation-cap" size={18} color={C.blue + '80'} />
                            </TouchableOpacity>
                        )}
                        {dep.upskilling && (
                            <View style={{ borderWidth: 1, borderColor: C.blue + '40', backgroundColor: C.blue + '08', padding: 14, marginBottom: GAP }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.blue }}>COURSE IN PROGRESS</Text>
                                <View style={{ height: 4, backgroundColor: C.bg, marginTop: 8 }}>
                                    <View style={{ height: '100%', width: `${((6 - (dep.upskillingMonthsLeft || 0)) / 6) * 100}%`, backgroundColor: C.blue }} />
                                </View>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, marginTop: 6 }}>{dep.upskillingMonthsLeft || 0} months remaining</Text>
                            </View>
                        )}

                        {/* Family vacation */}
                        <TouchableOpacity
                            onPress={() => showDialog('Plan Family Vacation',
                                `Take the whole family on a trip!\nCosts ₹5,000 per person. Boosts happiness by +15.`,
                                'warning', () => {
                                    const r = planVacation();
                                    if (!r.success) showDialog('Cannot Plan', r.msg, 'info', onClose);
                                    else onClose();
                                }
                            )}
                            style={{ borderWidth: 1, borderColor: C.sage + '50', backgroundColor: C.sage + '08', padding: 14, marginBottom: GAP, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                            <View>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.sage, letterSpacing: 1 }}>PLAN FAMILY VACATION</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>₹5,000/person · +15 happiness · {1 + (dependents?.length || 0)} people</Text>
                            </View>
                            <Image source={require('../../assets/ui_comp/vacation.png')} style={{ width: 32, height: 32 }} resizeMode="contain" />
                        </TouchableOpacity>

                        {/* Divorce */}
                        <TouchableOpacity
                            onPress={() => showDialog('File for Divorce',
                                'This will end the marriage. You will pay ₹2,00,000 in settlement and lose 30 happiness points. This cannot be undone.',
                                'warning', () => { divorce(); onClose(); }
                            )}
                            style={{ borderWidth: 1, borderColor: C.red + '40', backgroundColor: C.red + '08', padding: 14, marginBottom: GAP, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                            <View>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.red, letterSpacing: 1 }}>FILE FOR DIVORCE</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>₹2,00,000 settlement · -30 happiness</Text>
                            </View>
                            <Image source={require('../../assets/ui_comp/divorce.png')} style={{ width: 32, height: 32 }} resizeMode="contain" />
                        </TouchableOpacity>
                    </>
                )}

                {/* Child/parent stat cards */}
                {!isSpouse && (
                    <>
                        <View style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
                            {isChild && (
                                <View style={{ flex: 1, backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, padding: 12, alignItems: 'center' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dim, marginBottom: 4, letterSpacing: 2 }}>AGE</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: stage.color, lineHeight: 24 }}>{Math.floor((dep.childAgeMonths || 0) / 12)} <Text style={{ fontSize: 13 }}>yrs</Text></Text>
                                </View>
                            )}
                            <View style={{ flex: 1, backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, padding: 12, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dim, marginBottom: 4, letterSpacing: 2 }}>HEALTH</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: hCol, lineHeight: 24 }}>{Math.round(hp)} <Text style={{ fontSize: 13 }}>/100</Text></Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, padding: 12, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dim, marginBottom: 4, letterSpacing: 2 }}>MONTHLY</Text>
                                {isChild ? (() => {
                                    const cam = dep.childAgeMonths || 0;
                                    const base = cam < 60 ? 8000 : cam < 216 ? 12000 : cam < 252 ? 25000 : 0;
                                    const extra = cam >= 12 && cam < 60
                                        ? (PRESCHOOL_TIERS.find(t => t.id === (dep.preschoolTier || 'home'))?.extraCost || 0)
                                        : cam >= 60 && cam < 216
                                        ? (SCHOOL_TIERS.find(t => t.id === (dep.schoolTier || 'government'))?.extraCost || 0)
                                        : 0;
                                    return <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.red, lineHeight: 20 }}>₹{((base + extra) / 1000).toFixed(0)}k</Text>;
                                })() : <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.red, lineHeight: 20 }}>{dep.caretaker ? '₹23k' : '₹15k'}</Text>}
                            </View>
                        </View>

                        <View style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: hCol + '30', padding: 14, marginBottom: GAP }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim, letterSpacing: 2 }}>WELLBEING</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: hCol }}>{statusText}</Text>
                            </View>
                            <View style={{ height: 6, backgroundColor: C.bg }}>
                                <View style={{ height: '100%', width: `${hp}%`, backgroundColor: hCol }} />
                            </View>
                        </View>

                        {/* ── Child-specific actions ── */}
                        {isChild && (
                            <>
                                {/* Education fund */}
                                {(() => {
                                    const fdTotal = (fixedDeposits || []).reduce((t, fd) => t + fd.currentValue, 0);
                                    const ppfBal  = ppf?.balance || 0;
                                    const fund    = fdTotal + ppfBal;
                                    return (
                                        <View style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.blue + '30', padding: 14, marginBottom: GAP, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <View>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, letterSpacing: 2 }}>EDUCATION FUND</Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: fund > 0 ? C.blue : C.dim, marginTop: 3 }}>
                                                    ₹{fund.toLocaleString()}
                                                </Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark }}>PPF + FDs combined</Text>
                                            </View>
                                            <FontAwesome5 name="graduation-cap" size={20} color={fund > 0 ? C.blue + '80' : C.dark} />
                                        </View>
                                    );
                                })()}

                                {/* Preschool tier — toddlers aged 1-5 yrs (12-60 months) */}
                                {(dep.childAgeMonths || 0) >= 12 && (dep.childAgeMonths || 0) < 60 && (
                                    <View style={{ borderWidth: 1, borderColor: C.pink + '40', backgroundColor: C.card, padding: 14, marginBottom: GAP }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, letterSpacing: 2, marginBottom: 10 }}>PRESCHOOL</Text>
                                        {PRESCHOOL_TIERS.map(tier => {
                                            const active = (dep.preschoolTier || 'home') === tier.id;
                                            return (
                                                <TouchableOpacity key={tier.id}
                                                    onPress={() => {
                                                        if (!active) showDialog(
                                                            `Switch to ${tier.label}?`,
                                                            `${tier.desc}\n\nExtra monthly cost: ${tier.extraCost > 0 ? `+₹${tier.extraCost.toLocaleString()}/mo` : 'Free'}\nCareer impact: ${tier.outcome}`,
                                                            'warning',
                                                            () => setChildPreschoolTier(dep.id, tier.id)
                                                        );
                                                    }}
                                                    activeOpacity={0.8}
                                                    style={{ borderWidth: 1, borderColor: active ? tier.color : C.border, backgroundColor: active ? tier.color + '15' : 'transparent', padding: 12, marginBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                                                >
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: active ? tier.color : C.dim, letterSpacing: 1 }}>{tier.label}</Text>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark }}>{tier.extraCost > 0 ? `+₹${tier.extraCost.toLocaleString()}/mo` : 'No extra cost'} · {tier.outcome}</Text>
                                                    </View>
                                                    {active && <FontAwesome5 name="check-circle" size={14} color={tier.color} />}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}

                                {/* School tier — only for school-age children (5-18 yrs = 60-216 months) */}
                                {(dep.childAgeMonths || 0) >= 60 && (dep.childAgeMonths || 0) < 216 && (
                                    <View style={{ borderWidth: 1, borderColor: C.blue + '40', backgroundColor: C.card, padding: 14, marginBottom: GAP }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, letterSpacing: 2, marginBottom: 10 }}>SCHOOL TIER</Text>
                                        {SCHOOL_TIERS.map(tier => {
                                            const active = (dep.schoolTier || 'government') === tier.id;
                                            return (
                                                <TouchableOpacity key={tier.id}
                                                    onPress={() => {
                                                        if (!active) showDialog(
                                                            `Switch to ${tier.label}?`,
                                                            `${tier.desc}\n\nExtra monthly cost: ${tier.extraCost > 0 ? `+₹${tier.extraCost.toLocaleString()}/mo` : 'Free'}\nCareer outcome: ${tier.outcome}`,
                                                            'warning',
                                                            () => setChildSchoolTier(dep.id, tier.id)
                                                        );
                                                    }}
                                                    activeOpacity={0.8}
                                                    style={{ borderWidth: 1, borderColor: active ? tier.color : C.border, backgroundColor: active ? tier.color + '15' : 'transparent', padding: 12, marginBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                                                >
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: active ? tier.color : C.dim, letterSpacing: 1 }}>{tier.label}</Text>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark }}>{tier.extraCost > 0 ? `+₹${tier.extraCost.toLocaleString()}/mo` : 'No extra cost'} · {tier.outcome}</Text>
                                                    </View>
                                                    {active && <FontAwesome5 name="check-circle" size={14} color={tier.color} />}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}

                                {/* Gift */}
                                <TouchableOpacity
                                    onPress={() => showDialog('Buy a Gift',
                                        `Spend ₹2,000 on a gift for ${dep.name}?\nRestores +15 HP and boosts happiness.`,
                                        'warning', () => {
                                            const r = giftChild(dep.id);
                                            if (!r.success) showDialog('Cannot Gift', r.msg, 'info', onClose);
                                        }
                                    )}
                                    style={{ borderWidth: 1, borderColor: C.pink + '50', backgroundColor: C.pink + '08', padding: 14, marginBottom: GAP, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                                >
                                    <View>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.pink, letterSpacing: 1 }}>BUY A GIFT</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>₹2,000 · +15 HP · +3 happiness</Text>
                                    </View>
                                    <FontAwesome5 name="gift" size={16} color={C.pink + '70'} />
                                </TouchableOpacity>
                            </>
                        )}

                        {/* ── Parent-specific actions ── */}
                        {isParent && (
                            <>
                                {/* Insurance status */}
                                {(() => {
                                    const covered = (activeInsurance || []).some(i => i.planId?.startsWith('health') || i.type === 'health');
                                    return (
                                        <View style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: covered ? C.sage + '40' : C.red + '30', padding: 14, marginBottom: GAP, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <View>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, letterSpacing: 2 }}>HEALTH INSURANCE</Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: covered ? C.sage : C.red, marginTop: 3 }}>
                                                    {covered ? 'Family floater covers them' : 'Not insured — get health cover'}
                                                </Text>
                                            </View>
                                            <View style={{ width: 10, height: 10, backgroundColor: covered ? C.sage : C.red }} />
                                        </View>
                                    );
                                })()}

                                {/* Medicine */}
                                <TouchableOpacity
                                    onPress={() => showDialog('Buy Medicine',
                                        `Spend ₹5,000 on medicine for ${dep.name}?\nRestores +20 HP.`,
                                        'warning', () => {
                                            const r = buyMedicine(dep.id);
                                            if (!r.success) showDialog('Cannot Buy', r.msg, 'info', onClose);
                                        }
                                    )}
                                    style={{ borderWidth: 1, borderColor: C.sage + '50', backgroundColor: C.sage + '08', padding: 14, marginBottom: GAP, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                                >
                                    <View>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.sage, letterSpacing: 1 }}>BUY MEDICINE</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>₹5,000 · +20 HP</Text>
                                    </View>
                                    <FontAwesome5 name="pills" size={16} color={C.sage + '70'} />
                                </TouchableOpacity>

                                {/* Caretaker toggle */}
                                <TouchableOpacity
                                    onPress={() => showDialog(dep.caretaker ? 'Remove Caretaker' : 'Hire Caretaker',
                                        dep.caretaker
                                            ? `Remove the caretaker for ${dep.name}? Health will decay faster without care.`
                                            : `Hire a full-time caretaker for ${dep.name}?\n+₹8,000/mo but health decays 60% slower.`,
                                        'warning', () => toggleCaretaker(dep.id)
                                    )}
                                    style={{ borderWidth: 1, borderColor: C.gold + (dep.caretaker ? 'aa' : '40'), backgroundColor: dep.caretaker ? C.gold + '15' : C.gold + '08', padding: 14, marginBottom: GAP, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                                >
                                    <View>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.gold, letterSpacing: 1 }}>
                                            {dep.caretaker ? 'CARETAKER: ACTIVE' : 'HIRE CARETAKER'}
                                        </Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>
                                            {dep.caretaker ? '₹8,000/mo · 60% slower health decay · tap to remove' : '+₹8,000/mo · 60% slower health decay'}
                                        </Text>
                                    </View>
                                    <FontAwesome5 name={dep.caretaker ? 'user-check' : 'user-plus'} size={16} color={C.gold + '80'} />
                                </TouchableOpacity>
                            </>
                        )}

                        {isParent ? (
                            // Parents don't need manual feeding — caretaker or monthly expense covers them
                            <View style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: dep.caretaker ? C.sage + '40' : C.border, padding: 14, marginBottom: GAP }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, letterSpacing: 2, marginBottom: 4 }}>CARE STATUS</Text>
                                {dep.caretaker ? (
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.sage, lineHeight: 20 }}>
                                        Caretaker on duty — feeding, medication, and daily care covered. Health decays at 40% of normal rate.
                                    </Text>
                                ) : (
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.gold, lineHeight: 20 }}>
                                        You cover basic needs via the ₹15,000/mo household expense. Hire a caretaker to slow health decline and provide dedicated care.
                                    </Text>
                                )}
                            </View>
                        ) : (
                            <>
                                <SectionLabel label="FEED FROM PANTRY" />
                                {pantryItems.length === 0 ? (
                                    <View style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, padding: 22, alignItems: 'center' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.dim, textAlign: 'center', lineHeight: 22 }}>Pantry is empty.{'\n'}Buy food from the Grocery Store first.</Text>
                                    </View>
                                ) : (
                                    pantryItems.map(entry => {
                                        const item = GROCERY_ITEMS.find(g => g.id === entry.itemId);
                                        if (!item) return null;
                                        return (
                                            <TouchableOpacity
                                                key={entry.itemId}
                                                onPress={() => showDialog(`Feed ${item.name}`,
                                                    `Give ${item.name} to ${dep.name}?\nRestores +${item.healthRestore} HP.`,
                                                    'warning', () => onFeed(dep.id, item.healthRestore, entry.itemId)
                                                )}
                                                style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border, backgroundColor: C.panel, padding: 12, marginBottom: 8, gap: 12 }}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.cream, lineHeight: 19 }}>{item.name}</Text>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim }}>×{entry.qty} in pantry</Text>
                                                </View>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.sage }}>+{item.healthRestore}HP</Text>
                                                <View style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.gold + '50', paddingHorizontal: 10, paddingVertical: 6 }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.gold }}>FEED</Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })
                                )}
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const INDIAN_MALE_NAMES = ['Aarav', 'Vihaan', 'Aditya', 'Rohan', 'Arjun', 'Sai', 'Karan', 'Rahul', 'Vikram', 'Sanjay', 'Amit', 'Anil', 'Raj', 'Suresh', 'Ramesh', 'Harish', 'Nitin', 'Prakash', 'Sunil', 'Vijay'];
const INDIAN_FEMALE_NAMES = ['Aadya', 'Diya', 'Ananya', 'Priya', 'Kavya', 'Neha', 'Pooja', 'Riya', 'Shruti', 'Sneha', 'Swati', 'Tanvi', 'Vidya', 'Maya', 'Meera', 'Nandini', 'Radha', 'Sita', 'Gita', 'Lata'];

// ── Marriage pick modal ───────────────────────────────────────────────────────
function MarriagePickModal({ onPick, onClose }) {
    const [selectedCandidate, setSelectedCandidate] = React.useState(null);

    const candidates = [
        { id: 'groom_v1', name: 'Groom I',   image: GROOM_IMG,    color: C.blue, type: 'Groom', scale: 1.15, top: '4%', desc: 'A thoughtful and caring partner. Values financial stability and loves cooking on weekends.' },
        { id: 'groom_v2', name: 'Groom II',  image: GROOM_V2_IMG, color: C.blue, type: 'Groom', scale: 1, top: '0%', desc: 'Adventurous and spontaneous. Always planning the next family trip and enjoys the outdoors.' },
        { id: 'groom_v3', name: 'Groom III', image: GROOM_V3_IMG, color: C.blue, type: 'Groom', scale: 1.15, top: '4%', desc: 'Calm, collected, and highly organized. Believes in steady investments and a peaceful home.' },
        { id: 'bride_v1', name: 'Bride I',   image: BRIDE_IMG,    color: C.pink, type: 'Bride', scale: 1.35, top: '-8%', desc: 'Warm, affectionate, and deeply family-oriented. Enjoys gardening and reading in her free time.' },
        { id: 'bride_v2', name: 'Bride II',  image: BRIDE_V2_IMG, color: C.pink, type: 'Bride', scale: 1, top: '-2%', desc: 'Ambitious and creative. Loves interior design and is always looking for new ways to grow.' },
        { id: 'bride_v3', name: 'Bride III', image: BRIDE_V3_IMG, color: C.pink, type: 'Bride', scale: 1.35, top: '-8%', desc: 'Practical, supportive, and grounded. Prefers a quiet evening at home over a loud party.' },
    ];

    return (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.97)', zIndex: 200, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '100%', height: '100%', backgroundColor: C.bg, overflow: 'hidden' }}>
    return (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.97)', zIndex: 200, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '100%', height: '100%', backgroundColor: C.bg, overflow: 'hidden' }}>
                {!selectedCandidate ? (
                    <>
                        {/* Banquet hall banner */}
                        <View style={{ height: 120, overflow: 'hidden', position: 'relative' }}>
                            <Image source={BANQUET_IMG} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,8,15,0.55)' }} />
                            <View style={{ position: 'absolute', inset: 0, justifyContent: 'flex-end', padding: 20 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.pink, letterSpacing: 4 }}>LIFE EVENT</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 32, color: C.cream, lineHeight: 34 }}>
                                    Who do you marry?
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderWidth: 1, borderColor: C.border, backgroundColor: 'rgba(6,8,15,0.8)', alignItems: 'center', justifyContent: 'center' }}>
                                <FontAwesome5 name="times" size={14} color={C.dim} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim, textAlign: 'center', paddingVertical: 14 }}>
                            ₹5L wedding cost  ·  Spouse may earn income
                        </Text>

                        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
                                {candidates.map(v => (
                                    <TouchableOpacity key={v.id} onPress={() => setSelectedCandidate(v)} activeOpacity={0.85}
                                        style={{ width: '31%', borderWidth: 1.5, borderColor: v.color + '60', backgroundColor: C.panel, overflow: 'hidden', marginBottom: 12 }}>
                                        <View style={{ height: 3, backgroundColor: v.color }} />
                                        <View style={{ aspectRatio: 0.65, overflow: 'hidden', position: 'relative', backgroundColor: C.card }}>
                                            <Image
                                                source={v.image}
                                                style={{ width: '100%', height: '200%', position: 'absolute', top: v.top, transform: [{ scale: v.scale || 1 }] }}
                                                resizeMode="contain"
                                            />
                                            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, backgroundColor: 'rgba(6,8,15,0.85)' }} />
                                            <View style={{ position: 'absolute', bottom: 8, left: 0, right: 0, alignItems: 'center' }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.cream }}>{v.name}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </>
                ) : (
                    <View style={{ padding: 24, flex: 1, justifyContent: 'center' }}>
                        <View style={{ flexDirection: 'row', gap: 24, marginBottom: 40, alignItems: 'center' }}>
                            <View style={{ width: 200, height: 380, alignItems: 'center', justifyContent: 'center' }}>
                                <Image
                                    source={selectedCandidate.image}
                                    style={{ width: '100%', height: '100%', transform: [{ scale: selectedCandidate.scale || 1 }] }}
                                    resizeMode="contain"
                                />
                            </View>
                            
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.cream, marginBottom: 12 }}>
                                    A life partner ready to share the journey.
                                </Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dim, lineHeight: 24 }}>
                                    {selectedCandidate.desc}
                                </Text>
                                
                                <View style={{ marginTop: 24, padding: 14, backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: C.borderLt }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim }}>• Wedding Cost: ₹5L</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim }}>• Career: Unknown (50% chance)</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 10 }}>
                            <TouchableOpacity onPress={() => setSelectedCandidate(null)}
                                style={{ flex: 1, borderWidth: 1, borderColor: C.border, paddingVertical: 14, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dim, letterSpacing: 2 }}>BACK</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onPick({ id: selectedCandidate.id, name: selectedCandidate.type })}
                                style={{ flex: 2, backgroundColor: selectedCandidate.color, paddingVertical: 14, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#fff', letterSpacing: 2 }}>MARRY {selectedCandidate.name.toUpperCase()}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FamilyScreen({ onClose, onGoToBank }) {
    const {
        playerName, playerAge, playerSprite, balance, creditScore, happiness, currentJob,
        dependents, marry, haveChild, feedDependent, addParent, expectingChild,
        upskillSpouse, divorce, giftChild, buyMedicine, toggleCaretaker, planVacation,
        activeInsurance, buyInsurance, cancelInsurance,
        ppf, fixedDeposits,
        loans, prepayLoan,
        getDependentCosts, setChildSchoolTier, setChildPreschoolTier,
        pantry, consumeFood, renameDependent,
        totalMonthsPlayed,
    } = useGame();

    const [dialog, setDialog]                     = useState({ visible: false, title: '', message: '', type: 'info', onConfirm: null });
    const [selectedDep, setSelectedDep]           = useState(null);
    const [showMarriagePick, setShowMarriagePick] = useState(false);
    const [showParentPick, setShowParentPick]     = useState(false);
    const [showLoanAdvisory, setShowLoanAdvisory] = useState(false);
    const [showNameBaby, setShowNameBaby]         = useState(false);
    const [babyNameInput, setBabyNameInput]       = useState('');
    const [childToName, setChildToName]           = useState(null);

    React.useEffect(() => {
        const unnamedBaby = dependents.find(d => d.type === 'child' && (d.name === '' || d.name === 'Baby'));
        if (unnamedBaby && !showNameBaby) {
            setChildToName(unnamedBaby.id);
            setBabyNameInput('');
            setShowNameBaby(true);
        }
    }, [dependents, showNameBaby]);

    const showDialog = (title, message, type = 'info', onConfirm = null, onCancel = null, cancelText = null) => {
        const close = () => setDialog(d => ({ ...d, visible: false }));
        setDialog({ visible: true, title, message, type,
            onConfirm: onConfirm ? () => { close(); onConfirm(); } : close,
            onCancel, cancelText,
        });
    };
    const closeDialog = () => setDialog(d => ({ ...d, visible: false }));

    const spouse      = dependents.find(d => d.type === 'spouse');
    const children    = dependents.filter(d => d.type === 'child');
    const parents     = dependents.filter(d => d.type === 'parent');
    const monthlyCost = getDependentCosts();

    const creditColor = creditScore >= 750 ? C.sage : creditScore >= 650 ? C.gold : C.red;
    const creditLabel = creditScore >= 800 ? 'EXCELLENT' : creditScore >= 750 ? 'GOOD' : creditScore >= 650 ? 'FAIR' : 'POOR';
    const hapColor    = (happiness || 50) >= 70 ? C.sage : (happiness || 50) >= 40 ? C.gold : C.red;

    const handleFeed = (depId, healthAmt, itemId) => {
        consumeFood(itemId);
        feedDependent(depId, healthAmt);
        closeDialog();
    };

    const spriteImg = getSpriteImage(playerSprite, playerAge);

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>

            {/* Banner — family house */}
            <View style={{ height: 130, overflow: 'hidden', position: 'relative' }}>
                <Image source={BANNER_IMG} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,8,15,0.48)' }} />
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, backgroundColor: 'rgba(6,8,15,0.75)' }} />
                <View style={{ position: 'absolute', inset: 0, paddingHorizontal: PAD, justifyContent: 'flex-end', paddingBottom: 14, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.gold, letterSpacing: 4 }}>MY FAMILY</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: C.cream, lineHeight: 30 }}>{playerName}  ·  {playerAge}</Text>
                    </View>
                    {monthlyCost > 0 && (
                        <View style={{ backgroundColor: 'rgba(6,8,15,0.9)', borderWidth: 1, borderColor: C.red + '40', paddingHorizontal: 12, paddingVertical: 6 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dim, letterSpacing: 2 }}>FAMILY COST</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.red }}>-₹{monthlyCost.toLocaleString()}/mo</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Stats row */}
            <View style={{ flexDirection: 'row', backgroundColor: C.panel, borderBottomWidth: 1, borderColor: C.border }}>
                {[
                    { label: 'CREDIT', value: creditScore, sub: creditLabel, color: creditColor },
                    { label: 'HAPPINESS', value: `${Math.round(happiness || 50)}`, sub: '/100', color: hapColor },
                    { label: 'MEMBERS', value: dependents.length + 1, sub: 'people', color: C.blue },
                ].map((t, i) => (
                    <View key={t.label} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRightWidth: i < 2 ? 1 : 0, borderColor: C.border }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dim, letterSpacing: 2 }}>{t.label}</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: t.color, lineHeight: 26 }}>{t.value}</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: t.color + 'aa' }}>{t.sub}</Text>
                    </View>
                ))}
            </View>

            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

                {/* Player + Spouse side by side */}
                <SectionLabel label="HOUSEHOLD" />
                <View style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
                    <PersonCard
                        image={spriteImg}
                        headCrop
                        name={playerName}
                        tag="YOU"
                        color={C.gold}
                        sub1={`Age ${playerAge}`}
                        sub2={`₹${balance.toLocaleString()}`}
                    />
                    {spouse ? (
                        <PersonCard
                            image={getSpouseImage(spouse.spouseSprite) || BRIDE_IMG}
                            headCrop
                            name={spouse.name}
                            tag="SPOUSE"
                            color={C.pink}
                            sub1={spouse.isWorking ? `+₹${(spouse.income || 0).toLocaleString()}/mo` : 'Homemaker'}
                            sub2="₹5,000/mo cost"
                            onPress={() => setSelectedDep(spouse)}
                        />
                    ) : (
                        <EmptySpouseCard onPress={() => {
                            if (playerAge < 21) {
                                showDialog(
                                    'You\'re Only ' + playerAge,
                                    `Marrying before 21 can limit your career growth and financial independence.\n\nYou may miss years of salary growth, promotions, and savings.\n\nAre you sure you want to proceed?`,
                                    'warning',
                                    () => { closeDialog(); setShowMarriagePick(true); }
                                );
                            } else {
                                setShowMarriagePick(true);
                            }
                        }} />
                    )}
                </View>

                {/* Children */}
                {(children.length > 0 || spouse) && <SectionLabel label="CHILDREN" />}

                {(() => {
                    // Build list: children + optional add-child slot
                    const slots = [...children.map(c => ({ type: 'child', data: c }))];
                    if (expectingChild) slots.push({ type: 'expecting', data: expectingChild });
                    if (spouse && children.length < 3 && !expectingChild) slots.push({ type: 'add' });

                    const rows = [];
                    for (let i = 0; i < slots.length; i += 2) {
                        const left = slots[i];
                        const right = slots[i + 1];
                        rows.push(
                            <View key={i} style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
                                {left.type === 'child'
                                    ? <ChildCard child={left.data} onPress={() => setSelectedDep(left.data)} />
                                    : left.type === 'expecting'
                                    ? <ExpectingChildCard data={left.data} />
                                    : <AddChildCard onPress={() => { const r = haveChild(); showDialog(r.success ? 'Expecting!' : 'Cannot', r.msg, r.success ? 'success' : 'error'); }} />
                                }
                                {right ? (
                                    right.type === 'child'
                                        ? <ChildCard child={right.data} onPress={() => setSelectedDep(right.data)} />
                                        : right.type === 'expecting'
                                        ? <ExpectingChildCard data={right.data} />
                                        : <AddChildCard onPress={() => { const r = haveChild(); showDialog(r.success ? 'Expecting!' : 'Cannot', r.msg, r.success ? 'success' : 'error'); }} />
                                ) : <View style={{ flex: 1 }} />}
                            </View>
                        );
                    }
                    return rows;
                })()}

                {/* Parents */}
                <SectionLabel label="PARENTS" />
                {(() => {
                    const slots = [
                        ...parents.map(p => ({ type: 'parent', data: p })),
                        ...(parents.length < 2 ? [{ type: 'add' }] : []),
                    ];
                    const rows = [];
                    for (let i = 0; i < slots.length; i += 2) {
                        const left  = slots[i];
                        const right = slots[i + 1];
                        rows.push(
                            <View key={i} style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
                                {left.type === 'parent' ? (
                                    <PersonCard
                                        image={left.data.parentType === 'mother' ? DEP_IMAGES.elderly_mother : left.data.parentType === 'father' ? DEP_IMAGES.elderly_father : DEP_IMAGES.elderly_couple}
                                        contain
                                        name={left.data.name}
                                        tag={left.data.parentType === 'mother' ? 'MOTHER' : left.data.parentType === 'father' ? 'FATHER' : 'PARENT'}
                                        color={C.gold}
                                        sub1="Under your care"
                                        sub2="₹15,000/mo"
                                        hp={left.data.health}
                                        onPress={() => setSelectedDep(left.data)}
                                    />
                                ) : (
                                    <AddParentCard onPress={() => setShowParentPick(true)} />
                                )}
                                {right ? (
                                    right.type === 'parent' ? (
                                        <PersonCard
                                            image={right.data.parentType === 'mother' ? DEP_IMAGES.elderly_mother : right.data.parentType === 'father' ? DEP_IMAGES.elderly_father : DEP_IMAGES.elderly_couple}
                                            contain
                                            name={right.data.name}
                                            tag={right.data.parentType === 'mother' ? 'MOTHER' : right.data.parentType === 'father' ? 'FATHER' : 'PARENT'}
                                            color={C.gold}
                                            sub1="Under your care"
                                            sub2="₹15,000/mo"
                                            hp={right.data.health}
                                            onPress={() => setSelectedDep(right.data)}
                                        />
                                    ) : (
                                        <AddParentCard onPress={() => setShowParentPick(true)} />
                                    )
                                ) : <View style={{ flex: 1 }} />}
                            </View>
                        );
                    }
                    return rows;
                })()}


                {/* Loans */}
                {loans.length > 0 && (
                    <>
                        <SectionLabel label="ACTIVE LOANS" />
                        {loans.map(loan => {
                            const prepayAmt = Math.min(loan.remainingPrincipal, Math.round(loan.emi * 6));
                            const canPrepay = balance >= prepayAmt;
                            const paidPct   = Math.min((1 - loan.remainingPrincipal / (loan.remainingPrincipal + loan.emi * loan.tenureRemaining)) * 100, 100);
                            return (
                                <View key={loan.id} style={{ borderWidth: 1, borderColor: C.red + '28', backgroundColor: C.panel, padding: 16, marginBottom: GAP }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream, flex: 1, lineHeight: 22 }}>
                                            {loan.loanTypeId?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || loan.type}
                                        </Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.red }}>₹{loan.emi.toLocaleString()}/mo</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                        <View style={{ flex: 1, height: 5, backgroundColor: C.bg }}>
                                            <View style={{ height: '100%', width: `${paidPct}%`, backgroundColor: C.sage }} />
                                        </View>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim }}>{Math.round(paidPct)}% paid</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => showDialog('Prepay Loan', `Pay ₹${prepayAmt.toLocaleString()} (6× EMI)?`, 'warning',
                                            () => { const r = prepayLoan(loan.id, prepayAmt); showDialog(r.success ? 'Prepaid!' : 'Failed', r.msg, r.success ? 'success' : 'error'); })}
                                        disabled={!canPrepay}
                                        style={{ paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: canPrepay ? C.gold + '55' : C.border, backgroundColor: canPrepay ? C.gold + '10' : 'transparent' }}
                                    >
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: canPrepay ? C.gold : C.dark, letterSpacing: 1 }}>PREPAY ₹{prepayAmt.toLocaleString()}</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </>
                )}

            </ScrollView>

            {selectedDep && (
                <DependentDetail dep={selectedDep} pantry={pantry} onFeed={handleFeed} onClose={() => setSelectedDep(null)} showDialog={showDialog} totalMonthsPlayed={totalMonthsPlayed} upskillSpouse={upskillSpouse} divorce={divorce} giftChild={giftChild} buyMedicine={buyMedicine} toggleCaretaker={toggleCaretaker} planVacation={planVacation} activeInsurance={activeInsurance} ppf={ppf} fixedDeposits={fixedDeposits} dependents={dependents} setChildSchoolTier={setChildSchoolTier} setChildPreschoolTier={setChildPreschoolTier} />
            )}

            {showMarriagePick && (
                <MarriagePickModal
                    onClose={() => setShowMarriagePick(false)}
                    onPick={(person) => {
                        setShowMarriagePick(false);
                        const r = marry(person.name, person.id);
                        if (!r.success && balance < 500000) {
                            setShowLoanAdvisory(true);
                        } else {
                            showDialog(r.success ? 'Married!' : 'Cannot Marry', r.msg, r.success ? 'success' : 'error');
                        }
                    }}
                />
            )}

            {/* Marriage Loan Advisory */}
            {showLoanAdvisory && (
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.92)', zIndex: 300, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.pink + '60', width: '100%', maxWidth: 380, overflow: 'hidden' }}>
                        <View style={{ height: 3, backgroundColor: C.pink }} />
                        <View style={{ padding: 20 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                <Image source={require('../../assets/ui_comp/familyicon.png')} style={{ width: 32, height: 32 }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.pink, flex: 1 }}>WEDDING ADVISORY</Text>
                            </View>

                            <View style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 12 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.cream, lineHeight: 20 }}>
                                    A wedding costs ₹5,00,000. Your current balance is ₹{balance.toLocaleString()}.
                                </Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, marginTop: 6, lineHeight: 18 }}>
                                    Shortfall: ₹{Math.max(0, 500000 - balance).toLocaleString()}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#0d1005', borderWidth: 1, borderColor: '#4ade8040', padding: 12, marginBottom: 16 }}>
                                <Image source={require('../../assets/ui_comp/borrow.png')} style={{ width: 22, height: 22, marginTop: 2 }} resizeMode="contain" />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#4ade80', marginBottom: 3 }}>PERSONAL LOAN OPTION</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim, lineHeight: 18 }}>
                                        Take a Personal Loan from the Bank (MONEY → BORROW). Interest rates start at 12% p.a. — borrow only what you need and repay quickly.
                                    </Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity
                                    onPress={() => { 
                                        setShowLoanAdvisory(false); 
                                        if (onGoToBank) onGoToBank();
                                        else onClose(); 
                                    }}
                                    activeOpacity={0.8}
                                    style={{ flex: 1, borderWidth: 1, borderColor: '#4ade80', backgroundColor: '#050f0a', paddingVertical: 12, alignItems: 'center' }}
                                >
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#4ade80', letterSpacing: 1 }}>GO TO BANK</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setShowLoanAdvisory(false)}
                                    activeOpacity={0.8}
                                    style={{ flex: 1, borderWidth: 1, borderColor: C.border, backgroundColor: 'transparent', paddingVertical: 12, alignItems: 'center' }}
                                >
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim, letterSpacing: 1 }}>NOT NOW</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {showParentPick && (
                <AddParentPickModal
                    existingParents={parents}
                    onClose={() => setShowParentPick(false)}
                    onPick={(option) => {
                        setShowParentPick(false);
                        const r = addParent(option.id);
                        showDialog(r.success ? `${option.name} Moved In!` : 'Cannot', r.msg, r.success ? 'success' : 'error');
                    }}
                />
            )}

            {/* Name Your Baby modal */}
            {showNameBaby && (
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.92)', zIndex: 200, alignItems: 'center', justifyContent: 'center', padding: PAD }}>
                    <View style={{ width: '100%', backgroundColor: C.panel, borderWidth: 1, borderColor: C.pink + '60' }}>
                        <View style={{ backgroundColor: C.pink, paddingVertical: 10, paddingHorizontal: PAD, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Image source={require('../../assets/dependents/baby son.png')} style={{ width: 28, height: 28 }} resizeMode="contain" />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#fff', letterSpacing: 2 }}>NAME YOUR BABY</Text>
                        </View>
                        <View style={{ padding: PAD }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim, marginBottom: 10 }}>
                                Choose a name for your new arrival. Leave blank for a random name.
                            </Text>
                            <TextInput
                                value={babyNameInput}
                                onChangeText={setBabyNameInput}
                                placeholder="Enter baby's name..."
                                placeholderTextColor={C.dark}
                                maxLength={20}
                                style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.pink + '50', color: C.cream, fontFamily: 'VT323_400Regular', fontSize: 22, padding: 12, marginBottom: 14 }}
                                autoFocus
                            />
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity onPress={() => {
                                        // Auto-name to prevent the useEffect from re-opening
                                        const child = dependents.find(d => d.id === childToName);
                                        const isFemale = child?.gender === 'female';
                                        const names = isFemale
                                            ? ['Aadya','Diya','Ananya','Priya','Kavya','Neha','Pooja','Riya','Shruti','Sneha']
                                            : ['Aarav','Vihaan','Aditya','Rohan','Arjun','Sai','Karan','Rahul','Vikram','Sanjay'];
                                        const randomName = names[Math.floor(Math.random() * names.length)];
                                        renameDependent(childToName, randomName);
                                        setShowNameBaby(false);
                                    }}
                                    style={{ flex: 1, borderWidth: 1, borderColor: C.border, paddingVertical: 12, alignItems: 'center' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim, letterSpacing: 2 }}>CANCEL</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowNameBaby(false);
                                        const finalName = babyNameInput.trim() || 'Baby';
                                        renameDependent(childToName, finalName);
                                        showDialog(`Welcome, ${finalName}!`, 'Your child has been named.', 'success');
                                    }}
                                    style={{ flex: 2, backgroundColor: C.pink, paddingVertical: 12, alignItems: 'center' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#fff', letterSpacing: 2 }}>WELCOME BABY →</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            <PixelDialog {...dialog} onConfirm={dialog.onConfirm || closeDialog} onCancel={dialog.onCancel || closeDialog} />
        </View>
    );
}
