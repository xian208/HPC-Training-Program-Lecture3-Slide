---
layout: section
chapter: "10"
title: Spack
---

從「裝」到「用」都包辦的 HPC package manager

---
clicks: 3
---

# Spack 是什麼

為 HPC 設計的 package manager

<v-clicks>

- **一行 spec**：版本、compiler、variant、架構
- **自動解析**：整棵 dependency tree 一起裝
- **各自獨立**：每種組合裝到不同路徑

</v-clicks>

<!--
- Spack 用一行 spec 描述想要的軟體（版本、編譯器、variant、dependency、目標架構），自動下載 source code、解析並編譯整棵 dependency tree，把每一種組合裝到獨立的路徑，並幫你設定好使用時需要的環境變數。
- 跑題目時常要測不同的 software stack，一個 application 可能依賴數十個 library。全部手動 build，就要自己處理每個 dependency 的版本、configure / CMake 參數與安裝路徑；換一個 compiler 又全部重來。Spack 把這些流程自動化，切換 software stack 只需要改 spec。
-->

---

# 同樣裝 zstd：一行 spack install

<Cast src="/casts/spack-install-zstd.cast" :rows="14" :todo="[
  'spack install zstd +programs',
  'spack find zstd',
]" />

::margin::

<strong>對照 Module</strong>

自己下載、編譯、再寫 modulefile

<strong>+programs</strong>

才會裝 `zstd` 執行檔

<!--
🎥 需要網路也要編譯時間，錄成 cast（第一次安裝會先裝 gcc-runtime、compiler-wrapper、gmake，錄影裡會看到）。
Spack 的 zstd 預設 variant 是 ~programs，只裝 library（lib/、include/），沒有 zstd 執行檔，所以要加 +programs。
-->

---
clicks: 4
---

# spack load：就像 module load

<div grid="~ cols-[1fr_1.15fr] gap-5">

<Terminal font-size="12px" :steps="[
  { cmd: 'which zstd', out: '/usr/bin/zstd' },
  { cmd: 'spack load zstd' },
  { cmd: 'which zstd', out: '…/zstd-1.5.7-icmiglp…/bin/zstd', tone: 'ok' },
  { cmd: 'spack unload zstd' },
  { cmd: 'which zstd', out: '/usr/bin/zstd' },
]" :initial="1" />

<PathStack cmd="zstd" :steps="[
  { label: 'load 前', path: ['~/spack/bin', '/usr/local/bin', '/usr/bin', '/bin'], has: ['/usr/bin'] },
  { label: 'spack load 之後', path: ['…/zstd-1.5.7-icmiglp…/bin', '~/spack/bin', '/usr/local/bin', '/usr/bin', '/bin'], has: ['…/zstd-1.5.7-icmiglp…/bin', '/usr/bin'] },
  { label: 'spack load 之後', path: ['…/zstd-1.5.7-icmiglp…/bin', '~/spack/bin', '/usr/local/bin', '/usr/bin', '/bin'], has: ['…/zstd-1.5.7-icmiglp…/bin', '/usr/bin'] },
  { label: 'spack unload 之後', path: ['~/spack/bin', '/usr/local/bin', '/usr/bin', '/bin'], has: ['/usr/bin'] },
  { label: 'spack unload 之後', path: ['~/spack/bin', '/usr/local/bin', '/usr/bin', '/bin'], has: ['/usr/bin'] },
]" />

</div>

<!--
🎬 直接沿用 Module 那疊 PATH，只把路徑換成帶 hash 的目錄。
- 安裝路徑由 Spack 決定（zstd-1.5.7-<hash>），hash 由 spec 算出，不同 build 裝在不同目錄、可以並存。
- 不用自己寫 modulefile，spack load 會把 bin/ 加到 PATH 最前面。
- ~/spack/bin 是執行 setup-env.sh 時加上的，讓 shell 找得到 spack 指令。
- 實際的 PATH 裡 zstd 路徑會出現兩次，是 Spack 本身的行為，不影響使用（這裡畫一次）。
-->

---
clicks: 3
---

# Spack 與 Module 的差別

module 只負責「**用**」，Spack 從「**裝**」到「**用**」都包辦

