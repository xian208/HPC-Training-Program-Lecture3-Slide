<script setup lang="ts">
/**
 * Slido 頁：左邊是說明，右邊是 QR code 與活動代碼（見 SlidoJoin）
 *
 *   <Slido />                                    提問頁（預設文字）
 *   <Slido q="整堂課的問題都丟到 Slido" hint="…" />
 *   <Slido q="Lab3-1 做到哪了？" :options="['還在 Part A', …]" />   進度調查
 *
 * 題目與選項要另外在 Slido 後台建立 poll；投影片只負責顯示
 */
withDefaults(defineProps<{ q?: string, options?: string[], hint?: string }>(), {
  q: '想到的問題，都可以丟到 Slido',
  hint: '匿名提問，也可以幫別人的問題按讚；按讚多的先回答',
})
const letter = (i: number) => String.fromCharCode(65 + i)
</script>

<template>
  <div class="slido">
    <div>
      <p class="q">{{ q }}</p>
      <ol v-if="options?.length" class="opts" :class="{ two: options.length > 2 }">
        <li v-for="(o, i) in options" :key="i"><span>{{ letter(i) }}</span>{{ o }}</li>
      </ol>
      <p v-else class="hint">{{ hint }}</p>
    </div>
    <SlidoJoin />
  </div>
</template>

<style scoped>
.slido { display: grid; grid-template-columns: minmax(0, 1fr) 190px; gap: 44px; align-items: center; }
.q { font-family: var(--tb-serif); font-size: 30px; line-height: 1.45; margin: 0 0 16px !important; color: var(--tb-ink); }
.hint { margin: 0 !important; font-size: 20px; color: var(--tb-mut); }
.opts { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 12px; }
.opts.two { grid-template-columns: 1fr 1fr; }
.opts li {
  display: flex; align-items: center; gap: 12px; margin: 0 !important;
  border: 1.5px solid #c9d8ec; background: #f6f9fd; padding: 10px 14px; font-size: 20px;
}
.opts li span {
  flex: none; width: 28px; height: 28px; border-radius: 50%; background: var(--tb-accent); color: #fff;
  font-family: var(--tb-mono); font-size: 14px; line-height: 28px; text-align: center;
}
</style>
