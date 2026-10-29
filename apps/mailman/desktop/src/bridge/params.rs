use serde::Deserialize;
use specta::Type;

use crate::accounts::{AccountConfig, Provider};
use crate::mail::compose::Draft;
use crate::store::{Cursor, Identity, Settings, Verdict};

#[derive(Deserialize, Type)]
pub struct Id {
    pub id: i64,
}

#[derive(Deserialize, Type)]
pub struct Thread {
    pub thread: i64,
}

#[derive(Deserialize, Type)]
pub struct Focus {
    pub focused: bool,
}

#[derive(Deserialize, Type)]
pub struct Email {
    pub email: String,
}

#[derive(Deserialize, Type)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum NewSecret {
    Password { password: String },
    OAuth { provider: Provider },
}

#[derive(Deserialize, Type)]
pub struct NewAccount {
    pub email: String,
    pub name: String,
    pub config: AccountConfig,
    pub secret: NewSecret,
    pub token: Option<String>,
}

#[derive(Deserialize, Type)]
pub struct SignInAgain {
    pub id: i64,
    pub secret: NewSecret,
    pub token: Option<String>,
}

#[derive(Deserialize, Type)]
pub struct AccountUpdate {
    pub id: i64,
    pub name: String,
}

#[derive(Deserialize, Type)]
pub struct SavedIdentity {
    pub identity: Identity,
}

#[derive(Deserialize, Type)]
pub struct Page {
    pub view: String,
    pub query: Option<String>,
    pub after: Option<Cursor>,
    pub limit: i64,
}

#[derive(Deserialize, Type)]
pub struct Sync {
    pub account: i64,
    pub mailbox: i64,
}

#[derive(Deserialize, Type)]
pub struct Urls {
    pub urls: Vec<String>,
}

#[derive(Deserialize, Type)]
pub struct Images {
    pub address: String,
    pub allowed: bool,
}

#[derive(Deserialize, Type)]
pub struct Screening {
    pub address: String,
    pub verdict: Verdict,
}

#[derive(Deserialize, Type)]
pub struct Part {
    pub id: Option<i64>,
    pub file: Option<String>,
    pub index: u32,
    pub token: Option<String>,
}

#[derive(Deserialize, Type)]
pub struct Path {
    pub path: String,
}

#[derive(Deserialize, Type)]
pub struct Paths {
    pub paths: Vec<String>,
}

#[derive(Deserialize, Type)]
pub struct Uri {
    pub uri: String,
    pub token: Option<String>,
}

#[derive(Deserialize, Type)]
pub struct Unsubscribe {
    pub id: i64,
    pub token: Option<String>,
}

#[derive(Deserialize, Type)]
pub struct Query {
    pub query: String,
}

#[derive(Deserialize, Type)]
pub struct Send {
    pub draft: Draft,
}

#[derive(Deserialize, Type)]
pub struct SaveDraft {
    pub draft: Draft,
    pub replaces: Option<i64>,
}

#[derive(Deserialize, Type)]
pub struct SaveSettings {
    pub settings: Settings,
}

#[derive(Deserialize, Type)]
pub struct Template {
    pub id: Option<i64>,
    pub name: String,
    pub body: String,
}

#[derive(Deserialize)]
pub struct Stash {
    pub name: String,
}
