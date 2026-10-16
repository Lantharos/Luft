pub mod apps;
pub mod dropbox;
pub mod nextcloud;
pub mod oauth;
pub mod onedrive;
pub mod trouble;

use luft_accounts::types::Provider;
use serde_json::{Map, Value};

use crate::store::{Record, Secret};

pub fn backend(provider: Provider) -> &'static str {
    match provider {
        Provider::Onedrive => "onedrive",
        Provider::Dropbox => "dropbox",
        Provider::Icloud => "iclouddrive",
        Provider::Nextcloud | Provider::Webdav => "webdav",
    }
}

pub fn parameters(record: &Record, secret: &Secret) -> Map<String, Value> {
    let mut parameters: Map<String, Value> = record
        .options
        .iter()
        .map(|(key, value)| (key.clone(), Value::String(value.clone())))
        .collect();
    parameters.extend(secret.parameters());
    if record.provider == Provider::Icloud {
        parameters.insert("apple_id".into(), record.user.clone().into());
    }
    let app = match record.provider {
        Provider::Onedrive => Some(&apps::ONEDRIVE),
        Provider::Dropbox => Some(&apps::DROPBOX),
        _ => None,
    };
    if let Some(app) = app {
        parameters.insert("client_id".into(), app.client_id.into());
        parameters.insert("client_secret".into(), app.client_secret.into());
    }
    parameters
}

pub fn encode_path(path: &str) -> String {
    path.split('/')
        .map(|part| url::form_urlencoded::byte_serialize(part.as_bytes()).collect::<String>().replace('+', "%20"))
        .collect::<Vec<_>>()
        .join("/")
}
