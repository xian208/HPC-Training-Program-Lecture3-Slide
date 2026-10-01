<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

/**
 * 程式從編譯到執行要過兩道關卡：link time（linker）與 load time（loader）
 * libadd 範例的三次嘗試，錯在哪一關就在那一關打叉
 *
 *   <LinkGates />                  預設 steps 就是講義 libadd 的四個狀態（0 = 還沒開始）
 *   <LinkGates :step="3" />        固定顯示某一步（LIBRARY_PATH vs LD_LIBRARY_PATH 那頁回顧用）
 */
type G = '' | 'fail' | 'pass'
interface Step { g1: G, g2: G, note?: string }
const props = withDefaults(defineProps<{
  steps?: Step[]
  step?: number
  offset?: number
}>(), {
  offset: 0,
  step: -1,
  steps: () => [
    { g1: '', g2: '' },
    { g1: 'fail', g2: '', note: 'linker 找不到 libadd' },
    { g1: 'pass', g2: 'fail', note: '編譯過了，loader 卻找不到 .so' },
    { g1: 'pass', g2: 'pass', note: '兩關都過，印出 3' },
  ],
})

const { $clicks } = useSlideContext()
const cur = computed(() => {
  const i = props.step >= 0 ? props.step : $clicks.value - props.offset
  return props.steps[Math.min(Math.max(i, 0), props.steps.length - 1)]
})
const gates = computed(() => [
  { key: 'g1', when: 'link time（編譯時）', who: 'linker（ld）', find: '-L<dir>、LIBRARY_PATH', st: cur.value.g1 },
  { key: 'g2', when: 'load time（執行時）', who: 'loader', find: 'LD_LIBRARY_PATH（、rpath）', st: cur.value.g2 },
])
</script>

<template>
  <div class="lg">
    <div class="track">
      <div class="end">use.c</div>
      <template v-for="g in gates" :key="g.key">
        <div class="seg" :class="{ ok: g.st === 'pass' || (g.key === 'g2' && cur.g1 === 'pass') }" />
        <div class="gate" :class="g.st">
          <div class="mark">{{ g.st === 'fail' ? '失敗' : g.st === 'pass' ? '通過' : '' }}</div>
          <div class="when">{{ g.when }}</div>
          <div class="who">{{ g.who }}</div>
          <div class="find">找 .so：<code>{{ g.find }}</code></div>
        </div>
      </template>
      <div class="seg" :class="{ ok: cur.g2 === 'pass' }" />
      <div class="end" :class="{ ok: cur.g2 === 'pass' }">3</div>
    </div>
    <Transition name="fade" mode="out-in"><div :key="cur.note" class="note">{{ cur.note }}</div></Transition>
  </div>
</template>

<style scoped>
.lg { font-family: var(--tb-sans); }
.track { display: flex; align-items: center; }
.end { font-family: var(--tb-mono); font-size: 14px; border: 1.4px solid var(--tb-node-line); padding: 6px 10px; background: #fff; }
.end.ok { background: var(--tb-node-on); }
.seg { flex: 1; height: 3px; background: #cfd5d8; min-width: 14px; transition: background-color .35s; }
.seg.ok { background: var(--tb-accent); }
.gate { width: 176px; border: 1.5px solid var(--tb-node-line); background: var(--tb-node-bg); padding: 8px 10px; position: relative; transition: background-color .35s; }
.gate.fail { background: #f7c9c3; }
.gate.pass { background: var(--tb-node-on); }
.mark { position: absolute; right: 8px; top: 6px; font-size: 14px; font-weight: 500; }
.gate.fail .mark { color: var(--tb-red); }
.gate.pass .mark { color: var(--tb-accent); }
.when { font-size: 12px; font-weight: 500; color: var(--tb-accent); letter-spacing: .03em; }
.who { font-size: 15px; font-weight: 500; }
.find { font-size: 12px; color: var(--tb-mut); margin-top: 3px; }
.find code { display: block; white-space: normal; font-size: 11px; background: none; border: 0; padding: 0; }
.note { margin-top: 10px; min-height: 1.4em; font-size: 15px; color: var(--tb-ink); text-align: center; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
