use std::collections::HashMap;

use serde::{Deserialize, Serialize};

pub const VERSION: &str = "2.2";
pub const PORT: u16 = 53317;
pub const API: &str = "/api/localsend/v2";

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Scheme {
    Http,
    Https,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Info {
    pub alias: String,
    #[serde(default = "unknown_version")]
    pub version: String,
    #[serde(default)]
    pub device_model: Option<String>,
    #[serde(default)]
    pub device_type: Option<String>,
    #[serde(default)]
    pub fingerprint: String,
    #[serde(default)]
    pub download: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Presence {
    #[serde(flatten)]
    pub info: Info,
    #[serde(default = "default_port")]
    pub port: u16,
    #[serde(default = "default_scheme")]
    pub protocol: Scheme,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub announce: Option<bool>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileDto {
    pub id: String,
    pub file_name: String,
    pub size: u64,
    #[serde(default)]
    pub file_type: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sha256: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub preview: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct Metadata {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub modified: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub accessed: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PrepareUpload {
    pub info: Presence,
    pub files: HashMap<String, FileDto>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Prepared {
    pub session_id: String,
    pub files: HashMap<String, String>,
}

fn unknown_version() -> String {
    "1.0".into()
}

fn default_port() -> u16 {
    PORT
}

fn default_scheme() -> Scheme {
    Scheme::Https
}

impl FileDto {
    pub fn message(files: &HashMap<String, FileDto>) -> Option<&str> {
        let mut only = files.values();
        let file = only.next()?;
        if only.next().is_some() || !file.file_type.starts_with("text/") {
            return None;
        }
        file.preview.as_deref()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_an_announcement_from_the_official_app() {
        let announced: Presence = serde_json::from_str(
            r#"{"alias":"Nice Orange","version":"2.0","deviceModel":"Samsung","deviceType":"mobile",
                "fingerprint":"ABC","port":53317,"protocol":"https","download":true,"announce":true}"#,
        )
        .unwrap();
        assert_eq!(announced.info.alias, "Nice Orange");
        assert_eq!(announced.protocol, Scheme::Https);
        assert_eq!(announced.announce, Some(true));
    }

    #[test]
    fn tells_a_message_from_files() {
        let text = |name: &str, kind: &str, preview: Option<&str>| FileDto {
            id: name.into(),
            file_name: name.into(),
            size: 5,
            file_type: kind.into(),
            sha256: None,
            preview: preview.map(Into::into),
            metadata: None,
        };
        let one = HashMap::from([("a".into(), text("a", "text/plain", Some("hello")))]);
        assert_eq!(FileDto::message(&one), Some("hello"));
        let picture = HashMap::from([("a".into(), text("a", "image/png", Some("x")))]);
        assert_eq!(FileDto::message(&picture), None);
        let two = HashMap::from([
            ("a".into(), text("a", "text/plain", Some("x"))),
            ("b".into(), text("b", "text/plain", Some("y"))),
        ]);
        assert_eq!(FileDto::message(&two), None);
    }
}
