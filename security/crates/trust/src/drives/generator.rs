use std::fs;
use std::os::unix::fs::symlink;
use std::path::Path;

use anyhow::Result;

use super::record::Record;
use crate::system::host::command::Tool;

const CRYPTSETUP: &str = "/usr/bin/systemd-cryptsetup";
const STARTUP: &str = "cryptsetup.target";

#[derive(PartialEq, Eq)]
struct Unit {
    name: String,
    text: String,
    device: String,
    cleartext: String,
}

fn escape(part: &str) -> String {
    part.replace('-', "\\x2d")
}

fn device_unit(path: &Path) -> String {
    let parts: Vec<String> = path
        .to_string_lossy()
        .trim_start_matches('/')
        .split('/')
        .map(escape)
        .collect();
    format!("{}.device", parts.join("-"))
}

fn options(record: &Record) -> String {
    let mut options = vec!["nofail".to_owned()];
    if !record.removable {
        options.push("discard".to_owned());
    }
    if let (Some(header), Some(_)) = (&record.header, &record.partuuid) {
        options.push(format!("header={}", header.display()));
    }
    options.join(",")
}

fn unit(record: &Record) -> Option<Unit> {
    if !record.auto_unlock {
        return None;
    }
    let (mapping, source, key) = (record.mapping(), record.device(), record.key_file());
    let device = device_unit(&source);
    let text = format!(
        "[Unit]
Description=Cryptography Setup for %I
Documentation=man:systemd-cryptsetup@.service(8)
SourcePath={record}
DefaultDependencies=no
After=cryptsetup-pre.target systemd-udevd-kernel.socket systemd-udevd.service
Before=blockdev@dev-mapper-%i.target
Wants=blockdev@dev-mapper-%i.target
IgnoreOnIsolate=true
Conflicts=umount.target
Before=umount.target
WantsMountsFor={key}
BindsTo={device}
After={device}

[Service]
Type=oneshot
RemainAfterExit=yes
TimeoutSec=infinity
KeyringMode=shared
OOMScoreAdjust=500
ExecStart={CRYPTSETUP} attach '{mapping}' '{source}' '{key}' '{options}'
ExecStop={CRYPTSETUP} detach '{mapping}'
",
        record = record.file().display(),
        key = key.display(),
        source = source.display(),
        options = options(record),
    );
    Some(Unit {
        name: format!("systemd-cryptsetup@{}.service", escape(&mapping)),
        cleartext: format!("dev-mapper-{}.device", escape(&mapping)),
        device,
        text,
    })
}

fn place(folder: &Path, unit: &Unit) -> Result<()> {
    fs::write(folder.join(&unit.name), &unit.text)?;
    let wanted_by = [
        (STARTUP, "wants"),
        (unit.device.as_str(), "wants"),
        (unit.cleartext.as_str(), "requires"),
    ];
    for (owner, kind) in wanted_by {
        let links = folder.join(format!("{owner}.{kind}"));
        fs::create_dir_all(&links)?;
        symlink(format!("../{}", unit.name), links.join(&unit.name))?;
    }
    Ok(())
}

/// Writes a `systemd-cryptsetup@` unit for every drive that unlocks by itself into the generator
/// folder `folder`, started at startup when the drive is there and whenever it's plugged in.
pub fn generate(folder: &Path) -> Result<()> {
    for unit in Record::all().iter().filter_map(unit) {
        place(folder, &unit)?;
    }
    Ok(())
}

/// Has systemd run the generator again when what it makes of the drive changed.
pub fn changed(before: Option<&Record>, after: Option<&Record>) {
    if before.and_then(unit) != after.and_then(unit) {
        let _ = Tool::new("systemctl").arg("daemon-reload").status();
    }
}
