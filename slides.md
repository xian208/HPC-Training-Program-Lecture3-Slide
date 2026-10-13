---
theme: default
title: 2026 HPC Training — Lecture 3
lectureName: Lecture 3　Build from Source
info: |
  Compiler、Compilation Process、Build Automation、Environment Variable、Module、Spack
  內容來源：Notion「2026 lecture3」
colorSchema: light
highlighter: shiki
monaco: true
lineNumbers: false
canvasWidth: 980
aspectRatio: 16/9
routerMode: hash
transition: fade
mdc: true
fonts:
  provider: none
  sans: LXGWWenKaiTC
  serif: LXGWWenKaiTC
  mono: JetBrainsMono
layout: cover
kicker: 2026 HPC Training · Lecture 3
meta: Compiler · Build System · Environment Variable · Module · Spack
---

# Build from Source

從一行 `gcc` 到管理整套 software stack

<!--
- 每個章節一個檔案，放在 pages/，依序 import
- 投影片只放圖、demo 與重點；細節都寫在每頁的講者備註（按 p 進 presenter mode）
- 課前請學員先裝好 build-essential、cmake、git、curl、bzip2、zlib1g-dev、lmod（Notion「課前準備」），Lab 時間才不會卡在 apt。
- 三小時流程（估計）：0:00 開場 → 0:05 Intro–Linking → Recap 1 → 0:50 Makefile → 1:02 Configure → 1:10 CMake → Recap 2 → 1:25 休息 10 分 → 1:35 環境變數、Module、Spack（只講概念，安裝與使用請學員課後自行閱讀）→ Recap 3 → 2:07 Lab 時間（48 分）：先開始編 OpenMPI → 編譯期間做 Lab3-1 → modulefile → Lab3-3 → Lab3-4 → 2:55 Q&A
- Lab 全部集中在最後做，講完對應章節時口頭預告。
-->

---
src: ./pages/01-intro.md
---

---
src: ./pages/02-compiler.md
---

---
src: ./pages/03-compilation.md
---

---
src: ./pages/04-linking.md
---

---
src: ./pages/05-makefile.md
---

---
src: ./pages/06-configure.md
---

---
src: ./pages/07-cmake.md
---

---
src: ./pages/08-envvar.md
---

---
src: ./pages/09-module.md
---

---
src: ./pages/10-spack.md
---

---
src: ./pages/11-wrapup.md
---
