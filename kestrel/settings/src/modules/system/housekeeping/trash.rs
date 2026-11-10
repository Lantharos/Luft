use std::ffi::{CStr, CString};
use std::fs::File;
use std::io::{self, Read};
use std::os::fd::{AsFd, BorrowedFd, OwnedFd};

use rustix::fs::{AtFlags, Dir, Mode, OFlags};
use rustix::io::Errno;

use super::mounts;
use super::temp::open_directory;

const INFO_SUFFIX: &[u8] = b".trashinfo";
const INFO_LIMIT: u64 = 64 << 10;
const STICKY: u32 = 0o1000;

pub struct Trash {
    files: OwnedFd,
    info: OwnedFd,
}

pub fn open_all() -> Vec<Trash> {
    let owner = rustix::process::getuid().as_raw();
    let folder = OFlags::RDONLY | OFlags::DIRECTORY | OFlags::CLOEXEC;
    let mut trashes = Vec::new();
    let home = rustix::fs::open(glib::user_data_dir().join("Trash"), folder, Mode::empty());
    trashes.extend(home.ok().and_then(|trash| Trash::inside(&trash, owner)));
    for mount in mounts::mounted() {
        let Ok(top) = rustix::fs::open(&mount.path, folder, Mode::empty()) else {
            continue;
        };
        let shared = open_directory(&top, ".Trash")
            .ok()
            .filter(|shared| rustix::fs::fstat(shared).is_ok_and(|stat| stat.st_mode & STICKY != 0))
            .and_then(|shared| open_directory(shared, owner.to_string()).ok());
        let private = open_directory(&top, format!(".Trash-{owner}")).ok();
        for trash in shared.into_iter().chain(private) {
            trashes.extend(Trash::inside(&trash, owner));
        }
    }
    trashes
}

fn owned(directory: OwnedFd, owner: u32) -> Option<OwnedFd> {
    let stat = rustix::fs::fstat(&directory).ok()?;
    (stat.st_uid == owner).then_some(directory)
}

impl Trash {
    fn inside(trash: &OwnedFd, owner: u32) -> Option<Self> {
        let part = |name| owned(open_directory(trash, name).ok()?, owner);
        if rustix::fs::fstat(trash).ok()?.st_uid != owner {
            return None;
        }
        Some(Self {
            files: part("files")?,
            info: part("info")?,
        })
    }

    pub fn holds_items(&self) -> bool {
        names(self.files.as_fd()).next().is_some()
    }

    fn deletion_date(&self, info: &CStr) -> Option<glib::DateTime> {
        let flags = OFlags::RDONLY | OFlags::NOFOLLOW | OFlags::NONBLOCK | OFlags::CLOEXEC;
        let file = File::from(rustix::fs::openat(&self.info, info, flags, Mode::empty()).ok()?);
        if !file.metadata().ok()?.is_file() {
            return None;
        }
        let mut text = String::new();
        file.take(INFO_LIMIT).read_to_string(&mut text).ok()?;
        let date = text
            .lines()
            .find_map(|line| line.strip_prefix("DeletionDate="))?;
        glib::DateTime::from_iso8601(date, Some(&glib::TimeZone::local())).ok()
    }
}

pub fn purge(trashes: &[Trash], deleted_before: &glib::DateTime) {
    for trash in trashes {
        for info in names(trash.info.as_fd()) {
            let Some(item) = item_name(&info) else {
                continue;
            };
            if trash
                .deletion_date(&info)
                .is_some_and(|date| date < *deleted_before)
            {
                report(remove(trash.files.as_fd(), &item));
                report(rustix::fs::unlinkat(&trash.info, &info, AtFlags::empty()));
            }
        }
    }
}

pub fn empty(trashes: &[Trash]) {
    for trash in trashes {
        for directory in [trash.files.as_fd(), trash.info.as_fd()] {
            for name in names(directory) {
                report(remove(directory, &name));
            }
        }
    }
}

fn names(directory: BorrowedFd) -> impl Iterator<Item = CString> {
    Dir::read_from(directory)
        .into_iter()
        .flatten()
        .map_while(Result::ok)
        .map(|entry| entry.file_name().to_owned())
        .filter(|name| name.as_c_str() != c"." && name.as_c_str() != c"..")
}

fn item_name(info: &CStr) -> Option<CString> {
    let name = info.to_bytes().strip_suffix(INFO_SUFFIX)?;
    if name.is_empty() || name == b"." || name == b".." {
        return None;
    }
    CString::new(name).ok()
}

