# 要錄的 asciinema

在 Debian 13 上錄，輸出才會跟講義一致。錄好的 `.cast` 放到 `public/casts/`，投影片會自動換掉佔位框。

```bash
sudo apt install -y asciinema
asciinema rec --idle-time-limit 1 --cols 96 --rows 16 public/casts/<name>.cast
```

在要停下來講解的地方加 marker：最簡單是錄完後打開 .cast，在對應時間插入一行 `[秒數, "m", ""]`（asciicast v2 的 marker 事件）。新版 asciinema 也能在錄影時用快捷鍵加 marker，設定方式依版本而定，請看 `asciinema rec --help`。
播放時 `pauseOnMarkers` 已開啟，播到 marker 會自動停，按空白鍵繼續。

| 檔名 | 投影片 | 指令 | marker 放哪 |
|---|---|---|---|
| `hwloc-configure.cast` | 06 實際跑一次 ./configure | `curl -LO https://download.open-mpi.org/release/hwloc/v2.11/hwloc-2.11.2.tar.gz`<br>`tar xzf hwloc-2.11.2.tar.gz && cd hwloc-2.11.2`<br>`./configure --prefix=$HOME/opt/hwloc \| head -25` | `checking for gcc... gcc` 那一行 |
| `module-commands.cast` | 09 Module 常用指令 | `module use $HOME/selfmodule`<br>`module avail`<br>`module load zstd/1.5.6`<br>`module list`<br>`module unload zstd/1.5.6`<br>`module purge` | 每個指令之後 |
| `spack-install-zstd.cast` | 10 一行 spack install | `spack install zstd +programs`<br>`spack find zstd` | install 完成之後 |
