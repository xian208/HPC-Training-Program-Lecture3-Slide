---
layout: section
chapter: "05"
title: Build Automation · Makefile
---

面對多原始碼檔案專案，手動編譯將缺乏效率且易生疏漏

---
clicks: 1
---

# Build Automation

- **機制**：定義編譯、連結與安裝之相依性規則
- **效益**：自動化建置大型專案，降低人為配置錯誤

<Flow :width="860" :height="200" :nodes="[
  { id: 'cfg', x: 90, y: 45, label: './configure', sub: 'Autotools', w: 150, at: 1 },
  { id: 'cm', x: 90, y: 155, label: 'cmake', sub: 'CMakeLists.txt', w: 150, at: 1 },
  { id: 'mk', x: 330, y: 100, label: 'Makefile', sub: '規則', w: 140 },
  { id: 'make', x: 550, y: 100, label: 'make', sub: '解析相依性並執行建置', w: 140 },
  { id: 'out', x: 770, y: 100, label: '執行檔', sub: 'library', w: 140, tone: 'on', mono: false },
]" :edges="[
  { from: 'cfg', to: 'mk', at: 1, label: '產生' }, { from: 'cm', to: 'mk', at: 1 },
  { from: 'mk', to: 'make' }, { from: 'make', to: 'out' },
]" />

<!--
- Build automation：把編譯、連結、安裝等步驟寫成規則，交由工具自動判斷並執行。
- HPC 的大型 application 動輒上百個 source file、好幾個外部 library，手動輸入指令編譯每個檔案既不實際也容易出錯。
- 這張圖是本章與後面兩章的地圖：先講 Makefile，再講「產生 Makefile」的 configure 和 CMake。
-->

---
clicks: 4
---

# make 的增量編譯行為分析

<div grid="~ cols-[1.2fr_1fr] gap-5">

<Terminal font-size="12px" :steps="[
  { cmd: 'make', out: 'gcc -O2 -Wall -c main.c -o main.o\ngcc -O2 -Wall -c utils.c -o utils.o\ngcc -O2 -Wall -o program main.o utils.o' },
  { cmd: 'make', out: 'make: \'program\' is up to date.', tone: 'mut' },
  { cmd: 'touch utils.c' },
  { cmd: 'make', out: 'gcc -O2 -Wall -c utils.c -o utils.o\ngcc -O2 -Wall -o program main.o utils.o', tone: 'ok' },
]" />

<MakeGraph :width="340" :height="240" :steps="[
  { label: '專案：main.c、utils.c' },
  { label: '第一次 make：全部編譯', fresh: ['main.c', 'utils.c'], rebuilt: ['main.o', 'utils.o', 'program'] },
  { label: '第二次 make：沒有變動' },
  { label: 'touch 更新 utils.c 的時間', dirty: ['utils.c'] },
  { label: '只重編 utils.o，main.o 沿用', dirty: ['utils.c'], rebuilt: ['utils.o', 'program'] },
]" />

</div>

<!--
左邊 terminal、右邊 dependency graph，同一個 click 同步。
Makefile 是後面「變數與 pattern rule」那一頁的版本。
make 比較的是 target 與 prerequisites 的最後修改時間：prerequisite 比 target 新，target 就重新產生。
-->

---
clicks: 3
---

# Makefile 的基本語法

```makefile {none|1|1|2}
target : prerequisites
	recipes
```

<div v-click="3" class="callout warn">
規則之指令區塊（recipe）必須以 <strong>Tab</strong> 鍵縮排
</div>

::margin::

<MarginNotes :notes="[
  '',
  '<strong>target</strong>：要產生的檔案或動作',
  '<strong>prerequisites</strong>：產生 target 需要的檔案',
  '<strong>recipes</strong>：實際執行的 shell 指令',
]" />

<!--
- Makefile 是 make 讀取的規則檔：描述每個 target 由哪些檔案、用什麼指令產生。
- target 也可以是一個 action 的名稱，例如 clean；prerequisites 通常有多個。
- 用空白縮排會出現 makefile:2: *** missing separator.  Stop.；GNU make 4.3 以後偵測到 8 個空白，會提示 (did you mean TAB instead of 8 spaces?)。
-->

---
clicks: 3
---

# 一個完整的例子

