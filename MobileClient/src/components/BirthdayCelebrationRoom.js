import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

const BDAY_CAKE   = require('../../assets/ui_comp/birthday_cake.png');
const QUIET_IMG   = require('../../assets/ui_comp/quiet_dinner.png');
const PARTY_IMG   = require('../../assets/ui_comp/house_party_birthday.png');
const LAVISH_IMG  = require('../../assets/ui_comp/lavish_birthday_bash.png');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PAD = 14;
const C = { bg: '#06080f', panel: '#0d1020', border: '#1a2040', gold: '#fbbf24', pink: '#ec4899', cream: '#c8d4f0', dim: '#7d8ab0', dark: '#5a6890', sage: '#4ade80', red: '#f87171' };
const money = (n) => `₹${Math.round(n).toLocaleString()}`;

// The three parties you can throw, so you can plan the money before the day
const PARTIES = [
    { label: 'Quiet Dinner', img: QUIET_IMG,  cost: 1500,  line: 'A calm evening. +15 mood, +15 health.' },
    { label: 'House Party',  img: PARTY_IMG,  cost: 10000, line: 'Friends and contacts. +25 mood and a small pay bump.' },
    { label: 'Lavish Bash',  img: LAVISH_IMG, cost: 40000, line: 'The big one. +50 mood, a little tiring.' },
];

const getRoomImage = (label) => {
    const l = (label || '').toLowerCase();
    if (l.includes('lavish')) return LAVISH_IMG;
    if (l.includes('house party') || l.includes('big house')) return PARTY_IMG;
    return QUIET_IMG;
};

