source "$(dirname "$0")/lib.sh"
cd ~
. ~/spack/share/spack/setup-env.sh
# 接到 cat：spack 偵測到不是終端機，就會印出講義上那種逐行的輸出，而不是一直轉動的進度畫面
show 'spack install zstd +programs'; spack install zstd +programs | cat; mark
run 'spack find zstd'
