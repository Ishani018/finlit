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
                            <View style={{ overflow: 'hidden' }}>
                                <Image source={roomImg} style={{ width: '100%', height: 260 }} resizeMode="cover" />
                                <View style={{ paddingHorizontal: PAD, paddingTop: 18, paddingBottom: 6 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: roomColor, letterSpacing: 3, marginBottom: 6 }}>
                                        {MONTHS[currentMonth - 1]} CELEBRATIONS
                                    </Text>
                                    {isPlayerBday && (
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#fbcfe8', lineHeight: 30, marginBottom: 4 }}>
                                            {playerName}'s Birthday
                                        </Text>
                                    )}
                                    {bdayDependents.map(d => (
                                        <Text key={d.id} style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#fbcfe8', lineHeight: 30, marginBottom: 4 }}>
                                            {d.name}'s Birthday
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* ── Upcoming Birthdays List ── */}
                        <View style={{ paddingHorizontal: PAD, marginTop: isBdayMonth ? 8 : 16 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070', letterSpacing: 3, marginBottom: 16 }}>
                                UPCOMING BIRTHDAYS
                            </Text>

                            {upcoming.length === 0 ? (
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#445070' }}>
                                    No birthdays tracked yet.
                                </Text>
                            ) : (
                                <View>
                                    {upcoming.map((b, i) => (
                                        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderTopWidth: i === 0 ? 0 : 1, borderColor: '#0f1525' }}>
                                            <View>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: b.isPlayer ? '#fbcfe8' : '#c8d4f0' }}>
                                                    {b.name}{b.isPlayer ? ' (You)' : ''}
                                                </Text>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: b.monthsAway === 0 ? '#4ade80' : '#445070' }}>
                                                    {b.monthsAway === 0 ? 'this month' : `in ${b.monthsAway} month${b.monthsAway !== 1 ? 's' : ''}`}
                                                </Text>
                                            </View>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#ec4899' }}>
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
