use std::fs;
use std::path::Path;
use std::process::Command;

use luft_app::portal::{self, FileChooser, Filter};

use super::{plugins, wireguard};

const PATTERNS: [&str; 5] = ["*.conf", "*.ovpn", "*.pcf", "*.cnf", "*.vpn"];

fn nmcli(plugin: &str, file: &Path) -> bool {
    Command::new("nmcli")
        .args(["connection", "import", "type", plugin, "file"])
        .arg(file)
        .output()
        .is_ok_and(|output| output.status.success())
}

fn import_file(file: &Path) -> Result<(), String> {
    if let Ok(text) = fs::read_to_string(file)
        && wireguard::is_config(&text)
    {
        let name = file
            .file_stem()
            .map(|stem| stem.to_string_lossy().into_owned())
            .unwrap_or_default();
        return wireguard::add(wireguard::parse(&text, name)?);
    }
    plugins::likely_for(file)
        .iter()
        .any(|plugin| nmcli(plugin, file))
        .then_some(())
        .ok_or_else(|| "This file isn't a VPN configuration that can be imported".to_owned())
}

pub fn import() -> Result<bool, String> {
    let chosen = FileChooser {
        title: "Import a VPN Configuration",
        filters: vec![
            Filter {
                name: "VPN configurations",
                patterns: PATTERNS.iter().map(ToString::to_string).collect(),
            },
            Filter {
                name: "All files",
                patterns: vec!["*".to_owned()],
            },
        ],
        ..FileChooser::default()
    }
    .open()?;
    let Some(uri) = chosen.first() else {
        return Ok(false);
    };
    let file = portal::uri_path(uri).ok_or("This file can't be opened")?;
    import_file(&file)?;
    Ok(true)
}

