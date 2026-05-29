import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { GROCERY_ITEMS, CATEGORY_COLORS } from '../data/groceries';
import { PHARMACY_ITEMS, CLOTHES_ITEMS, SHOP_CATEGORY_COLORS } from '../data/shopItems';

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

const KIRANA_IMG   = require('../../assets/ui_comp/food_grocery.png');
const PHARMACY_IMG = require('../../assets/ui_comp/pharmacy.png');
const CLOTHES_IMG  = require('../../assets/ui_comp/clothing.png');

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

// ── Landing category card ─────────────────────────────────────────────────────
function SquareCategoryCard({ title, color, icon, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}
            style={{ width: '48%', aspectRatio: 1, borderRadius: 12, backgroundColor: C.panel, marginBottom: GAP, alignItems: 'center', justifyContent: 'center', padding: 12, overflow: 'hidden' }}>
            <Image source={icon} style={{ width: 110, height: 110, marginBottom: 10 }} resizeMode="contain" />
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream, textAlign: 'center', lineHeight: 22 }}>{title}</Text>
        </TouchableOpacity>
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

const MEDICINE_IMAGES = {
    paracetamol:  require('../../assets/medicine/paracetemol.png'),
    cough_syrup:  require('../../assets/medicine/cough syrup.png'),
    antacid:      require('../../assets/medicine/antacid.png'),
    vitamin_c:    require('../../assets/medicine/ChatGPT Image May 16, 2026, 05_22_51 PM.png'),
    multivitamin: require('../../assets/medicine/mulivitamins.png'),
    first_aid:    require('../../assets/medicine/first aid.png'),
    antibiotics:  require('../../assets/medicine/antibiotic.png'),
    bp_medicine:  require('../../assets/medicine/blood pressure.png'),
    ayurvedic:    require('../../assets/medicine/chyawanprash.png'),
    calcium:      require('../../assets/medicine/ChatGPT Image May 16, 2026, 05_34_49 PM.png'),
};

const CLOTHES_IMAGES = {
    school_bag:     require('../../assets/clothing and others/schoolbag.png'),
    school_uniform: require('../../assets/clothing and others/school uniform.png'),
    kids_books:     require('../../assets/clothing and others/storybooks.png'),
    sports_kit:     require('../../assets/clothing and others/sports kit.png'),
    video_game:     require('../../assets/clothing and others/video game.png'),
    casual_wear:    require('../../assets/clothing and others/daily casual wear.png'),
    ethnic_set:     require('../../assets/clothing and others/ethnic wear.png'),
    formal_suit:    require('../../assets/clothing and others/suit.png'),
    party_outfit:   require('../../assets/clothing and others/fancy party wear.png'),
    sneakers:       require('../../assets/clothing and others/shoes.png'),
    jewellery:      require('../../assets/clothing and others/jewellery.png'),
};

