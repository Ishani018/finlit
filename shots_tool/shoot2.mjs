import { chromium } from 'playwright';
import fs from 'fs';
const out = '/Users/ishani/Desktop/finlit/shots_tool/raw';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 430, height: 860 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
p.on('pageerror', e => console.log('PAGEERR', e.message.slice(0, 300)));
await p.goto('http://localhost:4173');
await p.waitForTimeout(5000);
const shot = async n => { await p.screenshot({ path: `${out}/${n}.png` }); console.log('shot', n, '|', (await p.innerText('body')).replace(/\s+/g, ' ').slice(0, 250)); };
const click = async t => { await p.getByText(t, { exact: false }).first().click({ timeout: 5000 }); await p.waitForTimeout(1500); };
await click('TAP TO BEGIN');
await shot('02_select');
// tap first character card
await p.mouse.click(120, 330); await p.waitForTimeout(1500);
await shot('03_profile');
await b.close();
