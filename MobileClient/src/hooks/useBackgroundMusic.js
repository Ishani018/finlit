import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

let _sound = null;
let _loading = false;

async function stopCurrent() {
    if (_sound) {
        try { await _sound.stopAsync(); } catch (_) {}
        try { await _sound.unloadAsync(); } catch (_) {}
        _sound = null;
    }
}

async function playTrack(tracks, index, onFinished) {
    if (_loading) return;
    _loading = true;
    await stopCurrent();
    try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
        const { sound } = await Audio.Sound.createAsync(
            tracks[index],
            { shouldPlay: true, isLooping: false, volume: 0.35 }
        );
        _sound = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
                setTimeout(() => onFinished(), 1500);
            }
        });
    } catch (e) {
        console.warn('Music error:', e);
    } finally {
        _loading = false;
    }
}

export const useBackgroundMusic = (tracks) => {
    const trackIndex = useRef(Math.floor(Math.random() * tracks.length));

    const advance = () => {
        let next;
        do { next = Math.floor(Math.random() * tracks.length); }
        while (next === trackIndex.current && tracks.length > 1);
        trackIndex.current = next;
        playTrack(tracks, next, advance);
    };

    useEffect(() => {
        playTrack(tracks, trackIndex.current, advance);
        return () => { stopCurrent(); };
    }, []);
};
