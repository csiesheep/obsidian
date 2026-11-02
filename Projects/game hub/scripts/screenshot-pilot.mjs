// Pilot: open each game in Chrome, take 3 screenshots (loaded, after a tap, after some random play), then a contact sheet.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('out');
fs.mkdirSync(OUT, { recursive: true });
const games = [
  ['potato', 'https://x282665.com/games/long-potato/'],
  ['coaster', 'https://rakugaki-coaster.pages.dev/'],
  ['snack', 'https://taiwanguessr.com/snack'],
  ['hklife', 'https://hk-life-simulator.eicp.io/'],
  ['axel', 'https://html-classic.itch.zone/html/9097981/FeedAxel_WebGL/index.html'],
  ['wok', 'https://sherrygamestudio.com/'],
];
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--mute-audio', '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
});
const report = [];
for (const [key, url] of games) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  const row = { key, url, shots: [] };
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});
    await sleep(6000);
    const shot = async name => { const f = path.join(OUT, `${key}-${name}.png`); await page.screenshot({ path: f }); row.shots.push(f); };
    await shot('1-loaded');
    // Tap the middle (most start screens), then press the usual start keys.
    await page.mouse.click(640, 400); await sleep(800);
    await page.keyboard.press('Enter'); await page.keyboard.press('Space');
    await sleep(3000);
    await shot('2-tapped');
    // Random play: click buttons first if there are any, otherwise click / drag / keys around the screen.
    for (let i = 0; i < 12; i++) {
      const btn = await page.$$('button:not([disabled]), [role=button], a.btn, .btn');
      if (btn.length && i % 2 === 0) { try { await btn[Math.floor(Math.random() * btn.length)].click(); } catch {} }
      else {
        const x = 200 + Math.random() * 880, y = 150 + Math.random() * 450;
        await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 120, y + 60, { steps: 8 }); await page.mouse.up();
        await page.keyboard.press(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'][i % 4]);
      }
      await sleep(700);
    }
    await shot('3-played');
    row.text = (await page.evaluate(() => document.body?.innerText || '')).replace(/\s+/g, ' ').slice(0, 1500);
    row.title = await page.title();
  } catch (e) { row.err = String(e); }
  report.push(row);
  await page.close();
  console.error('done', key);
}
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));

// Contact sheet: one row per game, three shots per row.
const sheet = await browser.newPage();
await sheet.setViewport({ width: 1500, height: 100 });
const img = f => `data:image/png;base64,${fs.readFileSync(f).toString('base64')}`;
await sheet.setContent(`<body style="margin:0;background:#222;color:#eee;font:16px sans-serif">${report.map(r => `
  <div style="display:flex;gap:6px;padding:6px;align-items:center"><div style="width:80px">${r.key}</div>
  ${r.shots.map(f => `<img src="${img(f)}" style="width:460px;border:1px solid #555">`).join('')}</div>`).join('')}</body>`);
await sheet.screenshot({ path: path.join(OUT, 'contact.png'), fullPage: true });
await browser.close();
