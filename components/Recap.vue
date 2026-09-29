<script setup lang="ts">
/**
 * 段落回顧：一排卡片，每張是一個章節的重點
 *
 *   <Recap :items="[
 *     { ch: '02', label: 'Compiler', note: 'flag 決定速度與相容性' },
 *     { ch: '03', label: '編譯四階段', note: '前處理 → 編譯 → 組譯 → 連結' },
 *   ]" />
 *
 * label、note 會被 npm run check 檢查字數；卡片建議不超過 3 張
 */
defineProps<{ items: { ch?: string, label: string, note: string }[] }>()
</script>

<template>
  <div class="recap" :style="{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }">
    <div v-for="(it, i) in items" :key="i" class="card">
      <span class="ch">{{ it.ch ?? String(i + 1).padStart(2, '0') }}</span>
      <b>{{ it.label }}</b>
      <p>{{ it.note }}</p>
    </div>
  </div>
</template>

<style scoped>
.recap { display: grid; gap: 22px; }
.card {
  border-top: 3px solid var(--tb-accent); background: var(--tb-code);
  padding: 18px 20px 20px; min-height: 150px;
}
.ch { display: block; font-family: var(--tb-mono); font-size: 13px; letter-spacing: .08em; color: var(--tb-accent); }
b { display: block; font-family: var(--tb-serif); font-weight: 500; font-size: 25px; margin: 6px 0 10px; color: var(--tb-ink); }
p { margin: 0 !important; font-size: 18px; line-height: 1.55; color: var(--tb-mut); }
</style>
