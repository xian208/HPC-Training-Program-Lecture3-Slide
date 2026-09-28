<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useSlideContext } from '@slidev/client'

/**
 * 編譯四階段 pipeline（取代 CS:APP 那張圖）
 *
 *   <CompilePipeline clicks />          總覽頁：第 k 次 click 亮出第 k 個階段
 *   <CompilePipeline :active="2" />      各階段小節：全部顯示，只亮目前這一站（當作導覽列）
 *
 * 顏色沿用參考 artifact 的方塊風格：程式是黑框灰底方塊，目前階段轉綠
 */
const props = withDefaults(defineProps<{
  clicks?: boolean
  active?: number
  offset?: number
  small?: boolean
}>(), { clicks: false, active: 0, offset: 0, small: false })

const stages = [
  { prog: 'Preprocessor', bin: 'cpp', phase: 'Preprocessing', out: 'hello.i', kind: 'text' },
  { prog: 'Compiler', bin: 'cc1', phase: 'Compilation', out: 'hello.s', kind: 'text' },
  { prog: 'Assembler', bin: 'as', phase: 'Assembly', out: 'hello.o', kind: 'binary' },
  { prog: 'Linker', bin: 'ld', phase: 'Linking', out: 'hello', kind: 'binary' },
]

const { $clicks } = useSlideContext()
const cur = computed(() => props.clicks ? Math.max($clicks.value - props.offset, 0) : props.active)
const reached = (i: number) => !props.clicks || cur.value >= i + 1
const isActive = (i: number) => cur.value === i + 1

// 自動縮放：放在有旁註的窄欄位時，整條 pipeline 等比例縮小到剛好塞得下
const outer = ref<HTMLElement>()
const inner = ref<HTMLElement>()
const scale = ref(1)
const h = ref<number>()
let ro: ResizeObserver | undefined
function fit() {
  if (!outer.value || !inner.value) return
  const natural = inner.value.scrollWidth
  scale.value = Math.min(1, outer.value.clientWidth / natural) * (props.small ? 0.85 : 1)
  h.value = inner.value.offsetHeight * scale.value
}
onMounted(() => { fit(); ro = new ResizeObserver(fit); ro.observe(outer.value!) })
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <div ref="outer" class="pipe-outer" :style="{ height: h ? `${h}px` : undefined }">
  <div ref="inner" class="pipe" :class="{ small }" :style="{ transform: `scale(${scale})` }">
    <div class="row">
      <div class="file src">hello.c<em>source (text)</em></div>
      <template v-for="(s, i) in stages" :key="s.prog">
        <div class="arrow" :class="{ off: !reached(i) }" />
        <div class="stage" :class="{ off: !reached(i) }">
          <div class="node" :class="{ on: isActive(i) }">
            <b>{{ s.prog }}</b>
            <code>{{ s.bin }}</code>
          </div>
          <div class="phase">{{ s.phase }}</div>
          <div v-if="i === 3" class="lib" :class="{ on: isActive(3) }">printf.o<br><em>libc</em></div>
        </div>
        <div class="arrow" :class="{ off: !reached(i) }" />
        <div class="file" :class="{ off: !reached(i), bin: s.kind === 'binary', on: isActive(i) }">
          {{ s.out }}<em>{{ i === 3 ? 'executable' : s.kind }}</em>
        </div>
      </template>
    </div>
  </div>
  </div>
</template>

<style scoped>
.pipe-outer { width: 100%; overflow: visible; }
.pipe { font-family: var(--tb-sans); padding: 6px 0 64px; width: max-content; transform-origin: left top; }
.row { display: flex; align-items: center; }
.file {
  font-family: var(--tb-mono); font-size: 14px; text-align: center; line-height: 1.2;
  padding: 6px 4px; transition: opacity .35s, color .35s; flex: none;
}
.file em { display: block; font-style: normal; font-family: var(--tb-sans); font-size: 10.5px; color: var(--tb-mut); letter-spacing: .04em; }
.file.on { color: var(--tb-teal); font-weight: 500; }
.stage { position: relative; transition: opacity .35s; flex: none; }
.node {
  border: 1.5px solid var(--tb-node-line); background: var(--tb-node-bg); width: 116px; padding: 10px 6px;
  text-align: center; transition: background-color .35s;
}
.node b { display: block; font-weight: 500; font-size: 14px; }
.node code { font-size: 11.5px; background: none; border: 0; color: var(--tb-mut); }
.node.on { background: var(--tb-node-on); }
.phase { position: absolute; left: 0; right: 0; top: calc(100% + 6px); text-align: center; font-size: 12px; color: var(--tb-teal); font-weight: 500; letter-spacing: .04em; }
.lib {
  position: absolute; left: 50%; transform: translateX(-50%); top: calc(100% + 28px);
  font-family: var(--tb-mono); font-size: 12px; border: 1.2px dashed var(--tb-node-line); padding: 2px 8px; text-align: center; background: #fff; white-space: nowrap; line-height: 1.25;
}
.lib em { font-style: normal; font-family: var(--tb-sans); font-size: 10px; color: var(--tb-mut); }
.lib.on { background: var(--tb-node-on); }
.arrow { flex: 1 1 10px; min-width: 10px; height: 1.5px; background: var(--tb-node-line); position: relative; transition: opacity .35s; }
.arrow::after { content: ""; position: absolute; right: -1px; top: -4px; border: 4.5px solid transparent; border-left: 7px solid var(--tb-node-line); border-right: 0; }
.off { opacity: .18; }
.small { padding-bottom: 30px; }
.small .lib { display: none; }
</style>
