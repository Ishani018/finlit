import { useState } from 'react';
import {
    View, Text, TouchableOpacity, Image, ScrollView,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { RESIDENTIAL_PROPERTIES } from '../data/realEstate';

const PAD = 14;
const CARD_GAP = 8;

const C = {
    bg:       '#06080f',
    panel:    '#0d1020',
    card:     '#070a16',
    border:   '#1a2040',
    borderLt: '#1e2840',
    blue:     '#3b82f6',
    sage:     '#4ade80',
    red:      '#f87171',
    gold:     '#fbbf24',
    cream:    '#c8d4f0',
    dim:      '#445070',
    dark:     '#2a3560',
};

const QUALITY_LABELS = ['', 'Cramped', 'Basic', 'Simple', 'Decent', 'Comfortable', 'Good', 'Great', 'Excellent', 'Luxury', 'Dream'];
const QUALITY_COLORS = ['', '#6b7280', '#6b7280', '#9ca3af', '#d1d5db', '#fbbf24', '#34d399', '#34d399', '#60a5fa', '#a78bfa', '#f59e0b'];

const QualityBar = ({ score, size = 'normal' }) => {
    const color = QUALITY_COLORS[score] || '#6b7280';
    const label = QUALITY_LABELS[score] || '';
    const fontSize = size === 'large' ? 20 : 15;
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ flexDirection: 'row', gap: 2 }}>
                {Array.from({ length: 10 }).map((_, i) => (
                    <View key={i} style={{ width: size === 'large' ? 10 : 7, height: size === 'large' ? 6 : 4, backgroundColor: i < score ? color : C.dark }} />
                ))}
            </View>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize, color, letterSpacing: 1 }}>{label}</Text>
        </View>
    );
};

