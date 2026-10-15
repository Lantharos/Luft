use serde::{Deserialize, Serialize};

pub const FILE: &str = "meet.json";
pub const START_LABEL: &str = "LUFT-START";
pub const LIVE_LABEL: &str = "Luft";
pub const BOX_LABEL: &str = "Moving box";

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Intent {
    Try,
    Install,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub struct Room {
    pub offset: u64,
    pub size: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Handoff {
    pub intent: Intent,
    pub start: String,
    pub live: String,
    #[serde(default)]
    pub moving_box: Option<String>,
    #[serde(default)]
    pub room: Option<Room>,
    pub boot_entry: u16,
}

impl Handoff {
    pub fn parse(text: &str) -> Result<Self, String> {
        let mut handoff: Self = serde_json::from_str(text).map_err(|error| error.to_string())?;
        handoff.start = partition_guid(&handoff.start);
        handoff.live = partition_guid(&handoff.live);
        handoff.moving_box = handoff.moving_box.as_deref().map(partition_guid);
        Ok(handoff)
    }

    pub fn to_json(&self) -> String {
        serde_json::to_string_pretty(self).expect("a hand-off always serializes")
    }

    pub fn partitions(&self) -> impl Iterator<Item = &str> {
        [
            Some(self.start.as_str()),
            Some(self.live.as_str()),
            self.moving_box.as_deref(),
        ]
        .into_iter()
        .flatten()
    }
}

pub fn partition_guid(text: &str) -> String {
    text.trim()
        .trim_start_matches('{')
        .trim_end_matches('}')
        .to_ascii_lowercase()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn windows_guids_match_the_ones_linux_reports() {
        let handoff = Handoff::parse(
            r#"{"intent":"install","start":"{0A1B2C3D-0000-4000-8000-00000000AAAA}",
                "live":"0a1b2c3d-0000-4000-8000-00000000bbbb","movingBox":null,
                "room":{"offset":1048576,"size":68719476736},"bootEntry":7}"#,
        )
        .unwrap();
        assert_eq!(handoff.start, "0a1b2c3d-0000-4000-8000-00000000aaaa");
        assert_eq!(handoff.partitions().count(), 2);
        assert_eq!(Handoff::parse(&handoff.to_json()).unwrap(), handoff);
    }
}
