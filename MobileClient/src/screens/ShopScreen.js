import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { GROCERY_ITEMS, CATEGORY_COLORS } from '../data/groceries';

const PAD = 14;
const GAP = 8;

const C = {
    bg:      '#06080f',
    panel:   '#0d1020',
    card:    '#070a16',
    border:  '#1a2040',
    blue:    '#3b82f6',
    sage:    '#4ade80',
    red:     '#f87171',
    gold:    '#fbbf24',
    pink:    '#ec4899',
    cream:   '#c8d4f0',
    dim:     '#445070',
    dark:    '#2a3560',
};

const ITEM_IMAGES = {
    dal_chawal:       require('../../assets/groceries/dal chawal.png'),
    bread_eggs:       require('../../assets/groceries/bread and eggs.png'),
    instant_noodles:  require('../../assets/groceries/cup noodles.png'),
    fresh_veggies:    require('../../assets/groceries/veggies.png'),
    fruits:           require('../../assets/groceries/fruits.png'),
    organic_meal_kit: require('../../assets/groceries/healthy meal box.png'),
    protein_pack:     require('../../assets/groceries/paneer tofu.png'),
    snack_box:        require('../../assets/groceries/chips snacks box.png'),
    chai:             require('../../assets/groceries/chai.png'),
    milk:             require('../../assets/groceries/milk.png'),
    paratha:          require('../../assets/groceries/paratha.png'),
    rajma_rice:       require('../../assets/groceries/rajma rice.png'),
    thaali:           require('../../assets/groceries/thaali.png'),
    smoothie:         require('../../assets/groceries/smoothis.png'),
    mithai_box:       require('../../assets/groceries/mithai box.png'),
};

// ── Header ────────────────────────────────────────────────────────────────────
function ScreenHeader({ title, subtitle, onBack, onClose }) {
    return (
        <View style={{ backgroundColor: C.panel, paddingTop: 14, paddingBottom: 12, paddingHorizontal: PAD, borderBottomWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                {onBack && (
                    <TouchableOpacity onPress={onBack} style={{ width: 30, height: 30, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginRight: 4 }}>
                        <FontAwesome5 name="chevron-left" size={11} color={C.dim} />
                    </TouchableOpacity>
                )}
                <View>
                    {subtitle && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 4 }}>{subtitle}</Text>}
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: C.cream, lineHeight: 28 }}>{title}</Text>
                </View>
            </View>
            {onClose && (
                <TouchableOpacity onPress={onClose} style={{ width: 34, height: 34, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome5 name="times" size={14} color={C.dim} />
                </TouchableOpacity>
            )}
        </View>
    );
}


// ── Grocery section (inline) ──────────────────────────────────────────────────
function GrocerySection({ onBack, onClose }) {
    const { balance, buyGrocery } = useGame();
    const [toast, setToast] = useState(null);

    const showToast = (msg, ok, extra) => { setToast({ msg, ok, extra }); setTimeout(() => setToast(null), 2500); };

    const handleBuy = (item) => {
        const r = buyGrocery(item.id);
        if (r.success) {
            showToast(`${item.name} added to pantry`, true, `Balance: ₹${(balance - item.price).toLocaleString()}`);
        } else {
            showToast(r.msg, false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ScreenHeader title="Grocery Store" subtitle="GROCERY" onBack={onBack} onClose={onClose} />

            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 50 }}>
                {Array.from({ length: Math.ceil(GROCERY_ITEMS.length / 2) }).map((_, row) => (
                    <View key={row} style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
                        {GROCERY_ITEMS.slice(row * 2, row * 2 + 2).map(item => {
                            const catColor = CATEGORY_COLORS[item.category] || C.dim;
                            const canAfford = balance >= item.price;
                            const img = ITEM_IMAGES[item.id];
                            return (
                                <View key={item.id} style={{ flex: 1, borderRadius: 10, backgroundColor: C.panel, overflow: 'hidden' }}>
                                    <View style={{ height: 90, position: 'relative' }}>
                                        {img ? <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <View style={{ flex: 1, backgroundColor: catColor + '15' }} />}
                                        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,8,15,0.15)' }} />
                                    </View>
                                    <View style={{ padding: 8 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.cream }} numberOfLines={1}>{item.name}</Text>
                                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.sage }}>+{item.healthRestore}HP</Text>
                                            {item.happiness > 0 && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.gold }}>+{item.happiness}</Text>}
                                        </View>
                                        <TouchableOpacity onPress={() => handleBuy(item)} disabled={!canAfford}
                                            style={{ marginTop: 6, backgroundColor: canAfford ? C.gold + '18' : C.card, borderRadius: 6, paddingVertical: 7, alignItems: 'center', opacity: canAfford ? 1 : 0.4 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: canAfford ? C.gold : C.dark }}>₹{item.price.toLocaleString()}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ))}
            </ScrollView>

            {toast && (
                <View style={{ position: 'absolute', bottom: 70, alignSelf: 'center', left: PAD * 2, right: PAD * 2, backgroundColor: 'rgba(8,12,24,0.94)', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: toast.ok ? '#4ade80' : '#f87171' }} />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: toast.ok ? '#c8d4f0' : '#f87171', flex: 1 }}>{toast.msg}</Text>
                    {toast.extra && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>{toast.extra}</Text>}
                </View>
            )}
        </View>
    );
}


// ── Main ShopScreen — grocery only ───────────────────────────────────────────
export default function ShopScreen({ onClose }) {
    return <GrocerySection onClose={onClose} />;
}
