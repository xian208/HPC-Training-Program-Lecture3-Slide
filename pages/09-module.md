---
layout: section
chapter: "09"
title: Module
---

一行指令切換 compiler、library 版本，而且可以乾淨地還原

---

# Module 是什麼

**Environment Modules / Lmod**：一套用來**動態修改當前 shell 環境變數**的工具

- 每個軟體版本對應一份 **modulefile**，記錄「用這個軟體時要改哪些環境變數」
- `module load` / `module unload` 套用或還原這些設定

<v-click>

HPC 優化時常要嘗試不同 compiler、library 版本的組合，同一台機器上常同時有好幾個版本。每次切換都手改 `PATH`、`LD_LIBRARY_PATH`，不但容易打錯，也很難完整還原。

</v-click>

---
clicks: 5
---

# module load 前後，PATH 變了什麼 ⭐

<div grid="~ cols-[1fr_1fr] gap-5">

<Terminal font-size="12px" :steps="[
  { cmd: 'zstd --version', out: 'bash: zstd: command not found', tone: 'err' },
  { cmd: 'module load zstd/1.5.6' },
  { cmd: 'zstd --version', out: '*** Zstandard CLI (64-bit) v1.5.6, by Yann Collet ***', tone: 'ok' },
  { cmd: 'module unload zstd/1.5.6' },
  { cmd: 'zstd --version', out: 'bash: zstd: command not found', tone: 'err' },
]" />

<PathStack cmd="zstd" :steps="[
  { label: 'load 前', path: ['/usr/local/bin', '/usr/bin', '/bin', '/usr/local/games', '/usr/games'] },
  { label: 'load 前', path: ['/usr/local/bin', '/usr/bin', '/bin', '/usr/local/games', '/usr/games'] },
  { label: 'module load 之後', path: ['~/opt/zstd/1.5.6/bin', '/usr/local/bin', '/usr/bin', '/bin', '/usr/local/games', '/usr/games'], has: ['~/opt/zstd/1.5.6/bin'] },
  { label: 'module load 之後', path: ['~/opt/zstd/1.5.6/bin', '/usr/local/bin', '/usr/bin', '/bin', '/usr/local/games', '/usr/games'], has: ['~/opt/zstd/1.5.6/bin'] },
  { label: 'unload 之後', path: ['/usr/local/bin', '/usr/bin', '/bin', '/usr/local/games', '/usr/games'] },
]" />

</div>

<div class="callout">
如果系統已經裝了 zstd，load 前 <code>which zstd</code> 會是 <code>/usr/bin/zstd</code>。觀察重點不變：load 之後會變成自己安裝的路徑，因為 module 把它加在 <code>PATH</code> 最前面。
</div>

<!--
⭐ 核心動畫：PATH 畫成一疊目錄，load 時 zstd 的路徑從最上面插入，which 由上往下找到第一個符合的；unload 再把它抽掉。
講義原文的 home 是 /home/xian208，這裡縮寫成 ~。
-->

---

# 想知道 load 改了什麼：module show

```text {3|4|5|6|7-8|9|all}{maxHeight: '300px'}
   /home/xian208/selfmodule/zstd/1.5.6:
whatis("zstd 1.5.6")
prepend_path{"PATH","/home/xian208/opt/zstd/1.5.6/bin",delim=":",priority="0"}
prepend_path{"LD_LIBRARY_PATH","/home/xian208/opt/zstd/1.5.6/lib",delim=":",priority="0"}
prepend_path{"LIBRARY_PATH","/home/xian208/opt/zstd/1.5.6/lib",delim=":",priority="0"}
prepend_path{"CPATH","/home/xian208/opt/zstd/1.5.6/include",delim=":",priority="0"}
prepend_path{"PKG_CONFIG_PATH","/home/xian208/opt/zstd/1.5.6/lib/pkgconfig",delim=":",priority="0"}
prepend_path{"CMAKE_PREFIX_PATH","/home/xian208/opt/zstd/1.5.6",delim=":",priority="0"}
setenv{"ZSTD_ROOT","/home/xian208/opt/zstd/1.5.6"}
```

::margin::

<MarginNotes label="$ module show zstd/1.5.6" :notes="[
  '<code>PATH</code>：讓 shell 找得到 zstd 執行檔。',
  '<code>LD_LIBRARY_PATH</code>：執行時 loader 找 .so。',
  '<code>LIBRARY_PATH</code>：link 時 gcc 找 library。',
  '<code>CPATH</code>：編譯時 gcc 找 header。',
  '<code>PKG_CONFIG_PATH</code>、<code>CMAKE_PREFIX_PATH</code>：讓 pkg-config、CMake 的 find_package 找得到它。',
  '<code>setenv</code>：直接設定一個變數。',
  '全部都是對應上一章的環境變數。',
]" />

---
clicks: 4
---

# Module 的運作原理

<v-clicks>

