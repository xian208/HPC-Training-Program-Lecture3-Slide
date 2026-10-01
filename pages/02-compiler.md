---
layout: section
chapter: "02"
title: Compiler
---

把 source code 轉成 CPU 能執行的機器碼

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

- **compiler**：執行前，把整份 source 轉成機器碼

</v-click>

::margin::

<MarginNotes :notes="[
  '兩行指令就能看到結果',
  '第一行：gcc 編譯',
  '第二行：真正執行程式',
]" />

<!--
- 編譯器（compiler）在程式執行之前，把整份高階語言（如 C）寫的 source code 一次轉成 CPU 可以直接執行的 executable file。
- 為什麼需要 compiler：CPU 只看得懂 0 與 1 組成的低階機器指令，直接寫機器指令既困難又容易出錯。高階語言讓我們專注在演算法，compiler 是兩者之間的橋樑，兼顧開發效率與執行效能。
-->

---
clicks: 2
---

# Compiler vs Interpreter

<div mb-5>

- **Compiler**：先編好，執行效率高；改 code 要重編
- **Interpreter**：逐行執行，改完馬上跑；效率較低

</div>

<Flow :width="860" :height="210" :groups="[
  { x: 0, y: 8, w: 860, h: 88, label: 'COMPILER', at: 1 },
  { x: 0, y: 116, w: 860, h: 88, label: 'INTERPRETER', at: 2 },
]" :nodes="[
  { id: 's1', x: 90, y: 58, label: 'hello.c', at: 1 },
  { id: 'cc', x: 280, y: 58, label: 'gcc', sub: '整份一次翻譯', w: 130, at: 1 },
  { id: 'exe', x: 480, y: 58, label: 'hello', sub: '執行檔', at: 1, tone: 'on' },
  { id: 'run', x: 700, y: 58, label: './hello', sub: '直接執行，快', w: 140, at: 1 },
  { id: 's2', x: 90, y: 166, label: 'hello.py', at: 2 },
  { id: 'itp', x: 400, y: 166, label: 'python', sub: '讀一行、執行一行', w: 250, at: 2 },
  { id: 'out', x: 700, y: 166, label: '結果', sub: '改完馬上能跑', w: 140, at: 2, mono: false },
]" :edges="[
  { from: 's1', to: 'cc', at: 1 }, { from: 'cc', to: 'exe', at: 1 }, { from: 'exe', to: 'run', at: 1 },
  { from: 's2', to: 'itp', at: 2 }, { from: 'itp', to: 'out', at: 2 },
]" />

<!--
- 編譯：程式碼先經過編譯器，全部編譯成機器語言，產生執行檔後再一次執行，執行效率較高，但修改程式碼後需重新編譯。
- 直譯：程式碼透過直譯器一行一行被執行，修改後馬上可以重新執行，但執行效率較低。
- 原講義的圖來源：hackmd（@Co-E5uCjTiSXhCaEXduquA），這裡重畫成兩條流程。
-->

---

# 常見的 CPU 編譯器

<div grid="~ cols-2 gap-6" mt-2>
<div>

### gcc

GNU 開源，多數 Linux 預先安裝

</div>
<div>

### Intel oneAPI

在 Intel CPU 上可能比 gcc 快

<div class="note"><code>icc</code> 在 2024.0 之後移除，改用 <code>icx</code></div>

</div>
</div>

---
clicks: 3
---

# LLVM：模組化的編譯器架構

