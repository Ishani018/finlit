import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useGame } from '../context/GameContext';
import { vehicleMinNetWorth, VEHICLE_KINDS, CARS, CAR_BY_ID, CAR_TIERS, CAR_LOAN_DOWN_PCT, CAR_LOAN_TENURE, USED_RUN_FACTOR, usedPrice, carRunCost, carValue } from '../data/cars';
import { calculateEMI } from '../data/loans';

const PAD = 14;
const TAB_STACK = 124; // the End Month dock and tab bar sit over the bottom of this screen
const C = { bg: '#06080f', panel: '#0d1020', card: '#070a16', border: '#1a2040', sage: '#4ade80', red: '#f87171', gold: '#fbbf24', cream: '#c8d4f0', dim: '#7d8ab0', dark: '#5a6890', blue: '#60a5fa' };
const money = (n) => `₹${Math.round(n).toLocaleString()}`;
const short = (n) => (n >= 10000000 ? `₹${(n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 2)}Cr` : n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : money(n));

function Stat({ label, value, color }) {
    return (
        <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 2 }}>{label}</Text>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: color || C.cream, lineHeight: 19 }}>{value}</Text>
        </View>
    );
}

function Corners({ color }) {
    return [
        { top: 0, left: 0, borderTopWidth: 1, borderLeftWidth: 1 }, { top: 0, right: 0, borderTopWidth: 1, borderRightWidth: 1 },
        { bottom: 0, left: 0, borderBottomWidth: 1, borderLeftWidth: 1 }, { bottom: 0, right: 0, borderBottomWidth: 1, borderRightWidth: 1 },
    ].map((s, i) => <View key={i} style={[{ position: 'absolute', width: 8, height: 8, borderColor: color + 'aa' }, s]} />);
}

