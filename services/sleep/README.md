# luft-sleep

Keeps a sleeping laptop from running its battery flat. Luft can't hibernate (Secure Boot's lockdown rules it out), so instead the computer wakes briefly on a timer while it sleeps on battery, checks the battery and how long it has slept, and either goes straight back to sleep or shuts down the usual way, so apps and sessions close as they would from the power menu. Plugged in, it just sleeps. Computers without a battery sleep normally.

It shuts down when the battery falls to 5% or once it has slept on battery for the chosen time, a day unless changed in Settings → Power. Checks start an hour in and come sooner as the battery drains faster.

| Command | Use |
| --- | --- |
| `luft-sleep` | `com.lantharos.Sleep1` (see `data/com.lantharos.Sleep1.xml`), started over D-Bus to read and change the setting in `/var/lib/luft-sleep/sleep.conf`; stops when idle |
| `luft-sleep suspend` | Replaces `systemd-sleep suspend` in `systemd-suspend.service` and sleeps in a loop until something other than its own timer wakes the computer |

| File in `data` | Goes to |
| --- | --- |
| `com.lantharos.Sleep1.conf` | `/usr/share/dbus-1/system.d/` |
| `com.lantharos.Sleep1.service` | `/usr/share/dbus-1/system-services/` |
| `luft-sleep.service`, `luft-sleep-power-off.service` | `/usr/lib/systemd/system/` |
| `systemd-suspend-luft.conf` | `/usr/lib/systemd/system/systemd-suspend.service.d/luft-sleep.conf` |
| `com.lantharos.sleep.policy` | `/usr/share/polkit-1/actions/` |

`cargo test` here covers reading batteries, the setting and when to check or shut down. `vm/run.sh` sleeps a VM made from `localhost/luft:45`, with this checkout's system services and a stand-in battery: woken by another timer it stays on, without a battery it simply sleeps, and left alone on battery it wakes on its own timer and shuts down through logind. It needs Podman and QEMU with KVM.