export default function HomeScreen({ onClose, onBuyProperty, onSellProperty }) {
    const {
        currentHousing, properties, balance, moveIn, happiness,
    } = useGame();

    const [tab, setTab] = useState('owned');
    const [sortBy, setSortBy] = useState('price');

    const currentQuality = currentHousing.life_quality || 2;
    const currentQualityColor = QUALITY_COLORS[currentQuality] || '#6b7280';

    const ownedResidential = RESIDENTIAL_PROPERTIES.filter(p => properties.includes(p.id) && p.id !== currentHousing.id);

    const browseable = RESIDENTIAL_PROPERTIES
        .filter(p => !properties.includes(p.id))
        .sort((a, b) => sortBy === 'price' ? a.price - b.price : b.life_quality - a.life_quality);

    const handleMoveIn = (prop) => {
        const res = moveIn(prop.id);
        if (res.success) onClose();
    };

    const happinessLabel = happiness >= 80 ? 'Thriving' : happiness >= 60 ? 'Content' : happiness >= 40 ? 'Okay' : happiness >= 20 ? 'Stressed' : 'Miserable';
    const happinessColor = happiness >= 80 ? C.sage : happiness >= 60 ? '#a3e635' : happiness >= 40 ? '#fbbf24' : happiness >= 20 ? '#f97316' : '#f87171';

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            {/* Header */}
            <View style={{ paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 4 }}>WHERE YOU LIVE</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: C.cream, letterSpacing: 1, lineHeight: 30 }}>HOME</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.dark }}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

                {/* ── CURRENT HOME CARD ── */}
                <View style={{ margin: PAD, borderWidth: 2, borderColor: currentQualityColor + '55', backgroundColor: C.panel, overflow: 'hidden', position: 'relative' }}>
                    {currentHousing.image ? (
                        <Image source={currentHousing.image} style={{ width: '100%', height: 140 }} resizeMode="cover" />
                    ) : (
                        <View style={{ width: '100%', height: 140, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 40, color: C.border }}>⌂</Text>
                        </View>
                    )}

                    <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: currentQualityColor, paddingHorizontal: 10, paddingVertical: 3 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#000', letterSpacing: 2 }}>LIVING HERE</Text>
                    </View>

                    <View style={{ padding: 12 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.cream, letterSpacing: 1 }}>{currentHousing.name}</Text>

                        <View style={{ marginTop: 6, marginBottom: 10 }}>
                            <QualityBar score={currentQuality} size="large" />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 20 }}>
                            <View>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 2 }}>MONTHLY COST</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#f87171' }}>-₹{(currentHousing.maintenance || 0).toLocaleString()}/mo</Text>
                            </View>
                            <View>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 2 }}>WELLBEING</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: happinessColor }}>{Math.round(happiness)}/100 — {happinessLabel}</Text>
                            </View>
                        </View>

                        {currentQuality < 6 && (
                            <View style={{ marginTop: 10, backgroundColor: '#0d1828', borderWidth: 1, borderColor: '#1a3050', padding: 8 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#60a5fa', lineHeight: 16 }}>
                                    Your home is affecting your wellbeing. Upgrading will boost happiness and reduce healthcare costs.
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* ── TABS ── */}
                <View style={{ flexDirection: 'row', marginHorizontal: PAD, marginBottom: 12, borderWidth: 1, borderColor: C.border }}>
                    {[['owned', `OWNED (${ownedResidential.length})`], ['browse', 'BROWSE HOMES']].map(([key, label]) => (
                        <TouchableOpacity
                            key={key}
                            onPress={() => setTab(key)}
                            style={{
                                flex: 1, paddingVertical: 10, alignItems: 'center',
                                borderRightWidth: key === 'owned' ? 1 : 0,
                                borderColor: C.border,
                                backgroundColor: tab === key ? C.card : C.panel,
                            }}
                        >
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: tab === key ? C.blue : C.dark, letterSpacing: 2 }}>
                                {label}
                            </Text>
                            {tab === key && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: C.blue }} />}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── OWNED TAB ── */}
                {tab === 'owned' && (
                    <View style={{ paddingHorizontal: PAD }}>
                        {ownedResidential.length === 0 ? (
                            <View style={{ alignItems: 'center', paddingVertical: 40, borderWidth: 1, borderColor: C.border, backgroundColor: C.panel }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.dark, textAlign: 'center', lineHeight: 28 }}>
                                    You don't own any other properties yet.{'\n'}Buy a home to unlock MOVE IN.
                                </Text>
                            </View>
                        ) : (
                            <View style={{ gap: 12 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dim, letterSpacing: 3 }}>
                                    MOVE IN FREE — YOU OWN THESE
                                </Text>
                                {ownedResidential.map((prop) => {
                                    const qualityDelta = prop.life_quality - currentQuality;
                                    const deltaColor = qualityDelta > 0 ? C.sage : qualityDelta < 0 ? '#f87171' : '#6b7280';
                                    return (
                                        <View key={prop.id} style={{ borderWidth: 1, borderColor: C.borderLt, backgroundColor: C.panel, overflow: 'hidden' }}>
                                            <Image source={prop.image} style={{ width: '100%', height: 120 }} resizeMode="cover" />
                                            <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(4,6,14,0.85)', paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: C.border }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.cream, letterSpacing: 1 }}>{prop.name}</Text>
                                            </View>
                                            <View style={{ padding: 14 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                    <QualityBar score={prop.life_quality} size="large" />
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: deltaColor }}>
                                                        {qualityDelta > 0 ? `▲ +${qualityDelta} quality` : qualityDelta < 0 ? `▼ ${qualityDelta} quality` : '= same quality'}
                                                    </Text>
                                                </View>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#f87171', marginBottom: 12 }}>-₹{prop.maintenance.toLocaleString()}/mo</Text>
                                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                                    <TouchableOpacity
                                                        onPress={() => onSellProperty && onSellProperty(prop)}
                                                        style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#0d0508', borderWidth: 1, borderColor: '#7f1d1d' }}
                                                    >
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#f87171', letterSpacing: 1 }}>SELL</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => handleMoveIn(prop)}
                                                        style={{ flex: 2, paddingVertical: 10, alignItems: 'center', backgroundColor: '#050d14', borderWidth: 1, borderColor: '#3b82f6' }}
                                                    >
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#60a5fa', letterSpacing: 2 }}>LIVE IN ▶</Text>
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
                        <View style={{ flexDirection: 'row', marginBottom: 12, gap: 8, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dark, letterSpacing: 1 }}>SORT:</Text>
                            {[['price', 'PRICE'], ['quality', 'LIFE QUALITY']].map(([key, label]) => (
                                <TouchableOpacity
                                    key={key}
                                    onPress={() => setSortBy(key)}
                                    style={{ paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: sortBy === key ? C.blue : C.border, backgroundColor: sortBy === key ? '#050d1e' : 'transparent' }}
                                >
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: sortBy === key ? C.blue : C.dark }}>{label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View>
                            {Array.from({ length: Math.ceil(browseable.length / 2) }).map((_, rowIdx) => (
                                <View key={rowIdx} style={{ flexDirection: 'row', gap: CARD_GAP, marginBottom: CARD_GAP }}>
                                    {browseable.slice(rowIdx * 2, rowIdx * 2 + 2).map((prop) => {
                                        const canAfford = balance >= prop.price;
                                        const qualityDelta = prop.life_quality - currentQuality;
                                        const deltaColor = qualityDelta > 0 ? C.sage : qualityDelta < 0 ? '#f87171' : '#6b7280';
                                        const qualColor = QUALITY_COLORS[prop.life_quality] || '#6b7280';
                                        return (
                                            <View key={prop.id} style={{
                                                flex: 1,
                                                borderWidth: 1,
                                                borderColor: canAfford ? C.borderLt : C.border,
                                                backgroundColor: C.panel,
                                                overflow: 'hidden',
                                            }}>
                                                <Image source={prop.image} style={{ width: '100%', height: 100 }} resizeMode="cover" />

                                                <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: qualColor + 'cc', paddingHorizontal: 6, paddingVertical: 2 }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#000' }}>{prop.life_quality}/10</Text>
                                                </View>

                                                {canAfford && (
                                                    <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: '#0d1e10', borderWidth: 1, borderColor: '#22c55e', paddingHorizontal: 6, paddingVertical: 2 }}>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.sage, letterSpacing: 1 }}>✓ AFFORD</Text>
                                                    </View>
                                                )}

                                                <View style={{ padding: 8 }}>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: canAfford ? C.cream : C.dark, lineHeight: 18, marginBottom: 4 }} numberOfLines={2}>{prop.name}</Text>
                                                    <QualityBar score={prop.life_quality} />
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: deltaColor, marginTop: 3 }}>
                                                        {qualityDelta > 0 ? `▲ +${qualityDelta} happiness` : qualityDelta < 0 ? `▼ ${qualityDelta} quality` : '= same quality'}
                                                    </Text>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: canAfford ? C.cream : C.dark, marginTop: 4 }}>
                                                        ₹{prop.price >= 10000000 ? `${(prop.price / 10000000).toFixed(1)}Cr` : `${(prop.price / 100000).toFixed(0)}L`}
                                                    </Text>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dark }}>-₹{prop.maintenance.toLocaleString()}/mo</Text>

                                                    <View style={{ marginTop: 8, gap: 5 }}>
                                                        <TouchableOpacity
                                                            onPress={() => canAfford && onBuyProperty(prop, true)}
                                                            disabled={!canAfford}
                                                            style={{
                                                                paddingVertical: 7, alignItems: 'center',
                                                                backgroundColor: canAfford ? '#050d14' : C.card,
                                                                borderWidth: 1, borderColor: canAfford ? '#3b82f6' : C.border,
                                                            }}
                                                        >
                                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: canAfford ? '#60a5fa' : C.dark, letterSpacing: 1 }}>
                                                                {canAfford ? 'BUY + LIVE IN ▶' : 'NEED MORE FUNDS'}
                                                            </Text>
                                                        </TouchableOpacity>

                                                        <TouchableOpacity
                                                            onPress={() => onBuyProperty(prop, false)}
                                                            style={{
                                                                paddingVertical: 6, alignItems: 'center',
                                                                backgroundColor: C.card,
                                                                borderWidth: 1, borderColor: C.border,
                                                            }}
                                                        >
                                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dim, letterSpacing: 1 }}>LOAN + LIVE IN</Text>
                                                        </TouchableOpacity>

                                                        <TouchableOpacity
                                                            onPress={() => canAfford && onBuyProperty(prop, false, false)}
                                                            style={{
                                                                paddingVertical: 5, alignItems: 'center',
                                                                borderWidth: 1, borderColor: C.border,
                                                            }}
                                                        >
                                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark }}>BUY TO INVEST</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    })}
                                    {browseable.slice(rowIdx * 2, rowIdx * 2 + 2).length === 1 && <View style={{ flex: 1 }} />}
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
