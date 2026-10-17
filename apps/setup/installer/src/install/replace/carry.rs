use std::fs;
use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};

use anyhow::Result;

use crate::install::configure::deployment::Deployment;
use crate::survey::linux::fstab::Entry;
use crate::survey::linux::old::{Carried, OldSystem};
use crate::system::files::write;

const CONNECTIONS: &str = "NetworkManager/system-connections";
const SSH: &str = "ssh";
const PRIVATE: u32 = 0o600;
const PUBLIC: u32 = 0o644;
const KEPT_PLACES: [(&str, &str); 5] = [
    ("/var/", "/var/"),
    ("/home/", "/var/home/"),
    ("/mnt/", "/var/mnt/"),
    ("/opt/", "/var/opt/"),
    ("/srv/", "/var/srv/"),
];
const ELSEWHERE: &str = "/var/mnt";

fn place(files: &[Carried], folder: &Path, mode: impl Fn(&Carried) -> u32) -> Result<Vec<PathBuf>> {
    fs::create_dir_all(folder)?;
    let mut written = Vec::new();
    for file in files {
        let path = folder.join(&file.name);
        fs::write(&path, &file.contents)?;
        fs::set_permissions(&path, fs::Permissions::from_mode(mode(file)))?;
        written.push(path);
    }
    Ok(written)
}

pub fn settings(deployment: &Deployment, old: &OldSystem) -> Result<()> {
    let mut touched = place(&old.networks, &deployment.etc(CONNECTIONS), |_| PRIVATE)?;
    touched.extend(place(&old.host_keys, &deployment.etc(SSH), |key| {
        if key.name.ends_with(".pub") {
            PUBLIC
        } else {
            PRIVATE
        }
    })?);
    if let Some(hostname) = &old.hostname {
        let path = deployment.etc("hostname");
        write(&path, &format!("{hostname}\n"))?;
        touched.push(path);
    }
    deployment.relabel(&touched)
}

pub fn luft_path(old: &str) -> String {
    let directory = format!("{}/", old.trim_end_matches('/'));
    KEPT_PLACES
        .iter()
        .find_map(|(before, after)| {
            directory
                .strip_prefix(before)
                .map(|rest| format!("{after}{rest}"))
        })
        .unwrap_or_else(|| {
            let name = Path::new(old)
                .file_name()
                .map_or_else(|| "drive".into(), |name| name.to_string_lossy());
            format!("{ELSEWHERE}/{name}/")
        })
        .trim_end_matches('/')
        .to_owned()
}

fn escaped(field: &str) -> String {
    field
        .replace('\\', "\\134")
        .replace(' ', "\\040")
        .replace('\t', "\\011")
}

fn with_nofail(options: &str) -> String {
    if options.split(',').any(|option| option == "nofail") {
        options.to_owned()
    } else {
        format!("{options},nofail")
    }
}

pub fn line(spec: &str, file: &str, entry: &Entry, pass: u8) -> String {
    format!(
        "{} {} {} {} 0 {pass}\n",
        escaped(spec),
        escaped(file),
        entry.vfs_type,
        with_nofail(&entry.options)
    )
}

pub fn mounts(deployment: &Deployment, home: String, drives: &[Entry]) -> Result<()> {
    let mut table = fs::read_to_string(deployment.etc("fstab")).unwrap_or_default();
    table.push_str(&home);
    let mut made = Vec::new();
    for drive in drives {
        let file = luft_path(&drive.file);
        table.push_str(&line(&drive.spec, &file, drive, 2));
        let folder = deployment.root.join(file.trim_start_matches('/'));
        fs::create_dir_all(&folder)?;
        made.push(folder);
    }
    let path = deployment.etc("fstab");
    write(&path, &table)?;
    made.push(path);
    deployment.relabel(&made)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn other_drives_land_where_luft_can_mount_them() {
        assert_eq!(luft_path("/mnt/data"), "/var/mnt/data");
        assert_eq!(luft_path("/home/ada/Games"), "/var/home/ada/Games");
        assert_eq!(luft_path("/data"), "/var/mnt/data");
        assert_eq!(luft_path("/media/My Disk"), "/var/mnt/My Disk");
    }

    #[test]
    fn mounts_never_hold_up_starting() {
        let entry = Entry {
            spec: "LABEL=data".into(),
            file: "/mnt/My Data".into(),
            vfs_type: "ext4".into(),
            options: "defaults".into(),
        };
        assert_eq!(
            line("LABEL=data", &luft_path(&entry.file), &entry, 2),
            "LABEL=data /var/mnt/My\\040Data ext4 defaults,nofail 0 2\n"
        );
    }
}
