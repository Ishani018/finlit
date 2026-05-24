import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

const TRACKS = [
    require('../../assets/music/Crystalline_Caverns.mp3'),
    require('../../assets/music/Digital_Dawn.mp3'),
    require('../../assets/music/Pixel_Payouts.mp3'),
];

// Module-level singleton — only one Sound ever lives at a time
let _sound = null;
let _loading = false;

async function stopCurrent() {
    if (_sound) {
        try { await _sound.stopAsync(); } catch (_) {}
        try { await _sound.unloadAsync(); } catch (_) {}
        _sound = null;
    }
}

async function playTrack(index, onFinished) {
    if (_loading) return;
    _loading = true;
    await stopCurrent();
    try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
        const { sound } = await Audio.Sound.createAsync(
            TRACKS[index],
            { shouldPlay: true, isLooping: false, volume: 0.35 }
        );
        _sound = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
                // 1.5s gap between tracks so it doesn't feel abrupt
                setTimeout(() => onFinished(), 1500);
            }
        });
    } catch (e) {
        console.warn('Music error:', e);
    } finally {
        _loading = false;
    }
}

export const useBackgroundMusic = () => {
    const trackIndex = useRef(Math.floor(Math.random() * TRACKS.length));

    const advance = () => {
        let next;
        do { next = Math.floor(Math.random() * TRACKS.length); }
        while (next === trackIndex.current && TRACKS.length > 1);
        trackIndex.current = next;
        playTrack(next, advance);
    };

    useEffect(() => {
        playTrack(trackIndex.current, advance);
        return () => { stopCurrent(); };
    }, []);
};
