use std::collections::HashSet;

use luft_i18n::t;
use luft_software::apps::appimage;
use schelf_core::operations::Job;
use schelf_core::store::catalog::{self, Entry, Origin};
use schelf_core::store::install::{self, Consent};
use schelf_core::store::listing::{
    self, Declared, ExtensionAccess, Format, ListenPort, Listing, Offer, Release, channel,
};
use schelf_core::store::record;
use schelf_core::store::signed::Age;
use schelf_core::{host, library};

use super::{Candidate, Catalog, Kind};
use crate::install::Exit;
use crate::install::commands::list_of;
use crate::install::terminal::Ink;
use crate::install::terminal::prompt;
use crate::l10n::L10N;

fn kind(entry: &Entry) -> Kind {
    match entry.kind {
        catalog::Kind::App => Kind::Desktop,
        catalog::Kind::Extension => Kind::Extension,
    }
}

fn installed() -> HashSet<String> {
    library::installed()
        .into_iter()
        .filter_map(|app| app.listing)
        .collect()
}

fn candidates<'a>(
    entries: impl Iterator<Item = &'a Entry>,
    origin: Origin,
    installed: &HashSet<String>,
) -> Vec<Candidate> {
    let catalog = match origin {
        Origin::Schelf => Catalog::Store,
        Origin::Flathub => Catalog::Flathub,
        Origin::Fedora => Catalog::Fedora,
    };
    entries
        .filter(|entry| entry.origin == origin)
        .map(|entry| {
            let id = entry.package.clone().unwrap_or_else(|| entry.id.clone());
            Candidate {
                catalog,
                installed: installed.contains(&id),
                kind: kind(entry),
                id,
                name: entry.name.clone(),
                summary: entry.summary.clone(),
            }
        })
        .collect()
}

pub fn search_in(
    query: &str,
    origin: Origin,
    installed: &HashSet<String>,
) -> Result<Vec<Candidate>, String> {
    let catalog = catalog::current()?;
    Ok(candidates(
        catalog.search(query).into_iter(),
        origin,
        installed,
    ))
}

/// The entries called `name`, by id, the last part of the id, its package or its name.
pub fn find_in(
    name: &str,
    origin: Origin,
    installed: &HashSet<String>,
) -> Result<Vec<Candidate>, String> {
    let catalog = catalog::current()?;
    let wanted = name.to_lowercase();
    let named = catalog.entries().iter().filter(|entry| {
        [
            Some(entry.id.as_str()),
            entry.id.rsplit('.').next(),
            entry.package.as_deref(),
            Some(entry.name.as_str()),
        ]
        .into_iter()
        .flatten()
        .any(|known| known.to_lowercase() == wanted)
    });
    Ok(candidates(named, origin, installed))
}

pub fn search(query: &str) -> Result<Vec<Candidate>, String> {
    search_in(query, Origin::Schelf, &installed())
}

pub fn find(name: &str) -> Result<Vec<Candidate>, String> {
    find_in(name, Origin::Schelf, &installed())
}

/// What the app may use, in plain words.
pub fn access(declared: &Declared) -> Vec<String> {
    let mut access = Vec::new();
    if declared.network {
        access.push(t!(L10N, "cli-access-internet"));
    }
    let folder = |name: &str| -> String {
        match name {
            "home" => t!(L10N, "cli-access-folder-home"),
            "xdg-desktop" => t!(L10N, "cli-access-folder-desktop"),
            "xdg-documents" => t!(L10N, "cli-access-folder-documents"),
            "xdg-download" => t!(L10N, "cli-access-folder-downloads"),
            "xdg-music" => t!(L10N, "cli-access-folder-music"),
            "xdg-pictures" => t!(L10N, "cli-access-folder-pictures"),
            "xdg-videos" => t!(L10N, "cli-access-folder-videos"),
            other => other.to_owned(),
        }
    };
    let (looked_at, changed): (Vec<&String>, Vec<&String>) = declared
        .filesystems
        .iter()
        .partition(|place| place.ends_with(":ro"));
    let names = |places: Vec<&String>| -> Vec<String> {
        places
            .into_iter()
            .map(|place| folder(place.trim_end_matches(":ro")))
            .collect()
    };
    if !changed.is_empty() {
        access.push(t!(
            L10N,
            "cli-access-files",
            folders = list_of(&names(changed))
        ));
    }
    if !looked_at.is_empty() {
        access.push(t!(
            L10N,
            "cli-access-files-read-only",
            folders = list_of(&names(looked_at))
        ));
    }
    for device in &declared.devices {
        access.push(match device.as_str() {
            "usb" => t!(L10N, "cli-access-usb"),
            "serial" => t!(L10N, "cli-access-serial"),
            _ => t!(L10N, "cli-access-devices"),
        });
    }
    if !declared.talk.is_empty() {
        access.push(t!(
            L10N,
            "cli-access-other-apps",
            apps = declared.talk.join(", ")
        ));
    }
    if access.is_empty() {
        access.push(t!(L10N, "cli-access-nothing"));
    }
    access
}

