use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case", deny_unknown_fields, default)]
pub struct OrganizationPolicy {
    pub name: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case", deny_unknown_fields, default)]
pub struct AccountsPolicy {
    pub add: bool,
    pub administrators: bool,
    pub automatic_sign_in: bool,
}

impl Default for AccountsPolicy {
    fn default() -> Self {
        Self {
            add: true,
            administrators: true,
            automatic_sign_in: true,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case", deny_unknown_fields, default)]
pub struct RemoteLoginPolicy {
    pub allowed: bool,
    pub passwords: bool,
}

impl Default for RemoteLoginPolicy {
    fn default() -> Self {
        Self {
            allowed: true,
            passwords: true,
        }
    }
}
