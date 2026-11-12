use std::collections::BTreeMap;
use std::ffi::OsStr;
use std::fs::{self, Permissions};
use std::os::fd::BorrowedFd;
use std::os::unix::fs::PermissionsExt;
use std::path::{Component, Path, PathBuf};

use anyhow::{Context, Result, bail};

use super::{MANIFEST, RULES, checked, replace, settle};

mod copy;

const FOLDER: &str = "/var/lib/luft/unreviewed-extensions";
const FOLDERS: &str = ".folders.json";
const LONGEST_PATH: usize = 4096;

/// Extensions nobody reviewed that a person chose to run inside the shell
/// while Developer tools is on: copies in `<account>/<id>`, and the folders
/// of the account's own extensions they approved in `<account>/.folders.json`.
pub struct Unreviewed {
    base: PathBuf,
}

impl Unreviewed {
    pub fn system() -> Self {
        Self {
            base: PathBuf::from(FOLDER),
        }
    }

    #[cfg(test)]
    fn at(base: &Path) -> Self {
        Self {
            base: base.to_path_buf(),
        }
    }

    fn account(&self, uid: u32) -> PathBuf {
        self.base.join(uid.to_string())
    }

    /// Copies the extension folder `source`, which has to belong to `uid`
    /// entirely, to where only root can change it, in place of an earlier copy.
    pub fn install_copy(&self, uid: u32, id: &str, source: BorrowedFd<'_>) -> Result<()> {
        let id = checked(id)?;
        replace(&self.account(uid), id, |staging| {
            copy::copy(source, uid, staging, copy::Budget::from(RULES))?;
            if !fs::symlink_metadata(staging.join(MANIFEST))?.is_file() {
                bail!("The extension has no {MANIFEST}");
            }
            settle(staging)?;
            Ok(staging.to_path_buf())
        })
    }

    /// Records that the account's extension `id` may run inside the shell from
    /// `path`, the folder it's in.
    pub fn allow_folder(&self, uid: u32, id: &str, path: &str) -> Result<()> {
        let id = checked(id)?;
        let path = folder_of(id, path)?;
        let mut folders = self.folders(uid)?;
        folders.insert(id.to_owned(), path);
        self.write_folders(uid, &folders)
    }

    /// Takes away the copy of `id` and the approval of its folder.
    pub fn remove(&self, uid: u32, id: &str) -> Result<()> {
        let id = checked(id)?;
        let copy = self.account(uid).join(id);
        if fs::symlink_metadata(&copy).is_ok() {
            fs::remove_dir_all(copy)?;
        }
        let mut folders = self.folders(uid)?;
        if folders.remove(id).is_some() {
            self.write_folders(uid, &folders)?;
        }
        Ok(())
    }

    fn folders(&self, uid: u32) -> Result<BTreeMap<String, String>> {
        match fs::read(self.account(uid).join(FOLDERS)) {
            Ok(text) => serde_json::from_slice(&text).context("The approved folders can't be read"),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(BTreeMap::new()),
            Err(error) => Err(error.into()),
        }
    }

    fn write_folders(&self, uid: u32, folders: &BTreeMap<String, String>) -> Result<()> {
        let account = self.account(uid);
        fs::create_dir_all(&account)?;
        fs::set_permissions(&account, Permissions::from_mode(0o755))?;
        let writing = account.join(format!("{FOLDERS}.writing"));
        fs::write(&writing, serde_json::to_vec(folders)?)?;
        fs::set_permissions(&writing, Permissions::from_mode(0o644))?;
        fs::rename(writing, account.join(FOLDERS))?;
        Ok(())
    }
}

/// `path` written plainly, once it names a folder called `id` by a full path
/// with no way around it.
fn folder_of(id: &str, path: &str) -> Result<String> {
    let given = Path::new(path);
    let plain = path.len() <= LONGEST_PATH
        && given.is_absolute()
        && given
            .components()
            .all(|part| matches!(part, Component::RootDir | Component::Normal(_)))
        && given.file_name() == Some(OsStr::new(id));
    if !plain {
        bail!("{path} isn't the folder of {id}");
    }
    Ok(given
        .components()
        .collect::<PathBuf>()
        .to_string_lossy()
        .into_owned())
}

#[cfg(test)]
mod tests;
