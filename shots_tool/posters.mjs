import { chromium } from 'playwright';
import fs from 'fs';
const A = '/Users/ishani/Desktop/finlit/MobileClient/assets';
const R = '/Users/ishani/Desktop/finlit/shots_tool/raw';
const out = '/Users/ishani/Desktop/finlit/itch_assets/posters';
fs.mkdirSync(out, { recursive: true });
const f = p => 'file://' + p.replace(/ /g, '%20');
const css = `
@import url('https://fonts.googleapis.com/css2?family=VT323&family=Press+Start+2P&display=swap');
*{box-sizing:border-box}
body{margin:0;width:1080px;height:1620px;overflow:hidden;font-family:'VT323',monospace;color:#fff;position:relative}
.bg{position:absolute;inset:0}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 2px,transparent 2px),linear-gradient(90deg,rgba(255,255,255,.04) 2px,transparent 2px);background-size:54px 54px}
.kick{position:absolute;top:70px;left:0;right:0;text-align:center;font-size:44px;letter-spacing:12px}
h1{position:absolute;left:40px;right:40px;margin:0;text-align:center;font-family:'Press Start 2P',monospace;line-height:1.35;font-weight:400}
.foot{position:absolute;bottom:56px;left:0;right:0;text-align:center}
.foot b{display:block;font-size:84px;letter-spacing:10px;font-weight:400}
.foot span{font-size:38px;letter-spacing:6px;opacity:.75}
.card{border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.55)}
.card img{display:block;width:100%;height:100%;object-fit:cover}
.px{image-rendering:auto}
`;
const foot = '<div class="foot"><b>FINLIT</b><span>PLAY FREE ON ITCH.IO</span></div>';
const posters = {
 '1_start_broke': (c)=>`
  <div class="bg" style="background:radial-gradient(circle at 50% 30%,#4c1d95,#0b0720 70%)"></div><div class="grid"></div>
  <div class="kick" style="color:#fbbf24">₹50,000 · AGE 18 · ZERO CLUE</div>
  <h1 style="top:150px;font-size:70px;text-shadow:6px 6px 0 #7c3aed">START<br>BROKE.<br><span style="color:#fbbf24;text-shadow:6px 6px 0 #b45309">RETIRE<br>LEGEND.</span></h1>
  <div style="position:absolute;top:760px;left:0;right:0;display:flex;justify-content:center;gap:0">
   ${['young_pia_1','young_raj_1','young_soms_1','young_soni_1','young_sia_1','young_rahul_1'].map((s,i)=>`<img src="${f(A+'/sprites/'+s+'.png')}" style="height:${i%2?560:620}px;margin:${i%2?'60px':'0'} -34px 0;filter:drop-shadow(0 14px 18px rgba(0,0,0,.6))">`).join('')}
  </div>${foot}`,
 '2_whole_life': ()=>`
  <div class="bg" style="background:linear-gradient(180deg,#0e7490 0%,#1e3a8a 55%,#1e1b4b 100%)"></div><div class="grid"></div>
  <div class="kick" style="color:#a5f3fc">18 → 58 · ONE MONTH AT A TIME</div>
  <h1 style="top:150px;font-size:64px;text-shadow:6px 6px 0 #164e63">LIVE THE<br>WHOLE<br><span style="color:#fde047;text-shadow:6px 6px 0 #854d0e">DAMN LIFE</span></h1>
  <div style="position:absolute;top:720px;left:30px;right:30px;display:flex;justify-content:space-between;align-items:flex-end">
   ${[['young_pia_1','18'],['pia_25-30','25'],['pia_middleage','40'],['pia_50plus','55']].map(([s,a],i)=>`<div style="text-align:center"><img src="${f(A+'/sprites/'+s+'.png')}" style="height:${420+i*30}px;filter:drop-shadow(0 12px 16px rgba(0,0,0,.6))"><div style="font-size:56px;color:#fde047;margin-top:8px">AGE ${a}</div></div>`).join('')}
  </div>
  <div style="position:absolute;top:1250px;left:0;right:0;text-align:center;font-size:44px;letter-spacing:4px;color:#e0f2fe">Marry. Raise kids. Survive crashes. Grow old rich.</div>${foot}`,
 '3_buy_the_dream': ()=>`
  <div class="bg" style="background:radial-gradient(circle at 50% 20%,#be185d,#2a0a1e 75%)"></div><div class="grid"></div>
  <div class="kick" style="color:#fbcfe8">FROM HOSTEL TO VILLA</div>
  <h1 style="top:140px;font-size:62px;text-shadow:6px 6px 0 #831843">BUY THE<br><span style="color:#fde68a;text-shadow:6px 6px 0 #92400e">DREAM</span><br>HOME</h1>
  <div style="position:absolute;top:640px;left:60px;right:60px;display:grid;grid-template-columns:1fr 1fr;gap:26px">
   ${['studio_apartment','family_bunglow_with_pool_and_backyard','Beach_house_for_family_of_4-5','fully_furnish_villa_with_movie_theatre'].map(s=>`<div class="card" style="height:370px;border:5px solid #f9a8d4"><img src="${f(A+'/properties/'+s+'.png')}"></div>`).join('')}
  </div>
  <div style="position:absolute;top:1430px;left:0;right:0;text-align:center;font-size:42px;letter-spacing:3px;color:#fce7f3">EMIs included. Regret optional.</div>
  <div class="foot" style="bottom:30px"><b style="font-size:56px">FINLIT</b></div>`,
 '4_hustle_invest': ()=>`
  <div class="bg" style="background:radial-gradient(circle at 50% 25%,#15803d,#04160b 75%)"></div><div class="grid"></div>
  <div class="kick" style="color:#bbf7d0">GIGS · CAREERS · STOCKS · SIPs</div>
  <h1 style="top:140px;font-size:56px;text-shadow:6px 6px 0 #14532d">HUSTLE.<br>INVEST.<br><span style="color:#fde047;text-shadow:6px 6px 0 #854d0e">REPEAT.</span></h1>
  <div style="position:absolute;top:640px;left:50px;right:50px;display:flex;gap:30px;align-items:flex-start">
   <img src="${f(R+'/11_invest.png')}" style="width:420px;border-radius:44px;border:5px solid #4ade80;transform:rotate(-3deg);box-shadow:0 24px 50px rgba(0,0,0,.6)">
   <div style="display:flex;flex-direction:column;gap:22px;flex:1;margin-top:20px">
    ${['SDE','CEO','law_firm'].map(s=>`<div class="card" style="height:250px;border:5px solid #86efac"><img src="${f(A+'/jobs/'+s+'.png')}"></div>`).join('')}
   </div>
  </div>
  <div style="position:absolute;top:1400px;left:0;right:0;text-align:center;font-size:42px;letter-spacing:3px;color:#dcfce7">Make your money work harder than you.</div>
  <div class="foot" style="bottom:30px"><b style="font-size:56px">FINLIT</b></div>`,
 '5_money_personality': ()=>`
  <div class="bg" style="background:radial-gradient(circle at 50% 20%,#b45309,#1c0f02 75%)"></div><div class="grid"></div>
  <div class="kick" style="color:#fde68a">8 CHARACTERS · 8 SUPERPOWERS</div>
  <h1 style="top:140px;font-size:50px;text-shadow:6px 6px 0 #78350f">WHAT'S YOUR<br><span style="color:#fde047;text-shadow:6px 6px 0 #92400e">MONEY</span><br>PERSONALITY?</h1>
  <div style="position:absolute;top:560px;left:40px;right:40px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px 10px">
   ${[['young_pia_1','INVESTOR','#10b981'],['young_raj_1','HUSTLER','#f59e0b'],['young_priya_1','SCHOLAR','#818cf8'],['young_rahul_1','RISK TAKER','#ef4444'],['young_sia_1','LANDLORD','#f97316'],['young_soms_1','MINIMALIST','#06b6d4'],['young_soni_1','CAREGIVER','#ec4899'],['young_kav_1','INFLUENCER','#eab308']].map(([s,n,c])=>`<div style="text-align:center"><div style="height:380px;display:flex;align-items:flex-end;justify-content:center"><img src="${f(A+'/sprites/'+s+'.png')}" style="max-height:380px;max-width:100%;filter:drop-shadow(0 10px 12px rgba(0,0,0,.6))"></div><div style="font-size:38px;letter-spacing:2px;color:${c};margin-top:8px">${n}</div></div>`).join('')}
  </div>${foot}`,
 '6_hero_trio': ()=>`
  <div class="bg" style="background:radial-gradient(circle at 50% 35%,#1d4ed8,#050816 72%)"></div><div class="grid"></div>
  <div class="kick" style="color:#93c5fd">THE FINANCIAL LIFE SIM</div>
  <h1 style="top:130px;font-size:58px;text-shadow:6px 6px 0 #1e3a8a">LEARN MONEY<br>THE <span style="color:#fbbf24;text-shadow:6px 6px 0 #b45309">FUN</span><br>WAY</h1>
  <div style="position:absolute;top:620px;left:0;right:0;height:820px">
   <img src="${f(R+'/02_select.png')}" style="position:absolute;left:30px;top:70px;width:340px;border-radius:40px;border:5px solid #60a5fa;transform:rotate(-8deg);box-shadow:0 24px 50px rgba(0,0,0,.6)">
   <img src="${f(R+'/07_home.png')}" style="position:absolute;left:300px;top:0;width:480px;border-radius:50px;border:6px solid #fbbf24;z-index:3;box-shadow:0 30px 60px rgba(0,0,0,.7)">
   <img src="${f(R+'/13_family.png')}" style="position:absolute;right:30px;top:70px;width:340px;border-radius:40px;border:5px solid #f472b6;transform:rotate(8deg);box-shadow:0 24px 50px rgba(0,0,0,.6)">
  </div>${foot}`,
};
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1620 } });
for (const [name, fn] of Object.entries(posters)) {
  fs.writeFileSync(`${out}/${name}.html`, `<html><head><style>${css}</style></head><body>${fn()}</body></html>`);
  await p.goto('file://' + `${out}/${name}.html`);
  await p.waitForTimeout(2000);
  await p.screenshot({ path: `${out}/${name}.png` });
  fs.unlinkSync(`${out}/${name}.html`);
  console.log('ok', name);
}
await b.close();
