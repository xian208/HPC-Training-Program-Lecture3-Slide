---
chap: 課前準備
---

# 課前準備

- 範例與 Lab 都在 **Debian 13** 上操作，需要 sudo 權限與網路，預留至少 **2 GB** 硬碟空間
- 各章節要用的工具，會在該章節第一次用到時說明怎麼裝
- 現場網路不穩的話，可以先一次裝好：

```bash
sudo apt update
sudo apt install -y build-essential cmake git curl ca-certificates \
    bzip2 xz-utils unzip file python3 lmod
```

<div class="callout warn">
<strong>zstd 與 OpenMPI 請不要用 apt 安裝</strong>：zstd 會在 Module、Spack 章節分別用 source code 與 Spack 裝，OpenMPI 是 Lab3-2 的內容。先用 apt 裝的話，系統版本會和自己 build 的版本混在一起，比較難觀察 module 的效果。
</div>

<!--
靜態頁。裝完之後，仍然要在 Module 章節初始化 lmod、在 Spack 章節 clone Spack。
-->
