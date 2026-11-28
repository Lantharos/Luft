# luft-swap

Swaps memory to files on the encrypted drive, behind zswap, and sizes them as needed: 4 GB to start, 4 GB more whenever less than 2 GB of swap is left, up to the size of memory, and never into the last tenth of the drive (at least 4 GB, at most 20 GB). A file added this way goes again once it has held less than 256 MB for five minutes and the rest of swap would still have 4 GB free, or at once when the drive runs short of space. Drives that aren't encrypted get no swap.

The files live in `/var/swap`, a btrfs subvolume of its own so they never end up in a snapshot, labelled `swapfile_t`. `luft-swap prepare` makes the folder before the sandboxed service starts.

| File in `data` | Goes to |
| --- | --- |
| `luft-swap.service` | `/usr/lib/systemd/system/` |
| `luft-swap.cil` | `/usr/share/selinux/packages/luft/` |

`cargo test` here covers when swap grows and shrinks, which drives count as encrypted and the swap header. [Memory](https://docs.luft.computer/developers/system/memory/) explains the design, and `os/vm/check.py memory` runs it under real memory pressure.
