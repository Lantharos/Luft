use std::path::PathBuf;

use serde::Deserialize;

/// What people chose in the extension's settings.
#[derive(Clone, Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    /// The name other devices show, or the computer's name when there's none.
    #[serde(default)]
    pub alias: Option<String>,
    /// Where received files go, or Downloads when there's none.
    #[serde(default)]
    pub folder: Option<PathBuf>,
    pub receive: bool,
    #[serde(default)]
    pub pin: Option<String>,
    #[serde(default)]
    pub trusted: Vec<String>,
}

impl Config {
    pub fn alias(&self, computer: &str) -> String {
        self.alias.clone().filter(|alias| !alias.trim().is_empty()).unwrap_or_else(|| computer.to_owned())
    }

    pub fn folder(&self) -> PathBuf {
        self.folder.clone().or_else(dirs::download_dir).or_else(dirs::home_dir).expect("people have a home folder")
    }

    pub fn trusts(&self, fingerprint: &str) -> bool {
        self.trusted.iter().any(|trusted| trusted == fingerprint)
    }
}

/// The computer's name as people set it, the same one Settings shows, from hostnamed.
pub async fn computer_name() -> String {
    let named = async {
        let hostnamed = zbus::Proxy::new(
            &zbus::Connection::system().await?,
            "org.freedesktop.hostname1",
            "/org/freedesktop/hostname1",
            "org.freedesktop.hostname1",
        )
        .await?;
        let pretty: String = hostnamed.get_property("PrettyHostname").await?;
        if !pretty.trim().is_empty() {
            return Ok(pretty);
        }
        hostnamed.get_property::<String>("Hostname").await
    };
    named.await.ok().filter(|name: &String| !name.is_empty() && name != "localhost").unwrap_or_else(|| "Luft".into())
}