export default function BirthdayCelebrationRoom({
    visible, onClose,
    turn, playerBirthday, playerName, dependents, lastCelebrationChoice,
    balance = 0, jar = 0, wishes = [], onAddJar, onWish,
}) {
    const [toast, setToast] = useState(null);
    if (!visible) return null;
    const say = (r) => { if (!r) return; setToast(r); setTimeout(() => setToast(null), 3000); };

    const currentMonth = turn?.month || 1;
    const year = turn?.year || 0;
    let playerBdayMonth = null;
    if (playerBirthday && playerBirthday.includes('/')) playerBdayMonth = parseInt(playerBirthday.split('/')[1], 10);

    // everyone with a birthday, with a stable key for wishes
    const people = [];
    if (playerBdayMonth) people.push({ key: 'me', name: playerName || 'You', month: playerBdayMonth, isPlayer: true });
    (dependents || []).filter(d => !d.isDead && d.bdayMonth && d.custody !== 'ex').forEach(d => people.push({ key: String(d.id), name: d.name, month: d.bdayMonth, isPlayer: false, type: d.type }));
    const withAway = people.map(p => ({ ...p, away: ((p.month - currentMonth + 12) % 12) })).sort((a, b) => a.away - b.away);
    const thisMonth = withAway.filter(p => p.away === 0);
    const next = withAway.find(p => p.away > 0) || withAway[0];
    const byMonth = (m) => withAway.filter(p => p.month === m);

    return (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: C.bg, zIndex: 100 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Image source={BDAY_CAKE} style={{ width: 44, height: 44 }} resizeMode="contain" />
                        <View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, letterSpacing: 4 }}>{thisMonth.length ? 'PARTY TIME' : 'PLAN AHEAD'}</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: C.cream, lineHeight: 28 }}>Birthdays</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.dark }}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    {/* Next up */}
                    <View style={{ paddingHorizontal: PAD, paddingTop: 14 }}>
                        {thisMonth.length > 0 ? (
                            <View style={{ backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }}>
                                <View style={{ height: 160, backgroundColor: '#0a0e22' }}>
                                    <Image source={getRoomImage(lastCelebrationChoice?.label)} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                </View>
                                <View style={{ padding: 12 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.pink, letterSpacing: 3 }}>{MONTHS[currentMonth - 1].toUpperCase()} · THIS MONTH</Text>
                                    {thisMonth.map(p => {
                                        const wk = `${p.key}_${year}`;
                                        const done = wishes.includes(wk);
                                        return (
                                            <View key={p.key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#fbcfe8' }}>{p.isPlayer ? `${p.name} (you)` : p.name}</Text>
                                                {!p.isPlayer && (
                                                    <TouchableOpacity disabled={done} onPress={() => say(onWish && onWish(wk, p.name))} activeOpacity={0.6}>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: done ? C.dark : C.gold, textDecorationLine: done ? 'none' : 'underline', letterSpacing: 1 }}>{done ? 'WISHED' : 'SEND A WISH'}</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        );
                                    })}
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim }}>Your party choice comes up when you end the month.</Text>
                                </View>
                            </View>
                        ) : next ? (
                            <View style={{ backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, letterSpacing: 3 }}>NEXT BIRTHDAY</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: C.cream, lineHeight: 28 }}>{next.isPlayer ? `${next.name} (you)` : next.name}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.pink }}>{MONTHS[next.month - 1]} · in {next.away} month{next.away === 1 ? '' : 's'}</Text>
                            </View>
                        ) : (
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.dim }}>No birthdays tracked yet.</Text>
                        )}
                    </View>

                    {/* Calendar */}
                    <View style={{ paddingHorizontal: PAD, marginTop: 18 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, letterSpacing: 3, marginBottom: 8 }}>THE YEAR</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            {MONTHS.map((m, i) => {
                                const list = byMonth(i + 1);
                                const now = i + 1 === currentMonth;
                                return (
                                    <View key={m} style={{ width: '15.5%', minHeight: 62, marginBottom: 8, backgroundColor: list.length ? '#1a1030' : C.panel, borderRadius: 8, borderWidth: 1, borderColor: now ? C.gold : C.border, alignItems: 'center', paddingVertical: 6 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: now ? C.gold : C.dim }}>{m}</Text>
                                        {list.length ? list.slice(0, 2).map(p => (
                                            <Text key={p.key} numberOfLines={1} style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: p.isPlayer ? '#fbcfe8' : C.cream, lineHeight: 13 }}>{p.isPlayer ? 'YOU' : p.name.slice(0, 5)}</Text>
                                        )) : <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#1e2840' }}>·</Text>}
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* Birthday jar */}
                    <View style={{ paddingHorizontal: PAD, marginTop: 10 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, letterSpacing: 3, marginBottom: 8 }}>BIRTHDAY JAR</Text>
                        <View style={{ backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: C.gold }}>{money(jar)}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim }}>cash {money(balance)}</Text>
                            </View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, marginBottom: 8 }}>Money you put in is set aside and pays for the next party first, so the day does not hurt.</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {[1000, 5000, 10000].map(a => (
                                    <TouchableOpacity key={a} disabled={balance < a} onPress={() => say(onAddJar && onAddJar(a))} activeOpacity={0.6} style={{ paddingVertical: 8, opacity: balance < a ? 0.35 : 1 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 19, color: C.gold, textDecorationLine: 'underline', letterSpacing: 1 }}>+ {money(a)}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* What a party costs */}
                    <View style={{ paddingHorizontal: PAD, marginTop: 18 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, letterSpacing: 3, marginBottom: 8 }}>WHAT A PARTY COSTS</Text>
                        {PARTIES.map((p, i) => (
                            <View key={p.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderColor: '#0f1525' }}>
                                <Image source={p.img} style={{ width: 62, height: 62 }} resizeMode="cover" />
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 21, color: C.cream }}>{p.label}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 19, color: C.gold }}>{money(p.cost)}</Text>
                                    </View>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim, lineHeight: 15 }}>{p.line}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                {toast && (
                    <View style={{ position: 'absolute', bottom: 30, left: PAD, right: PAD, backgroundColor: 'rgba(8,12,24,0.96)', borderRadius: 10, borderWidth: 1, borderColor: (toast.success ? C.sage : C.red) + '66', padding: 12, alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: toast.success ? C.cream : C.red, textAlign: 'center' }}>{toast.msg}</Text>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}
