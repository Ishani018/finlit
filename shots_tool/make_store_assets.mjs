import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ROOT = '/Users/ishani/Desktop/finlit/itch_assets';
const RAW = '/Users/ishani/Desktop/finlit/shots_tool/raw';
const ASSETS = '/Users/ishani/Desktop/finlit/MobileClient/assets';

const DIR_FEATURED = path.join(ROOT, 'google_play', 'featured_graphic_1024x500');
const DIR_PHONE = path.join(ROOT, 'google_play', 'phone_screenshots_9_16');
const DIR_7INCH = path.join(ROOT, 'google_play', 'tablet_7inch_screenshots');
const DIR_10INCH = path.join(ROOT, 'google_play', 'tablet_10inch_screenshots');

[DIR_FEATURED, DIR_PHONE, DIR_7INCH, DIR_10INCH].forEach(d => fs.mkdirSync(d, { recursive: true }));

const toDataUri = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');

const phoneSlides = [
    {
        id: '1_welcome',
        badge: 'RETRO LIFE SIM',
        headline: 'START BROKE.<br><span style="color:#fbbf24">RETIRE RICH.</span>',
        sub: 'Start at age 18 with ₹50,000 in your pocket',
        accent: '#fbbf24',
        accentDark: '#1e1b4b',
        bg: 'radial-gradient(circle at 50% 15%, #4c1d95, #080718 80%)',
        rawShot: path.join(RAW, '01_entry.png')
    },
    {
        id: '2_personality',
        badge: '8 PLAYABLE ARCHETYPES',
        headline: 'PICK YOUR MONEY<br><span style="color:#34d399">SUPERPOWER.</span>',
        sub: 'Investor, Hustler, Landlord, Scholar & more',
        accent: '#34d399',
        accentDark: '#064e3b',
        bg: 'radial-gradient(circle at 50% 15%, #065f46, #04120e 80%)',
        rawShot: path.join(RAW, '02_select.png')
    },
    {
        id: '3_lifecycle',
        badge: 'DYNAMIC AGING',
        headline: 'WATCH YOURSELF<br><span style="color:#38bdf8">GROW UP.</span>',
        sub: 'Fresh graduate to relaxed silver-haired retiree',
        accent: '#38bdf8',
        accentDark: '#0c4a6e',
        bg: 'radial-gradient(circle at 50% 15%, #0284c7, #041525 80%)',
        rawShot: path.join(RAW, '03_profile.png')
    },
    {
        id: '4_daily_life',
        badge: 'MONTH-BY-MONTH DECISIONS',
        headline: 'SURVIVE ADULTING<br><span style="color:#fb923c">LEVEL 1.</span>',
        sub: 'Manage hunger, mental happiness, and real bills',
        accent: '#fb923c',
        accentDark: '#7c2d12',
        bg: 'radial-gradient(circle at 50% 15%, #ea580c, #160803 80%)',
        rawShot: path.join(RAW, '07_home.png')
    },
    {
        id: '5_careers',
        badge: 'LADDER TO SUCCESS',
        headline: 'GIGS, CAREERS &<br><span style="color:#f472b6">YOUR OWN BIZ.</span>',
        sub: 'Climb the corporate ladder or run your dream shop',
        accent: '#f472b6',
        accentDark: '#831843',
        bg: 'radial-gradient(circle at 50% 15%, #db2777, #1f0410 80%)',
        rawShot: path.join(RAW, '09_jobs.png')
    },
    {
        id: '6_investing',
        badge: 'COMPOUND WEALTH',
        headline: 'STOCKS, MUTUAL FUNDS<br><span style="color:#4ade80">& PPF SAVINGS.</span>',
        sub: 'Real market cycles: bull runs, dips & sideways phases',
        accent: '#4ade80',
        accentDark: '#14532d',
        bg: 'radial-gradient(circle at 50% 15%, #16a34a, #031408 80%)',
        rawShot: path.join(RAW, '11_invest.png')
    },
    {
        id: '7_banking',
        badge: 'SMART BORROWING',
        headline: 'CREDIT SCORES,<br><span style="color:#f87171">LOANS & EMIs.</span>',
        sub: 'Take education, home & business loans without default',
        accent: '#f87171',
        accentDark: '#7f1d1d',
        bg: 'radial-gradient(circle at 50% 15%, #dc2626, #180404 80%)',
        rawShot: path.join(RAW, '12_bank.png')
    },
    {
        id: '8_family',
        badge: 'LIFE HAPPENS',
        headline: 'MARRY, HAVE KIDS &<br><span style="color:#a78bfa">BUILD LEGACY.</span>',
        sub: 'Family events, surprise medical expenses & inheritance',
        accent: '#a78bfa',
        accentDark: '#4c1d95',
        bg: 'radial-gradient(circle at 50% 15%, #7c3aed, #0e0520 80%)',
        rawShot: path.join(RAW, '13_family.png')
    }
];

