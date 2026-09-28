<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useChapter } from '../utils/chapter'

/**
 * Textbook layout（所有內容頁的預設版面）
 *  - 左上：章節標籤（自動取最近的 section 頁，可用 frontmatter `chap` 覆寫）
 *  - 標題：第一個 `# 標題` 會被放到固定位置
 *  - 右側旁註：用 `::margin::` slot，或放 <MarginNotes>
 *  - frontmatter `wide: true` 讓主欄位吃滿（沒有旁註時自動吃滿）
 */
const { $page, $frontmatter } = useSlideContext()
const chapter = useChapter(() => $page.value)
const slots = useSlots()
const hasMargin = computed(() => !!slots.margin)
const chapLabel = computed(() => {
  if ($frontmatter?.chap) return $frontmatter.chap
  const c = chapter.value
  return c.name ? `${c.num}　${c.name}` : ''
})
</script>

<template>
  <div class="slidev-layout tb">
    <div class="tb-chap">{{ chapLabel }}</div>
    <div class="tb-stage" :class="{ 'has-margin': hasMargin }">
      <div class="tb-main"><slot /></div>
      <aside v-if="hasMargin" class="tb-margin"><slot name="margin" /></aside>
    </div>
  </div>
</template>

<style>
.slidev-layout.tb { padding: 0; height: 100%; position: relative; }
.tb .tb-chap {
  position: absolute; left: 49px; top: 24px;
  font-size: 12.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
  color: var(--tb-teal);
}
.tb .tb-main > h1:first-child {
  /* containing block 是 .tb-stage（top: 104px），所以往上移回標題列的位置 */
  position: absolute; left: 0; right: 0; top: -62px; margin: 0;
  font-family: var(--tb-serif); font-weight: 600; font-size: 30px; line-height: 1.25;
}
.tb .tb-stage {
  position: absolute; left: 49px; right: 49px; top: 104px; bottom: 50px;
  display: grid; grid-template-columns: minmax(0, 1fr); gap: 32px;
}
.tb .tb-stage.has-margin { grid-template-columns: minmax(0, 1fr) 215px; }
.tb .tb-main { min-height: 0; font-size: 17px; line-height: 1.6; }
.tb .tb-main > *:nth-child(2) { margin-top: 0; }
/* 預設 theme 會把 h1 後面第一段變淡，這裡還原 */
.tb .tb-main > h1 + p { opacity: 1; margin-top: 0; margin-bottom: .5em; }
.tb .tb-main p { margin: .5em 0; }
.tb .tb-main ul, .tb .tb-main ol { margin: .4em 0; padding-left: 1.3em; }
.tb .tb-main li { margin: .2em 0; }
.tb .tb-main li::marker { color: var(--tb-teal); }
.tb .tb-main h3 { font-size: 18px; color: var(--tb-teal); margin: .2em 0 .4em; font-weight: 600; }
.tb .tb-margin {
  align-self: start; min-height: 110px;
  border-left: 2.5px solid var(--tb-teal); padding-left: 16px;
  font-size: 15px; line-height: 1.55; color: var(--tb-mut);
}
.tb .tb-margin strong:first-child {
  display: block; color: var(--tb-teal); font-size: 12px; letter-spacing: .1em; margin-bottom: 6px;
}
</style>
