---
layout: section
chapter: "10"
title: Spack
---

從「裝」到「用」都包辦的 HPC package manager

---

# Spack 是什麼

為 HPC 設計的 **package manager**：用一行 **spec** 描述想要的軟體——版本、編譯器、variant、dependency、目標架構

<v-clicks>

- 自動下載 source code、解析並編譯**整棵 dependency tree**
- 每一種組合裝到**獨立的路徑**
- 幫你設定好使用時需要的環境變數

</v-clicks>

<v-click>

<div class="callout">
跑題目時常要測不同的 software stack，一個 application 可能依賴數十個 library。全部手動 build，就要自己處理每個 dependency 的版本、configure / CMake 參數與安裝路徑；換一個 compiler 又全部重來。Spack 把這些流程自動化，切換 software stack 只需要改 spec。
</div>

</v-click>

---

# 同樣裝 zstd：一行 spack install

<Cast src="/casts/spack-install-zstd.cast" :rows="8" :todo="[
  'spack install zstd +programs',
  'spack find zstd',
]" />

```text
$ spack find zstd
-- linux-debian13-aarch64 / %c,cxx=gcc@14.2.0 -------------------
zstd@1.5.7
```

::margin::

<strong>NOTE</strong>

對照 Module：要自己下載、編譯、安裝，再手寫 modulefile。

Spack 的 zstd 預設 variant 是 <code>~programs</code>，只裝 library、沒有 <code>zstd</code> 執行檔，所以這裡要加 <code>+programs</code>。

<!--
🎥 需要網路也要編譯時間，錄成 cast。講義上的輸出：
[+] qbloxy4 zstd@1.5.7 /home/xian208/spack/opt/spack/linux-aarch64/zstd-1.5.7-qbloxy4e2c7tgnqkggusu3krjdfyik2v (9s)
-->

---
clicks: 5
---

# spack load：就像 module load

<div grid="~ cols-[1fr_1.15fr] gap-5">

<Terminal font-size="12px" :steps="[
  { cmd: 'which zstd' },
  { cmd: 'spack load zstd' },
  { cmd: 'zstd --version', out: '*** Zstandard CLI (64-bit) v1.5.7, by Yann Collet ***', tone: 'ok' },
  { cmd: 'spack unload zstd' },
  { cmd: 'which zstd' },
]" />

<PathStack cmd="zstd" :steps="[
  { label: 'load 前', path: ['~/spack/bin', '/usr/local/bin', '/usr/bin', '/bin'] },
  { label: 'load 前', path: ['~/spack/bin', '/usr/local/bin', '/usr/bin', '/bin'] },
  { label: 'spack load 之後', path: ['…/zstd-1.5.7-qbloxy4…/bin', '~/spack/bin', '/usr/local/bin', '/usr/bin', '/bin'], has: ['…/zstd-1.5.7-qbloxy4…/bin'] },
  { label: 'spack load 之後', path: ['…/zstd-1.5.7-qbloxy4…/bin', '~/spack/bin', '/usr/local/bin', '/usr/bin', '/bin'], has: ['…/zstd-1.5.7-qbloxy4…/bin'] },
  { label: 'spack unload 之後', path: ['~/spack/bin', '/usr/local/bin', '/usr/bin', '/bin'] },
]" />

</div>

<!--
🎬 直接沿用 Module 那疊 PATH，只把路徑換成帶 hash 的目錄。
- 安裝路徑由 Spack 決定（zstd-1.5.7-<hash>），hash 由 spec 算出，不同 build 裝在不同目錄、可以並存
- 不用自己寫 modulefile
- ~/spack/bin 是執行 setup-env.sh 時加上的，讓 shell 找得到 spack 指令
- 講義的 PATH 裡 zstd 路徑出現兩次，是 Spack 本身的行為，不影響使用（這裡畫一次）
-->

---
clicks: 6
---

# Spack 與 Module 的差別

module 只負責「**用**」，Spack 從「**裝**」到「**用**」都包辦

<table class="cmp">
  <thead><tr><th></th><th>Module</th><th>Spack</th></tr></thead>
  <tbody>
    <tr v-click="1"><td>定位</td><td>環境變數管理工具</td><td>package manager</td></tr>
    <tr v-click="2"><td>軟體來源</td><td>事先由人手動編譯、安裝</td><td>自動下載 source code 並編譯安裝</td></tr>
    <tr v-click="3"><td>dependency</td><td>不處理，要自己確認已安裝並一起 load</td><td>自動解析整棵 dependency tree（<code>spack spec</code> 預覽）</td></tr>
    <tr v-click="4"><td>環境變數設定</td><td>人工撰寫的 modulefile</td><td>安裝時自動記錄，<code>spack load</code> 直接套用</td></tr>
    <tr v-click="5"><td>同一軟體多種 build</td><td>每種組合自己編、各寫一份 modulefile</td><td>用 spec 區分，各自有獨立路徑（hash），可並存</td></tr>
    <tr v-click="6"><td>編譯參數控制</td><td>build 的人自行決定</td><td><code>%</code> compiler、<code>+/~</code> variant、<code>target</code> 等 spec 語法</td></tr>
  </tbody>
