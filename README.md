# 2026 HPC Training — Lecture 3 投影片（Slidev 骨架）

內容來源：Notion「2026 lecture3」（課前準備 → Spack，不含 Lab）。
版面沿用「Code 動畫選項」artifact 的 Textbook 風格：上方進度條、左上章節標籤、serif 標題、右側旁註、頁尾頁碼。

## 執行

```bash
npm install
npm run dev        # http://localhost:3030 ，按 o 看總覽、按 p 進 presenter mode
npm run build      # 輸出到 dist/（靜態網站，可以直接丟到 GitHub Pages）
npm run export     # 匯出 PDF（需要 playwright-chromium）
```

課名改 `slides.md` 最上面的 `lectureName`；字體、顏色都在 `style.css` 的 `:root`。

## 目錄

```
slides.md              headmatter + 依序匯入各章
pages/00-prep.md …     一章一個檔案（11-wrapup 是 Lab 預告與 Reference）
layouts/default.vue    Textbook 版面；`::margin::` 是右側旁註欄
layouts/section.vue    章節首頁（frontmatter: chapter、title）
layouts/cover.vue      封面
slide-top.vue          進度條＋頁尾（每頁都有，匯出 PDF 也會出現）
components/            動畫元件，見下表
setup/code-runners.ts  C 語言 code runner（接 Compiler Explorer）
setup/ce-presets.ts    runner 的設定組
snippets/              範例程式碼；ce-cache/ 是連不上 godbolt 時的離線備援
public/casts/          asciinema 錄影（.cast），見 casts/RECORDING.md
```

左上角的章節標籤會自動抓最近一張 section 頁，不用每頁手寫；個別頁面要覆寫就在 frontmatter 寫 `chap:`。

## 元件

| 元件 | 用途 | 參考 artifact 的哪一種 |
|---|---|---|
| `MarginNotes` | 右側旁註隨 click 換句子（空字串 = 沿用上一句） | B 旁註 |
| `Terminal` | 模擬終端機，每次 click 逐字打出下一個指令 | C Terminal Typing |
| `CmdAnnotate` | 指令逐段畫底線＋拉出說明（spack spec） | F 指令標註 |
| `CompilePipeline` | 編譯四階段；`clicks` 逐站亮起，`:active="n"` 當導覽列 | D Code＋Diagram |
| `MakeGraph` | Makefile 依賴圖，標出修改過／重新編譯的檔案 | D |
| `LinkResolve` | linker 的 symbol resolution → relocation | D |
| `LinkGates` | link time / load time 兩道關卡（libadd 範例） | D |
| `PathStack` | PATH 疊層，load 時從最上面插入、which 由上往下找 | D |
| `IncludePropagation` | CMake PUBLIC / PRIVATE 的 include 路徑傳遞 | D |
| `Cast` | 嵌入 asciinema；檔案還沒錄時自動顯示待錄指令 | — |
| `AnimTodo` | 動畫佔位框，寫著每個 click 要演什麼 | — |

Magic Move（A）與行高亮（B）直接用 Slidev 內建語法。

元件都讀 `$clicks`。只靠元件推進的投影片要在 frontmatter 寫 `clicks: N`；有 code block 行高亮或 `v-click` 的投影片會自動算。

## 程式 demo：Compiler Explorer runner

````md
```c {monaco-run} {autorun: false, runnerOptions: ce('loop-O3')}
...
```
````

- `{monaco-run}` 會把程式送到 godbolt.org 編譯，顯示組語（每行標出對應的 C 行號與底色）、執行結果或 objdump
- Slidev 的 code block 選項不支援巢狀大括號，所以 runnerOptions 寫成 `ce('<preset>')`，設定組放在 `setup/ce-presets.ts`
- 現場要有網路；連不上時自動改顯示 `snippets/ce-cache/` 的預存輸出（loop 那兩份是 gcc 13.3 產生的，hello.s 是講義上的 gcc 14.2 版本；ARM64 沒有備援）
- ⚠ 這份骨架是在不能連 godbolt 的環境做的，runner 只驗證過離線備援那條路。第一次用請先 `npm run dev` 實際按一次 ▶，確認 API 與 CORS 都正常

## 還沒做的（`<AnimTodo>` 與 `<Cast>` 佔位）

| 檔案 | 內容 |
|---|---|
| 02-compiler | Compiler vs Interpreter 時間軸、LLVM 三段式、nvcc 分流、login / compute node |
| 03-compilation | `.a` 與 `.so` 的結構；`cat hello.o` 亂碼截圖 |
| 04-linking | static 複製進來 vs dynamic 執行時接上 |
| 05-makefile | Notion 上的 Build Automation 圖 |
| 06-configure | 🎥 `hwloc-configure.cast` |
| 07-cmake | source tree 保持乾淨（`-S` / `-B`） |
| 08-envvar | 父行程 → 子行程 |
| 09-module | 子行程泡泡；🎥 `module-commands.cast` |
| 10-spack | 🎥 `spack-install-zstd.cast`；先 fetch 再 install |

`grep -n "<AnimTodo\|<Cast " pages/*.md` 可以列出目前還剩哪些。

## 刻意沒放進投影片的東西

- CMake PUBLIC → PRIVATE 的實際錯誤訊息：Lab3-3 Part B 第 1 題要學生自己找
- `spack spec` 範例輸出是 rocky8 / x86 / oneapi 環境，和講義其他地方的 Debian aarch64 不同，投影片 notes 有提醒
