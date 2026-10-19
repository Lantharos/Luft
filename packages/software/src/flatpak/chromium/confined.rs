use std::ffi::OsStr;
use std::fs::File;
use std::io::{self, Read, Write};
use std::os::fd::OwnedFd;
use std::path::{Component, Path};

use rustix::fs::{
    AtFlags, FileType, Mode, OFlags, ResolveFlags, fstat, mkdirat, openat2, renameat, unlinkat,
};
use rustix::io::Errno;

const RESOLVE: ResolveFlags = ResolveFlags::BENEATH
    .union(ResolveFlags::NO_SYMLINKS)
    .union(ResolveFlags::NO_MAGICLINKS);
const FOLDER_MODE: u32 = 0o755;
const FILE_MODE: u32 = 0o644;
const MAX_TEXT: u64 = 64 * 1024;
const STAGING_SUFFIX: &str = ".luft-part";

pub struct Folder(OwnedFd);

fn stays_inside(path: &Path) -> bool {
    path.components()
        .all(|component| matches!(component, Component::Normal(_)))
}

pub fn relative(path: &Path) -> Option<&Path> {
    (path.file_name().is_some() && stays_inside(path)).then_some(path)
}

fn refused(reason: &str) -> io::Error {
    io::Error::new(io::ErrorKind::InvalidInput, reason)
}

impl Folder {
    pub fn open(path: &Path) -> io::Result<Self> {
        let flags = OFlags::RDONLY | OFlags::DIRECTORY | OFlags::CLOEXEC;
        Ok(Self(rustix::fs::open(path, flags, Mode::empty())?))
    }

    pub fn descend(&self, path: &Path) -> io::Result<Self> {
        if !stays_inside(path) {
            return Err(refused("This path leaves its folder."));
        }
        path.components()
            .try_fold(Self(self.0.try_clone()?), |folder, component| {
                folder.child(component.as_os_str())
            })
    }

    fn child(&self, name: &OsStr) -> io::Result<Self> {
        match mkdirat(&self.0, name, Mode::from_raw_mode(FOLDER_MODE)) {
            Ok(()) | Err(Errno::EXIST) => {}
            Err(error) => return Err(error.into()),
        }
        let flags = OFlags::RDONLY | OFlags::DIRECTORY | OFlags::NOFOLLOW | OFlags::CLOEXEC;
        Ok(Self(openat2(&self.0, name, flags, Mode::empty(), RESOLVE)?))
    }

    pub fn read_text(&self, name: &OsStr) -> io::Result<String> {
        let flags = OFlags::RDONLY | OFlags::NOFOLLOW | OFlags::NONBLOCK | OFlags::CLOEXEC;
        let file = match openat2(&self.0, name, flags, Mode::empty(), RESOLVE) {
            Ok(file) => file,
            Err(Errno::NOENT) => return Ok(String::new()),
            Err(error) => return Err(error.into()),
        };
        let status = fstat(&file)?;
        if FileType::from_raw_mode(status.st_mode) != FileType::RegularFile {
            return Err(refused("This isn't a regular file."));
        }
        let mut bytes = Vec::new();
        File::from(file)
            .take(MAX_TEXT + 1)
            .read_to_end(&mut bytes)?;
        if bytes.len() as u64 > MAX_TEXT {
            return Err(refused("This file is too large to be a list of settings."));
        }
        String::from_utf8(bytes).map_err(|_| refused("This file isn't text."))
    }

    pub fn replace(&self, name: &OsStr, text: &str) -> io::Result<()> {
        let mut staging = name.to_owned();
        staging.push(STAGING_SUFFIX);
        let flags =
            OFlags::WRONLY | OFlags::CREATE | OFlags::EXCL | OFlags::NOFOLLOW | OFlags::CLOEXEC;
        let mode = Mode::from_raw_mode(FILE_MODE);
        let file = match openat2(&self.0, &staging, flags, mode, RESOLVE) {
            Err(Errno::EXIST) => {
                unlinkat(&self.0, &staging, AtFlags::empty())?;
                openat2(&self.0, &staging, flags, mode, RESOLVE)?
            }
            opened => opened?,
        };
        let written = File::from(file)
            .write_all(text.as_bytes())
            .and_then(|()| Ok(renameat(&self.0, &staging, &self.0, name)?));
        if written.is_err() {
            let _ = unlinkat(&self.0, &staging, AtFlags::empty());
        }
        written
    }
}

