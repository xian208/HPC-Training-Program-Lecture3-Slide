#!/usr/bin/env bash
# 在「學員規格」的 VM 上量 Lab 會花多少時間，結果印成一張表，用來預估課堂時間
#
#   bash scripts/measure-labs.sh          # 全部：OpenMPI 編譯 + LULESH
#   bash scripts/measure-labs.sh --quick  # 跳過 OpenMPI（約 8 分鐘），只量 LULESH
#
# 需要：build-essential、curl、bzip2、zlib1g-dev、git（跟 Lab 一樣）
# 所有東西都放在暫存資料夾，跑完會刪掉，不會動到 $HOME 底下的 Lab 環境
set -euo pipefail

QUICK=0; [[ "${1:-}" == "--quick" ]] && QUICK=1
WORK=$(mktemp -d); trap 'rm -rf "$WORK"' EXIT
NPROC=$(nproc)
declare -a ROWS

t() { local s=$SECONDS; "$@" >"$WORK/log" 2>&1 || { echo "失敗：$*"; tail -20 "$WORK/log"; exit 1; }; echo $((SECONDS - s)); }
row() { ROWS+=("$(printf '| %-36s | %8s |' "$1" "$2")"); echo "  $1：$2"; }
lulesh() { "$@" -s 30 2>&1 | awk '/Elapsed time/ {print $4" s"}'; }

echo "== 機器資訊"
echo "  CPU：$(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2 | xargs)"
echo "  核心數：$NPROC，記憶體：$(free -g | awk '/Mem:/ {print $2}') GB"
echo "  gcc：$(gcc -dumpfullversion)，-march=native：$(gcc -march=native -Q --help=target 2>/dev/null | awk '/-march=/ {print $2; exit}')"

if (( ! QUICK )); then
  echo "== Lab3-2：OpenMPI 5.0.8"
  cd "$WORK"
  row "下載 tarball" "$(t curl -sLO https://download.open-mpi.org/release/open-mpi/v5.0/openmpi-5.0.8.tar.bz2) s"
  t tar xjf openmpi-5.0.8.tar.bz2 >/dev/null
  cd openmpi-5.0.8
  row "configure" "$(t ./configure --prefix="$WORK/ompi") s"
  row "make -j$NPROC" "$(t make -j"$NPROC") s"
  row "make install" "$(t make install) s"
fi

echo "== Lab3-4：LULESH（-s 30）"
cd "$WORK" && git clone -q --depth=1 https://github.com/LLNL/LULESH.git && cd LULESH
t make CXX="g++ -DUSE_MPI=0" CXXFLAGS="-g -O3 -I." LDFLAGS="-g -O3" >/dev/null
row "-O3（serial）" "$(lulesh ./lulesh2.0)"
make clean >/dev/null 2>&1
t make CXX="g++ -DUSE_MPI=0" CXXFLAGS="-g -O3 -I. -fopenmp" LDFLAGS="-g -O3 -fopenmp" >/dev/null
for n in 1 2 "$NPROC"; do row "-O3 + OpenMP，$n threads" "$(OMP_NUM_THREADS=$n lulesh ./lulesh2.0)"; done

echo
echo "| 項目 | 時間 |"
echo "|---|---|"
printf '%s\n' "${ROWS[@]}"
