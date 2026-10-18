use serde::{Deserialize, Serialize};

use crate::regional::Hints;

pub const FILE: &str = "meet.json";
pub const START_LABEL: &str = "LUFT-START";
pub const LIVE_LABEL: &str = "Luft";
pub const BOX_LABEL: &str = "Moving box";

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Intent {
    Try,
    Install,
    Replace,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub struct Room {
    pub offset: u64,
    pub size: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Partitions {
    pub start: String,
    pub live: String,
    #[serde(default)]
    pub moving_box: Option<String>,
    #[serde(default)]
    pub room: Option<Room>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Folder {
    pub esp: String,
    pub loader: String,
    pub filesystem: String,
    pub folder: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(untagged)]
pub enum Made {
    Partitions(Partitions),
    Folder(Folder),
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Handoff {
    pub intent: Intent,
    pub boot_entry: u16,
    #[serde(flatten)]
    pub made: Made,
    #[serde(default, skip_serializing_if = "Hints::is_empty")]
    pub hints: Hints,
}

impl Handoff {
    pub fn parse(text: &str) -> Result<Self, String> {
        let mut handoff: Self = serde_json::from_str(text).map_err(|error| error.to_string())?;
        match &mut handoff.made {
            Made::Partitions(partitions) => {
                partitions.start = partition_guid(&partitions.start);
                partitions.live = partition_guid(&partitions.live);
                partitions.moving_box = partitions.moving_box.as_deref().map(partition_guid);
            }
            Made::Folder(folder) => folder.esp = partition_guid(&folder.esp),
        }
        Ok(handoff)
    }

    pub fn to_json(&self) -> String {
        serde_json::to_string_pretty(self).expect("a hand-off always serializes")
    }

    pub fn made_partitions(&self) -> Option<&Partitions> {
        match &self.made {
            Made::Partitions(partitions) => Some(partitions),
            Made::Folder(_) => None,
        }
    }

    pub fn partitions_mut(&mut self) -> Option<&mut Partitions> {
        match &mut self.made {
            Made::Partitions(partitions) => Some(partitions),
            Made::Folder(_) => None,
        }
    }

    pub fn folder(&self) -> Option<&Folder> {
        match &self.made {
            Made::Folder(folder) => Some(folder),
            Made::Partitions(_) => None,
        }
    }

    pub fn moving_box(&self) -> Option<&str> {
        self.made_partitions()?.moving_box.as_deref()
    }

    pub fn room(&self) -> Option<Room> {
        self.made_partitions()?.room
    }

    pub fn partitions(&self) -> impl Iterator<Item = &str> {
        let made = self.made_partitions();
        [
            made.map(|made| made.start.as_str()),
            made.map(|made| made.live.as_str()),
            made.and_then(|made| made.moving_box.as_deref()),
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
                "room":{"offset":1048576,"size":68719476736},"bootEntry":7,
                "hints":{"timezone":"Europe/Belgrade","keyboards":[{"layout":"rs","variant":"latin"}]}}"#,
        )
        .unwrap();
        let made = handoff.made_partitions().unwrap();
        assert_eq!(made.start, "0a1b2c3d-0000-4000-8000-00000000aaaa");
        assert_eq!(handoff.partitions().count(), 2);
        assert_eq!(handoff.hints.timezone.as_deref(), Some("Europe/Belgrade"));
        assert_eq!(handoff.hints.keyboards[0].variant, "latin");
        assert_eq!(Handoff::parse(&handoff.to_json()).unwrap(), handoff);
    }

    #[test]
    fn a_folder_on_linux_makes_no_partitions_of_its_own() {
        let handoff = Handoff::parse(
            r#"{"intent":"replace","bootEntry":3,"esp":"{0A1B2C3D-0000-4000-8000-00000000CCCC}",
                "loader":"EFI/luft-meet","filesystem":"5d3c0b62-0a3e-4c1e-9a52-7d2f1f0e8a11",
                "folder":"/home/.luft-meet"}"#,
        )
        .unwrap();
        assert_eq!(handoff.intent, Intent::Replace);
        assert_eq!(handoff.partitions().count(), 0);
        assert_eq!(
            handoff.folder().unwrap().esp,
            "0a1b2c3d-0000-4000-8000-00000000cccc"
        );
        assert_eq!(Handoff::parse(&handoff.to_json()).unwrap(), handoff);
    }
}
