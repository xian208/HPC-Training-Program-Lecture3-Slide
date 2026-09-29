<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

/**
 * target_include_directories 的 PUBLIC / PRIVATE：include 路徑會不會沿著 link 傳下去
 *   click 1：math_utils 帶著自己的 include 路徑
 *   click 2：program link 到 math_utils，路徑沿著箭頭往下傳
 *   click 3：改成 PRIVATE，路徑在半路被擋下，program 編譯失敗
 */
const props = withDefaults(defineProps<{ offset?: number }>(), { offset: 0 })
const { $clicks } = useSlideContext()
const s = computed(() => Math.max($clicks.value - props.offset, 0))
const mode = computed(() => s.value >= 3 ? 'PRIVATE' : 'PUBLIC')
</script>

<template>
  <div class="ip">
    <div class="box lib">
      <div class="nm">math_utils <em>add_library(… STATIC)</em></div>
      <div class="inc" :class="{ show: s >= 1 }">
        -I lib/ <span class="kw" :class="mode">{{ mode }}</span>
      </div>
    </div>
    <div class="link">
      <div class="line" :class="{ flow: s === 2, blocked: s >= 3 }" />
      <div class="lbl">target_link_libraries(program PRIVATE math_utils …)</div>
      <div class="pkt" :class="{ go: s === 2, stop: s >= 3 }">-I lib/</div>
      <div v-if="s >= 3" class="x">✗</div>
    </div>
    <div class="box exe" :class="{ ok: s === 2, bad: s >= 3 }">
      <div class="nm">program <em>add_executable</em></div>
      <div class="inc" :class="{ show: s === 2 }">-I lib/（繼承）</div>
      <!-- 實際錯誤訊息是 Lab3-3 Part B 第 1 題要學生自己找的，這裡刻意不寫出來 -->
      <div v-if="s >= 3" class="err">找不到 math_utils 的 header → 編譯失敗</div>
    </div>
  </div>
</template>

<style scoped>
.ip { font-family: var(--tb-sans); display: flex; flex-direction: column; align-items: flex-start; }
.box { border: 1.5px solid var(--tb-node-line); background: var(--tb-node-bg); padding: 10px 14px; min-width: 330px; transition: background-color .35s; }
.box.ok { background: var(--tb-node-on); }
.box.bad { background: #f7c9c3; }
.nm { font-family: var(--tb-mono); font-weight: 500; font-size: 15px; }
.nm em { font-family: var(--tb-sans); font-style: normal; font-size: 12px; color: var(--tb-mut); margin-left: 6px; }
.inc { font-family: var(--tb-mono); font-size: 13px; margin-top: 4px; opacity: 0; transition: opacity .35s; }
.inc.show { opacity: 1; }
.kw { font-size: 11px; padding: 0 5px; border: 1.2px solid; margin-left: 6px; }
.kw.PUBLIC { color: var(--tb-accent); }
.kw.PRIVATE { color: var(--tb-red); }
.link { position: relative; height: 92px; width: 330px; }
.line { position: absolute; left: 40px; top: 0; bottom: 0; width: 2px; background: #1a1a1a; }
.line.flow { background: var(--tb-accent); width: 3px; }
.lbl { position: absolute; left: 56px; top: 36px; font-family: var(--tb-mono); font-size: 11.5px; color: var(--tb-mut); white-space: nowrap; }
.pkt { position: absolute; left: 14px; top: 4px; font-family: var(--tb-mono); font-size: 11px; background: #fff; border: 1.2px solid var(--tb-accent); padding: 0 4px; opacity: 0; transition: top .7s ease, opacity .3s; }
.pkt.go { opacity: 1; top: 64px; }
.pkt.stop { opacity: 1; top: 30px; border-color: var(--tb-red); color: var(--tb-red); }
.x { position: absolute; left: 50px; top: 58px; color: var(--tb-red); font-size: 24px; font-weight: 500; }
.err { font-family: var(--tb-mono); font-size: 11.5px; color: var(--tb-red); margin-top: 4px; }
</style>
