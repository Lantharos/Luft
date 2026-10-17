mod detect;
mod facts;
mod names;
mod remove;

use serde::Serialize;

use crate::udisks::{self, snapshot};

pub use facts::Facts;
pub use remove::{Removed, Step, grow, remove};

#[derive(Serialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "kebab-case")]
pub enum Kind {
    Windows,
    Linux,
    OldSystem,
}

#[derive(Serialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    System,
    Reserved,
    Recovery,
    Meet,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Part {
    pub block: String,
    pub device: String,
    #[serde(skip)]
    pub partition_uuid: String,
    pub size: u64,
    pub role: Role,
    pub label: String,
    pub filesystem: String,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Startup {
    #[serde(skip)]
    pub esp: String,
    pub folder: String,
    pub entries: Vec<String>,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct System {
    pub id: String,
    pub kind: Kind,
    pub name: String,
    pub drive: String,
    pub size: u64,
    pub parts: Vec<Part>,
    pub kept: Option<u64>,
    pub startups: Vec<Startup>,
    pub bitlocker: bool,
    pub files: Option<String>,
    pub folder: Option<String>,
}

pub async fn find() -> Result<Vec<System>, String> {
    let facts = Facts::gather().await;
    let snapshot = snapshot::build(&udisks::objects().await?);
    Ok(detect::systems(&snapshot, &facts))
}
