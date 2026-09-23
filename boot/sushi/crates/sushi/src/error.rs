//! Fatal boot error presentation helpers.

use crate::render::ErrorDisplay;

pub fn classify_boot_error(err: &anyhow::Error) -> ErrorDisplay {
    let detail = format!("{err:#}");
    let lower = detail.to_ascii_lowercase();

    let (title, hints) = if lower.contains("display") || lower.contains("fb0") || lower.contains("drm") {
        (
            "DISPLAY UNAVAILABLE",
            vec![
                "Check that /dev/fb0 or /dev/dri/card0 exists in initramfs",
                "Add drm.ko and framebuffer drivers to the initramfs",
                "Boot with console=ttyS0 and inspect vm/serial.log",
            ],
        )
    } else if lower.contains("luks") || lower.contains("crypt") || lower.contains("passphrase") {
        (
            "DISK UNLOCK FAILED",
            vec![
                "Enter the correct LUKS passphrase when prompted",
                "If TPM unseal failed, PCRs may have changed after firmware update",
                "Boot from recovery media and run cryptsetup luksOpen manually",
            ],
        )
    } else if lower.contains("sysroot") || lower.contains("sbin/init") {
        (
            "ROOT FILESYSTEM MISSING",
            vec![
                "Verify root= on the kernel cmdline points at the real root disk",
                "Ensure the root volume is unlocked before switch_root",
                "Check that /sysroot/sbin/init exists on the target rootfs",
            ],
        )
    } else if lower.contains("tpm") {
        (
            "TPM UNLOCK FAILED",
            vec![
                "Install tpm2-tools in the initramfs for Sushi TPM support",
                "Reseal the volume after a successful manual unlock",
                "Confirm measured-boot PCRs 0,2,4,7 match the sealed policy",
            ],
        )
    } else {
        (
            "SUSHI FAILED TO START",
            vec![
                "Press F1 to read the debug log overlay",
                "Check serial console output for Sushi: lines",
                "Rebuild the initramfs after upgrading sushid",
            ],
        )
    };

    ErrorDisplay {
        title: title.to_string(),
        detail,
        hints: hints.into_iter().map(str::to_string).collect(),
    }
}