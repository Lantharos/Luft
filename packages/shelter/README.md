# luft-shelter

Keeps Luft's small helpers, such as Luft Keyring, out of reach of your other programs, and lets services tell such a helper apart from them. How it works is in [Sheltered helpers](https://docs.luft.computer/security/identity/#sheltered-helpers).

| Item | Use |
| --- | --- |
| `lock_down` | Called first thing by a sheltered helper |
| `Process::started_sheltered` | Whether the process a pidfd pins started a sheltered helper with its group, nothing tracing it |

A sheltered helper is installed setgid to a group of its own, with a fixed ID in `/usr/lib/sysusers.d/<program>.conf`, and named in `sheltered` in `os/image/stages/finalize.sh`. Its user unit sets nothing that implies no new privileges, since the kernel doesn't hand out the group then.

`vm/run.sh` builds Luft Keyring into a copy of `localhost/luft:45`, with `/usr` read-only as on an installed Luft, and checks in a VM that a plain program of the same user can't read its environment, maps or memory, that the unlock service refuses that program's connections, and that a keyring started with no new privileges gets no group and is refused.
