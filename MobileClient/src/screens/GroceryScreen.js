import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { GROCERY_ITEMS, CATEGORY_COLORS, DIET_COLORS, SICK_LEAVE_THRESHOLD, CRITICAL_HEALTH_THRESHOLD } from '../data/groceries';
import { ITEM_IMAGES } from '../data/groceryImages';

const PAD = 14;
const TAB_BAR_H = 120; // the bottom tab bar sits above this overlay, so the cart bar clears it
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

const KIRANA_IMG = require('../../assets/jobs/kirana_store.png');

const FILTERS = [['all', 'ALL'], ['veg', 'VEG'], ['nonveg', 'NON-VEG'], ['healthy', 'HEALTHY'], ['premium', 'PREMIUM'], ['junk', 'JUNK']];

function ShopCard({ item, qty, canAdd, bestValue, onAdd, onRemove }) {
    const catColor = CATEGORY_COLORS[item.category] || C.dim;
    const dietColor = DIET_COLORS[item.diet] || C.dim;
    const img = ITEM_IMAGES[item.id];
    return (
        <View style={{ flex: 1, backgroundColor: C.panel, overflow: 'hidden', borderRadius: 10, borderWidth: 1, borderColor: qty > 0 ? C.gold : catColor + '30' }}>
            <View style={{ width: '100%', aspectRatio: 1, backgroundColor: C.card }}>
                {img && <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="contain" />}
                <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(4,6,14,0.85)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.gold }}>₹{item.price.toLocaleString()}</Text>
                </View>
                <View style={{ position: 'absolute', top: 7, right: 7, width: 14, height: 14, borderWidth: 1, borderColor: dietColor, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(4,6,14,0.85)' }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dietColor }} />
                </View>
                {bestValue && (
                    <View style={{ position: 'absolute', bottom: 6, left: 6, backgroundColor: '#0d2218', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.sage, letterSpacing: 1 }}>BEST VALUE</Text>
                    </View>
                )}
            </View>
            <View style={{ padding: 10 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.cream, lineHeight: 17, marginBottom: 4 }} numberOfLines={1}>{item.name}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.sage }}>+{item.healthRestore} HP</Text>
                    {item.happiness > 0 && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.gold }}>+{item.happiness} mood</Text>}
                </View>
                {qty === 0 ? (
                    <TouchableOpacity
                        onPress={() => canAdd && onAdd(item.id)}
                        activeOpacity={0.75}
                        style={{ borderRadius: 8, backgroundColor: canAdd ? '#0d1a2e' : '#0a0d14', paddingVertical: 7, alignItems: 'center', opacity: canAdd ? 1 : 0.4 }}
                    >
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: canAdd ? '#60a5fa' : C.dark, letterSpacing: 1 }}>ADD</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <TouchableOpacity onPress={() => onRemove(item.id)} activeOpacity={0.75} style={{ width: 40, borderRadius: 8, backgroundColor: '#1a2040', paddingVertical: 5, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream, lineHeight: 22 }}>−</Text>
                        </TouchableOpacity>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.gold }}>{qty}</Text>
                        <TouchableOpacity onPress={() => canAdd && onAdd(item.id)} activeOpacity={0.75} style={{ width: 40, borderRadius: 8, backgroundColor: canAdd ? C.gold : '#1a2040', paddingVertical: 5, alignItems: 'center', opacity: canAdd ? 1 : 0.5 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: canAdd ? '#2a1c00' : C.dim, lineHeight: 22 }}>+</Text>
                        </TouchableOpacity>
                    </View>
                )}
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

