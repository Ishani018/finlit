// AdMob settings. The IDs below are Google's public TEST IDs, so ads can be tried safely.
// Before the Play Store release: create the app + a Rewarded ad unit in AdMob, then paste the real
// values here AND in app.json (react-native-google-mobile-ads -> androidAppId / iosAppId), and set USE_TEST_ADS to false.
export const USE_TEST_ADS = true;

export const ADS_ENABLED = true;          // master switch: false hides the wheel's ad step entirely
export const MAX_SPINS_PER_DAY = 5;       // one rewarded ad = one spin; keeps the in-game economy steady

export const REWARDED_UNIT_IDS = {
    // Google's sample rewarded unit (Android / iOS)
    android: USE_TEST_ADS ? 'ca-app-pub-3940256099942544/5224354917' : 'ca-app-pub-REPLACE_ME/REPLACE_ME',
    ios:     USE_TEST_ADS ? 'ca-app-pub-3940256099942544/1712485313' : 'ca-app-pub-REPLACE_ME/REPLACE_ME',
};
