import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useGame } from '../context/GameContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { ACHIEVEMENTS } from '../data/achievements';
import { ACHIEVEMENT_IMAGES, GOAL_IMAGES } from '../data/achievementImages';

const PAD = 14;
const GAP = 8;
const IMG_H = 110;

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

const SectionLabel = ({ label, color = '#556080' }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 18 }}>
        <View style={{ height: 1, width: 10, backgroundColor: color + '80' }} />
        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color, letterSpacing: 3 }}>{label}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: color + '25' }} />
    </View>
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
            const hasChild = s.dependents?.some(d => d.type === 'child');
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

// ── Goal image card ──────────────────────────────────────────────────────────
function GoalCard({ goal, state }) {
    const done = goal.check(state);
    const pct  = goal.progress(state);
    const label = goal.progressLabel(state);
    const img  = GOAL_IMAGES[goal.id] || null;

    return (
        <View style={{ flex: 1, borderWidth: 1, borderColor: done ? goal.color + '70' : '#1e2840', backgroundColor: '#070a16', overflow: 'hidden', position: 'relative' }}>
            {done && <Corners color={goal.color} />}

            {/* Image */}
            <View style={{ height: IMG_H, backgroundColor: '#0a0d1a' }}>
                {img
                    ? <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    : <View style={{ flex: 1, backgroundColor: goal.color + '10' }} />
                }
                <View style={{ position: 'absolute', inset: 0, backgroundColor: done ? 'rgba(6,8,15,0.25)' : 'rgba(6,8,15,0.55)' }} />
                {/* Done badge */}
                {done && (
                    <View style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, backgroundColor: goal.color, alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome5 name="check" size={11} color="#000" />
                    </View>
                )}
                {/* Color label top-left */}
                <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: goal.color + (done ? 'ee' : '99'), paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#000', letterSpacing: 1 }}>
                        {done ? 'COMPLETE' : `${Math.round(pct * 100)}%`}
                    </Text>
                </View>
            </View>

            {/* Info */}
            <View style={{ padding: 8 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: done ? goal.color : '#c8d4f0', lineHeight: 18 }} numberOfLines={1}>{goal.name}</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070', marginBottom: 6 }} numberOfLines={1}>{goal.desc}</Text>
                {/* Progress bar */}
                <View style={{ height: 4, backgroundColor: '#0d1020', marginBottom: 4 }}>
                    <View style={{ height: '100%', width: `${pct * 100}%`, backgroundColor: done ? goal.color : goal.color + '70' }} />
                </View>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: done ? goal.color : '#445070' }} numberOfLines={1}>{label}</Text>
            </View>
        </View>
    );
}

// ── Achievement badge (5-col grid) ───────────────────────────────────────────
function AchBadge({ ach, unlocked }) {
    const img = ACHIEVEMENT_IMAGES[ach.id] || null;
    return (
        <View style={{ flex: 1, borderWidth: 1, borderColor: unlocked ? ach.color + '60' : '#1a2030', backgroundColor: unlocked ? ach.color + '10' : '#0a0d1a', paddingVertical: 8, alignItems: 'center', position: 'relative', opacity: unlocked ? 1 : 0.4 }}>
            {unlocked && <Corners color={ach.color} />}
            <View style={{ width: 36, height: 36, borderWidth: 1, borderColor: unlocked ? ach.color : '#1e2840', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#070910' }}>
                {img
                    ? <Image source={img} style={{ width: '100%', height: '100%', opacity: unlocked ? 1 : 0.12 }} resizeMode="cover" />
                    : <View style={{ flex: 1, backgroundColor: unlocked ? ach.color + '20' : '#070910' }} />
                }
                {!unlocked && (
                    <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome5 name="lock" size={12} color="#1e2840" />
                    </View>
                )}
                {unlocked && (
                    <View style={{ position: 'absolute', bottom: -6, right: -6, width: 22, height: 22 }}>
                        <Image source={require('../../assets/ui_comp/achivements.png')} style={{ width: 22, height: 22 }} resizeMode="contain" />
                    </View>
                )}
            </View>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 9, color: unlocked ? ach.color : '#2a3560', textAlign: 'center', marginTop: 4, paddingHorizontal: 2 }} numberOfLines={2}>{ach.name}</Text>
        </View>
    );
}

