#![no_main]
#![no_std]

extern crate alloc;

mod bgrt;
mod chainload;
mod entries;
mod linux_boot;
mod loader_conf;
mod menu;
mod screen;
mod uki;
mod volume;

#[used]
#[unsafe(link_section = ".sbat")]
static SBAT: [u8; 139] = *b"sbat,1,SBAT Version,sbat,1,https://github.com/rhboot/shim/blob/main/SBAT.md\nsushiboot,1,Luft,sushiboot,1,https://github.com/Lantharos/Luft\n";

use entries::BootKind;
use linux_boot::LinuxEntry;
use uefi::boot::{self, SearchType};
use uefi::prelude::*;
use uefi::proto::console::gop::GraphicsOutput;
use uefi::proto::loaded_image::LoadedImage;
use uefi::{Handle, Identify};

use crate::screen::Screen;

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
    let Some(device) = boot::open_protocol_exclusive::<LoadedImage>(boot::image_handle())
        .ok()
        .and_then(|image| image.device())
    else {
        return Status::LOAD_ERROR;
    };

    let mut found = entries::collect_all(device);
    if found.is_empty() {
        found.push(entries::fallback_entry(device));
    }
    let config = loader_conf::load(device);
    let screen = graphics_handle()
        .and_then(|handle| boot::open_protocol_exclusive::<GraphicsOutput>(handle).ok())
        .map(Screen::new);
    let chosen = match screen {
        Some(mut screen) => menu::choose(&mut screen, &found, &config),
        None => config
            .default_id
            .as_deref()
            .and_then(|id| entries::find_index_by_id(&found, id))
            .unwrap_or(0),
    };

    let entry = &found[chosen];
    log::info!("SushiBoot: starting {}", entry.title);
    let started = match &entry.kind {
        BootKind::Linux {
            linux,
            initrd,
            options,
        } => linux_boot::preload_kernel(entry.volume, linux).and_then(|kernel| {
            linux_boot::start_preloaded(
                kernel,
                &LinuxEntry {
                    initrd: initrd.as_deref(),
                    cmdline: options,
                },
            )
        }),
        BootKind::Efi { efi, .. } => chainload::start_efi(entry.volume, efi),
    };
    match started {
        Ok(()) => Status::SUCCESS,
        Err(error) => {
            log::error!("SushiBoot: {} did not start: {error:?}", entry.title);
            Status::LOAD_ERROR
        }
    }
}
