import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useGame } from '../context/GameContext';
import { RESIDENTIAL_PROPERTIES } from '../data/realEstate';

const PAD = 14;
const CARD_GAP = 10;

const C = {
    bg:       '#06080f',
    panel:    '#0a0d1a',
    card:     '#070a16',
    border:   '#1a2040',
    blue:     '#3b82f6',
    sage:     '#4ade80',
    red:      '#f87171',
    gold:     '#fbbf24',
    cream:    '#c8d4f0',
    dim:      '#445070',
    dark:     '#4a5580',
};

const QUALITY_LABELS = ['', 'Cramped', 'Basic', 'Simple', 'Decent', 'Comfortable', 'Good', 'Great', 'Excellent', 'Luxury', 'Dream'];
const QUALITY_COLORS = ['', '#6b7280', '#6b7280', '#9ca3af', '#d1d5db', '#fbbf24', '#34d399', '#34d399', '#60a5fa', '#a78bfa', '#f59e0b'];

const QualityDots = ({ score }) => {
    const color = QUALITY_COLORS[score] || '#6b7280';
    return (
        <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
            {Array.from({ length: 10 }).map((_, i) => (
                <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i < score ? color : '#1a2040' }} />
            ))}
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color, marginLeft: 6 }}>{QUALITY_LABELS[score]}</Text>
        </View>
    );
};

