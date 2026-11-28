---
title: Memory and swap
description: zswap in front of growing swap files, protecting the app in front, and who gets closed when memory runs out.
sidebar:
  order: 8.75
---

Three parts share the work. `luft-swap`, a system service, decides how much swap there is. Kestrel says which app is in front, and `kestrel-settings` protects that app and decides what to close. The kernel's OOM killer stays as the last resort; systemd-oomd is masked. [When memory runs low](/system/memory/) is what people see.

## Swap

zswap compresses pages on their way to swap and keeps them in memory, and its shrinker writes the coldest of them on to disk as memory fills, so swap-ins are mostly decompression and rarely a read from the drive. `luft-swap` turns it on through `/sys/module/zswap/parameters` before it adds any swap: `compressor` `zstd`, `shrinker_enabled` `Y`, `enabled` `Y`. zstd is a module that can't load while the kernel parses its command line, so a kernel argument would leave zswap on lzo. The pool keeps the kernel's limit of a fifth of memory, and zsmalloc is the only allocator the kernel has left. `vm.swappiness` is 133: a page coming back from zswap is cheaper than reading a file from the drive, and one from the drive costs about the same.

The files live in `/var/swap`, numbered from 0. On btrfs, `luft-swap prepare` makes that folder a subvolume of its own, so no snapshot can ever share a swap file's extents, which the kernel refuses to swap to. Each file is made `NOCOW`, which also keeps btrfs from compressing it, set aside with `fallocate` and given a swap header, then turned on with discards, since the encrypted disk passes them through. File 0 has the highest priority and each later one the next lower, so later files only fill once the earlier ones are full and empty first.

| Rule | Value |
| --- | --- |
| First file | 4 GB |
| Add a file | when less than 2 GB of swap is free, 4 GB at a time |
| Most swap | the size of memory, rounded up to a gigabyte, the last step smaller to fit |
| Drive margin | never closer than a tenth of the drive to full, at least 4 GB and at most 20 GB; files shrink to what fits, and none under 1 GB is made |
| Remove a file | the last added one, once it has held under 256 MB for five minutes while the others would still have 4 GB free and memory has room for what it holds |
| Space wanted back | when the drive is past its margin, such a file goes at once |

`luft-swap` checks every 10 seconds, every second while less than 3 GB of swap is free, and at once when tasks wait on memory for 100 ms within 2 seconds, so swap grows before it is needed rather than when it's already full. At start it turns file 0 back on and deletes any other file left from before; after a restart of the service it takes over the files that are still on.

Swap is only made when the filesystem holding `/var` sits on dm-crypt: the mount's device, or a partition of it, is a `CRYPT-` device-mapper target, or everything below it is. A drive without encryption, or a live system on a USB stick, gets no swap at all, and so zswap has nothing to write to. Hibernation stays off.

The policy in `luft-swap.cil` labels `/var/swap` and its files `swapfile_t`, and a named type transition gives the folder that label when the service makes it, so its files inherit it.

## The app in front

Kestrel's `com.lantharos.Kestrel.Memory` interface has a `Windows` property: every normal window with its process, the systemd unit it runs in, its app, its name and whether it's focused or fullscreen, most recently used first. Steam games are apps of their own there, named after the game.

`kestrel-settings` protects one unit: a fullscreen window's, the focused one first, and otherwise the focused window's. It sets `MemoryLow` on that unit and on every slice above it inside the user's manager, at runtime through `SetUnitProperties`, and sets them back to 0 when the protection moves. Units still protected from before are set back when it starts.

The share is what the session leaves over: `user@.service`, `user-.slice` and `user.slice` keep 60% of memory under `MemoryLow`, and Kestrel's `session.slice` claims 1 GB of it, so a 16 GB computer protects up to about 8.6 GB of the app in front. Its share never undercuts the desktop's, and no app can claim everything. The cgroup tree is mounted with `memory_recursiveprot`, so the share has to be claimed down the whole chain of slices to reach that one unit; whatever it doesn't use is spread over the rest of the session. Kestrel also keeps `MemoryMin=640M`, which is never reclaimed.

## Growth

While memory pressure lasts, at 100 ms of stalls every 2 seconds or more, `kestrel-settings` reads `memory.current` and `memory.swap.current` of every app unit every 2 seconds, and stops 30 seconds after the pressure ends. Nothing runs while there is no pressure. An app is growing when, over the last minute, with at least 30 seconds of samples, it grew by 256 MB or more and rose in three of every four samples.

The minute is longer than loading a level or restoring tabs, so a climb that stops isn't growth, and 256 MB a minute is the slowest leak that would fill memory within the time someone notices. A growing app in the background is to blame. The app in front is to blame only while growing past a quarter beyond its protected share; it then loses the protection, which is there to keep a big app smooth and not to feed one that never stops, and it's warned about with "keeps using more memory".

## Closing apps

The watchdog in `kestrel-settings` asks Kestrel whether its frames reach the screen. When Kestrel has been stuck for 6 seconds and its own cgroup has been waiting on memory a tenth of the time over the last 10 seconds, Kestrel is starved, and one app is closed through its cgroup's `cgroup.kill`. Then at least 10 seconds pass and the same test runs again before the next. In order:

1. Any app to blame, the biggest first.
2. Apps in the background, the biggest first.
3. The app in front, only if a warning naming it was shown in the last 10 minutes. Otherwise the warning goes out now and nothing is closed, so the next round can close it once it has been seen.

Warnings go out ahead of that too, at most one per app every 2 minutes, and name whatever would be closed first: an app in front to blame, at once; otherwise once memory pressure reaches a tenth of the time with less than a tenth of memory left, unless the app would be one in the background while something is fullscreen. Warnings are critical notifications, which show over fullscreen windows. Kestrel only answers once it has shown one, and only that answer counts as warned.

The notice names the window of the process using the most memory in the unit, or the nearest process above it that has a window, so closing Steam's unit while a game runs says the game was closed. When the kernel's OOM killer ends a unit, Kestrel names it from the windows that closed with it.

systemd-oomd can't take part: it can't tell which app is in front, and its preferences are ignored for cgroups that aren't owned by root, which every app's is. Its swap rule would also act on swap that `luft-swap` is about to grow. So it's masked, and with it gone the kernel's OOM killer is what's left when memory really runs out, with Kestrel at `OOMScoreAdjust` −900 and the session services at −800.

## Testing

`cargo test -p luft-swap` covers growing and shrinking, which drives count as encrypted and the swap header, and `cargo test -p kestrel-settings memory` covers growth, the order and protection. The headless group `system:memory` runs Kestrel's side against a stand-in cgroup tree in `LUFT_CGROUP_ROOT` and a stand-in user manager: the protection following focus and fullscreen, the order while Kestrel hangs, the warning over a fullscreen game and the notices naming the game rather than Steam. `os/vm/check.py memory` runs all of it on an installed, encrypted VM with little memory.
