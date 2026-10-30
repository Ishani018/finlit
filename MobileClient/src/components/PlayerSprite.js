import React from 'react';
import { View, Image } from 'react-native';
import { layersFor } from '../data/accessories';

// A sprite plus whatever the player is wearing. The box takes the sprite's own
// aspect ratio so overlays (stored as % of that box) always line up.
export default function PlayerSprite({ source, spriteId, age = 18, look, style, resizeMode = 'contain' }) {
    const { layers, ratio } = layersFor(spriteId, age, look);
    if (!layers.length || !ratio) return <Image source={source} style={style} resizeMode={resizeMode} />;

    // Outer view sizes like the original Image; inner box matches the sprite's aspect and is centred (contain).
    return (
        <View style={[style, { alignItems: 'center', justifyContent: 'center' }]}>
            <View style={{ height: '100%', aspectRatio: ratio, maxWidth: '100%' }}>
                <Image source={source} style={{ width: '100%', height: '100%' }} resizeMode="stretch" />
                {layers.map((l, i) => (
                    <Image key={i} source={l.src} resizeMode="stretch"
                        style={{ position: 'absolute', left: `${l.l}%`, top: `${l.t}%`, width: `${l.w}%`, height: `${l.h}%` }} />
                ))}
            </View>
        </View>
    );
}
