// Web build (itch.io etc.): AdMob does not run in a browser, so this plays a short simulated ad.
// The wheel screen shows the countdown; resolving { rewarded: true } is what unlocks the spin.
export const AD_IS_SIMULATED = true;
export const SIMULATED_AD_SECONDS = 3;

export async function initAds() { return true; }

export function showRewardedAd() {
    return new Promise(resolve => setTimeout(() => resolve({ rewarded: true, simulated: true }), SIMULATED_AD_SECONDS * 1000));
}
