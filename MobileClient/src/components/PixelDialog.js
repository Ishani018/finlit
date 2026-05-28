import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Image } from 'react-native';

const TYPE = {
    info:     { accent: '#3b82f6', confirmBg: '#1d4ed8', confirmBorder: '#2563eb' },
    success:  { accent: '#4ade80', confirmBg: '#166534', confirmBorder: '#22c55e' },
    error:    { accent: '#f87171', confirmBg: '#7f1d1d', confirmBorder: '#ef4444' },
    warning:  { accent: '#fbbf24', confirmBg: '#92400e', confirmBorder: '#f59e0b' },
    crisis:   { accent: '#f87171', confirmBg: '#7f1d1d', confirmBorder: '#ef4444' },
    positive: { accent: '#4ade80', confirmBg: '#166534', confirmBorder: '#22c55e' },
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
    image = null,
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

    const t = TYPE[type] || TYPE.info;

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 900, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.75)' }} pointerEvents="auto">
            <Animated.View style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }], width: '90%', maxWidth: 400, alignSelf: 'center', marginTop: image?.isSprite ? 50 : 0 }}>

                {/* Floating sprite avatar */}
                {image?.isSprite && (
                    <View style={{ position: 'absolute', top: -52, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
                        <View style={{ width: 104, height: 104, borderRadius: 52, backgroundColor: '#0a0f1e', borderWidth: 2, borderColor: t.accent + '60', overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8 }}>
                            <Image source={image.source} style={{ width: 104 * (image.scale || 1.6), height: 104 * (image.scale || 1.6) }} resizeMode="contain" />
                        </View>
                    </View>
                )}

                <View style={{ backgroundColor: '#08101e', borderRadius: 12, overflow: 'hidden' }}>

                    {/* Banner image — full pixel art scene */}
                    {image?.source && !image?.isSprite && !image?.icon && (
                        <Image source={image.source} style={{ width: '100%', height: 300 }} resizeMode="cover" />
                    )}
                    {/* Icon image — small, centred on dark bg */}
                    {image?.source && !image?.isSprite && image?.icon && (
                        <View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 4, backgroundColor: '#060a14' }}>
                            <Image source={image.source} style={{ width: 64, height: 64, opacity: 0.9 }} resizeMode="contain" />
                        </View>
                    )}
                    {image && (typeof image === 'number' || typeof image === 'string') && (
                        <View style={{ alignItems: 'center', paddingTop: 20 }}>
                            <Image source={typeof image === 'string' ? { uri: image } : image} style={{ width: 90, height: 90 }} resizeMode="contain" />
                        </View>
                    )}

                    {/* Title — strip emoji, no divider */}
                    <View style={{ paddingHorizontal: 20, paddingTop: image?.isSprite ? 58 : image?.icon ? 10 : 20, paddingBottom: 2 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: t.accent, letterSpacing: 1, textAlign: 'center' }}>
                            {typeof title === 'string' ? title.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '').trim() : title || 'NOTICE'}
                        </Text>
                    </View>

                    {/* Message */}
                    <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 }}>
                        {typeof message === 'string' ? (
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#6070a0', lineHeight: 24, textAlign: 'center', marginBottom: 20 }}>
                                {message}
                            </Text>
                        ) : (
                            <View style={{ marginBottom: 20 }}>{message}</View>
                        )}

                        {/* Buttons */}
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            {cancelText && onCancel && (
                                <TouchableOpacity onPress={onCancel} style={{ flex: 1, paddingVertical: 13, alignItems: 'center', backgroundColor: '#0d1428', borderRadius: 8 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#445070', letterSpacing: 1 }}>{cancelText}</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={onConfirm}
                                activeOpacity={0.8}
                                style={{ flex: 1, paddingVertical: 13, alignItems: 'center', backgroundColor: t.confirmBg, borderRadius: 8 }}
                            >
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#fff', letterSpacing: 2 }}>{confirmText}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
}