// ── Pharmacy section ──────────────────────────────────────────────────────────
function PharmacySection({ onBack, onClose }) {
    const { balance, dependents, buyPharmacyItem } = useGame();
    const [toast, setToast] = useState(null);
    const [pickingFor, setPickingFor] = useState(null); // item being assigned

    const showToast = (msg, ok) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2200); };

    const canAfford = (item) => balance >= item.price;

    const handleBuy = (item) => {
        if (!canAfford(item)) { showToast('Not enough balance', false); return; }
        // Only ask "who gets it?" if there are dependents — otherwise buy for self immediately
        if (dependents.length === 0) {
            const r = buyPharmacyItem(item, 'self');
            showToast(r.success ? `${item.name} — +${item.healthRestore} HP` : r.msg, r.success);
        } else {
            setPickingFor(item);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ScreenHeader title="Pharmacy" subtitle="HEALTH & MEDICINE" onBack={onBack} onClose={onClose} />
            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 50 }}>
                {Array.from({ length: Math.ceil(PHARMACY_ITEMS.length / 2) }).map((_, row) => (
                    <View key={row} style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
                        {PHARMACY_ITEMS.slice(row * 2, row * 2 + 2).map(item => {
                            const affordable = canAfford(item);
                            const img = MEDICINE_IMAGES[item.id];
                            return (
                                <View key={item.id} style={{ flex: 1, borderRadius: 10, backgroundColor: C.panel, overflow: 'hidden' }}>
                                    <View style={{ height: 180, position: 'relative' }}>
                                        {img ? <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <View style={{ flex: 1, backgroundColor: C.sage + '15' }} />}
                                        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,8,15,0.15)' }} />
                                    </View>
                                    <View style={{ padding: 8 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.cream }} numberOfLines={1}>{item.name}</Text>
                                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.sage }}>+{item.healthRestore}HP</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleBuy(item)} disabled={!affordable}
                                            style={{ marginTop: 6, backgroundColor: affordable ? C.sage + '18' : C.card, borderRadius: 6, paddingVertical: 7, alignItems: 'center', opacity: affordable ? 1 : 0.4 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: affordable ? C.sage : C.dark }}>₹{item.price.toLocaleString()}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ))}
            </ScrollView>

            {/* Who to give medicine to */}
            {pickingFor && (
                <RecipientPicker
                    item={pickingFor}
                    dependents={dependents}
                    balance={balance}
                    buyPharmacyItem={buyPharmacyItem}
                    onPick={() => {
                        showToast(`${pickingFor.name} given — +${pickingFor.healthRestore} HP`, true);
                        setPickingFor(null);
                    }}
                    onClose={() => setPickingFor(null)}
                />
            )}

            {toast && (
                <View style={{ position: 'absolute', bottom: 60, left: PAD, right: PAD, backgroundColor: toast.ok ? '#166534' : '#7f1d1d', padding: 12, borderWidth: 1, borderColor: toast.ok ? '#4ade80' : '#f87171' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: toast.ok ? '#4ade80' : '#f87171', textAlign: 'center' }}>{toast.msg}</Text>
                </View>
            )}
        </View>
    );
}