export default function GoalsScreen({ onClose }) {
    const state = useGame();
    const { playerAge, achievements = [] } = state;

    const completedGoals = LIFE_GOALS.filter(g => g.check(state));
    const unlockedAch    = ACHIEVEMENTS.filter(a => achievements.includes(a.id));
    const lockedAch      = ACHIEVEMENTS.filter(a => !achievements.includes(a.id));
    const allAch         = [...unlockedAch, ...lockedAch];

    return (
        <View style={{ flex: 1, backgroundColor: '#06080f' }}>
            {/* Header */}
            <View style={{ backgroundColor: '#0d1020', paddingTop: 14, paddingBottom: 12, paddingHorizontal: PAD, borderBottomWidth: 1, borderColor: '#1a2040', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 4 }}>AGE {playerAge}</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', lineHeight: 28 }}>Life Goals</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={{ width: 34, height: 34, borderWidth: 1, borderColor: '#1e2840', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome5 name="times" size={14} color="#445070" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>

                {/* Summary */}
                <View style={{ flexDirection: 'row', gap: GAP, marginBottom: 4 }}>
                    <View style={{ flex: 1, borderWidth: 1, borderColor: '#166534', backgroundColor: '#0d1e12', padding: 12, alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a5040', letterSpacing: 2 }}>GOALS DONE</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 34, color: '#4ade80', lineHeight: 36 }}>{completedGoals.length}/{LIFE_GOALS.length}</Text>
                    </View>
                    <View style={{ flex: 1, borderWidth: 1, borderColor: '#f59e0b40', backgroundColor: '#0d1020', padding: 12, alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 2 }}>ACHIEVEMENTS</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 34, color: '#fbbf24', lineHeight: 36 }}>{unlockedAch.length}/{ACHIEVEMENTS.length}</Text>
                    </View>
                </View>

                {/* ── Life Goals grid ────────────────────────────── */}
                <SectionLabel label="LIFE GOALS" color="#a78bfa" />

                {Array.from({ length: Math.ceil(LIFE_GOALS.length / 2) }).map((_, rowIdx) => (
                    <View key={rowIdx} style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
                        {LIFE_GOALS.slice(rowIdx * 2, rowIdx * 2 + 2).map(goal => (
                            <GoalCard key={goal.id} goal={goal} state={state} />
                        ))}
                        {LIFE_GOALS.slice(rowIdx * 2, rowIdx * 2 + 2).length === 1 && <View style={{ flex: 1 }} />}
                    </View>
                ))}

                {/* ── Achievements grid ──────────────────────────── */}
                <SectionLabel label="ACHIEVEMENTS" color="#fbbf24" />

                {Array.from({ length: Math.ceil(allAch.length / 5) }).map((_, rowIdx) => (
                    <View key={rowIdx} style={{ flexDirection: 'row', gap: 5, marginBottom: 5 }}>
                        {allAch.slice(rowIdx * 5, rowIdx * 5 + 5).map(ach => (
                            <AchBadge key={ach.id} ach={ach} unlocked={achievements.includes(ach.id)} />
                        ))}
                        {allAch.slice(rowIdx * 5, rowIdx * 5 + 5).length < 5 &&
                            Array.from({ length: 5 - allAch.slice(rowIdx * 5, rowIdx * 5 + 5).length }).map((_, k) => (
                                <View key={k} style={{ flex: 1 }} />
                            ))
                        }
                    </View>
                ))}

            </ScrollView>
        </View>
    );
}
