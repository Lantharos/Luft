use std::path::{Path, PathBuf};
use std::time::SystemTime;

use gio::prelude::*;

const MARK: &str = "user.luft.screenshots";

pub fn folders() -> Vec<PathBuf> {
    let pictures =
        glib::user_special_dir(glib::UserDirectory::Pictures).unwrap_or_else(glib::home_dir);
    marked_folders(&pictures)
}

pub fn trash(folders: &[PathBuf], taken_before: SystemTime) {
    for screenshot in taken_earlier(folders, taken_before) {
        if let Err(error) = gio::File::for_path(screenshot).trash(gio::Cancellable::NONE) {
            eprintln!("Couldn't move an old screenshot to the trash: {error}");
        }
    }
}

fn marked_folders(pictures: &Path) -> Vec<PathBuf> {
    let Ok(entries) = std::fs::read_dir(pictures) else {
        return Vec::new();
    };
    entries
        .flatten()
        .filter(|entry| entry.file_type().is_ok_and(|kind| kind.is_dir()))
        .map(|entry| entry.path())
        .filter(|folder| marked(folder))
        .collect()
}

fn taken_earlier(folders: &[PathBuf], taken_before: SystemTime) -> Vec<PathBuf> {
    folders
        .iter()
        .filter_map(|folder| std::fs::read_dir(folder).ok())
        .flat_map(|entries| entries.flatten())
        .filter(|entry| {
            entry.metadata().is_ok_and(|metadata| {
                metadata.is_file() && metadata.modified().is_ok_and(|taken| taken < taken_before)
            })
        })
        .map(|entry| entry.path())
        .collect()
}

fn marked(folder: &Path) -> bool {
    rustix::fs::getxattr(folder, MARK, &mut [0_u8; 0]).is_ok()
}

#[cfg(test)]
mod tests {
    use std::fs::{self, File};
    use std::time::Duration;

    use super::*;

    const DAY: Duration = Duration::from_secs(24 * 60 * 60);

    struct Pictures(PathBuf);

    impl Pictures {
        fn new() -> Self {
            let path =
                std::env::temp_dir().join(format!("kestrel-screenshots-{}", std::process::id()));
            fs::create_dir_all(&path).unwrap();
            Self(path)
        }

        fn folder(&self, name: &str, screenshots: bool) -> PathBuf {
            let folder = self.0.join(name);
            fs::create_dir(&folder).unwrap();
            if screenshots {
                rustix::fs::setxattr(&folder, MARK, b"", rustix::fs::XattrFlags::empty()).unwrap();
            }
            folder
        }
    }

    impl Drop for Pictures {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    fn taken(path: PathBuf, days_ago: u32) -> PathBuf {
        File::create(&path)
            .unwrap()
            .set_modified(SystemTime::now() - DAY * days_ago)
            .unwrap();
        path
    }

    #[test]
    fn only_screenshots_older_than_the_cutoff_in_the_screenshots_folder_go() {
        let pictures = Pictures::new();
        let screenshots = pictures.folder("Screenshots", true);
        let old = taken(screenshots.join("Screenshot from August.png"), 40);
        taken(screenshots.join("Screenshot from October.png"), 20);
        fs::create_dir(screenshots.join("Kept apart")).unwrap();
        taken(pictures.folder("Holiday", false).join("Beach.png"), 40);

        let folders = marked_folders(&pictures.0);

        assert_eq!(folders, [screenshots]);
        assert_eq!(taken_earlier(&folders, SystemTime::now() - DAY * 30), [old]);
    }
}
