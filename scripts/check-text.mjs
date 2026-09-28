// 檢查投影片的文字量：每頁最多 3 個重點、每段說明最多 20 字
//
//   npm run check
//
// 算法：
// - 重點 = 清單項目、### 小標、表格的資料列、.callout 區塊
// - 字數：中文一個字算 1；英文單字、數字、指令、`inline code` 一段算 1；標點不算
// - 清單項目寫成「**名詞**：說明」或「`指令`：說明」時，只算冒號後面的說明
// - 程式碼區塊、終端機輸出、圖、asciinema 都不算文字
// - 旁註（MarginNotes）每句也要 ≤ 20 字，且不超過 3 句
// - 講者備註（<!-- -->）不檢查，要口頭講的東西放那裡
import fs from 'node:fs'
import path from 'node:path'
import { parseSync } from '@slidev/parser/core'

const MAX_POINTS = 3
const MAX_CHARS = 20
const root = path.resolve(import.meta.dirname, '..')

function count(s) {
  s = s
    .replace(/<[^>]+>/g, ' ')
    .replace(/`[^`]+`/g, ' X ')
    .replace(/\*\*|__|\*/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  const cjk = (s.match(/[㐀-鿿豈-﫿]/g) ?? []).length
  const words = (s.replace(/[㐀-鿿豈-﫿]/g, ' ').match(/[A-Za-z0-9_$@%+~=#./\-<>]+/g) ?? []).length
  return cjk + words
}

// 「**名詞**：說明」只算說明
function desc(item) {
  const m = item.match(/^\s*(\*\*[^*]+\*\*|`[^`]+`(?:\s*\/\s*`[^`]+`)*)\s*[：:]\s*(.*)$/)
  return m ? m[2] : item
}

function strip(content) {
  return content
    .replace(/^(`{3,})[^\n]*\n[\s\S]*?\n\1\s*$/gm, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
}

function checkSlide(content) {
  const issues = []
  const body = strip(content)
  let points = 0
  const long = (label, text) => {
    const n = count(text)
    if (n > MAX_CHARS) issues.push(`${label} ${n} 字：${text.trim().slice(0, 40)}`)
  }

  // HTML 表格：每個資料列算一個重點
  for (const m of body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)) {
    if (/<th\b/.test(m[1])) continue
    points++
    for (const c of m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)) long('表格', c[1])
  }

  // MarginNotes
  for (const m of body.matchAll(/:notes="\[([\s\S]*?)\]"/g)) {
    const notes = [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x => x[1]).filter(Boolean)
    if (notes.length > MAX_POINTS) issues.push(`旁註 ${notes.length} 句（上限 ${MAX_POINTS}）`)
    notes.forEach(n => long('旁註', n))
  }
  // 圖上的 note / label 文字只檢查長度
  for (const m of body.matchAll(/\b(?:note|label|sub):\s*'((?:[^'\\]|\\.)*)'/g)) long('圖說', m[1])

  // callout
  for (const m of body.matchAll(/<div[^>]*class="callout[^"]*"[^>]*>([\s\S]*?)<\/div>/g)) {
    points++
    long('callout', m[1])
  }

  const md = body
    .replace(/<table[\s\S]*?<\/table>/g, '')
    .replace(/<div[^>]*class="callout[\s\S]*?<\/div>/g, '')
    .replace(/<[A-Z][\s\S]*?\/>/g, '') // 自訂元件（self-closing）
    .replace(/^::\w+::$/gm, '')
  let inTable = 0
  for (const raw of md.split('\n')) {
    const line = raw.trim()
    if (!line) { inTable = 0; continue }
    if (/^#\s/.test(line)) continue // 頁面標題
    if (/^###\s/.test(line)) { points++; long('小標', line.replace(/^###\s*/, '')); continue }
    if (/^\|/.test(line)) {
      inTable++
      if (inTable <= 2) continue // 表頭與分隔線
      points++
      line.split('|').slice(1, -1).forEach(c => long('表格', c))
      continue
    }
    const li = line.match(/^(?:[-*]|\d+\.)\s+(.*)$/)
    if (li) { points++; long('項目', desc(li[1])); continue }
    if (/^<\/?[a-z]/.test(line) && !/[㐀-鿿]/.test(line.replace(/<[^>]+>/g, ''))) continue
    long('文字', line.replace(/<[^>]+>/g, ''))
  }
  if (points > MAX_POINTS) issues.push(`重點 ${points} 個（上限 ${MAX_POINTS}）`)
  return issues
}

let total = 0
const files = ['slides.md', ...fs.readdirSync(path.join(root, 'pages')).sort().map(f => `pages/${f}`)]
for (const f of files) {
  const { slides } = parseSync(fs.readFileSync(path.join(root, f), 'utf8'), f)
  for (const s of slides) {
    if (s.frontmatter?.src || s.frontmatter?.check === false) continue
    const issues = checkSlide(s.content)
    if (!issues.length) continue
    total += issues.length
    console.log(`\n${f} #${s.index + 1}  ${s.title ?? ''}`)
    issues.forEach(i => console.log(`  - ${i}`))
  }
}
console.log(total ? `\n共 ${total} 個問題` : '全部通過')
process.exitCode = total ? 1 : 0
