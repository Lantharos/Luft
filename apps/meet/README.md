# Meet Luft

![Meet Luft, ready to try or install Luft](../../docs/screenshots/meet-ready.png)

A Windows app that gets a PC ready for Luft without a USB stick. It checks the computer, makes room next to Windows with Windows' own tools, puts the live Luft system in that room and restarts into it once, to try Luft or install it. It can pack files and settings into a moving box that Install Luft unpacks, and it can take everything back out again. How it fits together is in [docs/meet.md](../../docs/meet.md).

Builds aren't code-signed yet, so Windows SmartScreen asks before the first start ("More info", then "Run anyway").

## Parts

| Folder | What it is |
| --- | --- |
| `src` | The window: check, room, moving box, ready |
| `desktop` | Its native side. It runs as you, and starts itself a second time with administrator rights, after Windows asks, for the disk and firmware work |
| `vm` | A Windows 11 VM with Secure Boot and a TPM to try it in |

What Meet Luft leaves on the drive for Install Luft, and the moving box's format, are in [packages/meet](../../packages/meet).

## Build

Install dependencies once from the repository root with `bun install`, then from this directory:

```sh
bun run check
bun run build
cargo build --release --target x86_64-pc-windows-gnu --manifest-path desktop/Cargo.toml
```

The Windows build cross-compiles from Linux with MinGW. To run it, put `meet.exe` in a folder with a `resources` folder holding `Sabine.toml`, `dist` and `public`; the first start sets up Sabine. Releases come from the [Meet Luft workflow](../../.github/workflows/meet.yml) on Windows: push a `meet-vVERSION` tag matching `Sabine.toml`, or start it by hand for a test build. It publishes `meet-luft.exe` (a setup program) to the GitHub release and to `get.luft.lanth.me` when the R2 secrets are set.

Start it with `--nightly`, or press Ctrl+Shift+N in it, to use `luft-nightly.iso` instead of `luft-latest.iso`. Ctrl+Shift+N again switches back.

Ctrl+Shift+L saves the newest logs from Try Luft to the desktop as a zip. Where Luft keeps them is in [docs/meet.md](../../docs/meet.md#logs-from-try-luft).

## Testing

```sh
vm/run.sh base             # installs Windows 11 from vm/state/windows11-eval.iso, unattended
vm/run.sh plain            # a copy of it to test in; delete vm/state/plain to start over
vm/control.py plain wait   # until Windows is up
vm/control.py plain run 'Get-Partition'
vm/control.py plain screenshot shot.png
vm/iso.sh                  # a Luft ISO with this checkout's installer, Install Luft and trustd
```

The VM needs the Windows 11 Enterprise evaluation ISO and the virtio-win ISO in `vm/state`. Windows signs in as `ada` (password `meet-vm`) by itself, with the QEMU guest agent, so `control.py` can run PowerShell as SYSTEM, copy files and click and type.