<table class="cmp">
  <thead><tr><th></th><th>Module</th><th>Spack</th></tr></thead>
  <tbody>
    <tr v-click="1"><td>定位</td><td>環境變數管理工具</td><td>package manager</td></tr>
    <tr v-click="2"><td>軟體從哪來</td><td>自己先編好</td><td>自動下載、編譯</td></tr>
    <tr v-click="3"><td>dependency</td><td>自己處理</td><td>自動解析整棵樹</td></tr>
  </tbody>
</table>

<style>
.cmp { width: 100%; font-size: 18px; }
.cmp td:first-child { color: var(--tb-mut); width: 170px; }
</style>

<!--
講義的完整比較：
- 環境變數設定：module 是人工撰寫的 modulefile；Spack 安裝時自動記錄，spack load 直接套用
- 同一軟體多種 build：module 每種組合自己編、各寫一份 modulefile；Spack 用 spec 區分，各自有獨立路徑（hash），可並存
- 編譯參數控制：module 由 build 的人自行決定；Spack 用 % compiler、+/~ variant、target 等 spec 語法
-->

---
clicks: 3
---

# Spack 還可以……

<v-clicks>

- **並存**：同一 library 的多種 build 互不覆蓋
- `spack env`：整組 software stack 存成設定檔
- **產生 modulefile**：給用 module 的系統用

</v-clicks>

<!--
除了 spack load / spack unload 對應 module 的切換功能之外：
- 自動下載、編譯、安裝軟體以及它所有的 dependency
- 用 spec 精確指定 compiler、版本、variant 與目標架構，安裝前預覽完整 dependency tree
- 同一個 library 的不同 build 並存，不會互相覆蓋
- spack env：把一整組 software stack 記錄成設定檔，方便重現或分享給隊友
- 反過來產生 modulefile：spack module tcl refresh / spack module lmod refresh
-->

---

# 安裝與初始化

<div grid="~ cols-2 gap-6">
<div>

### 1. clone 下來

```bash
sudo apt install -y git python3 file unzip xz-utils
cd ~
git clone --depth=2 https://github.com/spack/spack.git
```

### 2. 初始化 shell 環境

```bash
. spack/share/spack/setup-env.sh
```

</div>
<div>

### 3. 找 compiler

```bash
spack compiler find    # auto-detect
spack compiler list    # what was found
```

</div>
</div>

<!--
- Spack 不用 apt 安裝，直接 clone；但它是 Python 寫的，下載、解壓縮 source code 也需要一些系統工具。
- setup-env.sh 讓 spack 指令能修改當前 shell 的環境變數。不想每次開 terminal 都執行，可以加到 .bashrc。
- 用 sbatch 發 job 時，雖然 shell 環境預設會被複製過去，還是建議在 job script 裡初始化一次，避免預期之外的錯誤。
- 編譯 library 需要 compiler，spack compiler find 讓 Spack 自動偵測。
-->

---

# Step 1：spack info 查版本與 variant

```text {1-8|10-17|19-30}{maxHeight: '345px'}
CMakePackage:   hdf5

Description:
    HDF5 is a data model, library, and file format for storing and managing
    data. ...

Preferred version:
    1.14.6           https://support.hdfgroup.org/releases/hdf5/v1_14/v1_14_6/...

Safe versions:
    develop-2.0      [git] https://github.com/HDFGroup/hdf5.git on branch develop
    1.14.6           https://support.hdfgroup.org/releases/hdf5/v1_14/v1_14_6/...
    1.14.5           https://support.hdfgroup.org/releases/hdf5/v1_14/v1_14_5/...
    1.14.4-3         https://support.hdfgroup.org/releases/hdf5/v1_14/v1_14_4/...
    1.14.3           https://support.hdfgroup.org/releases/hdf5/v1_14/v1_14_3/...
    ...（共 40 個版本，節錄）
    1.8.10           https://support.hdfgroup.org/archive/support/ftp/HDF5/...

Variants:
    cxx [false]                 false, true
        Enable C++ support
    fortran [false]             false, true
        Enable Fortran support
    hl [false]                  false, true
        Enable the high-level library
    mpi [true]                  false, true
        Enable MPI support
    shared [true]               false, true
        Builds a shared version of the library
    ...（節錄；另有 api、build_type、ipo、java、map、subfiling、szip、threadsafe、tools…）
```

