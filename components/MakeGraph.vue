<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

/**
 * Makefile 依賴圖：隨 click 標出「被改過」（紅）與「被重新編譯」（綠）的檔案
 *
 *   <MakeGraph :steps="[
 *     { label: '初始狀態' },
 *     { label: '第一次 make', rebuilt: ['main.o', 'utils.o', 'program'] },
 *     { label: '第二次 make：up to date' },
 *     { label: 'touch utils.c', dirty: ['utils.c'] },
 *     { label: '第三次 make', dirty: ['utils.c'], rebuilt: ['utils.o', 'program'] },
 *   ]" />
 *
 * 預設節點是講義的 main.c / utils.c 範例，也可用 nodes / edges 換成別的專案
 */
interface Node { id: string, x: number, y: number }
interface Step { label?: string, dirty?: string[], rebuilt?: string[], fresh?: string[] }
const props = withDefaults(defineProps<{
  steps: Step[]
  nodes?: Node[]
  edges?: [string, string][]
  offset?: number
  width?: number
  height?: number
}>(), {
  offset: 0,
  width: 380,
  height: 250,
  nodes: () => [
    { id: 'program', x: 190, y: 36 },
    { id: 'main.o', x: 95, y: 125 },
    { id: 'utils.o', x: 285, y: 125 },
    { id: 'main.c', x: 95, y: 214 },
    { id: 'utils.c', x: 285, y: 214 },
  ],
  edges: () => [['main.c', 'main.o'], ['utils.c', 'utils.o'], ['main.o', 'program'], ['utils.o', 'program']],
})

const { $clicks } = useSlideContext()
const step = computed(() => props.steps[Math.min(Math.max($clicks.value - props.offset, 0), props.steps.length - 1)] ?? {})
const pos = computed(() => Object.fromEntries(props.nodes.map(n => [n.id, n])))
function state(id: string) {
  if (step.value.rebuilt?.includes(id)) return 'rebuilt'
  if (step.value.dirty?.includes(id)) return 'dirty'
  return ''
}
const W = 92
const H = 34
function edgePath([a, b]: [string, string]) {
  const s = pos.value[a]; const t = pos.value[b]
  return { x1: s.x, y1: s.y - H / 2, x2: t.x, y2: t.y + H / 2 + 4 }
}
// 邊變色：target 被重新編譯，而且 source 是新的（dirty / rebuilt / fresh）
const edgeHot = (e: [string, string]) => state(e[1]) === 'rebuilt'
  && (state(e[0]) !== '' || !!step.value.fresh?.includes(e[0]))
</script>

<template>
  <div class="mg">
    <svg :viewBox="`0 0 ${width} ${height}`" :width="width" :height="height">
      <defs>
        <marker id="mg-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#1a1a1a" />
        </marker>
      </defs>
      <line
        v-for="e in edges" :key="e.join('>')" v-bind="edgePath(e)"
        class="edge" :class="{ hot: edgeHot(e) }" marker-end="url(#mg-arr)"
      />
      <g v-for="n in nodes" :key="n.id" class="node" :class="state(n.id)">
        <rect :x="n.x - W / 2" :y="n.y - H / 2" :width="W" :height="H" />
        <text :x="n.x" :y="n.y + 5" text-anchor="middle">{{ n.id }}</text>
      </g>
    </svg>
    <div class="legend">
      <span class="k dirty" />修改過 <span class="k rebuilt" />重新編譯
      <Transition name="fade" mode="out-in"><b :key="step.label">{{ step.label }}</b></Transition>
    </div>
  </div>
</template>

<style scoped>
.mg { font-family: var(--tb-sans); }
.edge { stroke: #1a1a1a; stroke-width: 1.4; transition: stroke .35s; }
.edge.hot { stroke: var(--tb-teal); stroke-width: 2.4; }
.node rect { fill: var(--tb-node-bg); stroke: var(--tb-node-line); stroke-width: 1.5; transition: fill .35s; }
.node text { font-family: var(--tb-mono); font-size: 14px; fill: var(--tb-ink); }
.node.dirty rect { fill: #f7c9c3; }
.node.rebuilt rect { fill: var(--tb-node-on); }
.legend { font-size: 12.5px; color: var(--tb-mut); display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.legend b { margin-left: auto; color: var(--tb-teal); font-weight: 600; font-size: 14px; }
.k { display: inline-block; width: 12px; height: 12px; border: 1.2px solid #1a1a1a; margin-left: 8px; }
.k.dirty { background: #f7c9c3; margin-left: 0; }
.k.rebuilt { background: var(--tb-node-on); }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
