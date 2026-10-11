---
layout: section
chapter: "10"
title: Spack
---

涵蓋建置、相依解析與環境部署的 HPC 套件管理器

---
clicks: 3
---

# Spack 是什麼

專為 HPC 設計的套件管理器

<v-clicks>

- **宣告式 Spec 語法**：自訂版本、編譯器、編譯選項與目標微架構
- **自動解析相依性**：遞迴建置完整依賴拓撲
- **環境完全隔離**：依組態雜湊（Hash）分別儲存於獨立路徑

</v-clicks>

<!--
- Spack 用一行 spec 描述想要的軟體（版本、編譯器、variant、dependency、目標架構），自動下載 source code、解析並編譯整棵 dependency tree，把每一種組合裝到獨立的路徑，並幫你設定好使用時需要的環境變數。
- 跑題目時常要測不同的 software stack，一個 application 可能依賴數十個 library。全部手動 build，就要自己處理每個 dependency 的版本、configure / CMake 參數與安裝路徑；換一個 compiler 又全部重來。Spack 把這些流程自動化，切換 software stack 只需要改 spec。
-->

---
clicks: 3
---

# Spack 與 Module 的差別

module 只負責「**用**」，Spack 包含「**安裝到使用**」

<table class="cmp">
  <thead><tr><th></th><th>Module</th><th>Spack</th></tr></thead>
  <tbody>
    <tr v-click="1"><td>定位</td><td>環境變數管理工具</td><td>package manager</td></tr>
    <tr v-click="2"><td>軟體來源</td><td>須預先自行建置</td><td>自動下載並編譯</td></tr>
    <tr v-click="3"><td>dependency</td><td>須自行處理</td><td>自動解析完整相依樹</td></tr>
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
clicks: 7
---

# spec 語法

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
執行前請依目標系統環境調整 <code>%gcc@</code> 與 <code>target=</code> 參數
</div>

<!--
把 spec 逐個 token 圈起來、拉出標籤。
- 這是在叢集（Rocky 8、gcc 8.4.1、skylake_avx512）上的例子。在 Debian 13 上照抄會出現 Error: No version exists that satisfies these input specs: gcc@8.4.1。
- 換成 spack compiler list 列出的版本、spack arch -t 的結果，例如 spack spec hdf5@1.14.3 +hl ~cxx +mpi %gcc@14.2.0 ^mpich。
- 大多 variant 有預設值，不需要每個都用 +/~ 設定；有些 variant 要用 = 設定。
- 注意超級電腦的 login node 與不同 compute node partition 架構可能不同。
-->

---
clicks: 2
---

# 在叢集上安裝

<Flow :width="860" :height="200" :groups="[
  { x: 0, y: 6, w: 380, h: 188, label: 'LOGIN NODE（可以連網）' },
  { x: 480, y: 6, w: 380, h: 188, label: 'COMPUTE NODE（不能連網）', at: 2 },
]" :nodes="[
  { id: 'net', x: 100, y: 110, label: '網路', sub: 'source code', w: 130, tone: 'plain', mono: false },
  { id: 'f', x: 280, y: 110, label: 'spack fetch', sub: '僅下載', w: 140, at: 1, tone: 'on' },
  { id: 'i', x: 670, y: 110, label: 'spack install', sub: 'srun / sbatch', w: 170, at: 2, tone: 'on' },
]" :edges="[
  { from: 'net', to: 'f', at: 1 },
  { from: 'f', to: 'i', at: 2, label: '共用檔案系統' },
]" />

<div class="callout warn">
<strong>禁止於登入節點進行重度編譯作業</strong>
</div>

<!--
- 在超級電腦上，編譯會占用大量 CPU，不要在 login node 上跑；但有些超級電腦基於資安，compute node 不能對外連網。
- 建議流程：先在 login node 用 spack fetch <spec> 下載 source code，再透過 srun 或 sbatch 到 compute node 執行 spack install <spec>。
-->

---

# 課後自行閱讀：Spack

- **安裝與設定**：clone、`setup-env.sh`、`spack compiler find`
- **安裝與使用 library**：`spack info`、`spack spec`、`spack load`

<div class="callout warn">
<strong>避免同時混用 Spack 與 Module 以防環境變數衝突</strong>
</div>

<!--
- 對應講義 Spack 章節的「安裝 spack」「環境初始化」「Compiler 設定」「安裝 library（Step 1–3）」「使用 library」，請學員課後照著做一次。
- 上課只講 Spack 的定位、spec 語法與「不要在 login node 上編譯」。
- spack 跟 module 都是改環境變數來決定 software stack，同時使用可能衝突；要在 module 系統用 Spack 裝的 library，可以用 spack module tcl refresh / lmod refresh 產生 modulefile。
-->

---
chap: Recap
---

# Recap：管理 software stack

<Recap :items="[
  { ch: '08', label: '環境變數', note: 'PATH 定位指令，LD_LIBRARY_PATH 定位 .so', keys: ['PATH', 'LD_LIBRARY_PATH', 'export'] },
  { ch: '09', label: 'Module', note: '以 load / unload 切換整組環境', keys: ['module load', 'module show', 'purge'] },
  { ch: '10', label: 'Spack', note: '自動解析相依，並從原始碼建置', keys: ['spec', '%gcc@', 'login node'] },
]" />

<!--
- 三者的關係：環境變數是底層機制，module 幫你一次改一整組，spack 則連 build 帶依賴一起處理。
- 口頭提問：編譯成功，執行 ./use 卻出現 cannot open shared object file，要設哪個環境變數？（答：LD_LIBRARY_PATH；LIBRARY_PATH 是 link time 用的）
-->

---
chap: Lab 時間
center: true
---

# Lab 時間：modulefile 與 CMake

<LabTime>

- **Lab3-2 後半**：撰寫 modulefile 並完成 Part B
- **Lab3-3**：完成 7 個 TODO，編譯並執行
- **提早完成**：可開始進行 Lab3-4

</LabTime>

<!--
- 先確認 OpenMPI 裝好了：ls ~/opt/openmpi/5.0.8/bin/mpicc。沒編完的人先寫 modulefile，Lab3-3 回家做。
- Lab3-3 要先 module use $HOME/selfmodule、module load openmpi/5.0.8。
-->
