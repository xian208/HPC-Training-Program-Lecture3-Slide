<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
const { $frontmatter } = useSlideContext()
</script>

<template>
  <div class="slidev-layout tb-cover">
    <div class="kicker">{{ $frontmatter.kicker }}</div>
    <div class="main"><slot /></div>
    <div class="meta">{{ $frontmatter.meta }}</div>
  </div>
</template>

<style>
.tb-cover { padding: 0 !important; height: 100%; position: relative; background: #fff; }
.tb-cover::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 14px; background: var(--tb-teal); }
.tb-cover .kicker {
  position: absolute; left: 80px; top: 150px; font-size: 14px; font-weight: 600;
  letter-spacing: .12em; text-transform: uppercase; color: var(--tb-teal);
}
.tb-cover .main { position: absolute; left: 80px; right: 80px; top: 180px; }
.tb-cover .main h1 { font-family: var(--tb-serif); font-size: 46px; font-weight: 600; margin: 0; line-height: 1.15; }
.tb-cover .main p { font-size: 19px; color: var(--tb-mut); margin-top: 14px; }
.tb-cover .meta {
  position: absolute; left: 80px; bottom: 56px; font-size: 14px; color: var(--tb-mut);
  border-top: 1px solid var(--tb-rule); padding-top: 10px; min-width: 360px;
}
</style>
