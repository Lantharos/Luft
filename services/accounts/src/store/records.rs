use std::collections::BTreeMap;
use std::fs;
use std::io::ErrorKind;
use std::path::PathBuf;

use anyhow::{Context, Result};
use luft_accounts::types::{Account, Conflict, Provider, Service, Standing};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Record {
    pub id: String,
    pub provider: Provider,
    pub name: String,
    pub user: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub server: Option<String>,
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub options: BTreeMap<String, String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub kept: Vec<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub skipped: Vec<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub conflicts: Vec<Conflict>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sign_in_again: Option<String>,
}

impl Record {
    pub fn account(&self) -> Account {
        Account {
            id: self.id.clone(),
            provider: self.provider,
            name: self.name.clone(),
            user: self.user.clone(),
            server: self.server.clone(),
            services: vec![Service::Files],
            standing: match &self.sign_in_again {
                Some(reason) => Standing::SignInAgain {
                    reason: reason.clone(),
                },
                None => Standing::Ready,
            },
        }
    }
}

pub struct Records {
    path: PathBuf,
    all: Vec<Record>,
}

impl Records {
    pub fn load(path: PathBuf) -> Result<Self> {
        let all = match fs::read(&path) {
            Ok(bytes) => serde_json::from_slice(&bytes).context("The account list is damaged")?,
            Err(error) if error.kind() == ErrorKind::NotFound => Vec::new(),
            Err(error) => return Err(error.into()),
        };
        Ok(Self { path, all })
    }

    pub fn all(&self) -> &[Record] {
        &self.all
    }

    pub fn get(&self, id: &str) -> Option<&Record> {
        self.all.iter().find(|record| record.id == id)
    }

    pub fn edit<T>(&mut self, id: &str, change: impl FnOnce(&mut Record) -> T) -> Result<T> {
        let record = self
            .all
            .iter_mut()
            .find(|record| record.id == id)
            .context("That account isn't here anymore")?;
        let result = change(record);
        self.save()?;
        Ok(result)
    }

    pub fn add(&mut self, record: Record) -> Result<()> {
        self.all.push(record);
        self.save()
    }

    pub fn remove(&mut self, id: &str) -> Result<Option<Record>> {
        let Some(index) = self.all.iter().position(|record| record.id == id) else {
            return Ok(None);
        };
        let removed = self.all.remove(index);
        self.save()?;
        Ok(Some(removed))
    }

    pub fn unique_name(&self, wanted: &str, except: Option<&str>) -> String {
        let taken = |name: &str| {
            self.all.iter().any(|record| {
                Some(record.id.as_str()) != except && record.name.eq_ignore_ascii_case(name)
            })
        };
        let base = folder_name(wanted);
        (1..)
            .map(|number| match number {
                1 => base.clone(),
                number => format!("{base} {number}"),
            })
            .find(|name| !taken(name))
            .expect("some number is free")
    }

    fn save(&self) -> Result<()> {
        let folder = self
            .path
            .parent()
            .context("The account list has no folder")?;
        fs::create_dir_all(folder)?;
        let temporary = self.path.with_extension("json.new");
        fs::write(&temporary, serde_json::to_vec_pretty(&self.all)?)?;
        fs::rename(&temporary, &self.path)?;
        Ok(())
    }
}

fn folder_name(wanted: &str) -> String {
    let cleaned: String = wanted
        .trim()
        .chars()
        .map(|character| {
            if character == '/' || character.is_control() {
                ' '
            } else {
                character
            }
        })
        .collect();
    let cleaned = cleaned.trim().trim_start_matches('.').trim();
    if cleaned.is_empty() {
        "Cloud".to_owned()
    } else {
        cleaned.to_owned()
    }
}

#[cfg(test)]
mod tests {
    use super::folder_name;

    #[test]
    fn folder_names_stay_inside_the_cloud_folder() {
        assert_eq!(folder_name("Work/Personal"), "Work Personal");
        assert_eq!(folder_name(".."), "Cloud");
        assert_eq!(folder_name("  OneDrive  "), "OneDrive");
        assert_eq!(folder_name(".hidden"), "hidden");
    }
}