<Flow :width="860" :height="250" :groups="[
  { x: 0, y: 4, w: 190, h: 242, label: 'FRONTEND' },
  { x: 335, y: 4, w: 190, h: 242, label: 'IR', at: 1 },
  { x: 670, y: 4, w: 190, h: 242, label: 'BACKEND', at: 2 },
]" :nodes="[
  { id: 'c', x: 95, y: 70, label: 'C' },
  { id: 'cpp', x: 95, y: 135, label: 'C++' },
  { id: 'f', x: 95, y: 200, label: 'Fortran' },
  { id: 'ir', x: 430, y: 135, label: 'LLVM IR', sub: '與平台無關', w: 130, at: 1, tone: 'on' },
  { id: 'x86', x: 765, y: 70, label: 'x86', at: 2, tones: { 3: 'on' } },
  { id: 'arm', x: 765, y: 135, label: 'ARM', at: 2, tones: { 3: 'dim' } },
  { id: 'gpu', x: 765, y: 200, label: 'GPU', at: 2, tones: { 3: 'dim' } },
]" :edges="[
  { from: 'c', to: 'ir', at: 1, tones: { 3: 'on' } }, { from: 'cpp', to: 'ir', at: 1 }, { from: 'f', to: 'ir', at: 1 },
  { from: 'ir', to: 'x86', at: 2, tones: { 3: 'on' }, label: '' }, { from: 'ir', to: 'arm', at: 2 }, { from: 'ir', to: 'gpu', at: 2 },
]" />

<div v-click="3" class="note">
<code>icx</code> = LLVM ＋ 針對 Intel CPU 最佳化的 backend
</div>

<!--
- LLVM 把編譯過程拆成 Frontend（原始語言 → IR）、IR（與平台無關的中間語言）、Backend（IR → 各平台機器碼）三部分。
- 不同編譯器可以共用同一套基礎架構，只需要客製化自己需要的部分。
- Intel 的 icx 就是基於 LLVM 開發，在 backend 加入針對 Intel CPU（如 AVX-512）的深度最佳化。
-->

---
clicks: 2
---

# GPU 程式：nvcc

<Flow :width="860" :height="200" :nodes="[
  { id: 'cu', x: 80, y: 100, label: 'app.cu' },
  { id: 'nvcc', x: 270, y: 100, label: 'nvcc', sub: '拆成兩部分', w: 130 },
  { id: 'dev', x: 520, y: 40, label: 'device code', sub: '跑在 GPU', w: 150, at: 1 },
  { id: 'host', x: 520, y: 160, label: 'host code', sub: '跑在 CPU', w: 150, at: 2 },
  { id: 'gpu', x: 770, y: 40, label: 'nvcc 編譯', w: 150, at: 1, tone: 'on', mono: false },
  { id: 'gcc', x: 770, y: 160, label: 'gcc 編譯', w: 150, at: 2, tone: 'on', mono: false },
]" :edges="[
  { from: 'cu', to: 'nvcc' },
  { from: 'nvcc', to: 'dev', at: 1 }, { from: 'dev', to: 'gpu', at: 1 },
  { from: 'nvcc', to: 'host', at: 2 }, { from: 'host', to: 'gcc', at: 2 },
]" />

<!--
nvcc 把 .cu（CUDA 的 C++）分成 device 端（跑在 GPU 上）與 host 端（跑在 CPU 上）：device 端由 nvcc 自己編譯，host 端交給 CPU 的 compiler（例如 gcc）。
-->

---
clicks: 4
---

# 只改一個參數，時間差好幾倍

<div grid="~ cols-[1fr_1.15fr] gap-5">

<<< @/snippets/loop.c c

<Terminal font-size="12.5px" height="292px" :steps="[
  { cmd: 'gcc -O0 loop.c -o loop_O0' },
  { cmd: 'time ./loop_O0', out: '1.644934057835\nreal\t0m1.721s' },
  { cmd: 'gcc -O3 loop.c -o loop_O3' },
  { cmd: 'time ./loop_O3', out: '1.644934057835\nreal\t0m0.855s', tone: 'ok' },
]" />

</div>

<div v-click="4" class="note key">
結果相同；<code>-O0</code>、<code>-O3</code> 就是 compiler flag
</div>

