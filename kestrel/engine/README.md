# Kestrel engine

The engine is the native half of Kestrel, started from GNOME Shell 51.0: the St toolkit, the shell's C library, and the JavaScript that runs on Kestrel's own Mutter build for window management, authentication, the lock screen, screenshots, screencasts, notifications and the D-Bus services apps and portals talk to. Kestrel's panel, Start, quick settings and the rest of what you see are written in TypeScript in [`kestrel/ui`](../ui) and built into the engine's resources.

The [repository README](../../README.md#build-and-capture-kestrel) explains how to build it and [Kestrel's README](../README.md) how it fits together. The engine keeps GNOME Shell's GPL license, in `COPYING`.
