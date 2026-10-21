pub mod cache;
pub mod flathub;
pub mod tools;

use luft_app::Commands;
use luft_software::toolbox::Repositories;
use sabine::SabineWindow;
use serde::Deserialize;

#[derive(Deserialize)]
struct Path {
    path: String,
}

#[derive(Deserialize)]
struct Query {
    query: String,
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("flathub_get", |Path { path }| flathub::get(&path))
        .command("flathub_search", |Query { query }| flathub::search(&query))
        .command("tools_search", |Query { query }| tools::search(&query))
        .command("system_search", |Query { query }| {
            tools::search_in(Repositories::Added, &query)
        })
}
