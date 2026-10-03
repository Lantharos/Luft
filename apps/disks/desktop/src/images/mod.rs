mod copy;

use std::fs::File;
use std::os::fd::OwnedFd;
use std::path::Path;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};

use luft_app::Events;
use luft_app::portal::{self, FileChooser, Filter};
use parking_lot::Mutex;
use serde::Serialize;

use crate::actions::mounting;
use crate::udisks::{self, BLOCK, TABLE, no_options};
use copy::Direction;

const IMAGE_PATTERNS: &[&str] = &["*.iso", "*.img", "*.raw", "*.bin"];

#[derive(Clone, Default)]
pub struct Imaging {
    running: Arc<Mutex<Option<Arc<AtomicBool>>>>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChosenImage {
    path: String,
    name: String,
    size: u64,
}

impl ChosenImage {
    pub fn read(path: &Path) -> Result<Self, String> {
        let size = std::fs::metadata(path)
            .map_err(|error| error.to_string())?
            .len();
        Ok(Self {
            name: path
                .file_name()
                .map(|name| name.to_string_lossy().into_owned())
                .unwrap_or_default(),
            path: path.to_string_lossy().into_owned(),
            size,
        })
    }

    pub fn is_image(path: &Path) -> bool {
        path.is_file()
            && path
                .extension()
                .and_then(|extension| extension.to_str())
                .is_some_and(|extension| {
                    IMAGE_PATTERNS
                        .iter()
                        .any(|pattern| pattern[2..].eq_ignore_ascii_case(extension))
                })
    }
}

pub fn default_folder() -> String {
    gio::glib::user_special_dir(gio::glib::UserDirectory::Documents)
        .unwrap_or_else(gio::glib::home_dir)
        .to_string_lossy()
        .into_owned()
}

impl Imaging {
    pub fn create(&self, events: &Events, block: &str, destination: &Path) -> Result<(), String> {
        if destination.exists() {
            return Err("A file with that name is already there".to_owned());
        }
        let source: zbus::zvariant::OwnedFd =
            udisks::call(block, BLOCK, "OpenForBackup", &(no_options(),))?;
        let output = File::create_new(destination).map_err(|error| error.to_string())?;
        self.start(
            events,
            block,
            Direction::Create {
                source: File::from(OwnedFd::from(source)),
                output,
                destination: destination.to_path_buf(),
            },
        )
    }

    pub fn choose_folder(&self) -> Result<Option<String>, String> {
        let chosen = FileChooser {
            title: "Choose a folder",
            directory: true,
            ..FileChooser::default()
        }
        .open()?;
        Ok(chosen
            .first()
            .and_then(|uri| portal::uri_path(uri))
            .map(|path| path.to_string_lossy().into_owned()))
    }

    pub fn choose(&self) -> Result<Option<ChosenImage>, String> {
        let filter = Filter {
            name: "Disk images",
            patterns: IMAGE_PATTERNS
                .iter()
                .map(|pattern| pattern.to_string())
                .collect(),
        };
        let Some(uri) = portal::open_file("Choose a disk image", filter)? else {
            return Ok(None);
        };
        let path =
            portal::uri_path(&uri).ok_or("Disk images can only be opened from local folders")?;
        ChosenImage::read(&path).map(Some)
    }

    pub fn restore(&self, events: &Events, block: &str, image: &Path) -> Result<(), String> {
        let input = File::open(image).map_err(|error| error.to_string())?;
        let objects = udisks::objects()?;
        let capacity = objects
            .get(block, BLOCK)
            .and_then(|target| target.get::<u64>("Size"))
            .unwrap_or(0);
        let size = input.metadata().map_err(|error| error.to_string())?.len();
        if size > capacity {
            return Err("This image is bigger than the space it would be written to".to_owned());
        }
        let partitions = objects
            .get(block, TABLE)
            .and_then(|table| table.get::<Vec<zbus::zvariant::OwnedObjectPath>>("Partitions"))
            .unwrap_or_default();
        for partition in &partitions {
            mounting::release_in(&objects, partition.as_str())?;
        }
        mounting::release_in(&objects, block)?;
        let target: zbus::zvariant::OwnedFd =
            udisks::call(block, BLOCK, "OpenForRestore", &(no_options(),))?;
        self.start(
            events,
            block,
            Direction::Restore {
                input,
                target: File::from(OwnedFd::from(target)),
                size,
            },
        )
    }

    pub fn cancel(&self) {
        if let Some(cancelled) = self.running.lock().as_ref() {
            cancelled.store(true, Ordering::Relaxed);
        }
    }

    fn start(&self, events: &Events, block: &str, direction: Direction) -> Result<(), String> {
        let cancelled = Arc::new(AtomicBool::new(false));
        {
            let mut running = self.running.lock();
            if running.is_some() {
                return Err("Another disk image is still being copied".to_owned());
            }
            *running = Some(cancelled.clone());
        }
        let running = self.running.clone();
        let events = events.clone();
        let block = block.to_owned();
        std::thread::spawn(move || {
            copy::run(&events, &block, direction, &cancelled);
            *running.lock() = None;
        });
        Ok(())
    }
}
