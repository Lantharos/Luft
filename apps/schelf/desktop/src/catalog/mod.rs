pub mod cache;
pub mod flathub;
pub mod tools;

use luft_app::Commands;
use luft_software::apps::toolbox::Repositories;
use sabine::SabineWindow;
use serde::Deserialize;
use specta::Type;

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
struct Collection {
    name: String,
    page: u32,
    per_page: u32,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
struct Category {
    category: String,
    page: u32,
    per_page: u32,
}

#[derive(Deserialize, Type)]
struct Listing {
    id: String,
}

#[derive(Deserialize, Type)]
struct Query {
    query: String,
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command(
            "flathub_collection",
            |Collection {
                 name,
                 page,
                 per_page,
             }| flathub::collection(&name, page, per_page),
        )
        .command(
            "flathub_category",
            |Category {
                 category,
                 page,
                 per_page,
             }| flathub::category(&category, page, per_page),
        )
        .command("flathub_appstream", |Listing { id }| {
            flathub::appstream(&id)
        })
        .command("flathub_summary", |Listing { id }| flathub::summary(&id))
        .command("flathub_search", |Query { query }| flathub::search(&query))
        .command("tools_search", |Query { query }| tools::search(&query))
        .command("system_search", |Query { query }| {
            tools::search_in(Repositories::Added, &query)
        })
}
