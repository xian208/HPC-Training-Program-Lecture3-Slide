<script setup lang="ts">
/**
 * Lab 時間頁：大字的時間，下面是要做的事（slot，寫 markdown 清單）
 *
 *   <LabTime minutes="15" break-minutes="10">
 *
 *   - **Part A**：填完 6 個 TODO，make 並執行
 *
 *   </LabTime>
 */
defineProps<{ minutes: number | string, breakMinutes?: number | string }>()
</script>

<template>
  <div class="lab">
    <div class="time">
      <span class="min">{{ minutes }}</span><span class="unit">分鐘</span>
      <span v-if="breakMinutes" class="brk">＋ 休息 {{ breakMinutes }} 分鐘</span>
    </div>
    <div class="tasks"><slot /></div>
  </div>
</template>

<style scoped>
.time { display: flex; align-items: baseline; gap: 8px; margin-bottom: 14px; }
.min { font-family: var(--tb-mono); font-size: 56px; line-height: 1; color: var(--tb-accent); }
.unit { font-size: 20px; color: var(--tb-accent); }
.brk { margin-left: 14px; font-size: 18px; color: var(--tb-mut); }
.tasks :deep(ul) { margin: 0; }
</style>
