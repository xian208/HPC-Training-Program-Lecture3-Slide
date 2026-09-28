---
layout: section
chapter: "08"
title: Environment Variable
---

程式在編譯與執行時，怎麼知道「要去哪裡找檔案」？

---

# 先看一個常見的錯誤

<div grid="~ cols-2 gap-5">
<div>

自己編譯了一個 library `libadd.so`，放在 `mylib/`

```c
// mylib/add.c
int add(int a, int b) { return a + b; }
```

```bash
$ gcc -shared -fPIC mylib/add.c -o mylib/libadd.so
```

</div>
<div>

再寫一支會呼叫它的 `use.c`

```c
// use.c
#include <stdio.h>
int add(int a, int b);
int main() { printf("%d\n", add(1, 2)); return 0; }
```

</div>
</div>

---
clicks: 5
---

# 三次嘗試，兩道關卡 ⭐

<Terminal font-size="12px" :steps="[
  { cmd: 'gcc use.c -ladd -o use', out: '/usr/bin/ld: cannot find -ladd: No such file or directory\ncollect2: error: ld returned 1 exit status', tone: 'err' },
  { cmd: 'gcc use.c -Lmylib -ladd -o use' },
  { cmd: './use', out: './use: error while loading shared libraries: libadd.so: cannot open shared object file: No such file or directory', tone: 'err' },
  { cmd: 'export LD_LIBRARY_PATH=$PWD/mylib:$LD_LIBRARY_PATH' },
  { cmd: './use', out: '3', tone: 'ok' },
]" />

<div mt-4>
<LinkGates :steps="[
  { g1: '', g2: '' },
  { g1: 'fail', g2: '', note: '第一次：linker 在編譯時找不到 library' },
  { g1: 'pass', g2: '', note: '加上 -L 之後，編譯成功' },
  { g1: 'pass', g2: 'fail', note: '執行時卻換 loader 找不到 .so' },
  { g1: 'pass', g2: '', note: '設定 LD_LIBRARY_PATH 這個環境變數……' },
  { g1: 'pass', g2: 'pass', note: '兩關都過，印出 3' },
]" />
</div>

<!--
⭐ 核心動畫：terminal 輸出逐段出現，下方時間軸兩道關卡，錯在哪一關就在那裡打叉。
程式在編譯與執行時都需要知道「要去哪裡找檔案」，環境變數就是傳遞這類資訊的常見方式。
-->

---
clicks: 2
---

# 環境變數是什麼

shell 中以「**名稱=值**」形式儲存的設定，會被該 shell 啟動的程式（compiler、make、執行檔）**繼承**並讀取

```bash
export CFLAGS="-O3 -march=native"   # set（等號兩邊不能有空格）
echo $CFLAGS                         # check
unset CFLAGS                         # remove
```

只想讓某一條指令用：`CC=icx make`

<AnimTodo title="父行程 → 子行程" :steps="[
  'shell export CFLAGS 之後，啟動 make、gcc',
  '子行程各自拿到一份「複本」（為 Module 章節的原理第 4 點鋪路）',
]" />

<!--
要加 export，之後啟動的子行程（make、gcc）才讀得到。
-->

---

# 常見的環境變數

<div grid="~ cols-2 gap-6" text-sm>

| 變數 | 用途 |
|---|---|
| `CC` / `CXX` / `FC` | C / C++ / Fortran 編譯器 |
| `CFLAGS` / `CXXFLAGS` | compiler flags |
| `CPPFLAGS` | 給 preprocessor，常用來指定 `-I` |
| `CPATH` | gcc 直接讀的 header 搜尋路徑 |
| `LDFLAGS` | 給 linker，常用來指定 `-L` |

| 變數 | 用途 |
|---|---|
| `LIBRARY_PATH` | gcc 在 **link 時**讀的 library 路徑 |
| `LIBS` | 要 link 哪個 library，例如 `-lopenblas` |
| `PATH` | 執行時到哪裡找 executable |
| `LD_LIBRARY_PATH` | loader 在**執行時**到哪裡找 `.so` |

</div>

<div class="callout">
<code>CPPFLAGS</code>、<code>LDFLAGS</code> 是 configure、make 等 build system 慣用的變數，由 build system 把內容加進編譯指令；<code>CPATH</code>、<code>LIBRARY_PATH</code> 則是 gcc 自己會讀的變數，直接手打 gcc 指令也會生效。
</div>

---

# LIBRARY_PATH vs LD_LIBRARY_PATH

<LinkGates :step="3" :steps="[
  { g1: '', g2: '' }, { g1: '', g2: '' }, { g1: '', g2: '' },
  { g1: 'pass', g2: 'pass', note: '名字很像，但作用的時間點不同' },
]" />

| | `LIBRARY_PATH` | `LD_LIBRARY_PATH` |
|---|---|---|
| 讀取者 | gcc / linker | loader |
| 作用時間 | link time（編譯時） | load time（執行時） |
| 沒設好的錯誤 | 編譯時 `cannot find -lxxx` | 執行時 `error while loading shared libraries` |

<!--
回到剛才的兩道關卡，把表格對上去就好，不需要新動畫。
-->
