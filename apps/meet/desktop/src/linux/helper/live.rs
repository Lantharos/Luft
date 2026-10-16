use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use crate::live::download::{Hashing, format_checksum};
use crate::live::durable;
use crate::live::files::{self, BUILD_RECORD, Place, UPDATING, Volumes};
use crate::live::iso::{self, Entry};
use crate::live::source::Source;
use crate::live::variant::Variant;
use crate::protocol::Stage;
use crate::serving::Context;

const SHIM: &str = "EFI/BOOT/BOOTX64.EFI";
const LOADERS: &str = "EFI/BOOT/";
const SHIM_HERE: &str = "shimx64.efi";
const GRUB_CONFIG: &str = "grub.cfg";
const LIVE_FOLDERS: [&str; 2] = ["boot", "LiveOS"];

pub struct Spots<'a> {
    pub variant: Variant,
    pub loader: &'a Path,
    pub folder: &'a Path,
    pub filesystem: &'a str,
    pub on_filesystem: &'a str,
}

fn target(loader: PathBuf, folder: PathBuf) -> impl Fn(&str) -> PathBuf {
    move |path| {
        if path == SHIM {
            loader.join(SHIM_HERE)
        } else if let Some(name) = path.strip_prefix(LOADERS) {
            loader.join(name)
        } else {
            files::on(&folder, path)
        }
    }
}

pub fn bytes(entries: &[Entry]) -> u64 {
    files::bytes_for(entries, Place::Start) + files::bytes_for(entries, Place::Live)
}

pub fn grub_config(filesystem: &str, on_filesystem: &str) -> String {
    format!(
        "search --no-floppy --fs-uuid --set=root {filesystem}\nset medium='UUID={filesystem}'\nset folder='{on_filesystem}'\nexport medium folder\nsource ${{folder}}/boot/menu.cfg\n"
    )
}

pub fn write(context: &Context, source: &Source, spots: &Spots) -> Result<(), String> {
    let expected = source
        .checksum(spots.variant)
        .map_err(|error| format!("Luft's checksum couldn't be read: {error}"))?;
    let opened = source
        .open(spots.variant)
        .map_err(|error| error.to_string())?;
    let total = opened.total;
    let mut hashing = Hashing::new(opened.reader, |read| {
        context.progress(Stage::Downloading, read, total)
    });
    let mut volumes = Volumes::new(target(spots.loader.to_owned(), spots.folder.to_owned()));
    iso::extract(&mut hashing, &mut volumes)
        .map_err(|error: io::Error| format!("Luft couldn't be downloaded: {error}"))?;
    volumes.finish().map_err(|error| error.to_string())?;
    let digest = hashing.digest();
    if expected.is_some_and(|expected| digest != expected) {
        return Err("The download was damaged on the way. Try again.".to_owned());
    }
    durable::write(
        &spots.loader.join(GRUB_CONFIG),
        grub_config(spots.filesystem, spots.on_filesystem).as_bytes(),
    )
    .and_then(|()| {
        durable::write(
            &spots.folder.join(BUILD_RECORD),
            format_checksum(&digest).as_bytes(),
        )
    })
    .map_err(|error| error.to_string())
}

fn gone(result: io::Result<()>) -> io::Result<()> {
    match result {
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(()),
        other => other,
    }
}

pub fn clear(folder: &Path) -> io::Result<()> {
    for live in LIVE_FOLDERS {
        gone(fs::remove_dir_all(folder.join(live)))?;
    }
    Ok(())
}

pub fn rewrite(context: &Context, source: &Source, spots: &Spots) -> Result<(), String> {
    let unfinished = spots.folder.join(UPDATING);
    durable::write(&unfinished, &[]).map_err(|error| error.to_string())?;
    clear(spots.folder).map_err(|error| error.to_string())?;
    write(context, source, spots)?;
    fs::remove_file(unfinished).map_err(|error| error.to_string())
}

pub fn remove(path: &Path) -> Result<(), String> {
    gone(fs::remove_dir_all(path))
        .map_err(|error| format!("{} couldn't be removed: {error}", path.display()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn shim_and_grub_go_on_the_esp_and_the_rest_in_the_folder() {
        let place = target(
            PathBuf::from("/boot/efi/EFI/luft-meet"),
            PathBuf::from("/home/.luft-meet"),
        );
        assert_eq!(
            place("EFI/BOOT/BOOTX64.EFI"),
            Path::new("/boot/efi/EFI/luft-meet/shimx64.efi")
        );
        assert_eq!(
            place("EFI/BOOT/mmx64.efi"),
            Path::new("/boot/efi/EFI/luft-meet/mmx64.efi")
        );
        assert_eq!(
            place("LiveOS/luft.erofs"),
            Path::new("/home/.luft-meet/LiveOS/luft.erofs")
        );
    }

    #[test]
    fn grub_finds_the_folder_by_its_filesystem() {
        assert_eq!(
            grub_config("5d3c0b62-0a3e-4c1e-9a52-7d2f1f0e8a11", "/home/.luft-meet"),
            "search --no-floppy --fs-uuid --set=root 5d3c0b62-0a3e-4c1e-9a52-7d2f1f0e8a11\nset medium='UUID=5d3c0b62-0a3e-4c1e-9a52-7d2f1f0e8a11'\nset folder='/home/.luft-meet'\nexport medium folder\nsource ${folder}/boot/menu.cfg\n"
        );
    }
}
