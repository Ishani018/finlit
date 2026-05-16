import { useEffect, useRef } from 'react';

const TRACKS = [
    require('../../assets/music/Crystalline_Caverns.mp3'),
    require('../../assets/music/Digital_Dawn.mp3'),
    require('../../assets/music/Pixel_Payouts.mp3'),
];

// Module-level singleton — only one Audio element ever lives at a time
let _audio = null;

function stopCurrent() {
    if (_audio) {
        _audio.pause();
        _audio.src = '';
        _audio = null;
    }
}

function playTrack(index, onFinished) {
    stopCurrent();
    const audio = new Audio(TRACKS[index]);
    audio.volume = 0.35;
    _audio = audio;
    audio.addEventListener('ended', onFinished, { once: true });
    audio.play().catch(() => {
        const start = () => {
            audio.play().catch(() => {});
            document.removeEventListener('click', start);
            document.removeEventListener('touchstart', start);
        };
        document.addEventListener('click', start, { once: true });
        document.addEventListener('touchstart', start, { once: true });
    });
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
