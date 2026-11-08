pub mod cache;
pub mod flathub;
pub mod tools;

use luft_app::Commands;
use luft_software::apps::toolbox::{self, Repositories};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::cli::sources::fedora;

#[derive(Deserialize, Type)]
struct Listing {
    id: String,
}

#[derive(Deserialize, Type)]
struct Query {
    query: String,
}

#[derive(Deserialize, Type)]
struct Package {
    package: String,
}

/// A Fedora package's page, from Fedora's software sources.
#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct FedoraDetails {
    version: String,
    description: String,
    license: String,
    homepage: Option<String>,
    size: u64,
    download: u64,
}

fn fedora_details(Package { package }: Package) -> Result<Option<FedoraDetails>, String> {
    Ok(
        fedora::details(Repositories::Fedora, &package)?.map(|details| FedoraDetails {
            version: details.version,
            description: details.description,
            license: details.license,
            homepage: details.homepage,
            size: details.size,
            download: details.download,
        }),
    )
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("flathub_appstream", |Listing { id }| {
            flathub::appstream(&id)
        })
        .command("flathub_summary", |Listing { id }| flathub::summary(&id))
        .command("fedora_details", fedora_details)
        .command("tools_search", |Query { query }| tools::search(&query))
        .command("tool_needs_system", |Package { package }| {
            toolbox::needs_system(&package)
        })
        .command("system_search", |Query { query }| {
            tools::search_in(Repositories::Added, &query)
        })
}
