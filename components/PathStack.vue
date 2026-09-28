<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

/**
 * 把 PATH 畫成一疊目錄：load 時新路徑從最上面插入，which 由上往下找第一個符合的
 *
 *   <PathStack cmd="zstd" :steps="[
 *     { label: 'load 前', path: ['/usr/local/bin', '/usr/bin', '/bin'] },
 *     { label: 'module load zstd/1.5.6', path: ['~/opt/zstd/1.5.6/bin', '/usr/local/bin', '/usr/bin', '/bin'], has: ['~/opt/zstd/1.5.6/bin'] },
 *     { label: 'module unload zstd/1.5.6', path: ['/usr/local/bin', '/usr/bin', '/bin'] },
 *   ]" />
 *
 * - has：哪些目錄裡真的有 cmd 這個執行檔；which 會停在第一個
 * - Module 和 Spack 兩章共用（Spack 那頁把路徑換成帶 hash 的目錄）
 */
interface Step { label?: string, path: string[], has?: string[] }
const props = withDefaults(defineProps<{
  steps: Step[]
  cmd?: string
  varName?: string
  offset?: number
}>(), { cmd: 'zstd', varName: 'PATH', offset: 0 })

const { $clicks } = useSlideContext()
const idx = computed(() => Math.min(Math.max($clicks.value - props.offset, 0), props.steps.length - 1))
const step = computed(() => props.steps[idx.value])
const prev = computed(() => props.steps[Math.max(idx.value - 1, 0)])
const hit = computed(() => step.value.path.find(p => step.value.has?.includes(p)))
const isNew = (p: string) => idx.value > 0 && !prev.value.path.includes(p)
</script>

<template>
  <div class="ps">
    <div class="ps-head">
      <span class="var">${{ varName }}</span>
      <Transition name="fade" mode="out-in"><span :key="step.label" class="lab">{{ step.label }}</span></Transition>
    </div>
    <TransitionGroup name="stack" tag="div" class="stack">
      <div v-for="(p, i) in step.path" :key="p" class="dir" :class="{ hit: p === hit, fresh: isNew(p) }">
        <span class="n">{{ i + 1 }}</span>{{ p }}
        <span v-if="p === hit" class="tag">找到 {{ cmd }}</span>
        <span v-else-if="isNew(p)" class="tag new">prepend</span>
      </div>
    </TransitionGroup>
    <div class="which">
      <span class="pr">$</span> which {{ cmd }}
      <span class="res" :class="{ none: !hit }">→ {{ hit ? `${hit}/${cmd}` : '（找不到，沒有輸出）' }}</span>
    </div>
  </div>
</template>

<style scoped>
.ps { font-family: var(--tb-mono); font-size: 13px; }
.ps-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
.var { color: var(--tb-orange); font-weight: 500; }
.lab { font-family: var(--tb-sans); font-size: 14px; font-weight: 500; color: var(--tb-teal); }
.stack { position: relative; display: flex; flex-direction: column; gap: 5px; }
.dir {
  border: 1.4px solid var(--tb-node-line); background: var(--tb-node-bg); padding: 4px 10px;
  display: flex; align-items: center; gap: 10px; transition: background-color .35s;
}
.dir .n { color: var(--tb-mut); font-size: 11px; width: 12px; }
.dir.fresh { background: var(--tb-teal-soft); }
.dir.hit { background: var(--tb-node-on); }
.tag { margin-left: auto; font-family: var(--tb-sans); font-size: 11.5px; font-weight: 500; color: var(--tb-ink); }
.tag.new { color: var(--tb-teal); }
.which { margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--tb-rule); }
.which .pr { color: var(--tb-teal); }
.res { display: block; margin-top: 2px; color: var(--tb-teal); }
.res.none { color: var(--tb-mut); font-family: var(--tb-sans); }
.stack-move, .stack-enter-active, .stack-leave-active { transition: all .45s cubic-bezier(.3, .7, .2, 1); }
.stack-enter-from { opacity: 0; transform: translateY(-24px); }
.stack-leave-to { opacity: 0; transform: translateX(30px); }
.stack-leave-active { position: absolute; left: 0; right: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
