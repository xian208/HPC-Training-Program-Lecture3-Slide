/**
 * Compiler Explorer runner 的設定組（給 {monaco-run} 用）
 *
 * Slidev 解析 code block 選項時不支援巢狀大括號，所以 runnerOptions 不能直接寫物件，
 * 改成在這裡命名，投影片寫：
 *
 *   ```c {monaco-run} {autorun: false, runnerOptions: ce('loop-O3')}
 *
 * 欄位說明見 setup/code-runners.ts
 */
export const cePresets: Record<string, Record<string, unknown>> = {
  'loop-O0': { flags: '-O0', fallback: 'loop-O0', maxHeight: '185px' },
  'loop-O3': { flags: '-O3', fallback: 'loop-O3', maxHeight: '185px' },
  'hello-x86': { fallback: 'hello-asm', maxHeight: '160px' },
  'hello-arm': { compiler: 'ARM64 gcc 14.2', maxHeight: '160px' },
  'hello-objdump': { mode: 'objdump', fallback: 'hello-objdump', maxHeight: '140px' },
}

export function ce(name: string) {
  const p = cePresets[name]
  if (!p) console.warn(`[ce] 沒有這個 preset：${name}`)
  return p ?? {}
}
