import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const A = '/Users/ishani/Desktop/finlit/MobileClient/assets';
const R = '/Users/ishani/Desktop/finlit/shots_tool/raw';
const outDir = '/Users/ishani/Desktop/finlit/itch_assets/square_posters';
fs.mkdirSync(outDir, { recursive: true });

const f = p => 'file://' + p.replace(/ /g, '%20');

const baseCss = `
@import url('https://fonts.googleapis.com/css2?family=VT323&family=Press+Start+2P&display=swap');
* { box-sizing: border-box; }
body {
  margin: 0; width: 1080px; height: 1080px; overflow: hidden;
  font-family: 'VT323', monospace; color: #fff; position: relative;
}
.bg { position: absolute; inset: 0; }
.grid {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,0.035) 1.5px, transparent 1.5px),
                    linear-gradient(90deg, rgba(255,255,255,0.035) 1.5px, transparent 1.5px);
  background-size: 40px 40px;
}
.pill {
  display: inline-block; padding: 4px 14px; border-radius: 999px;
  font-size: 24px; letter-spacing: 4px;
}
h1 {
  margin: 0; font-family: 'Press Start 2P', monospace;
  font-weight: 400; line-height: 1.25;
}
.foot {
  position: absolute; bottom: 28px; left: 0; right: 0;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 45px; z-index: 20;
}
.foot .title { font-family: 'Press Start 2P', monospace; font-size: 26px; color: #fff; letter-spacing: 2px; }
.foot .sub { font-size: 28px; color: #94a3b8; letter-spacing: 3px; }
.card {
  border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(0,0,0,0.65);
}
.card img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const posters = {
  // 1. Core Hero: Bold tagline + character cast
  '1_start_broke_square': () => `
    <div class="bg" style="background: radial-gradient(circle at 50% 25%, #4c1d95, #080614 75%);"></div>
    <div class="grid"></div>
    <div style="position: absolute; top: 45px; left: 45px; z-index: 10;">
      <span class="pill" style="border: 2px solid #fbbf24; color: #fbbf24; background: rgba(251,191,36,0.12);">₹50,000 · AGE 18</span>
      <h1 style="font-size: 42px; margin-top: 14px; text-shadow: 4px 4px 0 #7c3aed;">START BROKE.<br><span style="color:#fbbf24; text-shadow: 4px 4px 0 #b45309;">RETIRE LEGEND.</span></h1>
    </div>
    <div style="position: absolute; bottom: 85px; left: 0; right: 0; display: flex; justify-content: center; z-index: 5;">
      ${['young_pia_1','young_raj_1','young_soms_1','young_soni_1','young_sia_1','young_rahul_1'].map((s, i) => `
        <img src="${f(A+'/sprites/'+s+'.png')}" style="height: ${i % 2 === 0 ? 560 : 510}px; margin: 0 -22px; filter: drop-shadow(0 12px 16px rgba(0,0,0,0.7));">
      `).join('')}
    </div>
    <div class="foot">
      <div class="title">FINLIT</div>
      <div class="sub">FREE FINANCIAL LIFE SIM · ITCH.IO</div>
    </div>
  `,

  // 2. Lifecycle: 4 life stages
  '2_aging_lifecycle_square': () => `
    <div class="bg" style="background: linear-gradient(180deg, #0e7490 0%, #1e3a8a 60%, #0a0e24 100%);"></div>
    <div class="grid"></div>
    <div style="position: absolute; top: 45px; left: 0; right: 0; text-align: center; z-index: 10;">
      <span class="pill" style="border: 2px solid #38bdf8; color: #38bdf8; background: rgba(56,189,248,0.12);">DYNAMIC AGING ENGINE</span>
      <h1 style="font-size: 38px; margin-top: 12px; text-shadow: 4px 4px 0 #0c4a6e;">LIVE THE WHOLE<br><span style="color:#fde047; text-shadow: 4px 4px 0 #854d0e;">DAMN LIFE</span></h1>
    </div>
    <div style="position: absolute; top: 320px; left: 30px; right: 30px; display: flex; justify-content: space-around; align-items: flex-end; z-index: 5;">
      ${[['young_pia_1','AGE 18'],['pia_25-30','AGE 25'],['pia_middleage','AGE 40'],['pia_50plus','AGE 55']].map(([s, a], i) => `
        <div style="text-align: center;">
          <img src="${f(A+'/sprites/'+s+'.png')}" style="height: ${440 + i * 25}px; filter: drop-shadow(0 14px 18px rgba(0,0,0,0.6));">
          <div style="font-size: 40px; color: #fde047; margin-top: 6px; letter-spacing: 2px;">${a}</div>
        </div>
      `).join('')}
    </div>
    <div class="foot">
      <div class="title">FINLIT</div>
      <div class="sub">18 → 58 · ONE MONTH AT A TIME</div>
    </div>
  `,

  // 3. Real Estate Showcase
  '3_real_estate_square': () => `
    <div class="bg" style="background: radial-gradient(circle at 50% 20%, #be185d, #1a0512 80%);"></div>
    <div class="grid"></div>
    <div style="position: absolute; top: 40px; left: 45px; z-index: 10;">
      <span class="pill" style="border: 2px solid #f472b6; color: #f472b6; background: rgba(244,114,182,0.12);">PROPERTY & MORTGAGES</span>
      <h1 style="font-size: 38px; margin-top: 12px; text-shadow: 4px 4px 0 #831843;">BUY THE <span style="color:#fde68a; text-shadow: 4px 4px 0 #92400e;">DREAM</span> HOME</h1>
    </div>
    <div style="position: absolute; top: 220px; left: 45px; right: 45px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; z-index: 5;">
      ${[
        ['studio_apartment', 'Starter Studio', '₹15L'],
        ['family_bunglow_with_pool_and_backyard', 'Family Bungalow', '₹1.2Cr'],
        ['Beach_house_for_family_of_4-5', 'Beach Villa', '₹2.8Cr'],
        ['fully_furnish_villa_with_movie_theatre', 'Luxury Penthouse', '₹5.5Cr']
      ].map(([img, name, price]) => `
        <div class="card" style="height: 350px; border: 4px solid #f472b6; position: relative;">
          <img src="${f(A+'/properties/'+img+'.png')}">
          <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(10,5,18,0.85); padding: 8px 14px; display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #f472b6;">
            <span style="font-size: 26px; color: #fff;">${name}</span>
            <span style="font-size: 28px; color: #fde68a;">${price}</span>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="foot">
      <div class="title">FINLIT</div>
      <div class="sub">FLIP HOUSES OR COLLECT RENT</div>
    </div>
  `,

  // 4. Hustle & Careers + App Device
  '4_careers_invest_square': () => `
    <div class="bg" style="background: radial-gradient(circle at 40% 25%, #15803d, #031407 80%);"></div>
    <div class="grid"></div>
    <div style="position: absolute; top: 40px; left: 45px; z-index: 10;">
      <span class="pill" style="border: 2px solid #4ade80; color: #4ade80; background: rgba(74,222,128,0.12);">CAREERS & INVESTMENTS</span>
      <h1 style="font-size: 38px; margin-top: 12px; text-shadow: 4px 4px 0 #14532d;">HUSTLE. INVEST.<br><span style="color:#fde047; text-shadow: 4px 4px 0 #854d0e;">REPEAT.</span></h1>
    </div>
    <div style="position: absolute; top: 220px; left: 45px; right: 45px; display: flex; gap: 24px; z-index: 5;">
      <div style="width: 440px; height: 750px; border-radius: 36px; border: 5px solid #4ade80; overflow: hidden; box-shadow: 0 20px 45px rgba(0,0,0,0.8); background: #000;">
        <img src="${f(R+'/11_invest.png')}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
      <div style="flex: 1; display: flex; flex-direction: column; gap: 16px;">
        ${[
          ['SDE', 'SOFTWARE ENGINEER', '₹85,000/mo'],
          ['CEO', 'TECH FOUNDER', '₹3,50,000/mo'],
          ['law_firm', 'PARTNER ATTORNEY', '₹2,20,000/mo']
        ].map(([img, title, pay]) => `
          <div class="card" style="height: 238px; border: 4px solid #86efac; position: relative;">
            <img src="${f(A+'/jobs/'+img+'.png')}">
            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(4,18,8,0.85); padding: 8px 12px; display: flex; justify-content: space-between; border-top: 2px solid #86efac;">
              <span style="font-size: 24px; color: #fff;">${title}</span>
              <span style="font-size: 26px; color: #4ade80;">${pay}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="foot">
      <div class="title">FINLIT</div>
      <div class="sub">MAKE MONEY WORK HARDER THAN YOU</div>
    </div>
  `,

  // 5. 8 Money Archetypes Grid
  '5_archetypes_grid_square': () => `
    <div class="bg" style="background: radial-gradient(circle at 50% 20%, #b45309, #170b02 80%);"></div>
    <div class="grid"></div>
    <div style="position: absolute; top: 35px; left: 0; right: 0; text-align: center; z-index: 10;">
      <span class="pill" style="border: 2px solid #fbbf24; color: #fbbf24; background: rgba(251,191,36,0.12);">8 UNIQUE PLAYABLE ARCHETYPES</span>
      <h1 style="font-size: 34px; margin-top: 10px; text-shadow: 4px 4px 0 #78350f;">WHAT'S YOUR <span style="color:#fde047; text-shadow: 4px 4px 0 #92400e;">MONEY</span> PERSONALITY?</h1>
    </div>
    <div style="position: absolute; top: 190px; left: 35px; right: 35px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px 10px; z-index: 5;">
      ${[
        ['young_pia_1','INVESTOR','#10b981','+8% Mutual Fund'],
        ['young_raj_1','HUSTLER','#f59e0b','Salary +12%'],
        ['young_priya_1','SCHOLAR','#818cf8','Education -25%'],
        ['young_rahul_1','RISK TAKER','#ef4444','Stock Gains x1.2'],
        ['young_sia_1','LANDLORD','#f97316','Rental Income +15%'],
        ['young_soms_1','MINIMALIST','#06b6d4','No Inflation Hit'],
        ['young_soni_1','CAREGIVER','#ec4899','Family Costs -20%'],
        ['young_kav_1','INFLUENCER','#eab308','Lucky Life Events']
      ].map(([s, name, col, perk]) => `
        <div style="background: rgba(10,5,2,0.65); border: 2px solid ${col}44; border-radius: 14px; padding: 10px 4px 6px; text-align: center;">
          <div style="height: 250px; display: flex; align-items: flex-end; justify-content: center;">
            <img src="${f(A+'/sprites/'+s+'.png')}" style="max-height: 245px; max-width: 100%; filter: drop-shadow(0 6px 10px rgba(0,0,0,0.6));">
          </div>
          <div style="font-size: 28px; color: ${col}; letter-spacing: 1px; margin-top: 4px;">${name}</div>
          <div style="font-size: 18px; color: #cbd5e1;">${perk}</div>
        </div>
      `).join('')}
    </div>
    <div class="foot">
      <div class="title">FINLIT</div>
      <div class="sub">CHOOSE YOUR PERK & PLAY YOUR WAY</div>
    </div>
  `,

  // 6. Device Trio: Home, Banking & Family
  '6_gameplay_trio_square': () => `
    <div class="bg" style="background: radial-gradient(circle at 50% 30%, #1d4ed8, #05091a 80%);"></div>
    <div class="grid"></div>
    <div style="position: absolute; top: 40px; left: 0; right: 0; text-align: center; z-index: 10;">
      <span class="pill" style="border: 2px solid #60a5fa; color: #60a5fa; background: rgba(96,165,250,0.12);">THE FINANCIAL LIFE SIM</span>
      <h1 style="font-size: 38px; margin-top: 10px; text-shadow: 4px 4px 0 #1e3a8a;">MASTER MONEY <span style="color:#fbbf24; text-shadow: 4px 4px 0 #b45309;">THE FUN WAY</span></h1>
    </div>
    <div style="position: absolute; top: 220px; left: 0; right: 0; height: 780px; z-index: 5;">
      <img src="${f(R+'/02_select.png')}" style="position: absolute; left: 55px; top: 45px; width: 330px; border-radius: 36px; border: 4px solid #60a5fa; transform: rotate(-8deg); box-shadow: 0 20px 45px rgba(0,0,0,0.7);">
      <img src="${f(R+'/07_home.png')}" style="position: absolute; left: 345px; top: 0px; width: 390px; border-radius: 40px; border: 5px solid #fbbf24; z-index: 8; box-shadow: 0 25px 55px rgba(0,0,0,0.85);">
      <img src="${f(R+'/13_family.png')}" style="position: absolute; right: 55px; top: 45px; width: 330px; border-radius: 36px; border: 4px solid #f472b6; transform: rotate(8deg); box-shadow: 0 20px 45px rgba(0,0,0,0.7);">
    </div>
    <div class="foot">
      <div class="title">FINLIT</div>
      <div class="sub">BUDGETING · HOUSING · INVESTING · RETIREMENT</div>
    </div>
  `
};

const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1080, height: 1080 } });

for (const [name, fn] of Object.entries(posters)) {
  const html = `<!DOCTYPE html><html><head><style>${baseCss}</style></head><body>${fn()}</body></html>`;
  const tmpFile = path.join(outDir, `${name}.html`);
  fs.writeFileSync(tmpFile, html);
  await page.goto('file://' + tmpFile);
  await page.waitForTimeout(1000);
  const targetImg = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: targetImg });
  fs.unlinkSync(tmpFile);
  console.log('Saved square poster:', targetImg);
}

await b.close();
console.log('All 6 square posters generated successfully!');
