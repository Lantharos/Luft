use luft_app::block_on;
use luft_software::apps::flatpak;
use luft_software::http::MISSING;
use serde::Serialize;
use specta::Type;

use super::catalog::Kind;
use super::install::Consent;
use super::listing::{self, Declared, ExtensionAccess, Format, Offer, channel};
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
}

fn widens_extension(after: Option<&ExtensionAccess>, before: Option<&ExtensionAccess>) -> bool {
    match (after, before) {
        (Some(after), Some(before)) => after.widens(before),
        (Some(_), None) => true,
        (None, _) => false,
    }
}

fn widens(after: Option<&Declared>, before: Option<&Declared>) -> bool {
    match (after, before) {
        (_, None) => false,
        (None, Some(_)) => true,
        (Some(after), Some(before)) => after.widens(before),
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

fn update(id: String, installed: Installed) -> Result<Option<StoreUpdate>, String> {
    let listing = match listing::fetch(&id, Age::Current) {
        Err(error) if error == MISSING => return Ok(None),
        listing => listing?,
    };
    let Some(Offer { release, artifact, .. }) = listing.release(&channel::followed(&id)) else {
        return Ok(None);
    };
    let pulled = revocations::current()
        .and_then(|list| list.block(&id, Some(&release.version)))
        .is_some_and(|block| block.action == Severity::Block);
    if !listing::newer(&release.version, &installed.version) || pulled {
        return Ok(None);
    }
    Ok(Some(StoreUpdate {
        widens: match installed.format {
            Format::LuftExtension => widens_extension(
                release.extension.as_ref(),
                installed.agreed_extension.as_ref(),
            ),
            _ => widens(release.permissions.as_ref(), installed.agreed.as_ref()),
        },
        consent: Consent {
            version: release.version.clone(),
            permissions: release.permissions.clone(),
            extension: release.extension.clone(),
            full_access: block_on(full_access(&installed)),
        },
        size: artifact.size,
        to: release.version.clone(),
        icon: listing.icon.clone(),
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
