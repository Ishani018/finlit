import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlayerSprite from './PlayerSprite';
import { getSpriteImage } from '../data/spriteMap';
import { ACC_SLOTS, ACC_ITEMS } from '../data/accessories';

const ROOM = require('../../assets/hostel.png');
const GOLD = '#fbbf24';
const PAD = 14;
const COLS = 3;
const TILE_GAP = 8;

const STAGES = [
    { label: 'YOUNG', age: 20 },
    { label: 'RISING', age: 27 },
    { label: 'PRIME', age: 40 },
    { label: 'SENIOR', age: 55 },
];

function Corners({ color }) {
    return [
        { top: 0, left: 0, borderTopWidth: 1, borderLeftWidth: 1 },
        { top: 0, right: 0, borderTopWidth: 1, borderRightWidth: 1 },
        { bottom: 0, left: 0, borderBottomWidth: 1, borderLeftWidth: 1 },
        { bottom: 0, right: 0, borderBottomWidth: 1, borderRightWidth: 1 },
    ].map((s, i) => <View key={i} style={[{ position: 'absolute', width: 8, height: 8, borderColor: color }, s]} />);
}

// Head-and-shoulders crop of the sprite wearing `look`, used inside the option tiles.
function Preview({ spriteId, age, look, w, h, slot }) {
    const src = getSpriteImage(spriteId, age);
    const sw = w * 2.1, sh = sw / 0.363;
    return (
        <View style={{ width: w, height: h, overflow: 'hidden' }}>
            <PlayerSprite source={src} spriteId={spriteId} age={age} look={look}
                style={{ position: 'absolute', width: sw, height: sh, left: w / 2 - sw * 0.54, top: slot === 'neck' ? -sh * 0.145 : sh * 0.04 }} />
        </View>
    );
}

