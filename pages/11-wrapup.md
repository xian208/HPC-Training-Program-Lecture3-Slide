---
layout: section
chapter: "Lab"
title: Lab 3
---

Makefile → OpenMPI 與 modulefile → CMake → LULESH

---
chap: Lab
---

# 本次 Lab

<Recap :items="[
  { ch: '3-1', label: 'Makefile', note: '撰寫 Makefile，僅重編變更的檔案' },
  { ch: '3-2', label: 'OpenMPI', note: '以 configure 建置，並撰寫 modulefile' },
  { ch: '3-3', label: 'CMake', note: '以 CMake 建置多目錄專案' },
  { ch: '3-4', label: 'LULESH', note: '比較不同建置方式的效能' },
]" />

<!--
- 先做 Lab3-2 Part A 第 1–2 步：sudo apt install -y bzip2 zlib1g-dev，下載、解壓縮、./configure --prefix=$HOME/opt/openmpi/5.0.8，然後 make -j4 > build.log 2>&1 && make install。
- 4 核心 VM 實測：configure 約 2 分 20 秒、make -j4 約 5 分鐘；輸出導到 build.log，另開一個 terminal 做 Lab3-1。
- 確認裝好：ls ~/opt/openmpi/5.0.8/bin/mpicc，再寫 modulefile（照 zstd 範例，路徑換成 ~/opt/openmpi/5.0.8）。
- 編譯還在跑時不要做 Lab3-4：LULESH 會跟 make 搶核心，時間不準。
- 常見卡點：Lab3-1 recipe 用空白縮排（要用 tab）、PREFIX 同一行後面接註解。Lab3-3 要先 module load openmpi/5.0.8。
- Lab3-4 每次執行約 30 秒，整題約 40 分鐘，課堂上做不完可以回家完成；MPI 程式這次都直接執行（1 個 process）。
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
