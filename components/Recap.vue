<script setup lang="ts">
/**
 * 段落回顧：整頁的卡片，每張是一個章節的重點與關鍵字
 *
 *   <Recap :items="[
 *     { ch: '02', label: 'Compiler', note: 'flag 決定速度與相容性', keys: ['-O3', '-march', '-g'] },
 *   ]" />
 *
 * label、note 會被 npm run check 檢查字數；卡片建議不超過 3 張
 */
defineProps<{ items: { ch?: string, label: string, note: string, keys?: string[] }[] }>()
</script>

<template>
  <div class="recap" :style="{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }">
    <div v-for="(it, i) in items" :key="i" class="card">
      <span class="ch">{{ it.ch ?? String(i + 1).padStart(2, '0') }}</span>
      <b>{{ it.label }}</b>
      <p>{{ it.note }}</p>
      <div v-if="it.keys?.length" class="keys">
        <code v-for="k in it.keys" :key="k">{{ k }}</code>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recap { display: grid; gap: 22px; height: 340px; }
.card {
  display: flex; flex-direction: column;
  border: 1.5px solid #c9d8ec; border-top: 4px solid var(--tb-accent); background: #f6f9fd;
  padding: 20px 22px 22px;
}
.ch { font-family: var(--tb-mono); font-size: 34px; line-height: 1; color: var(--tb-accent); opacity: .35; }
b { display: block; font-family: var(--tb-serif); font-weight: 500; font-size: 27px; margin: 14px 0 10px; color: var(--tb-ink); }
p { margin: 0 !important; font-size: 19px; line-height: 1.55; color: var(--tb-mut); }
.keys { margin-top: auto; padding-top: 18px; display: flex; flex-wrap: wrap; gap: 6px; }
.keys code { font-size: 14px !important; background: #fff !important; border: 1px solid #c9d8ec !important; padding: 2px 8px !important; color: var(--tb-accent); }
</style>