// Props: spriteId, name, look, onSave({ name, look }), onClose, title, saveLabel, canEditName
export default function CustomiseScreen({ spriteId, name: initialName = '', look: initialLook, onSave, onClose, title = 'Your look', saveLabel = 'SAVE LOOK', startAge = 20 }) {
    const [name, setName] = useState(initialName);
    const [look, setLook] = useState(initialLook || { head: null, neck: null, hair: null });
    const [slot, setSlot] = useState('neck');
    const [stage, setStage] = useState(STAGES.findIndex(s => s.age >= startAge) === -1 ? 0 : Math.max(0, STAGES.findIndex(s => s.age >= startAge)));
    const [gridW, setGridW] = useState(0);

    const age = STAGES[stage].age;
    const items = ACC_ITEMS[slot];
    const tileW = gridW ? Math.floor((gridW - TILE_GAP * (COLS - 1)) / COLS) : 100;
    const heroSrc = getSpriteImage(spriteId, age);
    const wearing = ACC_SLOTS.map(s => look[s.id] && ACC_ITEMS[s.id].find(i => i.id === look[s.id])?.label).filter(Boolean);
    const trimmed = name.trim();

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#06080f', zIndex: 800 }}>
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#1a2040' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity onPress={onClose} activeOpacity={0.7}><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: '#7d8ab0', lineHeight: 26 }}>‹</Text></TouchableOpacity>
                        <View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#5a6890', letterSpacing: 4 }}>CUSTOMISE</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', lineHeight: 26 }}>{title}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => setLook({ head: null, neck: null, hair: null })} activeOpacity={0.8}
                        style={{ paddingVertical: 5 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#a8b4d8', letterSpacing: 2, textDecorationLine: 'underline' }}>RESET</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 12 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    {/* Hero: room, platform, sprite, name plate */}
                    <View style={{ height: 330, backgroundColor: '#0a0e22', overflow: 'hidden', borderBottomWidth: 1, borderColor: '#2a3560', alignItems: 'center' }}>
                        <Image source={ROOM} style={{ position: 'absolute', left: -60, top: -50, width: 520, height: 520, opacity: 0.22 }} resizeMode="cover" />
                        <View style={{ position: 'absolute', bottom: 40, width: 200, height: 34, borderRadius: 100, backgroundColor: '#1a2244', borderWidth: 2, borderColor: '#2a3560' }} />
                        <View style={{ position: 'absolute', bottom: 48, width: 164, height: 18, borderRadius: 100, backgroundColor: '#10163a' }} />
                        <PlayerSprite source={heroSrc} spriteId={spriteId} age={age} look={look}
                            style={{ position: 'absolute', bottom: 56, width: 190, height: 262 }} />
                        <View style={{ position: 'absolute', bottom: 8, minWidth: 130, paddingHorizontal: 18, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: GOLD, backgroundColor: 'rgba(6,8,15,0.92)', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: GOLD, letterSpacing: 3 }}>{(trimmed || 'YOU').toUpperCase()}</Text>
                        </View>
                        {/* Age preview */}
                        <View style={{ position: 'absolute', left: 10, top: 10, gap: 6 }}>
                            {STAGES.map((s, i) => (
                                <TouchableOpacity key={s.label} onPress={() => setStage(i)} activeOpacity={0.8}
                                    style={{ paddingVertical: 2 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: i === stage ? GOLD : '#7d8ab0', letterSpacing: 2, textDecorationLine: i === stage ? 'underline' : 'none' }}>{s.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={{ paddingHorizontal: PAD, paddingTop: 10, gap: 10 }}>
                        {/* Name */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0d1020', borderWidth: 1, borderColor: '#1a2040', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#5a6890', letterSpacing: 4 }}>NAME</Text>
                                <TextInput value={name} onChangeText={t => setName(t.slice(0, 20))} placeholder="Your name" placeholderTextColor="#2a3860"
                                    selectionColor={GOLD} underlineColorAndroid="transparent" maxLength={20}
                                    style={[{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#c8d4f0', padding: 0, margin: 0, height: 28 }, Platform.OS === 'web' ? { outlineStyle: 'none' } : null]} />
                            </View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#7d8ab0' }}>{name.length} / 20 ✎</Text>
                        </View>

                        {/* Slot tabs */}
                        <View style={{ flexDirection: 'row', gap: 22, borderBottomWidth: 1, borderColor: '#1a2040' }}>
                            {ACC_SLOTS.map(s => (
                                <TouchableOpacity key={s.id} onPress={() => setSlot(s.id)} activeOpacity={0.8}
                                    style={{ paddingVertical: 6, borderBottomWidth: 2, borderColor: slot === s.id ? GOLD : 'transparent' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: slot === s.id ? GOLD : '#7d8ab0', letterSpacing: 2 }}>{s.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Options */}
                        <View onLayout={e => setGridW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: TILE_GAP }}>
                            {[{ id: null, label: 'None' }, ...items].map(it => {
                                const on = (look[slot] || null) === it.id;
                                return (
                                    <TouchableOpacity key={it.id || 'none'} activeOpacity={0.85}
                                        onPress={() => setLook(l => ({ ...l, [slot]: it.id }))}
                                        style={{ width: tileW, height: 118, borderRadius: 10, overflow: 'hidden', backgroundColor: '#0d1020', borderWidth: 1, borderColor: on ? GOLD : '#1e2840' }}>
                                        <Preview spriteId={spriteId} age={age} look={{ ...look, [slot]: it.id }} w={tileW - 2} h={84} slot={slot} />
                                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(6,8,15,0.84)', borderTopWidth: 1, borderColor: 'rgba(200,212,240,0.1)' }}>
                                            <Text numberOfLines={1} style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: on ? GOLD : '#c8d4f0' }}>{it.label}</Text>
                                        </View>
                                        {on ? <Corners color={GOLD} /> : null}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </ScrollView>

                {/* Dock */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0a0d1a', borderTopWidth: 1, borderColor: '#1a2040', paddingHorizontal: PAD, paddingVertical: 10 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#7d8ab0' }}>Wearing</Text>
                        <Text numberOfLines={1} style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#c8d4f0', lineHeight: 18 }}>{wearing.length ? wearing.join(', ') : 'Nothing extra'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => onSave({ name: trimmed, look })} disabled={trimmed.length < 2} activeOpacity={0.85}
                        style={{ paddingHorizontal: 22, height: 46, borderRadius: 10, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', opacity: trimmed.length < 2 ? 0.4 : 1 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#2a1c00', letterSpacing: 2 }}>{saveLabel}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}
