import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';

const PAD = 14;
const GAP = 8;

// Static requires — Metro needs all paths at bundle time
const IMAGES = {
    work:      require('../../assets/jobs/government_job.png'),
    study:     require('../../assets/jobs/coaching_centre.png'),
    invest:    require('../../assets/CA_Office.png'),
    bank:      require('../../assets/bank.png'),
    insurance: require('../../assets/jobs/chemist_drugstore.png'),
    home:      require('../../assets/properties/1bhk_starter_apartment.png'),
    family:    require('../../assets/properties/family_house_with_garden_and_backyard.png'),
    grocery:   require('../../assets/jobs/kirana_store.png'),
};
const GOALS_ICON = require('../../assets/ui_comp/achivements.png');
const HELP_ICON = require('../../assets/ui_comp/bulb.png');
const COIN = require('../../assets/ui_comp/nextbutton.png');

const LABELS = {
    work: 'WORK', study: 'STUDY', invest: 'INVEST', bank: 'BANK',
    insurance: 'INSURE', home: 'HOME', family: 'FAMILY', grocery: 'SHOP',
};

const SECTIONS = [
    { label: 'CAREER',     color: '#e2b33a', keys: ['work', 'study'] },
    { label: 'FINANCES',   color: '#38b2ac', keys: ['invest', 'bank', 'insurance'] },
    { label: 'DAILY LIFE', color: '#ec4899', keys: ['home', 'family', 'grocery'] },
];

const RED = '#f87171';

function Corners({ color }) {
    return [
        { top: 0, left: 0, borderTopWidth: 1, borderLeftWidth: 1 },
        { top: 0, right: 0, borderTopWidth: 1, borderRightWidth: 1 },
        { bottom: 0, left: 0, borderBottomWidth: 1, borderLeftWidth: 1 },
        { bottom: 0, right: 0, borderBottomWidth: 1, borderRightWidth: 1 },
    ].map((s, i) => (
        <View key={i} style={[{ position: 'absolute', width: 8, height: 8, borderColor: color + 'b0' }, s]} />
    ));
}

function HubTile({ id, color, height, status, urgent, badge, onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={{ flex: 1, height, overflow: 'hidden', borderRadius: 12, borderWidth: 1, borderColor: urgent ? RED + 'b0' : color + '55' }}
        >
            <Image source={IMAGES[id]} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: urgent ? 'rgba(6,8,15,0.40)' : 'rgba(6,8,15,0.58)' }} />
            <Corners color={urgent ? RED : color} />
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(6,8,15,0.84)', paddingVertical: 5, paddingHorizontal: 6, borderTopWidth: 1, borderColor: 'rgba(200,212,240,0.1)', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#c8d4f0', letterSpacing: 1, lineHeight: 16 }}>{LABELS[id]}</Text>
                {status ? (
                    <Text numberOfLines={1} style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: urgent ? '#f3a5a5' : '#8d9ac0', lineHeight: 14, marginTop: 2 }}>{status}</Text>
                ) : null}
            </View>
            {badge ? (
                <View style={{ position: 'absolute', top: 5, right: 5, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: RED, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 1, borderColor: '#0f1729' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#fff' }}>{badge}</Text>
                </View>
            ) : null}
        </TouchableOpacity>
    );
}

function SectionLabel({ text, color }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <View style={{ height: 1, width: 10, backgroundColor: color + '80' }} />
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color, letterSpacing: 3 }}>{text}</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: color + '25' }} />
        </View>
    );
}

