import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useGame } from '../context/GameContext';
import { RESIDENTIAL_PROPERTIES } from '../data/realEstate';
import { LOAN_TYPES, calculateEMI } from '../data/loans';

const PAD = 14;
const C = {
    bg: '#06080f', panel: '#0d1020', border: '#1a2040', blue: '#60a5fa', sage: '#4ade80', red: '#f87171',
    gold: '#fbbf24', cream: '#c8d4f0', dim: '#7d8ab0', dark: '#5a6890',
};
const HOME_LOAN = LOAN_TYPES.find(l => l.id === 'home_loan');
const DOWN_PCT = 0.20, LOAN_MONTHS = 240;

const money = (n) => `₹${Math.round(n).toLocaleString()}`;
const short = (n) => (n >= 10000000 ? `₹${(n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 2)}Cr` : n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : money(n));
const QUALITY_LABELS = ['', 'Cramped', 'Basic', 'Simple', 'Decent', 'Comfortable', 'Good', 'Great', 'Excellent', 'Luxury', 'Dream'];

// Quality as ten little blocks, in the game's flat style
const Quality = ({ score, size = 8 }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        {Array.from({ length: 10 }).map((_, i) => <View key={i} style={{ width: size, height: size, backgroundColor: i < score ? C.gold : '#1a2040' }} />)}
        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim, marginLeft: 6 }}>{QUALITY_LABELS[score] || ''}</Text>
    </View>
);

function Stat({ label, value, color }) {
    return (
        <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 2 }}>{label}</Text>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 19, color: color || C.cream, lineHeight: 20 }}>{value}</Text>
        </View>
    );
}

// What it costs to live in a home you rent or own right now
const monthlyHousing = (home, owns) => (owns ? (home.maintenance || 0) : (home.rental_income || home.maintenance || 0));