export default function HomeScreen({ onClose, onBuyProperty, onSellProperty }) {
    const { currentHousing, properties, balance, moveIn, rentProperty, happiness } = useGame();
    const [tab, setTab] = useState('owned');
    const [sortBy, setSortBy] = useState('price');

    const currentQuality = currentHousing.life_quality || 2;
    const currentQualityColor = QUALITY_COLORS[currentQuality] || '#6b7280';
    const ownedResidential = RESIDENTIAL_PROPERTIES.filter(p => properties.includes(p.id) && p.id !== currentHousing.id);
    const browseable = RESIDENTIAL_PROPERTIES
        .filter(p => !properties.includes(p.id))
        .sort((a, b) => sortBy === 'price' ? a.price - b.price : b.life_quality - a.life_quality);

    // A purchase that doesn't move you in moves the house out of Browse, so jump to Owned where MOVE IN lives
    // Keyed on the number of properties you own, so moving between homes you already own never counts as a purchase
    const prevOwned = useRef(properties.length);
    const [justBought, setJustBought] = useState(null);
    useEffect(() => {
        if (properties.length > prevOwned.current) {
            const newest = properties[properties.length - 1];
            if (RESIDENTIAL_PROPERTIES.some(p => p.id === newest) && newest !== currentHousing.id) {
                setTab('owned');
                setJustBought(newest);
            }
        }
        prevOwned.current = properties.length;
    }, [properties.length]);

    const handleMoveIn = (prop) => { const res = moveIn(prop.id); if (res.success) onClose(); };
    const happinessLabel = happiness >= 80 ? 'Thriving' : happiness >= 60 ? 'Content' : happiness >= 40 ? 'Okay' : happiness >= 20 ? 'Stressed' : 'Miserable';
    const happinessColor = happiness >= 80 ? C.sage : happiness >= 60 ? '#a3e635' : happiness >= 40 ? C.gold : happiness >= 20 ? '#f97316' : C.red;

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            {/* Header */}
            <View style={{ paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 4 }}>WHERE YOU LIVE</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: C.cream, lineHeight: 30 }}>HOME</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.dim }}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

                {/* ── CURRENT HOME ── */}
                <Image
                    source={currentHousing.image}
                    style={{ width: '100%', height: 220, marginBottom: 0 }}
                    resizeMode="cover"
                />

                <View style={{ paddingHorizontal: PAD, paddingTop: 18, paddingBottom: 6 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: currentQualityColor, letterSpacing: 3, marginBottom: 4 }}>LIVING HERE</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 32, color: C.cream, lineHeight: 34, marginBottom: 10 }}>{currentHousing.name}</Text>
                    <QualityDots score={currentQuality} />

                    <View style={{ flexDirection: 'row', gap: 32, marginTop: 16, marginBottom: 6 }}>
                        <View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, letterSpacing: 2 }}>RENT / MO</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: C.red }}>-₹{(!properties.includes(currentHousing.id) ? (currentHousing.rental_income || currentHousing.maintenance || 0) : (currentHousing.maintenance || 0)).toLocaleString()}</Text>
                        </View>
                        <View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, letterSpacing: 2 }}>WELLBEING</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: happinessColor }}>{Math.round(happiness)}/100 — {happinessLabel}</Text>
                        </View>
                    </View>
                </View>

                {/* Upgrade nudge */}
                {currentQuality < 6 && (
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070', paddingHorizontal: PAD, marginBottom: 16, lineHeight: 20 }}>
                        Upgrading your home will boost happiness and reduce healthcare costs.
                    </Text>
                )}

                {/* ── TABS ── */}
                <View style={{ flexDirection: 'row', paddingHorizontal: PAD, marginBottom: 14, borderBottomWidth: 1, borderColor: C.border }}>
                    {[['owned', `Owned (${ownedResidential.length})`], ['browse', 'Browse Homes']].map(([key, label]) => (
                        <TouchableOpacity key={key} onPress={() => setTab(key)} style={{ marginRight: 24, paddingBottom: 10 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: tab === key ? C.blue : C.dim }}>{label}</Text>
                            {tab === key && <View style={{ height: 2, backgroundColor: C.blue, borderRadius: 1, marginTop: 4 }} />}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── OWNED TAB ── */}
                {tab === 'owned' && (
                    <View style={{ paddingHorizontal: PAD }}>
                        {justBought && ownedResidential.some(p => p.id === justBought) && (
                            <View style={{ backgroundColor: '#0d2218', borderWidth: 1, borderColor: '#4ade8066', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.sage }}>You bought a new home!</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#9fd8b4' }}>You still live in {currentHousing.name}. Tap MOVE IN below to switch.</Text>
                            </View>
                        )}
                        {ownedResidential.length === 0 ? (
                            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                                <Image source={require('../../assets/ui_comp/home.png')} style={{ width: 32, height: 32, opacity: 0.2, marginBottom: 12 }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dark, textAlign: 'center', lineHeight: 24 }}>
                                    You don't own any other properties yet.{'\n'}Buy a home to unlock MOVE IN.
                                </Text>
                            </View>
                        ) : (
                            <View style={{ gap: 12 }}>
                                {ownedResidential.map((prop) => {
                                    const qualityDelta = prop.life_quality - currentQuality;
                                    const deltaColor = qualityDelta > 0 ? C.sage : qualityDelta < 0 ? C.red : '#6b7280';
                                    return (
                                        <View key={prop.id} style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: C.panel, borderWidth: 1, borderColor: justBought === prop.id ? '#fbbf2477' : C.border }}>
                                            <Image source={prop.image} style={{ width: '100%', height: 150 }} resizeMode="cover" />
                                            <View style={{ padding: 12 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.cream, flex: 1 }}>{prop.name}</Text>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: deltaColor }}>
                                                        {qualityDelta > 0 ? `+${qualityDelta} quality` : qualityDelta < 0 ? `${qualityDelta} quality` : 'same'}
                                                    </Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                                    <TouchableOpacity onPress={() => onSellProperty && onSellProperty(prop)} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#2a0d0d', borderRadius: 8 }}>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.red }}>SELL</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => handleMoveIn(prop)} style={{ flex: 2, paddingVertical: 10, alignItems: 'center', backgroundColor: '#fbbf24', borderRadius: 8 }}>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#2a1c00', letterSpacing: 2 }}>MOVE IN</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                )}

                {/* ── BROWSE TAB ── */}
                {tab === 'browse' && (
                    <View style={{ paddingHorizontal: PAD }}>
                        {/* Sort pills */}
                        <View style={{ flexDirection: 'row', marginBottom: 12, gap: 8, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark }}>SORT</Text>
                            {[['price', 'Price'], ['quality', 'Quality']].map(([key, label]) => (
                                <TouchableOpacity key={key} onPress={() => setSortBy(key)} style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: sortBy === key ? C.blue + '22' : 'transparent' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: sortBy === key ? C.blue : C.dim }}>{label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={{ gap: 16 }}>
                            {browseable.map((prop) => {
                                const canAfford = balance >= prop.price;
                                const qualityDelta = prop.life_quality - currentQuality;
                                const deltaColor = qualityDelta > 0 ? C.sage : qualityDelta < 0 ? C.red : '#6b7280';
                                const qualColor = QUALITY_COLORS[prop.life_quality] || '#6b7280';
                                const priceStr = `₹${prop.price >= 10000000 ? `${(prop.price / 10000000).toFixed(1)}Cr` : `${(prop.price / 100000).toFixed(0)}L`}`;
                                return (
                                    <View key={prop.id} style={{ borderRadius: 10, overflow: 'hidden', backgroundColor: C.panel }}>
                                        {/* Image */}
                                        <View style={{ position: 'relative' }}>
                                            <Image source={prop.image} style={{ width: '100%', height: 150 }} resizeMode="cover" />
                                            <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(4,6,14,0.82)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: qualColor }}>{prop.life_quality}/10</Text>
                                            </View>
                                            {canAfford && (
                                                <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(5,35,24,0.82)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.sage }}>CAN AFFORD</Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Info */}
                                        <View style={{ padding: 14 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: canAfford ? C.cream : C.dim, flex: 1 }}>{prop.name}</Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: deltaColor }}>
                                                    {qualityDelta > 0 ? `+${qualityDelta} quality` : qualityDelta < 0 ? `${qualityDelta} quality` : 'same'}
                                                </Text>
                                            </View>
                                            <QualityDots score={prop.life_quality} />
                                            <View style={{ flexDirection: 'row', gap: 20, marginTop: 10, marginBottom: 14 }}>
                                                <View>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: C.dark, letterSpacing: 2, marginBottom: 1 }}>PRICE</Text>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: canAfford ? C.cream : C.dim }}>{priceStr}</Text>
                                                </View>
                                                <View>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: C.dark, letterSpacing: 2, marginBottom: 1 }}>PER MONTH</Text>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.red }}>-₹{prop.maintenance.toLocaleString()}</Text>
                                                </View>
                                            </View>

                                            {/* Buttons — solid backgrounds, rounded, clearly readable */}
                                            <TouchableOpacity onPress={() => { const res = rentProperty(prop.id); if (res.success) onClose(); }} style={{ paddingVertical: 12, alignItems: 'center', backgroundColor: '#0d2218', borderRadius: 8, marginBottom: 8 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.sage, letterSpacing: 1 }}>RENT  ₹{prop.rental_income?.toLocaleString()}/mo</Text>
                                            </TouchableOpacity>
                                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                                                <TouchableOpacity onPress={() => canAfford && onBuyProperty(prop, true)} disabled={!canAfford} style={{ flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: canAfford ? '#0d1e3a' : '#0a0d1a', borderRadius: 8, opacity: canAfford ? 1 : 0.4 }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#60a5fa' }}>BUY + MOVE IN</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => onBuyProperty(prop, false)} style={{ flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#0a0d1a', borderRadius: 8 }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim }}>LOAN + MOVE IN</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <TouchableOpacity onPress={() => canAfford && onBuyProperty(prop, false, false)} disabled={!canAfford} style={{ paddingVertical: 8, alignItems: 'center', opacity: canAfford ? 0.9 : 0.3 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#a8b4d8' }}>Buy but keep living at {currentHousing.name} ›</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
