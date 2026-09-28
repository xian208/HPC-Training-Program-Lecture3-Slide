# 錄影用的小工具：模擬打字、在錄影裡插 marker
# 由 record.sh 在乾淨的 bash 裡 source，不需要自己執行
PS1='$ '
MARK=$'\e]1337;CAST_MARK\a'   # record.sh 錄完會把它換成 asciicast 的 marker 事件

# 印出提示字元並逐字打出指令（只顯示，不執行）
show() {
  printf '\e[1;32m$\e[0m '
  local s="$*" i
  for ((i = 0; i < ${#s}; i++)); do printf '%s' "${s:i:1}"; sleep 0.035; done
  sleep 0.4; printf '\n'
}
# 打出指令並執行
run() { show "$1"; eval "$1"; }
# 播放到這裡會暫停，按空白鍵繼續
mark() { sleep 0.3; printf '%s' "$MARK"; }
