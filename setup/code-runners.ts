import { defineCodeRunnersSetup } from '@slidev/types'

/**
 * C 語言 code runner：把 {monaco-run} 裡的程式碼送到 Compiler Explorer（godbolt.org）編譯
 *
 *   ```c {monaco-run} {autorun: false, runnerOptions: ce('loop-O3')}
 *
 * runnerOptions 是在 setup/ce-presets.ts 命名好的設定組（Slidev 不支援在 code block
 * 選項裡寫巢狀大括號，所以不能直接寫物件）。每組可以有：
 *   compiler  compiler 名稱（比對 /api/compilers/c 的 name，不分大小寫），預設 'x86-64 gcc 14.2'
 *             （跟講義 Debian 13 的 gcc 14.2 同版本）；也可直接給 id
 *   flags     編譯參數，例如 '-O0'、'-O3 -march=skylake-avx512'
 *   mode      'asm'（預設，組合語言，每行標出對應的 C 原始碼行號）
 *             'run'（在 godbolt 上執行，顯示 stdout；不要拿來比執行時間，那是共用機器）
 *             'objdump'（反組譯 .o，對應 Assembly phase 的 objdump -d）
 *   fallback  snippets/ce-cache/<fallback>.txt；連不上 godbolt 時改顯示這份預先存好的輸出
 *   maxHeight 輸出區最大高度（預設 250px，超過就捲動）
 *
 * 注意：現場需要網路；godbolt 的 API 目前沒有 rate limit，但官方說未來可能加上。
 */

const CE = 'https://godbolt.org'
const cache = import.meta.glob('../snippets/ce-cache/*.txt', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const fromCache = (key?: string) => key ? cache[`../snippets/ce-cache/${key}.txt`] : undefined

let compilerList: Promise<{ id: string, name: string }[]> | undefined
function listCompilers() {
  compilerList ??= fetch(`${CE}/api/compilers/c?fields=id,name`, { headers: { Accept: 'application/json' } })
    .then(r => r.json())
    .catch((e) => { compilerList = undefined; throw e })
  return compilerList
}
async function resolveCompiler(want: string) {
  if (!/\s/.test(want)) return want // 看起來像 id（例如 cg142）
  const list = await listCompilers()
  const w = want.toLowerCase()
  const hit = list.find(c => c.name.toLowerCase() === w) ?? list.find(c => c.name.toLowerCase().includes(w))
  if (!hit) throw new Error(`找不到 compiler：${want}`)
  return hit.id
}

const esc = (s: string) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!))
// 同一行 C 原始碼對應的組語用同一個底色
const PALETTE = ['#e6eefa', '#fdf0dc', '#e3f2ef', '#f3e6f5', '#e8f5dc', '#fbe4e1']

function renderAsm(asm: any[], showAddr: boolean, maxHeight = '250px') {
  const rows = asm.map((l) => {
    const line: number | undefined = l.source && l.source.file == null ? l.source.line : undefined
    const bg = line ? PALETTE[line % PALETTE.length] : 'transparent'
    const tag = line ? `L${line}` : ''
    const addr = showAddr && l.address != null ? `${Number(l.address).toString(16).padStart(6, ' ')}  ` : ''
    const ops = showAddr && l.opcodes?.length ? `${l.opcodes.join(' ').padEnd(24, ' ')} ` : ''
    return `<div style="background:${bg};display:flex"><span style="width:3em;color:#8a939c;flex:none">${tag}</span><span style="white-space:pre">${esc(addr + ops + (l.text ?? ''))}</span></div>`
  }).join('')
  return `<div style="font-family:var(--tb-mono);font-size:12px;line-height:1.55;max-height:${maxHeight};overflow:auto">${rows}</div>
<div style="font-size:11px;color:#66707c;margin-top:4px">L<i>n</i> = 對應到 C 原始碼第 n 行</div>`
}

const joinText = (a?: { text: string }[]) => (a ?? []).map(x => x.text).join('\n')

export default defineCodeRunnersSetup(() => ({
  async c(code, ctx) {
    const o = ctx.options as { compiler?: string, flags?: string, mode?: 'asm' | 'run' | 'objdump', fallback?: string, maxHeight?: string }
    const mode = o.mode ?? 'asm'
    try {
      const id = await resolveCompiler(o.compiler ?? 'x86-64 gcc 14.2')
      const body = {
        source: code,
        options: {
          userArguments: o.flags ?? '',
          compilerOptions: { executorRequest: mode === 'run', skipAsm: mode === 'run' },
          filters: {
            binary: false,
            binaryObject: mode === 'objdump',
            commentOnly: true,
            demangle: true,
            directives: true,
            execute: mode === 'run',
            intel: false, // AT&T 語法，跟 gcc -S 的預設輸出一致
            labels: true,
            libraryCode: false,
            trim: false,
          },
          tools: [],
          libraries: [],
        },
        lang: 'c',
        allowStoreCodeDebug: false,
      }
      const res = await fetch(`${CE}/api/compiler/${encodeURIComponent(id)}/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body),
      }).then(r => r.json())

      if (mode === 'run') {
        const ex = res.execResult ?? res
        const build = ex.buildResult ?? res
        if (build.code && build.code !== 0)
          return { error: joinText(build.stderr) || `compile failed (${build.code})` }
        return [
          { text: joinText(ex.stdout) || '(no output)' },
          ...(joinText(ex.stderr) ? [{ text: joinText(ex.stderr), class: 'text-red-600' }] : []),
        ]
      }
      if (res.code !== 0)
        return { error: joinText(res.stderr) || `compile failed (${res.code})` }
      return { html: renderAsm(res.asm ?? [], mode === 'objdump', o.maxHeight) }
    }
    catch (e) {
      const cached = fromCache(o.fallback)
      if (cached)
        return { html: `<div style="font-size:11px;color:#9a4d00;margin-bottom:4px">⚠ 連不上 Compiler Explorer，以下是預先存好的輸出</div><pre style="margin:0;font-family:var(--tb-mono);font-size:12px;line-height:1.55;max-height:${o.maxHeight ?? '250px'};overflow:auto;white-space:pre">${esc(cached)}</pre>` }
      return { error: `連不上 Compiler Explorer：${(e as Error).message}` }
    }
  },
}))
