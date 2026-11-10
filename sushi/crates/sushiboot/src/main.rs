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

use core::panic::PanicInfo;
use core::ptr;

use uefi::boot::{self, SearchType};
use uefi::prelude::*;
use uefi::proto::console::gop::GraphicsOutput;
use uefi::proto::loaded_image::LoadedImage;
use uefi::runtime::{self, ResetType};
use uefi::{Handle, Identify};

use entries::Catalog;
use loader::{back, conf, last, vars};
use menu::Choice;
use screen::Screen;
use start::firmware;

const MENU_SECONDS_NEXT_TO_ANOTHER_SYSTEM: u32 = 10;

#[panic_handler]
fn leave_to_the_firmware(_: &PanicInfo) -> ! {
    let _ = unsafe { boot::exit(boot::image_handle(), Status::ABORTED, 0, ptr::null_mut()) };
    runtime::reset(ResetType::SHUTDOWN, Status::ABORTED, None)
}

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

fn note_start(catalog: &Catalog, chosen: usize) {
    let entry = &catalog.entries[chosen];
    if let Some(counted) = &entry.counted {
        counted.start();
    }
    if let Some((image, _)) = catalog
        .failed
        .filter(|failed| *failed != chosen)
        .and_then(|failed| catalog.entries[failed].image())
    {
        back::went_back(image);
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

    let mut catalog = Catalog::collect(device, firmware::secure_boot());
    let Some(first) = catalog.first() else {
        return Status::NOT_FOUND;
    };
    vars::describe(&catalog, device);
    let config = conf::load(device);
    let default = [
        vars::take_oneshot(),
        vars::chosen_default(),
        last::other_system_started_last(),
        config.default,
    ]
    .iter()
    .flatten()
    .find_map(|pattern| catalog.find(pattern))
    .unwrap_or(first);
    let going_back = back::take_go_back()
        .and_then(|entry| catalog.find(&entry))
        .and_then(|left| catalog.image_of(left).zip(catalog.older(left)));
    if let Some((failed, _)) = going_back {
        catalog.failed = Some(failed);
    }
    let default = going_back.map_or(default, |(_, previous)| previous);
    let mut screen = graphics_handle().and_then(|handle| {
        let gop = protocol::shared::<GraphicsOutput>(handle).ok()?;
        Some(Screen::new(handle, gop))
    });
    let timeout = config.timeout.unwrap_or(if catalog.others.is_empty() {
        0
    } else {
        MENU_SECONDS_NEXT_TO_ANOTHER_SYSTEM
    });
    let mut choice = match screen.as_mut() {
        Some(screen) => menu::choose(screen, &catalog, default, timeout, None),
        None => Choice::unasked(default),
    };
    loop {
        let chosen = choice.entry;
        note_start(&catalog, chosen);
        last::started(&catalog, chosen);
        let entry = &catalog.entries[chosen];
        vars::selected(&entry.id);
        let older = catalog.older(chosen);
        let previous = older.and_then(|older| catalog.entries[older].image());
        back::offer_previous(previous.map(|(_, release)| release.version.as_str()));
        if start::start(entry).is_ok() {
            return Status::SUCCESS;
        }
        if let (false, Some(older)) = (choice.picked, older) {
            catalog.failed = catalog.image_of(chosen);
            choice = Choice::unasked(older);
            continue;
        }
        let Some(screen) = screen.as_mut() else {
            return Status::LOAD_ERROR;
        };
        choice = menu::choose(screen, &catalog, chosen, 0, Some(&entry.title));
    }
}
