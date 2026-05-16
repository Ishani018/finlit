import { View } from 'react-native';

export default function Corners({ color = '#3b82f6', size = 6 }) {
    return (
        <>
            <View style={{ position: 'absolute', top: 0, left: 0,    width: size, height: size, backgroundColor: color }} />
            <View style={{ position: 'absolute', top: 0, right: 0,   width: size, height: size, backgroundColor: color }} />
            <View style={{ position: 'absolute', bottom: 0, left: 0,  width: size, height: size, backgroundColor: color }} />
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: size, height: size, backgroundColor: color }} />
        </>
    );
}
