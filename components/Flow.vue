<script setup lang="ts">
import { computed, useId } from 'vue'
import { useSlideContext } from '@slidev/client'

/**
 * 通用流程圖：方塊＋箭頭＋外框，隨 click 逐步出現或變色（沿用 MakeGraph 的方塊風格）
 *
 *   <Flow :width="760" :height="220"
 *     :nodes="[
 *       { id: 'src', x: 80, y: 60, label: 'hello.c' },
 *       { id: 'exe', x: 300, y: 60, label: 'hello', at: 1, tone: 'on' },
 *     ]"
 *     :edges="[{ from: 'src', to: 'exe', label: 'gcc', at: 1 }]"
 *     :groups="[{ x: 20, y: 20, w: 400, h: 90, label: 'login node' }]" />
 *
 * - x、y 是方塊中心；w 預設 110，h 預設 40（有 sub 時 52）
 * - at：第幾個 click 出現（預設 0 = 一開始就在）；until：第幾個 click 消失
 * - tone：'' | 'on'（綠）| 'bad'（紅）| 'dim'（淡）| 'plain'（白底）；tones: { 2: 'bad' } 在第 2 個 click 換色
 * - edge 預設從方塊邊緣接到方塊邊緣；dashed 畫虛線；bend 讓線走 L 形（'h' 先水平、'v' 先垂直），'u' 從底部繞回去；lpos: [x, y] 自訂標籤位置（靠左對齊）
 */
interface N { id: string, x: number, y: number, w?: number, h?: number, label: string, sub?: string, at?: number, until?: number, tone?: string, tones?: Record<number, string>, mono?: boolean }
interface E { from: string, to: string, label?: string, at?: number, until?: number, dashed?: boolean, tone?: string, tones?: Record<number, string>, bend?: 'h' | 'v' | 'u', lpos?: [number, number] }
interface G { x: number, y: number, w: number, h: number, label?: string, at?: number, until?: number, tone?: string }
const props = withDefaults(defineProps<{
  nodes: N[]
  edges?: E[]
  groups?: G[]
  width?: number
  height?: number
  offset?: number
  step?: number
}>(), { edges: () => [], groups: () => [], width: 760, height: 240, offset: 0, step: -1 })

const { $clicks } = useSlideContext()
const k = computed(() => props.step >= 0 ? props.step : $clicks.value - props.offset)
const vis = (o: { at?: number, until?: number }) => k.value >= (o.at ?? 0) && (o.until == null || k.value < o.until)
function toneOf(o: { tone?: string, tones?: Record<number, string> }) {
  let t = o.tone ?? ''
  for (const [c, v] of Object.entries(o.tones ?? {}).sort((a, b) => +a[0] - +b[0]))
    if (k.value >= +c) t = v
  return t
}
const byId = computed(() => Object.fromEntries(props.nodes.map(n => [n.id, n])))
const MARKERS = [{ k: 'def', c: '#1a1a1a' }, { k: 'on', c: '#1f5fa8' }, { k: 'bad', c: '#9b2c20' }]
// 每個 Flow 用自己的 marker id：同名的 id 會對應到文件裡第一個，常常是被隱藏的其他投影片，箭頭就畫不出來
const uid = useId()
const arrow = (e: E) => `url(#${uid}-arr-${['on', 'bad'].includes(toneOf(e)) ? toneOf(e) : 'def'})`
const W = (n: N) => n.w ?? 110
const H = (n: N) => n.h ?? (n.sub ? 52 : 40)

// 從 a 中心往 b 中心的方向，找 a 方塊邊緣上的點
function edgePoint(a: N, tx: number, ty: number) {
  const dx = tx - a.x; const dy = ty - a.y
  if (dx === 0 && dy === 0) return { x: a.x, y: a.y }
  const sx = (W(a) / 2) / Math.abs(dx || 1e-9); const sy = (H(a) / 2) / Math.abs(dy || 1e-9)
  const s = Math.min(sx, sy)
  return { x: a.x + dx * s, y: a.y + dy * s }
}
function path(e: E) {
  const a = byId.value[e.from]; const b = byId.value[e.to]
  if (!a || !b) return { d: '', lx: 0, ly: 0 }
  if (e.bend === 'u') {
    // 從兩個方塊的底部往下繞：用在同一排、要畫「回頭」箭頭的時候
    const y1 = a.y + H(a) / 2; const y2 = b.y + H(b) / 2; const ry = Math.max(y1, y2) + 26
    return { d: `M${a.x},${y1} L${a.x},${ry} L${b.x},${ry} L${b.x},${y2}`, lx: (a.x + b.x) / 2, ly: ry + 16 }
  }
  if (e.bend) {
    const c = e.bend === 'h' ? { x: b.x, y: a.y } : { x: a.x, y: b.y }
    const p1 = edgePoint(a, c.x, c.y); const p2 = edgePoint(b, c.x, c.y)
    return { d: `M${p1.x},${p1.y} L${c.x},${c.y} L${p2.x},${p2.y}`, lx: c.x, ly: c.y - 8 }
  }
  const p1 = edgePoint(a, b.x, b.y); const p2 = edgePoint(b, a.x, a.y)
  return { d: `M${p1.x},${p1.y} L${p2.x},${p2.y}`, lx: (p1.x + p2.x) / 2, ly: (p1.y + p2.y) / 2 - 8 }
}
</script>