export default function HomeScreen({ onClose, onBuyProperty, onSellProperty }) {
    const { currentHousing, properties, balance, moveIn, rentProperty } = useGame();
    const [tab, setTab] = useState('mine');
    const [sortBy, setSortBy] = useState('price');
    const [pending, setPending] = useState(null);        // the home whose sheet is open
    const [afterBuy, setAfterBuy] = useState('move');    // 'move' | 'stay'
    const [flash, setFlash] = useState(null);

    const livingOwned = properties.includes(currentHousing.id);
    const currentQuality = currentHousing.life_quality || 2;
    const otherOwned = RESIDENTIAL_PROPERTIES.filter(p => properties.includes(p.id) && p.id !== currentHousing.id);
    const forSale = RESIDENTIAL_PROPERTIES.filter(p => !properties.includes(p.id)).sort((a, b) => sortBy === 'price' ? a.price - b.price : b.life_quality - a.life_quality);

    // A purchase you chose not to move into lands in MY HOMES, where MOVE IN lives
    const prevOwned = useRef(properties.length);
    useEffect(() => {
        if (properties.length > prevOwned.current) {
            const newest = properties[properties.length - 1];
            if (RESIDENTIAL_PROPERTIES.some(p => p.id === newest) && newest !== currentHousing.id) {
                setTab('mine');
                setFlash(`You bought it. You still live in ${currentHousing.name}: tap MOVE IN on the new home when you are ready.`);
            }
        }
        prevOwned.current = properties.length;
    }, [properties.length]);

    const handleMoveIn = (prop) => { const res = moveIn(prop.id); if (res.success) onClose(); };

    const open = (prop) => { setPending(prop); setAfterBuy('move'); };

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <View style={{ paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, letterSpacing: 4 }}>WHERE YOU LIVE</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: C.cream, lineHeight: 28 }}>Home</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3 }}>CASH</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#38b2ac', lineHeight: 22 }}>{money(balance)}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={{ padding: 8, marginLeft: 6 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.dim }}>✕</Text>
                </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', paddingHorizontal: PAD, borderBottomWidth: 1, borderColor: C.border }}>
                {[['mine', 'MY HOMES'], ['find', 'FIND A HOME']].map(([key, label]) => (
                    <TouchableOpacity key={key} onPress={() => setTab(key)} activeOpacity={0.8} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2, borderColor: tab === key ? C.gold : 'transparent' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: tab === key ? C.gold : C.dark, letterSpacing: 2 }}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {flash ? (
                    <View style={{ borderLeftWidth: 2, borderColor: C.sage, paddingLeft: 10, marginBottom: 12 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#9fd8b4' }}>{flash}</Text>
                    </View>
                ) : null}

                {tab === 'mine' && (
                    <View>
                        {/* The home you live in now */}
                        <View style={{ backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 16 }}>
                            <View style={{ backgroundColor: '#0a0e22' }}><Image source={currentHousing.image} style={{ width: '100%', height: 190 }} resizeMode="contain" /></View>
                            <View style={{ padding: 12 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.gold, letterSpacing: 3 }}>YOU LIVE HERE · {livingOwned ? 'YOU OWN IT' : 'YOU RENT IT'}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: C.cream, lineHeight: 26, marginBottom: 6 }}>{currentHousing.name}</Text>
                                <Quality score={currentQuality} />
                                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                    <Stat label={livingOwned ? 'UPKEEP / MO' : 'RENT / MO'} value={`−${money(monthlyHousing(currentHousing, livingOwned))}`} color={C.red} />
                                    <Stat label="QUALITY" value={`${currentQuality} / 10`} />
                                </View>
                                {currentQuality < 6 ? <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, marginTop: 8 }}>A better home lifts your mood and cuts health costs. Look in FIND A HOME.</Text> : null}
                            </View>
                        </View>

                        {/* Everything else you own */}
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, letterSpacing: 3, marginBottom: 8 }}>OTHER HOMES YOU OWN</Text>
                        {otherOwned.length === 0 ? (
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.dim, lineHeight: 22 }}>
                                None yet. Homes you buy appear here. Every home you own also pays you rent every month.
                            </Text>
                        ) : otherOwned.map(prop => {
                            const dq = prop.life_quality - currentQuality;
                            return (
                                <View key={prop.id} style={{ backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 12 }}>
                                    <View style={{ backgroundColor: '#0a0e22' }}><Image source={prop.image} style={{ width: '100%', height: 150 }} resizeMode="contain" /></View>
                                    <View style={{ padding: 12 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.cream, lineHeight: 22 }}>{prop.name}</Text>
                                        <View style={{ flexDirection: 'row', marginTop: 6 }}>
                                            <Stat label="EARNS RENT / MO" value={`+${money(prop.rental_income || 0)}`} color={C.sage} />
                                            <Stat label="UPKEEP / MO" value={`−${money(prop.maintenance || 0)}`} color={C.red} />
                                            <Stat label="VS YOUR HOME" value={dq > 0 ? `+${dq} quality` : dq < 0 ? `${dq} quality` : 'same'} color={dq > 0 ? C.sage : dq < 0 ? C.red : C.dim} />
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: C.border }}>
                                        <TouchableOpacity onPress={() => handleMoveIn(prop)} activeOpacity={0.6} style={{ flex: 1, height: 46, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 19, color: C.gold, letterSpacing: 2 }}>MOVE IN</Text>
                                        </TouchableOpacity>
                                        <View style={{ width: 1, backgroundColor: C.border }} />
                                        <TouchableOpacity onPress={() => onSellProperty && onSellProperty(prop)} activeOpacity={0.6} style={{ flex: 1, height: 46, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 19, color: C.red, letterSpacing: 2 }}>SELL</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {tab === 'find' && (
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, flex: 1 }}>Tap a home to rent it or buy it.</Text>
                            {[['price', 'PRICE'], ['quality', 'QUALITY']].map(([key, label]) => (
                                <TouchableOpacity key={key} onPress={() => setSortBy(key)} style={{ marginLeft: 14 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: sortBy === key ? C.cream : C.dark, letterSpacing: 1, textDecorationLine: sortBy === key ? 'underline' : 'none' }}>{label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            {forSale.map(prop => {
                                const can = balance >= prop.price;
                                return (
                                    <TouchableOpacity key={prop.id} onPress={() => open(prop)} activeOpacity={0.85}
                                        style={{ width: '48.5%', backgroundColor: C.panel, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 10 }}>
                                        <View style={{ backgroundColor: '#0a0e22' }}><Image source={prop.image} style={{ width: '100%', height: 125 }} resizeMode="contain" /></View>
                                        <View style={{ padding: 8 }}>
                                            <Text numberOfLines={2} style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.cream, lineHeight: 17, minHeight: 34 }}>{prop.name}</Text>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: can ? C.gold : C.dark, lineHeight: 24 }}>{short(prop.price)}</Text>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>or rent {short(prop.rental_income || prop.maintenance || 0)}/mo</Text>
                                            <Quality score={prop.life_quality} size={5} />
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* One home, three clear ways to get it */}
            {pending && (() => {
                const prop = pending;
                const price = prop.price, down = Math.round(price * DOWN_PCT), loan = price - down;
                const emi = calculateEMI(loan, HOME_LOAN.base_interest, LOAN_MONTHS);
                const rent = prop.rental_income || prop.maintenance || 0;
                const moveNow = afterBuy === 'move';
                const dq = prop.life_quality - currentQuality;
                const Option = ({ title, line, price: p, btn, enabled, why, onPress }) => (
                    <View style={{ borderTopWidth: 1, borderColor: C.border, paddingVertical: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 21, color: C.cream }}>{title}</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 19, color: C.gold }}>{p}</Text>
                        </View>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, lineHeight: 17, marginBottom: 8 }}>{line}</Text>
                        <TouchableOpacity disabled={!enabled} onPress={onPress} activeOpacity={0.8} style={{ height: 42, borderRadius: 8, backgroundColor: enabled ? C.gold : '#141b36', alignItems: 'center', justifyContent: 'center', opacity: enabled ? 1 : 0.6 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: enabled ? '#2a1c00' : C.dim, letterSpacing: 2 }}>{enabled ? btn : why}</Text>
                        </TouchableOpacity>
                    </View>
                );
                return (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 20 }}>
                        <TouchableOpacity activeOpacity={1} onPress={() => setPending(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(3,4,9,0.8)' }} />
                        <View style={{ backgroundColor: C.panel, borderTopWidth: 1, borderColor: '#2a3560', borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: '90%', overflow: 'hidden' }}>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={{ backgroundColor: '#0a0e22' }}><Image source={prop.image} style={{ width: '100%', height: 200 }} resizeMode="contain" /></View>
                                <View style={{ padding: 14 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: C.cream, lineHeight: 28 }}>{prop.name}</Text>
                                    <Quality score={prop.life_quality} />
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, marginTop: 6, lineHeight: 17 }}>{prop.description}</Text>
                                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                        <Stat label="PRICE" value={short(price)} color={C.gold} />
                                        <Stat label="UPKEEP / MO" value={`−${money(prop.maintenance || 0)}`} color={C.red} />
                                        <Stat label="VS YOUR HOME" value={dq > 0 ? `+${dq} quality` : dq < 0 ? `${dq} quality` : 'same'} color={dq > 0 ? C.sage : dq < 0 ? C.red : C.dim} />
                                    </View>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.sage, marginTop: 6 }}>Homes you own also earn {money(prop.rental_income || 0)} rent every month.</Text>

                                    <View style={{ marginTop: 12 }}>
                                        <Option title="Rent it" p={`${money(rent)} / mo`}
                                            line="Nothing to buy. You move in today and pay rent each month. You can leave any time."
                                            btn="RENT & MOVE IN" enabled onPress={() => { const res = rentProperty(prop.id); if (res.success) onClose(); else setFlash(res.msg); setPending(null); }} />

                                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderColor: C.border }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dark, letterSpacing: 2, flex: 1 }}>IF YOU BUY, THEN</Text>
                                            {[['move', 'MOVE IN'], ['stay', 'STAY WHERE I AM']].map(([k, l]) => (
                                                <TouchableOpacity key={k} onPress={() => setAfterBuy(k)} style={{ marginLeft: 16 }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: afterBuy === k ? C.gold : C.dark, textDecorationLine: afterBuy === k ? 'underline' : 'none', letterSpacing: 1 }}>{l}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        <Option title="Buy with cash" p={short(price)}
                                            line={`Pay ${money(price)} now. It is yours for good: only upkeep of ${money(prop.maintenance || 0)} a month.`}
                                            btn={moveNow ? 'BUY & MOVE IN' : 'BUY'} enabled={balance >= price} why={`NEED ${short(price - balance)} MORE`}
                                            onPress={() => { onBuyProperty(prop, true, moveNow); setPending(null); }} />

                                        <Option title="Buy with a home loan" p={`${short(down)} now`}
                                            line={`Pay ${money(down)} down (20%) and about ${money(emi)} a month for 20 years, plus upkeep. The bank holds the rest.`}
                                            btn={moveNow ? 'LOAN & MOVE IN' : 'TAKE THE LOAN'} enabled={balance >= down} why={`NEED ${short(down - balance)} MORE`}
                                            onPress={() => { onBuyProperty(prop, false, moveNow); setPending(null); }} />
                                    </View>
                                    <TouchableOpacity onPress={() => setPending(null)} style={{ height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dim }}>Not now</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                );
            })()}
        </View>
    );
}
