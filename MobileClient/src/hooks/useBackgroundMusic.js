// This is the native (Android/iOS) stub for background music.
// Because we are running the audio exclusively on the web environment right now 
// to prevent Expo-Go crashes, this hook does exactly nothing on physical phones.

export const useBackgroundMusic = (isPlaying) => {
    // No-op
};