#[cfg(test)]
mod tests {
    use std::fs;
    use std::os::unix::fs::symlink;
    use std::path::PathBuf;

    use super::*;

    struct Scratch(PathBuf);

    impl Scratch {
        fn new(name: &str) -> Self {
            let path =
                std::env::temp_dir().join(format!("luft-confined-{}-{name}", std::process::id()));
            let _ = fs::remove_dir_all(&path);
            fs::create_dir_all(&path).unwrap();
            Self(path)
        }
    }

    impl Drop for Scratch {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    #[test]
    fn relative_paths_stay_inside() {
        assert!(relative(Path::new("discord-flags.conf")).is_some());
        assert!(relative(Path::new("obsidian/user-flags.conf")).is_some());
        assert!(relative(Path::new("")).is_none());
        assert!(relative(Path::new("../.bashrc")).is_none());
        assert!(relative(Path::new("a/../../b")).is_none());
        assert!(relative(Path::new("/etc/passwd")).is_none());
    }

    #[test]
    fn writes_through_new_folders() {
        let scratch = Scratch::new("create");
        let config = Folder::open(&scratch.0)
            .unwrap()
            .descend(Path::new(".var/app/a/config"))
            .unwrap();
        config.replace(OsStr::new("a-flags.conf"), "one\n").unwrap();
        assert_eq!(
            config.read_text(OsStr::new("a-flags.conf")).unwrap(),
            "one\n"
        );
        assert_eq!(
            fs::read_to_string(scratch.0.join(".var/app/a/config/a-flags.conf")).unwrap(),
            "one\n"
        );
    }

    #[test]
    fn refuses_a_linked_file() {
        let scratch = Scratch::new("file");
        let outside = scratch.0.join("bashrc");
        fs::write(&outside, "kept\n").unwrap();
        fs::create_dir_all(scratch.0.join("config")).unwrap();
        symlink(&outside, scratch.0.join("config/a-flags.conf")).unwrap();
        let config = Folder::open(&scratch.0)
            .unwrap()
            .descend(Path::new("config"))
            .unwrap();
        assert!(config.read_text(OsStr::new("a-flags.conf")).is_err());
        assert_eq!(fs::read_to_string(&outside).unwrap(), "kept\n");
    }

    #[test]
    fn refuses_a_linked_folder() {
        let scratch = Scratch::new("folder");
        fs::create_dir_all(scratch.0.join("elsewhere")).unwrap();
        fs::create_dir_all(scratch.0.join("app")).unwrap();
        symlink(scratch.0.join("elsewhere"), scratch.0.join("app/config")).unwrap();
        assert!(
            Folder::open(&scratch.0)
                .unwrap()
                .descend(Path::new("app/config"))
                .is_err()
        );
    }

    #[test]
    fn replacing_never_writes_through_a_planted_staging_link() {
        let scratch = Scratch::new("staging");
        let outside = scratch.0.join("bashrc");
        fs::write(&outside, "kept\n").unwrap();
        symlink(
            &outside,
            scratch.0.join(format!("a-flags.conf{STAGING_SUFFIX}")),
        )
        .unwrap();
        let folder = Folder::open(&scratch.0).unwrap();
        folder.replace(OsStr::new("a-flags.conf"), "new\n").unwrap();
        assert_eq!(fs::read_to_string(&outside).unwrap(), "kept\n");
        assert_eq!(
            fs::read_to_string(scratch.0.join("a-flags.conf")).unwrap(),
            "new\n"
        );
    }

    #[test]
    fn leaves_binary_files_alone() {
        let scratch = Scratch::new("binary");
        fs::write(scratch.0.join("a-flags.conf"), [0xff, 0xfe, 0x00]).unwrap();
        let folder = Folder::open(&scratch.0).unwrap();
        assert!(folder.read_text(OsStr::new("a-flags.conf")).is_err());
    }
}
