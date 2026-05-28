import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { GROCERY_ITEMS, CATEGORY_COLORS, SICK_LEAVE_THRESHOLD, CRITICAL_HEALTH_THRESHOLD } from '../data/groceries';

const PAD = 14;
const GAP = 8;

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

const KIRANA_IMG = require('../../assets/jobs/kirana store.png');

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

function ShopCard({ item, balance, onBuy }) {
    const catColor = CATEGORY_COLORS[item.category] || C.dim;
    const canAfford = balance >= item.price;
    const img = ITEM_IMAGES[item.id];
    return (
        <View style={{ flex: 1, backgroundColor: C.panel, overflow: 'hidden', borderRadius: 10 }}>
            <View style={{ width: '100%', aspectRatio: 0.78, backgroundColor: C.card }}>
                {img && <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="contain" />}
                <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(6,8,15,0.75)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: catColor, letterSpacing: 1 }}>{item.category.toUpperCase()}</Text>
                </View>
            </View>
            <View style={{ padding: 10 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.cream, lineHeight: 16, marginBottom: 4 }} numberOfLines={1}>{item.name}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#4ade80' }}>+{item.healthRestore}HP</Text>
                    {item.happiness > 0 && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.gold }}>+{item.happiness}😊</Text>}
                </View>
                <TouchableOpacity
                    onPress={() => canAfford && onBuy(item.id)}
                    activeOpacity={0.75}
                    style={{ borderRadius: 8, backgroundColor: canAfford ? '#0d1a2e' : '#0a0d14', paddingVertical: 7, alignItems: 'center', opacity: canAfford ? 1 : 0.4 }}
                >
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: canAfford ? '#60a5fa' : C.dark }}>
                        ₹{item.price.toLocaleString()}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function PantryCard({ entry, onConsume }) {
    const item = GROCERY_ITEMS.find(g => g.id === entry.itemId);
    if (!item) return null;
    const catColor = CATEGORY_COLORS[item.category] || C.dim;
    const img = ITEM_IMAGES[item.id];
    return (
        <View style={{ flex: 1, backgroundColor: C.panel, overflow: 'hidden', borderRadius: 10 }}>
            <View style={{ width: '100%', aspectRatio: 0.78, backgroundColor: C.card }}>
                {img && <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="contain" />}
                <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(4,6,14,0.85)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: catColor }}>×{entry.qty}</Text>
                </View>
            </View>
            <View style={{ padding: 10 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.cream, lineHeight: 16, marginBottom: 4 }} numberOfLines={1}>{item.name}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#4ade80' }}>+{item.healthRestore}HP</Text>
                    {item.happiness > 0 && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.gold }}>+{item.happiness}😊</Text>}
                </View>
                <TouchableOpacity
                    onPress={() => onConsume(entry.itemId)}
                    activeOpacity={0.75}
                    style={{ borderRadius: 8, backgroundColor: '#050f0a', paddingVertical: 7, alignItems: 'center' }}
                >
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#4ade80' }}>EAT ›</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function ItemGrid({ children }) {
    const items = React.Children.toArray(children);
    const rows = [];
    for (let i = 0; i < items.length; i += 2) {
        rows.push(
            <View key={i} style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
                {items[i]}
                {items[i + 1] || <View style={{ flex: 1 }} />}
            </View>
        );
    }
    return <View>{rows}</View>;
}

