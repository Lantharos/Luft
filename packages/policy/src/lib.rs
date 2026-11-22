mod load;

use luft_variant::Channel;
use serde::{Deserialize, Serialize};
use specta::Type;

pub use load::{IMAGE, LOCAL};

/// The settings an organization decided for its computers. A value left out stays the
/// person's choice; one given is applied by the service that owns the setting, which refuses
/// to change it.
#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case", deny_unknown_fields, default)]
pub struct Policy {
    pub screen_lock: ScreenLockPolicy,
    pub updates: SystemUpdatesPolicy,
    pub firewall: FirewallPolicy,
    pub software: SoftwarePolicy,
    pub developer: DeveloperPolicy,
}

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
}

impl Default for SoftwarePolicy {
    fn default() -> Self {
        Self {
            system_packages: true,
            package_sources: true,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case", deny_unknown_fields, default)]
pub struct DeveloperPolicy {
    pub tools: Option<bool>,
}

/// What a service answers when a call would change a setting the policy decides.
pub const MANAGED: &str = "Your organization manages this setting.";
