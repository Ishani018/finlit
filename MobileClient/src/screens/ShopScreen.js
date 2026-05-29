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

const ITEM_IMAGES = {
    dal_chawal:       require('../../assets/groceries/dal_chawal.png'),
    bread_eggs:       require('../../assets/groceries/bread_and_eggs.png'),
    instant_noodles:  require('../../assets/groceries/cup_noodles.png'),
    fresh_veggies:    require('../../assets/groceries/veggies.png'),
    fruits:           require('../../assets/groceries/fruits.png'),
    organic_meal_kit: require('../../assets/groceries/healthy_meal_box.png'),
    protein_pack:     require('../../assets/groceries/paneer_tofu.png'),
    snack_box:        require('../../assets/groceries/chips_snacks_box.png'),
    chai:             require('../../assets/groceries/chai.png'),
    milk:             require('../../assets/groceries/milk.png'),
    paratha:          require('../../assets/groceries/paratha.png'),
    rajma_rice:       require('../../assets/groceries/rajma_rice.png'),
    thaali:           require('../../assets/groceries/thaali.png'),
    smoothie:         require('../../assets/groceries/smoothis.png'),
    mithai_box:       require('../../assets/groceries/mithai_box.png'),
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


const MEDICINE_IMAGES = {
    paracetamol:  require('../../assets/medicine/paracetemol.png'),
    cough_syrup:  require('../../assets/medicine/cough_syrup.png'),
    antacid:      require('../../assets/medicine/antacid.png'),
    vitamin_c:    require('../../assets/medicine/ChatGPT_Image_May_16,_2026,_05_22_51_PM.png'),
    multivitamin: require('../../assets/medicine/mulivitamins.png'),
    first_aid:    require('../../assets/medicine/first_aid.png'),
    antibiotics:  require('../../assets/medicine/antibiotic.png'),
    bp_medicine:  require('../../assets/medicine/blood_pressure.png'),
    ayurvedic:    require('../../assets/medicine/chyawanprash.png'),
    calcium:      require('../../assets/medicine/ChatGPT_Image_May_16,_2026,_05_34_49_PM.png'),
};

const CLOTHES_IMAGES = {
    school_bag:     require('../../assets/clothing_and_others/schoolbag.png'),
    school_uniform: require('../../assets/clothing_and_others/school_uniform.png'),
    kids_books:     require('../../assets/clothing_and_others/storybooks.png'),
    sports_kit:     require('../../assets/clothing_and_others/sports_kit.png'),
    video_game:     require('../../assets/clothing_and_others/video_game.png'),
    casual_wear:    require('../../assets/clothing_and_others/daily_casual_wear.png'),
    ethnic_set:     require('../../assets/clothing_and_others/ethnic_wear.png'),
    formal_suit:    require('../../assets/clothing_and_others/suit.png'),
    party_outfit:   require('../../assets/clothing_and_others/fancy_party_wear.png'),
    sneakers:       require('../../assets/clothing_and_others/shoes.png'),
    jewellery:      require('../../assets/clothing_and_others/jewellery.png'),
};

// ── Pharmacy section ──────────────────────────────────────────────────────────
function PharmacySection({ onBack, onClose }) {
    const { balance, dependents, buyPharmacyItem } = useGame();
    const [toast, setToast] = useState(null);
    const [pickingFor, setPickingFor] = useState(null);
    const showToast = (msg, ok) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2200); };

    const liveDeps = dependents.filter(d => (d.type === 'child' || d.type === 'parent' || d.type === 'spouse') && !d.isDead);
    const members = [{ id: 'self', name: 'Yourself' }, ...liveDeps];

    const handleBuy = (item) => {
        if (balance < item.price) { showToast('Not enough balance', false); return; }
        setPickingFor(item);
    };

    return (
        <View style={{ flex: 1 }}>
            <ScreenHeader title="Pharmacy" subtitle="HEALTH & MEDICINE" onBack={onBack} onClose={onClose} />
            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 50 }}>
                {Array.from({ length: Math.ceil(PHARMACY_ITEMS.length / 2) }).map((_, row) => (
                    <View key={row} style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
                        {PHARMACY_ITEMS.slice(row * 2, row * 2 + 2).map(item => {
                            const affordable = balance >= item.price;
                            const img = MEDICINE_IMAGES[item.id];
                            return (
                                <View key={item.id} style={{ flex: 1, borderRadius: 10, backgroundColor: C.panel, overflow: 'hidden' }}>
                                    <View style={{ height: 160, position: 'relative' }}>
                                        {img ? <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <View style={{ flex: 1, backgroundColor: C.sage + '15' }} />}
                                    </View>
                                    <View style={{ padding: 10 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.cream, marginBottom: 2 }} numberOfLines={1}>{item.name}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.sage, marginBottom: 8 }}>+{item.healthRestore} HP</Text>
                                        <TouchableOpacity onPress={() => handleBuy(item)} disabled={!affordable}
                                            style={{ backgroundColor: affordable ? '#0a1a10' : C.card, borderRadius: 8, paddingVertical: 9, alignItems: 'center', opacity: affordable ? 1 : 0.4 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: affordable ? C.sage : C.dark }}>₹{item.price.toLocaleString()}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ))}
            </ScrollView>

            {pickingFor && (
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.95)', zIndex: 50, justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: C.panel, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: PAD, paddingBottom: 32 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.cream, marginBottom: 4 }}>Who gets {pickingFor.name}?</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, marginBottom: 16 }}>₹{pickingFor.price.toLocaleString()} · +{pickingFor.healthRestore} HP</Text>
                        {members.map(m => (
                            <TouchableOpacity key={m.id} onPress={() => {
                                const r = buyPharmacyItem(pickingFor, m.id);
                                showToast(r.success ? `+${pickingFor.healthRestore} HP for ${m.name}` : r.msg, r.success);
                                setPickingFor(null);
                            }}
                                style={{ borderRadius: 10, backgroundColor: '#0a1a10', padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream }}>{m.name}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.sage }}>+{pickingFor.healthRestore} HP ›</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity onPress={() => setPickingFor(null)} style={{ borderRadius: 10, backgroundColor: '#0a0d1a', padding: 14, alignItems: 'center', marginTop: 4 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.dim }}>CANCEL</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {toast && (
                <View style={{ position: 'absolute', bottom: 70, left: PAD, right: PAD, backgroundColor: 'rgba(8,12,24,0.94)', borderRadius: 10, padding: 12, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: toast.ok ? C.sage : C.red }}>{toast.msg}</Text>
                </View>
            )}
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
                            const affordable = balance >= item.price;
                            const img = CLOTHES_IMAGES[item.id];
                            return (
                                <View key={item.id} style={{ flex: 1, backgroundColor: C.panel, overflow: 'hidden', borderRadius: 10 }}>
                                    <View style={{ width: '100%', aspectRatio: 1, backgroundColor: C.card }}>
                                        {img ? <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                            : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={require('../../assets/ui_comp/clothing.png')} style={{ width: 60, height: 60 }} resizeMode="contain" />
                                              </View>}
                                    </View>
                                    <View style={{ padding: 10 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.cream, lineHeight: 19, marginBottom: 2 }}>{item.name}</Text>
                                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                                            {item.happinessBoost > 0 && (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <Image source={require('../../assets/ui_comp/happyicon.png')} style={{ width: 18, height: 18 }} resizeMode="contain" />
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.gold }}>+{item.happinessBoost}</Text>
                                                </View>
                                            )}
                                            {item.healthBoost > 0 && (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <Image source={require('../../assets/ui_comp/healthicon.png')} style={{ width: 18, height: 18 }} resizeMode="contain" />
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.sage }}>+{item.healthBoost}</Text>
                                                </View>
                                            )}
                                        </View>
                                        <TouchableOpacity onPress={() => {
                                            const r = buyClothesItem(item);
                                            showToast(r.success ? `${item.name} bought!` : r.msg, r.success);
                                        }} disabled={!affordable}
                                            style={{ backgroundColor: affordable ? '#0d1428' : C.card, borderRadius: 8, paddingVertical: 9, alignItems: 'center', opacity: affordable ? 1 : 0.4 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: affordable ? C.cream : C.dark }}>₹{item.price.toLocaleString()}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ))}
            </ScrollView>
            {toast && (
                <View style={{ position: 'absolute', bottom: 70, left: PAD, right: PAD, backgroundColor: 'rgba(8,12,24,0.94)', borderRadius: 10, padding: 12, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: toast.ok ? C.cream : C.red }}>{toast.msg}</Text>
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
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: PAD, paddingVertical: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Image source={require('../../assets/ui_comp/investicon.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.gold }}>₹{balance >= 100000 ? (balance/100000).toFixed(1)+'L' : balance.toLocaleString()}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 16 }}>
                    <Image source={require('../../assets/ui_comp/healthicon.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: health >= 60 ? C.sage : health >= 30 ? C.gold : C.red }}>{Math.round(health)}</Text>
                </View>
            </View>
            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 50 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP, justifyContent: 'space-between' }}>
                    {[
                        { key: 'grocery',  label: 'Grocery Store',  sub: 'FOOD & PANTRY',     img: require('../../assets/ui_comp/food_grocery.png'), color: C.gold },
                        { key: 'pharmacy', label: 'Pharmacy',        sub: 'HEALTH & MEDICINE', img: require('../../assets/ui_comp/pharmacy.png'),     color: C.sage },
                        { key: 'clothes',  label: 'Clothes & Toys', sub: 'SHOPPING',          img: require('../../assets/ui_comp/clothing.png'),     color: C.pink },
                    ].map(cat => (
                        <TouchableOpacity key={cat.key} onPress={() => setSection(cat.key)} activeOpacity={0.85}
                            style={{ width: '48%', aspectRatio: 1, borderRadius: 12, backgroundColor: C.panel, marginBottom: GAP, alignItems: 'center', justifyContent: 'center', padding: 12, overflow: 'hidden' }}>
                            <Image source={cat.img} style={{ width: 110, height: 110, marginBottom: 10 }} resizeMode="contain" />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream, textAlign: 'center', lineHeight: 22 }}>{cat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
