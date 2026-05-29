import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useGame } from '../context/GameContext';
import { INSURANCE_PLANS } from '../data/insurance';
import { FontAwesome5 } from '@expo/vector-icons';

const Corners = ({ color }) => (
    <>
        <View style={{ position: 'absolute', top: 0, left: 0, width: 5, height: 5, backgroundColor: color }} />
        <View style={{ position: 'absolute', top: 0, right: 0, width: 5, height: 5, backgroundColor: color }} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, width: 5, height: 5, backgroundColor: color }} />
        <View style={{ position: 'absolute', bottom: 0, right: 0, width: 5, height: 5, backgroundColor: color }} />
    </>
);

const TYPE_META = {
    health:   { label: 'HEALTH',   color: '#22c55e', accent: '#4ade80', bg: '#0d1e12', img: require('../../assets/ui_comp/healthinsurance.png') },
    life:     { label: 'LIFE',     color: '#3b82f6', accent: '#60a5fa', bg: '#0d1428', img: require('../../assets/ui_comp/lifeinsurance.png') },
    property: { label: 'PROPERTY', color: '#f59e0b', accent: '#fbbf24', bg: '#1a1208', img: require('../../assets/ui_comp/homeinsurance.png') },
    family:   { label: 'FAMILY',   color: '#ec4899', accent: '#f9a8d4', bg: '#1a0814', img: require('../../assets/ui_comp/familyicon.png') },
};

const CoverageBar = ({ value, color }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1, height: 6, backgroundColor: '#070910' }}>
            <View style={{ height: '100%', width: `${value * 100}%`, backgroundColor: color }} />
        </View>
        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color, width: 38, textAlign: 'right' }}>{Math.round(value * 100)}%</Text>
    </View>
);