fn listen_ports(listen: &[ListenPort]) -> Vec<String> {
    let mut ports: Vec<u16> = listen.iter().map(|listen| listen.port).collect();
    ports.sort_unstable();
    ports.dedup();
    ports.iter().map(u16::to_string).collect()
}

/// What an extension may do, in the words Settings uses.
pub fn extension_access(access: &ExtensionAccess) -> Vec<String> {
    let mut lines: Vec<String> = access
        .permissions
        .iter()
        .map(|permission| listing::permission_title(permission))
        .collect();
    if !access.network.is_empty() {
        lines.push(t!(
            L10N,
            "cli-access-connect",
            hosts = access.network.join(", ")
        ));
    }
    if !access.listen.is_empty() {
        let ports = listen_ports(&access.listen);
        lines.push(t!(
            L10N,
            "cli-access-listen",
            ports = ports.join(", "),
            count = ports.len()
        ));
    }
    if access.helper {
        lines.push(t!(L10N, "cli-access-helper"));
    }
    if lines.is_empty() {
        lines.push(t!(L10N, "cli-access-basics"));
    }
    lines
}

/// What you settled for an app before it's installed.
struct Agreement {
    full_access: bool,
    asks: bool,
}

const ASKS: Agreement = Agreement {
    full_access: false,
    asks: true,
};

const ASKS_FOR_FULL_ACCESS: Agreement = Agreement {
    full_access: true,
    asks: true,
};

/// Shows what the app may use, and asks whether an AppImage that asks to run
/// unsandboxed gets full access. Installing it waits for your yes with the
/// rest unless that question settled it.
fn agree_to(listing: &Listing, release: &Release, format: Format, yes: bool) -> Agreement {
    let ink = Ink::stderr();
    let name = ink.bold(listing.name());
    if let Some(access) = &release.extension {
        if listing.runs_in_shell(release) {
            eprintln!(
                "{}",
                t!(L10N, "cli-store-extension-inside-luft", name = name)
            );
        } else {
            eprintln!("{}", t!(L10N, "cli-store-extension-sandboxed", name = name));
        }
        for line in extension_access(access) {
            eprintln!("  {line}");
        }
        return ASKS;
    }
    let as_appimage = format == Format::Appimage
        || (format == Format::Sabine && host::sabine_service().is_none());
    if as_appimage && !appimage::sandboxed() {
        eprintln!("{}", t!(L10N, "cli-store-no-sandbox", name = name));
        return ASKS_FOR_FULL_ACCESS;
    }
    let declared = release.permissions.as_ref();
    if let Some(declared) =
        declared.filter(|declared| release.sandboxed() && declared.unsandboxed.is_none())
    {
        eprintln!("{}", t!(L10N, "cli-store-can-use", name = name));
        for line in access(declared) {
            eprintln!("  {line}");
        }
        return ASKS;
    }
    let reason = declared.and_then(|declared| declared.unsandboxed.as_deref());
    let outside = match (format == Format::Appimage, reason) {
        (false, None) => t!(L10N, "cli-store-unsandboxed", name = name),
        (false, Some(reason)) => t!(
            L10N,
            "cli-store-unsandboxed-because",
            name = name,
            reason = reason
        ),
        (true, None) => t!(L10N, "cli-store-asks-unsandboxed", name = name),
        (true, Some(reason)) => t!(
            L10N,
            "cli-store-asks-unsandboxed-because",
            name = name,
            reason = reason
        ),
    };
    eprintln!("{outside}");
    if format != Format::Appimage {
        return ASKS_FOR_FULL_ACCESS;
    }
    let full_access = if yes || !prompt::interactive() {
        eprintln!("{}", t!(L10N, "cli-store-installs-sandboxed"));
        false
    } else {
        prompt::agree(&t!(L10N, "cli-store-confirm-full-access"))
    };
    Agreement {
        full_access,
        asks: false,
    }
}

/// Shows what the app may use before it's installed, and whether installing
/// it waits for your yes.
pub fn install(id: &str, yes: bool) -> Result<(String, Job, bool), Exit> {
    let listing = listing::fetch(id, Age::Current).map_err(|error| {
        eprintln!("{error}");
        Exit::Failed
    })?;
    let inside_luft = record::get(id).is_some_and(|installed| installed.inside_luft());
    let Some(Offer {
        release, format, ..
    }) = listing.release(inside_luft)
    else {
        let following = listing.following(listing.platforms());
        if following.chosen && following.channel != channel::STABLE {
            eprintln!(
                "{}",
                t!(
                    L10N,
                    "cli-store-no-channel-version",
                    name = listing.name(),
                    channel = following.channel.as_str()
                )
            );
        } else {
            eprintln!("{}", install::unavailable(&listing));
        }
        return Err(Exit::Missing);
    };
    let Agreement { full_access, asks } = agree_to(&listing, release, format, yes);
    Ok((
        format!("schelf:{}", listing.id),
        Job::InstallStore {
            id: listing.id.clone(),
            consent: Consent {
                version: release.version.clone(),
                permissions: release.permissions.clone(),
                extension: release.extension.clone(),
                full_access,
            },
        },
        asks,
    ))
}
