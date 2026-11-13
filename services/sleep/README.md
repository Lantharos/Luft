# luft-sleep

Keeps a sleeping laptop from running its battery flat. Luft can't hibernate (Secure Boot's lockdown rules it out), so instead the computer wakes briefly on a timer while it sleeps on battery, checks the battery, and either goes straight back to sleep or shuts down the usual way, so apps and sessions close as they would from the power menu. Plugged in, it just sleeps. Waking well before a check was due, or more than a minute after, counts as someone waking the computer, since some laptops can't be woken by the timer. Computers without a battery sleep normally.

It shuts down when the battery falls to 5%, and otherwise stays asleep, so open windows are kept. Checks start an hour in and come sooner as the battery drains faster. Going to sleep with the battery already at 5% or below, it checks after 10 minutes.

`luft-sleep suspend` replaces `systemd-sleep suspend` in `systemd-suspend.service` and sleeps in a loop until something other than its own timer wakes the computer.

| File in `data` | Goes to |
| --- | --- |
| `luft-sleep-power-off.service` | `/usr/lib/systemd/system/` |
| `systemd-suspend-luft.conf` | `/usr/lib/systemd/system/systemd-suspend.service.d/luft-sleep.conf` |

`cargo test` here covers reading batteries and when to check or shut down. `vm/run.sh` sleeps a VM made from `localhost/luft:45`, with this checkout's system services and a stand-in battery: woken by another timer it stays on, without a battery it simply sleeps, and left alone on a low battery it wakes on its own timer after 10 minutes and shuts down through logind. It needs Podman and QEMU with KVM.
