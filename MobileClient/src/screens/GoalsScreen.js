import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useGame } from '../context/GameContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { ACHIEVEMENTS } from '../data/achievements';
import { ACHIEVEMENT_IMAGES, GOAL_IMAGES } from '../data/achievementImages';

const PAD = 14;
const GAP = 8;

const Corners = ({ color }) => (
    <>
        {[
            { top: 0, left: 0, borderTopWidth: 1, borderLeftWidth: 1 },
            { top: 0, right: 0, borderTopWidth: 1, borderRightWidth: 1 },
            { bottom: 0, left: 0, borderBottomWidth: 1, borderLeftWidth: 1 },
            { bottom: 0, right: 0, borderBottomWidth: 1, borderRightWidth: 1 },
        ].map((s, i) => (
            <View key={i} style={[{ position: 'absolute', width: 8, height: 8, borderColor: color + '90', zIndex: 2 }, s]} />
        ))}
    </>
);

const LIFE_GOALS = [
    {
        id: 'goal_first_home',
        name: 'First Home',
        desc: 'Own a residential property',
        check: (s) => (s.properties?.length || 0) >= 1,
        progress: (s) => Math.min((s.properties?.length || 0), 1),
        progressLabel: (s) => (s.properties?.length || 0) >= 1 ? 'Complete!' : '0 / 1 property',
        color: '#f97316',
    },
    {
        id: 'goal_10l',
        name: '₹10 Lakh',
        desc: 'Build ₹10L net worth',
        check: (s) => s.netWorth >= 1000000,
        progress: (s) => Math.min(s.netWorth / 1000000, 1),
        progressLabel: (s) => `₹${Math.min(s.netWorth, 1000000).toLocaleString()} / ₹10L`,
        color: '#fbbf24',
    },
    {
        id: 'goal_1cr',
        name: 'Crorepati',
        desc: 'Reach ₹1 Crore net worth',
        check: (s) => s.netWorth >= 10000000,
        progress: (s) => Math.min(s.netWorth / 10000000, 1),
        progressLabel: (s) => `₹${(Math.min(s.netWorth, 10000000) / 100000).toFixed(0)}L / ₹1Cr`,
        color: '#a78bfa',
    },
    {
        id: 'goal_debt_free',
        name: 'Debt Free',
        desc: 'Clear all outstanding loans',
        check: (s) => (s.loans?.length || 0) === 0 && s.totalMonthsPlayed > 12,
        progress: (s) => (s.loans?.length || 0) === 0 ? 1 : 0,
        progressLabel: (s) => (s.loans?.length || 0) === 0 ? 'Complete!' : `${s.loans?.length || 0} loans remaining`,
        color: '#4ade80',
    },
    {
        id: 'goal_family',
        name: 'Start a Family',
        desc: 'Married + 1 child',
        check: (s) => s.dependents?.some(d => d.type === 'spouse') && s.dependents?.some(d => d.type === 'child'),
        progress: (s) => {
            let p = 0;
            if (s.dependents?.some(d => d.type === 'spouse')) p += 0.5;
            if (s.dependents?.some(d => d.type === 'child')) p += 0.5;
            return p;
        },
        progressLabel: (s) => {
            const hasSpouse = s.dependents?.some(d => d.type === 'spouse');
            const hasChild  = s.dependents?.some(d => d.type === 'child');
            if (hasSpouse && hasChild) return 'Complete!';
            if (hasSpouse) return 'Married — need a child';
            return 'Not yet married';
        },
        color: '#ec4899',
    },
    {
        id: 'goal_retire',
        name: 'Retire Early',
        desc: '₹50L retirement corpus',
        check: (s) => (s.ppf?.balance || 0) + (s.nps?.balance || 0) >= 5000000,
        progress: (s) => Math.min(((s.ppf?.balance || 0) + (s.nps?.balance || 0)) / 5000000, 1),
        progressLabel: (s) => `₹${((s.ppf?.balance || 0) + (s.nps?.balance || 0)).toLocaleString()} / ₹50L`,
        color: '#f59e0b',
    },
    {
        id: 'goal_3_props',
        name: 'Property Empire',
        desc: 'Own 3+ properties',
        check: (s) => (s.properties?.length || 0) >= 3,
        progress: (s) => Math.min((s.properties?.length || 0) / 3, 1),
        progressLabel: (s) => `${s.properties?.length || 0} / 3 properties`,
        color: '#fb923c',
    },
    {
        id: 'goal_education',
        name: 'Educated Kids',
        desc: 'All children educated',
        check: (s) => {
            const ch = (s.dependents || []).filter(d => d.type === 'child');
            return ch.length > 0 && ch.every(c => c.educated);
        },
        progress: (s) => {
            const ch = (s.dependents || []).filter(d => d.type === 'child');
            if (ch.length === 0) return 0;
            return ch.filter(c => c.educated).length / ch.length;
        },
        progressLabel: (s) => {
            const ch = (s.dependents || []).filter(d => d.type === 'child');
            if (ch.length === 0) return 'No children yet';
            return `${ch.filter(c => c.educated).length} / ${ch.length} educated`;
        },
        color: '#818cf8',
    },
];

