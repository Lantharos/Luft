use std::fs::{self, File, OpenOptions};
use std::io::{self, Seek, SeekFrom, Write};
use std::path::{Path, PathBuf};

use super::iso::{Entry, Sink};

const START_FILES: [&str; 6] = [
    "EFI/BOOT/BOOTX64.EFI",
    "EFI/BOOT/grubx64.efi",
    "EFI/BOOT/mmx64.efi",
    "boot/vmlinuz",
    "boot/initrd.img",
    "boot/menu.cfg",
];
const LIVE_FOLDER: &str = "LiveOS/";
const GRUB_CONFIGS: [&str; 2] = ["EFI/BOOT/grub.cfg", "EFI/fedora/grub.cfg"];

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Place {
    Start,
    Live,
}

pub fn place(path: &str) -> Option<Place> {
    if START_FILES.contains(&path) {
        Some(Place::Start)
    } else if path.starts_with(LIVE_FOLDER) {
        Some(Place::Live)
    } else {
        None
    }
}

pub fn bytes_for(entries: &[Entry], wanted: Place) -> u64 {
    entries
        .iter()
        .filter(|entry| place(&entry.path) == Some(wanted))
        .map(|entry| entry.size)
        .sum()
}

pub fn missing(entries: &[Entry]) -> Option<&'static str> {
    START_FILES
        .into_iter()
        .find(|wanted| !entries.iter().any(|entry| entry.path == *wanted))
}

pub fn grub_config(live_partition: &str) -> String {
    format!("set medium='PARTUUID={live_partition}'\nexport medium\nsource /boot/menu.cfg\n")
}

pub fn write_grub_configs(start: &Path, live_partition: &str) -> io::Result<()> {
    for config in GRUB_CONFIGS {
        let path = start.join(config);
        fs::create_dir_all(path.parent().expect("configs live in folders"))?;
        fs::write(path, grub_config(live_partition))?;
    }
    Ok(())
}

pub struct Volumes {
    start: PathBuf,
    live: PathBuf,
    open: Option<(String, File)>,
}

impl Volumes {
    pub fn new(start: PathBuf, live: PathBuf) -> Self {
        Self {
            start,
            live,
            open: None,
        }
    }

    fn target(&self, path: &str) -> PathBuf {
        let root = match place(path) {
            Some(Place::Start) => &self.start,
            _ => &self.live,
        };
        path.split('/')
            .fold(root.clone(), |target, part| target.join(part))
    }

    fn file(&mut self, path: &str) -> io::Result<&mut File> {
        if self.open.as_ref().is_none_or(|(open, _)| open != path) {
            let target = self.target(path);
            fs::create_dir_all(target.parent().expect("files live in folders"))?;
            let file = OpenOptions::new()
                .create(true)
                .write(true)
                .truncate(false)
                .open(&target)?;
            self.open = Some((path.to_owned(), file));
        }
        Ok(&mut self.open.as_mut().expect("just opened").1)
    }

    pub fn finish(&mut self) -> io::Result<()> {
        if let Some((_, file)) = self.open.take() {
            file.sync_all()?;
        }
        Ok(())
    }
}

impl Sink for Volumes {
    fn wants(&self, path: &str) -> bool {
        place(path).is_some()
    }

    fn write(&mut self, path: &str, offset: u64, data: &[u8]) -> io::Result<()> {
        let file = self.file(path)?;
        if file.stream_position()? != offset {
            file.seek(SeekFrom::Start(offset))?;
        }
        file.write_all(data)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_boot_files_go_on_the_start_partition_and_the_system_on_the_live_one() {
        assert_eq!(place("EFI/BOOT/BOOTX64.EFI"), Some(Place::Start));
        assert_eq!(place("boot/initrd.img"), Some(Place::Start));
        assert_eq!(place("LiveOS/luft.erofs"), Some(Place::Live));
        assert_eq!(place("EFI/fedora/grub.cfg"), None);
        let entries = [
            Entry {
                path: "boot/vmlinuz".into(),
                size: 10,
            },
            Entry {
                path: "LiveOS/luft.erofs".into(),
                size: 1000,
            },
        ];
        assert_eq!(bytes_for(&entries, Place::Live), 1000);
        assert_eq!(missing(&entries), Some("EFI/BOOT/BOOTX64.EFI"));
    }

    #[test]
    fn grub_finds_the_live_system_by_its_partition() {
        assert_eq!(
            grub_config("0a1b2c3d-0000-4000-8000-00000000bbbb"),
            "set medium='PARTUUID=0a1b2c3d-0000-4000-8000-00000000bbbb'\nexport medium\nsource /boot/menu.cfg\n"
        );
    }
}
