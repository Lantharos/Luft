use luft_app::Commands;
use luft_software::system::catalog::Repositories;
use sabine::SabineWindow;
use schelf_core::catalog::{fedora, flathub, packages};
use serde::{Deserialize, Serialize};
use specta::Type;

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

/// A package's page, from Fedora or the software source it's in.
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
    let details = match fedora::details(Repositories::Fedora, &package)? {
        Some(details) => Some(details),
        None => fedora::details(Repositories::Added, &package)?,
    };
    Ok(details.map(|details| FedoraDetails {
        version: details.version,
        description: details.description,
        license: details.license,
        homepage: details.homepage,
        size: details.size,
        download: details.download,
    }))
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("flathub_appstream", |Listing { id }| {
            flathub::appstream(&id)
        })
        .command("flathub_summary", |Listing { id }| flathub::summary(&id))
        .command("fedora_details", fedora_details)
        .command("packages_search", |Query { query }| {
            packages::search(&query)
        })
}
