import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useGame } from '../context/GameContext';
import { VACATIONS, VACATION_COOLDOWN_MONTHS } from '../data/vacations';

const PAD = 14;
const TAB_STACK = 124;   // the End Month dock and tab bar sit over the bottom of this screen
const C = { bg: '#06080f', panel: '#0d1020', border: '#1a2040', sage: '#4ade80', red: '#f87171', gold: '#fbbf24', cream: '#c8d4f0', dim: '#7d8ab0', dark: '#5a6890', blue: '#60a5fa' };
const money = (n) => `₹${Math.round(n).toLocaleString()}`;

export default function VacationScreen({ onClose }) {
    const { balance, takeVacation, getHouseholdSize, totalMonthsPlayed, lastVacationMonth } = useGame();
    const household = getHouseholdSize();
    const hasFamily = household > 1;
    const [family, setFamily] = useState(false);
    const [pending, setPending] = useState(null);
    const [toast, setToast] = useState(null);
    const say = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3600); };

    const people = hasFamily && family ? household : 1;
    const wait = Math.max(0, VACATION_COOLDOWN_MONTHS - (totalMonthsPlayed - lastVacationMonth));

    const go = () => {
        const r = takeVacation(pending.id, hasFamily && family);
        setPending(null);
        say(r.msg, r.success);
    };

    const Tab = ({ id, label }) => (
        <TouchableOpacity onPress={() => setFamily(id === 'family')} activeOpacity={0.8} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2, borderColor: (family ? 'family' : 'solo') === id ? C.gold : 'transparent' }}>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: (family ? 'family' : 'solo') === id ? C.gold : C.dark, letterSpacing: 2 }}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderColor: C.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={onClose} activeOpacity={0.7}><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: C.dim, lineHeight: 26 }}>‹</Text></TouchableOpacity>
                    <View>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, letterSpacing: 4 }}>TIME OFF</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: C.cream, lineHeight: 28 }}>Holiday</Text>
                    </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3 }}>CASH</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#38b2ac', lineHeight: 22 }}>{money(balance)}</Text>
                </View>
            </View>

            {hasFamily ? (
                <View style={{ flexDirection: 'row', paddingHorizontal: PAD, borderBottomWidth: 1, borderColor: C.border }}>
                    <Tab id="solo" label="SOLO" /><Tab id="family" label={`FAMILY (${household})`} />
                </View>
            ) : null}

            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: TAB_STACK + 30 }} showsVerticalScrollIndicator={false}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim, marginBottom: 12 }}>
                    {wait > 0 ? `You just got back. The next trip is possible in ${wait} month${wait === 1 ? '' : 's'}.`
                        : hasFamily && family ? `A family trip costs the price below for each of the ${household} of you.`
                        : 'Travel alone: no one to plan around. A good way to recharge before settling down.'}
                </Text>
                {VACATIONS.map(v => {
                    const cost = v.cost * people;
                    const afford = balance >= cost;
                    return (
                        <View key={v.id} style={{ backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 12 }}>
                            <View style={{ height: 150, backgroundColor: '#0a0e22' }}>
                                <Image source={v.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                <Text style={{ position: 'absolute', top: 8, left: 10, fontFamily: 'VT323_400Regular', fontSize: 13, color: '#fff', letterSpacing: 3, textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>{v.tag}</Text>
                            </View>
                            <View style={{ padding: 12 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: C.cream, lineHeight: 24 }}>{v.name}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, marginBottom: 8 }}>{v.blurb}</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 1 }}><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 2 }}>{people > 1 ? `COST (${people})` : 'COST'}</Text><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.gold }}>{money(cost)}</Text></View>
                                    <View style={{ flex: 1 }}><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 2 }}>MOOD</Text><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.sage }}>+{v.mood}</Text></View>
                                    <View style={{ flex: 1 }}><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 2 }}>HEALTH</Text><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.sage }}>+{v.health}</Text></View>
                                </View>
                            </View>
                            <TouchableOpacity disabled={!afford || wait > 0} onPress={() => setPending(v)} activeOpacity={0.6}
                                style={{ height: 44, borderTopWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', opacity: afford && wait === 0 ? 1 : 0.4 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.gold, letterSpacing: 2 }}>{wait > 0 ? 'JUST BACK' : afford ? (people > 1 ? 'GO WITH THE FAMILY' : 'GO SOLO') : 'CAN\'T AFFORD YET'}</Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </ScrollView>

            {pending && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 20 }}>
                    <TouchableOpacity activeOpacity={1} onPress={() => setPending(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(3,4,9,0.78)' }} />
                    <View style={{ backgroundColor: C.panel, borderTopWidth: 1, borderColor: '#2a3560', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, paddingBottom: 18 + TAB_STACK }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: C.cream, lineHeight: 28 }}>Go to {pending.name}?</Text>
                        <View style={{ marginVertical: 12, gap: 4 }}>
                            {[['Who', people > 1 ? `You + ${people - 1}` : 'Just you', C.cream], ['Cost', money(pending.cost * people), C.red], ['Mood', `+${pending.mood}`, C.sage], ['Health', `+${pending.health}`, C.sage], ['Cash after', money(balance - pending.cost * people), C.cream]].map(([l, r, c]) => (
                                <View key={l} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dim }}>{l}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: c }}>{r}</Text>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity onPress={go} activeOpacity={0.85} style={{ height: 50, borderRadius: 10, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#2a1c00', letterSpacing: 3 }}>PACK THE BAGS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setPending(null)} style={{ height: 36, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dim }}>Not yet</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {toast && (
                <View style={{ position: 'absolute', bottom: TAB_STACK + 12, left: PAD, right: PAD, backgroundColor: 'rgba(8,12,24,0.96)', borderRadius: 10, borderWidth: 1, borderColor: (toast.ok ? C.sage : C.red) + '66', padding: 12, alignItems: 'center', zIndex: 30 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: toast.ok ? C.cream : C.red, textAlign: 'center' }}>{toast.msg}</Text>
                </View>
            )}
        </View>
    );
}
