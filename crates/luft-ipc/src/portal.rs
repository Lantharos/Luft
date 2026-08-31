use serde::{Deserialize, Serialize};

use crate::OutputSummary;

pub const SHELL_CAPABILITY_ENV: &str = "LUFT_SHELL_IPC_CAPABILITY";
pub const PORTAL_CAPABILITY_ENV: &str = "LUFT_PORTAL_IPC_CAPABILITY";

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[serde(transparent)]
pub struct CaptureRequestId(pub u64);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum CaptureKind {
    Screenshot,
    ScreenCast,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CaptureConsentRequest {
    pub id: CaptureRequestId,
    pub kind: CaptureKind,
    pub app_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CaptureConsentPrompt {
    pub id: CaptureRequestId,
    pub kind: CaptureKind,
    pub app_id: Option<String>,
    pub outputs: Vec<OutputSummary>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "kebab-case")]
pub enum CaptureConsentDecision {
    Allow { output: String },
    Deny,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "kebab-case")]
pub enum CaptureConsentStatus {
    Pending,
    Granted { output: String },
    Denied,
    TimedOut,
}
