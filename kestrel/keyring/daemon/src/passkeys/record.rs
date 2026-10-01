use std::collections::{BTreeMap, HashMap};

use luft_keyring_vault::{Collection, Contents, Item, Secret};
use luft_keyring_wire::TpmKey;
use serde::{Deserialize, Serialize};
use zbus::zvariant::{OwnedValue, Value};

pub const COLLECTION: &str = "passkeys";
pub const SCHEMA: &str = "com.lantharos.Passkey";
const CONTENT_TYPE: &str = "application/x-luft-passkey";

#[derive(Serialize, Deserialize)]
pub enum Private {
    Chip { key: TpmKey, auth: Secret },
    Software(Secret),
}

#[derive(Serialize, Deserialize)]
pub struct Passkey {
    pub id: Vec<u8>,
    pub rp: String,
    pub rp_name: String,
    pub user_id: Vec<u8>,
    pub user_name: String,
    pub display_name: String,
    pub discoverable: bool,
    pub protection: u8,
    pub x: Vec<u8>,
    pub y: Vec<u8>,
    pub nickname: String,
    pub created: u64,
    pub used: u64,
    pub counter: u32,
    pub private: Private,
    pub random: Secret,
}

impl Passkey {
    pub fn read(item: &Item) -> Option<Self> {
        let schema = item.attributes.get("xdg:schema")?;
        (schema == SCHEMA)
            .then(|| postcard::from_bytes(item.secret.expose()).ok())
            .flatten()
    }

    pub fn item(&self, owner: &str) -> Item {
        let attributes = BTreeMap::from([
            ("xdg:schema".to_owned(), SCHEMA.to_owned()),
            ("rp".to_owned(), self.rp.clone()),
        ]);
        let mut item = Item::new(
            format!("Passkey for {}", self.rp),
            attributes,
            self.secret(),
            CONTENT_TYPE.to_owned(),
        );
        item.owner = Some(owner.to_owned());
        item
    }

    pub fn secret(&self) -> Secret {
        Secret::new(postcard::to_stdvec(self).expect("passkeys always serialize"))
    }

    pub fn on_chip(&self) -> bool {
        matches!(self.private, Private::Chip { .. })
    }

    pub fn describe(&self) -> HashMap<&'static str, OwnedValue> {
        let fields = [
            ("id", Value::from(self.id.clone())),
            ("rp", Value::from(self.rp.clone())),
            ("rp_name", Value::from(self.rp_name.clone())),
            ("user_id", Value::from(self.user_id.clone())),
            ("user_name", Value::from(self.user_name.clone())),
            ("display_name", Value::from(self.display_name.clone())),
            ("discoverable", Value::from(self.discoverable)),
            ("protection", Value::from(self.protection)),
            ("x", Value::from(self.x.clone())),
            ("y", Value::from(self.y.clone())),
            ("nickname", Value::from(self.nickname.clone())),
            ("created", Value::from(self.created)),
            ("used", Value::from(self.used)),
            ("chip", Value::from(self.on_chip())),
        ];
        fields
            .into_iter()
            .map(|(name, value)| (name, value.try_into().expect("plain values convert")))
            .collect()
    }
}

pub fn all(contents: &Contents) -> Vec<Passkey> {
    contents
        .collection(COLLECTION)
        .map(|collection| collection.items.iter().filter_map(Passkey::read).collect())
        .unwrap_or_default()
}

pub fn find(contents: &Contents, id: &[u8]) -> Option<(u64, Passkey)> {
    let collection = contents.collection(COLLECTION)?;
    collection.items.iter().find_map(|item| {
        Passkey::read(item)
            .filter(|passkey| passkey.id == id)
            .map(|passkey| (item.id, passkey))
    })
}

pub fn collection(contents: &mut Contents) -> &mut Collection {
    if contents.collection(COLLECTION).is_none() {
        contents
            .collections
            .push(Collection::new(COLLECTION, "Passkeys"));
    }
    contents
        .collection_mut(COLLECTION)
        .expect("the passkeys collection exists")
}