::margin::

<MarginNotes label="$ spack info hdf5" :notes="[
  '先看有哪些版本、variant',
  'Safe versions：可用 @ 指定',
  'Variants：[ ] 裡是預設值',
]" />

<!--
完整輸出在 Notion 的 details 區塊；投影片只節錄會用到的 variant。下一頁的 spec 會用 +hl ~cxx +mpi 來設定。
-->

---
clicks: 7
---

# Step 2：spec 語法

<CmdAnnotate font-size="17px" :parts="[
  { t: 'spack spec ' },
  { t: 'hdf5', label: '套件名稱', level: 4 },
  { t: '@1.14.3', label: '@ 指定版本', level: 3 },
  { t: ' ' },
  { t: '+hl', label: '+ variant 設為 true', level: 2 },
  { t: ' ' },
  { t: '~cxx', label: '~ variant 設為 false', level: 1 },
  { t: ' ' },
  { t: '+mpi' },
  { t: ' ' },
  { t: '%gcc@8.4.1', label: '% 指定編譯器', level: 3 },
  { t: ' ' },
  { t: '^mpich', label: '^ 指定底層 dependency', level: 2 },
  { t: ' ' },
  { t: 'target=skylake_avx512', label: 'target 最佳化的架構', level: 1 },
]" />

<div v-click="7" class="callout">
照抄前，<code>%gcc@</code>、<code>target=</code> 換成自己的
</div>

<!--
把 spec 逐個 token 圈起來、拉出標籤。
- 這是在叢集（Rocky 8、gcc 8.4.1、skylake_avx512）上的例子。在 Debian 13 上照抄會出現 Error: No version exists that satisfies these input specs: gcc@8.4.1。
- 換成 spack compiler list 列出的版本、spack arch -t 的結果，例如 spack spec hdf5@1.14.3 +hl ~cxx +mpi %gcc@14.2.0 ^mpich。
- 大多 variant 有預設值，不需要每個都用 +/~ 設定；有些 variant 要用 = 設定。
- 注意超級電腦的 login node 與不同 compute node partition 架構可能不同。
-->

---

# spack spec 的輸出：誰要裝、誰已經有了

```text {2,12,15|11,14,16|1,18|all}{maxHeight: '250px'}
 -   hdf5@1.14.3~cxx~fortran+hl~ipo~java~map+mpi+shared~subfiling~szip~threadsafe+tools api=default build_system=cmake ... target=skylake_avx512 %c=gcc@8.4.1
[+]      ^cmake@3.31.9~doc+ncurses+ownlibs~qtgui build_system=generic build_type=Release ... %c,cxx=oneapi@2024.0.2
[+]          ^curl@8.17.0~gssapi~ldap~libidn2~librtmp~libssh~libssh2+nghttp2 ...
[+]              ^nghttp2@1.67.1 build_system=autotools ...
[+]                  ^diffutils@3.12 build_system=autotools ...
[+]              ^openssl@3.6.0~docs+shared build_system=generic certs=mozilla ...
[+]                  ^ca-certificates-mozilla@2025-08-12 build_system=generic ...
[+]                  ^perl@5.42.0+cpanm+opcode+open+shared+threads ...
[+]                      ^berkeley-db@18.1.40+cxx~docs+stl ...
[+]              ^pkgconf@2.5.1 build_system=autotools ...
[e]          ^intel-oneapi-compilers@2024.0.2~amd+envmods~nvidia build_system=generic ... target=x86_64
[+]          ^intel-oneapi-runtime@2024.0.2 build_system=generic ...
[+]      ^compiler-wrapper@1.0 build_system=generic ...
[e]      ^gcc@8.4.1~binutils+bootstrap~graphite~nvptx~piclibs~profiled~strip ... target=x86_64
[+]      ^gcc-runtime@8.4.1 build_system=generic ...
[e]      ^glibc@2.28 build_system=autotools ... target=x86_64
[+]      ^gmake@4.4.1~guile build_system=generic ...
 -       ^mpich@4.3.2~argobots~cuda+fortran+hwloc+hydra ... %c,cxx,fortran=gcc@8.4.1
         ...（節錄，完整約 60 行）
```

