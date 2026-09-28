# 2026 HPC Training — Lecture 3 投影片

Build from Source：Compiler、Compilation Process、Build Automation、Environment Variable、Module、Spack。
內容來源：Notion「2026 lecture3」。投影片只放圖、demo 與重點，細節寫在每頁的講者備註（presenter mode 按 `p`）。

## 線上播放

push 到 `main` 之後，GitHub Actions 會自動 build 並部署到 GitHub Pages：

```
https://<帳號>.github.io/<repo 名稱>/
```

第一次要到 repo 的 **Settings → Pages**，把 Source 設成 **GitHub Actions**。
base 路徑由 workflow 自動取得（`.github/workflows/deploy.yml`），repo 改名也不用改設定。

## 本機執行

```bash
npm install
npm run dev        # http://localhost:3030，按 o 看總覽、按 p 進 presenter mode
npm run build      # 輸出到 dist/
npm run check      # 檢查每頁的文字量（見下方規則）
```

Mac 上也可以直接雙擊 `start.command`。

## 文字量規則

`npm run check` 會檢查每一頁：

- 重點（清單項目、`###` 小標、表格的資料列、`.callout`）最多 **3 個**
- 每段說明最多 **20 字**：中文一字算 1，英文單字、指令、`inline code` 一段算 1，標點不算；「**名詞**：說明」只算冒號後面
- 右側旁註（`MarginNotes`）每句也 ≤ 20 字、最多 3 句
- 程式碼、終端機、圖、錄影不算；講者備註（`<!-- -->`）不檢查
- Reference 這類頁面可以在 frontmatter 寫 `check: false` 跳過

## 字體

與 [slides.elvismao.com](https://slides.elvismao.com/talks/git/) 相同，使用 [emfont](https://font.emtech.cc) 提供的 **霞鶩文楷 TC**（內文、標題）與 **JetBrains Mono**（程式碼），在 `index.html` 載入。
霞鶩文楷 TC 只有 300 / 400 / 500 三種字重，所以標題用 500。字體與顏色的變數都在 `style.css` 的 `:root`。

## 目錄

```
slides.md              headmatter + 依序匯入各章
pages/00-prep.md …     一章一個檔案
layouts/               default（內容頁）、section（章節首頁）、cover（封面）
slide-top.vue          進度條＋頁尾
components/            動畫元件，見下表
setup/                 Compiler Explorer 的 code runner 與設定組
snippets/              範例程式碼；ce-cache/ 是連不上 godbolt 時的離線備援
casts/                 asciinema 錄影腳本，見 casts/RECORDING.md
public/casts/          錄好的 .cast
scripts/               check-text（文字量）、shoot / sheet（逐頁截圖、拼總覽圖）
```

## 元件

| 元件 | 用途 |
|---|---|
| `Flow` | 通用流程圖：方塊、箭頭、外框，隨 click 出現或變色（LLVM、nvcc、login / compute node、static vs dynamic…） |
| `CompilePipeline` | 編譯四階段；`clicks` 逐站亮起，`:active="n"` 當導覽列 |
| `MakeGraph` | Makefile 依賴圖，標出修改過／重新編譯的檔案 |
| `LinkResolve` | linker 的 symbol resolution → relocation |
| `LinkGates` | link time / load time 兩道關卡（libadd 範例） |
| `PathStack` | PATH 疊層，load 時從最上面插入、which 由上往下找 |
| `IncludePropagation` | CMake PUBLIC / PRIVATE 的 include 路徑傳遞 |
| `CmdAnnotate` | 指令逐段畫底線＋拉出說明（spack spec） |
| `Terminal` | 模擬終端機，每次 click 逐字打出下一個指令 |
| `MarginNotes` | 右側旁註隨 click 換句子（空字串 = 沿用上一句） |
| `Cast` | 嵌入 asciinema；檔案還沒錄時自動顯示待錄指令 |

元件都讀 `$clicks`。只靠元件推進的投影片要在 frontmatter 寫 `clicks: N`。

## Compiler Explorer runner

````md
```c {monaco-run} {autorun: false, runnerOptions: ce('loop-O3')}
...
```
````

`{monaco-run}` 會把程式送到 godbolt.org 編譯，顯示組語（每行標出對應的 C 行號）、執行結果或 objdump；設定組在 `setup/ce-presets.ts`。
現場要有網路，連不上時自動改顯示 `snippets/ce-cache/` 的預存輸出（ARM64 沒有備援）。

## 截圖檢查

```bash
npm run build
node scripts/shoot.mjs shots          # 每頁顯示所有 click 之後的樣子
node scripts/sheet.mjs shots 12       # 拼成總覽圖
```

需要 `npx playwright install chromium`（Linux 另外要 `sudo npx playwright install-deps chromium`）。
