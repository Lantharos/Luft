#![no_main]
#![no_std]

extern crate alloc;

mod entries;
mod files;
mod loader;
mod menu;
mod protocol;
mod screen;
mod start;
mod tpm;

#[used]
#[unsafe(link_section = ".sbat")]
static SBAT: [u8; 139] = *b"sbat,1,SBAT Version,sbat,1,https://github.com/rhboot/shim/blob/main/SBAT.md\nsushiboot,1,Luft,sushiboot,1,https://github.com/Lantharos/Luft\n";

use uefi::boot::{self, SearchType};
use uefi::prelude::*;
use uefi::proto::console::gop::GraphicsOutput;
use uefi::proto::loaded_image::LoadedImage;
use uefi::{Handle, Identify};

use entries::Catalog;
use loader::attempts::{self, Attempts};
use loader::{conf, last, vars};
use screen::Screen;
use start::firmware;

// With another system on the computer, the menu shows itself this long
// unless loader.conf sets a timeout: long enough for a monitor to wake up
const OTHER_SYSTEM_TIMEOUT: u32 = 10;

fn graphics_handle() -> Option<Handle> {
    boot::get_handle_for_protocol::<GraphicsOutput>()
        .ok()
        .or_else(|| {
            boot::locate_handle_buffer(SearchType::ByProtocol(&GraphicsOutput::GUID))
                .ok()?
                .first()
                .copied()
        })
}

fn note_attempt(catalog: &Catalog, chosen: usize, failed: Option<usize>, attempts: &mut Attempts) {
    if let Some((image, _)) = catalog.entries[chosen].image() {
        let counted = catalog.on_trial(chosen, attempts);
        attempts.start(image, counted);
    }
    if let Some((image, _)) = failed.and_then(|failed| catalog.entries[failed].image())
        && failed != Some(chosen)
    {
        attempts::went_back(image);
    }
}

#[entry]
fn efi_main() -> Status {
    uefi::helpers::init().expect("the UEFI helpers start once");
    let Some(device) = protocol::shared::<LoadedImage>(boot::image_handle())
        .ok()
        .and_then(|image| image.device())
    else {
        return Status::LOAD_ERROR;
    };

    let catalog = Catalog::collect(device, firmware::secure_boot());
    let Some(first) = catalog.first() else {
        return Status::NOT_FOUND;
    };
    vars::describe(&catalog, device);
    let config = conf::load(device);
    let default = [
        vars::take_oneshot(),
        vars::chosen_default(),
        last::other_system(),
        config.default,
    ]
    .iter()
    .flatten()
    .find_map(|pattern| catalog.find(pattern))
    .unwrap_or(first);
    let mut attempts = Attempts::load();
    let going_back = match attempts::take_go_back().and_then(|entry| catalog.find(&entry)) {
        Some(left) => catalog.image_of(left).zip(catalog.older(left)),
        None => catalog
            .going_back(default, &attempts)
            .map(|previous| (default, previous)),
    };
    let failed = going_back.map(|(failed, _)| failed);
    let default = going_back.map_or(default, |(_, previous)| previous);
    let mut screen = graphics_handle().and_then(|handle| {
        let gop = protocol::shared::<GraphicsOutput>(handle).ok()?;
        Some(Screen::new(handle, gop))
    });
    let timeout = config.timeout.unwrap_or(if catalog.others.is_empty() {
        0
    } else {
        OTHER_SYSTEM_TIMEOUT
    });
    let mut chosen = match screen.as_mut() {
        Some(screen) => menu::choose(screen, &catalog, default, timeout, None),
        None => default,
    };
    loop {
        note_attempt(&catalog, chosen, failed, &mut attempts);
        last::started(&catalog, chosen);
        let entry = &catalog.entries[chosen];
        vars::selected(&entry.id);
        let previous = catalog
            .older(chosen)
            .and_then(|older| catalog.entries[older].image());
        attempts::offer_previous(previous.map(|(_, release)| release.version.as_str()));
        if start::start(entry).is_ok() {
            return Status::SUCCESS;
        }
        let Some(screen) = screen.as_mut() else {
            return Status::LOAD_ERROR;
        };
        chosen = menu::choose(screen, &catalog, chosen, 0, Some(&entry.title));
    }
}
