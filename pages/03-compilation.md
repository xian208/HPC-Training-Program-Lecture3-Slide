---
layout: section
chapter: "03"
title: Compilation Process
---

從 hello.c 到 hello，其實經過了四個階段

---
clicks: 4
---

# 把中間產物留下來看看

```bash {all|1|2-3}
$ gcc -save-temps hello.c -o hello
$ ls
hello  hello.c  hello.i  hello.o  hello.s
```

<div class="temps">
  <div v-click="2"><code>hello.i</code><span>Preprocessing 的產物</span></div>
  <div v-click="3"><code>hello.s</code><span>Compilation 的產物</span></div>
  <div v-click="4"><code>hello.o</code><span>Assembly 的產物</span></div>
</div>

::margin::

<MarginNotes :notes="[
  '前面用一行 gcc 就得到了執行檔。',
  '加上 -save-temps 保留中間產物……',
  '會多出三個檔案。',
  '',
  '這三個中間檔正好對應編譯的不同階段。',
]" />

<style>
.temps { display: flex; gap: 14px; margin-top: 18px; }
.temps > div { border: 1.5px solid var(--tb-node-line); background: var(--tb-node-bg); padding: 8px 14px; }
.temps code { background: none; border: 0; font-size: 16px; }
.temps span { display: block; font-size: 13px; color: var(--tb-mut); }
</style>

<!--
🎬 輕動畫：三個中間檔依序淡入，並標上對應的階段。
-->

---
clicks: 4
---

# 編譯的四個階段 ⭐

<CompilePipeline clicks />

<div class="pipe-note">
<MarginNotes label="" :notes="[
  '將 source code 轉成執行檔並非一步完成。',
  '先對原始碼做初步的「文字整理」……',
  '接著「翻譯」成貼近硬體的組合語言……',
  '再進一步轉成機器碼（object file）。',
  '最後把多份 object file 與系統函式庫「連結打包」，才產出執行檔。',
]" />
</div>

<style>
.pipe-note { border-left: 2.5px solid var(--tb-teal); padding-left: 14px; font-size: 17px; color: var(--tb-ink); margin-top: 8px; }
</style>

<!--
⭐ 核心動畫：自己重畫的 pipeline（取代 CS:APP Figure 1.3），每一站一個 click。
後面四個小節都用 <CompilePipeline :active="n" small /> 當導覽列，亮起目前講的那一站。
圖源：Computer Systems: A Programmer's Perspective, 3rd ed., Fig. 1.3
-->

---
clicks: 3
---

# 為什麼要分成四個階段？

<div grid="~ cols-[1fr_380px] gap-6">
<div>

### 1. 分工明確與跨平台

每個階段只做一件事，可以分別替換或共用：同一套 assembler、linker 可以給不同語言的編譯器共用；編譯器內部也常拆成 frontend / backend（見 LLVM）。

<v-click at="1">

### 2. 獨立編譯與高效率

每個 source file 都能獨立產出 object file。改了一個檔案，只要重新編譯**有變動**的那個，再重新 link。

</v-click>

</div>

<MakeGraph :steps="[
  { label: '' },
  { label: '全部編好了' },
  { label: '只改了 utils.c', dirty: ['utils.c'] },
  { label: '只重編 utils.o，再重新 link', dirty: ['utils.c'], rebuilt: ['utils.o', 'program'] },
]" />

</div>

<!--
🎬 「獨立編譯」動畫：只改 utils.c，就只有 utils.o 變色。
同一個 MakeGraph 元件在 Makefile 章節會再用一次。
-->

---
clicks: 1
---

# Preprocessing

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
/* <此處省略 stdio.h 的部分> */

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

<MarginNotes :notes="[
  'Preprocessor 處理 # 開頭的指令。<br><code>gcc -E hello.c -o hello.i</code>',
  '#include 被換成 stdio.h 的內容；#define 的 MAX、AVG(a, b) 在原地展開。',
]" />

<!--
💻 Magic Move：MAX、AVG(a, b) 在原地變形成展開後的樣子。
-->

---

# Compilation

<CompilePipeline :active="2" small />

Compiler 把 C 寫的 `hello.i` 轉成組合語言 `hello.s`：`gcc -S hello.i -o hello.s`

- 組合語言是**共同的輸出格式**：C、Fortran 的編譯器都能產生，再交給同一個 assembler
- 組合語言**跟 CPU 架構有關**：x86 與 ARM 的組合語言並不相同

::margin::

<strong>NEXT</strong>

下一頁直接在投影片上編譯，對照每一行 C 對應到哪幾行組語，並切換 x86 / ARM。

---

# C ↔ 組語對照：x86-64 vs ARM64

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
.arch { font-size: 12px; font-weight: 600; color: var(--tb-teal); letter-spacing: .06em; margin-bottom: 4px; }
</style>

<!--
💻 Monaco runner → Compiler Explorer。組語每一行前面的 Ln 與底色 = 對應到 C 的第 n 行。
可以現場改 5000 → 其他數字，看 movl $5000 跟著變。
講義上的 hello.s 是 Debian gcc 14.2 在 x86-64 上的輸出；ARM64 那邊沒有離線備援。
-->

---

# Assembly

<CompilePipeline :active="3" small />

<div grid="~ cols-[1fr_1.1fr] gap-5">
<div>

Assembler 把 `hello.s` 轉成二進位的 **relocatable object file** `hello.o`

```bash
gcc -c hello.s -o hello.o
```

`cat hello.o` 會看到亂碼，因為它已經是二進位格式了

<div class="callout">
用 <code>objdump -d hello.o</code> 反組譯，可以驗證編譯參數是否生效
</div>

</div>

```c {monaco-run} {autorun: false, height: '120px', runnerOptions: ce('hello-objdump')}
#include <stdio.h>
int main() {
    int a = 5000, b = 1000;
    int c = ((a + b) / 2);
    printf("%d\n", c);
    return 0;
}
```

</div>

<!--
💻 右邊 = godbolt 的 binary object 模式（等同 objdump -d），會顯示位址與 opcode。
cat hello.o 的亂碼：放一張截圖就好（TODO：截圖）。
-->

---
clicks: 3
---

# Linking ⭐

<CompilePipeline :active="4" small />

<LinkResolve />

<!--
⭐ 核心動畫：hello.o 裡的 printf 先畫成空洞 → linker 到 libc 找到 printf.o → 把位址填回去。
Symbol：程式中代表 function 或 variable 的名稱，例如 main、printf。
這裡用 static linking 畫比較直觀；dynamic linking 下一章會講。位址是示意，不是真的 objdump 結果。
-->

---
clicks: 2
---

# 執行的那一刻：Loader

<v-clicks>

- 執行 `./hello` 時，OS 呼叫 **Loader**，把執行檔的內容、資料載入記憶體，把控制權交給程式開頭
- 若程式用了 **dynamic linking**，Loader 也會在這時找到對應的 `.so` 載入

</v-clicks>

<AnimTodo title=".a 與 .so 長什麼樣" :steps="[
  '多個 .o（printf.o、scanf.o、malloc.o、free.o…）打包成 libc.a（ar t libc.a 可列出）',
  '.so 則是把這些程式碼 link 成單一個、可被多個程式共用的檔案',
]" />
