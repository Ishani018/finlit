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

// ── Goal card — clean image with overlaid name, no strips or bars ─────────────
function GoalCard({ item, state }) {
    const done  = item.check(state);
    const label = item.progressLabel(state);
    const img   = GOAL_IMAGES[item.id] || null;
    const { color, name, desc } = item;

    return (
        <View style={{ overflow: 'hidden', borderRadius: 8, opacity: done ? 1 : 0.85 }}>
            <View style={{ height: 110, position: 'relative', backgroundColor: '#080b18' }}>
                {img && <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />}
                <View style={{ position: 'absolute', inset: 0, backgroundColor: done ? 'rgba(6,8,15,0.18)' : 'rgba(6,8,15,0.55)' }} />
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 14, paddingBottom: 12, paddingTop: 30, backgroundColor: 'rgba(5,7,14,0.72)' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: done ? color : '#c8d4f0', lineHeight: 26 }}>{name}</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: done ? color : '#445070', marginLeft: 10 }}>{label}</Text>
                    </View>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', marginTop: 1 }}>{desc}</Text>
                </View>
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
    return (
        <View style={{ flex: 1, backgroundColor: '#06080f' }}>
            {/* Header */}
            <View style={{ backgroundColor: '#0d1020', paddingTop: 14, paddingBottom: 12, paddingHorizontal: PAD, borderBottomWidth: 1, borderColor: '#1a2040', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#4a5580', letterSpacing: 4 }}>AGE {playerAge}</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', lineHeight: 28 }}>Goals & Achievements</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>

                    <TouchableOpacity onPress={onClose} style={{ width: 34, height: 34, borderWidth: 1, borderColor: '#1e2840', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome5 name="times" size={14} color="#445070" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>

                {/* Summary strip — inline with header feel */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#4ade80', lineHeight: 24 }}>{completedGoals.length}<Text style={{ fontSize: 14, color: '#2a5040' }}>/{LIFE_GOALS.length}</Text></Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a5040', letterSpacing: 2 }}>GOALS</Text>
                    </View>
                    <View style={{ width: 1, height: 14, backgroundColor: '#1a2040' }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Image source={ACH_ICON} style={{ width: 12, height: 12, opacity: 0.5 }} resizeMode="contain" />
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#fbbf24', lineHeight: 24 }}>{unlockedAch.length}<Text style={{ fontSize: 14, color: '#445070' }}>/{ACHIEVEMENTS.length}</Text></Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 2 }}>UNLOCKED</Text>
                    </View>
                </View>

                {goalItems.map((item) => (
                    <View key={item.id} style={{ marginBottom: 12 }}>
                        <GoalCard item={item} state={state} />
                    </View>
                ))}

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 12 }}>
                    <View style={{ width: 3, height: 14, backgroundColor: '#fbbf2480' }} />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 3 }}>ACHIEVEMENTS</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: '#141828' }} />
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
