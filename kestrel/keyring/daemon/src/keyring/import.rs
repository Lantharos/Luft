use std::path::{Path, PathBuf};
use std::time::SystemTime;

use luft_keyring_vault::{Contents, Item, LOGIN, Secret};

use super::access::PORTAL_SCHEMA;
use super::formats::{self, OldItem, ReadError};

const CONTENT_TYPE: &str = "xdg:content-type";
const TEXT: &str = "text/plain";
const BLOB: &str = "application/octet-stream";

pub struct Import {
    pub name: String,
    pub path: PathBuf,
    modified: SystemTime,
}

pub struct Imported {
    name: String,
    items: Vec<Item>,
}

pub enum ImportError {
    WrongPassword,
    Unreadable(String),
}

pub fn pending_sources(folder: &Path, contents: &Contents) -> Vec<Import> {
    let mut sources: Vec<Import> = [folder.to_path_buf(), folder.join("v1")]
        .into_iter()
        .flat_map(|directory| {
            std::fs::read_dir(directory)
                .into_iter()
                .flatten()
                .flatten()
                .filter_map(|entry| {
                    let path = entry.path();
                    (path.extension()? == "keyring").then_some(())?;
                    let name = path.file_stem()?.to_str()?.to_owned();
                    let modified = entry.metadata().ok()?.modified().ok()?;
                    Some(Import {
                        name,
                        path,
                        modified,
                    })
                })
        })
        .filter(|source| {
            !contents
                .imported
                .contains(&source.path.display().to_string())
        })
        .collect();
    sources.sort_by_key(|source| source.modified);
    sources
}

pub async fn read_source(source: &Import, password: &[u8]) -> Result<Imported, ImportError> {
    let bytes = tokio::fs::read(&source.path)
        .await
        .map_err(|error| ImportError::Unreadable(error.to_string()))?;
    let password = password.to_vec();
    let items = tokio::task::spawn_blocking(move || formats::read(&bytes, &password))
        .await
        .map_err(|error| ImportError::Unreadable(error.to_string()))?
        .map_err(|error| match error {
            ReadError::WrongPassword => ImportError::WrongPassword,
            ReadError::Damaged(reason) => ImportError::Unreadable(reason.into()),
        })?;
    Ok(Imported {
        name: source.name.clone(),
        items: items.into_iter().map(convert).collect(),
    })
}

fn convert(old: OldItem) -> Item {
    let OldItem {
        label,
        mut attributes,
        secret,
        created,
        modified,
    } = old;
    let content_type = attributes.remove(CONTENT_TYPE).unwrap_or_else(|| {
        if std::str::from_utf8(&secret).is_ok() {
            TEXT
        } else {
            BLOB
        }
        .to_owned()
    });
    let portal_app = attributes
        .get("app_id")
        .filter(|_| is_portal_token(&label, &attributes))
        .cloned();
    if portal_app.is_some() {
        attributes.insert("xdg:schema".to_owned(), PORTAL_SCHEMA.to_owned());
    }
    let mut item = Item::new(label, attributes, Secret::copy_of(&secret), content_type);
    item.created = created;
    item.modified = modified;
    item.unclaimed = portal_app.is_none();
    item.owner = portal_app.map(|app| format!("flatpak:{app}"));
    item
}

fn is_portal_token(label: &str, attributes: &std::collections::BTreeMap<String, String>) -> bool {
    attributes
        .get("xdg:schema")
        .is_some_and(|schema| schema == PORTAL_SCHEMA)
        || (attributes.len() == 1
            && (label.starts_with("Secret Portal token")
                || label.starts_with("Application key for")))
}

impl Imported {
    pub fn merge_into(self, contents: &mut Contents, source: &Import) {
        let existing = contents
            .collections
            .iter()
            .find(|collection| collection.id == self.name || collection.label == self.name)
            .map(|collection| collection.id.clone());
        let collection = match existing {
            Some(id) => id,
            None if self.name == "default" => LOGIN.to_owned(),
            None => contents.create_collection(&self.name),
        };
        for item in self.items {
            contents.store_item(&collection, item, true);
        }
        contents.imported.push(source.path.display().to_string());
    }
}
