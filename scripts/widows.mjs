// 找出折行後最後一行太短（寬度不到 2.6 個字）的段落
//   npx slidev build && node scripts/widows.mjs [最短寬度，以字數計，預設 2.6]
// 以每頁所有 click 之後的樣子檢查；程式碼、終端機這類不折行的區塊不檢查
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright-chromium'

const MIN = Number(process.argv[2] ?? 2.6)
const dist = path.resolve(import.meta.dirname, '../dist')
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.cast': 'text/plain', '.wasm': 'application/wasm' }
const server = http.createServer((req, res) => {
  let p = path.join(dist, decodeURIComponent(req.url.split('?')[0]))
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(dist, 'index.html')
  res.writeHead(200, { 'Content-Type': types[path.extname(p)] ?? 'application/octet-stream' })
  fs.createReadStream(p).pipe(res)
}).listen(0)
const base = `http://localhost:${server.address().port}`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 980, height: 551 } })
await page.goto(`${base}/#/1`)
await page.waitForTimeout(4000)
const total = await page.evaluate(() => document.querySelectorAll('.slidev-page').length)

let found = 0
for (let i = 1; i <= total; i++) {
  await page.goto(`${base}/#/${i}?clicks=99`)
  await page.waitForTimeout(700)
  const hits = await page.evaluate(({ i, MIN }) => {
    const root = document.querySelector(`.slidev-page-${i}`)
    if (!root) return []
    const isBlock = el => !['inline', 'contents'].includes(getComputedStyle(el).display)
    const blocks = new Map()
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement
      if (!el || el.closest('pre, svg, .term, .cast, .slidev-code-wrapper, .slidev-monaco-container, [aria-hidden="true"]')) continue
      if (getComputedStyle(el).whiteSpace.startsWith('pre') || getComputedStyle(el).whiteSpace === 'nowrap') continue
      let b = el
      while (b !== root && !isBlock(b)) b = b.parentElement
      if (!blocks.has(b)) blocks.set(b, [])
      blocks.get(b).push(n)
    }
    const out = []
    for (const [b, nodes] of blocks) {
      if (getComputedStyle(b).opacity === '0' || b.closest('.slidev-vclick-hidden')) continue
      const lines = new Map()
      let lastTop = null
      const widths = new Map()
      for (const n of nodes) {
        for (let k = 0; k < n.data.length; k++) {
          const ch = n.data[k]
          if (/\s/.test(ch)) { if (lastTop != null) lines.set(lastTop, lines.get(lastTop) + ' '); continue }
          const r = document.createRange(); r.setStart(n, k); r.setEnd(n, k + 1)
          const rect = r.getClientRects()[0]
          if (!rect || rect.width === 0) continue
          const top = Math.round(rect.top / 4) * 4
          lines.set(top, (lines.get(top) ?? '') + ch)
          const w = widths.get(top) ?? [Infinity, -Infinity]
          widths.set(top, [Math.min(w[0], rect.left), Math.max(w[1], rect.right)])
          lastTop = top
        }
      }
      if (lines.size < 2) continue
      const keys = [...lines.keys()].sort((a, c) => a - c)
      const last = lines.get(keys.at(-1)).trim()
      // 用最後一行的實際寬度判斷，換算成「幾個中文字寬」
      const [l, r] = widths.get(keys.at(-1))
      const em = parseFloat(getComputedStyle(b).fontSize)
      if ((r - l) / em < MIN) out.push({ last, text: b.textContent.trim().replace(/\s+/g, ' ').slice(0, 60) })
    }
    return out
  }, { i, MIN })
  for (const h of hits) { found++; console.log(`#${i}  最後一行「${h.last}」  ${h.text}`) }
}
console.log(found ? `\n共 ${found} 處` : '沒有過短的最後一行')
await browser.close(); server.close()
