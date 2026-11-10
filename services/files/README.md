# luft-files

Changes files and processes that the person at the screen can't change themselves, for Rover and Barometer. It replaces running `cp`, `mv`, `rm`, `kill` and `renice` as root: each thing it can do is one narrow method on `com.lantharos.Files1` (see `data/com.lantharos.Files1.xml`), and every call is checked with polkit, which has Kestrel ask for an administrator's password. Only someone signed in at the computer can be asked; remote and background sessions are refused. Started over D-Bus, it stops after half a minute with nothing to do.

It reaches every folder on the way to an item without following links, and treats the item itself as what it is, so a link swapped in while it works can't send it somewhere else. Copies belong to whoever owns the folder they land in and never keep setuid or setgid. Items go to the trash of the person who asked, on the drive they're on. How this fits the rest of Luft is in [Security](../../docs/security.md#changing-files-that-arent-yours).

The crate is also a library: `luft_files::client` calls the service, and `luft_files::data` copies a file's contents by sharing them when the filesystem can, inside the kernel otherwise, keeping holes as holes, which Rover uses for its own copies too.

| File in `data` | Goes to |
| --- | --- |
| `com.lantharos.Files1.conf` | `/usr/share/dbus-1/system.d/` |
| `com.lantharos.Files1.service` | `/usr/share/dbus-1/system-services/` |
| `luft-files.service` | `/usr/lib/systemd/system/` |
| `com.lantharos.files.policy` | `/usr/share/polkit-1/actions/` |

`cargo test -p luft-files` covers copying sparse files, stopping a copy, and that links are never followed on the way to an item or inside it.
