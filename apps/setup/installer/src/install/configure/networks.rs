use std::fs::{self, OpenOptions};
use std::io::Write;
use std::os::unix::fs::OpenOptionsExt;
use std::path::Path;

use anyhow::Result;

use super::deployment::Deployment;

const CONNECTIONS: &str = "NetworkManager/system-connections";
const LIVE: [&str; 2] = [
    "/etc/NetworkManager/system-connections",
    "/run/NetworkManager/system-connections",
];
const WIFI: [&str; 2] = ["wifi", "802-11-wireless"];
const OWNERS: &str = "permissions";

fn value<'a>(keyfile: &'a str, group: &str, key: &str) -> Option<&'a str> {
    let heading = format!("[{group}]");
    keyfile
        .lines()
        .skip_while(|line| line.trim() != heading)
        .skip(1)
        .take_while(|line| !line.trim_start().starts_with('['))
        .find_map(|line| {
            let (name, value) = line.split_once('=')?;
            (name.trim() == key).then(|| value.trim())
        })
}

fn ssid(keyfile: &str) -> Option<&str> {
    WIFI.iter().find_map(|group| value(keyfile, group, "ssid"))
}

fn for_everyone(keyfile: &str) -> String {
    let mut lines = Vec::new();
    let mut general = false;
    for line in keyfile.lines() {
        let trimmed = line.trim_start();
        if trimmed.starts_with('[') {
            general = trimmed.trim_end() == "[connection]";
        } else if general
            && trimmed
                .split_once('=')
                .is_some_and(|(key, _)| key.trim() == OWNERS)
        {
            continue;
        }
        lines.push(line);
    }
    lines.join("\n") + "\n"
}

struct Network {
    file: String,
    ssid: String,
    keyfile: String,
}

fn live_wifi() -> Vec<Network> {
    LIVE.iter()
        .filter_map(|folder| fs::read_dir(folder).ok())
        .flat_map(|entries| entries.flatten())
        .filter_map(|entry| {
            let file = entry.file_name().to_str()?.to_owned();
            let keyfile = fs::read_to_string(entry.path()).ok()?;
            if !file.ends_with(".nmconnection")
                || !WIFI.contains(&value(&keyfile, "connection", "type")?)
            {
                return None;
            }
            Some(Network {
                file,
                ssid: ssid(&keyfile)?.to_owned(),
                keyfile: for_everyone(&keyfile),
            })
        })
        .collect()
}

fn forget_network(folder: &Path, network: &str) -> Result<()> {
    for entry in fs::read_dir(folder)?.flatten() {
        if fs::read_to_string(entry.path()).is_ok_and(|keyfile| ssid(&keyfile) == Some(network)) {
            fs::remove_file(entry.path())?;
        }
    }
    Ok(())
}

fn write_private(path: &Path, contents: &str) -> Result<()> {
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .mode(0o600)
        .open(path)?;
    file.write_all(contents.as_bytes())?;
    Ok(file.sync_all()?)
}

pub fn carry_from_live(deployment: &Deployment) -> Result<()> {
    let folder = deployment.etc(CONNECTIONS);
    fs::create_dir_all(&folder)?;
    let mut written = Vec::new();
    for network in live_wifi() {
        forget_network(&folder, &network.ssid)?;
        let path = folder.join(network.file);
        write_private(&path, &network.keyfile)?;
        written.push(path);
    }
    deployment.relabel(&written)
}

#[cfg(test)]
mod tests {
    use super::*;

    const LIVE_PROFILE: &str = "[connection]\nid=Home\nuuid=0c3a\ntype=wifi\npermissions=user:live;\n\n[wifi]\nmode=infrastructure\nssid=Home\n\n[wifi-security]\nkey-mgmt=wpa-psk\npsk=correct horse\n";

    #[test]
    fn reads_the_network_and_drops_the_live_account() {
        assert_eq!(ssid(LIVE_PROFILE), Some("Home"));
        assert_eq!(value(LIVE_PROFILE, "connection", "type"), Some("wifi"));
        assert_eq!(
            for_everyone(LIVE_PROFILE),
            LIVE_PROFILE.replace("permissions=user:live;\n", "")
        );
    }
}
