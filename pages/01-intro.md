---
layout: section
chapter: "01"
title: Introduction
---

HPC 為何選擇從原始碼建置

---

# 為何從原始碼自行建置

<v-clicks>

- **目標**：縮短科學計算的執行時間
- **影響因素**：編譯器、函式庫版本與編譯參數
- **做法**：從原始碼建置 (build from source)

</v-clicks>

<!--
- HPC 的一個重要研究方向是加速科學計算程式：CFD、分子動力學、氣候模擬……
- 用預先編譯好的版本也能算出結果，但 HPC 追求的是更短的執行時間。
- 編譯器、library 版本、編譯參數，都可能影響效能，所以傳統 HPC 應用通常選擇 build from source。
- 這堂課從一行 gcc 開始，一路講到怎麼管理一整套 software stack；Lab3-4 會用 LULESH 實際比較不同 build 方式的效能差異。
-->

---
clicks: 3
---

# 相同原始碼，不同建置方式

<div class="bars">
  <div v-click="1" class="row"><span class="lb"><code>-O0</code></span><div class="bar" style="width: 100%"><b>140 秒</b></div></div>
  <div v-click="2" class="row"><span class="lb"><code>-O3</code></span><div class="bar" style="width: 22%"><b>31 秒</b></div></div>
  <div v-click="3" class="row"><span class="lb"><code>-O3</code> ＋ OpenMP</span><div class="bar on" style="width: 10%"><b>14 秒</b></div></div>
</div>

<div v-click="3" class="note">LULESH <code>-s 30</code>，4 核心 VM；三者計算結果完全相同</div>

<style>
.bars { display: grid; gap: 16px; }
.bars .row { display: grid; grid-template-columns: 170px 1fr; align-items: center; gap: 14px; }
.bars .lb { font-size: 18px; text-align: right; }
.bars .bar { height: 42px; background: var(--tb-node-bg); border: 1.5px solid var(--tb-node-line); position: relative; }
.bars .bar.on { background: var(--tb-node-on); }
.bars .bar b { position: absolute; left: calc(100% + 12px); top: 50%; transform: translateY(-50%); font-weight: 500; font-size: 20px; white-space: nowrap; }
.bars .row:first-child .bar b { left: auto; right: 12px; }
</style>

<!--
- 這是 Lab3-4 會用到的 LULESH（LLNL 的 proxy application），在 4 核心 x86_64 VM 上跑 -s 30。
- 同一份原始碼：不最佳化（-O0）約 140 秒；加上 -O3 約 31 秒；再開 OpenMP 4 threads 約 14 秒，快了約 10 倍。
- Final Origin Energy 三者都是 2.025075e+05，結果完全一樣，只差在怎麼 build。
- 這就是這堂課的主題：compiler、flag、library 的選擇都會影響效能，所以 HPC 通常從原始碼自己建置。Lab3-4 會自己跑出這些數字。
-->
