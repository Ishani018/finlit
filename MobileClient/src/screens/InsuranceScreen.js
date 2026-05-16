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
                        <View style={{ flex: 1, borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#0d1020', padding: 12, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 2, marginBottom: 2 }}>MONTHLY</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: canAfford ? meta.accent : '#f87171' }}>₹{premium.toLocaleString()}</Text>
                        </View>
                        {plan.payout && (
                            <View style={{ flex: 1, borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#0d1020', padding: 12, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 2, marginBottom: 2 }}>PAYOUT</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0' }}>₹{plan.payout.toLocaleString()}</Text>
                            </View>
                        )}
                        {plan.coverage && (
                            <View style={{ flex: 1, borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#0d1020', padding: 12, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 2, marginBottom: 2 }}>COVERS</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: meta.accent }}>{Math.round(coveragePct * 100)}%</Text>
                            </View>
                        )}
                    </View>

                    <View style={{ borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#070910', padding: 14, marginBottom: 20 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 2, marginBottom: 10 }}>PROTECTS AGAINST</Text>
                        {(plan.type === 'health' ? ['Hospital bills & surgeries', 'Medical emergencies', 'Accident injuries']
                            : plan.type === 'life' ? ['Critical life setbacks', 'Income loss for dependents', 'Family financial safety']
                            : ['Flood & water damage', 'Fire & earthquake damage', 'Structural repair costs']
                        ).map(item => (
                            <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                <View style={{ width: 5, height: 5, backgroundColor: meta.color }} />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#6070a0' }}>{item}</Text>
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
                        <TouchableOpacity onPress={() => { cancelInsurance(plan.id); setSelectedPlan(null); }} style={{ padding: 14, borderWidth: 1, borderColor: '#7f1d1d', backgroundColor: '#1a0808', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#f87171', letterSpacing: 2 }}>CANCEL COVERAGE</Text>
                        </TouchableOpacity>
                    ) : !canAfford ? (
                        <View style={{ padding: 14, borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#070910', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#2a3560', letterSpacing: 1 }}>INSUFFICIENT BALANCE</Text>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => { buyInsurance(plan.id); setSelectedPlan(null); }} style={{ padding: 14, borderWidth: 1, borderColor: meta.color, backgroundColor: meta.bg, alignItems: 'center', position: 'relative' }}>
                            <Corners color={meta.color} />
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
                <TouchableOpacity onPress={onClose} style={{ width: 34, height: 34, borderWidth: 1, borderColor: '#1e2840', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome5 name="times" size={14} color="#445070" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Status strip */}
                <View style={{ borderWidth: 1, borderColor: protectionScore === 0 ? '#7f1d1d' : protectionScore === maxScore ? '#166534' : '#1e3a5f', backgroundColor: protectionScore === 0 ? '#1a0808' : protectionScore === maxScore ? '#0d1e12' : '#0d1428', padding: 12, marginBottom: 16, position: 'relative' }}>
                    <Corners color={protectionScore === 0 ? '#ef4444' : protectionScore === maxScore ? '#22c55e' : '#3b82f6'} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3860', letterSpacing: 3 }}>PROTECTION STATUS</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            {protectionScore === 0 && <Image source={require('../../assets/ui_comp/warning.png')} style={{ width: 18, height: 18 }} resizeMode="contain" />}
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: protectionScore === 0 ? '#f87171' : protectionScore === maxScore ? '#4ade80' : '#60a5fa' }}>
                                {protectionScore === 0 ? 'EXPOSED' : protectionScore === maxScore ? 'FULLY COVERED ✓' : 'PARTIAL COVER'}
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6, marginBottom: protectionScore === 0 || totalPremium > 0 ? 8 : 0 }}>
                        {Array.from({ length: maxScore }).map((_, i) => (
                            <View key={i} style={{ flex: 1, height: 4, backgroundColor: i < protectionScore ? '#22c55e' : '#0d1020' }} />
                        ))}
                    </View>
                    {totalPremium > 0 && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>₹{totalPremium.toLocaleString()}/mo total premium</Text>}
                    {protectionScore === 0 && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#ef4444' }}>A single crisis could wipe your savings</Text>}
                </View>

                {/* Type rows */}
                {['health', 'life', 'property', 'family'].map(type => {
                    const meta = TYPE_META[type];
                    const plans = INSURANCE_PLANS.filter(p => p.type === type);
                    const activePlans = plans.filter(p => isActive(p.id));
                    const isExpanded = expandedType === type;

                    return (
                        <View key={type} style={{ marginBottom: 8 }}>
                            {/* Type row header */}
                            <TouchableOpacity
                                onPress={() => setExpandedType(isExpanded ? null : type)}
                                activeOpacity={0.85}
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: activePlans.length > 0 ? meta.color + '60' : '#1a2040', backgroundColor: activePlans.length > 0 ? meta.bg : '#0a0d1a', padding: 12 }}
                            >
                                {/* Icon */}
                                <View style={{ width: 48, height: 48, borderWidth: 1, borderColor: meta.color + '40', backgroundColor: '#06080f', alignItems: 'center', justifyContent: 'center' }}>
                                    <Image source={meta.img} style={{ width: 34, height: 34 }} resizeMode="contain" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: activePlans.length > 0 ? meta.accent : '#c8d4f0', lineHeight: 22 }}>{meta.label}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: activePlans.length > 0 ? meta.color : '#445070' }}>
                                        {activePlans.length > 0 ? `${activePlans.length} plan covered` : `${plans.length} plan${plans.length !== 1 ? 's' : ''} available`}
                                    </Text>
                                </View>
                                {activePlans.length > 0 && (
                                    <View style={{ borderWidth: 1, borderColor: meta.color + '60', paddingHorizontal: 8, paddingVertical: 3 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: meta.accent, letterSpacing: 1 }}>✓ ON</Text>
                                    </View>
                                )}
                                <FontAwesome5 name={isExpanded ? 'chevron-up' : 'chevron-down'} size={10} color="#2a3560" />
                            </TouchableOpacity>

                            {/* Expanded plan list */}
                            {isExpanded && plans.map(plan => {
                                const active = isActive(plan.id);
                                const premium = getPlanPremium(plan);
                                return (
                                    <TouchableOpacity
                                        key={plan.id}
                                        onPress={() => setSelectedPlan(plan)}
                                        style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderTopWidth: 0, borderColor: active ? meta.color + '50' : '#1a2040', backgroundColor: active ? meta.bg : '#070910', paddingVertical: 10, paddingHorizontal: 14, paddingLeft: 74, position: 'relative' }}
                                    >
                                        {active && <Corners color={meta.color} />}
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: active ? '#c8d4f0' : '#556080' }} numberOfLines={1}>{plan.name}</Text>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: active ? meta.accent : '#2a3560' }}>₹{premium.toLocaleString()}/mo</Text>
                                        </View>
                                        <FontAwesome5 name="chevron-right" size={10} color={active ? meta.color : '#2a3560'} />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}
