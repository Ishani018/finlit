import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useGame } from '../context/GameContext';
import { GADGETS, PETS, MAX_PETS, GADGET_BY_ID, PET_BY_ID, gadgetValue, lifestyleImage, GADGET_RESALE } from '../data/lifestyle';

const PAD = 14;
const TAB_STACK = 124; // the End Month dock and tab bar sit over the bottom of this screen
const C = { bg: '#06080f', panel: '#0d1020', border: '#1a2040', sage: '#4ade80', red: '#f87171', gold: '#fbbf24', cream: '#c8d4f0', dim: '#7d8ab0', dark: '#5a6890', pink: '#ec4899', blue: '#60a5fa' };
const money = (n) => `₹${Math.round(n).toLocaleString()}`;

function Stat({ label, value, color }) {
    return (
        <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 2 }}>{label}</Text>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: color || C.cream, lineHeight: 19 }}>{value}</Text>
        </View>
    );
}

export default function LifestyleScreen({ onBack, initialTab = 'gadgets' }) {
    const { balance, gadgets, pets, buyGadget, sellGadget, adoptPet, rehomePet, getLifestyleMonthly, totalMonthsPlayed } = useGame();
    const [tab, setTab] = useState(initialTab);
    const [toast, setToast] = useState(null);
    const [confirm, setConfirm] = useState(null);   // uid awaiting a second tap
    const say = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };
    const monthly = getLifestyleMonthly();

    const Tab = ({ id, label }) => (
        <TouchableOpacity onPress={() => setTab(id)} activeOpacity={0.8} style={{ flex: 1, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: tab === id ? C.gold : '#141b36' }}>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: tab === id ? '#2a1c00' : '#a8b4d8', letterSpacing: 1 }}>{label}</Text>
        </TouchableOpacity>
    );

    const Card = ({ id, title, sub, price, priceLabel, stats, button, onPress, disabled, owned }) => (
        <View style={{ backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: owned ? C.sage + '66' : C.border, overflow: 'hidden', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row' }}>
                <View style={{ width: 112, height: 112, backgroundColor: '#0a0e22', alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={lifestyleImage(id)} style={{ width: 88, height: 88 }} resizeMode="contain" />
                </View>
                <View style={{ flex: 1, padding: 10 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.cream, lineHeight: 22 }}>{title}</Text>
                    <Text numberOfLines={2} style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim, lineHeight: 15, marginBottom: 4 }}>{sub}</Text>
                    <View style={{ flexDirection: 'row' }}>{stats}</View>
                </View>
            </View>
            <TouchableOpacity disabled={disabled} onPress={onPress} activeOpacity={0.85} style={{ height: 40, backgroundColor: disabled ? '#0a0d1a' : button.bg, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.5 : 1 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: disabled ? C.dark : button.fg, letterSpacing: 1 }}>{priceLabel}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderColor: C.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={onBack} activeOpacity={0.7}><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: C.dim, lineHeight: 26 }}>‹</Text></TouchableOpacity>
                    <View>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, letterSpacing: 4 }}>HOME & HEART</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: C.cream, lineHeight: 28 }}>Gadgets & Pets</Text>
                    </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3 }}>CASH</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#38b2ac', lineHeight: 22 }}>{money(balance)}</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: PAD, paddingTop: 10 }}>
                <Tab id="gadgets" label="GADGETS" /><Tab id="pets" label="PETS" /><Tab id="mine" label={`MINE (${gadgets.length + pets.length})`} />
            </View>

            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
                {tab === 'gadgets' && GADGETS.map(g => {
                    const owned = gadgets.some(o => o.id === g.id);
                    const poor = balance < g.price;
                    return (
                        <Card key={g.id} id={g.id} title={g.name} sub={g.perk} owned={owned}
                            stats={<><Stat label="MOOD" value={`+${g.mood}`} color={C.sage} /><Stat label="RUNS" value={g.run ? `−${money(g.run)}` : 'free'} color={g.run ? C.red : C.dim} />{g.health ? <Stat label="HEALTH" value={`+${g.health}`} color={C.sage} /> : null}</>}
                            priceLabel={owned ? 'OWNED' : poor ? `${money(g.price)} · NOT ENOUGH CASH` : `BUY ${money(g.price)}`}
                            button={{ bg: C.gold, fg: '#2a1c00' }} disabled={owned || poor}
                            onPress={() => { const r = buyGadget(g.id); say(r.msg, r.success); }} />
                    );
                })}

                {tab === 'pets' && (
                    <View>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, marginBottom: 10 }}>Pets love you back and cost a little every month. They need the vet now and then, and they do not live forever. You can have up to {MAX_PETS}.</Text>
                        {PETS.map(p => {
                            const poor = balance < p.price, full = pets.length >= MAX_PETS;
                            return (
                                <Card key={p.id} id={p.id} title={p.name} sub={`${p.perk} Lives about ${p.lifeYears} years.`}
                                    stats={<><Stat label="MOOD" value={`+${p.mood}`} color={C.sage} /><Stat label="CARE / MO" value={`−${money(p.run)}`} color={C.red} /></>}
                                    priceLabel={full ? 'YOU HAVE ENOUGH PETS' : poor ? `${money(p.price)} · NOT ENOUGH CASH` : `ADOPT ${money(p.price)}`}
                                    button={{ bg: C.pink, fg: '#2a0014' }} disabled={full || poor}
                                    onPress={() => { const r = adoptPet(p.id); say(r.msg, r.success); }} />
                            );
                        })}
                    </View>
                )}

                {tab === 'mine' && (
                    gadgets.length + pets.length === 0 ? (
                        <View style={{ alignItems: 'center', paddingVertical: 50 }}>
                            <Image source={lifestyleImage('pet_cat')} style={{ width: 110, height: 110, opacity: 0.3 }} resizeMode="contain" />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.dim, textAlign: 'center', marginTop: 8 }}>Nothing yet.{'\n'}Buy a gadget or adopt a pet.</Text>
                        </View>
                    ) : (
                        <View>
                            <View style={{ flexDirection: 'row', backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 12 }}>
                                <Stat label="COSTS / MO" value={`−${money(monthly.cost)}`} color={C.red} />
                                <Stat label="MOOD / MO" value={`+${monthly.mood.toFixed(1)}`} color={C.sage} />
                                <Stat label="HEALTH / MO" value={`+${monthly.health.toFixed(1)}`} color={C.sage} />
                            </View>
                            {pets.map(o => {
                                const p = PET_BY_ID[o.id]; if (!p) return null;
                                const age = totalMonthsPlayed - o.boughtMonth;
                                const confirming = confirm === o.uid;
                                return (
                                    <View key={o.uid} style={{ backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.pink + '55', marginBottom: 10, flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10 }}>
                                        <Image source={lifestyleImage(o.id)} style={{ width: 72, height: 72 }} resizeMode="contain" />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.cream, lineHeight: 22 }}>{o.name}</Text>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim }}>{p.name} · {age < 12 ? `${age} months` : `${Math.floor(age / 12)} years`} with you</Text>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.sage }}>+{p.mood} mood · −{money(p.run)}/mo</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => { if (!confirming) { setConfirm(o.uid); return; } const r = rehomePet(o.uid); setConfirm(null); say(r.msg, r.success); }} activeOpacity={0.85}
                                            style={{ paddingHorizontal: 10, height: 36, borderRadius: 8, backgroundColor: confirming ? C.red : '#2a0d0d', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: confirming ? '#2a0000' : C.red }}>{confirming ? 'SURE?' : 'REHOME'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                            {gadgets.map(o => {
                                const g = GADGET_BY_ID[o.id]; if (!g) return null;
                                const value = Math.round(gadgetValue(o, totalMonthsPlayed) * GADGET_RESALE);
                                return (
                                    <View key={o.uid} style={{ backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border, marginBottom: 10, flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10 }}>
                                        <Image source={lifestyleImage(o.id)} style={{ width: 64, height: 64 }} resizeMode="contain" />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream, lineHeight: 20 }}>{g.name}</Text>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim }}>Worth about {money(value)} if sold</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => { const r = sellGadget(o.uid); say(r.msg, r.success); }} activeOpacity={0.85} style={{ paddingHorizontal: 12, height: 36, borderRadius: 8, backgroundColor: '#1a2e56', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.cream }}>SELL</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    )
                )}
            </ScrollView>

            {toast && (
                <View style={{ position: 'absolute', bottom: TAB_STACK + 12, left: PAD, right: PAD, backgroundColor: 'rgba(8,12,24,0.96)', borderRadius: 10, borderWidth: 1, borderColor: (toast.ok ? C.sage : C.red) + '66', padding: 12, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: toast.ok ? C.cream : C.red, textAlign: 'center' }}>{toast.msg}</Text>
                </View>
            )}
        </View>
    );
}
