#!/bin/zsh -il
# 在 Finder 雙擊這個檔案就會啟動投影片（第一次會先安裝套件）
cd "$(dirname "$0")"

if ! command -v npm >/dev/null 2>&1; then
  echo "找不到 node / npm，請先安裝 Node.js 20 以上（例如 brew install node）"
  read -k1 "?按任意鍵關閉"
  exit 1
fi

echo "node $(node -v)"
# 套件和 package-lock 對不上、或不是給這台 Mac 裝的時候，npm 會自動補齊
npm install --no-audit --no-fund || { read -k1 "?安裝失敗，按任意鍵關閉"; exit 1; }

# 啟動 dev server，並自動在瀏覽器打開 http://localhost:3030
npm run dev
