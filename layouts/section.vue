<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
/**
 * 章節首頁：frontmatter 需要 `chapter`（例如 "03"）與 `title`
 * 內文（可選）寫一兩句這章要解決什麼問題
 */
const { $frontmatter } = useSlideContext()
</script>

<template>
  <div class="slidev-layout tb-section">
    <div class="num">{{ $frontmatter.chapter }}</div>
    <div class="body">
      <div class="title">{{ $frontmatter.title }}</div>
      <div class="lead"><slot /></div>
    </div>
  </div>
</template>

<style>
.tb-section { padding: 0 !important; height: 100%; display: grid; grid-template-columns: 190px 1fr; align-items: center; background: #fff; }
.tb-section .num {
  font-family: var(--tb-mono); font-size: 84px; color: var(--tb-teal); text-align: right; padding-right: 30px;
  border-right: 3px solid var(--tb-teal); line-height: 1;
}
.tb-section .body { padding: 0 64px 0 32px; }
.tb-section .title { font-family: var(--tb-serif); font-weight: 600; font-size: 40px; line-height: 1.2; color: var(--tb-ink); }
.tb-section .lead { margin-top: 14px; font-size: 18px; color: var(--tb-mut); max-width: 34em; }
.tb-section .lead p { margin: 0; }
</style>
