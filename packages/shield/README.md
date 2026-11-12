# luft-shield

Keeps Luft's small helpers, such as Luft Keyring and Luft Passkeys, out of reach of your other programs, and lets services tell such a helper apart from them. How it works is in [Shielded helpers](../../docs/security.md#shielded-helpers).

| Item | Use |
| --- | --- |
| `lock_down` | Called first thing by a shielded helper |
| `Process::started_shielded` | Whether the process a pidfd pins started a shielded helper with its group, nothing tracing it |
| `group_of` | The group a shielded helper is installed setgid to, for a check from the credentials of a socket |

A shielded helper is installed setgid to a group of its own, with a fixed ID in `/usr/lib/sysusers.d/<program>.conf`, and named in `shielded` in `os/image/stages/finalize.sh`. Its user unit sets nothing that implies no new privileges, since the kernel doesn't hand out the group then.

`vm/run.sh` builds Luft Keyring and Luft Passkeys into a copy of `localhost/luft:45`, with `/usr` read-only as on an installed Luft, and checks in a VM that a plain program of the same user can't read their environment, maps or memory, that the relay and the unlock service refuse its connections, that a Luft Passkeys started with no new privileges gets no group and is refused, and that Luft Passkeys still lists passkeys through the keyring.
