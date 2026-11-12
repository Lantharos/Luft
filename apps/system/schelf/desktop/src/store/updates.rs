use luft_app::block_on;
use luft_software::apps::flatpak;
use luft_software::http::MISSING;
use serde::Serialize;
use specta::Type;

use super::catalog::Kind;
use super::install::Consent;
use super::listing::{self, ExtensionAccess, Format, Listing, Offer};
use super::record::{self, Installed};
use super::revocations::{self, Severity};
use super::signed::Age;

/// A newer release of a store app than the one installed.
#[derive(Serialize, Clone, Type)]
#[serde(rename_all = "camelCase")]
pub struct StoreUpdate {
    pub id: String,
    pub kind: Kind,
    pub format: Format,
    pub name: String,
    pub icon: Option<String>,
    pub local: String,
    pub from: String,
    pub to: String,
    pub size: u64,
    pub consent: Consent,
    /// Whether it asks for more than you agreed to, so it waits for you.
    pub widens: bool,
    /// The name of the app that took this one's place, which the update
    /// moves you to.
    pub replacement: Option<String>,
    /// Whether it's an extension in a sandbox that schelf.store approved to
    /// run inside Luft, where the update moves it.
    pub moves_inside: bool,
}

fn widens_extension(after: Option<&ExtensionAccess>, before: Option<&ExtensionAccess>) -> bool {
    match (after, before) {
        (Some(after), Some(before)) => after.widens(before),
        (Some(_), None) => true,
        (None, _) => false,
    }
}

/// Whether you let the installed app run outside a sandbox: a Sabine app
/// always does, an AppImage when you gave it full access.
async fn full_access(installed: &Installed) -> bool {
    match installed.format {
        Format::Sabine => true,
        Format::Appimage => flatpak::has_full_access(&installed.local).await,
        Format::LuftExtension => false,
    }
}

fn fetch(id: &str) -> Result<Option<Listing>, String> {
    match listing::fetch(id, Age::Current) {
        Err(error) if error == MISSING => Ok(None),
        listing => listing.map(Some),
    }
}

/// The listing an installed app updates from: its own, or the one of the app
/// that took its place.
fn source(listing: Listing) -> Result<Option<Listing>, String> {
    match &listing.replaced_by {
        Some(replacement) => fetch(&replacement.id),
        None => Ok(Some(listing)),
    }
}

fn update(id: String, installed: Installed) -> Result<Option<StoreUpdate>, String> {
    let Some(listing) = fetch(&id)?.map(source).transpose()?.flatten() else {
        return Ok(None);
    };
    let replacing = listing.id != id;
    let Some(Offer {
        release,
        artifact,
        format,
    }) = listing.release(!replacing && installed.inside_luft())
    else {
        return Ok(None);
    };
    let pulled = revocations::current()
        .and_then(|list| list.block(&listing.id, Some(&release.version)))
        .is_some_and(|block| block.action == Severity::Block);
    let moves_inside = !replacing
        && installed.sandboxed
        && listing.runs_in_shell(release)
        && !listing::newer(&installed.version, &release.version);
    if pulled
        || !(replacing || moves_inside || listing::newer(&release.version, &installed.version))
    {
        return Ok(None);
    }
    let replacement_installed = replacing && record::get(&listing.id).is_some();
    let full_access = block_on(full_access(&installed));
    Ok(Some(StoreUpdate {
        widens: match (installed.format, format) {
            _ if replacement_installed => false,
            (from, to) if from != to => true,
            (Format::LuftExtension, _) => widens_extension(
                release.extension.as_ref(),
                installed.agreed_extension.as_ref(),
            ),
            _ => listing::widens(
                release.permissions.as_ref(),
                installed.agreed.as_ref(),
                full_access,
            ),
        },
        consent: Consent {
            version: release.version.clone(),
            permissions: release.permissions.clone(),
            extension: release.extension.clone(),
            full_access,
        },
        size: if replacement_installed {
            0
        } else {
            artifact.size
        },
        to: release.version.clone(),
        icon: listing.icon.clone(),
        replacement: replacing.then(|| listing.name().to_owned()),
        moves_inside,
        name: installed.name,
        kind: installed.kind,
        format: installed.format,
        local: installed.local,
        from: installed.version,
        id,
    }))
}

/// Every store app with a release this device may have now.
pub fn find() -> Result<Vec<StoreUpdate>, String> {
    let mut found = Vec::new();
    for (id, installed) in record::all() {
        found.extend(update(id, installed)?);
    }
    Ok(found)
}
