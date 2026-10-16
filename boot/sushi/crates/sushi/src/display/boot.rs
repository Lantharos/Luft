use std::ops::Range;

use sushi_scene::Monitor;

const BOOT_PARAMS: &str = "/sys/kernel/boot_params/data";
const SCREEN_WIDTH: Range<usize> = 0x12..0x14;
const SCREEN_HEIGHT: Range<usize> = 0x14..0x16;
const EDID: Range<usize> = 0x140..0x1c0;
const FIRMWARE_SCREEN: &str =
    "/sys/firmware/efi/efivars/LuftFirmwareScreen-b6a4c1e2-3f5d-4c8a-9e71-2d0f6a8b5c3e";
const EFI_VARIABLE_ATTRIBUTES: usize = 4;

fn boot_params() -> Option<Vec<u8>> {
    std::fs::read(BOOT_PARAMS).ok()
}

pub(super) fn monitor() -> Option<Monitor> {
    Monitor::from_edid(boot_params()?.get(EDID)?)
}

fn announced_by_boot_loader() -> Option<(u32, u32)> {
    let variable = std::fs::read(FIRMWARE_SCREEN).ok()?;
    let text = std::str::from_utf8(variable.get(EFI_VARIABLE_ATTRIBUTES..)?).ok()?;
    let (width, height) = text.split_once('x')?;
    Some((width.parse().ok()?, height.parse().ok()?))
}

fn handed_to_linux() -> Option<(u32, u32)> {
    let boot_params = boot_params()?;
    let field = |range: Range<usize>| {
        Some(u32::from(u16::from_le_bytes(
            boot_params.get(range)?.try_into().ok()?,
        )))
    };
    let size = (field(SCREEN_WIDTH)?, field(SCREEN_HEIGHT)?);
    (size.0 > 0 && size.1 > 0).then_some(size)
}

/// The screen the firmware was showing when it handed over: before SushiBoot changed its mode, or as Linux got it.
pub fn firmware_screen() -> Option<(u32, u32)> {
    announced_by_boot_loader().or_else(handed_to_linux)
}
