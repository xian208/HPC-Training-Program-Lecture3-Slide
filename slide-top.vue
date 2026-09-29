<script setup lang="ts">
import { computed } from 'vue'
import { useNav, useSlideContext } from '@slidev/client'

/**
 * 每一頁的上層：上方進度條 + 頁尾（參考 artifact 的 .prog 與 .foot）
 * 放在 slide-top（疊在投影片內容上面），匯出 PDF 時也會出現。
 * 課名在 slides.md 的 headmatter `lectureName` 設定。
 */
const { total, slides } = useNav()
const { $slidev, $page } = useSlideContext()
// 用 route 的 frontmatter：src 匯入的第一頁，$frontmatter 可能拿到匯入那頁的設定
const layout = computed(() => String((slides.value[$page.value - 1]?.meta?.slide?.frontmatter as any)?.layout ?? ''))
const pct = computed(() => ($page.value / total.value) * 100)
const showBar = computed(() => layout.value !== 'cover')
const showFoot = computed(() => !['cover', 'section', 'end'].includes(layout.value))
const lecture = computed(() => ($slidev.configs as any).lectureName ?? '')
</script>

<template>
  <div v-if="showBar" class="tb-prog"><i :style="{ width: `${pct.toFixed(1)}%` }" /></div>
  <div v-if="showFoot" class="tb-foot">
    <span>{{ lecture }}</span>
    <span>{{ $page }} / {{ total }}</span>
  </div>
</template>

<style scoped>
.tb-prog { position: absolute; left: 0; right: 0; top: 0; height: 5px; background: #eef1f2; z-index: 10; }
.tb-prog i { display: block; height: 100%; background: var(--tb-accent); }
.tb-foot {
  position: absolute; left: 49px; right: 49px; bottom: 14px; z-index: 10;
  display: flex; justify-content: space-between;
  font-family: var(--tb-sans); font-size: 12px; color: var(--tb-mut);
  border-top: 1px solid var(--tb-rule); padding-top: 6px;
  font-variant-numeric: tabular-nums; pointer-events: none;
}
</style>
