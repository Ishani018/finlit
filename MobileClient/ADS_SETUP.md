# Ads & Lucky Wheel (AdMob) — setup notes

This branch adds a **Lucky Wheel**. Watching a rewarded AdMob ad earns one spin (max 5 per day, see `src/config/ads.js`).

## What is in the box
- `src/components/SpinWheelScreen.js` — the wheel screen (opened from the Command Centre, DAILY LIFE → LUCKY WHEEL).
- `src/data/wheel.js` — prizes and their odds. Cash is small on purpose; every prize is a gift.
- `src/services/rewardedAd.js` — Android/iOS: Google AdMob via `react-native-google-mobile-ads`.
- `src/services/rewardedAd.web.js` — web build: a 3-second **simulated** ad (AdMob can't run in a browser).
- `src/config/ads.js` — ad unit IDs and the daily spin cap.
- `app.json` — the `react-native-google-mobile-ads` plugin with Google's **test** app IDs.

## Try it now
1. `npm install` (adds `react-native-google-mobile-ads`)
2. Ads are a native module, so use a development build, not Expo Go: `eas build --profile development --platform android`
   (Expo Go and the web build use the simulated ad, so you can still test the wheel).

## Before going live (after Play Console approval)
1. In AdMob, add the app and create a **Rewarded** ad unit.
2. Put the real **App ID** into `app.json` (`androidAppId`, `iosAppId`).
3. Put the real **Rewarded unit ID** into `src/config/ads.js` and set `USE_TEST_ADS = false`.
4. In Play Console: Data safety → declare that the app contains ads / uses an advertising ID.
5. Keep `requestNonPersonalizedAdsOnly` unless you add a consent (UMP) prompt; EU/UK users need consent for personalised ads.