fn remove(parent: BorrowedFd, name: &CStr) -> rustix::io::Result<()> {
    match rustix::fs::unlinkat(parent, name, AtFlags::empty()) {
        Err(Errno::ISDIR) => {}
        removed => return removed,
    }
    let directory = open_directory(parent, name)?;
    for child in names(directory.as_fd()) {
        remove(directory.as_fd(), &child)?;
    }
    rustix::fs::unlinkat(parent, name, AtFlags::REMOVEDIR)
}

fn report(removed: rustix::io::Result<()>) {
    match removed {
        Ok(()) | Err(Errno::NOENT) => {}
        Err(error) => eprintln!(
            "Couldn't remove an old item from the trash: {}",
            io::Error::from(error)
        ),
    }
}

#[cfg(test)]
mod tests {
    use std::fs;
    use std::os::unix::fs::symlink;
    use std::path::{Path, PathBuf};

    use rustix::fs::CWD;

    use super::*;

    const LONG_AGO: &str = "[Trash Info]\nPath=old\nDeletionDate=2001-02-03T04:05:06\n";

    struct Scratch(PathBuf);

    impl Scratch {
        fn new(name: &str) -> Self {
            let path =
                std::env::temp_dir().join(format!("kestrel-trash-{}-{name}", std::process::id()));
            fs::create_dir_all(path.join("Trash/files")).unwrap();
            fs::create_dir_all(path.join("Trash/info")).unwrap();
            Self(path)
        }

        fn trash(&self) -> Option<Trash> {
            let trash = open_directory(CWD, self.0.join("Trash")).unwrap();
            Trash::inside(&trash, rustix::process::getuid().as_raw())
        }

        fn purge(&self) {
            let today = glib::DateTime::now_local().unwrap();
            purge(&[self.trash().unwrap()], &today);
        }
    }

    impl Drop for Scratch {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    fn write(path: PathBuf, text: &str) {
        fs::write(path, text).unwrap();
    }

    #[test]
    fn purges_only_items_deleted_before_the_cutoff() {
        let scratch = Scratch::new("cutoff");
        let trash = scratch.0.join("Trash");
        fs::create_dir_all(trash.join("files/old/inside")).unwrap();
        write(trash.join("files/old/inside/note"), "");
        write(trash.join("info/old.trashinfo"), LONG_AGO);
        write(trash.join("files/new"), "");
        write(
            trash.join("info/new.trashinfo"),
            "[Trash Info]\nPath=new\nDeletionDate=2999-01-01T00:00:00\n",
        );

        scratch.purge();

        assert!(!trash.join("files/old").exists());
        assert!(!trash.join("info/old.trashinfo").exists());
        assert!(trash.join("files/new").exists());
        assert!(trash.join("info/new.trashinfo").exists());
    }

    #[test]
    fn leaves_what_a_trashed_link_points_to() {
        let scratch = Scratch::new("link");
        let trash = scratch.0.join("Trash");
        fs::create_dir(scratch.0.join("kept")).unwrap();
        write(scratch.0.join("kept/note"), "");
        symlink(scratch.0.join("kept"), trash.join("files/old")).unwrap();
        write(trash.join("info/old.trashinfo"), LONG_AGO);

        scratch.purge();

        assert!(!trash.join("files/old").is_symlink());
        assert!(scratch.0.join("kept/note").exists());
    }

    #[test]
    fn refuses_a_trash_whose_files_folder_is_a_link() {
        let scratch = Scratch::new("planted");
        let trash = scratch.0.join("Trash");
        fs::remove_dir(trash.join("files")).unwrap();
        fs::create_dir(scratch.0.join("kept")).unwrap();
        symlink(scratch.0.join("kept"), trash.join("files")).unwrap();

        assert!(scratch.trash().is_none());
    }

    #[test]
    fn ignores_records_that_name_no_item() {
        let scratch = Scratch::new("unnamed");
        let trash = scratch.0.join("Trash");
        write(trash.join("files/kept"), "");
        for record in [".trashinfo", "..trashinfo", "...trashinfo"] {
            write(trash.join("info").join(record), LONG_AGO);
        }

        scratch.purge();

        assert!(Path::new(&trash.join("files/kept")).exists());
        assert!(trash.join("info").exists());
    }
}
