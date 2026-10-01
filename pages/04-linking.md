---
layout: section
chapter: "04"
title: Static vs Dynamic Linking
---

函式庫是在連結期靜態整合，或於執行期動態載入？

---
clicks: 3
---

# 同一份 hello.c，兩種 link 方式

```bash {1-2|3-5|7-10|11-12}{maxHeight: '330px'}
$ gcc hello.c -o hello_dyn
$ gcc -static hello.c -o hello_static
$ ls -lh hello_dyn hello_static
-rwxrwxr-x 1 xian208 xian208  16K Sep 30 23:34 hello_dyn
-rwxrwxr-x 1 xian208 xian208 737K Sep 30 23:34 hello_static

$ ldd hello_dyn
	linux-vdso.so.1 (0x00007f633a98e000)
	libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f633a786000)
	/lib64/ld-linux-x86-64.so.2 (0x00007f633a990000)
$ ldd hello_static
	not a dynamic executable
```

::margin::

<MarginNotes :notes="[
  '預設為動態連結；加入 -static 參數啟用靜態連結',
  '靜態連結二進位檔容量增加約 45 倍（從 16 KB 增至 737 KB）',
  'ldd：檢視執行檔依賴的共用函式庫（.so）',
  '',
]" />

<!--
和講義相同，是 Debian 13 x86_64 VM 上的輸出。
- dynamic 版本只記錄「執行時需要 libc.so.6」，由 loader 在執行時載入。
- static 版本把用到的 libc 內容直接複製進執行檔。
- Debian 上 static linking 需要 libc.a，build-essential 已經裝好了。
-->

---
clicks: 3
---

# 靜態連結與動態連結機制比較

<Flow :width="860" :height="250" :groups="[
  { x: 0, y: 4, w: 410, h: 242, label: 'STATIC' },
  { x: 450, y: 4, w: 410, h: 242, label: 'DYNAMIC', at: 2 },
]" :nodes="[
  { id: 'a', x: 140, y: 75, label: 'libc.a', sub: 'printf.o scanf.o …', w: 190 },
  { id: 'se', x: 140, y: 190, label: 'hello_static', sub: '737K', w: 190, h: 70, at: 1, tone: 'on' },
  { id: 'de', x: 590, y: 190, label: 'hello_dyn', sub: '16K', w: 170, at: 2 },
  { id: 'so', x: 590, y: 75, label: 'libc.so.6', w: 170, at: 2, tone: 'plain' },
]" :edges="[
  { from: 'a', to: 'se', at: 1, label: '連結期寫入二進位檔', tone: 'on', lpos: [152, 136] },
  { from: 'de', to: 'so', at: 2, until: 3, dashed: true, label: '僅記錄符號與相依性', lpos: [602, 136] },
  { from: 'so', to: 'de', at: 3, tone: 'on', label: '載入期動態解析', lpos: [602, 136] },
]" />

<!--
- static：用到的內容在 link time 複製進執行檔；dynamic：只記下需要 libc.so.6，執行時 loader 才把 .so 接上。
- static library（.a）可以看成多個 .o 打包而成的封存檔，例如 libc.a 包含 printf.o、scanf.o、malloc.o（free 也定義在 malloc.o 裡）等，可以用 ar t libc.a 列出。
- shared library（.so）則是把這些程式碼 link 成單一個、可被多個程式共用的檔案。
-->

---
clicks: 3
---

# 兩者的差異

<table class="cmp">
  <thead><tr><th></th><th>Static Linking</th><th>Dynamic Linking</th></tr></thead>
  <tbody>
    <tr v-click="1"><td>library 檔案</td><td><code>.a</code></td><td><code>.so</code></td></tr>
    <tr v-click="2"><td>何時 link</td><td>link time</td><td>load time</td></tr>
    <tr v-click="3"><td>library 更新時</td><td>整份重新 link</td><td>替換共用函式庫即可生效</td></tr>
  </tbody>
</table>

<style>
.cmp { width: 100%; font-size: 18px; }
.cmp td:first-child { color: var(--tb-mut); width: 170px; }
</style>

<!--
講義的完整比較：
- library 的位置：static 被複製進 executable file；dynamic 不包含在 executable file 裡
- linking 發生時間：static 在 link time；dynamic 在 load time（或執行中透過 dlopen 載入）
- executable file 大小：static 大、dynamic 小
- library 更新時：static 整份 executable 要重新 build（link）；dynamic 只要更新 link 到的 .so
-->

---
chap: Recap
---

# Recap：從 source 到執行檔

<Recap :items="[
  { ch: '02', label: 'Compiler', note: 'flag 決定速度與相容性', keys: ['-O3', '-march', '-g', '-I', '-L'] },
  { ch: '03', label: '編譯四階段', note: '前處理、編譯、組譯、連結', keys: ['.i', '.s', '.o', 'ld'] },
  { ch: '04', label: 'Static vs Dynamic', note: '複製進來，還是執行時才接上', keys: ['.a', '.so', 'ldd'] },
]" />

<!--
- 一句話串起來：compiler 把 source 翻成機器碼，linker 把各份 object 與 library 接起來，loader 在執行時載入 .so。
- 下一段開始講「很多檔案時怎麼自動化」。
- 口頭提問：gcc -c hello.s -o hello.o 是在做哪一個階段？（答：Assembly，.s → .o；-S 才是 compilation）
-->
