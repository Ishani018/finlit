import { View, Dimensions } from 'react-native';

const { height: SH } = Dimensions.get('window');
const LINE_COUNT = Math.ceil(SH / 4);

// Subtle CRT scanline texture — dark horizontal lines at every 4px
// Renders ~200 thin strips; pointerEvents none so it never blocks taps
export default function CRTOverlay() {
    return (
        <View
            pointerEvents="none"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 997, opacity: 0.55 }}
        >
            {Array.from({ length: LINE_COUNT }).map((_, i) => (
                <View
                    key={i}
                    style={{ height: 1, backgroundColor: 'rgba(0,0,8,0.09)', marginBottom: 3 }}
                />
            ))}
        </View>
    );
}
