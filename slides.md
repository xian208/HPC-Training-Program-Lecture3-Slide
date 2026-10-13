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
- 三小時流程（估計）：0:00 開場 → 0:05 Intro–Linking → Recap 1 → 0:50 Makefile（預告 Lab3-1）→ 1:02 Configure → 1:10 開始編 OpenMPI（5 分，背景編譯）→ 1:15 CMake（預告 Lab3-3）→ Recap 2 → 1:30 休息 10 分 → 1:40 環境變數、Module（預告 modulefile）、Spack（只講概念，安裝與使用請學員課後自行閱讀）→ Recap 3 → 2:12 Lab 時間（43 分）：Lab3-1 → modulefile → Lab3-3 → Lab3-4 → 2:55 Q&A
- Lab 集中在最後做，課中只動手一次（開始編 OpenMPI），其餘講完對應章節時用「Lab 預告」頁帶過。
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
