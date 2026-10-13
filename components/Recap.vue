<script setup lang="ts">
/**
 * 段落回顧：每個章節一列，章節編號、名稱、一句重點與關鍵字，列與列之間用細線分隔
 *
 *   <Recap :items="[
 *     { ch: '02', label: 'Compiler', note: 'flag 決定速度與相容性', keys: ['-O3', '-march', '-g'] },
 *   ]" />
 *
 * label、note 會被 npm run check 檢查字數；建議不超過 3 列
 */
defineProps<{ items: { ch?: string, label: string, note: string, keys?: string[] }[] }>()
</script>

<template>
  <div class="recap">
    <div v-for="(it, i) in items" :key="i" class="row">
      <span class="ch">{{ it.ch ?? String(i + 1).padStart(2, '0') }}</span>
      <div class="body">
        <b>{{ it.label }}</b>
        <p>{{ it.note }}</p>
      </div>
      <div v-if="it.keys?.length" class="keys">
        <code v-for="k in it.keys" :key="k">{{ k }}</code>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recap { display: flex; flex-direction: column; height: 360px; justify-content: center; }
.row {
  display: grid; grid-template-columns: 64px 1fr auto; align-items: center; column-gap: 24px;
  padding: 20px 0; border-top: 1px solid var(--tb-rule);
}
.row:last-child { border-bottom: 1px solid var(--tb-rule); }
.ch { font-family: var(--tb-mono); font-size: 34px; line-height: 1; color: var(--tb-accent); }
b { display: block; font-family: var(--tb-serif); font-weight: 500; font-size: 26px; color: var(--tb-ink); }
p { margin: 4px 0 0 !important; font-size: 19px; line-height: 1.5; color: var(--tb-mut); word-break: keep-all; }
.keys { display: flex; flex-wrap: nowrap; gap: 8px; justify-content: flex-end; }
.keys code { font-size: 16px !important; background: var(--tb-accent-soft) !important; border: 0 !important; padding: 2px 8px !important; color: var(--tb-accent); }
</style>
