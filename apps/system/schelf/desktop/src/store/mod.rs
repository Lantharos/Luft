pub mod catalog;
pub mod device;
pub mod install;
pub mod invited;
pub mod listing;
pub mod record;
pub mod revocations;
mod search;
pub mod signed;
pub mod updates;

use std::collections::BTreeMap;

use luft_app::{Commands, Empty, block_on};
use luft_software::apps::appimage;
use luft_software::http::MISSING;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use specta::Type;

use catalog::{CatalogApp, Collection, Kind};
use listing::{Format, StoreDetails};
use revocations::{Block, Severity};
use signed::Age;

pub const DOWNLOADS: &str = "https://dl.schelf.store/";
pub const API: &str = "https://schelf.store/api/v1/";

/// Keeps the AppImages schelf.store pulled from starting and turns its pulled
/// extensions off. Sabine refuses pulled Sabine apps itself.
fn enforce(list: &revocations::Revocations) -> Result<(), String> {
    let (extensions, apps): (Vec<_>, Vec<_>) = record::all()
        .into_iter()
        .filter(|(id, app)| {
            list.block(id, Some(&app.version))
                .is_some_and(|block| block.action == Severity::Block)
        })
        .partition(|(_, app)| app.format == Format::LuftExtension);
    for (_, extension) in extensions {
        let _ = block_on(install::extensions::disable(&extension.local));
    }
    let blocked: BTreeMap<String, String> = apps
        .into_iter()
        .filter(|(_, app)| app.format == Format::Appimage)
        .map(|(id, app)| (app.local, id))
        .collect();
    appimage::set_blocked(&blocked)
}

/// Fetches the list of pulled apps and acts on it, as Schelf does every hour.
pub fn check_revocations() -> Result<(), String> {
    enforce(&revocations::refresh()?)
}

#[derive(Deserialize, Type)]
struct Listing {
    id: String,
}

#[derive(Deserialize, Type)]
struct Follow {
    id: String,
    channel: String,
}

#[derive(Deserialize, Type)]
struct Category {
    category: String,
}

#[derive(Deserialize, Type)]
struct Shelf {
    collection: Collection,
    limit: Option<usize>,
}

#[derive(Deserialize, Type)]
struct Query {
    query: String,
}

/// A store app or extension on this computer.
#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct InstalledFromStore {
    id: String,
    kind: Kind,
    name: String,
    version: String,
    local: String,
    block: Option<Block>,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct StoreState {
    installed: Vec<InstalledFromStore>,
    out_of_date: bool,
}

fn state() -> StoreState {
    let list = revocations::current();
    StoreState {
        installed: record::all()
            .into_iter()
            .map(|(id, app)| InstalledFromStore {
                block: list
                    .as_ref()
                    .and_then(|list| list.block(&id, Some(&app.version))),
                id,
                kind: app.kind,
                name: app.name,
                version: app.version,
                local: app.local,
            })
            .collect(),
        out_of_date: list.is_none_or(|list| list.out_of_date()),
    }
}

fn refresh() -> Result<StoreState, String> {
    let catalog = std::thread::spawn(catalog::refresh);
    let checked = check_revocations();
    catalog
        .join()
        .unwrap_or_else(|panic| std::panic::resume_unwind(panic))?;
    checked?;
    Ok(state())
}

fn details(id: &str) -> Result<StoreDetails, String> {
    match listing::fetch(id, Age::Within(std::time::Duration::from_secs(60))) {
        Ok(listing) => Ok(StoreDetails::new(listing, record::get(id).as_ref())),
        Err(error) if error == MISSING => record::get(id)
            .map(|installed| StoreDetails::gone(id, installed))
            .ok_or(error),
        Err(error) => Err(error),
    }
}

fn entry(id: &str) -> Result<Option<CatalogApp>, String> {
    Ok(catalog::current()?.find(id).map(CatalogApp::from))
}

pub fn register(window: SabineWindow) -> SabineWindow {
    invited::register(window)
        .command("store_refresh", |Empty {}| refresh())
        .command("store_state", |Empty {}| Ok(state()))
        .command("store_revocations", |Empty {}| {
            check_revocations()?;
            Ok(state())
        })
        .command("store_collection", |Shelf { collection, limit }| {
            Ok(catalog::current()?.collection(collection, limit))
        })
        .command("store_category", |Category { category }| {
            Ok(catalog::current()?.category(&category))
        })
        .command("store_extensions", |Empty {}| {
            Ok(catalog::current()?.extensions())
        })
        .command("store_search", |Query { query }| search::search(&query))
        .command("store_entry", |Listing { id }| entry(&id))
        .command("store_details", |Listing { id }| details(&id))
        .command("store_follow", |Follow { id, channel }| {
            listing::channel::follow(&id, &channel)?;
            details(&id)
        })
}
