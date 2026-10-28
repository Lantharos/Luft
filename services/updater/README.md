# luft-updater

The system service that changes Luft's image for Settings and Schelf: it runs `bootc` to update, switch images and go back, and keeps the schedule `luft-updater-check.timer` checks for updates on. After a download it has [luft-packages](../packages) build the system packages for the new version. Apps reach it through the [luft-software crate](../../packages/system/software); how the two fit together is in [image updates](../../docs/components/software.md#image-updates).
