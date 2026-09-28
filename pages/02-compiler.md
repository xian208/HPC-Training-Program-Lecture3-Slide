---
layout: section
chapter: "02"
title: Compiler
---

把人看得懂的 source code，轉成 CPU 能執行的機器碼

---
clicks: 2
---

# 一行 gcc 做了什麼

```bash {none|1|2-3}
$ gcc hello_world.c -o hello_world
$ ./hello_world
hello world!
```

<v-click at="1">

**編譯器（compiler）** 在程式執行**之前**，把整份高階語言（如 C）寫的 source code 一次轉成 CPU 可以直接執行的 executable file。

</v-click>

::margin::

<MarginNotes :notes="[
  '先看最簡單的例子：寫好 hello_world.c 之後，兩行指令就能看到結果。',
  '第一行的 gcc 就是 compiler，把 hello_world.c 轉成 CPU 可以執行的 hello_world。',
  '第二行才是真正執行程式。',
]" />

<!--
為什麼需要 compiler：CPU 只看得懂 0 與 1 組成的低階機器指令，直接寫機器指令既困難又容易出錯。
高階語言讓我們專注在演算法，compiler 是兩者之間的橋樑，兼顧開發效率與執行效能。
-->

---

# Compiler vs Interpreter

<AnimTodo title="兩條並排的時間軸（取代 hackmd 那張圖）" :steps="[
  'Compiler：整份 source → 編譯器 → 執行檔，之後才開始執行（執行效率高，改 code 要重編）',
  'Interpreter：一行翻譯、執行一行，再下一行（改完馬上能跑，效率較低）',
  '兩條線同時跑到終點，標出「修改後重新執行」各要多久',
]" />

::margin::

<strong>NOTE</strong>

原圖來源：hackmd（@Co-E5uCjTiSXhCaEXduquA），重畫成動畫後就不用再附外部圖片。

---

# 常見的 CPU 編譯器

<div grid="~ cols-2 gap-6" mt-2>
<div>

### gcc

GNU Compiler Collection，開源，多數 Linux 發行版都預先安裝

</div>
<div>

### Intel oneAPI compiler

Intel 開發，在 Intel CPU 上可能比 gcc 表現更好

</div>
</div>

<div class="callout">
Intel 的 <code>icc</code> 在 2024.0 之後被正式移除，改為 <code>icx</code>，使用時要注意版本。
</div>

---
clicks: 3
---

# LLVM：模組化的編譯器基礎架構

<AnimTodo title="Frontend → IR → Backend" :steps="[
  'C / C++ / Fortran 等多個 frontend，各自把原始語言轉成同一種 IR',
  'IR 與平台無關，再分到 x86 / ARM / GPU 等不同 backend 產生機器碼',
  '亮起其中一條：icx = LLVM ＋ 針對 Intel CPU（如 AVX-512）深度最佳化的 backend',
]" h="220px" />

::margin::

<MarginNotes :notes="[
  '不同編譯器可以共用同一套基礎架構，只需要客製化自己需要的部分。',
  '',
  '',
  'Intel 的 icx 就是基於 LLVM 開發。',
]" />

---

# GPU 程式：nvcc

<AnimTodo title=".cu 分成兩條路" :steps="[
  '.cu（CUDA C++）進入 nvcc',
  'device 端（跑在 GPU 上）由 nvcc 自己編譯',
  'host 端（跑在 CPU 上）交給 CPU compiler（例如 gcc）',
]" />

---
clicks: 4
---

# 只改一個參數，時間差四倍

<div grid="~ cols-[1fr_1.15fr] gap-5">

<<< @/snippets/loop.c c

<Terminal font-size="12.5px" :steps="[
  { cmd: 'gcc -O0 loop.c -o loop_O0' },
  { cmd: 'time ./loop_O0', out: '1.644934057835\n\nreal\t0m1.509s\nuser\t0m1.505s\nsys\t0m0.004s' },
  { cmd: 'gcc -O3 loop.c -o loop_O3' },
  { cmd: 'time ./loop_O3', out: '1.644934057835\n\nreal\t0m0.377s\nuser\t0m0.373s\nsys\t0m0.004s', tone: 'ok' },
]" />

