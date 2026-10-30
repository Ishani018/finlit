import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, Image } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const COIN_IMG = require('../../assets/ui_comp/nextbutton.png');
const CONTROL_IMG = require('../../assets/ui_comp/menu_dashboard.png');

const TAB_ICONS = {
    home:    require('../../assets/ui_comp/home.png'),
    career:  require('../../assets/ui_comp/career.png'),
    money:   require('../../assets/ui_comp/investicon.png'),
    family:  require('../../assets/ui_comp/familyicon.png'),
    grocery: require('../../assets/ui_comp/groceryshop.png'),
    goals:   require('../../assets/ui_comp/achivements.png'),
};

const TABS = [
    { key: 'home',   label: 'HOME',   color: '#38b2ac' },
    { key: 'career', label: 'CAREER', color: '#fbbf24' },
    { key: 'next',   isCenter: true },
    { key: 'money',  label: 'MONEY',  color: '#4ade80' },
    { key: 'family', label: 'FAMILY', color: '#ec4899' },
];

const ALT_TABS = [
    { key: 'home',    label: 'HOME',    color: '#38b2ac' },
    { key: 'career',  label: 'CAREER',  color: '#fbbf24' },
    { key: 'money',   label: 'MONEY',   color: '#4ade80' },
    { key: 'family',  label: 'FAMILY',  color: '#ec4899' },
    { key: 'goals',   label: 'GOALS',   color: '#fbbf24',  isGoals: true },
];

export const DOCK_H = 58;
export const TABS_H = 62;
export const TAB_STACK_H = DOCK_H + TABS_H;
const R = 28;
const CIRC = 2 * Math.PI * R;

function TurnsRing({ turnsLeft, dailyLimit }) {
    const fraction = dailyLimit > 0 ? turnsLeft / dailyLimit : 0;
    const isFull = fraction >= 1;
    const dash = isFull ? CIRC : fraction * CIRC;
    const ringColor = turnsLeft <= 1 ? '#f87171' : turnsLeft <= 3 ? '#fb923c' : '#fbbf24';
    return (
        <Svg width={64} height={64} style={{ position: 'absolute' }}>
            <Circle cx={32} cy={32} r={R} stroke="#1a2040" strokeWidth={3} fill="none" />
            <Circle
                cx={32} cy={32} r={R}
                stroke={ringColor}
                strokeWidth={3}
                fill="none"
                strokeDasharray={`${dash} ${CIRC}`}
                strokeDashoffset={CIRC / 4}
                strokeLinecap={isFull ? 'butt' : 'round'}
            />
        </Svg>
    );
}

export default function BottomTabBar({
    activeTab, onTabPress,
    onNextMonth, expectedNet, monthLabel, onHub, hubTodo,
    turnsLeft, dailyLimit,
    onGrocery,
    onGoals,
    showGrocery,
    showGoals,
    badges = {},
}) {
    const btnScale  = useRef(new Animated.Value(1)).current;
    const rippleScale = useRef(new Animated.Value(1)).current;
    const rippleOpacity = useRef(new Animated.Value(0)).current;

    const handleNextMonth = useCallback(() => {
        Animated.sequence([
            Animated.timing(btnScale, { toValue: 0.82, duration: 80, useNativeDriver: true }),
            Animated.spring(btnScale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }),
        ]).start();
        rippleScale.setValue(1);
        rippleOpacity.setValue(0.6);
        Animated.parallel([
            Animated.timing(rippleScale,   { toValue: 2.0, duration: 500, useNativeDriver: true }),
            Animated.timing(rippleOpacity, { toValue: 0,   duration: 500, useNativeDriver: true }),
        ]).start();
        onNextMonth();
    }, [onNextMonth]);

    const renderTab = (tab, isActive, onPress, badge) => (
        <TouchableOpacity
            key={tab.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 4, position: 'relative' }}
        >
            {isActive && (
                <View style={{ position: 'absolute', top: 0, left: 8, right: 8, height: 2, backgroundColor: tab.color }} />
            )}
            <Image source={TAB_ICONS[tab.key]} style={{ width: 30, height: 30 }} resizeMode="contain" />
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: isActive ? tab.color : '#2a3560', letterSpacing: 1, marginTop: 3, lineHeight: 12 }}>
                {tab.label}
            </Text>
            {badge && (
                <View style={{
                    position: 'absolute', top: 5, right: '20%',
                    minWidth: typeof badge === 'number' ? 14 : 8,
                    height: typeof badge === 'number' ? 14 : 8,
                    borderRadius: typeof badge === 'number' ? 7 : 4,
                    backgroundColor: '#f87171',
                    alignItems: 'center', justifyContent: 'center',
                    paddingHorizontal: typeof badge === 'number' ? 2 : 0,
                    borderWidth: 1, borderColor: '#070910',
                }}>
                    {typeof badge === 'number' && (
                        <Text style={{ fontSize: 8, color: '#fff', fontWeight: 'bold' }}>{badge > 9 ? '9+' : badge}</Text>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );

    const dockBar = onNextMonth ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0a0d1a', borderTopWidth: 1, borderColor: '#1a2040', paddingHorizontal: 14, height: DOCK_H }}>
            <TouchableOpacity onPress={onHub} activeOpacity={0.8} disabled={!onHub} style={{ width: 52, height: 42, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={onHub ? CONTROL_IMG : COIN_IMG} style={{ width: 52, height: 40 }} resizeMode="contain" />
                {hubTodo > 0 && (
                    <View style={{ position: 'absolute', top: -4, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#f87171', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: '#0a0d1a' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#fff', lineHeight: 14 }}>{hubTodo}</Text>
                    </View>
                )}
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#7d8ab0', lineHeight: 15 }}>Expected this month</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: (expectedNet || 0) >= 0 ? '#4ade80' : '#f87171', lineHeight: 20 }}>
                    {(expectedNet || 0) >= 0 ? '+' : '−'}₹{Math.abs(Math.round(expectedNet || 0)).toLocaleString()}
                </Text>
            </View>
            <TouchableOpacity onPress={handleNextMonth} activeOpacity={0.85}
                style={{ paddingHorizontal: 18, height: 42, borderRadius: 10, backgroundColor: '#fbbf24', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#2a1c00', letterSpacing: 2 }}>{monthLabel || 'END MONTH ›'}</Text>
            </TouchableOpacity>
        </View>
    ) : null;

    return (
        <View>
            {dockBar}
            <View style={{ flexDirection: 'row', backgroundColor: '#090c18', height: TABS_H, alignItems: 'stretch' }}>
                {ALT_TABS.map(tab => {
                    const isActive = tab.isGoals ? showGoals : (!showGoals && tab.key === activeTab);
                    const onPress = tab.isGoals ? onGoals : () => onTabPress(tab.key);
                    return renderTab(tab, isActive, onPress, badges[tab.key]);
                })}
            </View>
        </View>
    );
}