// ── Recipient picker for pharmacy ─────────────────────────────────────────────
function RecipientPicker({ item, dependents, balance, buyPharmacyItem, onPick, onClose }) {
    const members = [
        { id: 'self', name: 'Yourself', type: 'self' },
        ...dependents.filter(d => (d.type === 'child' || d.type === 'parent' || d.type === 'spouse') && !d.isDead),
    ];

    const handlePick = (member) => {
        const r = buyPharmacyItem(item, member.id);
        if (!r.success) { onClose(); return; }
        onPick(member.id);
    };

    return (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.95)', zIndex: 50, justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: C.panel, borderTopWidth: 1, borderColor: C.border, padding: PAD }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream, marginBottom: 4 }}>Who gets the {item.name}?</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim, marginBottom: 14 }}>₹{item.price} · +{item.healthRestore} HP</Text>
                {members.map(m => (
                    <TouchableOpacity key={m.id} onPress={() => handlePick(m)}
                        style={{ borderRadius: 10, backgroundColor: '#0a1a10', padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream }}>{m.name}</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.sage }}>+{item.healthRestore} HP ›</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={onClose} style={{ borderRadius: 10, backgroundColor: '#0a0d1a', padding: 14, alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.dim }}>CANCEL</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ── Clothes & Toys section ────────────────────────────────────────────────────
function ClothesSection({ onBack, onClose }) {
    const { balance, buyClothesItem } = useGame();
    const [tab, setTab] = useState('KIDS');
    const [toast, setToast] = useState(null);

    const showToast = (msg, ok) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2200); };

    const filtered = CLOTHES_ITEMS.filter(i => i.tag === tab);

    const handleBuy = (item) => {
        const r = buyClothesItem(item);
        if (r.success) {
            showToast(`${item.name} bought  •  +${item.happinessBoost} 😊${item.healthBoost > 0 ? `  +${item.healthBoost} HP` : ''}`, true, `Balance: ₹${(balance - item.price).toLocaleString()}`);
        } else {
            showToast(r.msg, false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ScreenHeader title="Clothes & Toys" subtitle="SHOPPING" onBack={onBack} onClose={onClose} />
            <View style={{ flexDirection: 'row', gap: GAP, padding: PAD, paddingBottom: 0 }}>
                {[
                    { key: 'KIDS', label: "Kids' Section", sub: 'TOYS & UNIFORMS', color: SHOP_CATEGORY_COLORS.KIDS },
                    { key: 'ADULT', label: 'Adults', sub: 'FASHION & WEAR', color: SHOP_CATEGORY_COLORS.ADULT },
                ].map(cat => {
                    const active = tab === cat.key;
                    return (
                        <TouchableOpacity key={cat.key} onPress={() => setTab(cat.key)} activeOpacity={0.8}
                            style={{ flex: 1, borderRadius: 10, backgroundColor: active ? cat.color + '18' : C.panel, padding: 14 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: active ? cat.color : C.dim, letterSpacing: 3, marginBottom: 2 }}>{cat.sub}</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: active ? cat.color : C.dim, lineHeight: 24 }}>{cat.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 50 }}>
                {Array.from({ length: Math.ceil(filtered.length / 2) }).map((_, row) => (
                    <View key={row} style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
                        {filtered.slice(row * 2, row * 2 + 2).map(item => {
                            const color = SHOP_CATEGORY_COLORS[item.tag];
                            const affordable = balance >= item.price;
                            const img = CLOTHES_IMAGES[item.id];
                            return (
                                <View key={item.id} style={{ flex: 1, backgroundColor: C.panel, overflow: 'hidden', borderRadius: 8 }}>
                                    <View style={{ width: '100%', aspectRatio: 1, backgroundColor: C.card, position: 'relative' }}>
                                        {img ? (
                                            <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                        ) : (
                                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={require('../../assets/ui_comp/clothing.png')} style={{ width: 60, height: 60 }} resizeMode="contain" />
                                            </View>
                                        )}
                                    </View>
                                    <View style={{ padding: 10 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.cream, lineHeight: 19 }}>{item.name}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dim, marginTop: 2, marginBottom: 6 }}>{item.desc}</Text>
                                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                                            {item.happinessBoost > 0 && (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <Image source={require('../../assets/ui_comp/happyicon.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.gold }}>+{item.happinessBoost}</Text>
                                                </View>
                                            )}
                                            {item.healthBoost > 0 && (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <Image source={require('../../assets/ui_comp/healthicon.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.sage }}>+{item.healthBoost}</Text>
                                                </View>
                                            )}
                                        </View>
                                        <TouchableOpacity onPress={() => handleBuy(item)} disabled={!affordable}
                                            style={{ backgroundColor: affordable ? '#0a1428' : C.card, borderRadius: 8, paddingVertical: 9, alignItems: 'center', opacity: affordable ? 1 : 0.4 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: affordable ? '#c8d4f0' : C.dark }}>₹{item.price.toLocaleString()}</Text>
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

// ── Main ShopScreen ───────────────────────────────────────────────────────────
export default function ShopScreen({ onClose }) {
    const [section, setSection] = useState(null);
    const { balance, health, happiness } = useGame();

    if (section === 'grocery')  return <GrocerySection  onBack={() => setSection(null)} onClose={onClose} />;
    if (section === 'pharmacy') return <PharmacySection onBack={() => setSection(null)} onClose={onClose} />;
    if (section === 'clothes')  return <ClothesSection  onBack={() => setSection(null)} onClose={onClose} />;

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <ScreenHeader title="Shop" subtitle="MARKETPLACE" onClose={onClose} />

            {/* Inline stats — no boxes */}
            <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: PAD, paddingVertical: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Image source={require('../../assets/ui_comp/investicon.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.gold }}>₹{balance >= 100000 ? (balance/100000).toFixed(1)+'L' : balance.toLocaleString()}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Image source={require('../../assets/ui_comp/healthicon.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: health >= 60 ? C.sage : health >= 30 ? C.gold : C.red }}>{Math.round(health)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Image source={require('../../assets/ui_comp/happyicon.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: happiness >= 70 ? C.sage : happiness >= 40 ? C.gold : C.red }}>{Math.round(happiness)}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 50 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP, justifyContent: 'space-between' }}>
                    <SquareCategoryCard
                        title="Grocery Store"
                        color={C.gold}
                        icon={KIRANA_IMG}
                        onPress={() => setSection('grocery')}
                    />
                    <SquareCategoryCard
                        title="Pharmacy"
                        color={C.sage}
                        icon={PHARMACY_IMG}
                        onPress={() => setSection('pharmacy')}
                    />
                    <SquareCategoryCard
                        title="Clothes & Toys"
                        color={C.pink}
                        icon={CLOTHES_IMG}
                        onPress={() => setSection('clothes')}
                    />
                </View>
            </ScrollView>
        </View>
    );
}
