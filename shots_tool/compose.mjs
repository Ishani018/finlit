import { chromium } from 'playwright';
import fs from 'fs';
const raw = '/Users/ishani/Desktop/finlit/shots_tool/raw';
const outDir = '/Users/ishani/Desktop/finlit/itch_assets';
fs.mkdirSync(outDir, { recursive: true });
const items = [
  ['01_entry', 'Crack the Vault!', 'Your money journey starts here', '#fbbf24', '#7c2d12'],
  ['02_select', 'Pick Your Money Personality', '8 characters, 8 superpowers', '#34d399', '#064e3b'],
  ['03_profile', 'Watch Yourself Grow Up', 'From fresh grad to silver-haired tycoon', '#22d3ee', '#164e63'],
  ['05_name_dob', 'Born to Budget', 'Name yourself, pick your birthday', '#a78bfa', '#4c1d95'],
  ['07_home', 'Adulting: Level 1', '₹50,000, one tiny room, zero excuses', '#fb923c', '#7c2d12'],
  ['09_jobs', 'Hustle or Nap?', 'Gigs, careers and your own business', '#f472b6', '#831843'],
  ['11_invest', 'Make Your Money Work Harder Than You', 'Stocks, mutual funds, PPF, NPS & FDs', '#4ade80', '#14532d'],
  ['12_bank', 'Loans: Friend or Frenemy?', 'EMIs, credit scores and compound regrets', '#f87171', '#7f1d1d'],
  ['13_family', 'Plot Twist: Weddings Cost ₹5 Lakh', 'Marriage, kids, parents & life surprises', '#60a5fa', '#1e3a8a'],
];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
for (const [f, title, sub, c1, c2] of items) {
  if (!fs.existsSync(`${raw}/${f}.png`)) { console.log('skip', f); continue; }
  const img = 'data:image/png;base64,' + fs.readFileSync(`${raw}/${f}.png`).toString('base64');
  await p.setContent(`<html><head><link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet"><style>
  body{margin:0;width:1280px;height:720px;overflow:hidden;font-family:'VT323',monospace;
   background:radial-gradient(circle at 20% 20%,${c2},#05070f 70%);display:flex;align-items:center;position:relative}
  .glow{position:absolute;width:520px;height:520px;border-radius:50%;background:${c1};opacity:.18;filter:blur(90px);right:150px;top:100px}
  .txt{width:700px;padding-left:80px;z-index:2}
  h1{margin:0;font-size:92px;line-height:.92;color:#fff;text-shadow:5px 5px 0 ${c2},9px 9px 0 rgba(0,0,0,.45);letter-spacing:2px}
  h2{margin:26px 0 0;font-size:40px;color:${c1};letter-spacing:2px;font-weight:400}
  .tag{position:absolute;left:80px;bottom:44px;font-size:30px;color:#8a97c0;letter-spacing:5px}
  .ph{position:absolute;right:110px;top:36px;height:648px;transform:rotate(4deg);filter:drop-shadow(0 25px 40px rgba(0,0,0,.7));z-index:2}
  .ph img{height:648px;border-radius:44px;display:block;border:3px solid ${c1}}
  </style></head><body><div class="glow"></div>
  <div class="txt"><h1>${title}</h1><h2>${sub}</h2></div>
  <div class="tag">FINLIT · FREE FINANCIAL LIFE SIM</div>
  <div class="ph"><img src="${img}"></div></body></html>`);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${outDir}/${f}.png` });
  console.log('ok', f);
}
// cover 630x500
const ent = 'data:image/png;base64,' + fs.readFileSync(`${raw}/07_home.png`).toString('base64');
const icon = 'data:image/png;base64,' + fs.readFileSync('/Users/ishani/Desktop/finlit/MobileClient/assets/icon.png').toString('base64');
const cp = await b.newPage({ viewport: { width: 630, height: 500 }, deviceScaleFactor: 2 });
await cp.setContent(`<html><head><link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet"><style>
 body{margin:0;width:630px;height:500px;overflow:hidden;font-family:'VT323',monospace;background:radial-gradient(circle at 30% 20%,#1e3a8a,#05070f 75%);position:relative}
 .ic{position:absolute;left:36px;top:40px;width:130px;border-radius:26px;box-shadow:0 10px 30px rgba(0,0,0,.6)}
 h1{position:absolute;left:36px;top:190px;margin:0;font-size:120px;color:#fff;letter-spacing:6px;text-shadow:6px 6px 0 #172860,10px 10px 0 rgba(0,0,0,.5)}
 p{position:absolute;left:38px;top:325px;margin:0;font-size:38px;color:#fbbf24;letter-spacing:2px;line-height:1.05;width:330px}
 .ph{position:absolute;right:-20px;top:70px;transform:rotate(7deg)}.ph img{height:520px;border-radius:36px;border:3px solid #fbbf24}
 </style></head><body><img class="ic" src="${icon}"><h1>FINLIT</h1><p>Start at 18.<br>Retire rich at 58.</p><div class="ph"><img src="${ent}"></div></body></html>`);
await cp.waitForTimeout(1200);
await cp.screenshot({ path: `${outDir}/cover_630x500.png` });
console.log('cover ok');
await b.close();
