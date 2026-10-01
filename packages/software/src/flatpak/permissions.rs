use serde::Serialize;

use super::{Installation, query};

#[derive(Serialize, Clone, Default, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Permissions {
    pub shared: Vec<String>,
    pub sockets: Vec<String>,
    pub devices: Vec<String>,
    pub filesystems: Vec<String>,
    pub session_bus: Vec<String>,
    pub system_bus: Vec<String>,
}

impl Permissions {
    pub fn parse(keyfile: &str) -> Self {
        let mut permissions = Self::default();
        let mut group = "";
        for line in keyfile.lines().map(str::trim) {
            if let Some(name) = line
                .strip_prefix('[')
                .and_then(|line| line.strip_suffix(']'))
            {
                group = name;
                continue;
            }
            let Some((key, value)) = line.split_once('=') else {
                continue;
            };
            let list = || {
                value
                    .split(';')
                    .filter(|item| !item.is_empty())
                    .map(str::to_owned)
                    .collect()
            };
            match (group, key) {
                ("Context", "shared") => permissions.shared = list(),
                ("Context", "sockets") => permissions.sockets = list(),
                ("Context", "devices") => permissions.devices = list(),
                ("Context", "filesystems") => permissions.filesystems = list(),
                ("Session Bus Policy", name) if value != "none" => {
                    permissions.session_bus.push(name.to_owned())
                }
                ("System Bus Policy", name) if value != "none" => {
                    permissions.system_bus.push(name.to_owned())
                }
                _ => {}
            }
        }
        permissions
    }
}

pub fn permissions(installation: Installation, reference: &str) -> Result<Permissions, String> {
    let keyfile = query(installation, &["info", "--show-permissions", reference])?;
    Ok(Permissions::parse(&keyfile))
}
