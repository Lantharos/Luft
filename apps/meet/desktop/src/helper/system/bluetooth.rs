use std::path::{Path, PathBuf};

use super::registry::Protected;

const PARAMETERS: &str = r"SYSTEM\CurrentControlSet\Services\BTHPORT\Parameters";
const LOW_ENERGY_DEVICES: &str = r"SYSTEM\CurrentControlSet\Enum\BTHLE";

fn is_address(name: &str) -> bool {
    name.len() == 12 && name.chars().all(|character| character.is_ascii_hexdigit())
}

pub fn paired() -> u32 {
    let Some(keys) = Protected::open(PARAMETERS).and_then(|parameters| parameters.child("Keys"))
    else {
        return 0;
    };
    keys.subkeys()
        .iter()
        .filter(|adapter| is_address(adapter))
        .filter_map(|adapter| keys.child(adapter))
        .map(|adapter| {
            adapter
                .values()
                .into_iter()
                .chain(adapter.subkeys())
                .filter(|device| is_address(device))
                .count() as u32
        })
        .sum()
}

pub struct Saved {
    pub keys: PathBuf,
    pub names: Option<PathBuf>,
}

pub fn save(into: &Path) -> Result<Saved, String> {
    std::fs::create_dir_all(into).map_err(|error| error.to_string())?;
    let parameters =
        Protected::open(PARAMETERS).ok_or("Windows' Bluetooth settings couldn't be opened")?;
    let keys = into.join("keys");
    parameters.save(&keys)?;
    let names = into.join("names");
    let names = Protected::open(LOW_ENERGY_DEVICES)
        .is_some_and(|devices| devices.save(&names).is_ok())
        .then_some(names);
    Ok(Saved { keys, names })
}
