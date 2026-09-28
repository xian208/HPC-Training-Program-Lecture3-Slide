---
layout: section
chapter: "07"
title: CMake
---

不負責編譯，而是「產生 build system」的工具

---

# cmake -S . -B build

```bash {1|2-7|8-9|10-12}
$ cmake -S . -B build
-- The CXX compiler identification is GNU 14.2.0
-- Detecting CXX compiler ABI info
-- Detecting CXX compiler ABI info - done
-- Check for working CXX compiler: /usr/bin/c++ - skipped
-- Detecting CXX compile features
-- Detecting CXX compile features - done
-- Found MPI_CXX: /usr/lib/aarch64-linux-gnu/openmpi/lib/libmpi.so (found version "3.1")
-- Found MPI: TRUE (found version "3.1")
-- Configuring done (0.3s)
-- Generating done (0.0s)
-- Build files have been written to: /home/xian208/build/my_project/build
```

<div class="callout">
<strong>安裝</strong>：<code>sudo apt install -y cmake</code>，本課程需要 3.16 以上（Debian 13 為 3.31）
</div>

::margin::

<MarginNotes :notes="[
  '以後面的 my_project 為例，在專案根目錄執行。',
  '和 configure 類似，先偵測 C++ compiler（GNU 14.2.0）並確認它能運作。',
  '依照 find_package(MPI REQUIRED) 找到系統上的 MPI library。',
  '最後把 Makefile 產生在 build/ 目錄中。',
]" />

<!--
💻 固定輸出，用行高亮帶過；想要更像現場也可以錄成 cast（需要 MPI 環境）。
-->

---
clicks: 3
---

# CMake 是 build system generator

<div class="gen">
  <div class="ins">
    <div v-click="1" class="in">CMakeLists.txt<em>project 設定</em></div>
    <div v-click="1" class="in">系統環境<em>compiler、library 位置</em></div>
    <div v-click="1" class="in">-D 參數<em>使用者提供</em></div>
  </div>
  <div v-click="1" class="arr">→</div>
  <div v-click="1" class="core">CMake</div>
  <div v-click="2" class="arr">→</div>
  <div v-click="2" class="outs">
    <div class="in">Makefile<em>Linux 預設</em></div>
    <div class="in">Ninja<em>-G Ninja</em></div>
  </div>
  <div v-click="3" class="arr">→</div>
  <div v-click="3" class="core light">make / ninja<em>真正編譯</em></div>
</div>

<div class="callout">
比起 Autotools（主要用在 Unix-like、語法較難維護），CMake 跨平台、對多目錄專案與 <code>find_package</code> 找外部 library 支援更完整，目前許多 HPC application 都提供 CMake 的建置方式。
</div>

<style>
.gen { display: flex; align-items: center; gap: 12px; margin: 10px 0 24px; font-family: var(--tb-sans); }
.gen .ins, .gen .outs { display: grid; gap: 8px; }
.gen .in { font-family: var(--tb-mono); font-size: 13.5px; border: 1.3px solid var(--tb-node-line); background: #fff; padding: 4px 10px; }
.gen .in em, .gen .core em { display: block; font-style: normal; font-family: var(--tb-sans); font-size: 11px; color: var(--tb-mut); }
.gen .core { border: 1.5px solid var(--tb-node-line); background: var(--tb-node-on); padding: 18px 16px; font-weight: 600; font-size: 17px; }
.gen .core.light { background: var(--tb-node-bg); font-family: var(--tb-mono); font-size: 14px; }
.gen .arr { font-size: 22px; }
</style>

---

# 常用參數：`-S`、`-B`、`--build`

| 參數 | 作用 |
|---|---|
| `-S <dir>` | project 根目錄（要有 root `CMakeLists.txt`），預設為當前目錄 |
| `-B <dir>` | build tree 的位置：Makefile、`CMakeCache.txt`、`CMakeFiles/`、object file、執行檔都放這裡；預設為當前目錄 |
| `--build <dir>` | 呼叫 build system 的工具（例如 make）編譯；`<dir>` 就是 `-B` 指定的目錄 |

<div grid="~ cols-2 gap-5">

<div class="callout" style="margin-top:0">
<code>-D&lt;var&gt;=&lt;value&gt;</code> 從外部傳參數給 CMake，值會寫進 <code>build/CMakeCache.txt</code>。configure 過一次之後，<code>cmake -LAH build</code> 可以列出所有變數與說明。
</div>

<AnimTodo title="source tree 保持乾淨" :steps="[
  '左：my_project/（只有 source）；右：build/（空的）',
  'cmake -S . -B build 之後，所有產物都落在 build/',
]" />

