use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;
use std::sync::OnceLock;

use luft_app::block_on;
use luft_software::system::image::Deployments;

use crate::store::device;

pub const STABLE: &str = "stable";
const PREVIEWS: [&str; 2] = ["beta", "nightly"];
/// The choice on a page that leaves the channel to the system.
const WITH_SYSTEM: &str = "system";
const OWN_IDS: &str = "com.lantharos.";

fn path() -> PathBuf {
    device::folder().join("channels.json")
}

fn chosen() -> BTreeMap<String, String> {
    fs::read(path())
        .ok()
        .and_then(|bytes| serde_json::from_slice(&bytes).ok())
        .unwrap_or_default()
}

fn is_own(id: &str) -> bool {
    id.to_lowercase().starts_with(OWN_IDS)
}

/// The release channel of the running system. Read once per process, since
/// moving a system to another channel takes a restart to finish.
fn system() -> Option<&'static str> {
    static SYSTEM: OnceLock<Option<&'static str>> = OnceLock::new();
    *SYSTEM.get_or_init(|| block_on(Deployments::load()).ok()?.channel())
}

/// The channel an app's updates come from, and how it was decided.
pub struct Following {
    pub channel: String,
    pub chosen: bool,
    system: Option<&'static str>,
}

impl Following {
    /// You chose a channel on the page, Luft's own apps go with the system
    /// they're on, and everything else is on stable.
    pub(super) fn decide(
        id: &str,
        chosen: Option<String>,
        system: impl FnOnce() -> Option<&'static str>,
    ) -> Self {
        let system = if is_own(id) { system() } else { None };
        Self {
            chosen: chosen.is_some(),
            channel: chosen.unwrap_or_else(|| system.unwrap_or(STABLE).to_owned()),
            system,
        }
    }

    /// The channels whose releases count. Going with a nightly system also
    /// takes stable ones, so an app without a nightly release yet still
    /// installs and a promoted release is never skipped.
    pub fn sources(&self) -> Vec<&str> {
        let channel = self.channel.as_str();
        if self.chosen || channel == STABLE {
            vec![channel]
        } else {
            vec![channel, STABLE]
        }
    }

    /// What the page shows as picked.
    pub fn choice(&self) -> &str {
        match self.system {
            Some(_) if !self.chosen => WITH_SYSTEM,
            _ => &self.channel,
        }
    }

    /// The choices on the page, out of the channels the app ships on.
    pub fn choices(&self, mut channels: Vec<String>) -> Vec<String> {
        if self.chosen && !channels.contains(&self.channel) {
            channels.push(self.channel.clone());
        }
        if self
            .system
            .is_some_and(|system| system != STABLE || channels.len() > 1)
        {
            channels.insert(0, WITH_SYSTEM.to_owned());
        }
        channels
    }
}

pub fn following(id: &str) -> Following {
    Following::decide(id, chosen().remove(&id.to_lowercase()), system)
}

/// Whether one of Luft's own items follows a channel other than stable.
pub fn follows_preview(id: &str) -> bool {
    is_own(id) && following(id).channel != STABLE
}

/// Stable is the default of other people's apps, so only choosing it for
/// Luft's own needs remembering.
pub(super) fn remember(channels: &mut BTreeMap<String, String>, id: &str, channel: &str) {
    if channel == WITH_SYSTEM || (channel == STABLE && !is_own(id)) {
        channels.remove(&id.to_lowercase());
    } else {
        channels.insert(id.to_lowercase(), channel.to_owned());
    }
}

pub fn follow(id: &str, channel: &str) -> Result<(), String> {
    if channel != WITH_SYSTEM && channel != STABLE && !PREVIEWS.contains(&channel) {
        return Err(format!("Schelf doesn't offer the {channel} channel."));
    }
    let mut channels = chosen();
    remember(&mut channels, id, channel);
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