</table>

<style>
.cmp { width: 100%; font-size: 13.5px; }
.cmp td:first-child { color: var(--tb-mut); width: 150px; }
</style>

---

# Spack 還可以……

除了 `spack load` / `spack unload` 對應 module 的切換功能之外：

<v-clicks>

- 自動下載、編譯、安裝軟體以及它**所有的 dependency**
- 用 spec 精確指定 compiler、版本、variant 與目標架構，安裝前**預覽**完整 dependency tree
- 同一個 library 的不同 build **並存**，不會互相覆蓋
- `spack env`：把一整組 software stack 記錄成設定檔，方便重現或分享給隊友
- 反過來**產生 modulefile**（`spack module tcl refresh` / `spack module lmod refresh`）

</v-clicks>

---

# 安裝與初始化

<div grid="~ cols-2 gap-6">
<div>

### 1. 安裝

不用 apt，直接 clone；但 Spack 是 Python 寫的，也需要一些系統工具

```bash
sudo apt install -y git python3 file unzip xz-utils
cd ~
git clone --depth=2 https://github.com/spack/spack.git
```

### 2. 環境初始化

讓 `spack` 指令能修改當前 shell 的環境變數

```bash
. spack/share/spack/setup-env.sh
```

</div>
<div>

### 3. Compiler 設定

讓 Spack 知道有哪些 compiler 可以用

```bash
spack compiler find    # 自動偵測
spack compiler list    # 看找到了哪些
```

<div class="callout">
不想每次開 terminal 都執行一次 setup-env.sh，可以加到 <code>.bashrc</code>。用 sbatch 發 job 時，雖然 shell 環境預設會被複製過去，還是建議在 job script 裡初始化一次，避免預期之外的錯誤。
</div>

</div>
</div>

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
  '安裝前先看 library 有哪些版本、variant 可以選。',
  'Safe versions：可以用 @ 指定的版本。',
  'Variants：方括號裡是預設值。下一頁的 spec 會用 +hl ~cxx +mpi 來設定。',
]" />

<!--
完整輸出在 Notion 的 details 區塊；投影片只節錄會用到的 variant。
-->

---
clicks: 7
---

# Step 2：spec 語法 ⭐

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
  { t: 'target=skylake_avx512', label: 'target 針對哪個架構最佳化', level: 1 },
]" />

<div v-click="7" class="callout">
大多 variant 有預設值，不需要每個都用 <code>+/~</code> 設定；有些 variant 要用 <code>=</code> 設定。target 可以用 <code>spack arch</code> 查詢，注意超級電腦的 login node 與不同 compute node partition 架構可能不同。
</div>

<!--
⭐ 核心動畫：把 spec 逐個 token 圈起來、拉出標籤（參考 artifact 選項 F）。
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
  <span><code>[+]</code> 已經安裝過，直接重複使用</span>
  <span><code>[e]</code> external：系統上既有的軟體（系統 gcc、glibc），不重新編譯</span>
  <span><code>-</code> 還沒安裝，<code>spack install</code> 時下載並編譯</span>
</div>

<style>
.legend-3 { display: flex; gap: 18px; font-size: 13px; color: var(--tb-mut); margin-top: 10px; }
.legend-3 code { color: var(--tb-teal); font-weight: 600; }
</style>

<!--
💻 [+] [e] - 三種標記上色、挑幾行高亮，不需要逐行動畫。
⚠ 這份輸出是 rocky8 / x86 skylake / oneapi 的環境，跟講義其他地方的 Debian aarch64 不一樣，
上台時可以口頭說明，或之後換成同一個環境的輸出。
-->

---

# Step 3：安裝

```bash
spack install <spec>
```

<div class="callout warn">
<strong>在超級電腦上</strong>：編譯會占用大量 CPU，不要在 login node 上跑；但有些超級電腦基於資安，compute node 不能對外連網。
</div>

<AnimTodo title="先 fetch、再 install" :steps="[
  'login node（可連網）：spack fetch <spec> 下載 source code',
  'compute node（網路線斷開）：透過 srun / sbatch 執行 spack install <spec>',
]" />

---

# 使用 library

<div grid="~ cols-2 gap-6">
<div>

```bash
spack find                  # 列出所有 library
spack find <library name>   # 只看特定 library
spack load <spec>           # 載入：改當前 shell 的環境變數
spack unload <spec>         # 卸載
spack unload --all          # 一次卸載全部
```

</div>
<div>

<div class="callout warn">
<strong>不要混用 spack 跟 module</strong>：兩者都是改環境變數來決定 software stack，同時使用可能互相衝突。<br><br>
想在用 module 的同時用 Spack build 的 library，可以用 <code>spack module tcl refresh</code> / <code>spack module lmod refresh</code> 產生 modulefile，詳細設定見 Spack 官方文件。
</div>

</div>
</div>
