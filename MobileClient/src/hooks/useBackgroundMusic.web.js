import { useEffect, useState, useRef } from 'react';

// Require the audio files (Webpack/Metro will serve these on the web bundle)
const TRACKS = [
    require('../../assets/music/Crystalline_Caverns.mp3'),
    require('../../assets/music/Digital_Dawn.mp3'),
    require('../../assets/music/Pixel_Payouts.mp3'),
];

export const useBackgroundMusic = (isPlaying) => {
    const audioRef = useRef(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(
        Math.floor(Math.random() * TRACKS.length)
    );

    useEffect(() => {
        // Standard HTML5 Audio object (only works on Web, which is why this is in a .web.js file)
        const audio = new Audio(TRACKS[currentTrackIndex]);
        audioRef.current = audio;

        // Set volume a bit lower so it's truly background music
        audio.volume = 0.4;

        const handleEnded = () => {
            // 30% chance to swap tracks, 70% chance to loop
            if (Math.random() < 0.3) {
                let nextIndex;
                do {
                    nextIndex = Math.floor(Math.random() * TRACKS.length);
                } while (nextIndex === currentTrackIndex);
                setCurrentTrackIndex(nextIndex);
            } else {
                // Replay same track
                audio.currentTime = 0;
                audio.play().catch(e => console.log('Audio auto-play prevented by browser', e));
            }
        };

        audio.addEventListener('ended', handleEnded);

        // Initial play if state says we should be playing
        if (isPlaying) {
            audio.play().catch(e => {
                // Browsers block audio unless the user has clicked somewhere on the page first.
                console.log("Waiting for user interaction to start audio.");
            });
        }

        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
            audio.src = "";
            audioRef.current = null;
        };
    }, [currentTrackIndex]); // Re-run effect entirely when we change tracks

    // Listen to the game's isPlaying state explicitly
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.log("Awaiting user interaction."));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

};