</div>

<div v-click="4" class="callout">
計算結果相同，<code>-O3</code> 只花了約四分之一的時間。這裡的 <code>-O0</code>、<code>-O3</code> 就是 <strong>compiler flag</strong>。時間會因機器而異，重點是相對差距。
</div>

<!--
💻 這頁的時間是講義上量好的數字（固定輸出），用 Terminal 元件模擬打字。
想現場跑的話也可以，loop_O0 約 1.5 秒，不會拖太久。
-->

---

# -O0 和 -O3 到底差在哪？

<div grid="~ cols-2 gap-4">

```c {monaco-run} {autorun: false, height: '150px', runnerOptions: ce('loop-O0')}
#include <stdio.h>
int main() {
    double s = 0;
    for (long i = 1; i <= 500000000; i++)
        s += 1.0 / ((double)i * i);
    printf("%.12f\n", s);
    return 0;
}
```

```c {monaco-run} {autorun: false, height: '150px', runnerOptions: ce('loop-O3')}
#include <stdio.h>
int main() {
    double s = 0;
    for (long i = 1; i <= 500000000; i++)
        s += 1.0 / ((double)i * i);
    printf("%.12f\n", s);
    return 0;
}
```

</div>

<!--
💻 Monaco runner → Compiler Explorer（x86-64 gcc 14.2）。按左上角 ▶ 執行，也可以現場改 flag 或程式。
觀察重點：-O0 每一圈都把 s、i 寫回記憶體（-8(%rbp) 之類）再讀出來；-O3 整個迴圈都留在暫存器（xmm、rax）。
左邊 L4、L5 標出迴圈對應的組語。
連不上網路時會顯示 snippets/ce-cache 裡預先存好的輸出（gcc 13.3 產生）。
-->

---
clicks: 3
---

# Compiler flags：optimization level

<v-clicks>

- `-O0`：完全不最佳化，source code 怎麼寫就怎麼編譯；**gcc 預設**
- `-O1` / `-O2`：逐步最佳化；部分 library 的 release 版本預設 `-O2`
- `-O3`：最激進，啟用更多迴圈向量化（vectorization）、function inlining……<br>代價是編譯時間變長、執行檔變大，而且**不保證**比 `-O2` 快

</v-clicks>

<div class="callout">
不同 optimization level 做了哪些最佳化，會因 compiler 廠商、版本而異，以官方文件為準。
</div>

::margin::

<strong>四類 flag</strong>

1. optimization level
2. architecture
3. debugging
4. include / path

---
clicks: 3
---

# Compiler flags：architecture

`-march=native`：偵測**執行編譯的那台機器**的 CPU 架構，啟用它支援的所有指令集

<AnimTodo title="在 login node 編譯，拿到 compute node 跑" :steps="[
  '較新的 login node 上 -march=native 編譯（用到新指令集）',
  '送到較舊的 compute node 執行 → Illegal instruction',
  '解法：-march=<指定架構>（例如 skylake-avx512），或直接在 compute node 上編譯',
]" />

::margin::

<MarginNotes :notes="[
  '好處是充分利用硬體；缺點是執行檔只能在相同或相容架構的機器上跑。',
  '',
  '反過來，在較舊的 login node 上編譯，就用不到 compute node 支援的指令集。',
  '',
]" />

---

# Compiler flags：debugging 與 include / path

### debugging

`-g`：在執行檔中加入 debug 資訊，方便找 bug，之後做 profiling 也需要。編譯時間與檔案大小會增加，但**不影響執行速度**（產生的機器碼不變）

### include / path

| flag | 階段 | 作用 |
|---|---|---|
| `-I<dir>` | preprocessing | 到 `<dir>` 找 `#include` 的 header file |
| `-L<dir>` | linking | 到 `<dir>` 找要 link 的 library |
| `-l<name>` | linking | link `lib<name>.so` 或 `lib<name>.a` |

<!--
靜態頁。-I / -L / -l 在 Environment Variable 章節（libadd 範例）和 Lab3-2 mpicc --showme 會再用到。
-->
