---
chap: 課前準備
---

# 課前準備

- **環境**：Debian 13、sudo、網路、2 GB 硬碟
- **工具**：用到時再裝，也可以先一次裝好

```bash
sudo apt update
sudo apt install -y build-essential cmake git curl ca-certificates \
    bzip2 xz-utils unzip file python3 lmod zlib1g-dev
```

<div class="callout warn">
<strong>zstd、OpenMPI 不要用 apt 裝</strong>
</div>

<!--
- 各章節要用的工具，會在該章節第一次用到時說明怎麼裝；現場網路不穩的話，可以先用上面的指令一次裝好。
- 裝完之後，仍然要在 Module 章節初始化 lmod、在 Spack 章節 clone Spack。
- zstd 會在 Module、Spack 章節分別用 source code 與 Spack 裝，OpenMPI 是 Lab3-2 的內容。先用 apt 裝的話，系統版本會和自己 build 的版本混在一起，比較難觀察 module 的效果。
- zlib1g-dev：OpenMPI 內附的 PMIx 需要它，沒裝的話每次 mpirun 都會跳 compression library 的警告。
-->
