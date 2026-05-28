import { View, Text, Image, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native';

const BDAY_CAKE   = require('../../assets/ui_comp/birthday_cake.png');
const QUIET_IMG   = require('../../assets/ui_comp/quiet dinner.png');
const PARTY_IMG   = require('../../assets/ui_comp/house party birthday.png');
const LAVISH_IMG  = require('../../assets/ui_comp/lavish birthday bash.png');
const HAPPY_ICON  = require('../../assets/ui_comp/happyicon.png');

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const getRoomImage = (label) => {
    if (!label) return QUIET_IMG;
    const l = label.toLowerCase();
    if (l.includes('lavish')) return LAVISH_IMG;
    if (l.includes('house party') || l.includes('big house')) return PARTY_IMG;
    return QUIET_IMG;
};

const getRoomColor = (label) => {
    if (!label) return '#60a5fa';
    const l = label.toLowerCase();
    if (l.includes('lavish')) return '#f87171';
    if (l.includes('house party') || l.includes('big house')) return '#4ade80';
    return '#60a5fa';
};

const PAD = 14;

export default function BirthdayCelebrationRoom({
    visible, onClose,
    turn, playerBirthday, playerName, dependents, lastCelebrationChoice,
}) {
    if (!visible) return null;

    // Parse player birthday month
    let playerBdayMonth = null;
    if (playerBirthday && playerBirthday.includes('/')) {
        playerBdayMonth = parseInt(playerBirthday.split('/')[1], 10);
    }

    const currentMonth = turn?.month || 1;
    const isPlayerBday = playerBdayMonth === currentMonth;
    const bdayDependents = dependents?.filter(d => d.bdayMonth === currentMonth && !d.isDead) || [];
    const isBdayMonth = isPlayerBday || bdayDependents.length > 0;

    const allBdays = [];
    if (playerBdayMonth) {
        allBdays.push({ name: playerName || 'You', month: playerBdayMonth, isPlayer: true });
    }
    (dependents || []).filter(d => !d.isDead).forEach(d => {
        if (d.bdayMonth) allBdays.push({ name: d.name, month: d.bdayMonth, isPlayer: false });
    });
    
    const upcoming = allBdays
        .map(b => ({ ...b, monthsAway: ((b.month - currentMonth + 12) % 12) }))
        .sort((a, b) => a.monthsAway - b.monthsAway);

    const roomImg = getRoomImage(lastCelebrationChoice?.label);
    const roomColor = getRoomColor(lastCelebrationChoice?.label);
    const sceneLabel = isBdayMonth && lastCelebrationChoice?.label ? lastCelebrationChoice.label.toUpperCase() : 'NO PARTY THIS MONTH';

    return (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#06080f', zIndex: 100 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    {/* Header matches HomeScreen style */}
                    <View style={{ paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderColor: '#1a2040', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Image source={BDAY_CAKE} style={{ width: 44, height: 44 }} resizeMode="contain" />
                            <View>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 4 }}>
                                    {isBdayMonth ? 'PARTY TIME' : 'PLANNING AHEAD'}
                                </Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', letterSpacing: 1, lineHeight: 28 }}>
                                    {sceneLabel}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#445070' }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
                        
                        {/* ── Main Scene Area ── */}
                        {isBdayMonth && (
                            <View style={{ margin: PAD, borderWidth: 2, borderColor: roomColor + '55', backgroundColor: '#0d1020', overflow: 'hidden', position: 'relative' }}>
                                <Image source={roomImg} style={{ width: '100%', height: 280 }} resizeMode="cover" />
                                <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: roomColor, paddingHorizontal: 10, paddingVertical: 3 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#000', letterSpacing: 2 }}>SCENE</Text>
                                </View>

                                <View style={{ padding: 16 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#c8d4f0', letterSpacing: 1, marginBottom: 8 }}>
                                        {MONTHS[currentMonth - 1]} Celebrations:
                                    </Text>
                                    {isPlayerBday && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <Image source={HAPPY_ICON} style={{ width: 18, height: 18 }} resizeMode="contain" />
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#fbcfe8' }}>
                                                {playerName}'s Birthday
                                            </Text>
                                        </View>
                                    )}
                                    {bdayDependents.map(d => (
                                        <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <Image source={HAPPY_ICON} style={{ width: 18, height: 18 }} resizeMode="contain" />
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#fbcfe8' }}>
                                                {d.name}'s Birthday
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* ── Upcoming Birthdays List ── */}
                        <View style={{ paddingHorizontal: PAD, marginTop: 10 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', letterSpacing: 3, marginBottom: 12 }}>
                                UPCOMING BIRTHDAYS
                            </Text>

                            {upcoming.length === 0 ? (
                                <View style={{ alignItems: 'center', paddingVertical: 30, borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#0d1020' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#445070', textAlign: 'center' }}>
                                        No birthdays tracked yet.
                                    </Text>
                                </View>
                            ) : (
                                <View style={{ gap: 10 }}>
                                    {upcoming.map((b, i) => (
                                        <View key={i} style={{ borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#0d1020', padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                <Image source={HAPPY_ICON} style={{ width: 18, height: 18 }} resizeMode="contain" />
                                                <View>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: b.isPlayer ? '#fbcfe8' : '#c8d4f0' }}>
                                                        {b.name}{b.isPlayer ? ' (You)' : ''}
                                                    </Text>
                                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: b.monthsAway === 0 ? '#4ade80' : '#60a5fa' }}>
                                                        {b.monthsAway === 0 ? 'THIS MONTH' : `in ${b.monthsAway} month${b.monthsAway !== 1 ? 's' : ''}`}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#ec4899' }}>
                                                {MONTHS[b.month - 1]}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
}
