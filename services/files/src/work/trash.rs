use std::ffi::{CString, OsStr, OsString};
use std::fs::File;
use std::io::{self, Write};
use std::os::fd::{AsFd, OwnedFd};
use std::os::unix::ffi::{OsStrExt, OsStringExt};
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};

use chrono::Local;
use percent_encoding::{AsciiSet, NON_ALPHANUMERIC, percent_encode};
use rustix::fs::{
    AtFlags, FileType, Gid, Mode, OFlags, Uid, fchown, fstat, openat, statat, unlinkat,
};
use rustix::io::Errno;
use uzers::os::unix::UserExt;

use super::copy::rename_new;
use super::place::{Owner, Place, enter, make_folder, root};

const PRIVATE_FOLDER: Mode = Mode::from_raw_mode(0o700);
const PRIVATE_FILE: Mode = Mode::from_raw_mode(0o600);
const STICKY: u32 = 0o1000;
const HOME_TRASH: [&str; 3] = [".local", "share", "Trash"];

const URI_PATH: &AsciiSet = &NON_ALPHANUMERIC
    .remove(b'!')
    .remove(b'$')
    .remove(b'&')
    .remove(b'\'')
    .remove(b'(')
    .remove(b')')
    .remove(b'*')
    .remove(b'+')
    .remove(b',')
    .remove(b'-')
    .remove(b'.')
    .remove(b'/')
    .remove(b':')
    .remove(b'=')
    .remove(b'@')
    .remove(b'_')
    .remove(b'~');

/// Whoever asked, whose trash the item goes to.
pub struct Person {
    owner: Owner,
    id: u32,
    home: PathBuf,
}

struct Trash {
    folder: OwnedFd,
    path: PathBuf,
    top: Option<PathBuf>,
}

impl Person {
    pub fn find(id: u32) -> io::Result<Self> {
        let user = uzers::get_user_by_uid(id).ok_or(io::ErrorKind::NotFound)?;
        Ok(Self {
            owner: Owner {
                user: Uid::from_raw(id),
                group: Gid::from_raw(user.primary_group_id()),
            },
            id,
            home: user.home_dir().canonicalize()?,
        })
    }

    fn folder(&self, inside: impl AsFd, name: &str) -> io::Result<OwnedFd> {
        let name = CString::new(name)?;
        make_folder(&inside, &name, PRIVATE_FOLDER, self.owner)?;
        enter(&inside, &name)
    }

    fn trash_for(&self, item: &Path, device: u64) -> io::Result<Trash> {
        let home = open(&self.home)?;
        if fstat(&home)?.st_dev == device {
            let mut folder = home;
            for name in HOME_TRASH {
                folder = self.folder(&folder, name)?;
            }
            return Ok(Trash {
                folder,
                path: HOME_TRASH
                    .iter()
                    .fold(self.home.clone(), |path, name| path.join(name)),
                top: None,
            });
        }
        let top_path = top_of(item, device);
        let top = open(&top_path)?;
        if fstat(&top)?.st_dev != device {
            return Err(io::Error::other(
                "This drive changed while moving to the trash",
            ));
        }
        let shared = statat(&top, c".Trash", AtFlags::SYMLINK_NOFOLLOW).is_ok_and(|stat| {
            FileType::from_raw_mode(stat.st_mode) == FileType::Directory
                && stat.st_mode & STICKY != 0
        });
        let (folder, path) = if shared {
            let name = self.id.to_string();
            let folder = self.folder(enter(&top, c".Trash")?, &name)?;
            (folder, top_path.join(".Trash").join(name))
        } else {
            let name = format!(".Trash-{}", self.id);
            (self.folder(&top, &name)?, top_path.join(name))
        };
        Ok(Trash {
            folder,
            path,
            top: Some(top_path),
        })
    }
}

pub fn put(path: &[u8], person: &Person) -> io::Result<(Vec<u8>, Vec<u8>)> {
    let place = Place::find(path)?;
    let item = Path::new(OsStr::from_bytes(path));
    let trash = person.trash_for(item, fstat(&place.folder)?.st_dev)?;
    let files = person.folder(&trash.folder, "files")?;
    let info = person.folder(&trash.folder, "info")?;
    let recorded = match &trash.top {
        Some(top) => item.strip_prefix(top).unwrap_or(item),
        None => item,
    };
    let note = format!(
        "[Trash Info]\nPath={}\nDeletionDate={}\n",
        percent_encode(recorded.as_os_str().as_bytes(), URI_PATH),
        Local::now().format("%Y-%m-%dT%H:%M:%S")
    );

    let mut attempt = 0;
    loop {
        attempt += 1;
        let mut unique = place.name.as_bytes().to_vec();
        if attempt > 1 {
            unique.extend(format!(".{attempt}").bytes());
        }
        let mut info_name = unique.clone();
        info_name.extend(b".trashinfo");
        let (unique_name, info_name_c) = (
            CString::new(unique.clone())?,
            CString::new(info_name.clone())?,
        );
        let written = match openat(
            &info,
            &info_name_c,
            OFlags::WRONLY | OFlags::CREATE | OFlags::EXCL | OFlags::NOFOLLOW | OFlags::CLOEXEC,
            PRIVATE_FILE,
        ) {
            Ok(file) => File::from(file),
            Err(Errno::EXIST) => continue,
            Err(error) => return Err(error.into()),
        };
        let moved = (&written)
            .write_all(note.as_bytes())
            .and_then(|()| {
                Ok(fchown(
                    &written,
                    Some(person.owner.user),
                    Some(person.owner.group),
                )?)
            })
            .and_then(|()| {
                Ok(rename_new(
                    &place.folder,
                    &place.name,
                    &files,
                    &unique_name,
                )?)
            });
        match moved {
            Ok(()) => {
                let named = |folder: &str, name: Vec<u8>| {
                    trash
                        .path
                        .join(folder)
                        .join(OsString::from_vec(name))
                        .into_os_string()
                        .into_vec()
                };
                return Ok((named("files", unique), named("info", info_name)));
            }
            Err(error) => {
                let _ = unlinkat(&info, &info_name_c, AtFlags::empty());
                if error.kind() != io::ErrorKind::AlreadyExists {
                    return Err(error);
                }
            }
        }
    }
}

fn open(folder: &Path) -> io::Result<OwnedFd> {
    if folder.parent().is_none() {
        return root();
    }
    let place = Place::find(folder.as_os_str().as_bytes())?;
    enter(&place.folder, &place.name)
}

fn top_of(item: &Path, device: u64) -> PathBuf {
    let on_device = |folder: &Path| {
        folder
            .metadata()
            .is_ok_and(|metadata| metadata.dev() == device)
    };
    let mut top = item.parent().unwrap_or(item);
    while let Some(above) = top.parent()
        && on_device(above)
    {
        top = above;
    }
    top.to_path_buf()
}
