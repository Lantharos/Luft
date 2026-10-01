#![no_main]
#![no_std]

extern crate alloc;

mod bgrt;
mod entries;
mod files;
mod loader;
mod menu;
mod screen;
mod start;

#[used]
#[unsafe(link_section = ".sbat")]
static SBAT: [u8; 139] = *b"sbat,1,SBAT Version,sbat,1,https://github.com/rhboot/shim/blob/main/SBAT.md\nsushiboot,1,Luft,sushiboot,1,https://github.com/Lantharos/Luft\n";

use uefi::boot::{self, OpenProtocolAttributes, OpenProtocolParams, ScopedProtocol, SearchType};
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

fn shared_graphics(handle: Handle) -> Option<ScopedProtocol<GraphicsOutput>> {
    let params = OpenProtocolParams {
        handle,
        agent: boot::image_handle(),
        controller: None,
    };
    unsafe { boot::open_protocol::<GraphicsOutput>(params, OpenProtocolAttributes::GetProtocol) }
        .ok()
}

#[entry]
fn efi_main() -> Status {
    uefi::helpers::init().expect("the UEFI helpers start once");
    let Some(device) = boot::open_protocol_exclusive::<LoadedImage>(boot::image_handle())
        .ok()
        .and_then(|image| image.device())
    else {
        return Status::LOAD_ERROR;
    };

    let catalog = Catalog::collect(device, firmware::secure_boot());
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
    let chosen = graphics_handle()
        .and_then(shared_graphics)
        .map(Screen::new)
        .map_or(default, |mut screen| {
            menu::choose(&mut screen, &catalog, default, config.timeout)
        });

    let entry = &catalog.entries[chosen];
    vars::selected(&entry.id);
    log::info!("SushiBoot: starting {}", entry.title);
    match start::start(entry) {
        Ok(()) => Status::SUCCESS,
        Err(error) => {
            log::error!("SushiBoot: {} did not start: {error:?}", entry.title);
            Status::LOAD_ERROR
        }
    }
}
