# luft-updater

The system service that changes Luft's image for Settings and Schelf: it runs `bootc` to update, switch images and go back, lays system packages over the image and keeps the list of Flatpak apps with full access. Apps reach it through the [luft-software crate](../../packages/system/software); how the two fit together is in [image updates](../../docs/components/software.md#image-updates) and [system packages](../../docs/components/software.md#system-packages).
