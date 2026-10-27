use serde::{Deserialize, Serialize};
use specta::Type;

pub const MANIFEST: &str = "box.json";
pub const FILES: &str = "files";
pub const WIFI: &str = "wifi";
pub const PICTURE: &str = "account-picture";
pub const WALLPAPER: &str = "wallpaper";
pub const BLUETOOTH_KEYS: &str = "bluetooth/keys";
pub const BLUETOOTH_NAMES: &str = "bluetooth/names";

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Hash, Type)]
#[serde(rename_all = "lowercase")]
pub enum FolderKind {
    Desktop,
    Documents,
    Downloads,
    Music,
    Pictures,
    Videos,
}

impl FolderKind {
    pub const ALL: [Self; 6] = [
        Self::Desktop,
        Self::Documents,
        Self::Downloads,
        Self::Music,
        Self::Pictures,
        Self::Videos,
    ];

    pub fn name(self) -> &'static str {
        match self {
            Self::Desktop => "Desktop",
            Self::Documents => "Documents",
            Self::Downloads => "Downloads",
            Self::Music => "Music",
            Self::Pictures => "Pictures",
            Self::Videos => "Videos",
        }
    }

    pub fn in_box(self) -> String {
        format!("{FILES}/{}", self.name())
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Folder {
    pub kind: FolderKind,
    pub files: u64,
    pub bytes: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Account {
    pub full_name: String,
    pub user_name: String,
    #[serde(default)]
    pub picture: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Bluetooth {
    pub devices: u32,
    pub keys: String,
    #[serde(default)]
    pub names: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Manifest {
    pub account: Option<Account>,
    pub wallpaper: Option<String>,
    pub wifi: Vec<String>,
    pub bluetooth: Option<Bluetooth>,
    pub folders: Vec<Folder>,
}

impl Manifest {
    pub fn parse(text: &str) -> Result<Self, String> {
        let manifest: Self = serde_json::from_str(text).map_err(|error| error.to_string())?;
        manifest.check()?;
        Ok(manifest)
    }

    pub fn to_json(&self) -> String {
        serde_json::to_string_pretty(self).expect("a manifest always serializes")
    }

    pub fn bytes(&self) -> u64 {
        self.folders.iter().map(|folder| folder.bytes).sum()
    }

    fn check(&self) -> Result<(), String> {
        let named = self
            .account
            .iter()
            .filter_map(|account| account.picture.as_deref())
            .chain(self.wallpaper.as_deref())
            .chain(self.wifi.iter().map(String::as_str))
            .chain(
                self.bluetooth
                    .iter()
                    .flat_map(|bluetooth| {
                        [Some(bluetooth.keys.as_str()), bluetooth.names.as_deref()]
                    })
                    .flatten(),
            );
        for path in named {
            if !inside_box(path) {
                return Err(format!("{path} isn't a file in the moving box"));
            }
        }
        Ok(())
    }
}

fn inside_box(path: &str) -> bool {
    !path.is_empty()
        && !path.starts_with(['/', '\\'])
        && path
            .split(['/', '\\'])
            .all(|part| !part.is_empty() && part != "." && part != ".." && !part.contains(':'))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_box_only_points_at_its_own_files() {
        let manifest = Manifest {
            wallpaper: Some("wallpaper.jpg".into()),
            wifi: vec!["wifi/Home.xml".into()],
            folders: vec![Folder {
                kind: FolderKind::Pictures,
                files: 2,
                bytes: 3_000,
            }],
            ..Manifest::default()
        };
        assert_eq!(Manifest::parse(&manifest.to_json()).unwrap(), manifest);
        for escape in [
            "../etc/shadow",
            "/etc/shadow",
            "C:\\Windows",
            "wifi/../../x",
            "",
        ] {
            let bad = Manifest {
                wallpaper: Some(escape.into()),
                ..Manifest::default()
            };
            assert!(Manifest::parse(&bad.to_json()).is_err(), "{escape}");
        }
    }
}
