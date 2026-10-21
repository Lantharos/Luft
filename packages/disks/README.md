# luft-disks

Drives and partitions through UDisks, shared by Disks and Luft's installer.

```toml
luft-disks = { path = "../../../packages/disks" }
```

| Module | Use |
| --- | --- |
| `udisks` | Calls to UDisks; `snapshot::build` lists drives with their partitions, free space, health and running jobs |
| `mounting` | Mount, unmount, label, release a partition before changing it, and startup mounts |
| `resize` | Grow or shrink a partition and its file system in the right order |
| `partitions` | Delete a partition after releasing it |
| `systems` | Other systems on the drives (Windows, other Linux, the old system Luft replaced) and removing one, with trustd for start entries, boot files and growing Luft |

`cargo run --example other-systems -- list` prints the other systems as JSON; `remove ID` removes one.
