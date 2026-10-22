# luft-packages

The system service that builds the packages Luft merges over its image as a system extension, for Schelf's `--system` and `repo`, and the activation service that brings each build into the running system. Apps reach it through the [luft-software crate](../../packages/system/software); how it builds, merges and removes packages is in [system packages](../../docs/system-packages.md).
