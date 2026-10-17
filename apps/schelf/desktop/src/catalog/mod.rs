mod appstream;
pub mod cache;
mod fedora;
mod flathub;
mod tools;

use luft_app::Commands;
use luft_software::packagekit::PackageDetails;
use luft_software::packages;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio::task::spawn_blocking;

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

async fn fedora_app(Id { id }: Id) -> Result<FedoraApp, String> {
    let component = spawn_blocking(move || fedora::find(&id))
        .await
        .map_err(|error| error.to_string())?
        .ok_or("That app isn't in the catalog any more.")?;
    let details = packages::details(&component.package).await;
    Ok(FedoraApp { component, details })
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("flathub_get", |Path { path }| flathub::get(&path))
        .command("flathub_search", |Query { query }| flathub::search(&query))
        .command("fedora_apps", |_: Value| Ok(fedora::list()))
        .command_async("fedora_app", fedora_app)
        .command("tools_search", |Query { query }| tools::search(&query))
}
