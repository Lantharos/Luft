# Running out of memory

When apps ask for more memory than the computer has, Luft closes the app using the most and keeps the desktop itself running and responsive.

## What gets closed

- systemd-oomd watches memory pressure and swap. When apps (`app.slice`), background tasks (`background.slice`) or containers such as Toolbox and Podman (`user.slice`) stall on memory for 10 seconds, or memory and swap are both nearly full, it closes the group of processes reclaiming the most, before the kernel has to step in.
- Every app Kestrel starts gets its own systemd scope, including the processes it forks while starting, so the whole app is closed together and its memory counts against it, not against Kestrel.
- If the kernel does have to pick, apps and services score 200, Kestrel -900 and the session services (PipeWire, WirePlumber, the session bus, the portal, Luft Keyring, Kestrel's settings and session manager) -800.
- Kestrel shows a notification naming the app or container that was closed and how much memory it had.

## What stays fast

- Kestrel keeps 384 MB and the session services 32 MB each that are never reclaimed, and Kestrel up to 640 MB that is reclaimed last. The user's slices pass this protection down, 640 MB guaranteed and 1 GB preferred.
- The session gets five times the CPU and disk time of apps and background tasks when they compete.
- If the kernel ever closes a process inside Kestrel's own group, the session keeps running.

GPU memory on integrated graphics (GTT) is ordinary memory that the kernel doesn't count toward any app, so a GPU-heavy app only shows up through the pressure it causes.