<!--
- 和講義相同：4 核心 x86_64 VM 上實測，-O3 快了約 2 倍。時間會因機器而異，重點是相對差距。
- 想現場跑也可以，loop_O0 大約 1.5 秒。
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
Monaco runner → Compiler Explorer（x86-64 gcc 14.2）。按右上角的執行鍵，也可以現場改 flag 或程式。
觀察重點：-O0 每一圈都把 s、i 寫回記憶體（-8(%rbp) 之類）再讀出來；-O3 整個迴圈都留在暫存器（xmm、rax）。
左邊 L4、L5 標出迴圈對應的組語。
連不上網路時會顯示 snippets/ce-cache 裡預先存好的輸出（gcc 13.3 產生）。
-->

---
clicks: 3
---

# Compiler flags：optimization

<v-clicks>

- `-O0`：不最佳化，gcc 預設
- `-O1` / `-O2`：逐步最佳化，release 常用 `-O2`
- `-O3`：最激進，但不保證比 `-O2` 快

</v-clicks>

<!--
- 常見的 flag 依用途分四類：optimization level、architecture、debugging、include / path。
- -O0：完全不最佳化，source code 怎麼寫就怎麼編譯。
- -O1 / -O2：逐步最佳化；部分 library 的 release 版本預設 -O2。
- -O3：啟用更多迴圈向量化（vectorization）、function inlining……代價是編譯時間變長、執行檔變大。
- 不同 optimization level 做了哪些最佳化，會因 compiler 廠商、版本而異，以官方文件為準。
-->

---
clicks: 3
---

# Compiler flags：architecture

<Flow :width="860" :height="190" :groups="[
  { x: 0, y: 6, w: 360, h: 176, label: 'LOGIN NODE（較新 CPU）' },
  { x: 500, y: 6, w: 360, h: 176, label: 'COMPUTE NODE（較舊 CPU）', at: 1 },
]" :nodes="[
  { id: 'src', x: 90, y: 100, label: 'app.c' },
  { id: 'bin', x: 260, y: 100, label: 'app', sub: '-march=native', w: 140 },
  { id: 'run', x: 680, y: 100, label: './app', sub: 'Illegal instruction', w: 200, at: 1, tone: 'bad', tones: { 3: 'on' } },
]" :edges="[
  { from: 'src', to: 'bin', label: 'gcc' },
  { from: 'bin', to: 'run', at: 1, tone: 'bad', tones: { 3: 'on' }, label: '拿去跑' },
]" />

<div mt-3>

- `-march=native`：用編譯那台機器的全部指令集
- **解法**：`-march=<架構>`，或在 compute node 編

</div>

<v-click at="3"><div class="note">例如 <code>-march=skylake-avx512</code></div></v-click>

<!--
- -march=native 偵測的是「執行編譯的那台機器」，好處是充分利用硬體，缺點是執行檔只能在相同或相容架構的機器上跑。
- 在較新的 login node 上編譯、到較舊的 compute node 執行，可能出現 Illegal instruction；反過來則用不到 compute node 支援的指令集。
- 叢集上使用 -march=<指定架構>，或直接在 compute node 上編譯，比較保險。
-->

---

# Compiler flags：debugging、path

- `-g`：加入 debug 資訊，不影響執行速度
- `-I<dir>`：編譯時到 dir 找 header
- `-L<dir>` / `-l<name>`：link 時到 dir 找 lib&lt;name&gt;

<!--
- -g：方便找 bug，之後做 profiling 也需要；編譯時間與檔案大小會增加，但產生的機器碼不變，所以不影響執行速度。
- -I<dir>：preprocessing 階段，到 <dir> 找 #include 的 header file。
- -L<dir>：linking 階段，到 <dir> 找要 link 的 library。
- -l<name>：link lib<name>.so 或 lib<name>.a。
- -I / -L / -l 在 Environment Variable 章節（libadd 範例）和 Lab3-2 的 mpicc --showme 會再用到。
-->
