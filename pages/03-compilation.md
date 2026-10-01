---
layout: section
chapter: "03"
title: Compilation Process
---

原始碼 hello.c 轉換為可執行檔 hello，共歷經四個階段。

---
clicks: 4
---

# 保留編譯中間產物

```bash {all|1|2-3}
$ gcc -save-temps hello.c -o hello
$ ls
hello  hello.c  hello.i  hello.o  hello.s
```

<div class="temps">
  <div v-click="2"><code>hello.i</code><span>前置處理 (Preprocessing)</span></div>
  <div v-click="3"><code>hello.s</code><span>編譯 (Compilation)</span></div>
  <div v-click="4"><code>hello.o</code><span>組譯 (Assembly)</span></div>
</div>

::margin::

<MarginNotes :notes="[
  '',
  '使用 -save-temps 參數保留中間產物',
  '產生三個中間階段檔案',
  '',
  '分別對應編譯流程的三個階段',
]" />

<style>
.temps { display: flex; gap: 14px; margin-top: 18px; }
.temps > div { border: 1.5px solid var(--tb-node-line); background: var(--tb-node-bg); padding: 8px 14px; }
.temps code { background: none; border: 0; font-size: 16px; }
.temps span { display: block; font-size: 13px; color: var(--tb-mut); }
</style>

<!--
前面用一行 gcc 就得到了執行檔。加上 -save-temps 保留中間產物，會多出三個檔案，正好對應編譯的不同階段。
-->

---
clicks: 4
---

# 編譯的四個階段

<CompilePipeline clicks />

<!--
每一站一個 click：
1. Preprocessing：先對原始碼做初步的「文字整理」
2. Compilation：「翻譯」成貼近硬體的組合語言
3. Assembly：再轉成機器碼（object file）
4. Linking：把多份 object file 與系統函式庫「連結打包」，產出執行檔
圖源：Computer Systems: A Programmer's Perspective, 3rd ed., Fig. 1.3（這裡重畫）。
後面四個小節都用 <CompilePipeline :active="n" small /> 當導覽列，亮起目前講的那一站。
-->

---
clicks: 3
---

# 劃分四階段的核心優勢

<div grid="~ cols-[1fr_380px] gap-6">
<div>

### 模組化分工與跨平台支援

各階段職責單一，模組易於替換與複用。

<v-click at="1">

### 支援獨立編譯機制

僅重新編譯修改過的原始碼，隨後執行重新連結。

</v-click>

</div>

<MakeGraph :steps="[
  { label: '' },
  { label: '專案建置完成' },
  { label: '修改 utils.c 原始檔', dirty: ['utils.c'] },
  { label: '僅重編 utils.o 並重新連結', dirty: ['utils.c'], rebuilt: ['utils.o', 'program'] },
]" />

</div>

<!--
1. 分工明確與跨平台：同一套 assembler、linker 可以給不同語言的編譯器共用；編譯器內部也常拆成 frontend / backend（見 LLVM）。
2. 獨立編譯與高效率：每個 source file 都能獨立產出 object file。改了一個檔案，只要重新編譯有變動的那個，再重新 link。
同一個 MakeGraph 在 Makefile 章節會再用一次。
-->

---
clicks: 1
---

# 前置處理 (Preprocessing)

<CompilePipeline :active="1" small />

````md magic-move {lines: false}
```c
#include <stdio.h>

#define MAX 5000
#define MIN 1000
#define AVG(a, b) ((a + b) / 2)

int main() {
    int a = MAX;
    int b = MIN;
    int c = AVG(a, b);
    printf("%d\n", c);
    return 0;
}
```
```c
/* <此處省略 stdio.h 展開內容> */

int main() {
    int a = 5000;
    int b = 1000;
    int c = ((a + b) / 2);
    printf("%d\n", c);
    return 0;
}
```
````

::margin::

<MarginNotes label="gcc -E hello.c -o hello.i" :notes="[
  '解析並執行 # 開頭的前置處理指令',
  '引入 #include 檔案、原地展開 #define 巨集',
]" />

