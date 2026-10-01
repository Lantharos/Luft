use std::collections::BTreeMap;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

use crate::Secret;

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct Contents {
    #[serde(default)]
    pub collections: Vec<Collection>,
    #[serde(default)]
    pub aliases: BTreeMap<String, String>,
    #[serde(default)]
    pub rules: Vec<AccessRule>,
    #[serde(default)]
    pub apps: BTreeMap<String, BTreeMap<String, Secret>>,
    #[serde(default)]
    pub ssh: Vec<SshKey>,
    #[serde(default)]
    pub preferences: Preferences,
    #[serde(default)]
    pub imported: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Collection {
    pub id: String,
    pub label: String,
    pub created: u64,
    pub modified: u64,
    pub next_item: u64,
    pub items: Vec<Item>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Item {
    pub id: u64,
    pub label: String,
    pub attributes: BTreeMap<String, String>,
    pub secret: Secret,
    pub content_type: String,
    pub created: u64,
    pub modified: u64,
    #[serde(default)]
    pub owner: Option<String>,
    #[serde(default)]
    pub unclaimed: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AccessRule {
    pub app: String,
    pub collection: String,
    pub item: u64,
    pub allowed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SshKey {
    pub comment: String,
    pub public: Vec<u8>,
    pub private: SshPrivate,
    pub confirm: bool,
    pub added: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SshPrivate {
    Software(Secret),
    Chip {
        public: Vec<u8>,
        private: Vec<u8>,
        auth: Secret,
    },
}

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct Preferences {
    #[serde(default)]
    pub lock_with_screen: bool,
}

impl Collection {
    pub fn new(id: &str, label: &str) -> Self {
        let created = now();
        Self {
            id: id.to_owned(),
            label: label.to_owned(),
            created,
            modified: created,
            next_item: 1,
            items: Vec::new(),
        }
    }

    pub fn item(&self, id: u64) -> Option<&Item> {
        self.items.iter().find(|item| item.id == id)
    }

    pub fn item_mut(&mut self, id: u64) -> Option<&mut Item> {
        self.items.iter_mut().find(|item| item.id == id)
    }

    pub fn add(&mut self, mut item: Item) -> u64 {
        item.id = self.next_item;
        self.next_item += 1;
        self.modified = now();
        self.items.push(item);
        self.next_item - 1
    }
}

impl Item {
    pub fn new(
        label: String,
        attributes: BTreeMap<String, String>,
        secret: Secret,
        content_type: String,
    ) -> Self {
        let created = now();
        Self {
            id: 0,
            label,
            attributes,
            secret,
            content_type,
            created,
            modified: created,
            owner: None,
            unclaimed: false,
        }
    }

    pub fn matches(&self, query: &BTreeMap<String, String>) -> bool {
        query
            .iter()
            .all(|(name, value)| self.attributes.get(name) == Some(value))
    }
}

pub fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |elapsed| elapsed.as_secs())
}
