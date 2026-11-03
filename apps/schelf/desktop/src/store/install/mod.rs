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

use super::listing::{self, Declared, ExtensionAccess, Format, Listing, Release};
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

fn full_access() -> Declared {
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
    consent: &Consent,
    granting: bool,
    file: &Path,
    task: Task,
) -> Result<String, String> {
    let installed = appimage::install(file, task)?;
    if granting {
        let declared = release.permissions.clone().unwrap_or_else(full_access);
        block_on(appimage::grant(
            &installed.app.id,
            &declared.declaration(),
            consent.full_access,
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

/// Installs or updates `id` from schelf.store, as you agreed to in `consent`.
pub fn install(id: &str, consent: &Consent, reason: Reason, task: Task) -> Result<(), String> {
    let listing = listing::fetch(id, Age::Current)?;
    let release = listing
        .release()
        .ok_or_else(|| format!("{} isn't available for this computer.", listing.name()))?;
    agreed(&listing, release, consent)?;
    refuse_pulled(&listing, release)?;
    let artifact = listing
        .artifact(release)
        .ok_or_else(|| format!("{} isn't available for this computer.", listing.name()))?;
    let previous = record::get(&listing.id);
    let granting = previous
        .as_ref()
        .is_none_or(|previous| previous.agreed != release.permissions);
    let file = download::verified(&listing.id, artifact, reason.query(), task)?;
    let local = match listing.format {
        Format::Appimage => install_appimage(release, consent, granting, &file, task),
        Format::Sabine => install_sabine(&listing.id, &file, task),
        Format::LuftExtension => extensions::install(&listing.id, &file, task),
    };
    let _ = std::fs::remove_file(&file);
    record::put(
        &listing.id,
        Installed {
            kind: listing.kind,
            format: listing.format,
            name: listing.name().to_owned(),
            icon: listing.icon.clone(),
            version: release.version.clone(),
            local: local?,
            agreed: release.permissions.clone(),
            agreed_extension: release.extension.clone(),
        },
    )
}

pub fn remove(id: &str) -> Result<(), String> {
    let installed = record::get(id).ok_or("It isn't installed any more.")?;
    match installed.format {
        Format::Appimage => appimage::remove(&installed.local)?,
        Format::Sabine => SabineService::default()
            .remove_store_app(&installed.local)
            .map_err(|error| error.to_string())?,
        Format::LuftExtension => extensions::remove(&installed.local)?,
    }
    record::forget(id)
}
