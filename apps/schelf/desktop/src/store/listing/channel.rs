use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;

use crate::store::device;

pub const STABLE: &str = "stable";
const PREVIEWS: [&str; 2] = ["beta", "nightly"];

fn path() -> PathBuf {
    device::folder().join("channels.json")
}

fn chosen() -> BTreeMap<String, String> {
    fs::read(path())
        .ok()
        .and_then(|bytes| serde_json::from_slice(&bytes).ok())
        .unwrap_or_default()
}

/// The channel you follow for `id`: stable unless you chose another on its page.
pub fn followed(id: &str) -> String {
    chosen()
        .remove(&id.to_lowercase())
        .unwrap_or_else(|| STABLE.to_owned())
}

pub fn follow(id: &str, channel: &str) -> Result<(), String> {
    if channel != STABLE && !PREVIEWS.contains(&channel) {
        return Err(format!("Schelf doesn't offer the {channel} channel."));
    }
    let mut channels = chosen();
    if channel == STABLE {
        channels.remove(&id.to_lowercase());
    } else {
        channels.insert(id.to_lowercase(), channel.to_owned());
    }
    let text = serde_json::to_vec_pretty(&channels).map_err(|error| error.to_string())?;
    luft_app::files::replace(&path(), &text).map_err(|error| error.to_string())
}

/// The channels a page offers, stable first, out of the ones an app ships on.
pub fn offered<'a>(shipping: impl IntoIterator<Item = &'a str>) -> Vec<String> {
    let shipping: Vec<&str> = shipping.into_iter().collect();
    std::iter::once(STABLE)
        .chain(
            PREVIEWS
                .into_iter()
                .filter(|channel| shipping.contains(channel)),
        )
        .map(str::to_owned)
        .collect()
}