<template>
  <svg class="flow" :viewBox="`0 0 ${width} ${height}`" :style="{ maxWidth: `${width}px` }">
    <defs>
      <marker v-for="m in MARKERS" :id="`${uid}-arr-${m.k}`" :key="m.k" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" :fill="m.c" />
      </marker>
    </defs>
    <g v-for="(g, i) in groups" :key="`g${i}`" class="grp" :class="[g.tone, { hide: !vis(g) }]">
      <rect :x="g.x" :y="g.y" :width="g.w" :height="g.h" />
      <text v-if="g.label" :x="g.x + 10" :y="g.y + 18">{{ g.label }}</text>
    </g>
    <g v-for="(e, i) in edges" :key="`e${i}`" class="edge" :class="[toneOf(e), { hide: !vis(e), dashed: e.dashed }]">
      <path :d="path(e).d" :marker-end="arrow(e)" />
      <text v-if="e.label" :x="e.lpos?.[0] ?? path(e).lx" :y="e.lpos?.[1] ?? path(e).ly" :text-anchor="e.lpos ? 'start' : 'middle'">{{ e.label }}</text>
    </g>
    <g v-for="n in nodes" :key="n.id" class="node" :class="[toneOf(n), { hide: !vis(n), mono: n.mono !== false }]">
      <rect :x="n.x - W(n) / 2" :y="n.y - H(n) / 2" :width="W(n)" :height="H(n)" />
      <text :x="n.x" :y="n.sub ? n.y - 4 : n.y + 5" text-anchor="middle" class="lb">{{ n.label }}</text>
      <text v-if="n.sub" :x="n.x" :y="n.y + 15" text-anchor="middle" class="sb">{{ n.sub }}</text>
    </g>
  </svg>
</template>

<style scoped>
.flow { font-family: var(--tb-sans); overflow: visible; display: block; width: 100%; height: auto; }
.hide { opacity: 0; }
.node, .edge, .grp { transition: opacity .35s; }
.node rect { fill: var(--tb-node-bg); stroke: var(--tb-node-line); stroke-width: 1.5; transition: fill .35s; }
.node.on rect { fill: var(--tb-node-on); }
.node.bad rect { fill: #f7c9c3; }
.node.plain rect { fill: #fff; }
.node.dim { opacity: .38; }
.node.dim.hide { opacity: 0; }
.node .lb { font-size: 15.5px; fill: var(--tb-ink); }
.node.mono .lb { font-family: var(--tb-mono); font-size: 15px; }
.node .sb { font-family: var(--tb-sans); font-size: 13px; fill: var(--tb-mut); }
.edge path { fill: none; stroke: #1a1a1a; stroke-width: 1.5; transition: stroke .35s; }
.edge.dashed path { stroke-dasharray: 5 4; }
.edge.on path { stroke: var(--tb-accent); stroke-width: 2.4; }
.edge.bad path { stroke: var(--tb-red); stroke-width: 2.2; }
.edge text { font-size: 13.5px; fill: var(--tb-mut); paint-order: stroke; stroke: #fff; stroke-width: 4px; }
.edge.on text { fill: var(--tb-accent); }
.edge.bad text { fill: var(--tb-red); }
.grp rect { fill: none; stroke: var(--tb-rule); stroke-width: 1.5; stroke-dasharray: 4 4; }
.grp.solid rect { stroke: var(--tb-mut); stroke-dasharray: none; fill: #fafbfb; }
.grp text { font-size: 13px; font-weight: 500; letter-spacing: .06em; fill: var(--tb-accent); }
</style>