const b = await chromium.launch();

// 1. Featured Graphic: 1024 x 500
console.log('Rendering Featured Graphic (1024x500)...');
{
    const page = await b.newPage({ viewport: { width: 1024, height: 500 } });
    const iconUri = toDataUri(path.join(ASSETS, 'icon.png'));
    const phoneUri = toDataUri(path.join(RAW, '07_home.png'));
    const sprite1 = toDataUri(path.join(ASSETS, 'sprites', 'young_pia_1.png'));
    const sprite2 = toDataUri(path.join(ASSETS, 'sprites', 'young_raj_1.png'));
    const sprite3 = toDataUri(path.join(ASSETS, 'sprites', 'young_soms_1.png'));

    await page.setContent(`<!DOCTYPE html>
    <html>
    <head>
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0; width: 1024px; height: 500px; overflow: hidden;
        font-family: 'VT323', monospace; color: #fff;
        background: radial-gradient(circle at 35% 20%, #1e3a8a, #060914 85%);
        position: relative;
      }
      .grid {
        position: absolute; inset: 0;
        background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
        background-size: 36px 36px;
      }
      .brand-box {
        position: absolute; left: 45px; top: 40px; z-index: 10;
      }
      .badge {
        display: inline-block; padding: 4px 12px; background: rgba(251,191,36,0.18);
        border: 2px solid #fbbf24; border-radius: 8px;
        color: #fbbf24; font-size: 22px; letter-spacing: 3px; margin-bottom: 8px;
      }
      h1 {
        margin: 0; font-family: 'Press Start 2P', monospace; font-size: 52px;
        letter-spacing: 2px; line-height: 1.1; color: #ffffff;
        text-shadow: 4px 4px 0 #1e3a8a, 7px 7px 0 rgba(0,0,0,0.7);
      }
      .tagline {
        font-size: 34px; color: #fde047; letter-spacing: 2px; margin-top: 10px; line-height: 1;
      }
      .desc {
        font-size: 26px; color: #94a3b8; letter-spacing: 1px; margin-top: 10px; line-height: 1.15; max-width: 460px;
      }
      .badges-strip {
        position: absolute; left: 45px; bottom: 35px; display: flex; gap: 14px;
      }
      .pill {
        background: #0d1428; border: 1px solid #1e2e50; border-radius: 8px;
        padding: 5px 12px; font-size: 20px; color: #cbd5e1; letter-spacing: 2px;
      }
      .sprites-row {
        position: absolute; right: 290px; bottom: 0px; display: flex; align-items: flex-end; gap: -30px; z-index: 5;
      }
      .sprites-row img {
        height: 340px; margin-right: -45px; filter: drop-shadow(0 10px 14px rgba(0,0,0,0.6));
      }
      .phone-mock {
        position: absolute; right: 25px; top: 30px; height: 490px; width: 255px;
        border-radius: 34px; border: 4px solid #fbbf24; overflow: hidden;
        box-shadow: 0 25px 45px rgba(0,0,0,0.85); transform: rotate(4deg); z-index: 8;
        background: #000;
      }
      .phone-mock img { width: 100%; height: 100%; object-fit: cover; }
    </style>
    </head>
    <body>
      <div class="grid"></div>
      <div class="brand-box">
        <div class="badge">FINANCIAL LITERACY RPG</div>
        <h1>FINLIT</h1>
        <div class="tagline">START AT 18. RETIRE AT 58.</div>
        <div class="desc">The pixel-art life simulator that turns budgeting, stock investing, mortgages and career hustle into pure fun.</div>
      </div>
      <div class="badges-strip">
        <div class="pill">★ 100% FREE</div>
        <div class="pill">★ RETRO PIXEL ART</div>
        <div class="pill">★ STOCKS · LOANS · CA</div>
      </div>
      <div class="sprites-row">
        <img src="${sprite1}">
        <img src="${sprite2}">
        <img src="${sprite3}">
      </div>
      <div class="phone-mock">
        <img src="${phoneUri}">
      </div>
    </body>
    </html>`);
    await page.waitForTimeout(1000);
    const outPath = path.join(DIR_FEATURED, 'featured_graphic_1024x500.png');
    await page.screenshot({ path: outPath });
    console.log('Saved:', outPath);
    await page.close();
}

