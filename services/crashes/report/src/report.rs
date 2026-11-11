use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Kind {
    Signal,
    Panic,
    Script,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "lowercase")]
pub enum Vendor {
    Intel,
    Amd,
    Nvidia,
    Other,
}

/// One frame of the stack, by the module it is in. `function` is there only
/// when the module names it without debug symbols.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Frame {
    pub module: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub build: Option<String>,
    pub offset: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub function: Option<String>,
}

/// A crash of one of Luft's programs, exactly as it is sent, apart from the
/// install it is sent from. The collector leaves `image` and `channel` to
/// the session, which asks the updater which version is running.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Report {
    pub signature: String,
    pub program: String,
    pub summary: String,
    pub kind: Kind,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub signal: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub location: Option<String>,
    pub image: String,
    pub channel: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub build: Option<String>,
    pub graphics: Vec<Vendor>,
    pub nvidia_driver: bool,
    #[serde(skip_serializing_if = "Vec::is_empty", default)]
    pub script: Vec<String>,
    pub frames: Vec<Frame>,
}

/// A report and when the crash happened, in seconds since the epoch.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Crash {
    pub at: u64,
    pub report: Report,
}

/// The body of the post a report is sent in.
#[derive(Serialize, Clone, Debug)]
pub struct Body<'a> {
    pub data: Sent<'a>,
}

/// What a report is sent as: the report and the install it comes from.
#[derive(Serialize, Clone, Debug)]
pub struct Sent<'a> {
    #[serde(flatten)]
    pub report: &'a Report,
    pub install: &'a str,
}
