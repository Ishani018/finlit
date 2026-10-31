import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useGame } from '../context/GameContext';
import { PETS, MAX_PETS, PET_BY_ID, lifestyleImage } from '../data/lifestyle';

const PAD = 14;
const TAB_STACK = 124; // the End Month dock and tab bar sit over the bottom of this screen
const ROOM = require('../../assets/rooms/pet_room.png');
const ROOM_SIZE = 250;
// Where each pet stands on the room's floor, as a share of the room picture
const SLOTS = [{ x: 0.36, y: 0.60 }, { x: 0.60, y: 0.66 }, { x: 0.48, y: 0.50 }];
const C = { bg: '#06080f', panel: '#0d1020', border: '#1a2040', sage: '#4ade80', red: '#f87171', gold: '#fbbf24', cream: '#c8d4f0', dim: '#7d8ab0', dark: '#5a6890', pink: '#ec4899' };
const money = (n) => `₹${Math.round(n).toLocaleString()}`;

function Stat({ label, value, color }) {
    return (
        <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 2 }}>{label}</Text>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 19, color: color || C.cream, lineHeight: 20 }}>{value}</Text>
        </View>
    );
}

export default function PetsScreen({ onBack }) {
    const { balance, pets, adoptPet, rehomePet, getLifestyleMonthly, totalMonthsPlayed } = useGame();
    const [tab, setTab] = useState(pets.length ? 'mine' : 'adopt');
    const [detail, setDetail] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [toast, setToast] = useState(null);
    const say = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3200); };
    const monthly = getLifestyleMonthly();

    const Tab = ({ id, label }) => (
        <TouchableOpacity onPress={() => setTab(id)} activeOpacity={0.8} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2, borderColor: tab === id ? C.gold : 'transparent' }}>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: tab === id ? C.gold : C.dark, letterSpacing: 2 }}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderColor: C.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={onBack} activeOpacity={0.7}><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: C.dim, lineHeight: 26 }}>‹</Text></TouchableOpacity>
                    <View>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, letterSpacing: 4 }}>COMPANIONS</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: C.cream, lineHeight: 28 }}>Pets</Text>
                    </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3 }}>CASH</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#38b2ac', lineHeight: 22 }}>{money(balance)}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: TAB_STACK + 30 }} showsVerticalScrollIndicator={false}>
                {/* The pet corner: the pets you have are standing in it */}
                <View style={{ alignItems: 'center', backgroundColor: '#05070d' }}>
                    <View style={{ width: ROOM_SIZE, height: ROOM_SIZE }}>
                        <Image source={ROOM} style={{ width: ROOM_SIZE, height: ROOM_SIZE }} resizeMode="contain" />
                        {pets.slice(0, SLOTS.length).map((o, i) => (
                            <View key={o.uid} style={{ position: 'absolute', left: SLOTS[i].x * ROOM_SIZE - 32, top: SLOTS[i].y * ROOM_SIZE - 56, width: 64, alignItems: 'center' }}>
                                <Image source={lifestyleImage(o.id)} style={{ width: 56, height: 56 }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#fff', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1 }}>{o.name}</Text>
                            </View>
                        ))}
                    </View>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, paddingBottom: 10, textAlign: 'center', paddingHorizontal: PAD }}>
                        {pets.length === 0 ? 'The pet corner is empty. Adopt someone below.' : `${pets.length} of ${MAX_PETS} pets at home`}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', paddingHorizontal: PAD, borderBottomWidth: 1, borderTopWidth: 1, borderColor: C.border }}>
                    <Tab id="adopt" label="ADOPT" /><Tab id="mine" label={`MY PETS (${pets.length})`} />
                </View>

                {tab === 'adopt' && (
                    <View style={{ padding: PAD }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, marginBottom: 12 }}>
                            A pet is company and a responsibility. It costs money every month, needs the vet now and then, and doesn't live forever.
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            {PETS.map(p => (
                                <TouchableOpacity key={p.id} onPress={() => setDetail(p)} activeOpacity={0.85}
                                    style={{ width: '48.5%', backgroundColor: C.panel, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 10 }}>
                                    <View style={{ height: 110, backgroundColor: '#0a0e22', alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={lifestyleImage(p.id)} style={{ width: 90, height: 90 }} resizeMode="contain" />
                                    </View>
                                    <View style={{ padding: 8 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream, lineHeight: 20 }}>{p.name}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.gold, lineHeight: 24 }}>{money(p.price)}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>care −{money(p.run)}/mo</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {tab === 'mine' && (
                    <View style={{ padding: PAD }}>
                        {pets.length === 0 ? (
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dim, textAlign: 'center', paddingVertical: 24 }}>No pets yet. Pick one from ADOPT.</Text>
                        ) : (
                            <View>
                                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                                    <Stat label="PET COSTS / MO" value={`−${money(monthly.cost)}`} color={C.red} />
                                </View>
                                {pets.map(o => {
                                    const p = PET_BY_ID[o.id]; if (!p) return null;
                                    const age = totalMonthsPlayed - o.boughtMonth;
                                    const confirming = confirm === o.uid;
                                                                        return (
                                        <View key={o.uid} style={{ backgroundColor: C.panel, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 10 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, gap: 12 }}>
                                                <View style={{ width: 70, height: 70, backgroundColor: '#0a0e22', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Image source={lifestyleImage(o.id)} style={{ width: 62, height: 62 }} resizeMode="contain" />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: C.cream, lineHeight: 24 }}>{o.name}</Text>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim }}>{p.name} · {age < 12 ? `${age} months` : `${Math.floor(age / 12)} years`} with you</Text>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.red }}>−{money(p.run)} a month</Text>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: C.border }}>
                                                <TouchableOpacity onPress={() => { if (!confirming) { setConfirm(o.uid); return; } const r = rehomePet(o.uid); setConfirm(null); say(r.msg, r.success); }} activeOpacity={0.6} style={{ flex: 1, height: 42, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.red, letterSpacing: 2 }}>{confirming ? 'TAP AGAIN TO REHOME' : 'REHOME'}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {detail && (() => {
                const p = detail, full = pets.length >= MAX_PETS, poor = balance < p.price;
                return (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 15 }}>
                        <TouchableOpacity activeOpacity={1} onPress={() => setDetail(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(3,4,9,0.8)' }} />
                        <View style={{ backgroundColor: C.panel, borderTopWidth: 1, borderColor: '#2a3560', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 14, paddingBottom: 14 + TAB_STACK }}>
                            <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                                <View style={{ width: 110, height: 110, backgroundColor: '#0a0e22', alignItems: 'center', justifyContent: 'center' }}>
                                    <Image source={lifestyleImage(p.id)} style={{ width: 96, height: 96 }} resizeMode="contain" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: C.cream, lineHeight: 30 }}>{p.name}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim, lineHeight: 17 }}>{p.perk}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dark }}>Lives about {p.lifeYears} years</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', marginVertical: 12 }}>
                                <Stat label="FEE" value={money(p.price)} color={C.gold} />
                                <Stat label="CARE / MO" value={`−${money(p.run)}`} color={C.red} />
                            </View>
                            <TouchableOpacity disabled={full || poor} onPress={() => { const r = adoptPet(p.id); setDetail(null); say(r.msg, r.success); if (r.success) setTab('mine'); }} activeOpacity={0.85}
                                style={{ height: 48, borderRadius: 8, backgroundColor: full || poor ? '#141b36' : C.gold, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: full || poor ? C.dim : '#2a1c00', letterSpacing: 2 }}>{full ? `YOU HAVE ${MAX_PETS} PETS ALREADY` : poor ? `NEED ${money(p.price - balance)} MORE` : `ADOPT FOR ${money(p.price)}`}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setDetail(null)} style={{ height: 38, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dim }}>Back</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            })()}

            {toast && (
                <View style={{ position: 'absolute', bottom: TAB_STACK + 12, left: PAD, right: PAD, backgroundColor: 'rgba(8,12,24,0.96)', borderRadius: 10, borderWidth: 1, borderColor: (toast.ok ? C.sage : C.red) + '66', padding: 12, alignItems: 'center', zIndex: 30 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: toast.ok ? C.cream : C.red, textAlign: 'center' }}>{toast.msg}</Text>
                </View>
            )}
        </View>
    );
}
