mod download;
pub mod extensions;

use std::path::Path;

use luft_app::block_on;
use luft_software::apps::appimage;
use luft_software::progress::Stage;
use luft_software::task::Task;
use sabine_service::SabineService;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::listing::{self, Declared, ExtensionAccess, Format, Listing, Offer, Release};
use super::record::{self, Installed};
use super::revocations::{self, Severity};
use super::signed::Age;

/// What you saw and agreed to before installing or updating a store app.
#[derive(Deserialize, Serialize, Clone, Debug, Type)]
#[serde(rename_all = "camelCase")]
pub struct Consent {
    pub version: String,
    pub permissions: Option<Declared>,
    pub extension: Option<ExtensionAccess>,
    pub full_access: bool,
}

#[derive(Clone, Copy)]
pub enum Reason {
    Install,
    Update,
}

impl Reason {
    fn query(self) -> &'static str {
        match self {
            Self::Install => "install",
            Self::Update => "update",
        }
    }
}

fn refuse_pulled(listing: &Listing, release: &Release) -> Result<(), String> {
    let list = revocations::refresh().or_else(|error| revocations::current().ok_or(error))?;
    match list.block(&listing.id, Some(&release.version)) {
        Some(block) if block.action == Severity::Block => Err(format!(
            "schelf.store pulled {}: {}",
            listing.name(),
            block.note.unwrap_or(block.reason)
        )),
        _ => Ok(()),
    }
}

fn agreed(listing: &Listing, release: &Release, consent: &Consent) -> Result<(), String> {
    if release.version != consent.version
        || release.permissions != consent.permissions
        || release.extension != consent.extension
    {
        return Err(format!(
            "{} changed since you looked at it. Look at it again before installing.",
            listing.name()
        ));
    }
    Ok(())
}

fn full_access_declared() -> Declared {
    Declared {
        network: true,
        filesystems: Vec::new(),
        devices: Vec::new(),
        talk: Vec::new(),
        unsandboxed: Some(String::new()),
    }
}

fn install_appimage(
    release: &Release,
    full_access: bool,
    granting: bool,
    file: &Path,
    task: Task,
) -> Result<String, String> {
    let installed = appimage::install(file, task)?;
    if granting {
        let declared = release
            .permissions
            .clone()
            .unwrap_or_else(full_access_declared);
        block_on(appimage::grant(
            &installed.app.id,
            &declared.declaration(),
            full_access,
        ))?;
    }
    Ok(installed.app.id)
}

/// A Sabine app installs through Sabine's service from its Linux archive,
/// with its launcher entry, icons and file types, and leaves its updates to
/// Schelf.
fn install_sabine(id: &str, archive: &Path, task: Task) -> Result<String, String> {
    task.progress(Stage::Installing, None);
    SabineService::default()
        .install_store_app(archive, id)
        .map(|app| app.manifest.id)
        .map_err(|error| error.to_string())
}

fn remove_installed(installed: &Installed) -> Result<(), String> {
    match installed.format {
        Format::Appimage => appimage::remove(&installed.local),
        Format::Sabine => SabineService::default()
            .remove_store_app(&installed.local)
            .map_err(|error| error.to_string()),
        Format::LuftExtension => extensions::remove(&installed.local),
    }
}

/// Installs `file`, the artifact of the release on offer, and records it with the
/// access it was installed with. When the app moved to another packaging,
/// such as from Sabine to an AppImage, the new one replaces the old.
fn place(
    listing: &Listing,
    Offer { release, format, .. }: Offer,
    file: &Path,
    full_access: bool,
    task: Task,
) -> Result<(), String> {
    let previous = record::get(&listing.id);
    let granting = previous.as_ref().is_none_or(|previous| {
        previous.format != format || previous.agreed != release.permissions
    });
    let local = match format {
        Format::Appimage => install_appimage(release, full_access, granting, file, task),
        Format::Sabine => install_sabine(&listing.id, file, task),
        Format::LuftExtension => extensions::install(&listing.id, file, task),
    }?;
    record::put(
        &listing.id,
        Installed {
            kind: listing.kind,
            format,
            name: listing.name().to_owned(),
            icon: listing.icon.clone(),
            version: release.version.clone(),
            local: local.clone(),
            agreed: release.permissions.clone(),
            agreed_extension: release.extension.clone(),
        },
    )?;
    match previous {
        Some(previous) if previous.format != format || previous.local != local => {
            remove_installed(&previous)
        }
        _ => Ok(()),
    }
}

/// Moves you from `id` to the app that took its place: installs that one as
/// you agreed to in `consent`, unless you have it already, and removes `id`.
fn replace(id: &str, replacement: &str, consent: &Consent, task: Task) -> Result<(), String> {
    if record::get(replacement).is_none() {
        install(replacement, consent, Reason::Install, task)?;
    }
    remove(id)
}

/// Installs or updates `id` from schelf.store, as you agreed to in `consent`.
/// Updating an app another took the place of moves you to that one.
pub fn install(id: &str, consent: &Consent, reason: Reason, task: Task) -> Result<(), String> {
    task.progress(Stage::Preparing, None);
    let listing = listing::fetch(id, Age::Current)?;
    if let (Reason::Update, Some(replacement)) = (reason, &listing.replaced_by) {
        return replace(id, &replacement.id, consent, task);
    }
    let offer = listing
        .release()
        .ok_or_else(|| format!("{} isn't available for this computer.", listing.name()))?;
    agreed(&listing, offer.release, consent)?;
    refuse_pulled(&listing, offer.release)?;
    let file = download::verified(&listing.id, offer.artifact, reason.query(), task)?;
    let placed = place(&listing, offer, &file, consent.full_access, task);
    let _ = std::fs::remove_file(&file);
    placed
}

/// Installs a store app or extension from the copy of its listing and its
/// file that came with the system, next to each other in one folder, unless
/// it's already installed from the store. Nothing goes online.
pub fn install_shipped(path: &Path, task: Task) -> Result<(), String> {
    let listing = Listing::read(path)?;
    if record::get(&listing.id).is_some() {
        return Ok(());
    }
    let offer = listing
        .shipped()
        .ok_or_else(|| format!("{} came without a file for this computer.", listing.name()))?;
    let file = download::shipped(path, offer.artifact)?;
    let full_access = offer
        .release
        .permissions
        .as_ref()
        .is_none_or(|declared| declared.unsandboxed.is_some());
    place(&listing, offer, &file, full_access, task)
}

pub fn remove(id: &str) -> Result<(), String> {
    let installed = record::get(id).ok_or("It isn't installed any more.")?;
    remove_installed(&installed)?;
    record::forget(id)
}
