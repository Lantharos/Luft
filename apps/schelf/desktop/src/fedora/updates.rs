use luft_app::apps::App;
use luft_software::classify::Classification;
use luft_software::packages;
use luft_software::updates::PackageUpdates;
use tokio::task::spawn_blocking;

use crate::library::Source;
use crate::updates::AppUpdate;

fn convert(updates: PackageUpdates) -> Vec<AppUpdate> {
    let classification = Classification::current();
    updates
        .apps
        .into_iter()
        .map(|update| {
            let name = update.package.name.clone();
            let desktop = classification.desktop_ids(&name).first().cloned();
            let app = desktop.as_deref().and_then(App::by_id);
            AppUpdate {
                key: format!("package/{name}"),
                source: Source::Package,
                id: desktop.clone().unwrap_or_else(|| name.clone()),
                name: app
                    .as_ref()
                    .map_or_else(|| name.clone(), |app| app.name.clone()),
                icon: app.and_then(|app| app.icon),
                desktop,
                from: update.installed_version,
                to: Some(update.package.version),
                size: update.download_size,
                platform: false,
                installation: None,
                reference: None,
                package: Some(name),
            }
        })
        .collect()
}

pub async fn load() -> Result<Vec<AppUpdate>, String> {
    let updates = packages::updates().await?;
    spawn_blocking(move || convert(updates))
        .await
        .map_err(|error| error.to_string())
}
