import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { INSURANCE_PLANS } from '../data/insurance';
import { GROCERY_ITEMS } from '../data/groceries';
import { getSpriteImage, SPRITE_MAP } from '../data/spriteMap';
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
    adopted_baby:       require('../../assets/dependents/adopted baby.png'),
};

const INSURE_COLORS = { health: '#f87171', life: '#3b82f6', home: '#fbbf24' };
const INSURE_IMAGES = {
    health: require('../../assets/jobs/chemist drugstore.png'),
    life:   require('../../assets/bank.png'),
    home:   require('../../assets/properties/1bhk_starter_apartment.png'),
};

const GROOM_IMG = SPRITE_MAP['young_raj_1'];
const BRIDE_IMG = SPRITE_MAP['young_pia_1'];

const getSpouseImage = (s) =>
    s === 'groom' ? GROOM_IMG : s === 'bride' ? BRIDE_IMG : null;

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
function PersonCard({ image, headCrop, name, tag, color, sub1, sub2, hp, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.85 : 1}
            style={{ flex: 1, borderWidth: 1, borderColor: C.border, backgroundColor: C.panel, overflow: 'hidden' }}>

            {/* Portrait image — squarish, sprite contained with padding so it never touches edges */}
            <View style={{ width: '100%', aspectRatio: 0.85, backgroundColor: C.card, overflow: 'hidden', position: 'relative' }}>
                {image ? (
                    headCrop
                        ? <Image source={image} style={{ width: '170%', height: '170%', position: 'absolute', top: '-5%', left: '-35%' }} resizeMode="contain" />
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
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dark, marginTop: 3 }}>₹8k/mo</Text>
            </View>
        </TouchableOpacity>
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
function DependentDetail({ dep, pantry, onFeed, onClose, showDialog }) {
    const isChild  = dep.type === 'child';
    const isParent = dep.type === 'parent';
    const hp       = dep.health ?? 80;
    const hCol     = hpColor(hp);
    const stage    = isChild ? getChildStage(dep.childAgeMonths || 0) : null;
    const img      = isChild ? getChildImage(dep.gender, dep.childAgeMonths || 0)
                             : isParent ? DEP_IMAGES.elderly_parents : null;
    const pantryItems = (pantry || []).filter(p => p.qty > 0);
    const statusText  = hp >= 70 ? 'Healthy and happy!'
                      : hp >= 40 ? 'Could use some food and care.'
                      : hp >= 20 ? 'Not well — feed them soon.'
                      : 'Critical! Needs immediate care.';

    return (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: C.bg, zIndex: 50 }}>
            <View style={{ backgroundColor: C.panel, paddingTop: 14, paddingBottom: 12, paddingHorizontal: PAD, borderBottomWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: C.cream }}>{dep.name}</Text>
                <TouchableOpacity onPress={onClose} style={{ width: 34, height: 34, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome5 name="times" size={13} color={C.dim} />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
                <View style={{ height: 200, borderWidth: 1, borderColor: (stage?.color || C.gold) + '35', overflow: 'hidden', marginBottom: GAP }}>
                    {img && <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />}
                    <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,8,15,0.2)' }} />
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
                </View>

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
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.red, lineHeight: 20 }}>{isChild ? (stage?.cost || '₹8k') : '₹15k'}</Text>
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

                <SectionLabel label="FEED FROM PANTRY" />
                {pantryItems.length === 0 ? (
                    <View style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, padding: 22, alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.dim, textAlign: 'center', lineHeight: 22 }}>Pantry is empty.{'\n'}Buy food from the Kirana Store first.</Text>
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
            </ScrollView>
        </View>
    );
}

