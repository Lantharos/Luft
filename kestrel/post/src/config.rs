use std::path::PathBuf;

/// Who can find this computer and send to it.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum Visibility {
    NoOne,
    #[default]
    YourDevices,
    Everyone,
}

impl Visibility {
    pub fn parse(name: &str) -> Option<Self> {
        match name {
            "no-one" => Some(Self::NoOne),
            "your-devices" => Some(Self::YourDevices),
            "everyone" => Some(Self::Everyone),
            _ => None,
        }
    }
}

/// What people chose for Post in Settings.
#[derive(Clone, Debug, Default)]
pub struct Config {
    pub visibility: Visibility,
    /// The name other devices show, or the computer's name when there's none.
    pub alias: Option<String>,
    /// Where received files go, or Downloads when there's none.
    pub folder: Option<PathBuf>,
    /// The fingerprints of your devices.
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
pub async fn computer_name(system: Option<&zbus::Connection>) -> String {
    let named = async {
        let hostnamed = zbus::Proxy::new(
            system.ok_or(zbus::Error::Unsupported)?,
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
