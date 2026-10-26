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
.kick{position:absolute;top:65px;left:0;right:0;text-align:center;font-size:42px;letter-spacing:10px}
h1{position:absolute;left:40px;right:40px;margin:0;text-align:center;font-family:'Press Start 2P',monospace;line-height:1.35;font-weight:400}
.foot{position:absolute;bottom:45px;left:0;right:0;text-align:center}
.foot b{display:block;font-size:80px;letter-spacing:10px;font-weight:400}
.foot span{font-size:36px;letter-spacing:6px;opacity:.75}
.card{border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.55)}
.card img{display:block;width:100%;height:100%;object-fit:cover}
`;
const foot = '<div class="foot"><b>FINLIT</b><span>PLAY FREE ON ITCH.IO</span></div>';

const posters = {
 '2_whole_life': ()=>`
  <div class="bg" style="background:linear-gradient(180deg,#0e7490 0%,#1e3a8a 55%,#1e1b4b 100%)"></div><div class="grid"></div>
  <div class="kick" style="color:#a5f3fc">18 → 58 · ONE MONTH AT A TIME</div>
  <h1 style="top:140px;font-size:60px;text-shadow:6px 6px 0 #164e63">LIVE THE<br>WHOLE<br><span style="color:#fde047;text-shadow:6px 6px 0 #854d0e">DAMN LIFE</span></h1>
  <div style="position:absolute;top:600px;left:30px;right:30px;display:flex;justify-content:space-between;align-items:flex-end">
   ${[['young_pia_1','18'],['pia_25-30','25'],['pia_middleage','40'],['pia_50plus','55']].map(([s,a],i)=>`<div style="text-align:center"><img src="${f(A+'/sprites/'+s+'.png')}" style="height:${480+i*30}px;filter:drop-shadow(0 14px 18px rgba(0,0,0,.6))"><div style="font-size:52px;color:#fde047;margin-top:12px">AGE ${a}</div></div>`).join('')}
  </div>
  <div style="position:absolute;top:1330px;left:0;right:0;text-align:center;font-size:42px;letter-spacing:3px;color:#e0f2fe">Marry. Raise kids. Survive crashes. Grow old rich.</div>${foot}`,

 '4_hustle_invest': ()=>`
  <div class="bg" style="background:radial-gradient(circle at 50% 25%,#15803d,#04160b 75%)"></div><div class="grid"></div>
  <div class="kick" style="color:#bbf7d0">GIGS · CAREERS · STOCKS · SIPs</div>
  <h1 style="top:130px;font-size:54px;text-shadow:6px 6px 0 #14532d">HUSTLE.<br>INVEST.<br><span style="color:#fde047;text-shadow:6px 6px 0 #854d0e">REPEAT.</span></h1>
  <div style="position:absolute;top:570px;left:45px;right:45px;display:flex;gap:30px;align-items:flex-start">
   <img src="${f(R+'/11_invest.png')}" style="width:430px;border-radius:44px;border:5px solid #4ade80;transform:rotate(-3deg);box-shadow:0 24px 50px rgba(0,0,0,.6)">
   <div style="display:flex;flex-direction:column;gap:20px;flex:1;margin-top:10px">
    ${['SDE','CEO','law_firm'].map(s=>`<div class="card" style="height:235px;border:5px solid #86efac"><img src="${f(A+'/jobs/'+s+'.png')}"></div>`).join('')}
   </div>
  </div>
  <div style="position:absolute;top:1430px;left:0;right:0;text-align:center;font-size:44px;letter-spacing:3px;color:#dcfce7">Make your money work harder than you.</div>
  <div class="foot" style="bottom:25px"><b style="font-size:54px">FINLIT</b></div>`,
};

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1620 } });
for (const [name, fn] of Object.entries(posters)) {
  fs.writeFileSync(`${out}/${name}.html`, `<html><head><style>${css}</style></head><body>${fn()}</body></html>`);
  await p.goto('file://' + `${out}/${name}.html`);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}/${name}.png` });
  fs.unlinkSync(`${out}/${name}.html`);
  console.log('updated ok', name);
}
await b.close();
