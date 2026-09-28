<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'

/**
 * 模擬終端機：每次 click 打出下一個指令、再印出輸出（參考 artifact 選項 C）
 *
 *   <Terminal :steps="[
 *     { cmd: 'gcc use.c -ladd -o use', out: '/usr/bin/ld: cannot find -ladd', tone: 'err' },
 *     { cmd: './use', out: '3', tone: 'ok' },
 *   ]" />
 *
 * - 顯示的步數 = initial + ($clicks - offset)
 * - 投影片模式下，新出現的那一步會逐字打出；往回翻、overview、匯出時直接顯示完整內容
 * - 沒有 cmd 的 step 只印輸出（例如註解、空行）
 * - 投影片需要在 frontmatter 設 `clicks: <steps 數>`（或跟其他 v-click 共用）
 */
interface Step { cmd?: string, out?: string, tone?: 'err' | 'ok' | 'mut', html?: boolean, prompt?: string }
const props = withDefaults(defineProps<{
  steps: Step[]
  initial?: number
  offset?: number
  title?: string
  prompt?: string
  speed?: number
  fontSize?: string
  height?: string
}>(), { initial: 0, offset: 0, title: 'bash', prompt: '$', speed: 28, fontSize: '13px', height: 'auto' })

const { $clicks, $renderContext } = useSlideContext()
const shown = computed(() => Math.min(Math.max(props.initial + $clicks.value - props.offset, 0), props.steps.length))

const typing = ref(-1) // 正在打字的 step index
const typed = ref(0) // 已打出的字元數
const outReady = ref(true)
let timer: ReturnType<typeof setInterval> | undefined

function stop() { if (timer) clearInterval(timer); timer = undefined }
onUnmounted(stop)

watch(shown, (n, old) => {
  stop()
  const live = $renderContext.value === 'slide' || $renderContext.value === 'presenter'
  if (!live || old === undefined || n !== old + 1) { typing.value = -1; outReady.value = true; return }
  const step = props.steps[n - 1]
  typing.value = n - 1
  typed.value = 0
  outReady.value = false
  const full = step.cmd ?? ''
  if (!full.length) { typing.value = -1; outReady.value = true; return }
  timer = setInterval(() => {
    typed.value++
    if (typed.value >= full.length) {
      stop()
      setTimeout(() => { outReady.value = true; typing.value = -1 }, 220)
    }
  }, props.speed)
})

const esc = (s: string) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!))
function cmdText(i: number) {
  const c = props.steps[i].cmd ?? ''
  return i === typing.value ? c.slice(0, typed.value) : c
}
function outHtml(s: Step) { return s.html ? s.out ?? '' : esc(s.out ?? '') }
const lastIdx = computed(() => shown.value - 1)
</script>

<template>
  <div class="term" :style="{ fontSize, height }">
    <div class="bar"><i /><i /><i /><span>{{ title }}</span></div>
    <div class="body">
      <template v-for="(s, i) in steps.slice(0, shown)" :key="i">
        <div v-if="s.cmd !== undefined" class="line">
          <span class="pr">{{ s.prompt ?? prompt }} </span><span>{{ cmdText(i) }}</span><span v-if="i === typing" class="caret" />
        </div>
        <div
          v-if="s.out && (i !== lastIdx || outReady)"
          class="out" :class="s.tone"
          v-html="outHtml(s)"
        />
      </template>
      <div v-if="typing === -1" class="line"><span class="pr">{{ prompt }} </span><span class="caret" /></div>
    </div>
  </div>
</template>

<style scoped>
.term { background: #fbfcfc; border: 1px solid var(--tb-rule); font-family: var(--tb-mono); line-height: 1.6; display: flex; flex-direction: column; overflow: hidden; }
.bar { display: flex; gap: 7px; align-items: center; padding: 8px 12px; border-bottom: 1px solid var(--tb-rule); background: #f1f4f4; }
.bar i { width: 10px; height: 10px; border-radius: 50%; background: #d3d9dc; }
.bar span { margin-left: 8px; font-size: 11px; color: var(--tb-mut); font-family: var(--tb-sans); letter-spacing: .06em; }
.body { padding: 12px 16px; white-space: pre; overflow: auto; flex: 1; }
.pr { color: var(--tb-teal); }
.out { color: #4a545e; }
.out.err { color: var(--tb-red); }
.out.ok { color: var(--tb-teal); font-weight: 500; }
.out.mut { color: #8a939c; }
.caret { display: inline-block; width: .55em; height: 1.15em; background: var(--tb-teal); vertical-align: -.2em; animation: blink 1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0 } }
</style>
