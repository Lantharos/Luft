mod appstream;
pub mod cache;
mod fedora;
mod flathub;

use luft_app::Commands;
use luft_software::packagekit::PackageDetails;
use luft_software::packages;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use appstream::Component;

pub use fedora::find_package as fedora_component;

#[derive(Deserialize)]
struct Path {
    path: String,
}

#[derive(Deserialize)]
struct Query {
    query: String,
}

#[derive(Deserialize)]
struct Id {
    id: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct FedoraApp {
    #[serde(flatten)]
    component: Component,
    details: Option<PackageDetails>,
}

fn fedora_app(Id { id }: Id) -> Result<FedoraApp, String> {
    let component = fedora::find(&id).ok_or("That app isn't in the catalog any more.")?;
    let details = packages::details(&component.package);
    Ok(FedoraApp { component, details })
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("flathub_get", |Path { path }| flathub::get(&path))
        .command("flathub_search", |Query { query }| flathub::search(&query))
        .command("fedora_apps", |_: Value| Ok(fedora::list()))
        .command("fedora_app", fedora_app)
}
