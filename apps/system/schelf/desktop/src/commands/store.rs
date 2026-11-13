use luft_app::{Commands, Empty};
use sabine::SabineWindow;
use schelf_core::store::catalog::{self, Collection};
use schelf_core::store::{check_revocations, details, entry, listing, refresh, search, state};
use serde::Deserialize;
use specta::Type;

use super::account;

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

pub fn register(window: SabineWindow) -> SabineWindow {
    account::register(window)
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
