pub mod apps;
pub mod dropbox;
pub mod nextcloud;
pub mod oauth;
pub mod onedrive;
pub mod trouble;

use std::sync::LazyLock;
use std::time::Duration;

use luft_accounts::types::Provider;
use serde_json::{Map, Value};

use crate::store::{Record, Secret};

const ANSWER: Duration = Duration::from_secs(30);

pub fn http() -> &'static ureq::Agent {
    static AGENT: LazyLock<ureq::Agent> = LazyLock::new(|| {
        ureq::Agent::config_builder()
            .timeout_global(Some(ANSWER))
            .build()
            .into()
    });
    &AGENT
}

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
        if let Some(secret) = app.client_secret {
            parameters.insert("client_secret".into(), secret.into());
        }
    }
    parameters
}

pub fn encode_path(path: &str) -> String {
    path.split('/')
        .map(|part| {
            url::form_urlencoded::byte_serialize(part.as_bytes())
                .collect::<String>()
                .replace('+', "%20")
        })
        .collect::<Vec<_>>()
        .join("/")
}

#[cfg(test)]
mod tests {
    use serde_json::json;
    use zeroize::Zeroizing;

    use super::{apps, parameters};
    use crate::store::{Record, Secret};

    fn remote(provider: &str) -> serde_json::Map<String, serde_json::Value> {
        let record: Record = serde_json::from_value(
            json!({"id": "a", "provider": provider, "name": "Drive", "user": "ada@example.com"}),
        )
        .unwrap();
        let secret = Secret::Token {
            token: Zeroizing::new("{}".into()),
        };
        parameters(&record, &secret)
    }

    #[test]
    fn rclone_refreshes_dropbox_as_luft_without_a_secret() {
        let dropbox = remote("dropbox");
        assert_eq!(dropbox["client_id"], apps::DROPBOX.client_id);
        assert!(!dropbox.contains_key("client_secret"));
        let onedrive = remote("onedrive");
        assert_eq!(onedrive["client_id"], apps::ONEDRIVE.client_id);
        assert!(onedrive.contains_key("client_secret"));
    }
}
