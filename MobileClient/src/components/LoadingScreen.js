import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, Image } from 'react-native';

const C = {
    bg:     '#06080f',
    blue:   '#3b82f6',
};

export default function LoadingScreen({ text = "LOADING..." }) {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, [pulseAnim]);

    return (
        <View style={{
            flex: 1,
            backgroundColor: C.bg,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: 'center' }}>
                <Image 
                    source={require('../../assets/ui_comp/saveandearn.png')} 
                    style={{ width: 140, height: 140, resizeMode: 'contain', marginBottom: 24 }}
                />
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: C.blue, letterSpacing: 4 }}>
                    {text}
                </Text>
            </Animated.View>
        </View>
    );
}
