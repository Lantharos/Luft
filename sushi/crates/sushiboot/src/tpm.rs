use alloc::vec::Vec;

use uefi::boot::{self, ScopedProtocol};
use uefi::cstr16;
use uefi::proto::tcg::v2::{HashLogExtendEventFlags, PcrEventInputs, Tcg};
use uefi::proto::tcg::{EventType, PcrIndex};

use crate::protocol;

const BOOT_LOADER_CONFIG: PcrIndex = PcrIndex(5);
const KERNEL_CONFIG: PcrIndex = PcrIndex(12);
const LOADER_CONF_TAG: u32 = 0xf5bc_582a;

fn tpm() -> Option<ScopedProtocol<Tcg>> {
    let mut tcg = protocol::shared::<Tcg>(boot::get_handle_for_protocol::<Tcg>().ok()?).ok()?;
    tcg.get_capability()
        .is_ok_and(|capability| capability.tpm_present())
        .then_some(tcg)
}

fn extend(pcr: PcrIndex, kind: EventType, data: &[u8], event: &[u8]) {
    let Some(mut tcg) = tpm() else {
        return;
    };
    if let Ok(event) = PcrEventInputs::new_in_box(pcr, kind, event) {
        let _ = tcg.hash_log_extend_event(HashLogExtendEventFlags::empty(), data, &event);
    }
}

pub fn measure_loader_conf(contents: &[u8]) {
    let name = cstr16!("loader.conf").as_bytes();
    let mut tagged = Vec::with_capacity(8 + name.len());
    tagged.extend(LOADER_CONF_TAG.to_le_bytes());
    tagged.extend((name.len() as u32).to_le_bytes());
    tagged.extend(name);
    extend(BOOT_LOADER_CONFIG, EventType::EVENT_TAG, contents, &tagged);
}

pub fn measure_load_options(utf16: &[u8]) {
    extend(KERNEL_CONFIG, EventType::IPL, utf16, utf16);
}
