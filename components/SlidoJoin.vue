<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import { renderSVG } from 'uqr'

/**
 * Slido 加入方式：QR code ＋ slido.com ＋ 活動代碼（給 Slido、LabTime 共用）
 * 活動代碼與連結在 slides.md 的 headmatter 設定：
 *
 *   slido:
 *     code: '#1234567'
 *     url: https://app.sli.do/event/xxxxxxxx
 *
 * 還沒設定時會顯示提醒，QR code 指向 slido.com
 */
defineProps<{ caption?: string }>()
const { $slidev } = useSlideContext()
const cfg = computed(() => (($slidev.configs as any).slido ?? {}) as { code?: string, url?: string })
const ready = computed(() => !!cfg.value.code && !/x{3,}/i.test(cfg.value.code))
const url = computed(() => cfg.value.url || 'https://www.slido.com')
const qr = computed(() => renderSVG(url.value, { border: 1, pixelSize: 6 }))
</script>

<template>
  <aside class="join">
    <div v-if="caption" class="cap">{{ caption }}</div>
    <div class="qr" v-html="qr" />
    <div class="how">slido.com</div>
    <div class="code">{{ ready ? cfg.code : '#——' }}</div>
    <p v-if="!ready" class="todo">headmatter 還沒填 slido.code / url</p>
  </aside>
</template>

<style scoped>
.join { text-align: center; }
.cap { font-size: 15px; color: var(--tb-accent); letter-spacing: .04em; margin-bottom: 8px; }
.qr { border: 1.5px solid var(--tb-rule); padding: 8px; background: #fff; line-height: 0; }
.qr :deep(svg) { width: 100%; height: auto; }
.how { margin-top: 10px; font-size: 14px; color: var(--tb-mut); letter-spacing: .04em; }
.code { font-family: var(--tb-mono); font-size: 24px; color: var(--tb-accent); }
.todo { margin: 6px 0 0 !important; font-size: 12px; line-height: 1.4; color: var(--tb-orange); }
</style>
