use std::collections::HashSet;

use super::{Candidate, Catalog, Kind};
use crate::cli::Exit;
use crate::cli::commands::{confirm, list_of};
use crate::cli::terminal::Ink;
use crate::cli::terminal::prompt;
use crate::library;
use crate::operations::Job;
use crate::store::catalog::{self, Entry, Origin};
use crate::store::install::Consent;
use crate::store::listing::{self, Declared, ExtensionAccess, Format, Listing, Offer, Release, channel};
use crate::store::signed::Age;

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
    Ok(candidates(catalog.search(query).into_iter(), origin, installed))
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
        access.push("The internet".to_owned());
    }
    let folder = |name: &str| -> String {
        match name {
            "home" => "your home folder",
            "xdg-desktop" => "Desktop",
            "xdg-documents" => "Documents",
            "xdg-download" => "Downloads",
            "xdg-music" => "Music",
            "xdg-pictures" => "Pictures",
            "xdg-videos" => "Videos",
            other => other,
        }
        .to_owned()
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
        access.push(format!("Your files in {}", list_of(&names(changed))));
    }
    if !looked_at.is_empty() {
        access.push(format!(
            "Your files in {}, to look at but not change",
            list_of(&names(looked_at))
        ));
    }
    for device in &declared.devices {
        access.push(
            match device.as_str() {
                "usb" => "USB devices",
                "serial" => "Devices on a serial port",
                _ => "Every device, such as cameras and microphones",
            }
            .to_owned(),
        );
    }
    if !declared.talk.is_empty() {
        access.push(format!("Other apps: {}", declared.talk.join(", ")));
    }
    if access.is_empty() {
        access.push("Nothing beyond its own files".to_owned());
    }
    access
}

/// What an extension may do, in the words Settings uses.
pub fn extension_access(access: &ExtensionAccess) -> Vec<String> {
    let mut lines: Vec<String> = access
        .permissions
        .iter()
        .map(|permission| {
            match permission.as_str() {
                "wallpaper" => "Draw over the wallpaper",
                "quick-settings" => "Add tiles to quick settings",
                "taskbar" => "Add buttons to the taskbar",
                "search" => "Add results to search",
                "notifications" => "Send notifications",
                "weather" => "See the weather where you are",
                "location" => "See roughly where you are",
                "media" => "See and control what's playing",
                "popups" => "Show panels and small windows",
                "typing" => "Type into other apps",
                "sounds" => "Play sounds",
                "audio-levels" => "Follow the beat of what's playing",
                other => other,
            }
            .to_owned()
        })
        .collect();
    if access.helper {
        lines.push("Runs its own program".to_owned());
    }
    if lines.is_empty() {
        lines.push("Nothing beyond the basics".to_owned());
    }
    lines
}

/// Shows what the app may use and asks, and whether you gave an AppImage that
/// asks to run unsandboxed full access.
fn agree_to(listing: &Listing, release: &Release, format: Format, yes: bool) -> Result<bool, Exit> {
    let ink = Ink::stderr();
    let name = ink.bold(listing.name());
    if let Some(access) = &release.extension {
        eprintln!("{name} can:");
        for line in extension_access(access) {
            eprintln!("  {line}");
        }
        return confirm(&format!("Install {}?", listing.name()), yes).map(|()| false);
    }
    let declared = release.permissions.as_ref();
    if let Some(declared) =
        declared.filter(|declared| release.sandboxed() && declared.unsandboxed.is_none())
    {
        eprintln!("{name} can use:");
        for line in access(declared) {
            eprintln!("  {line}");
        }
        return confirm(&format!("Install {}?", listing.name()), yes).map(|()| false);
    }
    let why = declared
        .and_then(|declared| declared.unsandboxed.as_deref())
        .map_or_else(String::new, |reason| format!(" It says: {reason}"));
    if format != Format::Appimage {
        eprintln!("{name} runs outside a sandbox, with everything you can do.{why}");
        return confirm(&format!("Install {}?", listing.name()), yes).map(|()| true);
    }
    eprintln!("{name} asks to run outside a sandbox, with everything you can do.{why}");
    if yes || !prompt::interactive() {
        eprintln!("It installs in its sandbox. schelf trust gives it full access if you trust it.");
        return Ok(false);
    }
    Ok(prompt::agree("Give it full access?"))
}

/// Shows what the app may use and asks before it's installed.
pub fn install(id: &str, yes: bool) -> Result<(String, Job), Exit> {
    let listing = listing::fetch(id, Age::Current).map_err(|error| {
        eprintln!("{error}");
        Exit::Failed
    })?;
    let channel = channel::followed(&listing.id);
    let Some(Offer { release, format, .. }) = listing.release(&channel) else {
        match channel.as_str() {
            channel::STABLE => eprintln!("{} isn't available for this computer.", listing.name()),
            channel => eprintln!(
                "{} has no {channel} version for this computer.",
                listing.name()
            ),
        }
        return Err(Exit::Missing);
    };
    let full_access = agree_to(&listing, release, format, yes)?;
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
    ))
}
