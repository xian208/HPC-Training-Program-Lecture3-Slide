---
layout: section
chapter: "06"
title: Configure
---

換一台機器，也能自動產生對的 Makefile

---

# 實際跑一次 ./configure

<Cast src="/casts/hwloc-configure.cast" :rows="15" :todo="[
  'curl -LO https://download.open-mpi.org/release/hwloc/v2.11/hwloc-2.11.2.tar.gz',
  'tar xzf hwloc-2.11.2.tar.gz',
  'cd hwloc-2.11.2',
  './configure --prefix=$HOME/opt/hwloc   # 在 checking for gcc 那行放 marker',
]" />

::margin::

<strong>NOTE</strong>

逐項檢查環境，最後產生 Makefile

<!--
需要網路、輸出又長，用 asciinema 錄。播到 checking for gcc... gcc 的 marker 會自動停下來講。
- configure 一項一項檢查當前環境：CPU 架構、有哪些工具可用（沒有 gawk 就改用 mawk）、C compiler 是誰、能不能正常運作……最後依照結果產生 Makefile。
- 安裝：sudo apt install -y curl ca-certificates（後面 zstd、OpenMPI 也會用到）。
- 不要用 ./configure ... | head -25 截斷輸出：head 讀完 25 行就關閉 pipe，configure 會 Broken pipe 中途結束，不會產生 Makefile。
-->

---
clicks: 2
---

# Configure script 在做什麼

<v-clicks>

- **是什麼**：掃描環境、產生 Makefile 的 shell script
- **解決什麼**：可攜性，換一台機器也能編

</v-clicks>

<!--
- 通常就是專案裡的 ./configure：一個 shell script，掃描系統環境（編譯器版本、外部 library 的位置……），自動產生適合當前環境的 Makefile。
- 手寫的 Makefile 通常把 compiler、library 路徑寫死，換一台機器就可能編不過。
-->

---
clicks: 3
---

# 從開發者到使用者：GNU Autotools

<div class="at-flow">
  <div class="at-row dev">
    <div class="at-tag">開發者發布前（了解即可）</div>
    <div class="at-line">
      <span class="f">Makefile.am</span><span class="t">automake</span><span class="f">Makefile.in</span>
    </div>
    <div class="at-line">
      <span class="f">configure.ac</span><span class="t">autoconf</span><span class="f">configure</span>
    </div>
  </div>
  <div class="at-row usr">
    <div class="at-tag">使用者端</div>
    <div class="at-line">
      <span v-click="1" class="step"><code>./configure</code><em>讀 Makefile.in → 產生 Makefile</em></span>
      <span v-click="2" class="arr">→</span>
      <span v-click="2" class="step"><code>make</code><em>讀 Makefile → 編譯</em></span>
      <span v-click="3" class="arr">→</span>
      <span v-click="3" class="step"><code>make install</code><em>讀 Makefile → 安裝</em></span>
    </div>
  </div>
</div>

<style>
.at-flow { display: grid; gap: 14px; font-family: var(--tb-sans); }
.at-tag { font-size: 12px; font-weight: 500; letter-spacing: .06em; color: var(--tb-accent); margin-bottom: 4px; }
.at-row.dev { opacity: .5; }
.at-line { display: flex; align-items: center; gap: 10px; margin: 4px 0; }
.at-line .f { font-family: var(--tb-mono); font-size: 14px; border: 1.3px solid var(--tb-node-line); background: #fff; padding: 3px 10px; }
.at-line .t { font-family: var(--tb-mono); font-size: 12.5px; color: var(--tb-mut); }
.at-line .t::before { content: "── "; } .at-line .t::after { content: " ──→"; }
.at-row.usr .step { border: 1.5px solid var(--tb-node-line); background: var(--tb-node-on); padding: 6px 12px; }
.at-row.usr .step code { background: none; border: 0; font-size: 15px; padding: 0; }
.at-row.usr .step em { display: block; font-style: normal; font-size: 12px; color: var(--tb-ink); }
.at-row.usr .arr { font-size: 20px; color: var(--tb-node-line); }
</style>

<!--
講義的兩張表合併成一條流程：上半開發者端（淡色，了解即可），下半使用者端三步逐步亮起。
Autoconf 根據 configure.ac 產生 configure，讓軟體在不同 Unix-like 系統上自動偵測環境；Automake 根據 Makefile.am 產生 Makefile.in，自動支援 make install、make clean 等標準 target。兩者都是 GNU Autotools 的一部分。
-->

---

# 常用參數

`./configure --help` 看全部參數

| 參數 | 作用 |
|---|---|
| `--prefix=` | `make install` 的安裝路徑 |
| `CC=` / `CFLAGS=` | 編譯器與 flag |
| `CPPFLAGS` / `LDFLAGS` | 到哪找 header / library |

```bash
./configure --prefix=$HOME/opt/mylib CC=gcc CFLAGS="-O3"
make -j$(nproc)
make install
```

<!--
- CPPFLAGS="-I..."：指定要到什麼路徑找 header file。
- LDFLAGS="-L..."：指定要到什麼路徑找要 link 的 library。
- LIBS="-l..."：指定要 link 的 library。
- CC= / CXX=：指定編譯器，例如 CC=gcc。
-->

---
chap: Lab 時間
center: true
---

# Lab 時間：開始編 OpenMPI

<LabTime minutes="5" break-minutes="10">

- **安裝**：`sudo apt install -y bzip2 zlib1g-dev`
- **configure**：`--prefix=$HOME/opt/openmpi/5.0.8`
- **編譯**：`make -j4 > build.log 2>&1 && make install`

<div class="note">編譯約 8 分鐘，休息時讓它在背景跑</div>

</LabTime>

<!--
- Lab3-2 的前半：下載、解壓縮、configure、make、make install（指令在 Notion Lab3-2 Part A 第 1–2 步）。
- 輸出導到 build.log，終端機才不會一直捲；休息回來用 tail build.log 或 ls ~/opt/openmpi/5.0.8/bin 確認。
- 4 核心 VM 實測：configure 約 2 分 20 秒、make -j4 約 5 分鐘。
- modulefile 要等 Module 章講完，在最後一段 Lab 時間再寫。
-->
