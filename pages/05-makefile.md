---
layout: section
chapter: "05"
title: Build Automation · Makefile
---

上百個 source file，不可能每次手打 gcc

---

# Build Automation

把編譯、連結、安裝等步驟**寫成規則**，交給工具自動判斷並執行

- HPC 的大型 application 動輒上百個 source file、好幾個外部 library
- 手動輸入指令編譯每個檔案，既不實際也容易出錯

<AnimTodo kind="image" title="Notion 上的 Build Automation 圖（Screenshot 2026-09-07 20-01-41）" :steps="[
  '放入原圖，或重畫成 Makefile → configure → CMake 三層的關係圖',
]" />

---
clicks: 4
---

# 連續執行三次 make ⭐

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
⭐ 核心動畫：左邊 terminal、右邊 dependency graph，同一個 click 同步。
Makefile 是後面「變數與 pattern rule」那一頁的版本。
make 比較的是 target 與 prerequisites 的最後修改時間：prerequisite 比 target 新，target 就重新產生。
-->

---

# Makefile 的基本語法

```makefile {1|1|2|all}
target : prerequisites
	recipes
```

<div v-click="3" class="callout warn">
recipe 規定用 <strong>tab</strong> 縮排，否則會出現 <code>makefile:2: *** missing separator.  Stop.</code><br>
GNU make 4.3 以後偵測到 8 個空白，會提示 <code>(did you mean TAB instead of 8 spaces?)</code>
</div>

::margin::

<MarginNotes :notes="[
  '<strong>target</strong>：要產生的檔案名稱，也可以是一個 action 的名稱，例如 clean。',
  '<strong>prerequisites</strong>：target 的 dependency，可以視為產生 target 需要的 input file，通常有多個。',
  '<strong>recipes</strong>：make 實際執行的 shell 指令，用來建立或更新 target，或執行特定動作。',
  'Makefile 是 make 讀取的規則檔：描述每個 target 由哪些檔案、用什麼指令產生。',
]" />

<!--
🎬 可以改成 CmdAnnotate 的樣式（target / prerequisites / recipes 三段各拉一個標籤）。目前先用行高亮＋旁註。
-->

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
  '最終的 target：edit 由 8 個 .o link 而成。',
  '每個 .o 由自己的 .c 和用到的 header 產生。',
  '每個 .o 都要寫一條規則，檔案一多就難維護 → 等一下用變數與 pattern rule 改寫。',
  'clean 不產生檔案，是一個 action。',
]" />

<!--
範例出自 GNU make manual。
第二次（含）以後執行 make，會比較 target 與 prerequisites 的最後更新時間，prerequisites 比較新就重新編譯。
-->

---

# 常用的自動變數與指令

<div grid="~ cols-2 gap-6">
<div>

### 自動變數

| | |
|---|---|
| `$@` | target 名稱 |
| `$<` | 第一個 prerequisite |
| `$^` | 全部 prerequisites |

</div>
<div>

### 常用指令

| | |
|---|---|
| `make -j <n>` | 用 n 個核心平行編譯 |
| `make -j$(nproc)` | 用全部核心 |
| `make install` | 把執行檔、library、header 複製到安裝路徑（通常由 `prefix` 決定）|

</div>
</div>

<div class="callout">
編譯途中遇到 error，建議先 <code>make clean</code> 再重新 <code>make</code>，避免殘留的 <code>.o</code> 造成後續錯誤。
</div>

---

# 使用變數與 pattern rule

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

::margin::

<MarginNotes :notes="[
  '每個 .o 各寫一條規則。',
  '把 compiler、flag、檔案清單抽成變數，用 $(變數名) 取值。要換 compiler 只改一處，或執行時 make CC=icx。',
  '%.o : %.c 是 pattern rule：任何 .o 都由同名的 .c 產生。以 main.o 為例，$< = main.c、$@ = main.o；program 那條的 $^ = main.o utils.o。',
]" />

<!--
💻 Magic Move 三步：逐條規則 → 抽出變數 → pattern rule。
最後一步可以再加 v-mark 把 $< $@ $^ 圈起來（TODO）。
-->
