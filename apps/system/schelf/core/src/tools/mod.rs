//! Command-line tools from schelf.store: one program each, checked against
//! the index the store signs for it and installed for you in `~/.local/bin`.

mod record;
mod unpack;

use std::fs;
use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};
use std::time::Duration;

use luft_software::http::MISSING;
use luft_software::progress::Stage;
use luft_software::task::Task;
use schelf_publish::tools::{self as names, File, Handle, Release, STORE_TOOL, ToolIndex};

use crate::host;
use crate::store::install::download::{self, Published};
use crate::store::revocations::{self, Severity};
use crate::store::signed::{self, Age};
use crate::store::{DOWNLOADS, device, invited};

pub use record::{InstalledTool, all as installed, get};

pub const STABLE: &str = "stable";
const FRESH: Duration = Duration::from_secs(60);

#[cfg(all(target_os = "linux", target_arch = "x86_64"))]
const TARGET: &str = "linux-x86_64";
#[cfg(all(target_os = "linux", target_arch = "aarch64"))]
const TARGET: &str = "linux-aarch64";
#[cfg(all(target_os = "macos", target_arch = "aarch64"))]
const TARGET: &str = "macos-aarch64";
#[cfg(all(target_os = "macos", target_arch = "x86_64"))]
const TARGET: &str = "macos-x86_64";

/// The folder tools are installed in: `SCHELF_BIN`, as the install script
/// takes it, or `~/.local/bin`.
pub fn folder() -> PathBuf {
    std::env::var_os("SCHELF_BIN")
        .filter(|folder| !folder.is_empty())
        .map(PathBuf::from)
        .unwrap_or_else(|| dirs::home_dir().unwrap_or_default().join(".local/bin"))
}

/// A tool as schelf.store lists it, on the channel you get it from.
pub struct Tool {
    pub index: ToolIndex,
    pub channel: String,
}

impl Tool {
    /// The release this computer gets and its file, when there's one for it.
    pub fn offer(&self) -> Option<(&Release, &File)> {
        self.index
            .release_for(&self.channel, device::draw(), TARGET)
    }

    /// Who publishes it, as you're told before installing it.
    pub fn publisher(&self) -> &str {
        &self.index.publisher.name
    }
}

fn index(path: &str, session: Option<&str>) -> Result<Option<ToolIndex>, String> {
    let read = match session {
        Some(session) => signed::fetch_invited(path, Age::Within(FRESH), session),
        None => signed::fetch(path, Age::Within(FRESH)),
    };
    match read {
        Ok(bytes) => serde_json::from_slice(&bytes)
            .map(Some)
            .map_err(|error| error.to_string()),
        Err(error) if error == MISSING => Ok(None),
        Err(error) => Err(error),
    }
}

/// The tool `handle` names, a bare name or `publisher/name`, on `channel`;
/// none when schelf.store has no tool by it. An invite-only channel is read
/// with your schelf.store sign-in.
pub fn find(handle: &str, channel: &str) -> Result<Option<Tool>, String> {
    let Some(asked) = names::handle(handle) else {
        return Ok(None);
    };
    let Some(public) = index(&names::index_path(asked), None)? else {
        return Ok(None);
    };
    let now = public.channel_now(channel).to_owned();
    if public.releases.iter().any(|release| release.channel == now) || now == STABLE {
        return Ok(Some(Tool {
            index: public,
            channel: now,
        }));
    }
    let path = names::invited_index_path(&public.publisher.slug, &public.name, &now);
    let session = invited::session_for(&format!("{DOWNLOADS}{path}"))?;
    Ok(index(&path, session.as_deref())?.map(|index| Tool {
        index,
        channel: now,
    }))
}

/// Whether `handle` is the address of a tool rather than a bare name.
pub fn is_address(handle: &str) -> bool {
    matches!(names::handle(handle), Some(Handle::Address(_)))
}

fn is_schelf(tool: &ToolIndex) -> bool {
    tool.address == names::address(STORE_TOOL.publisher, STORE_TOOL.name)
}

/// Why `tool` can't be installed here, when it can't.
pub fn refused(tool: &Tool) -> Option<String> {
    let name = &tool.index.name;
    if is_schelf(&tool.index) && host::luft() {
        return Some("Luft comes with schelf, and updates it with the system.".to_owned());
    }
    let place = folder().join(name);
    let ours = get(name).is_some_and(|installed| installed.address == tool.index.address);
    if place.exists() && !ours {
        return Some(format!(
            "{} is there already, and Schelf didn't put it there.",
            place.display()
        ));
    }
    tool.offer().is_none().then(|| {
        format!(
            "{} has no {} version for this computer.",
            tool.index.address, tool.channel
        )
    })
}

