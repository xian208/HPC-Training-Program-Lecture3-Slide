// 把錄影輸出裡的 CAST_MARK 控制碼換成 asciicast v2 的 marker 事件（["t","m",""]）
import fs from 'node:fs'
const file = process.argv[2]
const MARK = '\u001b]1337;CAST_MARK\u0007'
const [header, ...lines] = fs.readFileSync(file, 'utf8').trimEnd().split('\n')
const out = [header]
for (const l of lines) {
  const [t, type, data] = JSON.parse(l)
  if (type !== 'o' || !data.includes(MARK)) { out.push(l); continue }
  const parts = data.split(MARK)
  parts.forEach((p, i) => {
    if (p) out.push(JSON.stringify([t, 'o', p]))
    if (i < parts.length - 1) out.push(JSON.stringify([t, 'm', '']))
  })
}
fs.writeFileSync(file, out.join('\n') + '\n')
console.log(`markers: ${out.filter(l => l.includes('"m"')).length}`)
