source "$(dirname "$0")/lib.sh"
work=$(mktemp -d) && cd "$work"
run 'curl -LO https://download.open-mpi.org/release/hwloc/v2.11/hwloc-2.11.2.tar.gz'
run 'tar xzf hwloc-2.11.2.tar.gz'
run 'cd hwloc-2.11.2'
show './configure --prefix=$HOME/opt/hwloc'
# 在 "checking for gcc... gcc" 那行之後插 marker（逐行轉印，輸出不變；不用 awk 是因為 mawk 會整塊緩衝）
./configure --prefix="$HOME/opt/hwloc" 2>&1 | while IFS= read -r l; do
  printf "%s\n" "$l"
  [[ $l == "checking for gcc... gcc" ]] && printf "%s" "$MARK"
done
mark
run 'ls Makefile'
mark
rm -rf "$work"