export default function InsuranceScreen({ onClose }) {
    const { activeInsurance, buyInsurance, cancelInsurance, properties, balance, getInsurancePremiums } = useGame();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [expandedType, setExpandedType] = useState(null);

    const totalPremium = getInsurancePremiums ? getInsurancePremiums() : activeInsurance.reduce((s, ins) => {
        const plan = INSURANCE_PLANS.find(p => p.id === ins.planId);
        if (!plan) return s;
        return s + (plan.premium || 0);
    }, 0);

    const isActive = (planId) => activeInsurance.some(i => i.planId === planId);

    const getPlanPremium = (plan) => {
        if (plan.premium) return plan.premium;
        if (!plan.premium_rate || properties.length === 0) return 0;
        return Math.round(properties.length * 5000000 * plan.premium_rate / 12);
    };

    // ── Plan detail ──────────────────────────────────────────────────────────
    if (selectedPlan) {
        const plan = selectedPlan;
        const meta = TYPE_META[plan.type] || TYPE_META.health;
        const active = isActive(plan.id);
        const premium = getPlanPremium(plan);
        const canAfford = balance >= premium;
        const coveragePct = plan.coverage || 1;

        return (
            <View style={{ flex: 1, backgroundColor: '#06080f' }}>
                {/* Hero */}
                <View style={{ backgroundColor: meta.bg, borderBottomWidth: 1, borderColor: meta.color + '30', padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, position: 'relative' }}>
                    <View style={{ width: 64, height: 64, backgroundColor: '#06080f', borderWidth: 1, borderColor: meta.color + '40', alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={meta.img} style={{ width: 44, height: 44 }} resizeMode="contain" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: meta.color, letterSpacing: 4, marginBottom: 2 }}>{meta.label} INSURANCE</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0', lineHeight: 24 }}>{plan.name}</Text>
                        {active && (
                            <View style={{ marginTop: 4, alignSelf: 'flex-start', backgroundColor: meta.color + '20', borderWidth: 1, borderColor: meta.color, paddingHorizontal: 10, paddingVertical: 2 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: meta.accent, letterSpacing: 2 }}>✓ ACTIVE</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity onPress={() => setSelectedPlan(null)} style={{ width: 32, height: 32, backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: '#1e2840', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome5 name="chevron-left" size={13} color="#6070a0" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#556080', lineHeight: 22, marginBottom: 16 }}>{plan.description}</Text>

                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                        <View style={{ flex: 1, borderRadius: 10, backgroundColor: '#0d1020', padding: 14, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 2, marginBottom: 4 }}>MONTHLY</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: canAfford ? meta.accent : '#f87171' }}>₹{premium.toLocaleString()}</Text>
                        </View>
                        {plan.payout && (
                            <View style={{ flex: 1, borderRadius: 10, backgroundColor: '#0d1020', padding: 14, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 2, marginBottom: 4 }}>PAYOUT</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#c8d4f0' }}>₹{plan.payout.toLocaleString()}</Text>
                            </View>
                        )}
                        {plan.coverage && (
                            <View style={{ flex: 1, borderRadius: 10, backgroundColor: '#0d1020', padding: 14, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 2, marginBottom: 4 }}>COVERS</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: meta.accent }}>{Math.round(coveragePct * 100)}%</Text>
                            </View>
                        )}
                    </View>

                    <View style={{ backgroundColor: '#070910', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 2, marginBottom: 12 }}>PROTECTS AGAINST</Text>
                        {(plan.type === 'health' ? ['Hospital bills & surgeries', 'Medical emergencies', 'Accident injuries']
                            : plan.type === 'life' ? ['Critical life setbacks', 'Income loss for dependents', 'Family financial safety']
                            : ['Flood & water damage', 'Fire & earthquake damage', 'Structural repair costs']
                        ).map((item, i) => (
                            <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: i === 0 ? 0 : 1, borderColor: '#0f1525' }}>
                                <Image source={meta.img} style={{ width: 18, height: 18, opacity: 0.6 }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#6070a0' }}>{item}</Text>
                            </View>
                        ))}
                        {plan.type === 'property' && properties.length === 0 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                                <Image source={require('../../assets/ui_comp/warning.png')} style={{ width: 14, height: 14 }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#f87171' }}>You own no properties yet</Text>
                            </View>
                        )}
                    </View>

                    {active ? (
                        <TouchableOpacity onPress={() => { cancelInsurance(plan.id); setSelectedPlan(null); }} style={{ padding: 16, borderRadius: 10, backgroundColor: '#1a0808', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#f87171', letterSpacing: 2 }}>CANCEL COVERAGE</Text>
                        </TouchableOpacity>
                    ) : !canAfford ? (
                        <View style={{ padding: 16, borderRadius: 10, backgroundColor: '#070910', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#2a3560', letterSpacing: 1 }}>INSUFFICIENT BALANCE</Text>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => { buyInsurance(plan.id); setSelectedPlan(null); }} style={{ padding: 16, borderRadius: 10, backgroundColor: meta.bg, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: meta.accent, letterSpacing: 2 }}>GET COVERED — ₹{premium.toLocaleString()}/mo</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>
        );
    }

    // ── Main list ────────────────────────────────────────────────────────────
    const protectionScore = activeInsurance.length;
    const maxScore = 4;

    return (
        <View style={{ flex: 1, backgroundColor: '#06080f' }}>
            <View style={{ backgroundColor: '#0d1020', paddingTop: 14, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#1a2040', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 4 }}>PROTECTION</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0' }}>Insurance</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#0a0d1a', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome5 name="times" size={14} color="#445070" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Status strip */}
                <View style={{ backgroundColor: protectionScore === 0 ? '#1a0808' : protectionScore === maxScore ? '#0d1e12' : '#0d1428', padding: 14, marginBottom: 18, borderRadius: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            {protectionScore === 0 && <Image source={require('../../assets/ui_comp/warning.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />}
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#4a5580', letterSpacing: 3 }}>PROTECTION STATUS</Text>
                        </View>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: protectionScore === 0 ? '#f87171' : protectionScore === maxScore ? '#4ade80' : '#60a5fa' }}>
                            {protectionScore === 0 ? 'EXPOSED' : protectionScore === maxScore ? 'FULLY COVERED' : 'PARTIAL COVER'}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 4, marginBottom: 8 }}>
                        {Array.from({ length: maxScore }).map((_, i) => (
                            <View key={i} style={{ flex: 1, height: 3, backgroundColor: i < protectionScore ? '#22c55e' : '#1a2040', borderRadius: 2 }} />
                        ))}
                    </View>
                    {totalPremium > 0 && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070' }}>₹{totalPremium.toLocaleString()}/mo total</Text>}
                    {protectionScore === 0 && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#ef444499' }}>A single crisis could wipe your savings</Text>}
                </View>

                {/* Type grid — 2×2 square cards */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {['health', 'life', 'property', 'family'].map(type => {
                    const meta = TYPE_META[type];
                    const plans = INSURANCE_PLANS.filter(p => p.type === type);
                    const activePlans = plans.filter(p => isActive(p.id));
                    const isExpanded = expandedType === type;

                    return (
                        <View key={type} style={{ width: '47%' }}>
                            {/* Square card */}
                            <TouchableOpacity
                                onPress={() => setExpandedType(isExpanded ? null : type)}
                                activeOpacity={0.85}
                                style={{ backgroundColor: activePlans.length > 0 ? meta.bg : '#0a0d1a', borderRadius: 10, padding: 14, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}
                            >
                                <Image source={meta.img} style={{ width: 44, height: 44 }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: activePlans.length > 0 ? meta.accent : '#c8d4f0', lineHeight: 20 }}>{meta.label}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: activePlans.length > 0 ? meta.color : '#445070', textAlign: 'center' }}>
                                    {activePlans.length > 0 ? 'COVERED' : `${plans.length} plan${plans.length !== 1 ? 's' : ''}`}
                                </Text>
                            </TouchableOpacity>

                            {/* Expanded plan list below card */}
                            {isExpanded && (
                                <View style={{ marginTop: 6, gap: 4 }}>
                                {plans.map(plan => {
                                    const active = isActive(plan.id);
                                    const premium = getPlanPremium(plan);
                                    return (
                                        <TouchableOpacity
                                            key={plan.id}
                                            onPress={() => setSelectedPlan(plan)}
                                            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: active ? meta.bg : '#070910', borderRadius: 6, paddingVertical: 8, paddingHorizontal: 10 }}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: active ? '#c8d4f0' : '#556080' }} numberOfLines={1}>{plan.name}</Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: active ? meta.accent : '#4a5580' }}>₹{premium.toLocaleString()}/mo</Text>
                                            </View>
                                            <Image source={require('../../assets/ui_comp/play button.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                                        </TouchableOpacity>
                                    );
                                })}
                                </View>
                            )}
                        </View>
                    );
                })}
                </View>
            </ScrollView>
        </View>
    );
}
