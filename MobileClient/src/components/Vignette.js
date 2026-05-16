import { View } from 'react-native';

// Layered border vignette — darkens screen edges for depth
export default function Vignette() {
    return (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }}>
            <View style={{ flex: 1, borderWidth: 40, borderColor: 'rgba(4,6,13,0.38)', borderTopWidth: 24, borderBottomWidth: 24 }}>
                <View style={{ flex: 1, borderWidth: 22, borderColor: 'rgba(4,6,13,0.16)', borderTopWidth: 12, borderBottomWidth: 12 }}>
                    <View style={{ flex: 1, borderWidth: 12, borderColor: 'rgba(4,6,13,0.07)' }} />
                </View>
            </View>
        </View>
    );
}
