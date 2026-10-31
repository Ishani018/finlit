// Android / iOS: Google AdMob rewarded ads via react-native-google-mobile-ads.
// Needs a development / production build (it is a native module). In Expo Go the module is missing, so we fall back to a
// short simulated ad and the rest of the game keeps working.
import { Platform } from 'react-native';
import { REWARDED_UNIT_IDS } from '../config/ads';

let Ads = null;
try { Ads = require('react-native-google-mobile-ads'); } catch (e) { Ads = null; }

export const AD_IS_SIMULATED = !Ads;
export const SIMULATED_AD_SECONDS = 3;

let started = false;
export async function initAds() {
    if (!Ads || started) return !!Ads;
    started = true;
    try { await Ads.default().initialize(); } catch (e) { /* ads just won't fill */ }
    return true;
}

// Resolves { rewarded: true } once the viewer earned the reward, { rewarded: false, error } otherwise.
export function showRewardedAd() {
    if (!Ads) return new Promise(resolve => setTimeout(() => resolve({ rewarded: true, simulated: true }), SIMULATED_AD_SECONDS * 1000));
    const { RewardedAd, RewardedAdEventType, AdEventType } = Ads;
    const unitId = Platform.OS === 'ios' ? REWARDED_UNIT_IDS.ios : REWARDED_UNIT_IDS.android;
    return new Promise(resolve => {
        let earned = false, done = false;
        const finish = (r) => { if (done) return; done = true; unsub.forEach(u => u()); resolve(r); };
        const ad = RewardedAd.createForAdRequest(unitId, { requestNonPersonalizedAdsOnly: true });
        const unsub = [
            ad.addAdEventListener(RewardedAdEventType.LOADED, () => ad.show().catch(e => finish({ rewarded: false, error: String(e) }))),
            ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => { earned = true; }),
            ad.addAdEventListener(AdEventType.CLOSED, () => finish({ rewarded: earned, error: earned ? undefined : 'closed early' })),
            ad.addAdEventListener(AdEventType.ERROR, (e) => finish({ rewarded: false, error: (e && e.message) || 'no ad available' })),
        ];
        ad.load();
        setTimeout(() => finish({ rewarded: false, error: 'timed out loading an ad' }), 20000);
    });
}