export default function CarsScreen({ onBack, onClose, initialTab = 'new' }) {
    const { balance, netWorth, cars, activeCarUid, buyCar, sellCar, setActiveCar, getCarMonthly, totalMonthsPlayed, loans } = useGame();
    const [tab, setTab] = useState(initialTab);
    const [tier, setTier] = useState('all');
    const [kind, setKind] = useState('all');
    const [pending, setPending] = useState(null);   // { car, used, loan }
    const [sellId, setSellId] = useState(null);
    const [toast, setToast] = useState(null);
    const say = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3200); };

    const used = tab === 'used';
    const list = CARS.filter(c => (tier === 'all' || c.tier === tier) && (kind === 'all' || c.kind === kind));
    const garageValue = cars.reduce((n, c) => n + carValue(c, totalMonthsPlayed), 0);
    const monthly = getCarMonthly();

    const priceOf = (car) => (used ? usedPrice(car) : car.price);

    const confirm = () => {
        const { car, used: u, loan } = pending;
        const r = buyCar(car.id, { used: u, useLoan: loan });
        setPending(null);
        say(r.msg, r.success);
        if (r.success) setTab('garage');
    };

    const Tab = ({ id, label }) => (
        <TouchableOpacity onPress={() => setTab(id)} activeOpacity={0.8} style={{ flex: 1, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: tab === id ? C.gold : '#141b36' }}>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: tab === id ? '#2a1c00' : '#a8b4d8', letterSpacing: 1 }}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderColor: C.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={onBack} activeOpacity={0.7}><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: C.dim, lineHeight: 26 }}>‹</Text></TouchableOpacity>
                    <View>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, letterSpacing: 4 }}>WHEELS · WATER · AIR</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: C.cream, lineHeight: 28 }}>Showroom</Text>
                    </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3 }}>CASH</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#38b2ac', lineHeight: 22 }}>{money(balance)}</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: PAD, paddingTop: 10 }}>
                <Tab id="new" label="NEW" /><Tab id="used" label="SECOND-HAND" /><Tab id="garage" label={`GARAGE (${cars.length})`} />
            </View>

            {tab !== 'garage' && (
                <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: PAD, paddingTop: 10 }}>
                    {VEHICLE_KINDS.map(k => (
                        <TouchableOpacity key={k.key} onPress={() => { setKind(k.key); if (k.key === 'toy') setTier('all'); }} activeOpacity={0.8} style={{ flex: 1, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: kind === k.key ? C.blue + '33' : '#141b36', borderWidth: 1, borderColor: kind === k.key ? C.blue : 'transparent' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: kind === k.key ? C.blue : '#a8b4d8', letterSpacing: 0 }}>{k.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            {tab !== 'garage' && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 6, paddingHorizontal: PAD, paddingVertical: 10 }}>
                    {[{ key: 'all', label: 'ALL', color: C.cream }, ...CAR_TIERS].map(t => (
                        <TouchableOpacity key={t.key} onPress={() => setTier(t.key)} activeOpacity={0.8} style={{ paddingHorizontal: 12, height: 28, borderRadius: 14, justifyContent: 'center', backgroundColor: tier === t.key ? t.color + '33' : '#141b36', borderWidth: 1, borderColor: tier === t.key ? t.color : 'transparent' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: tier === t.key ? t.color : '#a8b4d8', letterSpacing: 1 }}>{t.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
                {tab !== 'garage' && used && (
                    <View style={{ backgroundColor: '#101a36', borderWidth: 1, borderColor: '#22305c', borderRadius: 10, padding: 10, marginBottom: 12 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#9db4e0' }}>Second-hand cars are a few years old. You pay much less and lose less value, but servicing costs {Math.round((USED_RUN_FACTOR - 1) * 100)}% more.</Text>
                    </View>
                )}

                {tab !== 'garage' && list.length === 0 && (
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dim, textAlign: 'center', paddingVertical: 40 }}>Nothing here. Try another filter.</Text>
                )}

                {tab !== 'garage' && list.map(car => {
                    const t = CAR_TIERS.find(x => x.key === car.tier);
                    const need = vehicleMinNetWorth(car);
                    const locked = netWorth < need;
                    const price = priceOf(car);
                    const run = carRunCost(car, { used });
                    const down = Math.round(price * CAR_LOAN_DOWN_PCT);
                    const canCash = balance >= price, canLoan = balance >= down;
                    return (
                        <View key={car.id} style={{ backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 12, opacity: locked ? 0.55 : 1 }}>
                            <View style={{ height: 140, backgroundColor: '#0a0e22', alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ position: 'absolute', bottom: 18, width: 180, height: 22, borderRadius: 100, backgroundColor: '#141b36' }} />
                                <Image source={car.image} style={{ width: 200, height: 120 }} resizeMode="contain" />
                                <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(6,8,15,0.9)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: t.color + '77' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: t.color, letterSpacing: 2 }}>{t.label}{used ? ' · USED' : ''}</Text>
                                </View>
                                {car.dep < 0 && <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#0d2a1f', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.sage }}>GAINS VALUE</Text></View>}
                            </View>
                            <View style={{ padding: 12 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: C.cream, lineHeight: 24 }}>{car.name}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, marginBottom: 8 }}>{car.perk}</Text>
                                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                    <Stat label="PRICE" value={short(price)} color={C.gold} />
                                    <Stat label="RUNNING / MO" value={`−${money(run)}`} color={C.red} />
                                    <Stat label="MOOD / MO" value={`+${car.mood}`} color={C.sage} />
                                </View>
                                {car.income ? <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.sage, marginBottom: 6 }}>Earns +{money(car.income)}/mo when active</Text> : null}
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: car.dep < 0 ? C.sage : C.dim, marginBottom: 10 }}>
                                    {car.dep < 0 ? `Value grows about ${Math.round(-car.dep * 100)}% a year` : car.dep === 0 ? 'Holds its value' : `Loses about ${Math.round((used ? car.dep * 0.75 : car.dep) * 100)}% of its value a year${used ? '' : ', and ~10% the day you drive it off'}`}
                                </Text>
                                {locked ? (
                                    <View style={{ height: 40, borderRadius: 8, backgroundColor: '#0a0d1a', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dark }}>Locked · needs {short(need)} net worth</Text>
                                    </View>
                                ) : (
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        <TouchableOpacity disabled={!canCash} onPress={() => setPending({ car, used, loan: false })} activeOpacity={0.8} style={{ flex: 1, height: 38, borderRadius: 19, borderWidth: 1, borderColor: canCash ? C.gold + '88' : '#1a2040', backgroundColor: canCash ? C.gold + '14' : 'transparent', alignItems: 'center', justifyContent: 'center', opacity: canCash ? 1 : 0.55 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: canCash ? C.gold : C.dark, letterSpacing: 1 }}>BUY CASH</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity disabled={!canLoan} onPress={() => setPending({ car, used, loan: true })} activeOpacity={0.8} style={{ flex: 1, height: 38, borderRadius: 19, borderWidth: 1, borderColor: canLoan ? C.blue + '88' : '#1a2040', backgroundColor: canLoan ? C.blue + '14' : 'transparent', alignItems: 'center', justifyContent: 'center', opacity: canLoan ? 1 : 0.55 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: canLoan ? C.blue : C.dark, lineHeight: 16 }}>FINANCE</Text>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#7d8ab0', lineHeight: 12 }}>{short(down)} down · {short(emiOf(price))}/mo</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })}

                {tab === 'garage' && (
                    cars.length === 0 ? (
                        <View style={{ alignItems: 'center', paddingVertical: 50 }}>
                            <Image source={CAR_BY_ID.alto.image} style={{ width: 160, height: 100, opacity: 0.25 }} resizeMode="contain" />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.dim, textAlign: 'center', marginTop: 8 }}>Your garage is empty.{'\n'}Browse NEW or SECOND-HAND to buy a ride.</Text>
                        </View>
                    ) : (
                        <View>
                            <View style={{ flexDirection: 'row', backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 12 }}>
                                <Stat label="GARAGE VALUE" value={short(garageValue)} color={C.gold} />
                                <Stat label="COSTS / MO" value={`−${money(monthly.cost)}`} color={C.red} />
                                <Stat label={monthly.income ? 'EARNS / MO' : 'MOOD / MO'} value={monthly.income ? `+${money(monthly.income)}` : `+${monthly.mood.toFixed(1)}`} color={C.sage} />
                            </View>
                            {cars.map(o => {
                                const car = CAR_BY_ID[o.id]; if (!car) return null;
                                const value = carValue(o, totalMonthsPlayed);
                                const delta = value - o.paid;
                                const isActive = (activeCarUid || cars[0].uid) === o.uid;
                                const loan = loans.find(l => l.linkedAsset === o.uid);
                                const confirming = sellId === o.uid;
                                return (
                                    <View key={o.uid} style={{ backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: isActive ? C.gold + '99' : C.border, overflow: 'hidden', marginBottom: 12 }}>
                                        <View style={{ height: 120, backgroundColor: '#0a0e22', alignItems: 'center', justifyContent: 'center' }}>
                                            <View style={{ position: 'absolute', bottom: 14, width: 170, height: 20, borderRadius: 100, backgroundColor: '#141b36' }} />
                                            <Image source={car.image} style={{ width: 180, height: 104 }} resizeMode="contain" />
                                            {isActive && <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: C.gold, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#2a1c00', letterSpacing: 2 }}>DRIVING</Text></View>}
                                            {isActive && <Corners color={C.gold} />}
                                        </View>
                                        <View style={{ padding: 12 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.cream, lineHeight: 22 }}>{car.name}{o.used ? ' (used)' : ''}</Text>
                                            <View style={{ flexDirection: 'row', marginVertical: 8 }}>
                                                <Stat label="WORTH NOW" value={short(value)} color={C.gold} />
                                                <Stat label={delta >= 0 ? 'GAIN' : 'LOSS'} value={`${delta >= 0 ? '+' : '−'}${short(Math.abs(delta))}`} color={delta >= 0 ? C.sage : C.red} />
                                                <Stat label="COSTS / MO" value={`−${money(isActive ? carRunCost(car, o) : carRunCost(car, o) * 0.35)}`} color={C.red} />
                                            </View>
                                            {loan ? <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#9db4e0', marginBottom: 6 }}>Finance: {money(loan.emi)}/mo · {money(loan.remainingPrincipal)} still owed</Text> : null}
                                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                                {!isActive && (
                                                    <TouchableOpacity onPress={() => { setActiveCar(o.uid); say(`Now driving the ${car.name}.`); }} activeOpacity={0.85} style={{ flex: 2, height: 40, borderRadius: 8, backgroundColor: '#1a2e56', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.cream, letterSpacing: 2 }}>DRIVE THIS</Text>
                                                    </TouchableOpacity>
                                                )}
                                                <TouchableOpacity onPress={() => { if (!confirming) { setSellId(o.uid); return; } const r = sellCar(o.uid); setSellId(null); say(r.msg, r.success); }} activeOpacity={0.85} style={{ flex: 1, height: 40, borderRadius: 8, backgroundColor: confirming ? C.red : '#2a0d0d', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: confirming ? '#2a0000' : C.red, letterSpacing: 1 }}>{confirming ? `SELL ${short(value)}?` : 'SELL'}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )
                )}
            </ScrollView>

            {pending && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 20 }}>
                    <TouchableOpacity activeOpacity={1} onPress={() => setPending(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(3,4,9,0.78)' }} />
                    {(() => {
                        const { car, used: u, loan } = pending; const price = u ? usedPrice(car) : car.price; const down = Math.round(price * CAR_LOAN_DOWN_PCT); const run = carRunCost(car, { used: u });
                        return (
                            <View style={{ backgroundColor: C.panel, borderTopWidth: 1, borderColor: '#2a3560', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, paddingBottom: 18 + TAB_STACK }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: C.cream, lineHeight: 28 }}>Buy the {car.name}{u ? ' (used)' : ''}?</Text>
                                <View style={{ marginVertical: 12, gap: 4 }}>
                                    <Row l="Price" r={money(price)} />
                                    {loan ? <Row l="Pay today" r={money(down)} c={C.red} /> : <Row l="Pay today" r={money(price)} c={C.red} />}
                                    {loan ? <Row l={`EMI · ${CAR_LOAN_TENURE} months`} r={`${money(emiOf(price))}/mo`} c={C.red} /> : null}
                                    <Row l="Running cost" r={`${money(run)}/mo`} c={C.red} />
                                    <Row l="Mood" r={`+${car.mood}/mo`} c={C.sage} />
                                    <Row l="Cash after" r={money(balance - (loan ? down : price))} />
                                </View>
                                <TouchableOpacity onPress={confirm} activeOpacity={0.85} style={{ height: 50, borderRadius: 10, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#2a1c00', letterSpacing: 3 }}>CONFIRM</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setPending(null)} style={{ height: 36, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dim }}>Not yet</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })()}
                </View>
            )}

            {toast && (
                <View style={{ position: 'absolute', bottom: TAB_STACK + 12, left: PAD, right: PAD, backgroundColor: 'rgba(8,12,24,0.96)', borderRadius: 10, borderWidth: 1, borderColor: (toast.ok ? C.sage : C.red) + '66', padding: 12, alignItems: 'center', zIndex: 30 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: toast.ok ? C.cream : C.red, textAlign: 'center' }}>{toast.msg}</Text>
                </View>
            )}
        </View>
    );
    function emiOf(price) { return calculateEMI(price - Math.round(price * CAR_LOAN_DOWN_PCT), 9.5, CAR_LOAN_TENURE); }
}

function Row({ l, r, c }) {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dim }}>{l}</Text>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: c || C.cream }}>{r}</Text>
        </View>
    );
}
