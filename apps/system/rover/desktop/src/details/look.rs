use std::collections::HashMap;
use std::ffi::{CStr, CString};
use std::io;
use std::os::unix::ffi::OsStrExt;
use std::path::Path;

use luft_app::Commands;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use specta::Type;

const ATTRIBUTE: &CStr = c"user.luft.look";
const LONGEST: usize = 64;

#[derive(Serialize, Deserialize, Type)]
pub struct FolderLook {
    pub icon: Option<String>,
    pub color: Option<String>,
}

impl FolderLook {
    fn parse(value: &[u8]) -> Option<Self> {
        let (icon, color) = std::str::from_utf8(value).ok()?.split_once(':')?;
        let named = |name: &str| (!name.is_empty()).then(|| name.to_owned());
        Some(Self {
            icon: named(icon),
            color: named(color),
        })
    }

    fn value(&self) -> String {
        format!(
            "{}:{}",
            self.icon.as_deref().unwrap_or_default(),
            self.color.as_deref().unwrap_or_default()
        )
    }
}

#[derive(Deserialize, Type)]
struct Folders {
    paths: Vec<String>,
}

#[derive(Deserialize, Type)]
struct Change {
    paths: Vec<String>,
    look: Option<FolderLook>,
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("folder_looks", |Folders { paths }| {
            Ok(paths
                .into_iter()
                .filter_map(|path| read(Path::new(&path)).map(|look| (path, look)))
                .collect::<HashMap<_, _>>())
        })
        .command("set_folder_look", |Change { paths, look }| {
            paths
                .iter()
                .try_for_each(|path| write(Path::new(path), look.as_ref()))
                .map_err(|error| explain(&error))
        })
}

pub fn read(path: &Path) -> Option<FolderLook> {
    let path = CString::new(path.as_os_str().as_bytes()).ok()?;
    let mut value = [0_u8; LONGEST];
    let length = unsafe {
        libc::getxattr(
            path.as_ptr(),
            ATTRIBUTE.as_ptr(),
            value.as_mut_ptr().cast(),
            value.len(),
        )
    };
    let length = usize::try_from(length).ok()?;
    FolderLook::parse(&value[..length])
}

pub fn copy(source: &Path, target: &Path) -> io::Result<()> {
    match read(source) {
        Some(look) => write(target, Some(&look)),
        None => Ok(()),
    }
}

fn write(path: &Path, look: Option<&FolderLook>) -> io::Result<()> {
    let path = CString::new(path.as_os_str().as_bytes())?;
    let result = match look {
        Some(look) => {
            let value = look.value();
            unsafe {
                libc::setxattr(
                    path.as_ptr(),
                    ATTRIBUTE.as_ptr(),
                    value.as_ptr().cast(),
                    value.len(),
                    0,
                )
            }
        }
        None => unsafe { libc::removexattr(path.as_ptr(), ATTRIBUTE.as_ptr()) },
    };
    if result == 0 {
        return Ok(());
    }
    match io::Error::last_os_error() {
        error if look.is_none() && error.raw_os_error() == Some(libc::ENODATA) => Ok(()),
        error => Err(error),
    }
}

fn explain(error: &io::Error) -> String {
    match error.raw_os_error() {
        Some(libc::ENOTSUP) => "This drive can’t keep folder icons".to_owned(),
        Some(libc::EPERM | libc::EACCES) => {
            "Only the folder’s owner can change its icon".to_owned()
        }
        Some(libc::EROFS) => "This drive is read-only".to_owned(),
        _ => error.to_string(),
    }
}