<div class="legend-3">
  <span><code>[+]</code> 已安裝，直接重複使用</span>
  <span><code>[e]</code> external，用系統既有的</span>
  <span><code>-</code> 還沒裝，install 時編譯</span>
</div>

<style>
.legend-3 { display: flex; gap: 18px; font-size: 14px; color: var(--tb-mut); margin-top: 10px; }
.legend-3 code { color: var(--tb-accent); font-weight: 500; }
</style>

<!--
💻 [+] [e] - 三種標記挑幾行高亮，不需要逐行動畫。
- [e] external：系統上既有的軟體（系統 gcc、glibc），Spack 不會重新編譯。
- ⚠ 這份輸出是 Rocky 8 / skylake / oneapi 的叢集環境，上台時口頭說明。
-->

---
clicks: 2
---

# Step 3：安裝

<Flow :width="860" :height="200" :groups="[
  { x: 0, y: 6, w: 380, h: 188, label: 'LOGIN NODE（可以連網）' },
  { x: 480, y: 6, w: 380, h: 188, label: 'COMPUTE NODE（不能連網）', at: 2 },
]" :nodes="[
  { id: 'net', x: 100, y: 110, label: '網路', sub: 'source code', w: 130, tone: 'plain', mono: false },
  { id: 'f', x: 280, y: 110, label: 'spack fetch', sub: '只下載', w: 140, at: 1, tone: 'on' },
  { id: 'i', x: 670, y: 110, label: 'spack install', sub: 'srun / sbatch', w: 170, at: 2, tone: 'on' },
]" :edges="[
  { from: 'net', to: 'f', at: 1 },
  { from: 'f', to: 'i', at: 2, label: '共用檔案系統' },
]" />

<div class="callout warn">
<strong>不要在 login node 上編譯</strong>
</div>

<!--
- 在超級電腦上，編譯會占用大量 CPU，不要在 login node 上跑；但有些超級電腦基於資安，compute node 不能對外連網。
- 建議流程：先在 login node 用 spack fetch <spec> 下載 source code，再透過 srun 或 sbatch 到 compute node 執行 spack install <spec>。
-->

---

# 使用 library

```bash
spack find                  # list everything installed
spack find <library name>   # only this library
spack load <spec>           # like module load
spack unload <spec>
spack unload --all
```

<div class="callout warn">
<strong>不要混用 spack 跟 module</strong>
</div>

<!--
- spack load 和 module load 一樣，是修改當前 shell 的環境變數（PATH、LD_LIBRARY_PATH 等）。
- spack 跟 module 都是改環境變數來決定 software stack，同時使用可能互相衝突，建議不要混用。
- 想在用 module 的同時用 Spack build 的 library，可以用 spack module tcl refresh / spack module lmod refresh 產生 modulefile，詳細設定見 Spack 官方文件。
-->

---
chap: Recap
---

# Recap：管理 software stack

<Recap :items="[
  { ch: '08', label: '環境變數', note: 'PATH 找指令，LD_LIBRARY_PATH 找 .so', keys: ['PATH', 'LD_LIBRARY_PATH', 'export'] },
  { ch: '09', label: 'Module', note: 'load / unload 整組切換', keys: ['module load', 'module show', 'purge'] },
  { ch: '10', label: 'Spack', note: '自動解依賴，從 source 裝好', keys: ['spack install', 'spec', 'spack load'] },
]" />

<!--
- 三者的關係：環境變數是底層機制，module 幫你一次改一整組，spack 則連 build 帶依賴一起處理。
-->

---
chap: Slido
center: true
---

# Slido：換你回答

<Slido q="編譯成功，執行 ./use 卻出現 cannot open shared object file，要設哪個環境變數？" :options="['PATH', 'LIBRARY_PATH', 'LD_LIBRARY_PATH', 'CPATH']" />

<!--
- 答案：C LD_LIBRARY_PATH（load time 找 .so）。LIBRARY_PATH 是 link time 給 linker 用的，對應「三次嘗試，兩道關卡」那頁。
- 接下來進入 Lab。
- 開 Slido 的 poll，給 30 秒作答，再公布結果；最後也可以開放提問。
-->
