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
-rwxr-xr-x 1 xian208 xian208  69K Sep 27 01:13 hello_dyn
-rwxr-xr-x 1 xian208 xian208 689K Sep 27 01:13 hello_static

$ ldd hello_dyn
	linux-vdso.so.1 (0x0000ffffa7fbc000)
	libc.so.6 => /lib/aarch64-linux-gnu/libc.so.6 (0x0000ffffa7d90000)
	/lib/ld-linux-aarch64.so.1 (0x0000ffffa7f80000)
$ ldd hello_static
	not a dynamic executable
```

::margin::

<MarginNotes :notes="[
  '預設是 dynamic linking；加上 -static 就是 static linking。',
  'static 版本大了約 10 倍：69K vs 689K。',
  'ldd 可以查執行檔有哪些 dynamic link：dynamic 版本只記錄「執行時需要 libc.so.6」。',
  'static 版本把用到的 libc 內容直接複製進執行檔，所以不需要任何 .so。',
]" />

<!--
💻 固定輸出，不需要現場跑：用行高亮帶過就好。
Debian 上 static linking 需要 libc.a，build-essential 已經裝好了。
-->

---
clicks: 3
---

# 複製進來 vs 執行時接上

<AnimTodo title="兩個執行檔並排" h="250px" :steps="[
  'static：libc 的 printf.o 等被複製進執行檔，方塊跟著變大（69K → 689K）',
  'dynamic：執行檔只留一條指向 libc.so.6 的箭頭',
  '按下執行：loader 才把 libc.so.6 載入並接上箭頭（銜接上一章的 Loader）',
]" />

---
clicks: 5
---

# 兩者的差異

<table class="cmp">
  <thead><tr><th></th><th>Static Linking</th><th>Dynamic Linking</th></tr></thead>
  <tbody>
    <tr v-click="1"><td>library 檔案</td><td><code>.a</code>（static library）</td><td><code>.so</code>（shared object）</td></tr>
    <tr v-click="2"><td>library 的位置</td><td>被複製進 executable file</td><td>不包含在 executable file 裡</td></tr>
    <tr v-click="3"><td>linking 發生時間</td><td>link time</td><td>load time（或執行中透過 <code>dlopen</code> 載入）</td></tr>
    <tr v-click="4"><td>executable file 大小</td><td>大</td><td>小</td></tr>
    <tr v-click="5"><td>library 更新時</td><td>整份 executable 要重新 build（link）</td><td>只要更新 link 到的 <code>.so</code></td></tr>
  </tbody>
</table>

<style>
.cmp { width: 100%; }
.cmp td:first-child { color: var(--tb-mut); width: 170px; }
</style>
