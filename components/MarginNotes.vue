<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

/**
 * 右側旁註：隨 click 換成下一句（參考 artifact 選項 B 的旁註）
 *
 *   ::margin::
 *   <MarginNotes label="NOTE" :notes="['第 0 步', '第 1 次 click', '第 2 次 click']" />
 *
 * notes[i] 對應 $clicks === i；超過長度就停在最後一句；空字串代表沿用上一句。
 * 需要時用 `offset` 讓旁註晚幾個 click 才開始換。
 */
const props = withDefaults(defineProps<{
  notes: string[]
  label?: string
  offset?: number
}>(), { label: 'NOTE', offset: 0 })

const { $clicks } = useSlideContext()
// 空字串代表「這一步旁註不換」，沿用前一句
const idx = computed(() => {
  let i = Math.min(Math.max($clicks.value - props.offset, 0), props.notes.length - 1)
  while (i > 0 && !props.notes[i]) i--
  return i
})
</script>

<template>
  <div class="margin-notes">
    <strong v-if="label">{{ label }}</strong>
    <Transition name="mn" mode="out-in">
      <div :key="idx" class="mn-text" v-html="notes[idx]" />
    </Transition>
  </div>
</template>

<style scoped>
.margin-notes strong { display: block; color: var(--tb-accent); font-size: 12px; letter-spacing: .1em; margin-bottom: 6px; }
.mn-enter-active, .mn-leave-active { transition: opacity .2s; }
.mn-enter-from, .mn-leave-to { opacity: 0; }
.mn-text :deep(code) { font-size: .88em; }
</style>
