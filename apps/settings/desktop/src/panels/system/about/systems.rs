use luft_disks::systems::{self, Kind, Role};
use serde::{Deserialize, Serialize};

use super::launch_disks;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OtherSystem {
    id: String,
    kind: Kind,
    name: String,
    size: u64,
}

#[derive(Deserialize)]
pub struct Removal {
    id: String,
}

pub fn list() -> Result<Vec<OtherSystem>, String> {
    Ok(systems::find()?
        .into_iter()
        .filter(|system| {
            system.kind == Kind::OldSystem
                || system.parts.iter().any(|part| part.role == Role::System)
        })
        .map(|system| OtherSystem {
            id: system.id,
            kind: system.kind,
            name: system.name,
            size: system.size,
        })
        .collect())
}

pub fn remove(Removal { id }: Removal) -> Result<(), String> {
    launch_disks(&format!("disks-system://{id}"))
}
