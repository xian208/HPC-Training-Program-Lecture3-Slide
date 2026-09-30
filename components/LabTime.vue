<script setup lang="ts">
/**
 * Lab 時間頁：左邊是時間與要做的事（slot，寫 markdown 清單），右邊是 Slido 回報進度
 *
 *   <LabTime minutes="15" break-minutes="10">
 *
 *   - **Part A**：填完 6 個 TODO，make 並執行
 *
 *   </LabTime>
 *
 * 進度調查（例如「還在 Part A / Part A 完成 / 全部完成 / 卡住了」）要另外在 Slido 後台建立 poll
 */
defineProps<{ minutes: number | string, breakMinutes?: number | string, caption?: string }>()
</script>

<template>
  <div class="lab">
    <div>
      <div class="time">
        <span class="min">{{ minutes }}</span><span class="unit">分鐘</span>
        <span v-if="breakMinutes" class="brk">＋ 休息 {{ breakMinutes }} 分鐘</span>
      </div>
      <div class="tasks"><slot /></div>
    </div>
    <SlidoJoin :caption="caption ?? '在 Slido 回報進度'" />
  </div>
</template>

<style scoped>
.lab { display: grid; grid-template-columns: minmax(0, 1fr) 190px; gap: 44px; align-items: center; }
.time { display: flex; align-items: baseline; gap: 8px; margin-bottom: 14px; }
.min { font-family: var(--tb-mono); font-size: 56px; line-height: 1; color: var(--tb-accent); }
.unit { font-size: 20px; color: var(--tb-accent); }
.brk { margin-left: 14px; font-size: 18px; color: var(--tb-mut); }
.tasks :deep(ul) { margin: 0; }
</style>
