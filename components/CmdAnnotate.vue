<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

/**
 * 指令逐段標註：每次 click 在一段 token 底下畫線並拉出說明（參考 artifact 選項 F）
 *
 *   <CmdAnnotate :parts="[
 *     { t: 'spack spec ' },
 *     { t: 'hdf5', label: '套件名稱' },
 *     { t: '@1.14.3', label: '@ 版本' },
 *   ]" />
 *
 * - 有 label 的 part 依序在第 1、2、3… 次 click 出現（加上 offset）
 * - label 高度自動在 3 層之間輪替避免重疊；也可用 level: 1–4 指定
 *   （技巧：由左到右 level 遞減，說明框就不會壓到右邊 token 的引線）
 * - `all` 為 true 時全部直接顯示（例如回顧頁）
 */
interface Part { t: string, label?: string, level?: number }
const props = withDefaults(defineProps<{
  parts: Part[]
  offset?: number
  fontSize?: string
  all?: boolean
}>(), { offset: 0, fontSize: '22px', all: false })

const { $clicks } = useSlideContext()
const items = computed(() => {
  let k = 0
  return props.parts.map((p) => {
    if (!p.label) return { ...p, order: -1, lv: 0 }
    const order = ++k
    return { ...p, order, lv: p.level ?? (((order - 1) % 3) + 1) }
  })
})
const isOn = (o: number) => props.all || (o > 0 && $clicks.value - props.offset >= o)
</script>

<template>
  <div class="cmd-ann" :style="{ fontSize }">
    <span
      v-for="(p, i) in items" :key="i"
      class="tok" :class="{ on: isOn(p.order), lab: !!p.label }"
    >{{ p.t }}<span v-if="p.label" class="lab-box" :style="{ '--h': `${p.lv * 34 - 14}px` }"><i /><span>{{ p.label }}</span></span></span>
  </div>
</template>

<style scoped>
.cmd-ann {
  font-family: var(--tb-mono); background: var(--tb-code); border: 1px solid var(--tb-rule);
  padding: 22px 22px 158px; white-space: pre; position: relative;
}
.tok { position: relative; display: inline-block; white-space: pre; transition: color .3s; }
.tok.lab::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: -3px; height: 3px; background: var(--tb-accent);
  transform: scaleX(0); transform-origin: left; transition: transform .35s;
}
.tok.on::after { transform: scaleX(1); }
.tok.on { color: var(--tb-accent); }
.lab-box {
  position: absolute; left: 50%; top: calc(100% + 5px); transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; opacity: 0; transition: opacity .35s; pointer-events: none;
}
.tok.on .lab-box { opacity: 1; }
.lab-box i { width: 1.5px; background: var(--tb-accent); height: var(--h); }
.lab-box span {
  font-family: var(--tb-sans); font-size: 14px; color: var(--tb-ink); white-space: nowrap;
  border: 1.2px solid var(--tb-accent); background: #fff; padding: 2px 9px;
}
</style>
