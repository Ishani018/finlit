import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';

const BORDER_COLOR = {
    info: '#2a3560', success: '#14532d', error: '#7f1d1d',
    warning: '#78350f', crisis: '#7f1d1d', positive: '#14532d',
};
const TITLE_BG = {
    info: '#0d1730', success: '#071a0e', error: '#1a0808',
    warning: '#1a0e00', crisis: '#1a0808', positive: '#071a0e',
};
const TITLE_COLOR = {
    info: '#60a5fa', success: '#4ade80', error: '#f87171',
    warning: '#fbbf24', crisis: '#f87171', positive: '#4ade80',
};
const CONFIRM_BG = {
    info: '#1d4ed8', success: '#166534', error: '#991b1b',
    warning: '#92400e', crisis: '#991b1b', positive: '#166534',
};

export default function PixelDialog({
    visible,
    title,
    message,
    type = 'info',
    onConfirm,
    onCancel,
    confirmText = 'OK',
    cancelText = null,
}) {
    const scaleAnim = useRef(new Animated.Value(0.88)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            scaleAnim.setValue(0.88);
            opacityAnim.setValue(0);
            Animated.parallel([
                Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 120, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;

    const borderColor = BORDER_COLOR[type] || BORDER_COLOR.info;
    const titleBg = TITLE_BG[type] || TITLE_BG.info;
    const titleColor = TITLE_COLOR[type] || TITLE_COLOR.info;
    const confirmBg = CONFIRM_BG[type] || CONFIRM_BG.info;

    return (
        // Absolute overlay — stays within the app container, not a full-window Modal
        <View
            style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 900,
                justifyContent: 'center', alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.72)',
            }}
            pointerEvents="box-none"
        >
            <Animated.View
                style={{
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }],
                    marginHorizontal: 24,
                    borderWidth: 2,
                    borderColor,
                    backgroundColor: '#071025',
                    maxWidth: 440,
                    width: '92%',
                    alignSelf: 'center',
                    overflow: 'hidden',
                    borderRadius: 16,
                    shadowColor: '#000',
                    shadowOpacity: 0.32,
                    shadowRadius: 18,
                    shadowOffset: { width: 0, height: 10 },
                    elevation: 10,
                }}
            >
                {/* Pixel corners */}
                <View style={{ position: 'absolute', top: 0, left: 0,   width: 6, height: 6, backgroundColor: borderColor, zIndex: 10 }} />
                <View style={{ position: 'absolute', top: 0, right: 0,  width: 6, height: 6, backgroundColor: borderColor, zIndex: 10 }} />
                <View style={{ position: 'absolute', bottom: 0, left: 0,  width: 6, height: 6, backgroundColor: borderColor, zIndex: 10 }} />
                <View style={{ position: 'absolute', bottom: 0, right: 0, width: 6, height: 6, backgroundColor: borderColor, zIndex: 10 }} />

                {/* Title bar */}
                <View style={{ backgroundColor: titleBg, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: titleColor, letterSpacing: 1 }}>
                        {title || 'NOTICE'}
                    </Text>
                </View>

                {/* Body */}
                <View style={{ padding: 18 }}>
                    <View style={{ backgroundColor: '#08112b', borderRadius: 12, padding: 16, marginBottom: 18 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#c8d4f0', lineHeight: 28 }}>
                            {message}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {cancelText && onCancel && (
                            <TouchableOpacity
                                onPress={onCancel}
                                style={{
                                    flex: 1, paddingVertical: 12, alignItems: 'center',
                                    backgroundColor: '#0f1428', borderWidth: 1, borderColor: '#1e2840', borderRadius: 10,
                                }}
                            >
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#6070a0', letterSpacing: 1 }}>
                                    {cancelText}
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={onConfirm}
                            style={{
                                flex: cancelText ? 1 : undefined,
                                width: cancelText ? undefined : '100%',
                                paddingVertical: 12, alignItems: 'center',
                                backgroundColor: confirmBg,
                                borderWidth: 1, borderColor,
                                borderRadius: 10,
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#fff', letterSpacing: 2 }}>
                                {confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
}
