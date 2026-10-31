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
    const [detail, setDetail] = useState(null);     // the vehicle whose page is open
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
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, letterSpacing: 4 }}>WHEELS · WATER · AIR</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: C.cream, lineHeight: 28 }}>Showroom</Text>
                    </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3 }}>CASH</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#38b2ac', lineHeight: 22 }}>{money(balance)}</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row', paddingHorizontal: PAD, borderBottomWidth: 1, borderColor: C.border }}>
                <Tab id="new" label="NEW" /><Tab id="used" label="SECOND-HAND" /><Tab id="garage" label={`GARAGE (${cars.length})`} />
            </View>

            {tab !== 'garage' && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: PAD, paddingTop: 12 }}>
                    {VEHICLE_KINDS.map(k => (
                        <TouchableOpacity key={k.key} onPress={() => { setKind(k.key); if (k.key === 'toy') setTier('all'); }} activeOpacity={0.7}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: kind === k.key ? C.cream : C.dark, letterSpacing: 1, textDecorationLine: kind === k.key ? 'underline' : 'none' }}>{k.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            {tab !== 'garage' && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 16, paddingHorizontal: PAD, paddingTop: 6, paddingBottom: 10 }}>
                    {[{ key: 'all', label: 'ANY BUDGET', color: C.cream }, ...CAR_TIERS].map(t => (
                        <TouchableOpacity key={t.key} onPress={() => setTier(t.key)} activeOpacity={0.7}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: tier === t.key ? t.color : C.dark, letterSpacing: 1 }}>{t.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
                {tab !== 'garage' && used && (
                    <View style={{ borderLeftWidth: 2, borderColor: '#22305c', paddingLeft: 10, marginBottom: 12 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim }}>Second-hand cars are a few years old. You pay much less and lose less value, but servicing costs {Math.round((USED_RUN_FACTOR - 1) * 100)}% more.</Text>
                    </View>
                )}

                {tab !== 'garage' && list.length === 0 && (
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dim, textAlign: 'center', paddingVertical: 40 }}>Nothing here. Try another filter.</Text>
                )}

                {tab !== 'garage' && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        {list.map(car => {
                            const t = CAR_TIERS.find(x => x.key === car.tier);
                            const need = vehicleMinNetWorth(car);
                            const locked = netWorth < need;
                            const price = priceOf(car);
                            const run = carRunCost(car, { used });
                            return (
                                <TouchableOpacity key={car.id} onPress={() => setDetail(car)} activeOpacity={0.85}
                                    style={{ width: '48.5%', backgroundColor: C.panel, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 10, opacity: locked ? 0.5 : 1 }}>
                                    <View style={{ height: 96, backgroundColor: '#0a0e22', alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={car.image} style={{ width: '92%', height: 86 }} resizeMode="contain" />
                                    </View>
                                    <View style={{ padding: 8 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: t.color, letterSpacing: 2 }}>{t.label}{used ? ' · USED' : ''}</Text>
                                        <Text numberOfLines={1} style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.cream, lineHeight: 19 }}>{car.name}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: locked ? C.dark : C.gold, lineHeight: 24 }}>{short(price)}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: locked ? C.dark : C.dim }}>{locked ? `needs ${short(need)} net worth` : `runs −${short(run)}/mo`}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

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
                                                                                        <Image source={car.image} style={{ width: 180, height: 104 }} resizeMode="contain" />
                                            {isActive && <Text style={{ position: 'absolute', top: 8, left: 10, fontFamily: 'VT323_400Regular', fontSize: 14, color: C.gold, letterSpacing: 3 }}>● DRIVING</Text>}
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
                                        </View>
                                        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: C.border }}>
                                            {!isActive && (
                                                <>
                                                    <TouchableOpacity onPress={() => { setActiveCar(o.uid); say(`Now driving the ${car.name}.`); }} activeOpacity={0.6} style={{ flex: 1, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.cream, letterSpacing: 2 }}>DRIVE THIS</Text>
                                                    </TouchableOpacity>
                                                    <View style={{ width: 1, backgroundColor: C.border }} />
                                                </>
                                            )}
                                            <TouchableOpacity onPress={() => { if (!confirming) { setSellId(o.uid); return; } const r = sellCar(o.uid); setSellId(null); say(r.msg, r.success); }} activeOpacity={0.6} style={{ flex: 1, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.red, letterSpacing: 2 }}>{confirming ? `SELL ${short(value)}? TAP AGAIN` : 'SELL'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )
                )}
            </ScrollView>

            {detail && !pending && (() => {
                const car = detail, t = CAR_TIERS.find(x => x.key === car.tier);
                const need = vehicleMinNetWorth(car), locked = netWorth < need;
                const price = priceOf(car), run = carRunCost(car, { used });
                const down = Math.round(price * CAR_LOAN_DOWN_PCT);
                const canCash = balance >= price, canLoan = balance >= down;
                const Opt = ({ title, line, price: p, btn, enabled, why, onPress }) => (
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
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 15 }}>
                        <TouchableOpacity activeOpacity={1} onPress={() => setDetail(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(3,4,9,0.8)' }} />
                        <View style={{ backgroundColor: C.panel, borderTopWidth: 1, borderColor: '#2a3560', borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: '88%', overflow: 'hidden', paddingBottom: TAB_STACK }}>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={{ height: 190, backgroundColor: '#0a0e22', alignItems: 'center', justifyContent: 'center' }}>
                                    <Image source={car.image} style={{ width: '88%', height: 170 }} resizeMode="contain" />
                                </View>
                                <View style={{ padding: 14 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: t.color, letterSpacing: 3 }}>{t.label}{used ? ' · SECOND-HAND' : ' · NEW'}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: C.cream, lineHeight: 28 }}>{car.name}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim, marginBottom: 10 }}>{car.perk}</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Stat label="PRICE" value={short(price)} color={C.gold} />
                                        <Stat label="RUNNING / MO" value={`−${money(run)}`} color={C.red} />
                                        <Stat label="MOOD / MO" value={`+${car.mood}`} color={C.sage} />
                                    </View>
                                    {car.income ? <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.sage, marginTop: 6 }}>Earns +{money(car.income)}/mo when active</Text> : null}
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: car.dep < 0 ? C.sage : C.dim, marginTop: 6 }}>
                                        {car.dep < 0 ? `Value grows about ${Math.round(-car.dep * 100)}% a year` : car.dep === 0 ? 'Holds its value' : `Loses about ${Math.round((used ? car.dep * 0.75 : car.dep) * 100)}% of its value a year${used ? '' : ', and ~10% the day you drive it off'}`}
                                    </Text>
                                    {locked ? (
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dark, textAlign: 'center', paddingVertical: 18 }}>Locked · needs {short(need)} net worth</Text>
                                    ) : (
                                        <View style={{ marginTop: 10 }}>
                                            <Opt title="Pay in cash" p={short(price)} line="Pay it all now. No loan, no EMI." btn="BUY" enabled={canCash} why={`NEED ${short(price - balance)} MORE`} onPress={() => { setPending({ car, used, loan: false }); setDetail(null); }} />
                                            <Opt title="Finance it" p={`${short(down)} now`} line={`Pay ${money(down)} down, then about ${money(emiOf(price))} a month for ${CAR_LOAN_TENURE} months.`} btn="FINANCE" enabled={canLoan} why={`NEED ${short(down - balance)} MORE`} onPress={() => { setPending({ car, used, loan: true }); setDetail(null); }} />
                                        </View>
                                    )}
                                    <TouchableOpacity onPress={() => setDetail(null)} style={{ height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dim }}>Back</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                );
            })()}

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
