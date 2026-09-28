import { computed } from 'vue'
import { useNav } from '@slidev/client'

/**
 * 從目前頁往前找最近一張 layout: section 的投影片，當作章節名稱。
 * 這樣每一頁不用手寫 chap，只要 section 頁寫好 `chapter` 與 `title` 即可。
 * 單頁要覆寫時，在 frontmatter 寫 `chap: "..."`。
 */
export function useChapter(pageNo: () => number) {
  const { slides } = useNav()
  return computed(() => {
    const no = pageNo()
    for (let i = no - 1; i >= 0; i--) {
      const fm = slides.value[i]?.meta?.slide?.frontmatter as Record<string, any> | undefined
      if (fm?.layout === 'section')
        return { num: String(fm.chapter ?? ''), name: String(fm.title ?? '') }
    }
    return { num: '', name: '' }
  })
}
