import { defineAppSetup } from '@slidev/types'
import { ce } from './ce-presets'

export default defineAppSetup(({ app }) => {
  // 讓投影片的 {monaco-run} 選項可以寫 runnerOptions: ce('loop-O3')
  app.config.globalProperties.ce = ce
})
