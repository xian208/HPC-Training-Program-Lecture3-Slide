<script setup lang="ts">
/**
 * 動畫佔位：骨架階段先標出「這裡要放什麼動畫」，之後換成真正的元件
 *
 *   <AnimTodo title="LLVM 三段式" :steps="['多個 frontend 匯進 IR', '分到不同 backend', '亮起 icx 的 backend']" />
 *
 * kind: anim（動畫）/ cast（終端機錄影）/ image（原圖待重畫）
 */
withDefaults(defineProps<{
  title: string
  steps?: string[]
  kind?: 'anim' | 'cast' | 'image'
  h?: string
}>(), { kind: 'anim', h: 'auto' })

const icon = { anim: '動畫待做', cast: '錄影待補', image: '圖待重畫' }
</script>

<template>
  <div class="anim-todo" :style="{ minHeight: h }">
    <div class="at-kind">{{ icon[kind] }}</div>
    <div class="at-title">{{ title }}</div>
    <ol v-if="steps?.length" class="at-steps">
      <li v-for="(s, i) in steps" v-show="s" :key="i">
        <span class="at-click">click {{ i + 1 }}</span>{{ s }}
      </li>
    </ol>
    <slot />
  </div>
</template>

<style scoped>
.anim-todo {
  border: 1.5px dashed var(--tb-accent); background: repeating-linear-gradient(-45deg, #fafbfe 0 10px, #f2f5fa 10px 20px);
  padding: 14px 18px; font-size: 14px; color: var(--tb-mut);
}
.at-kind { font-size: 11.5px; letter-spacing: .1em; color: var(--tb-accent); font-weight: 500; }
.at-title { font-size: 16px; color: var(--tb-ink); font-weight: 500; margin: 2px 0 6px; }
.at-steps { margin: 0; padding-left: 0; list-style: none; }
.at-steps li { margin: 3px 0; }
.at-click {
  display: inline-block; font-family: var(--tb-mono); font-size: 11px; color: var(--tb-accent);
  border: 1px solid var(--tb-accent); padding: 0 5px; margin-right: 8px; background: #fff;
}
</style>
