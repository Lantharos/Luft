use std::fs::{self, File, Permissions};
use std::io::{Read, Seek, SeekFrom};
use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result, anyhow, bail};
use luft_store_seal::{Expiry, Keys, Listed, STORE_KEYS, Seal, Stamp, listed, listing_document};
use luft_unpack::{Rules, unpack_tar};
use sha2::{Digest, Sha256};
use store::Store;

const MANIFEST: &str = "extension.toml";
const RULES: Rules = Rules {
    max_bytes: 256 * 1024 * 1024,
    max_entries: 20_000,
    outward_links: false,
    keep_metadata: true,
};

/// A document as schelf.store signed it, with its seal.
pub struct Signed {
    pub body: Vec<u8>,
    pub seal: Vec<u8>,
}

fn untrusted(error: String) -> anyhow::Error {
    anyhow!(error)
}

fn checked(id: &str) -> Result<&str> {
    let valid = !id.is_empty()
        && !id.starts_with('.')
        && id
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || "._-".contains(character));
    if valid {
        Ok(id)
    } else {
        bail!("{id} isn't an extension's id")
    }
}

fn digest(archive: &mut File) -> Result<(u64, String)> {
    let mut hasher = Sha256::new();
    let mut buffer = vec![0u8; 256 * 1024];
    let mut size = 0u64;
    loop {
        let read = archive.read(&mut buffer)?;
        if read == 0 {
            break;
        }
        hasher.update(&buffer[..read]);
        size += read as u64;
    }
    archive.seek(SeekFrom::Start(0))?;
    let sha256 = hasher
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect();
    Ok((size, sha256))
}

/// Checks that schelf.store signed `listing` with keys its root vouches for,
/// that the listing still counts, and that `archive` is a release of `id` it
/// lists, which says whether it approved the release to run inside the shell.
fn release(id: &str, listing: &Signed, keys: &Signed, archive: &mut File) -> Result<Listed> {
    Stamp::read(&keys.body, STORE_KEYS, Expiry::WhenGiven)
        .and_then(|stamp| stamp.current())
        .map_err(untrusted)?;
    let keys =
        Keys::read(&keys.body, &Seal::read(&keys.seal).map_err(untrusted)?).map_err(untrusted)?;
    keys.verify(
        &listing.body,
        &Seal::read(&listing.seal).map_err(untrusted)?,
    )
    .map_err(untrusted)?;
    Stamp::read(&listing.body, &listing_document(id), Expiry::Required)
        .and_then(|stamp| stamp.current())
        .map_err(untrusted)?;
    let (size, sha256) = digest(archive)?;
    listed(&listing.body, id, size, &sha256).map_err(untrusted)
}

/// Leaves only folders, files and links inside the folder, none of them
/// writable by anyone but root.
fn settle(path: &Path) -> Result<()> {
    let metadata = fs::symlink_metadata(path)?;
    let kind = metadata.file_type();
    if kind.is_symlink() {
        return Ok(());
    }
    if kind.is_dir() {
        fs::set_permissions(path, Permissions::from_mode(0o755))?;
        for entry in fs::read_dir(path)? {
            settle(&entry?.path())?;
        }
        return Ok(());
    }
    if !kind.is_file() {
        bail!("{} isn't a file or a folder", path.display());
    }
    let runs = metadata.permissions().mode() & 0o111 != 0;
    fs::set_permissions(
        path,
        Permissions::from_mode(if runs { 0o755 } else { 0o644 }),
    )?;
    Ok(())
}

/// The extension's own folder inside what was unpacked: the archive holds
/// either its contents or the folder itself.
fn root(unpacked: &Path) -> Result<PathBuf> {
    let entries: Vec<PathBuf> = fs::read_dir(unpacked)?
        .map(|entry| entry.map(|entry| entry.path()))
        .collect::<Result<_, _>>()?;
    let root = match entries.as_slice() {
        [only] if fs::symlink_metadata(only)?.is_dir() => only.clone(),
        _ => unpacked.to_path_buf(),
    };
    if !fs::symlink_metadata(root.join(MANIFEST))?.is_file() {
        bail!("The extension has no {MANIFEST}");
    }
    Ok(root)
}

fn unpack(archive: File, into: &Path) -> Result<()> {
    fs::create_dir_all(into)?;
    let decoder = zstd::Decoder::new(archive)?;
    unpack_tar(decoder, into, RULES, |_| {}).map_err(std::io::Error::from)?;
    settle(into)
}

/// Puts what `fill` makes from an empty staging folder in place of
/// `folder/id`, leaving any earlier version there when it fails.
fn replace(folder: &Path, id: &str, fill: impl FnOnce(&Path) -> Result<PathBuf>) -> Result<()> {
    fs::create_dir_all(folder)?;
    fs::set_permissions(folder, Permissions::from_mode(0o755))?;
    let staging = folder.join(format!(".{id}.unpacking"));
    let previous = folder.join(format!(".{id}.previous"));
    let destination = folder.join(id);
    let _ = fs::remove_dir_all(&staging);
    let placed = fill(&staging).and_then(|made| {
        let _ = fs::remove_dir_all(&previous);
        if fs::symlink_metadata(&destination).is_ok() {
            fs::rename(&destination, &previous)?;
        }
        fs::rename(made, &destination)?;
        Ok(())
    });
    let _ = fs::remove_dir_all(&staging);
    let _ = fs::remove_dir_all(&previous);
    placed.with_context(|| format!("{id} couldn't be installed"))
}

/// Installs a release schelf.store lists for the account, into the folder
/// Kestrel runs inside the shell when the store approved it to run there, and
/// into the one it only ever runs in a sandbox otherwise.
pub fn install(
    uid: u32,
    id: &str,
    listing: &Signed,
    keys: &Signed,
    mut archive: File,
) -> Result<()> {
    let id = checked(id)?;
    let listed = release(id, listing, keys, &mut archive)?;
    Store::system().place(uid, id, &listed, archive)
}

/// Removes an extension from the store's folders of the account.
pub fn remove(uid: u32, id: &str) -> Result<()> {
    Store::system().remove(uid, checked(id)?)
}

mod store;
pub mod unreviewed;

#[cfg(test)]
mod tests;
