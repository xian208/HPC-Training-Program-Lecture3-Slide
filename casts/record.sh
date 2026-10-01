#!/usr/bin/env bash
# 錄製 asciinema：casts/record.sh <名稱> [rows]
#   例：casts/record.sh hwloc-configure 15
# 產出 public/casts/<名稱>.cast，投影片會自動換掉佔位框
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
name=$1; rows=${2:-16}
out="$here/../public/casts/$name.cast"
env -i HOME="$HOME" USER="$USER" TERM=xterm-256color LANG=C.UTF-8 PATH=/usr/local/bin:/usr/bin:/bin \
  asciinema rec -q --overwrite -i 1 --cols 96 --rows "$rows" \
  -c "bash --noprofile --norc $here/$name.sh" "$out"
node "$here/add-markers.mjs" "$out"
echo "saved $out"
