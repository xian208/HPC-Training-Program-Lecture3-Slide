<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import { renderSVG } from 'uqr'

/**
 * Slido 提問頁：QR code ＋ 加入方式
 * 活動代碼與連結在 slides.md 的 headmatter 設定：
 *
 *   slido:
 *     code: '#1234567'
 *     url: https://app.sli.do/event/xxxxxxxx
 *
 * 還沒設定時會顯示提醒，QR code 指向 slido.com
 */
const { $slidev } = useSlideContext()
const cfg = computed(() => (($slidev.configs as any).slido ?? {}) as { code?: string, url?: string })
const ready = computed(() => !!cfg.value.code && !/x{3,}/i.test(cfg.value.code))
const url = computed(() => cfg.value.url || 'https://www.slido.com')
const qr = computed(() => renderSVG(url.value, { border: 1, pixelSize: 6 }))
</script>

<template>
  <div class="slido">
    <div class="qr" v-html="qr" />
    <ol>
      <li>掃 QR code，或打開 <b>slido.com</b></li>
      <li>輸入代碼 <b class="code">{{ ready ? cfg.code : '#——' }}</b></li>
      <li>匿名提問，也可以幫別人的問題按讚</li>
    </ol>
    <p v-if="!ready" class="todo">尚未設定 Slido：在 slides.md 的 headmatter 填 slido.code 與 slido.url</p>
  </div>
</template>

<style scoped>
.slido { display: grid; grid-template-columns: 230px minmax(0, 1fr); gap: 44px; align-items: center; }
.qr { border: 1.5px solid var(--tb-rule); padding: 10px; background: #fff; line-height: 0; }
.qr :deep(svg) { width: 100%; height: auto; }
ol { margin: 0; padding: 0; list-style: none; counter-reset: s; font-size: 22px; }
li { counter-increment: s; display: flex; align-items: baseline; gap: 14px; margin: 0 0 18px !important; }
li::before {
  content: counter(s); flex: none; width: 30px; height: 30px; border-radius: 50%;
  background: var(--tb-accent); color: #fff; font-size: 15px; line-height: 30px; text-align: center;
  transform: translateY(-2px);
}
b { font-weight: 500; color: var(--tb-accent); }
.code { font-family: var(--tb-mono); font-size: 26px; letter-spacing: .04em; }
.todo { grid-column: 1 / -1; margin: 0 !important; font-size: 14px; color: var(--tb-orange); }
</style>