// ── Marriage pick modal ───────────────────────────────────────────────────────
function MarriagePickModal({ onPick, onClose }) {
    const candidates = [
        { id: 'groom', name: 'Groom', image: GROOM_IMG, color: C.blue,  label: 'GROOM' },
        { id: 'bride', name: 'Bride', image: BRIDE_IMG, color: C.pink,  label: 'BRIDE' },
    ];

    return (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.97)', zIndex: 200, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '92%', maxWidth: 380, borderWidth: 1, borderColor: C.borderLt, backgroundColor: C.bg, overflow: 'hidden' }}>
                {/* Banquet hall banner */}
                <View style={{ height: 120, overflow: 'hidden', position: 'relative' }}>
                    <Image source={BANQUET_IMG} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,8,15,0.55)' }} />
                    <View style={{ position: 'absolute', inset: 0, justifyContent: 'flex-end', padding: 14 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.pink, letterSpacing: 4 }}>LIFE EVENT</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: C.cream, lineHeight: 28 }}>Who do you marry?</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderWidth: 1, borderColor: C.border, backgroundColor: 'rgba(6,8,15,0.8)', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome5 name="times" size={12} color={C.dim} />
                    </TouchableOpacity>
                </View>

                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, textAlign: 'center', paddingVertical: 10 }}>
                    ₹5L wedding cost  ·  Spouse may earn income
                </Text>

                <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 16, gap: 12 }}>
                    {candidates.map(p => (
                        <TouchableOpacity key={p.id} onPress={() => onPick(p)} activeOpacity={0.85}
                            style={{ flex: 1, borderWidth: 1.5, borderColor: p.color + '60', backgroundColor: C.panel, overflow: 'hidden' }}>
                            <View style={{ height: 3, backgroundColor: p.color }} />
                            <View style={{ aspectRatio: 0.8, overflow: 'hidden', position: 'relative' }}>
                                {p.image
                                    ? <Image source={p.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                    : <View style={{ flex: 1, backgroundColor: p.color + '08' }} />
                                }
                                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(6,8,15,0.85)' }} />
                                <View style={{ position: 'absolute', bottom: 10, left: 0, right: 0, alignItems: 'center' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.cream, lineHeight: 24 }}>{p.name}</Text>
                                    <View style={{ backgroundColor: p.color, paddingHorizontal: 10, paddingVertical: 2, marginTop: 4 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#000', letterSpacing: 2 }}>{p.label}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ padding: 10 }}>
                                <View style={{ borderWidth: 1, borderColor: p.color + '50', backgroundColor: p.color + '12', paddingVertical: 8, alignItems: 'center' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: p.color, letterSpacing: 2 }}>CHOOSE</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FamilyScreen({ onClose }) {
    const {
        playerName, playerAge, playerSprite, balance, creditScore, happiness,
        dependents, marry, haveChild, feedDependent,
        activeInsurance, buyInsurance, cancelInsurance,
        loans, prepayLoan,
        getDependentCosts,
        pantry, consumeFood,
    } = useGame();

    const [dialog, setDialog]                     = useState({ visible: false, title: '', message: '', type: 'info', onConfirm: null });
    const [selectedDep, setSelectedDep]           = useState(null);
    const [showMarriagePick, setShowMarriagePick] = useState(false);

    const showDialog = (title, message, type = 'info', onConfirm = null) =>
        setDialog({ visible: true, title, message, type, onConfirm: onConfirm || (() => setDialog(d => ({ ...d, visible: false }))) });
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

    const spriteImg = getSpriteImage(playerSprite);

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
                            image={getSpouseImage(spouse.spouseSprite)}
                            name={spouse.name}
                            tag="SPOUSE"
                            color={C.pink}
                            sub1={spouse.isWorking ? `+₹${(spouse.income || 0).toLocaleString()}/mo` : 'Homemaker'}
                            sub2="₹5,000/mo cost"
                        />
                    ) : (
                        <EmptySpouseCard onPress={() => setShowMarriagePick(true)} />
                    )}
                </View>

                {/* Children */}
                {(children.length > 0 || spouse) && <SectionLabel label="CHILDREN" />}

                {(() => {
                    // Build list: children + optional add-child slot
                    const slots = [...children.map(c => ({ type: 'child', data: c }))];
                    if (spouse && children.length < 3) slots.push({ type: 'add' });

                    const rows = [];
                    for (let i = 0; i < slots.length; i += 2) {
                        const left = slots[i];
                        const right = slots[i + 1];
                        rows.push(
                            <View key={i} style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
                                {left.type === 'child'
                                    ? <ChildCard child={left.data} onPress={() => setSelectedDep(left.data)} />
                                    : <AddChildCard onPress={() => { const r = haveChild(); showDialog(r.success ? 'Baby!' : 'Cannot', r.msg, r.success ? 'success' : 'error'); }} />
                                }
                                {right ? (
                                    right.type === 'child'
                                        ? <ChildCard child={right.data} onPress={() => setSelectedDep(right.data)} />
                                        : <AddChildCard onPress={() => { const r = haveChild(); showDialog(r.success ? 'Baby!' : 'Cannot', r.msg, r.success ? 'success' : 'error'); }} />
                                ) : <View style={{ flex: 1 }} />}
                            </View>
                        );
                    }
                    return rows;
                })()}

                {/* Parents */}
                {parents.length > 0 && (
                    <>
                        <SectionLabel label="PARENTS" />
                        <View style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
                            {parents.map(parent => (
                                <PersonCard
                                    key={parent.id}
                                    image={DEP_IMAGES.elderly_parents}
                                    name={parent.name}
                                    tag="PARENT"
                                    color={C.gold}
                                    sub1="Under your care"
                                    sub2="₹15,000/mo"
                                    hp={parent.health}
                                    onPress={() => setSelectedDep(parent)}
                                />
                            ))}
                            {parents.length === 1 && <View style={{ flex: 1 }} />}
                        </View>
                    </>
                )}


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
                <DependentDetail dep={selectedDep} pantry={pantry} onFeed={handleFeed} onClose={() => setSelectedDep(null)} showDialog={showDialog} />
            )}

            {showMarriagePick && (
                <MarriagePickModal
                    onClose={() => setShowMarriagePick(false)}
                    onPick={(person) => {
                        setShowMarriagePick(false);
                        const r = marry(person.name, person.id);
                        showDialog(r.success ? 'Married!' : 'Cannot Marry', r.msg, r.success ? 'success' : 'error');
                    }}
                />
            )}

            <PixelDialog {...dialog} onConfirm={dialog.onConfirm || closeDialog} />
        </View>
    );
}
