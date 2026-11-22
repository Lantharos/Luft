mod check;
#[cfg(feature = "follow")]
mod follow;
mod keys;
mod load;

use serde::{Deserialize, Serialize};
use specta::Type;

pub use check::check;
#[cfg(feature = "follow")]
pub use follow::Follow;
pub use keys::*;
pub use load::{Decided, Explained, IMAGE, LOCAL};

/// The settings an organization decided for its computers. A value left out stays the
/// person's choice; one given is applied by the service that owns the setting, which refuses
/// to change it.
#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case", deny_unknown_fields, default)]
pub struct Policy {
    pub organization: OrganizationPolicy,
    pub screen_lock: ScreenLockPolicy,
    pub updates: SystemUpdatesPolicy,
    pub firewall: FirewallPolicy,
    pub software: SoftwarePolicy,
    pub developer: DeveloperPolicy,
    pub extensions: ExtensionsPolicy,
    pub encryption: EncryptionPolicy,
    pub accounts: AccountsPolicy,
    pub remote_login: RemoteLoginPolicy,
    pub nearby_sharing: NearbySharingPolicy,
    pub crash_reports: CrashReportsPolicy,
}

/// What a service answers when a call would change a setting the policy decides.
pub const MANAGED: &str = "Your organization manages this setting.";
