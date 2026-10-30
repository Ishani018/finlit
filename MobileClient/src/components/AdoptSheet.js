import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ADOPTION_OPTIONS, ADOPTION_MIN_AGE } from '../data/adoption';
import { getKidSprite } from '../data/kidSprites';

const C = { panel: '#0d1020', border: '#1a2040', cream: '#c8d4f0', dim: '#7d8ab0', gold: '#fbbf24', sage: '#4ade80', red: '#f87171', pink: '#ec4899', blue: '#60a5fa' };
const money = (n) => `₹${Math.round(n).toLocaleString()}`;

// Bottom sheet for adopting. Props: visible, balance, playerAge, married, onAdopt({gender, ageKey}), onClose
export default function AdoptSheet({ visible, balance, playerAge, married, onAdopt, onClose }) {
    const [gender, setGender] = useState('female');
    const [ageKey, setAgeKey] = useState('baby');
    if (!visible) return null;
    const opt = ADOPTION_OPTIONS.find(o => o.key === ageKey);
    const tooYoung = playerAge < ADOPTION_MIN_AGE;
    const canPay = balance >= opt.fee;
    const startMonths = opt.startMonths;

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 30, justifyContent: 'flex-end' }}>
            <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(3,4,9,0.8)' }} />
            <View style={{ backgroundColor: C.panel, borderTopWidth: 1, borderColor: '#2a3560', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, paddingBottom: 130 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.pink, letterSpacing: 4 }}>OPEN A HOME TO A CHILD</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: C.cream, lineHeight: 30 }}>Adopt</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim, marginBottom: 12 }}>
                    {married ? 'Adopt together with your spouse.' : 'You can adopt on your own too.'} Agencies need a steady income and a home with room.
                </Text>

                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                    {[['female', 'Girl'], ['male', 'Boy']].map(([g, label]) => (
                        <TouchableOpacity key={g} onPress={() => setGender(g)} activeOpacity={0.85}
                            style={{ flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: gender === g ? C.pink + '33' : '#141b36', borderWidth: 1, borderColor: gender === g ? C.pink : 'transparent' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: gender === g ? C.cream : '#a8b4d8' }}>{label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    {ADOPTION_OPTIONS.map(o => {
                        const on = o.key === ageKey;
                        return (
                            <TouchableOpacity key={o.key} onPress={() => setAgeKey(o.key)} activeOpacity={0.85}
                                style={{ flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: '#0a0e22', borderWidth: 1, borderColor: on ? C.gold : C.border }}>
                                <View style={{ height: 96, alignItems: 'center', justifyContent: 'center' }}>
                                    <Image source={getKidSprite(gender, o.startMonths, true)} style={{ width: '70%', height: 86 }} resizeMode="contain" />
                                </View>
                                <View style={{ padding: 6, alignItems: 'center', backgroundColor: 'rgba(6,8,15,0.85)' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: on ? C.gold : C.cream, lineHeight: 18 }}>{o.label}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dim, lineHeight: 12 }}>{o.sub}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.red, lineHeight: 15, marginTop: 2 }}>{money(o.fee)}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={{ gap: 3, marginBottom: 12 }}>
                    {[['Fee today', money(opt.fee), C.red], ['Wait for paperwork', `${opt.wait} months`, C.cream], ['Cash after', money(balance - opt.fee), balance - opt.fee < 0 ? C.red : C.cream]].map(([l, r, c]) => (
                        <View key={l} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.dim }}>{l}</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: c }}>{r}</Text>
                        </View>
                    ))}
                </View>

                {tooYoung ? <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.red, marginBottom: 8 }}>You must be {ADOPTION_MIN_AGE} or older to adopt.</Text> : null}

                <TouchableOpacity disabled={tooYoung || !canPay} onPress={() => onAdopt({ gender, ageKey })} activeOpacity={0.85}
                    style={{ height: 50, borderRadius: 10, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', opacity: tooYoung || !canPay ? 0.4 : 1 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#2a1c00', letterSpacing: 3 }}>{canPay ? 'START ADOPTION' : 'NOT ENOUGH CASH'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={{ height: 34, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dim }}>Not yet</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
