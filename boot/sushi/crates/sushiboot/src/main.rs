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

#[used]
#[unsafe(link_section = ".sbat")]
static SBAT: [u8; 139] = *b"sbat,1,SBAT Version,sbat,1,https://github.com/rhboot/shim/blob/main/SBAT.md\nsushiboot,1,Luft,sushiboot,1,https://github.com/Lantharos/Luft\n";

use uefi::boot::{self, SearchType};
use uefi::prelude::*;
use uefi::proto::console::gop::GraphicsOutput;
use uefi::proto::loaded_image::LoadedImage;
use uefi::{Handle, Identify};

use entries::Catalog;
use loader::{conf, vars};
use screen::Screen;
use start::firmware;

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

#[entry]
fn efi_main() -> Status {
    uefi::helpers::init().expect("the UEFI helpers start once");
    let Some(device) = protocol::shared::<LoadedImage>(boot::image_handle())
        .ok()
        .and_then(|image| image.device())
    else {
        return Status::LOAD_ERROR;
    };

    let mut catalog = Catalog::collect(device, firmware::secure_boot());
    let Some(first) = catalog.first() else {
        return Status::NOT_FOUND;
    };
    vars::describe(&catalog);
    let config = conf::load(device);
    let default = [vars::take_oneshot(), vars::chosen_default(), config.default]
        .iter()
        .flatten()
        .find_map(|pattern| catalog.find(pattern))
        .unwrap_or(first);
    let mut screen = graphics_handle().and_then(|handle| {
        let gop = protocol::shared::<GraphicsOutput>(handle).ok()?;
        Some(Screen::new(handle, gop))
    });
    let mut chosen = match screen.as_mut() {
        Some(screen) => menu::choose(screen, &catalog, default, config.timeout, None),
        None => default,
    };
    loop {
        catalog.record_attempt(chosen);
        let entry = &catalog.entries[chosen];
        vars::selected(&entry.id);
        if start::start(entry).is_ok() {
            return Status::SUCCESS;
        }
        let Some(screen) = screen.as_mut() else {
            return Status::LOAD_ERROR;
        };
        chosen = menu::choose(screen, &catalog, chosen, 0, Some(&entry.title));
    }
}