</div>

---

# 完整流程：configure → build → install

```bash {1-2|3-4|5-6}
# 1. configure: generate the build system in build/
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=$HOME/opt/myproject
# 2. build: invoke make to compile in parallel
cmake --build build -j $(nproc)
# 3. install: copy files to CMAKE_INSTALL_PREFIX
cmake --install build
```

::margin::

<MarginNotes :notes="[
  '產生 build system。',
  '呼叫 make 平行編譯。改了 source code 或 CMakeLists.txt，只要重跑這一步（CMake 會自動重新 configure）。',
  '安裝到 CMAKE_INSTALL_PREFIX。要改 -D 參數時，才需要重跑第 1 步。',
]" />

---

# CMakeLists.txt：一個多目錄專案

<div grid="~ cols-[200px_1fr] gap-5">

```text
my_project/
├── CMakeLists.txt
├── lib/
│   ├── CMakeLists.txt
│   └── math_utils.cpp
└── src/
    ├── CMakeLists.txt
    └── main.cpp
```

```cmake {1-2|3|5|7-8|10-11|12|14-15|16}{maxHeight: '370px'}
# my_project/CMakeLists.txt
cmake_minimum_required(VERSION 3.16)
project(MyProject LANGUAGES CXX)

find_package(MPI REQUIRED)

add_subdirectory(lib)
add_subdirectory(src)

# my_project/lib/CMakeLists.txt
add_library(math_utils STATIC math_utils.cpp)
target_include_directories(math_utils PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

# my_project/src/CMakeLists.txt
add_executable(program main.cpp)
target_link_libraries(program PRIVATE math_utils MPI::MPI_CXX)
```

</div>

<!--
旁註放不下，說明寫在這裡，逐行高亮時照著講：
- cmake_minimum_required：最低 CMake 版本，確保行為一致；必須是 root CMakeLists.txt 的第一個指令
- project：宣告專案並觸發環境檢查（compiler 是否存在等）
- find_package(... REQUIRED)：自動找系統 library，找不到就報錯
- add_subdirectory：讀該目錄下的 CMakeLists.txt
- add_library(<name> [STATIC|SHARED] <sources>)：編成 library
- target_include_directories：等同 -I；PUBLIC / PRIVATE 下一頁講
- add_executable：編成執行檔
- target_link_libraries：link 關係，可以是自己編的或 find_package 找到的
-->

---
clicks: 3
---

# PUBLIC 與 PRIVATE ⭐

<IncludePropagation />

::margin::

<MarginNotes :notes="[
  'target_include_directories 等同於 -I：指定 target 的 header 搜尋路徑。',
  'math_utils 設成 PUBLIC：自己用，也會傳給 link 到它的 target。',
  '所以 program 也能 #include math_utils 的 header。',
  '改成 PRIVATE：只有 math_utils 自己編譯時用，program 就拿不到。實際錯誤訊息留到 Lab3-3 自己試。',
]" />

<!--
⭐ 核心動畫：include 路徑沿著 link 箭頭從 math_utils 傳到 program；PRIVATE 時在中途被擋下。
注意：Lab3-3 Part B 第 1 題就是要學生自己把 PUBLIC 改成 PRIVATE 看錯誤，所以這頁不秀實際的錯誤訊息。
-->