export default function GroceryScreen({ onClose, initialTab = 'shop', onOpenShop }) {
    const { balance, health, pantry, buyGrocery, consumeFood } = useGame();
    const pantryOnly = initialTab === 'pantry' && !!onOpenShop;
    const [tab, setTab] = useState(initialTab);
    const [toast, setToast] = useState(null);

    const showToast = (msg, color = C.sage) => {
        setToast({ msg, color });
        setTimeout(() => setToast(null), 2000);
    };

    const handleBuy = (itemId) => {
        const result = buyGrocery(itemId);
        showToast(result.msg, result.success ? C.sage : C.red);
    };

    const handleConsume = (itemId) => {
        const result = consumeFood(itemId);
        showToast(result.msg, result.success ? C.sage : C.red);
    };

    const pantryItems = pantry.filter(p => p.qty > 0);
    const totalPantryQty = pantryItems.reduce((s, p) => s + p.qty, 0);
    const hpColor = health >= 60 ? C.sage : health >= 30 ? C.gold : C.red;
    const hpPct = Math.max(0, Math.min(100, health));

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            {/* Banner */}
            <View style={{ height: 130, overflow: 'hidden', position: 'relative' }}>
                <Image source={KIRANA_IMG} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.35)' }} />
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, backgroundColor: 'rgba(4,6,14,0.78)' }} />

                <View style={{ position: 'absolute', top: 10, left: PAD, right: PAD, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dim, letterSpacing: 4, flex: 1 }}>DAILY ESSENTIALS</Text>
                    <TouchableOpacity onPress={onClose} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(4,6,14,0.85)', borderRadius: 14 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dim }}>✕</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ position: 'absolute', bottom: 10, left: PAD, right: PAD }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: C.cream, lineHeight: 26, marginBottom: 5 }}>{pantryOnly ? 'YOUR PANTRY' : 'GROCERY STORE'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                            <Image source={require('../../assets/ui_comp/healthicon.png')} style={{ width: 12, height: 12, opacity: 0.7 }} resizeMode="contain" />
                            <View style={{ flex: 1, height: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 2 }}>
                                <View style={{ height: '100%', width: `${hpPct}%`, backgroundColor: hpColor, borderRadius: 2 }} />
                            </View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: hpColor }}>{Math.round(health)}</Text>
                        </View>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.gold }}>₹{balance.toLocaleString()}</Text>
                    </View>
                </View>
            </View>

            {/* Warning banners */}
            {health < CRITICAL_HEALTH_THRESHOLD && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: PAD, marginTop: PAD, backgroundColor: '#150508', borderRadius: 8, padding: 12 }}>
                    <Image source={require('../../assets/ui_comp/warning.png')} style={{ width: 18, height: 18 }} resizeMode="contain" />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.red, flex: 1 }}>CRITICAL — Forced sick leave! Eat now.</Text>
                </View>
            )}
            {health >= CRITICAL_HEALTH_THRESHOLD && health < SICK_LEAVE_THRESHOLD && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: PAD, marginTop: PAD, backgroundColor: '#0d0c05', borderRadius: 8, padding: 12 }}>
                    <Image source={require('../../assets/ui_comp/warning.png')} style={{ width: 18, height: 18, opacity: 0.7 }} resizeMode="contain" />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.gold, flex: 1 }}>LOW HEALTH — Risk of sick leave.</Text>
                </View>
            )}
            {totalPantryQty <= 3 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: PAD, marginTop: PAD, backgroundColor: '#080d15', borderRadius: 8, padding: 12 }}>
                    <Image source={require('../../assets/ui_comp/groceryshop.png')} style={{ width: 18, height: 18, opacity: 0.7 }} resizeMode="contain" />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#60a5fa', flex: 1 }}>
                        {totalPantryQty === 0 ? 'Pantry empty — stock up to avoid health drain.' : `Low stock — ${totalPantryQty} item${totalPantryQty === 1 ? '' : 's'} left.`}
                    </Text>
                </View>
            )}

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: PAD, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                {pantryOnly ? (
                    /* ── Pantry-only mode (opened from home pantry button) ── */
                    pantryItems.length === 0 ? (
                        <View style={{ marginTop: 8 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dim, letterSpacing: 3, marginBottom: 10 }}>YOUR PANTRY</Text>
                            {/* Empty state — grocery store CTA card */}
                            <TouchableOpacity
                                onPress={onOpenShop}
                                activeOpacity={0.85}
                                style={{ borderRadius: 10, backgroundColor: C.panel, overflow: 'hidden' }}
                            >
                                <Image source={KIRANA_IMG} style={{ width: '100%', height: 130 }} resizeMode="cover" />
                                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 130, backgroundColor: 'rgba(4,6,14,0.5)' }} />
                                <View style={{ padding: 16 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.cream, marginBottom: 4 }}>PANTRY EMPTY</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, marginBottom: 14 }}>
                                        No food stocked. Health drains every month without groceries.
                                    </Text>
                                    <TouchableOpacity onPress={onOpenShop} activeOpacity={0.85} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#0a1428', borderRadius: 8, paddingVertical: 12 }}>
                                        <Image source={require('../../assets/ui_comp/groceryshop.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.blue, letterSpacing: 1 }}>GO TO GROCERY STORE</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dim, letterSpacing: 3, marginBottom: 10 }}>YOUR PANTRY</Text>
                            <ItemGrid>
                                {pantryItems.map(entry => (
                                    <PantryCard key={entry.itemId} entry={entry} onConsume={handleConsume} />
                                ))}
                            </ItemGrid>
                            {/* Grocery store link at the bottom */}
                            <TouchableOpacity
                                onPress={onOpenShop}
                                activeOpacity={0.85}
                                style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: C.border, backgroundColor: C.panel, padding: 12 }}
                            >
                                <Image source={require('../../assets/ui_comp/groceryshop.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim, flex: 1 }}>Need more? Go to Grocery Store</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.blue }}>▶</Text>
                            </TouchableOpacity>
                        </View>
                    )
                ) : (
                    /* ── Normal grocery store mode (shop only, pantry removed) ── */
                    <ItemGrid>
                        {GROCERY_ITEMS.map(item => (
                            <ShopCard key={item.id} item={item} balance={balance} onBuy={handleBuy} />
                        ))}
                    </ItemGrid>
                )}
            </ScrollView>

            {toast && (
                <View style={{ position: 'absolute', bottom: 24, left: PAD, right: PAD, backgroundColor: C.panel, borderWidth: 1, borderColor: toast.color + '60', padding: 12, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: toast.color }}>{toast.msg}</Text>
                </View>
            )}
        </View>
    );
}