1. module 本身<strong>不「安裝」</strong>任何東西：zstd 早就編好放在 `$HOME/opt/zstd/1.5.6`，只是 shell 不知道要去那裡找
2. `module load` 讀 modulefile，照裡面的指令改環境變數：`prepend-path PATH …` 把路徑加到最前面，優先於系統內建的版本
3. `module unload` 把同一份 modulefile **反向執行**，所以環境可以被還原
4. 要改的是**當前 shell** 的環境變數，而子行程改不了父行程的環境變數，所以 module 是 **shell function**，不是獨立的執行檔

</v-clicks>

---
clicks: 6
---

# 小實驗：./set.sh vs source set.sh

<div grid="~ cols-[1.1fr_1fr] gap-5">

<Terminal font-size="12.5px" :steps="[
  { cmd: 'cat set.sh', out: 'export FOO=hello' },
  { cmd: 'chmod +x set.sh   # make it executable first' },
  { cmd: './set.sh          # runs in a child process' },
  { cmd: 'echo $FOO', out: ' ', tone: 'mut' },
  { cmd: 'source set.sh     # runs in the current shell' },
  { cmd: 'echo $FOO', out: 'hello', tone: 'ok' },
]" />

<AnimTodo title="子行程泡泡" :steps="[
  '', '',
  './set.sh 開出一個子行程泡泡，FOO 設在泡泡裡',
  '泡泡結束就消失，當前 shell 的 FOO 還是空的',
  'source：直接在當前 shell 執行',
  'FOO 留下來了；module 是 shell function，效果就像這樣',
]" />

</div>

<!--
環境變數只會從父行程複製給子行程，不會往回傳。
可以用 type module 確認，輸出會顯示 module is a function。
AnimTodo 的 click 編號對應左邊 terminal 的步驟。
-->

---

# 安裝 Lmod

```bash
sudo apt install -y lmod
```

module 是 shell function，裝完要先 source 初始化腳本，讓當前 shell 定義 `module`：

```bash
source /etc/profile.d/lmod.sh
type module     # should print: module is a function
```

每開一個新 terminal 都要重新 source，建議直接加進 `~/.bashrc`：

```bash
echo 'source /etc/profile.d/lmod.sh' >> ~/.bashrc
```

---

# 安裝範例 library，並寫 modulefile

<div grid="~ cols-2 gap-5">

```bash
# download
curl -sL -o zstd.tar.gz https://github.com/facebook/zstd/releases/download/v1.5.6/zstd-1.5.6.tar.gz
# unzip
tar xzf zstd.tar.gz && cd zstd-1.5.6
# compile
make -j$(nproc)
# install to $HOME/opt/zstd/1.5.6
make prefix=$HOME/opt/zstd/1.5.6 install
```

```tcl
#%Module1.0

module-whatis "zstd 1.5.6"

set root $::env(HOME)/opt/zstd/1.5.6

prepend-path PATH               $root/bin
prepend-path LD_LIBRARY_PATH    $root/lib
prepend-path LIBRARY_PATH       $root/lib
prepend-path CPATH              $root/include
prepend-path PKG_CONFIG_PATH    $root/lib/pkgconfig
prepend-path CMAKE_PREFIX_PATH  $root

setenv ZSTD_ROOT $root
```

</div>

---

# modulefile 要放在哪

modulefile 依照 `<名稱>/<版本>` 的結構擺放，檔名就是版本號

<div grid="~ cols-2 gap-5">

```text
<放 modulefile 的資料夾>/
├── <library 1 name>/
│   ├── <version 1>
│   └── <version 2>
└── <library 2 name>/
    ├── <version 1>
    └── <version 2>
```

```text
# in this example
selfmodule/
└── zstd/
    └── 1.5.6
```

</div>

<div class="callout">
modulefile 有 <strong>TCL</strong>（傳統 Environment Modules）與 <strong>Lua</strong>（Lmod）兩種寫法。Lmod 兩種都能讀，還支援階層式 module：例如 load 了某個 compiler 之後，才看得到用它編譯的 library。
</div>

---

# Module 常用指令

<div grid="~ cols-[1fr_310px] gap-5">

<Cast src="/casts/module-commands.cast" :rows="14" :todo="[
  'module use $HOME/selfmodule     # marker',
  'module avail                    # marker',
  'module load zstd/1.5.6          # marker',
  'module list                     # marker',
  'module unload zstd/1.5.6        # marker',
  'module purge',
]" />

<div text-sm>

| 指令 | 作用 |
|---|---|
| `module use <dir>` | 告訴 module 去哪找 modulefile |
| `module avail` | 列出可用的 module |
| `module load` | 套用 |
| `module list` | 目前 load 了哪些 |
| `module unload` | 移除 |
| `module purge` | 全部 unload |

</div>
</div>

<!--
🎥 use → avail → load → list → unload → purge 錄成一段，每個指令放一個 marker。
-->
