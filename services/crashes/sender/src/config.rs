//! Where reports go: Luft's crash reports inbox on Pult, named by the
//! environment and the client key the image ships with. While either is
//! empty, nothing is sent and nobody is asked.

use std::path::PathBuf;

use luft_identity::program;
use serde::Deserialize;

const CONFIG: &str = "/usr/share/luft/crash-reports.toml";
const DEVELOPMENT_CONFIG: &str = "LUFT_CRASH_REPORTS_CONFIG";
const PULT: &str = "https://app.pult.sh";
const INBOX: &str = "crashes";

#[derive(Deserialize, Default)]
struct File {
    #[serde(default)]
    environment: String,
    #[serde(default)]
    key: String,
    server: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Inbox {
    pub address: String,
    pub key: String,
}

/// The image's file, or for a development build, the one a test session
/// names.
fn path() -> PathBuf {
    std::env::var_os(DEVELOPMENT_CONFIG)
        .filter(|_| program::is_development_build())
        .map_or_else(|| CONFIG.into(), PathBuf::from)
}

pub fn inbox() -> Option<Inbox> {
    let file: File = toml::from_str(&std::fs::read_to_string(path()).ok()?).ok()?;
    let (environment, key) = (file.environment.trim(), file.key.trim());
    if environment.is_empty() || key.is_empty() {
        return None;
    }
    let server = file.server.as_deref().unwrap_or(PULT).trim_end_matches('/');
    Some(Inbox {
        address: format!("{server}/api/clients/{environment}/{INBOX}"),
        key: key.to_owned(),
    })
}
