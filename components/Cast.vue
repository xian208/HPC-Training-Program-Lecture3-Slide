<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { onSlideLeave, useSlideContext } from '@slidev/client'
import 'asciinema-player/dist/bundle/asciinema-player.css'

/**
 * 嵌入 asciinema 錄影（configure、cmake、module、spack 這類要網路或跑很久的操作）
 *
 *   <Cast src="/casts/hwloc-configure.cast" :todo="['curl -LO …', './configure --prefix=… | head -25']" />
 *
 * - .cast 檔放在 public/casts/，錄製清單見 casts/RECORDING.md
 * - 還沒錄的檔案會自動顯示「錄影待補」佔位框，列出要錄的指令
 * - 錄的時候用 `asciinema rec --idle-time-limit 1`，在要停下來講解的地方加 marker
 *   （pauseOnMarkers 預設開啟，播到 marker 會自動暫停，按空白鍵繼續）
 * - 離開投影片時自動暫停
 */
const props = withDefaults(defineProps<{
  src: string
  todo?: string[]
  rows?: number
  cols?: number
  speed?: number
  fontSize?: string
}>(), { rows: 16, cols: 96, speed: 1.5, fontSize: '13px' })

const el = ref<HTMLElement>()
const missing = ref(false)
let player: any
const { $renderContext } = useSlideContext()

onMounted(async () => {
  const url = (import.meta.env.BASE_URL.replace(/\/$/, '') + props.src)
  try {
    const r = await fetch(url, { method: 'GET' })
    const head = r.ok ? (await r.text()).trimStart().slice(0, 1) : ''
    if (!r.ok || head !== '{') { missing.value = true; return }
  }
  catch { missing.value = true; return }
  if ($renderContext.value !== 'slide' && $renderContext.value !== 'presenter') return
  const AP = await import('asciinema-player')
  player = AP.create(url, el.value!, {
    rows: props.rows, cols: props.cols, speed: props.speed,
    idleTimeLimit: 1, pauseOnMarkers: true, fit: 'width',
    terminalFontFamily: 'IBM Plex Mono, monospace', terminalFontSize: props.fontSize, theme: 'solarized-light',
  })
})
onSlideLeave(() => player?.pause?.())
onBeforeUnmount(() => player?.dispose?.())
</script>

<template>
  <AnimTodo v-if="missing" kind="cast" :title="`尚未錄製：${src}`">
    <pre v-if="todo?.length" class="cast-todo">{{ todo.map(c => `$ ${c}`).join('\n') }}</pre>
  </AnimTodo>
  <div v-else ref="el" class="cast" />
</template>

<style scoped>
.cast { border: 1px solid var(--tb-rule); }
.cast-todo { margin: 8px 0 0; font-family: var(--tb-mono); font-size: 12.5px; color: var(--tb-ink); background: #fff; border: 1px solid var(--tb-rule); padding: 8px 12px; white-space: pre-wrap; }
</style>
