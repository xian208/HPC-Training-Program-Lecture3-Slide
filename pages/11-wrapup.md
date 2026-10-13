---
layout: section
chapter: "Lab"
title: Lab 3
---

Makefile → OpenMPI 與 modulefile → CMake → LULESH

---
clicks: 3
---

# 本次 Lab

<Flow :width="860" :height="150" :nodes="[
  { id: 'l1', x: 95, y: 70, label: 'Lab3-1', sub: 'Makefile', w: 150, tone: 'on' },
  { id: 'l2', x: 318, y: 70, label: 'Lab3-2', sub: 'OpenMPI、modulefile', w: 170, at: 1, tone: 'on' },
  { id: 'l3', x: 541, y: 70, label: 'Lab3-3', sub: 'CMake', w: 150, at: 2, tone: 'on' },
  { id: 'l4', x: 765, y: 70, label: 'Lab3-4', sub: 'LULESH 效能比較', w: 160, at: 3, tone: 'on' },
]" :edges="[
  { from: 'l1', to: 'l2', at: 1 }, { from: 'l2', to: 'l3', at: 2 }, { from: 'l3', to: 'l4', at: 3 },
]" />

<div class="callout">
Lab3-4 Step 5 要用 Lab3-2 裝好的 OpenMPI
</div>

<!--
- Lab3-1 Makefile：只重新編譯有變動的檔案。
- Lab3-2 用 configure build OpenMPI，並寫成 modulefile（configure 前記得裝 bzip2、zlib1g-dev）。
- Lab3-3 CMake 多目錄專案、PUBLIC / PRIVATE、build type。
- Lab3-4 LULESH：同一份 source code，不同 build 方式的效能。每次執行約 30 秒，整題約 40 分鐘，課堂上做不完可以回家完成。
- 每次開新的 terminal 都要重新載入：module use $HOME/selfmodule 後 module load openmpi/5.0.8。
- MPI 程式這次都直接執行（只有 1 個 process），多 process 留到之後的 MPI 課程。
-->

---
chap: Lab 時間
center: true
---

# Lab 時間

<LabTime>

- **Lab3-2**：先開始編譯 OpenMPI，於背景執行
- **Lab3-1**：等待編譯期間完成
- **後續**：modulefile → Lab3-3 → Lab3-4

</LabTime>

<!--
- 先做 Lab3-2 Part A 第 1–2 步：sudo apt install -y bzip2 zlib1g-dev，下載、解壓縮、./configure --prefix=$HOME/opt/openmpi/5.0.8，然後 make -j4 > build.log 2>&1 && make install。
- 4 核心 VM 實測：configure 約 2 分 20 秒、make -j4 約 5 分鐘；輸出導到 build.log，另開一個 terminal 做 Lab3-1。
- 確認裝好：ls ~/opt/openmpi/5.0.8/bin/mpicc，再寫 modulefile（照 zstd 範例，路徑換成 ~/opt/openmpi/5.0.8）。
- 編譯還在跑時不要做 Lab3-4：LULESH 會跟 make 搶核心，時間不準。
- 常見卡點：Lab3-1 recipe 用空白縮排（要用 tab）、PREFIX 同一行後面接註解。Lab3-3 要先 module load openmpi/5.0.8。
- 用 Slido 統計進度；最後 5 分鐘收尾、Q&A。
-->

---
check: false
---

# Reference

- Randal E. Bryant, David R. O'Hallaron, *Computer Systems: A Programmer's Perspective*, 3rd ed., Ch. 1 & Ch. 7
- [GNU make manual](https://www.gnu.org/software/make/manual/make.html)
- [GNU Autoconf manual](https://www.gnu.org/software/autoconf/manual/)
- [CMake documentation](https://cmake.org/cmake/help/latest/)
- [GCC Optimize Options](https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html)
- [Lmod documentation](https://lmod.readthedocs.io/)
- [Spack documentation](https://spack.readthedocs.io/)
