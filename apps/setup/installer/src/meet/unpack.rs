use std::fs;
use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use luft_meet::moving_box::Manifest;
use luft_meet::wifi;
use luft_windows::bluetooth::{bluez, saved_pairings};

use crate::install::Account;
use crate::install::configure::deployment::Deployment;
use crate::system::command::Tool;
use crate::system::files::write;

const CONNECTIONS: &str = "NetworkManager/system-connections";
const ICONS: &str = "lib/AccountsService/icons";
const USERS: &str = "lib/AccountsService/users";
const BACKGROUNDS: &str = ".local/share/backgrounds";
const DCONF: &str = ".config/dconf";

struct Copying<'a> {
    done: u64,
    total: u64,
    progress: &'a dyn Fn(f64),
}

impl Copying<'_> {
    fn tree(&mut self, from: &Path, to: &Path) -> Result<()> {
        fs::create_dir_all(to)?;
        for entry in fs::read_dir(from)? {
            let entry = entry?;
            let kind = entry.file_type()?;
            let target = to.join(entry.file_name());
            if kind.is_dir() {
                self.tree(&entry.path(), &target)?;
            } else if kind.is_file() {
                self.done += copy(&entry.path(), &target)
                    .with_context(|| format!("Couldn't unpack {}", entry.path().display()))?;
                (self.progress)(self.done as f64 / self.total.max(1) as f64);
            }
        }
        Ok(())
    }
}

fn copy(from: &Path, to: &Path) -> Result<u64> {
    let copied = fs::copy(from, to)?;
    fs::set_permissions(to, fs::Permissions::from_mode(0o644))?;
    Ok(copied)
}

fn uuid() -> Result<String> {
    Ok(fs::read_to_string("/proc/sys/kernel/random/uuid")?
        .trim()
        .to_owned())
}

fn file_name(name: &str) -> String {
    name.chars()
        .map(|c| {
            if c.is_alphanumeric() || c == '-' || c == '_' {
                c
            } else {
                '_'
            }
        })
        .collect()
}

fn networks(deployment: &Deployment, from: &Path, manifest: &Manifest) -> Result<Vec<PathBuf>> {
    let folder = deployment.etc(CONNECTIONS);
    fs::create_dir_all(&folder)?;
    let mut written = Vec::new();
    for profile in &manifest.wifi {
        let Ok(xml) = fs::read_to_string(from.join(profile)) else {
            continue;
        };
        let network = match wifi::parse_profile(&xml) {
            Ok(Some(network)) => network,
            Ok(None) => continue,
            Err(error) => {
                eprintln!("A Wi-Fi network from Windows couldn't be read: {error}");
                continue;
            }
        };
        let path = folder.join(format!("{}.nmconnection", file_name(&network.name)));
        write(&path, &network.keyfile(&uuid()?))?;
        fs::set_permissions(&path, fs::Permissions::from_mode(0o600))?;
        written.push(path);
    }
    Ok(written)
}

fn picture(
    deployment: &Deployment,
    from: &Path,
    manifest: &Manifest,
    user: &str,
) -> Result<Vec<PathBuf>> {
    let Some(picture) = manifest
        .account
        .as_ref()
        .and_then(|account| account.picture.as_deref())
    else {
        return Ok(Vec::new());
    };
    let icon = deployment.var(&format!("{ICONS}/{user}"));
    fs::create_dir_all(icon.parent().expect("icons live in a folder"))?;
    copy(&from.join(picture), &icon)?;
    let settings = deployment.var(&format!("{USERS}/{user}"));
    write(
        &settings,
        &format!("[User]\nIcon=/var/{ICONS}/{user}\nSystemAccount=false\n"),
    )?;
    Ok(vec![icon, settings])
}

fn wallpaper(from: &Path, manifest: &Manifest, home: &Path, user: &str) -> Result<()> {
    let Some(wallpaper) = manifest.wallpaper.as_deref() else {
        return Ok(());
    };
    let name = Path::new(wallpaper)
        .file_name()
        .context("The wallpaper has no name")?;
    let target = home.join(BACKGROUNDS).join(name);
    fs::create_dir_all(target.parent().expect("backgrounds live in a folder"))?;
    copy(&from.join(wallpaper), &target)?;
    let uri = format!(
        "file:///var/home/{user}/{BACKGROUNDS}/{}",
        name.to_string_lossy()
    );
    let keyfiles = home.join(DCONF).join("user.d");
    write(
        &keyfiles.join("windows"),
        &format!(
            "[org/gnome/desktop/background]\npicture-uri='{uri}'\npicture-uri-dark='{uri}'\n\n[org/gnome/desktop/screensaver]\npicture-uri='{uri}'\n\n[com/lantharos/kestrel]\nwallpaper-focus=(0.5, 0.5)\nwallpaper-focus-dark=(0.5, 0.5)\n"
        ),
    )?;
    let compiled = Tool::new("dconf")
        .arg("compile")
        .arg(home.join(DCONF).join("user"))
        .arg(&keyfiles)
        .run();
    fs::remove_dir_all(&keyfiles)?;
    compiled
}

fn bluetooth(deployment: &Deployment, from: &Path, manifest: &Manifest) -> Result<Vec<PathBuf>> {
    let Some(saved) = &manifest.bluetooth else {
        return Ok(Vec::new());
    };
    let keys = fs::read(from.join(&saved.keys))?;
    let names = saved
        .names
        .as_ref()
        .map(|names| fs::read(from.join(names)))
        .transpose()?;
    let pairings = saved_pairings(&keys, names.as_deref())?;
    let storage = deployment.var(bluez::STORAGE.trim_start_matches("/var/"));
    bluez::import(&storage, &pairings)?;
    Ok(vec![storage])
}

pub fn unpack(
    deployment: &Deployment,
    account: &Account,
    from: &Path,
    manifest: &Manifest,
    progress: &dyn Fn(f64),
) -> Result<()> {
    let user = &account.name;
    let home = deployment.var(&format!("home/{user}"));
    let mut copying = Copying {
        done: 0,
        total: manifest.bytes(),
        progress,
    };
    for folder in &manifest.folders {
        let source = from.join(folder.kind.in_box());
        if source.is_dir() {
            copying.tree(&source, &home.join(folder.kind.name()))?;
        }
    }
    if let Err(error) = wallpaper(from, manifest, &home, user) {
        eprintln!("The wallpaper from Windows wasn't set: {error:#}");
    }
    Tool::new("chown")
        .args(["--recursive", &account.ids(deployment)?])
        .arg(&home)
        .run()?;
    let mut relabelled = vec![home];
    relabelled.extend(picture(deployment, from, manifest, user)?);
    relabelled.extend(networks(deployment, from, manifest)?);
    match bluetooth(deployment, from, manifest) {
        Ok(storage) => relabelled.extend(storage),
        Err(error) => eprintln!("Bluetooth devices from Windows weren't brought over: {error:#}"),
    }
    deployment.relabel(&relabelled)
}
