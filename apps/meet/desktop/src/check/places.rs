use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub enum PlaceKind {
    Windows,
    Free,
    Whole,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub struct Contents {
    pub label: Option<String>,
    pub letter: Option<String>,
    pub filesystem: Option<String>,
    pub size: u64,
    pub bitlocker: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub struct Drive {
    pub name: String,
    pub size: u64,
    pub windows: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub struct Place {
    pub id: String,
    pub kind: PlaceKind,
    pub drive: Drive,
    pub free: u64,
    pub smallest: u64,
    pub most: u64,
    pub contents: Vec<Contents>,
}
