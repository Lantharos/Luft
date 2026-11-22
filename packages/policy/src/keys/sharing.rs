use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case", deny_unknown_fields, default)]
pub struct NearbySharingPolicy {
    pub visible_to: Option<Visibility>,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case")]
pub enum Visibility {
    NoOne,
    YourDevices,
    Everyone,
}

impl Visibility {
    pub fn name(self) -> &'static str {
        match self {
            Self::NoOne => "no-one",
            Self::YourDevices => "your-devices",
            Self::Everyone => "everyone",
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case", deny_unknown_fields, default)]
pub struct CrashReportsPolicy {
    pub send: Option<CrashReportSending>,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "lowercase")]
pub enum CrashReportSending {
    Always,
    Never,
}
