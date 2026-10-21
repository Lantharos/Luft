use std::path::PathBuf;
use std::process::Command;

use serde::Serialize;

use super::{Installation, columns, size};

const LIST_COLUMNS: &str =
    "--columns=application:f,ref:f,origin:f,installation:f,name:f,version:f,size:f,options:f";
const SYSTEM_INSTALLATION: &str = "/var/lib/flatpak";

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Installed {
    pub id: String,
    pub reference: String,
    pub origin: String,
    pub installation: Installation,
    pub name: String,
    pub version: String,
    pub size: u64,
    pub runtime: bool,
    pub launchable: bool,
}

impl Installed {
    pub fn desktop_file(&self) -> PathBuf {
        location(self.installation)
            .join("exports/share/applications")
            .join(format!("{}.desktop", self.id))
    }

    pub fn deploy(&self) -> PathBuf {
        location(self.installation)
            .join("app")
            .join(&self.reference)
            .join("active")
    }
}

fn location(installation: Installation) -> PathBuf {
    let (variable, default) = match installation {
        Installation::System => ("FLATPAK_SYSTEM_DIR", PathBuf::from(SYSTEM_INSTALLATION)),
        Installation::User => (
            "FLATPAK_USER_DIR",
            dirs::data_dir().unwrap_or_default().join("flatpak"),
        ),
    };
    std::env::var_os(variable).map_or(default, PathBuf::from)
}

pub fn installed() -> Result<Vec<Installed>, String> {
    let output = Command::new("flatpak")
        .args(["list", LIST_COLUMNS])
        .output()
        .map_err(|_| "Flatpak isn't installed.".to_string())?;
    Ok(String::from_utf8_lossy(&output.stdout)
        .lines()
        .filter_map(parse)
        .collect())
}

fn parse(line: &str) -> Option<Installed> {
    let [
        id,
        reference,
        origin,
        installation,
        name,
        version,
        installed_size,
        options,
    ] = columns(line)[..]
    else {
        return None;
    };
    let installation = Installation::parse(installation)?;
    let runtime = options.split(',').any(|option| option == "runtime");
    let mut installed = Installed {
        id: id.to_owned(),
        reference: reference.to_owned(),
        origin: origin.to_owned(),
        installation,
        name: if name.is_empty() {
            id.to_owned()
        } else {
            name.to_owned()
        },
        version: version.to_owned(),
        size: size(installed_size),
        runtime,
        launchable: false,
    };
    installed.launchable = !runtime && installed.desktop_file().exists();
    Some(installed)
}
