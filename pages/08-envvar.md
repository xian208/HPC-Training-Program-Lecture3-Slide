---
layout: section
chapter: "08"
title: Environment Variable
---

系統於編譯期與執行期定位相依檔案的路徑解析機制

---

# 自建動態函式庫之路徑解析範例

<div grid="~ cols-2 gap-5">
<div>

自己編了一個 `libadd.so`，放在 `mylib/`

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

# 連結期與載入期之路徑驗證流程

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
  { g1: 'fail', g2: '', note: '編譯時：linker 找不到 library' },
  { g1: 'pass', g2: '', note: '加上 -L，編譯成功' },
  { g1: 'pass', g2: 'fail', note: '執行時：換 loader 找不到 .so' },
  { g1: 'pass', g2: '', note: '設定 LD_LIBRARY_PATH……' },
  { g1: 'pass', g2: 'pass', note: '兩關都過，印出 3' },
]" />
</div>

<!--
terminal 輸出逐段出現，下方兩道關卡，錯在哪一關就在那裡打叉。
程式在編譯與執行時都需要知道「要去哪裡找檔案」，環境變數就是傳遞這類資訊的常見方式。
-->

---
clicks: 2
---

# 環境變數是什麼

- **環境變數**：名稱=值，子行程會繼承
- `CC=icx make`：只對這一條指令生效

```bash
export CFLAGS="-O3 -march=native"   # set（等號兩邊不能有空格）
echo $CFLAGS                         # check
unset CFLAGS                         # remove
```

<Flow :width="860" :height="150" :nodes="[
  { id: 'sh', x: 110, y: 60, label: 'bash', sub: 'CFLAGS=-O3', w: 150, tone: 'on' },
  { id: 'mk', x: 430, y: 60, label: 'make', sub: 'CFLAGS=-O3（複本）', w: 170, at: 1 },
  { id: 'cc', x: 740, y: 60, label: 'gcc', sub: 'CFLAGS=-O3（複本）', w: 170, at: 1 },
]" :edges="[
  { from: 'sh', to: 'mk', at: 1, label: '啟動、複製' }, { from: 'mk', to: 'cc', at: 1, label: '再複製' },
  { from: 'cc', to: 'sh', at: 2, dashed: true, tone: 'bad', bend: 'u', label: '子行程變更之環境變數無法反向傳遞至父行程' },
]" />

<!--
- 環境變數：shell 中以「名稱=值」形式儲存的設定，會被該 shell 啟動的程式（compiler、make、執行檔）繼承並讀取。
- 要加 export，之後啟動的子行程（make、gcc）才讀得到。
- 環境變數只會從父行程複製給子行程，不會往回傳 —— 這是 Module 章節「為什麼 module 是 shell function」的伏筆。
-->

---

# 常見的環境變數

| 用途 | 變數 |
|---|---|
| 編譯器與 flag | `CC` `CXX` `FC` `CFLAGS` `CXXFLAGS` |
| 給 build system | `CPPFLAGS` `LDFLAGS` `LIBS` |
| 找檔案的路徑 | `PATH` `CPATH` `LIBRARY_PATH` `LD_LIBRARY_PATH` |

<!--
- CC / CXX / FC：C / C++ / Fortran 編譯器；CFLAGS / CXXFLAGS：compiler flags。
- CPPFLAGS：給 preprocessor，常用來指定 -I；LDFLAGS：給 linker，常用來指定 -L；LIBS：要 link 哪個 library，例如 -lopenblas。
- CPATH：gcc 直接讀的 header 搜尋路徑；LIBRARY_PATH：gcc 在 link 時讀的 library 路徑。
- PATH：執行時到哪裡找 executable；LD_LIBRARY_PATH：loader 在執行時到哪裡找 .so。
- CPPFLAGS、LDFLAGS 是 configure、make 等 build system 慣用的變數，由 build system 把內容加進編譯指令；CPATH、LIBRARY_PATH 則是 gcc 自己會讀的變數，直接手打 gcc 指令也會生效。
-->

---

# LIBRARY_PATH vs LD_LIBRARY_PATH

<LinkGates :step="3" :steps="[
  { g1: '', g2: '' }, { g1: '', g2: '' }, { g1: '', g2: '' },
  { g1: 'pass', g2: 'pass', note: '名字很像，作用的時間點不同' },
]" />

| | `LIBRARY_PATH` | `LD_LIBRARY_PATH` |
|---|---|---|
| 讀取者 | gcc / linker | loader |
| 作用時間 | link time（編譯時） | load time（執行時） |
| 沒設好的錯誤 | `cannot find -lxxx` | `error while loading shared libraries` |

<!--
回到剛才的兩道關卡，把表格對上去就好。
-->
