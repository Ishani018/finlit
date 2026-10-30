import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useGame } from '../context/GameContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { ACHIEVEMENTS } from '../data/achievements';
import { ACHIEVEMENT_IMAGES, GOAL_IMAGES } from '../data/achievementImages';

const ACH_ICON = require('../../assets/ui_comp/achivements.png');

const PAD = 14;


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

// ── Goal tile — 2-column grid, art on top, name + progress under it ──────────
function GoalTile({ item, state }) {
    const done  = item.check(state);
    const img   = GOAL_IMAGES[item.id] || null;
    const { color, name } = item;
    return (
        <View style={{ flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: done ? '#0a1a14' : '#0d1020', borderWidth: 1, borderColor: done ? '#4ade8066' : '#1a2040' }}>
            <View style={{ height: 78, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? '#08130f' : '#080b18' }}>
                {img ? <Image source={img} style={{ width: '78%', height: '100%', opacity: done ? 1 : 0.55 }} resizeMode="contain" /> : null}
            </View>
            <View style={{ paddingVertical: 7, paddingHorizontal: 8, alignItems: 'center', backgroundColor: 'rgba(6,8,15,0.84)', borderTopWidth: 1, borderColor: 'rgba(200,212,240,0.08)' }}>
                <Text numberOfLines={1} style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#c8d4f0', lineHeight: 18 }}>{name}</Text>
                <Text numberOfLines={1} style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: done ? '#4ade80' : color, lineHeight: 14 }}>{done ? 'DONE' : item.progressLabel(state)}</Text>
            </View>
        </View>
    );
}

// ── Achievement card — compact horizontal ─────────────────────────────────────
function AchievementCard({ item, unlocked }) {
    const img = ACHIEVEMENT_IMAGES[item.id] || null;
    const { name, desc } = item;

    return (
        <View style={{ flexDirection: 'row', overflow: 'hidden', borderRadius: 8, height: 68, opacity: unlocked ? 1 : 0.35 }}>
            {/* Thumb */}
            <View style={{ width: 68, backgroundColor: '#080b18' }}>
                {img && <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />}
            </View>
            {/* Text */}
            <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 14, backgroundColor: '#0a0d18' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#c8d4f0', lineHeight: 20 }} numberOfLines={1}>{name}</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', marginTop: 2 }} numberOfLines={1}>{desc}</Text>
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
    const next = LIFE_GOALS.filter(g => !g.check(state) && g.progress(state) < 1).sort((x, y) => y.progress(state) - x.progress(state))[0];
    const pairs = [];
    for (let i = 0; i < goalItems.length; i += 2) pairs.push(goalItems.slice(i, i + 2));
    return (
        <View style={{ flex: 1, backgroundColor: '#06080f' }}>
            <View style={{ paddingTop: 14, paddingBottom: 12, paddingHorizontal: PAD, borderBottomWidth: 1, borderColor: '#1a2040', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <View>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#5a6890', letterSpacing: 4 }}>MILESTONES</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: '#c8d4f0', lineHeight: 30 }}>Goals</Text>
                </View>
                <View style={{ alignItems: 'flex-end', width: 120 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#4ade80' }}>{completedGoals.length} of {LIFE_GOALS.length} done</Text>
                    <View style={{ width: '100%', height: 5, borderRadius: 3, backgroundColor: '#1a2040', overflow: 'hidden', marginTop: 3 }}>
                        <View style={{ width: `${(completedGoals.length / LIFE_GOALS.length) * 100}%`, height: '100%', backgroundColor: '#4ade80' }} />
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
                {next ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1a1405', borderWidth: 1, borderColor: '#fbbf2455', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                        <View style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: '#080b18', alignItems: 'center', justifyContent: 'center' }}>
                            {GOAL_IMAGES[next.id] ? <Image source={GOAL_IMAGES[next.id]} style={{ width: 56, height: 56 }} resizeMode="contain" /> : null}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#fbbf24', letterSpacing: 4 }}>CLOSEST GOAL</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', lineHeight: 26 }}>{next.name}</Text>
                            <View style={{ height: 6, borderRadius: 3, backgroundColor: '#2a2208', overflow: 'hidden', marginVertical: 4 }}>
                                <View style={{ width: `${Math.max(3, next.progress(state) * 100)}%`, height: '100%', backgroundColor: '#fbbf24' }} />
                            </View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#9a8a5a' }}>{next.progressLabel(state)}</Text>
                        </View>
                    </View>
                ) : null}

                {pairs.map((pair, i) => (
                    <View key={i} style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                        {pair.map(item => <GoalTile key={item.id} item={item} state={state} />)}
                        {pair.length === 1 ? <View style={{ flex: 1 }} /> : null}
                    </View>
                ))}

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 12 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#5a6890', letterSpacing: 4 }}>ACHIEVEMENTS · {unlockedAch.length}/{ACHIEVEMENTS.length}</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: '#1a2040' }} />
                </View>
                {achItems.map((item) => (
                    <View key={item.id} style={{ marginBottom: 8 }}>
                        <AchievementCard item={item} unlocked={achievements.includes(item.id)} />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
