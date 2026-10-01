---
layout: section
chapter: "09"
title: Module
---

一行指令切換版本，而且可以乾淨地還原

---
clicks: 3
---

# Module 是什麼

<v-clicks>

- **Module**：動態修改當前 shell 的環境變數
- **modulefile**：每個版本一份，記錄要改什麼
- `module load` / `unload`：套用，或還原

</v-clicks>

<!--
- Environment Modules / Lmod：一套用來動態修改當前 shell 環境變數的工具。
- 每個軟體版本對應一份 modulefile，記錄「用這個軟體時要改哪些環境變數」。
- HPC 優化時常要嘗試不同 compiler、library 版本的組合，同一台機器上常同時有好幾個版本。每次切換都手改 PATH、LD_LIBRARY_PATH，不但容易打錯，也很難完整還原；module 讓切換版本變成一行指令，而且可以乾淨地移除。
-->

---
clicks: 5
---

# module load 前後，PATH 變了什麼

<div grid="~ cols-[1fr_1fr] gap-5">

<Terminal font-size="12px" :steps="[
  { cmd: 'which zstd', out: '/usr/bin/zstd' },
  { cmd: 'module load zstd/1.5.6' },
  { cmd: 'which zstd', out: '/home/xian208/opt/zstd/1.5.6/bin/zstd', tone: 'ok' },
  { cmd: 'module unload zstd/1.5.6' },
  { cmd: 'which zstd', out: '/usr/bin/zstd' },
]" />

<PathStack cmd="zstd" :steps="[
  { label: 'load 前', path: ['/usr/local/bin', '/usr/bin', '/bin'], has: ['/usr/bin'] },
  { label: 'load 前', path: ['/usr/local/bin', '/usr/bin', '/bin'], has: ['/usr/bin'] },
  { label: 'module load 之後', path: ['~/opt/zstd/1.5.6/bin', '/usr/local/bin', '/usr/bin', '/bin'], has: ['~/opt/zstd/1.5.6/bin', '/usr/bin'] },
  { label: 'module load 之後', path: ['~/opt/zstd/1.5.6/bin', '/usr/local/bin', '/usr/bin', '/bin'], has: ['~/opt/zstd/1.5.6/bin', '/usr/bin'] },
  { label: 'unload 之後', path: ['/usr/local/bin', '/usr/bin', '/bin'], has: ['/usr/bin'] },
]" />

</div>

<!--
PATH 畫成一疊目錄，load 時 zstd 的路徑從最上面插入，which 由上往下找到第一個符合的；unload 再把它抽掉。
- 和講義相同：Debian 13 預設就有 /usr/bin/zstd（1.5.7，initramfs-tools 需要它）；load 之後 which 會先找到自己裝的 1.5.6，因為 module 把它加在 PATH 最前面，unload 後又變回系統的版本。
- 講義上的 home 是 /home/xian208，PATH 這裡縮寫成 ~，也省略了 /usr/local/games 等目錄。
-->

---
clicks: 3
---

# 想知道 load 改了什麼：module show

```text {3|4-6|7-9|all}{maxHeight: '300px'}
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
  'PATH：找得到 zstd 執行檔',
  '找 .so、library、header',
  '給 pkg-config、CMake 用',
  '',
]" />

<!--
- LD_LIBRARY_PATH：執行時 loader 找 .so；LIBRARY_PATH：link 時 gcc 找 library；CPATH：編譯時 gcc 找 header。
- PKG_CONFIG_PATH、CMAKE_PREFIX_PATH：讓 pkg-config、CMake 的 find_package 找得到它；setenv 直接設定一個變數。
- 全部都對應上一章的環境變數。
-->

---
clicks: 3
---

# Module 的運作原理

<v-clicks>

1. **不安裝**：軟體早就編好，module 只改環境變數
2. **load / unload**：照 modulefile 加上，再反向移除
3. **shell function**：才能改到當前 shell

</v-clicks>

<!--
1. module 本身不「安裝」任何東西：zstd 早就編好放在 $HOME/opt/zstd/1.5.6，只是 shell 不知道要去那裡找。
2. module load 讀 modulefile，照裡面的指令改環境變數：prepend-path PATH … 把路徑加到最前面，優先於系統內建的版本。module unload 把同一份 modulefile 反向執行，所以環境可以被還原。
3. 要改的是當前 shell 的環境變數，而子行程改不了父行程的環境變數，所以 module 是 shell function，不是獨立的執行檔。可以用 type module 確認：module is a function。
-->

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

<Flow :width="360" :height="260" :nodes="[
  { id: 'sh', x: 180, y: 50, label: 'bash', sub: 'FOO=（空）', w: 170, until: 6 },
  { id: 'sh2', x: 180, y: 50, label: 'bash', sub: 'FOO=hello', w: 170, at: 6, tone: 'on' },
  { id: 'ch', x: 180, y: 190, label: './set.sh', sub: 'FOO=hello', w: 170, at: 3, until: 5, tones: { 4: 'dim' } },
]" :edges="[
  { from: 'sh', to: 'ch', at: 3, until: 4, label: '開一個子行程' },
  { from: 'ch', to: 'sh', at: 4, until: 5, dashed: true, tone: 'bad', label: '結束，FOO 沒傳回來' },
]" />

</div>

<!--
- 直接執行 ./set.sh 時，shell 會開一個子行程，FOO 只存在於那個已結束的子行程中。
- 用 source 則是在當前 shell 執行，修改才會留下來。module 是 shell function，效果就像後者。
-->

---

# 安裝 Lmod

```bash
sudo apt install -y lmod
```

載入 `module` 這個 shell function：

```bash
source /etc/profile.d/lmod.sh
type module     # should print: module is a function
```

每個新 terminal 都要，所以加進 `~/.bashrc`：

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
# install to specific path $HOME/opt/zstd/1.5.6
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

依照 `<名稱>/<版本>` 擺放，檔名就是版本號

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

<div class="note">
TCL、Lua 兩種寫法，Lmod 都能讀
</div>

<!--
modulefile 有 TCL（傳統 Environment Modules）與 Lua（Lmod）兩種寫法。Lmod 兩種都能讀，還支援階層式 module：例如 load 了某個 compiler 之後，才看得到用它編譯的 library。
-->

---

# Module 常用指令

<div grid="~ cols-[1fr_300px] gap-5">

<Cast src="/casts/module-commands.cast" :rows="14" :todo="[
  'module use $HOME/selfmodule     # marker',
  'module avail                    # marker',
  'module load zstd/1.5.6          # marker',
  'module list                     # marker',
  'module unload zstd/1.5.6        # marker',
  'module purge',
]" />

```bash
module use <dir>   # where to look
module avail       # what's there
module load <m>
module list        # what's loaded
module unload <m>
module purge       # unload all
```

</div>

<!--
use → avail → load → list → unload → purge 錄成一段，每個指令放一個 marker，播到會自動停。
-->
