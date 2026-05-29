import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const PAD = 14;
const GAP = 8;
const CARD_H = 110;

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
    goals:     require('../../assets/properties/3_floor_apartment_complex_with_penthouse.png'),
    help:      require('../../assets/jobs/coaching_centre.png'),
};

const SECTIONS = [
    {
        label: 'CAREER',
        color: '#e2b33a',
        items: [
            { key: 'work',  label: 'WORK',  desc: 'Jobs & salary' },
            { key: 'study', label: 'STUDY', desc: 'Courses & degrees' },
        ],
    },
    {
        label: 'FINANCES',
        color: '#38b2ac',
        items: [
            { key: 'invest',    label: 'INVEST', desc: 'Stocks, MF & more' },
            { key: 'bank',      label: 'BANK',   desc: 'FDs, loans & CA' },
            { key: 'insurance', label: 'INSURE', desc: 'Protect yourself' },
        ],
    },
    {
        label: 'DAILY LIFE',
        color: '#ec4899',
        items: [
            { key: 'home',    label: 'HOME',   desc: 'Housing & property' },
            { key: 'family',  label: 'FAMILY', desc: 'Spouse & children' },
            { key: 'grocery', label: 'SHOP',   desc: 'Food & health' },
        ],
    },
    {
        label: 'PROGRESS',
        color: '#a78bfa',
        items: [
            { key: 'goals', label: 'GOALS', desc: 'Achievements' },
            { key: 'help',  label: 'HELP',  desc: 'Guide & tips' },
        ],
    },
];

function HubCard({ item, color, badge, urgent, onPress }) {
    const img = IMAGES[item.key];
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={{ flex: 1, height: CARD_H, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: urgent ? color + '90' : color + '35' }}
        >
            {/* Background image */}
            <Image source={img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />

            {/* Dark gradient overlay */}
            <View style={{ position: 'absolute', inset: 0, backgroundColor: urgent ? 'rgba(6,8,15,0.45)' : 'rgba(6,8,15,0.60)' }} />

            {/* Pixel corners */}
            {[
                { top: 0, left: 0, borderTopWidth: 1, borderLeftWidth: 1 },
                { top: 0, right: 0, borderTopWidth: 1, borderRightWidth: 1 },
                { bottom: 0, left: 0, borderBottomWidth: 1, borderLeftWidth: 1 },
                { bottom: 0, right: 0, borderBottomWidth: 1, borderRightWidth: 1 },
            ].map((s, i) => (
                <View key={i} style={[{ position: 'absolute', width: 8, height: 8, borderColor: color + '90' }, s]} />
            ))}

            {/* Label at bottom */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(6,8,15,0.80)', paddingVertical: 5, paddingHorizontal: 6, borderTopWidth: 1, borderColor: color + '30' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#c8d4f0', letterSpacing: 1, textAlign: 'center' }}>
                    {item.label}
                </Text>
            </View>

            {/* Badge */}
            {badge ? (
                <View style={{
                    position: 'absolute', top: 4, right: 4,
                    minWidth: 18, height: 18, borderRadius: 9,
                    backgroundColor: badge === '!' ? '#f87171' : color,
                    alignItems: 'center', justifyContent: 'center',
                    paddingHorizontal: 4,
                    borderWidth: 1, borderColor: '#0f1729',
                }}>
                    <Text style={{ fontSize: 10, color: '#fff', fontWeight: 'bold' }}>{badge}</Text>
                </View>
            ) : null}
        </TouchableOpacity>
    );
}

export default function HubMenu({ onClose, onAction, badges = {} }) {
    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(6,8,15,0.97)', zIndex: 100 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 1, borderColor: '#1a2040' }}>
                <View>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 4 }}>NAVIGATE</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', lineHeight: 28 }}>COMMAND CENTRE</Text>
                </View>
                <TouchableOpacity
                    onPress={onClose}
                    style={{ width: 34, height: 34, backgroundColor: '#0d1020', borderWidth: 1, borderColor: '#1e2840', alignItems: 'center', justifyContent: 'center' }}
                    activeOpacity={0.75}
                >
                    <FontAwesome5 name="times" size={13} color="#445070" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {SECTIONS.map(section => (
                    <View key={section.label} style={{ marginBottom: 18 }}>
                        {/* Section label */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <View style={{ height: 1, width: 10, backgroundColor: section.color + '80' }} />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: section.color, letterSpacing: 3 }}>{section.label}</Text>
                            <View style={{ flex: 1, height: 1, backgroundColor: section.color + '25' }} />
                        </View>

                        {/* Cards — split into rows of 3 */}
                        {Array.from({ length: Math.ceil(section.items.length / 3) }).map((_, rowIdx) => (
                            <View key={rowIdx} style={{ flexDirection: 'row', gap: GAP, marginBottom: rowIdx < Math.ceil(section.items.length / 3) - 1 ? GAP : 0 }}>
                                {section.items.slice(rowIdx * 3, rowIdx * 3 + 3).map(item => (
                                    <HubCard
                                        key={item.key}
                                        item={item}
                                        color={section.color}
                                        badge={badges[item.key] || null}
                                        urgent={!!badges[item.key]}
                                        onPress={() => { onClose(); onAction(item.key); }}
                                    />
                                ))}
                                {/* Fill empty slots so cards don't stretch */}
                                {section.items.slice(rowIdx * 3, rowIdx * 3 + 3).length < 3 &&
                                    Array.from({ length: 3 - section.items.slice(rowIdx * 3, rowIdx * 3 + 3).length }).map((_, k) => (
                                        <View key={k} style={{ flex: 1 }} />
                                    ))
                                }
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
