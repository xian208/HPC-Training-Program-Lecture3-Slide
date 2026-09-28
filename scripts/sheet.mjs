// 把截圖拼成總覽圖：node scripts/sheet.mjs <截圖資料夾> [每張幾頁]
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright-chromium'
const dir = path.resolve(process.argv[2]); const per = +(process.argv[3] ?? 12)
const files = fs.readdirSync(dir).filter(f => /^\d+\.png$/.test(f)).sort()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } })
for (let s = 0; s < files.length; s += per) {
  const cells = files.slice(s, s + per).map(f => `<figure><img src="data:image/png;base64,${fs.readFileSync(path.join(dir, f)).toString('base64')}"><figcaption>${f}</figcaption></figure>`).join('')
  await page.setContent(`<style>body{margin:0;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:#888;padding:6px}figure{margin:0;background:#fff}img{width:100%;display:block}figcaption{font:12px sans-serif;padding:2px 4px}</style>${cells}`)
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(dir, `sheet-${String(s / per + 1).padStart(2, '0')}.png`), fullPage: true })
}
await browser.close()
