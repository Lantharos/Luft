# Running out of memory

When apps ask for more memory than the computer has, Luft closes the app using the most and keeps the desktop itself running and responsive.

## What gets closed

- systemd-oomd watches memory pressure and swap. When apps (`app.slice`), background tasks (`background.slice`) or containers such as Toolbox and Podman (`user.slice`) stall on memory for 10 seconds, or memory and swap are both nearly full, it closes the group of processes reclaiming the most, before the kernel has to step in.
- Every app Kestrel starts gets its own systemd scope, including the processes it forks while starting, so the whole app is closed together and its memory counts against it, not against Kestrel.
- If the kernel does have to pick, apps and services score 200, Kestrel -900 and the session services (PipeWire, WirePlumber, the session bus, the portal, Luft Keyring, Kestrel's settings and session manager) -800.
- If Kestrel itself stops drawing for 6 seconds while it waits on memory and less than a tenth of memory and swap is left, Kestrel's settings service closes the app, background task or container using the most memory right away, without waiting for systemd-oomd, and again every 10 seconds until Kestrel draws again. The graphics watchdog isn't told about these stalls, so they never restart the computer.
- As a last resort the kernel closes a process when it can't keep the memory used in the last second, instead of letting everything crawl while it swaps pages in and out (`/sys/kernel/mm/lru_gen/min_ttl_ms` is 1000).
- Kestrel shows a notification naming the app or container that was closed and how much memory it had.

## Before it runs out

When something has to wait on memory for a tenth of the time and less than a tenth of memory and swap together is left, Kestrel warns that Luft is low on memory and names the app or container using the most, with a button to force quit it. The warning comes at most every two minutes and goes away once that app or container is gone. Kestrel's settings service listens for these stalls through the kernel's pressure notifications, so it does no work while there is enough memory.

## What stays fast

- Kestrel keeps 384 MB and the session services 32 MB each that are never reclaimed, and Kestrel up to 640 MB that is reclaimed last. The user's slices pass this protection down, 640 MB guaranteed and 1 GB preferred.
- The session gets five times the CPU and disk time of apps and background tasks when they compete.
- If the kernel ever closes a process inside Kestrel's own group, the session keeps running.

Swap is compressed memory (zram, zstd) up to the size of the computer's memory and at most 8 GB, Fedora's default. Swappiness is 180 and swap is read one page at a time, since reading compressed memory back is much cheaper than reading from a disk.

GPU memory on integrated graphics (GTT) is ordinary memory that the kernel doesn't count toward any app, so a GPU-heavy app only shows up through the pressure it causes.
