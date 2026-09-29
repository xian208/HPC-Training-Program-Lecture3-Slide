<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

/**
 * Linker 的兩步：symbol resolution → relocation（以 static link 為例，比較好畫）
 *   click 0：hello.o 裡 printf 的位址是空的
 *   click 1：symbol resolution —— 到 libc.a 找到 printf.o
 *   click 2：把 hello.o 與 printf.o 合成執行檔
 *   click 3：relocation —— 決定最終位址，填回 call 指令
 * 位址是示意用的，不是真的 objdump 結果
 */
const props = withDefaults(defineProps<{ offset?: number }>(), { offset: 0 })
const { $clicks } = useSlideContext()
const s = computed(() => Math.max($clicks.value - props.offset, 0))
const libs = ['printf.o', 'scanf.o', 'malloc.o', 'free.o']
const notes = [
  'hello.o 知道要呼叫 printf，但不知道它在哪',
  'Symbol resolution：到 libc.a 找到 printf 的定義',
  '把用到的 object file 合併成一個執行檔',
  'Relocation：決定最終位址，更新所有 reference',
]
</script>

<template>
  <div class="lr">
    <div class="col">
      <div class="cap">hello.o</div>
      <div class="obj">
        <div>main:</div>
        <div class="ind">…</div>
        <div class="ind">
          call <span class="hole" :class="{ found: s >= 1, fixed: s >= 3 }">{{ s >= 3 ? '0x401040' : s >= 1 ? 'printf' : '????' }}</span>
        </div>
        <div class="ind">…</div>
      </div>
    </div>
    <div class="arrow" :class="{ on: s >= 1 }">{{ s >= 1 ? 'printf 在哪？→' : '' }}</div>
    <div class="col">
      <div class="cap">libc.a <em>（ar t libc.a）</em></div>
      <div class="lib">
        <div v-for="l in libs" :key="l" class="mem" :class="{ on: s >= 1 && l === 'printf.o' }">{{ l }}</div>
        <div class="mem more">⋯</div>
      </div>
    </div>
    <div class="arrow" :class="{ on: s >= 2 }">{{ s >= 2 ? '→' : '' }}</div>
    <div class="col" :class="{ off: s < 2 }">
      <div class="cap">hello <em>executable</em></div>
      <div class="exe">
        <div class="part">hello.o 的 .text<div class="ind small">call <span class="hole" :class="{ fixed: s >= 3 }">{{ s >= 3 ? '0x401040' : '????' }}</span></div></div>
        <div class="part on">printf.o 的 .text <span class="addr" :class="{ show: s >= 3 }">@ 0x401040</span></div>
      </div>
    </div>
  </div>
  <Transition name="fade" mode="out-in"><div :key="s" class="lr-note">{{ notes[Math.min(s, 3)] }}</div></Transition>
</template>

<style scoped>
.lr { display: flex; align-items: center; gap: 8px; font-family: var(--tb-mono); font-size: 13.5px; }
.col { transition: opacity .35s; }
.col.off { opacity: .15; }
.cap { font-family: var(--tb-sans); font-weight: 500; font-size: 14px; margin-bottom: 4px; }
.cap em { font-style: normal; font-weight: 400; color: var(--tb-mut); font-size: 12px; }
.obj, .lib, .exe { border: 1.5px solid var(--tb-node-line); background: var(--tb-node-bg); padding: 10px 12px; min-width: 170px; }
.ind { padding-left: 16px; }
.ind.small { font-size: 12px; }
.hole { display: inline-block; min-width: 72px; text-align: center; border: 1.5px dashed var(--tb-red); color: var(--tb-red); background: #fff; transition: all .35s; }
.hole.found { border-color: var(--tb-orange); color: var(--tb-orange); }
.hole.fixed { border-style: solid; border-color: var(--tb-accent); color: var(--tb-accent); background: var(--tb-node-on); }
.mem { border: 1.2px solid var(--tb-node-line); background: #fff; padding: 2px 8px; margin: 4px 0; transition: background-color .35s; }
.mem.on { background: var(--tb-node-on); }
.mem.more { border-style: dashed; color: var(--tb-mut); }
.part { border: 1.2px solid var(--tb-node-line); background: #fff; padding: 4px 8px; margin: 4px 0; }
.part.on { background: var(--tb-node-on); }
.addr { color: var(--tb-accent); opacity: 0; transition: opacity .35s; }
.addr.show { opacity: 1; }
.arrow { width: 96px; text-align: center; font-family: var(--tb-sans); font-size: 12.5px; color: var(--tb-accent); font-weight: 500; }
.lr-note { margin-top: 18px; font-size: 16px; font-family: var(--tb-sans); color: var(--tb-ink); border-left: 2.5px solid var(--tb-accent); padding-left: 12px; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
