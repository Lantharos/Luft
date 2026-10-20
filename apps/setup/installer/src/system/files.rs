use std::ffi::CString;
use std::fs::File;
use std::io::{ErrorKind, Write};
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd, RawFd};
use std::os::unix::ffi::OsStrExt;
use std::path::Path;

use anyhow::{Context, Result};
use luft_i18n::t;

use crate::L10N;

pub fn write(path: &Path, contents: &str) -> Result<()> {
    let parent = path.parent().context("A file needs a folder")?;
    std::fs::create_dir_all(parent)?;
    let staged = parent.join(format!(
        ".{}.new",
        path.file_name()
            .context("A file needs a name")?
            .to_string_lossy()
    ));
    let mut file = std::fs::File::create(&staged)?;
    file.write_all(contents.as_bytes())?;
    file.sync_all()?;
    std::fs::rename(&staged, path).with_context(|| {
        t!(
            L10N,
            "installer-write-failed",
            path = path.display().to_string()
        )
    })
}

pub fn remove_beneath(root: &Path, relative: &str) -> Result<()> {
    let relative = Path::new(relative.trim_start_matches('/'));
    let name = relative.file_name().context("There's nothing to remove")?;
    let parent = match relative.parent() {
        Some(parent) if !parent.as_os_str().is_empty() => parent,
        _ => Path::new("."),
    };
    let root = File::open(root).with_context(|| format!("Couldn't open {}", root.display()))?;
    let parent = match open_beneath(&root, parent) {
        Err(error) if error.kind() == ErrorKind::NotFound => return Ok(()),
        opened => opened.with_context(|| format!("Couldn't open {}", parent.display()))?,
    };
    let path = Path::new("/proc/self/fd")
        .join(parent.as_raw_fd().to_string())
        .join(name);
    match std::fs::remove_dir_all(&path) {
        Err(error) if error.kind() != ErrorKind::NotFound => {
            Err(error).with_context(|| format!("{} couldn't be removed", relative.display()))
        }
        _ => Ok(()),
    }
}

fn open_beneath(root: &File, path: &Path) -> std::io::Result<OwnedFd> {
    let path = CString::new(path.as_os_str().as_bytes())?;
    let mut how: libc::open_how = unsafe { std::mem::zeroed() };
    how.flags = (libc::O_PATH | libc::O_DIRECTORY | libc::O_CLOEXEC) as u64;
    how.resolve = libc::RESOLVE_BENEATH
        | libc::RESOLVE_NO_SYMLINKS
        | libc::RESOLVE_NO_MAGICLINKS
        | libc::RESOLVE_NO_XDEV;
    let fd = unsafe {
        libc::syscall(
            libc::SYS_openat2,
            root.as_raw_fd(),
            path.as_ptr(),
            &how,
            size_of::<libc::open_how>(),
        )
    };
    if fd < 0 {
        return Err(std::io::Error::last_os_error());
    }
    Ok(unsafe { OwnedFd::from_raw_fd(fd as RawFd) })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn removes_only_what_lies_beneath_the_mount() {
        let folder = std::env::temp_dir().join(format!("luft-beneath-{}", std::process::id()));
        let (root, outside) = (folder.join("root"), folder.join("outside"));
        std::fs::create_dir_all(root.join("home/.luft-meet/live")).unwrap();
        std::fs::create_dir_all(outside.join("kept")).unwrap();
        std::os::unix::fs::symlink(&outside, root.join("escape")).unwrap();

        assert!(remove_beneath(&root, "/escape/kept").is_err());
        assert!(remove_beneath(&root, "/home/../../outside/kept").is_err());
        assert!(outside.join("kept").exists());
        remove_beneath(&root, "/home/.luft-meet").unwrap();
        assert!(!root.join("home/.luft-meet").exists());
        remove_beneath(&root, "/home/.luft-meet").unwrap();

        std::fs::remove_dir_all(folder).unwrap();
    }
}