export default function GroceryScreen({ onClose, onBack, initialTab = 'shop', onOpenShop }) {
    const { balance, health, pantry, buyGrocery, consumeFood } = useGame();
    const pantryOnly = initialTab === 'pantry' && !!onOpenShop;
    const [tab, setTab] = useState(initialTab);
    const [toast, setToast] = useState(null);
    const [filter, setFilter] = useState('all');
    const [cart, setCart] = useState({});

    const showToast = (msg, color = C.sage) => {
        setToast({ msg, color });
        setTimeout(() => setToast(null), 2000);
    };

    const cartLines = GROCERY_ITEMS.filter(it => (cart[it.id] || 0) > 0);
    const cartCount = cartLines.reduce((n, it) => n + cart[it.id], 0);
    const cartTotal = cartLines.reduce((n, it) => n + it.price * cart[it.id], 0);
    const cartHealth = cartLines.reduce((n, it) => n + it.healthRestore * cart[it.id], 0);
    const remaining = balance - cartTotal;
    const bestValueId = GROCERY_ITEMS.reduce((best, it) => (it.healthRestore / it.price > best.healthRestore / best.price ? it : best), GROCERY_ITEMS[0]).id;
    const visibleItems = GROCERY_ITEMS.filter(it => filter === 'all' ? true : (filter === 'veg' || filter === 'nonveg') ? it.diet === filter : it.category === filter);

    const addToCart = (id) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
    const removeFromCart = (id) => setCart(c => {
        const next = { ...c, [id]: (c[id] || 0) - 1 };
        if (next[id] <= 0) delete next[id];
        return next;
    });

    const handlePay = () => {
        if (cartCount === 0) return;
        if (cartTotal > balance) { showToast('Not enough cash.', C.red); return; }
        cartLines.forEach(it => buyGrocery(it.id, cart[it.id]));
        showToast(`Bought ${cartCount} item${cartCount === 1 ? '' : 's'} for ₹${cartTotal.toLocaleString()}`, C.sage);
        setCart({});
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
            <View style={{ height: 130, overflow: 'hidden', borderRadius: 12, position: 'relative' }}>
                <Image source={KIRANA_IMG} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.35)' }} />
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, backgroundColor: 'rgba(4,6,14,0.78)' }} />

                <View style={{ position: 'absolute', top: 10, left: PAD, right: PAD, flexDirection: 'row', alignItems: 'center' }}>
                    {onBack && (
                        <TouchableOpacity onPress={onBack} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(4,6,14,0.85)', borderRadius: 14, marginRight: 10 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.dim, lineHeight: 24 }}>‹</Text>
                        </TouchableOpacity>
                    )}
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dim, letterSpacing: 4, flex: 1 }}>DAILY ESSENTIALS</Text>
                    <TouchableOpacity onPress={onClose} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(4,6,14,0.85)', borderRadius: 14 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dim }}>✕</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ position: 'absolute', bottom: 10, left: PAD, right: PAD }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: C.cream, lineHeight: 26, marginBottom: 5 }}>{pantryOnly ? 'YOUR PANTRY' : 'GROCERY STORE'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                            <Image source={require('../../assets/ui_comp/healthicon.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
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
                    <Image source={require('../../assets/ui_comp/warning.png')} style={{ width: 26, height: 26 }} resizeMode="contain" />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.gold, flex: 1 }}>LOW HEALTH — Risk of sick leave.</Text>
                </View>
            )}
            {totalPantryQty <= 3 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: PAD, marginTop: PAD, backgroundColor: '#080d15', borderRadius: 8, padding: 12 }}>
                    <Image source={require('../../assets/ui_comp/groceryshop.png')} style={{ width: 26, height: 26 }} resizeMode="contain" />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#60a5fa', flex: 1 }}>
                        {totalPantryQty === 0 ? 'Pantry empty — stock up to avoid health drain.' : `Low stock — ${totalPantryQty} item${totalPantryQty === 1 ? '' : 's'} left.`}
                    </Text>
                </View>
            )}

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: PAD, paddingBottom: pantryOnly ? 40 : 110 + TAB_BAR_H }} showsVerticalScrollIndicator={false}>

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
                                style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, borderColor: C.border, backgroundColor: C.panel, padding: 12 }}
                            >
                                <Image source={require('../../assets/ui_comp/groceryshop.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.dim, flex: 1 }}>Need more? Go to Grocery Store</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.blue }}>▶</Text>
                            </TouchableOpacity>
                        </View>
                    )
                ) : (
                    /* ── Normal grocery store mode: filters, cart and product grid ── */
                    <View>
                        <View style={{ backgroundColor: C.panel, borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: C.border }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.cream }}>Health with your cart</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.cream }}>
                                    <Text style={{ color: hpColor }}>{Math.round(health)}</Text>
                                    <Text style={{ color: C.dim }}> → </Text>
                                    <Text style={{ color: C.sage }}>{Math.round(Math.min(100, health + cartHealth))}</Text>
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: C.border }}>
                                <View style={{ width: `${hpPct}%`, backgroundColor: hpColor }} />
                                <View style={{ width: `${Math.max(0, Math.min(100 - hpPct, cartHealth))}%`, backgroundColor: C.sage }} />
                            </View>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 8 }}>
                            {FILTERS.map(([key, label]) => (
                                <TouchableOpacity key={key} onPress={() => setFilter(key)} activeOpacity={0.8}
                                    style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: filter === key ? C.gold : C.dim, letterSpacing: 1, textDecorationLine: filter === key ? 'underline' : 'none' }}>{label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <ItemGrid>
                            {visibleItems.map(item => (
                                <ShopCard
                                    key={item.id}
                                    item={item}
                                    qty={cart[item.id] || 0}
                                    canAdd={remaining >= item.price}
                                    bestValue={item.id === bestValueId}
                                    onAdd={addToCart}
                                    onRemove={removeFromCart}
                                />
                            ))}
                        </ItemGrid>
                    </View>
                )}
            </ScrollView>

            {!pantryOnly && (
                <View style={{ position: 'absolute', left: 0, right: 0, bottom: TAB_BAR_H, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0a0d1a', borderTopWidth: 1, borderColor: C.border, paddingHorizontal: PAD, paddingVertical: 10 }}>
                    <View style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: '#111733', alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={require('../../assets/ui_comp/pantry.png')} style={{ width: 30, height: 30 }} resizeMode="contain" />
                        {totalPantryQty > 0 && (
                            <View style={{ position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: C.sage, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#06210f' }}>{totalPantryQty}</Text>
                            </View>
                        )}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim }}>{cartCount === 0 ? 'Cart is empty' : `Cart · ${cartCount} item${cartCount === 1 ? '' : 's'}`}</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: C.cream, lineHeight: 24 }}>₹{cartTotal.toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity onPress={handlePay} disabled={cartCount === 0} activeOpacity={0.8}
                        style={{ paddingHorizontal: 22, height: 46, borderRadius: 10, backgroundColor: cartCount === 0 ? '#1a2040' : C.sage, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: cartCount === 0 ? C.dim : '#06210f', letterSpacing: 2 }}>PAY ›</Text>
                    </TouchableOpacity>
                </View>
            )}

            {toast && (
                <View style={{ position: 'absolute', bottom: pantryOnly ? 24 : 88 + TAB_BAR_H, left: PAD, right: PAD, backgroundColor: C.panel, borderWidth: 1, borderRadius: 10, borderColor: toast.color + '60', padding: 12, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: toast.color }}>{toast.msg}</Text>
                </View>
            )}
        </View>
    );
}