// ── Unified long card (goals + achievements) ─────────────────────────────────
function UnifiedCard({ item, state, unlocked }) {
    const isGoal = item.type === 'goal';

    const done          = isGoal ? item.check(state) : unlocked;
    const pct           = isGoal ? item.progress(state) : (unlocked ? 1 : 0);
    const label         = isGoal ? item.progressLabel(state) : (unlocked ? 'Unlocked!' : 'Not yet unlocked');
    const img           = isGoal ? (GOAL_IMAGES[item.id] || null) : (ACHIEVEMENT_IMAGES[item.id] || null);
    const { color, name, desc } = item;

    return (
        <View style={{ borderWidth: 1, borderColor: done ? color + '70' : '#1e2840', backgroundColor: '#070a16', overflow: 'hidden', position: 'relative', flexDirection: 'row', height: 110 }}>
            <View style={{ width: 2, backgroundColor: done ? color : '#1e2840' }} />
            {done && <Corners color={color} />}

            {/* Image */}
            <View style={{ width: 110, height: '100%', backgroundColor: '#0a0d1a', position: 'relative' }}>
                {img
                    ? <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    : <View style={{ flex: 1, backgroundColor: color + '10' }} />
                }
                <View style={{ position: 'absolute', inset: 0, backgroundColor: done ? 'rgba(6,8,15,0.2)' : 'rgba(6,8,15,0.55)' }} />
                <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: color + (done ? 'ee' : '80'), paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#000', letterSpacing: 1 }}>
                        {done ? 'DONE' : `${Math.round(pct * 100)}%`}
                    </Text>
                </View>
                {/* Type tag — bottom of image */}
                <View style={{ position: 'absolute', bottom: 6, left: 8 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 9, color: color + 'aa', letterSpacing: 2 }}>
                        {isGoal ? 'GOAL' : 'ACHIEVEMENT'}
                    </Text>
                </View>
            </View>

            {/* Info */}
            <View style={{ flex: 1, padding: 12, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: done ? color : '#c8d4f0', lineHeight: 24, flex: 1 }}>{name}</Text>
                    {done && (
                        <View style={{ width: 22, height: 22, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
                            <FontAwesome5 name="check" size={10} color="#000" />
                        </View>
                    )}
                </View>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070', marginBottom: 10 }}>{desc}</Text>
                <View style={{ height: 4, backgroundColor: '#0d1020', marginBottom: 5 }}>
                    <View style={{ height: '100%', width: `${pct * 100}%`, backgroundColor: done ? color : color + '70' }} />
                </View>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: done ? color : '#445070' }}>{label}</Text>
            </View>
        </View>
    );
}

export default function GoalsScreen({ onClose }) {
    const state = useGame();
    const { playerAge, achievements = [] } = state;

    const completedGoals = LIFE_GOALS.filter(g => g.check(state));
    const unlockedAch    = ACHIEVEMENTS.filter(a => achievements.includes(a.id));

    // Build unified list: goals first, then achievements; done items float to top within each group
    const goalItems = [
        ...LIFE_GOALS.filter(g => g.check(state)).map(g => ({ ...g, type: 'goal' })),
        ...LIFE_GOALS.filter(g => !g.check(state)).map(g => ({ ...g, type: 'goal' })),
    ];
    const achItems = [
        ...ACHIEVEMENTS.filter(a => achievements.includes(a.id)).map(a => ({ ...a, type: 'achievement' })),
        ...ACHIEVEMENTS.filter(a => !achievements.includes(a.id)).map(a => ({ ...a, type: 'achievement' })),
    ];
    const allItems = [...goalItems, ...achItems];

    return (
        <View style={{ flex: 1, backgroundColor: '#06080f' }}>
            {/* Header */}
            <View style={{ backgroundColor: '#0d1020', paddingTop: 14, paddingBottom: 12, paddingHorizontal: PAD, borderBottomWidth: 1, borderColor: '#1a2040', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 4 }}>AGE {playerAge}</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', lineHeight: 28 }}>Goals & Achievements</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={{ width: 34, height: 34, borderWidth: 1, borderColor: '#1e2840', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome5 name="times" size={14} color="#445070" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>

                {/* Summary */}
                <View style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP + 4 }}>
                    <View style={{ flex: 1, borderWidth: 1, borderColor: '#166534', backgroundColor: '#0d1e12', padding: 12, alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a5040', letterSpacing: 2 }}>GOALS</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 34, color: '#4ade80', lineHeight: 36 }}>{completedGoals.length}/{LIFE_GOALS.length}</Text>
                    </View>
                    <View style={{ flex: 1, borderWidth: 1, borderColor: '#f59e0b40', backgroundColor: '#0d1020', padding: 12, alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 2 }}>ACHIEVEMENTS</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 34, color: '#fbbf24', lineHeight: 36 }}>{unlockedAch.length}/{ACHIEVEMENTS.length}</Text>
                    </View>
                </View>

                {allItems.map(item => (
                    <View key={item.id} style={{ marginBottom: GAP }}>
                        <UnifiedCard
                            item={item}
                            state={state}
                            unlocked={achievements.includes(item.id)}
                        />
                    </View>
                ))}

            </ScrollView>
        </View>
    );
}
