use std::fs::{self, File};
use std::path::{Path, PathBuf};

use anyhow::{Result, bail};
use luft_store_seal::Listed;

use super::{replace, root, unpack};

const IN_SHELL: &str = "/var/lib/luft/extensions";
const SANDBOXED: &str = "/var/lib/luft/sandboxed-extensions";

/// The extensions installed from schelf.store, in `<account>/<id>` of one of
/// two folders: the releases it approved to run inside the shell, and the
/// others, which Kestrel only ever runs in a sandbox. An extension is only
/// ever in one of them.
pub struct Store {
    in_shell: PathBuf,
    sandboxed: PathBuf,
}

impl Store {
    pub fn system() -> Self {
        Self {
            in_shell: PathBuf::from(IN_SHELL),
            sandboxed: PathBuf::from(SANDBOXED),
        }
    }

    #[cfg(test)]
    pub fn at(base: &Path) -> Self {
        Self {
            in_shell: base.join("extensions"),
            sandboxed: base.join("sandboxed-extensions"),
        }
    }

    fn accounts(&self, uid: u32) -> (PathBuf, PathBuf) {
        let account = uid.to_string();
        (self.in_shell.join(&account), self.sandboxed.join(account))
    }

    /// Unpacks `archive`, the file of `listed`, in place of any earlier
    /// version of `id`, wherever that was. A release that may not run inside
    /// the shell never takes the place of one that does.
    pub fn place(&self, uid: u32, id: &str, listed: &Listed, archive: File) -> Result<()> {
        let (in_shell, sandboxed) = self.accounts(uid);
        let (folder, other) = if listed.in_shell {
            (in_shell, sandboxed)
        } else {
            if exists(&in_shell.join(id)) {
                bail!(
                    "{id} {} isn't approved to run inside Luft yet, so the approved version stays.",
                    listed.version
                );
            }
            (sandboxed, in_shell)
        };
        replace(&folder, id, |staging| {
            unpack(archive, staging)?;
            root(staging)
        })?;
        remove_folder(&other.join(id))
    }

    pub fn remove(&self, uid: u32, id: &str) -> Result<()> {
        let (in_shell, sandboxed) = self.accounts(uid);
        remove_folder(&in_shell.join(id))?;
        remove_folder(&sandboxed.join(id))
    }
}

fn exists(path: &Path) -> bool {
    fs::symlink_metadata(path).is_ok()
}

fn remove_folder(path: &Path) -> Result<()> {
    if exists(path) {
        fs::remove_dir_all(path)?;
    }
    Ok(())
}
