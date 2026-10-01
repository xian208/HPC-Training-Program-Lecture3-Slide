# asciinema 錄影

投影片裡的 2 段終端機錄影都用腳本錄，換機器（例如新的 PVE VM）後重跑一次就好。
錄好的 `.cast` 放在 `public/casts/`，播放到 marker 會自動暫停，按空白鍵繼續。

```bash
sudo apt install -y asciinema
casts/record.sh hwloc-configure 15
casts/record.sh spack-install-zstd 14
```

第二個參數是終端機的列數，要跟投影片 `<Cast :rows>` 一致。

| 檔名 | 投影片 | 錄之前要準備 |
|---|---|---|
| `hwloc-configure` | 06 實際跑一次 ./configure | 可以連網。在 `checking for gcc... gcc` 那行之後停一次 |
| `spack-install-zstd` | 10 一行 spack install | `~/spack` 已 clone、`spack compiler find` 過；先 `spack uninstall -y zstd`，才錄得到完整安裝過程 |

## 腳本怎麼運作

- `lib.sh`：`show` 逐字打出指令、`run` 打出並執行、`mark` 插入暫停點
- `<名稱>.sh`：每段錄影要打的指令
- `record.sh`：在乾淨的環境（`env -i`，提示字元是 `$ `）用 asciinema 錄，再用 `add-markers.mjs` 把暫停點換成 asciicast 的 marker 事件
- 錄影時 `-i 1`（idle time limit）會把超過 1 秒的空檔壓成 1 秒，spack 編譯等待的時間不會出現在錄影裡
