---
layout: section
chapter: "04"
title: Static vs Dynamic Linking
---

library 是被「複製進來」，還是執行時才「接上」？

---
clicks: 3
---

# 同一份 hello.c，兩種 link 方式

```bash {1-2|3-5|7-10|11-12}{maxHeight: '330px'}
$ gcc hello.c -o hello_dyn
$ gcc -static hello.c -o hello_static
$ ls -lh hello_dyn hello_static
-rwxrwxr-x 1 xian208 xian208  16K Sep 27 19:39 hello_dyn
-rwxrwxr-x 1 xian208 xian208 737K Sep 27 19:39 hello_static

$ ldd hello_dyn
	linux-vdso.so.1 (0x00007fe0bf4de000)
	libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007fe0bf2dc000)
	/lib64/ld-linux-x86-64.so.2 (0x00007fe0bf4e0000)
$ ldd hello_static
	not a dynamic executable
```

::margin::

<MarginNotes :notes="[
  '預設 dynamic；加 -static 變 static',
  'static 大了約 45 倍',
  'ldd：列出執行時要載入的 .so',
  '',
]" />

<!--
這是 Debian 13 x86_64 上實測的輸出（講義上是 aarch64：69K vs 689K，約 10 倍，ldd 的路徑是 /lib/aarch64-linux-gnu/...）。
- dynamic 版本只記錄「執行時需要 libc.so.6」，由 loader 在執行時載入。
- static 版本把用到的 libc 內容直接複製進執行檔。
- Debian 上 static linking 需要 libc.a，build-essential 已經裝好了。
-->

---
clicks: 3
---

# 複製進來 vs 執行時接上

<Flow :width="860" :height="250" :groups="[
  { x: 0, y: 4, w: 410, h: 242, label: 'STATIC' },
  { x: 450, y: 4, w: 410, h: 242, label: 'DYNAMIC', at: 2 },
]" :nodes="[
  { id: 'a', x: 140, y: 75, label: 'libc.a', sub: 'printf.o scanf.o …', w: 190 },
  { id: 'se', x: 140, y: 190, label: 'hello_static', sub: '737K', w: 190, h: 70, at: 1, tone: 'on' },
  { id: 'de', x: 590, y: 190, label: 'hello_dyn', sub: '16K', w: 170, at: 2 },
  { id: 'so', x: 590, y: 75, label: 'libc.so.6', w: 170, at: 2, tone: 'plain' },
]" :edges="[
  { from: 'a', to: 'se', at: 1, label: 'link time 複製進來', tone: 'on', lpos: [152, 136] },
  { from: 'de', to: 'so', at: 2, until: 3, dashed: true, label: '只記錄名字', lpos: [602, 136] },
  { from: 'so', to: 'de', at: 3, tone: 'on', label: 'load time 接上', lpos: [602, 136] },
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
    <tr v-click="3"><td>library 更新時</td><td>整份重新 link</td><td>換掉 <code>.so</code> 就好</td></tr>
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

---
chap: Slido
center: true
---

# 有問題嗎？

<Slido />

<!--
- 集中回答 Slido 上的問題，按讚數高的先回答。
-->
