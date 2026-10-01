<script setup lang="ts">
/**
 * Lab 時間頁：要做的事（slot，寫 markdown 清單）
 *
 *   <LabTime>
 *
 *   - **Part A**：填完 6 個 TODO，make 並執行
 *
 *   </LabTime>
 */
</script>

<template>
  <div class="lab"><slot /></div>
</template>

<style scoped>
.lab :deep(ul) { margin: 0; }
.lab :deep(li) { font-size: 24px; }
</style>
