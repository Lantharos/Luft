use luft_variant::Channel;
use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case", deny_unknown_fields, default)]
pub struct ScreenLockPolicy {
    pub enabled: Option<bool>,
    pub screen_off: Option<u32>,
    pub lock_after: Option<u32>,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case", deny_unknown_fields, default)]
pub struct SystemUpdatesPolicy {
    pub schedule: Option<UpdateSchedule>,
    pub download: Option<bool>,
    pub channel: Option<Channel>,
    pub image: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "lowercase")]
pub enum UpdateSchedule {
    Daily,
    Weekly,
    Never,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case", deny_unknown_fields, default)]
pub struct FirewallPolicy {
    pub home_networks: bool,
    pub public_access: bool,
    pub open_ports: bool,
}

impl Default for FirewallPolicy {
    fn default() -> Self {
        Self {
            home_networks: true,
            public_access: true,
            open_ports: true,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case", deny_unknown_fields, default)]
pub struct SoftwarePolicy {
    pub system_packages: bool,
    pub package_sources: bool,
    /// The only places apps may come from, or all of them when left out.
    pub app_sources: Option<Vec<AppSource>>,
}

impl Default for SoftwarePolicy {
    fn default() -> Self {
        Self {
            system_packages: true,
            package_sources: true,
            app_sources: None,
        }
    }
}

impl SoftwarePolicy {
    pub fn allows(&self, source: AppSource) -> bool {
        self.app_sources
            .as_ref()
            .is_none_or(|sources| sources.contains(&source))
    }
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case")]
pub enum AppSource {
    SchelfStore,
    Flathub,
    Appimage,
    Ubuntu,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case", deny_unknown_fields, default)]
pub struct DeveloperPolicy {
    pub tools: Option<bool>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case", deny_unknown_fields, default)]
pub struct ExtensionsPolicy {
    pub unreviewed: bool,
}

impl Default for ExtensionsPolicy {
    fn default() -> Self {
        Self { unreviewed: true }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case", deny_unknown_fields, default)]
pub struct EncryptionPolicy {
    pub required: bool,
}