<!--
Magic Move：MAX、AVG(a, b) 在原地變形成展開後的樣子。
#include <stdio.h> 會把 stdio.h 的內容加進來；#define A B 會把程式裡的 A 換成 B。
-->

---

# 編譯 (Compilation)

<CompilePipeline :active="2" small />

```bash
gcc -S hello.i -o hello.s
```

- **統一中間表述**：不同高階語言（如 C、Fortran）皆轉譯為組合語言
- **硬體架構相依**：針對 x86-64 與 ARM64 等不同處理器產生專屬指令集

<!--
- Compiler 把 C 寫的 hello.i 轉成組合語言 hello.s。
- 組合語言是共同的輸出格式：不同語言的編譯器都能產生，再交給同一個 assembler 處理。
- 下一頁直接在投影片上編譯，對照每一行 C 對應到哪幾行組語，並切換 x86 / ARM。
-->

---

# 組合語言對照：x86-64 與 ARM64 架構

<div grid="~ cols-2 gap-4">
<div>

<div class="arch">x86-64 gcc 14.2</div>

```c {monaco-run} {autorun: true, height: '150px', runnerOptions: ce('hello-x86')}
#include <stdio.h>
int main() {
    int a = 5000;
    int b = 1000;
    int c = ((a + b) / 2);
    printf("%d\n", c);
    return 0;
}
```

</div>
<div>

<div class="arch">ARM64 gcc 14.2</div>

```c {monaco-run} {autorun: true, height: '150px', runnerOptions: ce('hello-arm')}
#include <stdio.h>
int main() {
    int a = 5000;
    int b = 1000;
    int c = ((a + b) / 2);
    printf("%d\n", c);
    return 0;
}
```

</div>
</div>

<style>
.arch { font-size: 12px; font-weight: 500; color: var(--tb-accent); letter-spacing: .06em; margin-bottom: 4px; }
</style>

<!--
Monaco runner → Compiler Explorer。組語每一行前面的 Ln 與底色 = 對應到 C 的第 n 行。
可以現場改 5000 → 其他數字，看 movl $5000 跟著變。
講義上的 hello.s 是 Debian gcc 14.2 在 x86-64 上的輸出；ARM64 那邊沒有離線備援。
-->

---
clicks: 3
---

# 組譯 (Assembly)

<CompilePipeline :active="3" small />

<div grid="~ cols-[1fr_1.25fr] gap-6" mt-2>
<div>

- `hello.o`：二進位可重定位目的檔 (Relocatable Object File)
- `cat hello.o`：二進位內容直接輸出將呈現非文字字元

<div class="note">使用 <code>objdump -d</code> 進行反組譯，可檢視機器碼並驗證編譯參數設定</div>

</div>

<Terminal font-size="12.5px" height="284px" :steps="[
  { cmd: 'gcc -c hello.s -o hello.o' },
  { cmd: 'cat hello.o', out: ' ELF>@@@\nUH��H���E��E���U�E�J������E�E��H�H�N����%d\nGCC: (Debian 14.2.0-19) 14.2.0zR�JA�C\n��  Jhello.cmainprintf2��������?��������\n.symtab.strtab.shstrtab.rela.text.data.bss…\n&��1�90� B�W�R@�', tone: 'mut' },
  { cmd: 'file hello.o', out: 'hello.o: ELF 64-bit LSB relocatable, x86-64', tone: 'ok' },
]" />

</div>

<!--
- Assembler 把 hello.s 轉成二進位的 relocatable object file，存在 hello.o（對應講義 Assembly phase）。
- cat 會把每個位元組當成字元印出來，大部分位元組不是可顯示的字元，所以是亂碼；中間看得到的 main、printf 是 symbol 名稱，linker 之後會用到。
- file 確認它是 relocatable：位址還沒定，要等 linker 決定（下一頁）。
- 講義的灰色 callout：objdump -d hello.o 可以反組譯，驗證編譯參數是否生效。這裡只口頭帶過，不展開。
- 如果有人問「機器碼的數字在哪」：od -A x -t x1 hello.o 會看到 55 48 89 e5…，就是 push %rbp、mov %rsp,%rbp 的機器碼；cat 印不出來是因為它把位元組當字元。
-->

