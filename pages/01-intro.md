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

# Slido：暖身

<Slido q="你平常都怎麼安裝軟體？" :options="['apt / brew', 'pip / conda', '下載 source 自己編', '還沒裝過']" />

<!--
- 暖身題，沒有標準答案；順便確認大家都連得上 Slido。
- 帶出這堂課的主題：選「自己編」的人其實就在做 build from source。
- 開 Slido 的 poll，給 30 秒作答，再公布結果；最後也可以開放提問。
-->
