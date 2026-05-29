import { useEffect, useRef } from 'react';

// Module-level singleton — only one Audio element ever lives at a time
let _audio = null;

function stopCurrent() {
    if (_audio) {
        _audio.pause();
        _audio.src = '';
        _audio = null;
    }
}

function playTrack(tracks, index, onFinished) {
    stopCurrent();
    const audio = new Audio(tracks[index]);
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