```makefile {1-4|6-7|8-21|22-24}{maxHeight: '340px'}
edit : main.o kbd.o command.o display.o \
       insert.o search.o files.o utils.o
	cc -o edit main.o kbd.o command.o display.o \
	           insert.o search.o files.o utils.o

main.o : main.c defs.h
	cc -c main.c
kbd.o : kbd.c defs.h command.h
	cc -c kbd.c
command.o : command.c defs.h command.h
	cc -c command.c
display.o : display.c defs.h buffer.h
	cc -c display.c
insert.o : insert.c defs.h buffer.h
	cc -c insert.c
search.o : search.c defs.h buffer.h
	cc -c search.c
files.o : files.c defs.h buffer.h command.h
	cc -c files.c
utils.o : utils.c defs.h
	cc -c utils.c
clean :
	rm edit main.o kbd.o command.o display.o \
	   insert.o search.o files.o utils.o
```

::margin::

<MarginNotes :notes="[
  'edit 由 8 個 .o link 而成',
  '每個 .o 由 .c 和 header 產生',
  '',
  'clean：不產生檔案的動作',
]" />

<!--
範例出自 GNU make manual。
每個 .o 都要寫一條規則，檔案一多就難維護 → 等一下用變數與 pattern rule 改寫。
第二次（含）以後執行 make，會比較 target 與 prerequisites 的最後更新時間，prerequisites 比較新就重新編譯。
-->

---
clicks: 2
---

# 使用變數與 pattern rule

<div grid="~ cols-[1.25fr_1fr] gap-5">

````md magic-move {lines: false}
```makefile
program : main.o utils.o
	gcc -O2 -Wall -o program main.o utils.o

main.o : main.c
	gcc -O2 -Wall -c main.c -o main.o

utils.o : utils.c
	gcc -O2 -Wall -c utils.c -o utils.o

clean :
	rm -f program main.o utils.o
```
```makefile
CC     = gcc
CFLAGS = -O2 -Wall
OBJS   = main.o utils.o

program : $(OBJS)
	$(CC) $(CFLAGS) -o program $(OBJS)

main.o : main.c
	$(CC) $(CFLAGS) -c main.c -o main.o

utils.o : utils.c
	$(CC) $(CFLAGS) -c utils.c -o utils.o

clean :
	rm -f program $(OBJS)
```
```makefile
CC     = gcc
CFLAGS = -O2 -Wall
OBJS   = main.o utils.o

program : $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^

%.o : %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean :
	rm -f program $(OBJS)
```
````

<div>

<div v-click="1">

- **變數**：`$(CC)` 取值，統一維護變數定義

</div>

<div v-click="2">

- `%.o : %.c`：任何 .o 由同名 .c 產生
- `$@` / `$<` / `$^`：target / 第一個 / 全部 prerequisite

</div>

</div>
</div>

<!--
Magic Move 三步：逐條規則 → 抽出變數 → pattern rule。
- 把 compiler、flag、檔案清單抽成變數，用 $(變數名) 取值。要換 compiler 只改一處，或執行時 make CC=icx。
- %.o : %.c 是 pattern rule。以 main.o 為例，$< = main.c、$@ = main.o；program 那條的 $^ = main.o utils.o（全部 prerequisites）。
- 變數同一行後面不要接註解：# 前面的空白會變成值的一部分（Lab3-1 會遇到）。
-->

---

# make 的常用選項

- `make -j$(nproc)`：用全部核心平行編譯
- `make install`：複製到安裝路徑（prefix）
- `make clean`：建置中斷或配置變更時，先清除既有目的檔（`.o`）

<!--
- make -j <n>：用 n 個核心平行編譯；-j$(nproc) 用全部核心。
- make install：完成編譯後，把執行檔、library、header file 等複製到安裝路徑（通常由 prefix 決定）。
- 編譯途中遇到 error，建議先 make clean 再重新 make，避免殘留的 .o 造成後續錯誤。
-->

---
chap: Lab 時間
center: true
---

# Lab 時間：Lab3-1 Makefile

<LabTime>

- **Part A**：填完 6 個 TODO，`make` 並執行
- **Part B**：依序操作，想想看觀察到的現象

<div class="note">repo：<code>xian208/2026_HPC-training_lab3-1</code></div>

</LabTime>

<!--
- 時間到就收：做不完的 Part B 回家補，Part A 一定要完成（之後不再用到，但確認 make 環境沒問題）。
- 常見卡點：recipe 用空白縮排（要用 tab）、PREFIX 同一行後面接註解。
-->
