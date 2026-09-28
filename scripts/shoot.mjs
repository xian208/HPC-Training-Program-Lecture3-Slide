// 逐頁截圖（每頁顯示所有 click 之後的樣子），用來檢查版面
//   npx slidev build && node scripts/shoot.mjs [輸出資料夾] [頁碼...]
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright-chromium'

const dist = path.resolve(import.meta.dirname, '../dist')
const out = path.resolve(process.argv[2] ?? 'shots')
const only = process.argv.slice(3).map(Number)
fs.mkdirSync(out, { recursive: true })

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.cast': 'text/plain', '.wasm': 'application/wasm' }
const server = http.createServer((req, res) => {
  let p = path.join(dist, decodeURIComponent(req.url.split('?')[0]))
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(dist, 'index.html')
  res.writeHead(200, { 'Content-Type': types[path.extname(p)] ?? 'application/octet-stream' })
  fs.createReadStream(p).pipe(res)
}).listen(0)
const base = `http://localhost:${server.address().port}`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 980, height: 551 }, deviceScaleFactor: 1.5 })
page.on('pageerror', e => console.log('pageerror:', e.message))
await page.goto(`${base}/#/1`)
await page.waitForTimeout(4000)
const total = await page.evaluate(() => document.querySelectorAll('.slidev-page').length || 0)
const n = only.length ? only : Array.from({ length: 200 }, (_, i) => i + 1)
for (const i of n) {
  await page.goto(`${base}/#/${i}?clicks=99`)
  await page.waitForTimeout(1200)
  if (!page.url().includes(`#/${i}`)) break
  await page.screenshot({ path: path.join(out, `${String(i).padStart(2, '0')}.png`) })
}
await browser.close()
server.close()
console.log('done', total)
