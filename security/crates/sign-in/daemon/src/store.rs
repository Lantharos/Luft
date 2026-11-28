use std::fs::{self, DirBuilder, File, OpenOptions};
use std::io::{self, ErrorKind, Write};
use std::os::unix::fs::{DirBuilderExt, OpenOptionsExt};
use std::path::{Path, PathBuf};

use portguard::sign_in::{Enrolled, SignInDevices};
use serde::{Deserialize, Serialize};

use crate::bytes;
use crate::fido::{Algorithm, Credential};

const STATE: &str = "/var/lib/luft-sign-in";
const USERS: &str = "users";
const DEVICES: &str = "devices";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityKey {
    pub id: String,
    pub name: String,
    #[serde(with = "bytes")]
    pub credential: Vec<u8>,
    #[serde(with = "bytes")]
    pub public_key: Vec<u8>,
    pub eddsa: bool,
    #[serde(with = "bytes")]
    pub salt: Vec<u8>,
    pub device: Option<String>,
}

impl SecurityKey {
    pub fn credential(&self) -> Credential {
        Credential {
            id: self.credential.clone(),
            public_key: self.public_key.clone(),
            algorithm: if self.eddsa {
                Algorithm::EdDsa
            } else {
                Algorithm::Es256
            },
        }
    }

    pub fn salt(&self) -> [u8; 32] {
        self.salt.as_slice().try_into().unwrap_or([0; 32])
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CardWrap {
    Rsa(#[serde(with = "bytes")] Vec<u8>),
    Ecdh(#[serde(with = "bytes")] Vec<u8>),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmartCard {
    pub id: String,
    pub name: String,
    #[serde(with = "bytes")]
    pub certificate: Vec<u8>,
    pub wrap: Option<CardWrap>,
    pub reader: Option<String>,
}

/// How one person signs in, besides fingerprints, which fprintd keeps.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Person {
    #[serde(default = "yes")]
    pub password: bool,
    #[serde(default)]
    pub keys: Vec<SecurityKey>,
    #[serde(default)]
    pub cards: Vec<SmartCard>,
}

fn yes() -> bool {
    true
}

impl Default for Person {
    fn default() -> Self {
        Self {
            password: true,
            keys: Vec::new(),
            cards: Vec::new(),
        }
    }
}

impl Person {
    pub fn enrolled(&self) -> Vec<String> {
        self.keys
            .iter()
            .map(|key| key.id.clone())
            .chain(self.cards.iter().map(|card| card.id.clone()))
            .collect()
    }
}

/// Everything is kept under `/var/lib/luft-sign-in`, which only root reads
/// or changes, one file per person.
pub struct Store {
    folder: PathBuf,
}

impl Store {
    pub fn system() -> Self {
        Self::at(PathBuf::from(STATE))
    }

    pub fn at(folder: PathBuf) -> Self {
        Self { folder }
    }

    fn person_path(&self, uid: u32) -> PathBuf {
        self.folder.join(USERS).join(format!("{uid}.json"))
    }

    pub fn person(&self, uid: u32) -> io::Result<Person> {
        match fs::read(self.person_path(uid)) {
            Ok(bytes) => serde_json::from_slice(&bytes).map_err(io::Error::other),
            Err(error) if error.kind() == ErrorKind::NotFound => Ok(Person::default()),
            Err(error) => Err(error),
        }
    }

    pub fn change(&self, uid: u32, change: impl FnOnce(&mut Person)) -> io::Result<Person> {
        let mut person = self.person(uid)?;
        change(&mut person);
        let path = self.person_path(uid);
        if person.password && person.keys.is_empty() && person.cards.is_empty() {
            match fs::remove_file(&path) {
                Err(error) if error.kind() != ErrorKind::NotFound => return Err(error),
                _ => {}
            }
        } else {
            replace(
                &path,
                &serde_json::to_vec_pretty(&person).map_err(io::Error::other)?,
            )?;
        }
        self.write_devices()?;
        Ok(person)
    }

    pub fn people(&self) -> impl Iterator<Item = (u32, Person)> + '_ {
        fs::read_dir(self.folder.join(USERS))
            .into_iter()
            .flatten()
            .flatten()
            .filter_map(|entry| {
                let name = entry.file_name().into_string().ok()?;
                let uid = name.strip_suffix(".json")?.parse().ok()?;
                Some((uid, self.person(uid).ok()?))
            })
    }

    fn write_devices(&self) -> io::Result<()> {
        let mut devices = SignInDevices::default();
        for (_, person) in self.people() {
            let lines = person
                .keys
                .iter()
                .filter_map(|key| key.device.as_deref())
                .chain(
                    person
                        .cards
                        .iter()
                        .filter_map(|card| card.reader.as_deref()),
                );
            for enrolled in lines.filter_map(Enrolled::parse) {
                devices.add(enrolled);
            }
        }
        replace(&self.folder.join(DEVICES), devices.render().as_bytes())
    }
}

fn replace(path: &Path, contents: &[u8]) -> io::Result<()> {
    let folder = path.parent().expect("a file under the state folder");
    DirBuilder::new()
        .recursive(true)
        .mode(0o700)
        .create(folder)?;
    let staging = path.with_extension("new");
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .mode(0o600)
        .open(&staging)?;
    file.write_all(contents)?;
    file.sync_all()?;
    fs::rename(&staging, path)?;
    File::open(folder)?.sync_all()
}

#[cfg(test)]
mod tests {
    use super::*;

    const YUBIKEY: &str = "usb\t1050:0407\t\t030000,030101,0b0000\tsecurity-key";

    fn key(id: &str) -> SecurityKey {
        SecurityKey {
            id: id.into(),
            name: "YubiKey".into(),
            credential: vec![1, 2, 3],
            public_key: vec![4; 64],
            eddsa: false,
            salt: vec![5; 32],
            device: Some(YUBIKEY.into()),
        }
    }

    #[test]
    fn devices_list_follows_what_people_enrolled() {
        let folder = tempfile::tempdir().unwrap();
        let store = Store::at(folder.path().into());
        store
            .change(1000, |person| person.keys.push(key("a")))
            .unwrap();
        let devices = fs::read_to_string(folder.path().join(DEVICES)).unwrap();
        assert_eq!(devices.trim_end(), YUBIKEY);
        assert_eq!(store.person(1000).unwrap().keys[0].salt(), [5; 32]);

        store.change(1000, |person| person.keys.clear()).unwrap();
        assert_eq!(fs::read_to_string(folder.path().join(DEVICES)).unwrap(), "");
        assert!(!store.person_path(1000).exists());
        assert!(store.person(1000).unwrap().password);
    }
}