// Helper template for 9:16 screenshots
async function renderMockupBatch({ targetDir, width, height, isTablet = false }) {
    for (let i = 0; i < phoneSlides.length; i++) {
        const s = phoneSlides[i];
        const page = await b.newPage({ viewport: { width, height } });
        const shotUri = toDataUri(s.rawShot);
        
        const padX = Math.round(width * 0.08);
        const topH = Math.round(height * 0.28);
        const phoneW = Math.round(width * (isTablet ? 0.62 : 0.84));
        const phoneH = Math.round(phoneW * 2.0);
        const phoneRadius = Math.round(phoneW * 0.11);
        const borderW = Math.max(3, Math.round(width * 0.005));

        await page.setContent(`<!DOCTYPE html>
        <html>
        <head>
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0; width: ${width}px; height: ${height}px; overflow: hidden;
            font-family: 'VT323', monospace; color: #fff;
            background: ${s.bg};
            position: relative; display: flex; flex-direction: column; align-items: center;
          }
          .grid {
            position: absolute; inset: 0;
            background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
            background-size: ${Math.round(width * 0.045)}px ${Math.round(width * 0.045)}px;
          }
          .top-content {
            width: 100%; height: ${topH}px; padding: ${Math.round(height * 0.04)}px ${padX}px 0;
            text-align: center; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center;
          }
          .badge {
            display: inline-block; padding: 4px 14px;
            background: rgba(255,255,255,0.08); border: 1px solid ${s.accent};
            border-radius: 999px; color: ${s.accent}; font-size: ${Math.round(width * 0.032)}px;
            letter-spacing: 4px; margin-bottom: ${Math.round(height * 0.012)}px;
          }
          h1 {
            margin: 0; font-family: 'Press Start 2P', monospace;
            font-size: ${Math.round(width * (isTablet ? 0.042 : 0.052))}px;
            line-height: 1.35; letter-spacing: 1px; color: #ffffff;
            text-shadow: 4px 4px 0 ${s.accentDark}, 8px 8px 0 rgba(0,0,0,0.7);
          }
          .sub {
            font-size: ${Math.round(width * 0.038)}px; color: #cbd5e1;
            letter-spacing: 2px; margin-top: ${Math.round(height * 0.012)}px;
          }
          .phone-container {
            position: absolute; top: ${topH}px; bottom: -80px; width: 100%;
            display: flex; justify-content: center; z-index: 8;
          }
          .phone-device {
            width: ${phoneW}px; height: ${phoneH}px;
            background: #06080f; border-radius: ${phoneRadius}px;
            border: ${borderW}px solid ${s.accent};
            overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.85);
          }
          .phone-device img { width: 100%; height: 100%; object-fit: cover; }
        </style>
        </head>
        <body>
          <div class="grid"></div>
          <div class="top-content">
            <div class="badge">${s.badge}</div>
            <h1>${s.headline}</h1>
            <div class="sub">${s.sub}</div>
          </div>
          <div class="phone-container">
            <div class="phone-device">
              <img src="${shotUri}">
            </div>
          </div>
        </body>
        </html>`);

        await page.waitForTimeout(600);
        const filename = `${i + 1}_${s.id}.png`;
        const outPath = path.join(targetDir, filename);
        await page.screenshot({ path: outPath });
        console.log(`Saved [${width}x${height}]: ${filename}`);
        await page.close();
    }
}

// 2. Phone Screenshots: 1080 x 1920 (9:16)
console.log('\n--- Generating Phone Screenshots (1080x1920, 9:16) ---');
await renderMockupBatch({ targetDir: DIR_PHONE, width: 1080, height: 1920, isTablet: false });

// 3. 7-inch Tablet Screenshots: 1200 x 1920 (approx 16:10 / 9:16 compliant - 1080x1920)
console.log('\n--- Generating 7-inch Tablet Screenshots (1080x1920, 9:16) ---');
await renderMockupBatch({ targetDir: DIR_7INCH, width: 1080, height: 1920, isTablet: true });

// 4. 10-inch Tablet Screenshots: 1620 x 2880 (9:16 high-res, between 1080 & 7680)
console.log('\n--- Generating 10-inch Tablet Screenshots (1620x2880, 9:16) ---');
await renderMockupBatch({ targetDir: DIR_10INCH, width: 1620, height: 2880, isTablet: true });

await b.close();
console.log('\nAll Google Play Console graphics & screenshot suites generated successfully!');
