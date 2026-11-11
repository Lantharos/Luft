# luft-updater

The system service that changes Luft's image for Settings and Schelf: it runs `bootc` to update, switch images and go back, and keeps the schedule `luft-updater-check.timer` checks for updates on. After a download it has [luft-packages](../packages) build the system packages for the new version. Apps reach it through the [luft-software crate](../../packages/system/software); how the two fit together is in [image updates](../../docs/components/software.md#image-updates).

It also moves the system between Luft's stable and nightly channels, keeping its standard or NVIDIA image. A move never installs an older version: when the other channel isn't as new as the running version yet, the updater remembers the channel in its schedule and moves once that channel catches up, taking no updates from the old channel meanwhile. `StableReleased` asks the registry whether a stable version is out, and says so when it can't tell.
