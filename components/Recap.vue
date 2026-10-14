<script setup lang="ts">
/**
 * 段落回顧：每個章節一列，左邊章節編號與名稱，右邊一句重點，列與列之間用細線分隔
 *
 *   <Recap :items="[
 *     { ch: '02', label: 'Compiler', note: '編譯參數影響效能與相容性' },
 *   ]" />
 *
 * label、note 會被 npm run check 檢查字數；建議不超過 3 列
 */
defineProps<{ items: { ch?: string, label: string, note: string }[] }>()
</script>

<template>
  <div class="recap">
    <div v-for="(it, i) in items" :key="i" class="row">
      <span class="ch">{{ it.ch ?? String(i + 1).padStart(2, '0') }}</span>
      <b>{{ it.label }}</b>
      <p>{{ it.note }}</p>
    </div>
  </div>
</template>

<style scoped>
.recap { display: flex; flex-direction: column; height: 360px; justify-content: center; }
.row {
  display: grid; grid-template-columns: 64px 280px 1fr; align-items: center; column-gap: 24px;
  padding: 30px 0; border-top: 1px solid var(--tb-rule);
}
.row:last-child { border-bottom: 1px solid var(--tb-rule); }
.ch { font-family: var(--tb-mono); font-size: 34px; line-height: 1; color: var(--tb-accent); }
b { font-family: var(--tb-serif); font-weight: 500; font-size: 27px; color: var(--tb-ink); }
p { margin: 0 !important; font-size: 21px; line-height: 1.5; color: var(--tb-mut); word-break: keep-all; }
</style>
