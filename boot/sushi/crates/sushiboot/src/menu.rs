//! Minimal boot menu — keyboard selection with timeout.

use uefi::boot::{self, SearchType};
use uefi::proto::console::gop::GraphicsOutput;
use uefi::proto::console::text::{Input, Key, ScanCode};
use uefi::{Handle, Identify};

use crate::entries::BootEntry;
use crate::loader_conf::LoaderConfig;
use crate::scene::BootScene;

pub fn resolve_initial_index(entries: &[BootEntry], conf: &LoaderConfig) -> usize {
    if let Some(id) = conf.default_id.as_deref() {
        if let Some(idx) = crate::entries::find_index_by_id(entries, id) {
            return idx;
        }
    }
    0
}

pub fn run_menu(
    scene: &mut BootScene,
    gop: &mut GraphicsOutput,
    entries: &[BootEntry],
    conf: &LoaderConfig,
) -> usize {
    if entries.is_empty() {
        return 0;
    }
    if entries.len() == 1 {
        return resolve_initial_index(entries, conf);
    }

    let mut selected = resolve_initial_index(entries, conf);
    let mut remaining_ms = conf.timeout_secs.saturating_mul(1000);
    let input_handle = locate_input_handle();

    loop {
        let _ = scene.draw_menu(gop, entries, selected, remaining_ms);
        boot::stall(16_666);

        if let Some(handle) = input_handle {
            if let Ok(mut input) = boot::open_protocol_exclusive::<Input>(handle) {
                if let Ok(Some(key)) = input.read_key() {
                    match key {
                        Key::Special(ScanCode::UP) => {
                            selected = selected.checked_sub(1).unwrap_or(entries.len() - 1);
                            remaining_ms = conf.timeout_secs.saturating_mul(1000);
                        }
                        Key::Special(ScanCode::DOWN) => {
                            selected = (selected + 1) % entries.len();
                            remaining_ms = conf.timeout_secs.saturating_mul(1000);
                        }
                        Key::Printable(ch) => {
                            if ch == uefi::Char16::try_from('\r').unwrap()
                                || ch == uefi::Char16::try_from('\n').unwrap()
                                || ch == uefi::Char16::try_from(' ').unwrap()
                            {
                                return selected;
                            }
                        }
                        _ => {}
                    }
                }
            }
        }

        if remaining_ms == 0 {
            return selected;
        }
        remaining_ms = remaining_ms.saturating_sub(17);
    }
}

fn locate_input_handle() -> Option<Handle> {
    boot::get_handle_for_protocol::<Input>()
        .ok()
        .or_else(|| {
            boot::locate_handle_buffer(SearchType::ByProtocol(&Input::GUID))
                .ok()
                .and_then(|h| h.first().copied())
        })
}