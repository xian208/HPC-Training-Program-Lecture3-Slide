---
layout: section
chapter: "01"
title: Introduction
---

為什麼 HPC 要自己 build from source？

---

# 同一份程式，為什麼要自己編？

<v-clicks>

- **目標**：讓科學計算跑得更快
- **變因**：compiler、library 版本、flag
- **做法**：build from source

</v-clicks>

<!--
- HPC 的一個重要研究方向是加速科學計算程式：CFD、分子動力學、氣候模擬……
- 用預先編譯好的版本也能算出結果，但 HPC 追求的是更短的執行時間。
- 編譯器、library 版本、編譯參數，都可能影響效能，所以傳統 HPC 應用通常選擇 build from source。
- 這堂課從一行 gcc 開始，一路講到怎麼管理一整套 software stack；Lab3-4 會用 LULESH 實際比較不同 build 方式的效能差異。
-->

---
chap: Slido
center: true
---

# 加入 Slido

<Slido q="整堂課的問題都丟到 Slido" hint="匿名提問、幫別人按讚；Lab 時間也在這裡回報進度" />

<!--
- 請大家現在就掃 QR code 加入，後面 Lab 時間會用 Slido 的 poll 回報進度。
- 上課中隨時可以提問，每段 Recap 之後會集中回答。
-->
