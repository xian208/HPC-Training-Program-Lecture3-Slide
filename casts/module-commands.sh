source "$(dirname "$0")/lib.sh"
source /etc/profile.d/lmod.sh
export LMOD_PAGER=none   # 不要開 less，錄影才不會卡住
cd ~
run 'module use $HOME/selfmodule'; mark
run 'module avail'; mark
run 'module load zstd/1.5.6'
run 'which zstd'; mark
run 'module list'; mark
run 'module unload zstd/1.5.6'
run 'which zstd'; mark
run 'module purge'
