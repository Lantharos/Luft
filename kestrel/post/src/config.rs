use std::path::PathBuf;

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

#[derive(Clone, Debug, Default)]
pub struct Config {
    pub visibility: Visibility,
    pub alias: Option<String>,
    pub folder: Option<PathBuf>,
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