---
clicks: 3
---

# 連結 (Linking)

<CompilePipeline :active="4" small />

<LinkResolve />

::margin::

<strong>gcc hello.o -o hello</strong>

連結器將目的檔與相依函式庫整合成可執行檔

<!--
hello.o 裡的 printf 先畫成空洞 → linker 到 libc 找到 printf.o → 把位址填回去。
- Symbol resolution：找到每個 symbol 對應的定義，例如 printf 實際定義在哪。
- Relocation：決定 function 或 variable 最終在記憶體中的位置，並更新相關 reference。
Symbol：程式中代表 function 或 variable 的名稱，例如 main、printf。
這裡用 static linking 畫比較直觀；dynamic linking 下一章會講。位址是示意，不是真的 objdump 結果。
-->

---
clicks: 4
---

# 載入器：從可執行檔至執行程序

<Flow :width="860" :height="282" :groups="[
  { x: 0, y: 0, w: 860, h: 184, label: 'COMPILE TIME' },
  { x: 0, y: 192, w: 860, h: 90, label: 'RUN TIME', at: 3 },
]" :nodes="[
  { id: 'c', x: 95, y: 48, label: 'hello.c', w: 120 },
  { id: 'i', x: 330, y: 48, label: 'hello.i', w: 120, at: 1 },
  { id: 's', x: 560, y: 48, label: 'hello.s', w: 120, at: 1 },
  { id: 'o', x: 770, y: 48, label: 'hello.o', w: 120, at: 1 },
  { id: 'a', x: 560, y: 140, label: 'libc.a', sub: 'static', w: 120, at: 2, tone: 'plain' },
  { id: 'exe', x: 770, y: 140, label: 'hello', sub: '可執行檔', w: 120, at: 2, tone: 'on' },
  { id: 'so', x: 560, y: 240, label: 'libc.so', sub: 'dynamic', w: 120, at: 3, tone: 'plain' },
  { id: 'proc', x: 770, y: 240, label: 'process', sub: '執行中程序', w: 120, at: 4, tone: 'on' },
]" :edges="[
  { from: 'c', to: 'i', label: 'preprocessor', at: 1 },
  { from: 'i', to: 's', label: 'compiler', at: 1 },
  { from: 's', to: 'o', label: 'assembler', at: 1 },
  { from: 'o', to: 'exe', label: 'linker', at: 2, lpos: [780, 98] },
  { from: 'a', to: 'exe', label: 'linker', at: 2 },
  { from: 'so', to: 'exe', label: 'linker 符號檢查', dashed: true, at: 3, lpos: [452, 204] },
  { from: 'exe', to: 'proc', label: 'loader', at: 4, lpos: [780, 202] },
  { from: 'so', to: 'proc', label: 'loader', at: 4 },
]" />

<div grid="~ cols-2 gap-6" mt-2>
<div>

- **載入器 (Loader)**：於執行期間將程式映像載入實體或虛擬記憶體

</div>
<div>

- **動態連結 (Dynamic Linking)**：共用函式庫 (`.so`) 於執行載入時才映射至記憶體

</div>
</div>

<!--
和講義 Linking phase 最後那張圖相同（講義是 Compile time / Run time 兩層）。
1. 四個階段：hello.c → hello.i → hello.s → hello.o。
2. linker 把 hello.o 和 library 接成執行檔 hello；static linking 時把 libc.a 裡用到的部分複製進來。
3. dynamic linking 時，link time 只檢查 libc.so 裡有沒有需要的 symbol，不複製內容。
4. 執行（./hello）的當下，OS 呼叫 Loader，把執行檔載入記憶體、交出控制權；dynamic 的程式此時才由 loader 找到 libc.so 載入，變成執行中的 process。
libc.a 和 libc.so 是二選一：預設是 dynamic，加 -static 才是 static（下一章會實際比較）。
-->
