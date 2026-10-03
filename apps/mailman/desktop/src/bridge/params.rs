use serde::Deserialize;

use crate::accounts::{AccountConfig, Provider};
use crate::mail::compose::Draft;
use crate::store::{Cursor, Identity, Settings};

#[derive(Deserialize)]
pub struct Empty {}

#[derive(Deserialize)]
pub struct Id {
    pub id: i64,
}

#[derive(Deserialize)]
pub struct Thread {
    pub thread: i64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Arguments {
    pub arguments: Vec<String>,
    pub working_directory: Option<String>,
}

#[derive(Deserialize)]
pub struct Focus {
    pub focused: bool,
}

#[derive(Deserialize)]
pub struct Email {
    pub email: String,
}

#[derive(Deserialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum NewSecret {
    Password { password: String },
    OAuth { provider: Provider },
}

#[derive(Deserialize)]
pub struct NewAccount {
    pub email: String,
    pub name: String,
    pub config: AccountConfig,
    pub secret: NewSecret,
}

#[derive(Deserialize)]
pub struct AccountUpdate {
    pub id: i64,
    pub name: String,
}

#[derive(Deserialize)]
pub struct SavedIdentity {
    pub identity: Identity,
}

#[derive(Deserialize)]
pub struct Page {
    pub view: String,
    pub query: Option<String>,
    pub after: Option<Cursor>,
    pub limit: i64,
}

#[derive(Deserialize)]
pub struct Sync {
    pub account: i64,
    pub mailbox: i64,
}

#[derive(Deserialize)]
pub struct Urls {
    pub urls: Vec<String>,
}

#[derive(Deserialize)]
pub struct Images {
    pub address: String,
    pub allowed: bool,
}

#[derive(Deserialize)]
pub struct Verdict {
    pub address: String,
    pub verdict: String,
}

#[derive(Deserialize)]
pub struct Part {
    pub id: Option<i64>,
    pub file: Option<String>,
    pub index: u32,
}

#[derive(Deserialize)]
pub struct Path {
    pub path: String,
}

#[derive(Deserialize)]
pub struct Paths {
    pub paths: Vec<String>,
}

#[derive(Deserialize)]
pub struct Uri {
    pub uri: String,
}

#[derive(Deserialize)]
pub struct Query {
    pub query: String,
}

#[derive(Deserialize)]
pub struct Send {
    pub draft: Draft,
}

#[derive(Deserialize)]
pub struct SaveDraft {
    pub draft: Draft,
    pub replaces: Option<i64>,
}

#[derive(Deserialize)]
pub struct SaveSettings {
    pub settings: Settings,
}

#[derive(Deserialize)]
pub struct Template {
    pub id: Option<i64>,
    pub name: String,
    pub body: String,
}

#[derive(Deserialize)]
pub struct Stash {
    pub name: String,
    pub data: String,
}
