use std::fs;
use std::path::Path;
use std::str::FromStr;

use luft_keyring_wire::Chip as ChipState;
use tss_esapi::constants::PropertyTag;
use tss_esapi::handles::KeyHandle;
use tss_esapi::interface_types::algorithm::HashingAlgorithm;
use tss_esapi::interface_types::resource_handles::Hierarchy;
use tss_esapi::structures::{PcrSelectionListBuilder, PcrSlot};
use tss_esapi::{Context, TctiNameConf};

use super::templates;

const STORAGE_HIERARCHY_ENABLED: u32 = 1 << 1;

pub fn open(tcti: &str) -> Result<(Context, KeyHandle), ChipState> {
    if let Some(device) = tcti.strip_prefix("device:") {
        check_device(Path::new(device))?;
    }
    let conf = TctiNameConf::from_str(tcti).map_err(unavailable)?;
    let mut context = Context::new(conf).map_err(unavailable)?;
    let (_, tested) = context.get_test_result().map_err(unavailable)?;
    if tested.is_err() {
        return Err(ChipState::Failing);
    }
    let startup = context
        .get_tpm_property(PropertyTag::StartupClear)
        .map_err(unavailable)?
        .unwrap_or(0);
    if startup & STORAGE_HIERARCHY_ENABLED == 0 {
        return Err(ChipState::Disabled);
    }
    let selection = PcrSelectionListBuilder::new()
        .with_selection(HashingAlgorithm::Sha256, &[PcrSlot::Slot7])
        .build()
        .map_err(unavailable)?;
    let (_, read, digests) = context.pcr_read(selection).map_err(unavailable)?;
    if read.is_empty() || digests.is_empty() {
        return Err(ChipState::NoPcrBank);
    }
    let public = templates::storage_key().map_err(unavailable)?;
    let parent = context
        .execute_with_nullauth_session(|context| {
            context.create_primary(Hierarchy::Owner, public, None, None, None, None)
        })
        .map_err(unavailable)?
        .key_handle;
    Ok((context, parent))
}

fn check_device(device: &Path) -> Result<(), ChipState> {
    if device.exists() {
        return Ok(());
    }
    let version = fs::read_to_string("/sys/class/tpm/tpm0/tpm_version_major").unwrap_or_default();
    Err(if version.trim() == "1" {
        ChipState::Unsupported
    } else {
        ChipState::Missing
    })
}

fn unavailable(error: tss_esapi::Error) -> ChipState {
    ChipState::Unavailable(error.to_string())
}