// Command Centre. Every tile carries a live status line, and tiles that need the
// player's attention are pulled into a red row at the top.
//   profile:   { name, age, job, dateLabel, balance, net, sprite }
//   statuses:  { work, study, invest, bank, insurance, home, family, grocery } -> short string
//   attention: keys to show in the "needs attention" row (max 2)
export default function HubMenu({ onClose, onAction, profile = {}, statuses = {}, attentionStatuses = {}, attention = [], badges = {}, nextMonthLabel, onNextMonth }) {
    const go = (key) => { onClose(); onAction(key); };
    const urgent = attention.slice(0, 2);
    const netColor = (profile.net || 0) >= 0 ? '#4ade80' : RED;

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(6,8,15,0.98)', zIndex: 700 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 1, borderColor: '#1a2040' }}>
                <View>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#5a6890', letterSpacing: 4 }}>NAVIGATE</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#c8d4f0', lineHeight: 28 }}>COMMAND CENTRE</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => go('goals')} activeOpacity={0.75} style={{ width: 34, height: 34, backgroundColor: '#0d1020', borderWidth: 1, borderRadius: 10, borderColor: '#1e2840', alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={GOALS_ICON} style={{ width: 20, height: 20 }} resizeMode="contain" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => go('help')} activeOpacity={0.75} style={{ width: 34, height: 34, backgroundColor: '#0d1020', borderWidth: 1, borderRadius: 10, borderColor: '#1e2840', alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={HELP_ICON} style={{ width: 20, height: 20 }} resizeMode="contain" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose} activeOpacity={0.75} style={{ width: 34, height: 34, backgroundColor: '#0d1020', borderWidth: 1, borderRadius: 10, borderColor: '#1e2840', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#7d8ab0' }}>✕</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                {/* Status strip */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0d1020', borderWidth: 1, borderColor: '#1a2040', borderRadius: 12, padding: 8, paddingRight: 12, marginBottom: 14 }}>
                    <View style={{ width: 46, height: 56, borderRadius: 8, backgroundColor: '#141b36', overflow: 'hidden' }}>
                        {profile.sprite ? <Image source={profile.sprite} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0', lineHeight: 22 }}>{profile.name || 'Player'} · Age {profile.age}</Text>
                        <Text numberOfLines={1} style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#7d8ab0', lineHeight: 16 }}>{profile.job || 'Unemployed'} · {profile.dateLabel}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#38b2ac', lineHeight: 22 }}>₹{(profile.balance || 0).toLocaleString()}</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: netColor, lineHeight: 15 }}>{(profile.net || 0) >= 0 ? '+' : '−'}₹{Math.abs(profile.net || 0).toLocaleString()} this month</Text>
                    </View>
                </View>

                {urgent.length > 0 && (
                    <View style={{ marginBottom: 16 }}>
                        <SectionLabel text="NEEDS ATTENTION" color={RED} />
                        <View style={{ flexDirection: 'row', gap: GAP }}>
                            {urgent.map(key => (
                                <HubTile key={key} id={key} color={RED} height={120} urgent status={attentionStatuses[key] || statuses[key]} badge="!" onPress={() => go(key)} />
                            ))}
                            {urgent.length === 1 && <View style={{ flex: 1 }} />}
                        </View>
                    </View>
                )}

                {SECTIONS.map(section => (
                    <View key={section.label} style={{ marginBottom: 16 }}>
                        <SectionLabel text={section.label} color={section.color} />
                        <View style={{ flexDirection: 'row', gap: GAP }}>
                            {section.keys.map(key => (
                                <HubTile key={key} id={key} color={section.color} height={96} status={statuses[key]} badge={badges[key] || null} onPress={() => go(key)} />
                            ))}
                            {Array.from({ length: 3 - section.keys.length }).map((_, i) => <View key={i} style={{ flex: 1 }} />)}
                        </View>
                    </View>
                ))}
            </ScrollView>

            {onNextMonth ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0a0d1a', borderTopWidth: 1, borderColor: '#1a2040', paddingHorizontal: PAD, paddingVertical: 10 }}>
                    <Image source={COIN} style={{ width: 44, height: 44 }} resizeMode="contain" />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#7d8ab0' }}>Expected this month</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: netColor, lineHeight: 18 }}>{(profile.net || 0) >= 0 ? '+' : '−'}₹{Math.abs(profile.net || 0).toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity onPress={() => { onClose(); onNextMonth(); }} activeOpacity={0.85} style={{ paddingHorizontal: 18, height: 44, borderRadius: 10, backgroundColor: '#fbbf24', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#2a1c00', letterSpacing: 2 }}>{nextMonthLabel || 'END MONTH ›'}</Text>
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    );
}
