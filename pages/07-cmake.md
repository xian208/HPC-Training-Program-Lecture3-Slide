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
-- Found MPI_CXX: /home/xian208/opt/openmpi/5.0.8/lib/libmpi.so (found version "3.1")
-- Found MPI: TRUE (found version "3.1")
-- Configuring done (0.9s)
-- Generating done (0.0s)
-- Build files have been written to: /home/xian208/my_project/build
```

<div class="callout">
要先完成 Lab3-2，並 <code>module load</code> OpenMPI
</div>

::margin::

<MarginNotes :notes="[
  '',
  '偵測 compiler 並確認能用',
  '依 find_package 找到 MPI',
  '把 Makefile 產生在 build/',
]" />

<!--
💻 以後面的 my_project 為例，在專案根目錄執行。和 configure 類似。
- 安裝：sudo apt install -y cmake，本課程需要 3.16 以上（Debian 13 為 3.31）。
- 這個範例有 find_package(MPI REQUIRED)，還沒有 MPI 時會出現 Could NOT find MPI (missing: MPI_CXX_FOUND) 並停止，這正是 REQUIRED 的作用。
- MPI 的路徑是 Lab3-2 自己 build 的 OpenMPI（不是 apt 裝的）。
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

<style>
.gen { display: flex; align-items: center; gap: 12px; margin: 30px 0 24px; font-family: var(--tb-sans); }
.gen .ins, .gen .outs { display: grid; gap: 8px; }
.gen .in { font-family: var(--tb-mono); font-size: 13.5px; border: 1.3px solid var(--tb-node-line); background: #fff; padding: 4px 10px; }
.gen .in em, .gen .core em { display: block; font-style: normal; font-family: var(--tb-sans); font-size: 11px; color: var(--tb-mut); }
.gen .core { border: 1.5px solid var(--tb-node-line); background: var(--tb-node-on); padding: 18px 16px; font-weight: 500; font-size: 17px; }
.gen .core.light { background: var(--tb-node-bg); font-family: var(--tb-mono); font-size: 14px; }
.gen .arr { font-size: 22px; }
</style>

<!--
- CMake 本身不負責編譯，而是根據 CMakeLists.txt、系統環境與使用者參數，產生對應的 build system（Makefile、Ninja）。
- -G 可以設定要生成什麼 build system，Linux 預設就是 Makefile。
- 比起 Autotools（主要用在 Unix-like、語法較難維護），CMake 跨平台、對多目錄專案與 find_package 找外部 library 支援更完整，目前許多 HPC application 都提供 CMake 的建置方式。
-->

---
clicks: 1
---

# 常用參數：-S、-B、--build

<div grid="~ cols-[1fr_1fr] gap-6">

| 參數 | 作用 |
|---|---|
| `-S <dir>` | source 根目錄 |
| `-B <dir>` | 產物全部放這裡 |
| `--build <dir>` | 呼叫 make 編譯 |

<Flow :width="400" :height="230" :groups="[
  { x: 0, y: 4, w: 180, h: 222, label: 'my_project/' },
  { x: 220, y: 4, w: 180, h: 222, label: 'build/', at: 1, tone: 'solid' },
]" :nodes="[
  { id: 'a', x: 90, y: 70, label: 'CMakeLists.txt', w: 150, tone: 'plain' },
  { id: 'b', x: 90, y: 125, label: 'lib/', w: 150, tone: 'plain' },
  { id: 'c', x: 90, y: 180, label: 'src/', w: 150, tone: 'plain' },
  { id: 'd', x: 310, y: 70, label: 'Makefile', w: 150, at: 1, tone: 'on' },
  { id: 'e', x: 310, y: 125, label: 'CMakeCache.txt', w: 150, at: 1, tone: 'on' },
  { id: 'f', x: 310, y: 180, label: '*.o、program', w: 150, at: 1, tone: 'on' },
]" />

</div>

<!--
🎬 source tree 保持乾淨：cmake -S . -B build 之後，所有產物都落在 build/，要重來直接刪掉 build/ 就好。
- -S：project 根目錄（要有 root CMakeLists.txt），預設為當前目錄。
- -B：build tree 的位置：Makefile、CMakeCache.txt、CMakeFiles/、object file、執行檔都放這裡；預設為當前目錄。
- --build：呼叫 build system 的工具（例如 make）編譯；後面接的就是 -B 指定的目錄。
-->

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
  '-D 設定變數，存進 CMakeCache.txt',
  '改 code 後只要重跑這一步',
  '改 -D 參數才要重跑第 1 步',
]" />

<!--
- -D<var>=<value> 從外部傳參數給 CMake，值會寫進 build/CMakeCache.txt。configure 過一次之後，cmake -LAH build 可以列出所有變數與說明（Lab3-3 會用到）。
- 改了 source code 或 CMakeLists.txt，只要重跑第 2 步（CMake 會自動重新 configure）。
-->

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
逐行高亮時照著講：
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
  '',
  'PUBLIC：自己用，也傳給 link 它的',
  'program 也能 include 它的 header',
  'PRIVATE：只有自己用',
]" />

<!--
⭐ include 路徑沿著 link 箭頭從 math_utils 傳到 program；PRIVATE 時在中途被擋下。
- target_include_directories 等同於 -I：指定 target 的 header 搜尋路徑。
- 注意：Lab3-3 Part B 第 1 題就是要學生自己把 PUBLIC 改成 PRIVATE 看錯誤，所以這頁不秀實際的錯誤訊息。
-->
