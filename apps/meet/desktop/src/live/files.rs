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
#[cfg(windows)]
const GRUB_CONFIGS: [&str; 2] = ["EFI/BOOT/grub.cfg", "EFI/fedora/grub.cfg"];
pub const BUILD_RECORD: &str = "LiveOS/iso.sha256";
pub const UPDATING: &str = "updating";
const ARRIVING: &str = ".arriving";

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

#[cfg(any(windows, test))]
pub fn grub_config(live_partition: &str) -> String {
    format!("set medium='PARTUUID={live_partition}'\nexport medium\nsource /boot/menu.cfg\n")
}

#[cfg(windows)]
pub fn write_grub_configs(start: &Path, live_partition: &str) -> io::Result<()> {
    for config in GRUB_CONFIGS {
        let path = start.join(config);
        fs::create_dir_all(path.parent().expect("configs live in folders"))?;
        fs::write(path, grub_config(live_partition))?;
    }
    Ok(())
}

pub fn on(root: &Path, path: &str) -> PathBuf {
    path.split('/')
        .fold(root.to_owned(), |target, part| target.join(part))
}

#[cfg(windows)]
fn gone(result: io::Result<()>) -> io::Result<()> {
    match result {
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(()),
        other => other,
    }
}

#[cfg(windows)]
pub fn clear(start: &Path, live: &Path) -> io::Result<()> {
    for file in START_FILES {
        gone(fs::remove_file(on(start, file)))?;
    }
    gone(fs::remove_dir_all(on(live, LIVE_FOLDER)))
}

#[cfg(windows)]
pub fn split(start: PathBuf, live: PathBuf) -> impl Fn(&str) -> PathBuf {
    move |path| {
        let root = match place(path) {
            Some(Place::Start) => &start,
            _ => &live,
        };
        on(root, path)
    }
}

pub struct Volumes<F> {
    target: F,
    open: Option<(String, File)>,
    arriving: Vec<PathBuf>,
}

fn arriving_at(path: &Path) -> PathBuf {
    let mut name = path.as_os_str().to_owned();
    name.push(ARRIVING);
    PathBuf::from(name)
}

impl<F: Fn(&str) -> PathBuf> Volumes<F> {
    pub fn new(target: F) -> Self {
        Self {
            target,
            open: None,
            arriving: Vec::new(),
        }
    }

    fn file(&mut self, path: &str) -> io::Result<&mut File> {
        if self.open.as_ref().is_none_or(|(open, _)| open != path) {
            let target = (self.target)(path);
            fs::create_dir_all(target.parent().expect("files live in folders"))?;
            let first = !self.arriving.contains(&target);
            let file = OpenOptions::new()
                .create(true)
                .write(true)
                .truncate(first)
                .open(arriving_at(&target))?;
            if first {
                self.arriving.push(target);
            }
            self.open = Some((path.to_owned(), file));
        }
        Ok(&mut self.open.as_mut().expect("just opened").1)
    }

    fn finish(&mut self) -> io::Result<()> {
        if let Some((_, file)) = self.open.take() {
            file.sync_all()?;
        }
        Ok(())
    }

    pub fn put_in_place(mut self) -> io::Result<()> {
        self.finish()?;
        while let Some(target) = self.arriving.last() {
            fs::rename(arriving_at(target), target)?;
            self.arriving.pop();
        }
        Ok(())
    }
}

impl<F> Drop for Volumes<F> {
    fn drop(&mut self) {
        self.open = None;
        for target in &self.arriving {
            let _ = fs::remove_file(arriving_at(target));
        }
    }
}

impl<F: Fn(&str) -> PathBuf> Sink for Volumes<F> {
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
    fn files_reach_their_place_only_once_put_there() {
        let root = std::env::temp_dir().join(format!("meet-volumes-{}", std::process::id()));
        let target = |root: PathBuf| move |path: &str| on(&root, path);
        let mut kept = Volumes::new(target(root.join("kept")));
        kept.write("LiveOS/luft.erofs", 0, b"luft").unwrap();
        kept.write("boot/menu.cfg", 0, b"menu").unwrap();
        kept.write("LiveOS/luft.erofs", 4, b"!").unwrap();
        assert!(!root.join("kept/LiveOS/luft.erofs").exists());
        kept.put_in_place().unwrap();
        let mut dropped = Volumes::new(target(root.join("dropped")));
        dropped.write("LiveOS/luft.erofs", 0, b"luft").unwrap();
        drop(dropped);
        let erofs = fs::read(root.join("kept/LiveOS/luft.erofs")).unwrap();
        let leftovers = fs::read_dir(root.join("dropped/LiveOS")).unwrap().count();
        fs::remove_dir_all(&root).unwrap();
        assert_eq!(erofs, b"luft!");
        assert_eq!(leftovers, 0);
    }

    #[test]
    fn grub_finds_the_live_system_by_its_partition() {
        assert_eq!(
            grub_config("0a1b2c3d-0000-4000-8000-00000000bbbb"),
            "set medium='PARTUUID=0a1b2c3d-0000-4000-8000-00000000bbbb'\nexport medium\nsource /boot/menu.cfg\n"
        );
    }
}