fn pulled(tool: &ToolIndex, release: &Release) -> Result<(), String> {
    let list = revocations::refresh().or_else(|error| revocations::current().ok_or(error))?;
    match list.block(&tool.project.id, Some(&release.version)) {
        Some(block) if block.action == Severity::Block => Err(format!(
            "schelf.store pulled {} {}: {}",
            tool.address,
            release.version,
            block.note.unwrap_or(block.reason)
        )),
        _ => Ok(()),
    }
}

/// Puts `program` in place as `place` in one step, so `place` is always
/// either the old program or the new one, also when it's running.
fn put_in_place(program: &Path, place: &Path) -> Result<(), String> {
    fs::set_permissions(program, fs::Permissions::from_mode(0o755))
        .and_then(|()| fs::rename(program, place))
        .map_err(|error| error.to_string())
}

/// Installs or updates the tool at `address` from `channel`, as the
/// signed index lists it now.
pub fn install(address: &str, channel: &str, reason: &str, task: Task) -> Result<(), String> {
    task.progress(Stage::Preparing, None);
    let tool = find(address, channel)?.ok_or("schelf.store doesn't have it any more.")?;
    if let Some(refusal) = refused(&tool) {
        return Err(refusal);
    }
    let (release, file) = tool
        .offer()
        .ok_or("There's no version of it for this computer.")?;
    pulled(&tool.index, release)?;
    let name = &tool.index.name;
    let download = download::published_file(
        &format!("tool-{name}"),
        &Published {
            url: &file.url,
            size: file.size,
            sha256: &file.sha256,
        },
        &format!("reason={reason}"),
        task,
    )?;
    let placed = place(&tool, release, file, &download, &folder());
    let _ = fs::remove_file(&download);
    record::put(name, placed?)
}

/// Puts the program in `download`, the file of `release` that was checked
/// against the index, into `folder` as the tool's name.
fn place(
    tool: &Tool,
    release: &Release,
    file: &File,
    download: &Path,
    folder: &Path,
) -> Result<InstalledTool, String> {
    let name = &tool.index.name;
    fs::create_dir_all(folder).map_err(|error| error.to_string())?;
    let staged = folder.join(format!(".{name}.partial"));
    let path = folder.join(name);
    unpack::program(download, &file.kind, &staged)
        .and_then(|()| put_in_place(&staged, &path))
        .inspect_err(|_| {
            let _ = fs::remove_file(&staged);
        })?;
    Ok(InstalledTool {
        address: tool.index.address.clone(),
        project: tool.index.project.id.clone(),
        publisher: tool.index.publisher.name.clone(),
        version: release.version.clone(),
        channel: tool.channel.clone(),
        path,
        sha256: file.sha256.clone(),
    })
}

pub fn remove(name: &str) -> Result<(), String> {
    let tool = get(name).ok_or("It isn't installed any more.")?;
    match fs::remove_file(&tool.path) {
        Err(error) if error.kind() != std::io::ErrorKind::NotFound => {
            return Err(error.to_string());
        }
        _ => {}
    }
    record::forget(name)
}

/// A newer release of an installed tool.
pub struct ToolUpdate {
    pub name: String,
    pub address: String,
    pub from: String,
    pub to: String,
}

/// The tools with another release for this computer than the one installed.
pub fn updates() -> Result<Vec<ToolUpdate>, String> {
    let mut found = Vec::new();
    for (name, installed) in installed() {
        let Some(tool) = find(&installed.address, &installed.channel)? else {
            continue;
        };
        if let Some((release, _)) = tool.offer()
            && release.version != installed.version
        {
            found.push(ToolUpdate {
                name,
                address: installed.address,
                from: installed.version,
                to: release.version.clone(),
            });
        }
    }
    Ok(found)
}

/// Updates the installed tool `name`.
pub fn update(name: &str, task: Task) -> Result<(), String> {
    let installed = get(name).ok_or("It isn't installed any more.")?;
    install(&installed.address, &installed.channel, "update", task)
}

/// Remembers this program as the tool `lantharos/schelf` when the install
/// script put it in the tools' folder, so it updates like any other tool.
/// Luft's own copy comes with the system instead.
pub fn adopt_self(version: &str) {
    let name = STORE_TOOL.name;
    let place = folder().join(name);
    let running = std::env::current_exe().ok();
    if host::luft() || get(name).is_some() || running != fs::canonicalize(&place).ok() {
        return;
    }
    let _ = record::put(
        name,
        InstalledTool {
            address: names::address(STORE_TOOL.publisher, name),
            project: names::address(STORE_TOOL.publisher, name).replace('/', "."),
            publisher: "Lantharos".to_owned(),
            version: version.to_owned(),
            channel: STABLE.to_owned(),
            path: place,
            sha256: String::new(),
        },
    );
}

#[cfg(test)]
mod tests;
