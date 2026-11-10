use std::ffi::OsStr;
use std::fs::{self, OpenOptions};
use std::os::unix::ffi::OsStrExt;
use std::os::unix::fs::{OpenOptionsExt, PermissionsExt};
use std::path::{Path, PathBuf};
use std::time::{Duration, UNIX_EPOCH};

use anyhow::{Context, Result};
use luft_i18n::t;
use luft_meet::moving_box::{FILES, Manifest};
use luft_meet::sealed::Opened;
use luft_meet::wifi;
use luft_windows::bluetooth::{bluez, saved_pairings};

use crate::L10N;
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

fn extract(opened: &mut Opened, index: usize, to: &Path, read: impl FnMut(u64)) -> Result<()> {
    fs::create_dir_all(to.parent().expect("unpacked files live in folders"))?;
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .mode(0o644)
        .open(to)?;
    opened.extract(index, &mut file, read)?;
    if let Some(modified) = opened.contents.files[index].modified {
        file.set_modified(UNIX_EPOCH + Duration::from_secs(modified))?;
    }
    Ok(())
}

fn extract_named(opened: &mut Opened, path: &str, to: &Path) -> Result<()> {
    let index = opened.find(path)?;
    extract(opened, index, to, |_| {})
}

/// Where a packed file goes in the new home folder, when it belongs to one
/// of the folders the box says it brings.
fn in_home(path: &str, manifest: &Manifest, home: &Path) -> Option<PathBuf> {
    let (folder, inside) = path
        .strip_prefix(FILES)?
        .strip_prefix('/')?
        .split_once('/')?;
    manifest
        .folders
        .iter()
        .any(|packed| packed.kind.name() == folder)
        .then(|| home.join(folder).join(inside))
}

fn folders(opened: &mut Opened, home: &Path, progress: &dyn Fn(f64)) -> Result<()> {
    let manifest = opened.contents.manifest.clone();
    let mut copying = Copying {
        done: 0,
        total: manifest.bytes(),
        progress,
    };
    for index in 0..opened.contents.files.len() {
        let path = opened.contents.files[index].path.clone();
        let Some(target) = in_home(&path, &manifest, home) else {
            continue;
        };
        extract(opened, index, &target, |read| {
            copying.done += read;
            (copying.progress)(copying.done as f64 / copying.total.max(1) as f64);
        })
        .with_context(|| t!(L10N, "installer-unpack-failed", path = path.as_str()))?;
    }
    Ok(())
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

fn networks(deployment: &Deployment, opened: &mut Opened) -> Result<Vec<PathBuf>> {
    let folder = deployment.etc(CONNECTIONS);
    fs::create_dir_all(&folder)?;
    let mut written = Vec::new();
    for profile in opened.contents.manifest.wifi.clone() {
        let xml = String::from_utf8(opened.read(&profile)?)?;
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

fn picture(deployment: &Deployment, opened: &mut Opened, user: &str) -> Result<Vec<PathBuf>> {
    let account = opened.contents.manifest.account.as_ref();
    let Some(picture) = account.and_then(|account| account.picture.clone()) else {
        return Ok(Vec::new());
    };
    let icon = deployment.var(&format!("{ICONS}/{user}"));
    extract_named(opened, &picture, &icon)?;
    let settings = deployment.var(&format!("{USERS}/{user}"));
    write(
        &settings,
        &format!("[User]\nIcon=/var/{ICONS}/{user}\nSystemAccount=false\n"),
    )?;
    Ok(vec![icon, settings])
}

/// A file name as an address carries it, with everything but letters, digits
/// and `-._~` percent-encoded, so it can't end the quoted value it's written
/// into either.
fn uri_segment(name: &OsStr) -> String {
    name.as_bytes()
        .iter()
        .map(|byte| match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'.' | b'_' | b'~' => {
                char::from(*byte).to_string()
            }
            byte => format!("%{byte:02X}"),
        })
        .collect()
}

fn wallpaper(opened: &mut Opened, home: &Path, user: &str) -> Result<()> {
    let Some(wallpaper) = opened.contents.manifest.wallpaper.clone() else {
        return Ok(());
    };
    let name = Path::new(&wallpaper)
        .file_name()
        .with_context(|| t!(L10N, "installer-wallpaper-unnamed"))?;
    let target = home.join(BACKGROUNDS).join(name);
    extract_named(opened, &wallpaper, &target)?;
    let uri = format!(
        "file:///var/home/{user}/{BACKGROUNDS}/{}",
        uri_segment(name)
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

fn bluetooth(deployment: &Deployment, opened: &mut Opened) -> Result<Vec<PathBuf>> {
    let Some(saved) = opened.contents.manifest.bluetooth.clone() else {
        return Ok(Vec::new());
    };
    let keys = opened.read(&saved.keys)?;
    let names = saved
        .names
        .as_ref()
        .map(|names| opened.read(names))
        .transpose()?;
    let pairings = saved_pairings(&keys, names.as_deref())?;
    let storage = deployment.var(bluez::STORAGE.trim_start_matches("/var/"));
    bluez::import(&storage, &pairings)?;
    Ok(vec![storage])
}

pub fn unpack(
    deployment: &Deployment,
    account: &Account,
    opened: &mut Opened,
    progress: &dyn Fn(f64),
) -> Result<()> {
    let user = &account.name;
    let home = deployment.var(&format!("home/{user}"));
    let unpacked = folders(opened, &home, progress);
    if unpacked.is_ok()
        && let Err(error) = wallpaper(opened, &home, user)
    {
        eprintln!("The wallpaper from Windows wasn't set: {error:#}");
    }
    Tool::new("chown")
        .args(["--recursive", &account.ids(deployment)?])
        .arg(&home)
        .run()?;
    let mut relabelled = vec![home];
    if unpacked.is_ok() {
        relabelled.extend(picture(deployment, opened, user)?);
        relabelled.extend(networks(deployment, opened)?);
        match bluetooth(deployment, opened) {
            Ok(storage) => relabelled.extend(storage),
            Err(error) => {
                eprintln!("Bluetooth devices from Windows weren't brought over: {error:#}");
            }
        }
    }
    deployment.relabel(&relabelled)?;
    unpacked
}
