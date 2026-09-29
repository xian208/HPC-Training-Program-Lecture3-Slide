<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import { renderSVG } from 'uqr'

/**
 * Slido 互動頁：題目 ＋ 選項，右側是 QR code 與活動代碼
 *
 *   <Slido q="只改了 utils.c，再 make 一次會重編哪些檔案？"
 *     :options="['全部重編', 'utils.o、program', '只有 utils.o', '都不會']" />
 *
 * - 沒有 options = 開放式問題（文字雲、簡答）
 * - 沒有 q = 單純的提問頁
 * - 答案寫在講者備註；投影片上不標示
 * 活動代碼與連結在 slides.md 的 headmatter 設定：
 *
 *   slido:
 *     code: '#1234567'
 *     url: https://app.sli.do/event/xxxxxxxx
 */
defineProps<{ q?: string, options?: string[], hint?: string }>()
const { $slidev } = useSlideContext()
const cfg = computed(() => (($slidev.configs as any).slido ?? {}) as { code?: string, url?: string })
const ready = computed(() => !!cfg.value.code && !/x{3,}/i.test(cfg.value.code))
const url = computed(() => cfg.value.url || 'https://www.slido.com')
const qr = computed(() => renderSVG(url.value, { border: 1, pixelSize: 6 }))
const letter = (i: number) => String.fromCharCode(65 + i)
</script>

<template>
  <div class="slido">
    <div class="ask">
      <p v-if="q" class="q">{{ q }}</p>
      <p v-else class="q">有問題嗎？直接在 Slido 上提問</p>
      <ol v-if="options?.length" class="opts" :class="{ two: options.length > 2 }">
        <li v-for="(o, i) in options" :key="i"><span>{{ letter(i) }}</span>{{ o }}</li>
      </ol>
      <p v-else-if="q" class="open">{{ hint ?? '開放作答，在 Slido 上輸入你的答案' }}</p>
    </div>
    <aside class="join">
      <div class="qr" v-html="qr" />
      <div class="how">slido.com</div>
      <div class="code">{{ ready ? cfg.code : '#——' }}</div>
      <p v-if="!ready" class="todo">headmatter 還沒填 slido.code / url</p>
    </aside>
  </div>
</template>

<style scoped>
.slido { display: grid; grid-template-columns: minmax(0, 1fr) 190px; gap: 44px; align-items: center; }
.q { font-family: var(--tb-serif); font-size: 28px; line-height: 1.45; margin: 0 0 22px !important; color: var(--tb-ink); }
.opts { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
.opts.two { grid-template-columns: 1fr 1fr; }
.opts li {
  display: flex; align-items: center; gap: 12px; margin: 0 !important;
  border: 1.5px solid #c9d8ec; background: #f6f9fd; padding: 10px 14px; font-size: 20px;
}
.opts li span {
  flex: none; width: 28px; height: 28px; border-radius: 50%; background: var(--tb-accent); color: #fff;
  font-family: var(--tb-mono); font-size: 14px; line-height: 28px; text-align: center;
}
.open { margin: 0 !important; font-size: 18px; color: var(--tb-mut); }
.join { text-align: center; }
.qr { border: 1.5px solid var(--tb-rule); padding: 8px; background: #fff; line-height: 0; }
.qr :deep(svg) { width: 100%; height: auto; }
.how { margin-top: 10px; font-size: 14px; color: var(--tb-mut); letter-spacing: .04em; }
.code { font-family: var(--tb-mono); font-size: 24px; color: var(--tb-accent); }
.todo { margin: 6px 0 0 !important; font-size: 12px; line-height: 1.4; color: var(--tb-orange); }
</style>
