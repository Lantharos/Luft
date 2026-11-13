use luft_software::apps::flatpak;

use super::{InstalledApp, Source};

pub fn installed() -> Vec<InstalledApp> {
    flatpak::installed()
        .unwrap_or_default()
        .into_iter()
        .filter(|item| item.launchable)
        .map(|item| InstalledApp {
            key: format!("flatpak/{}", item.reference),
            source: Source::Flatpak,
            summary: None,
            name: item.name,
            icon: None,
            desktop: Some(format!("{}.desktop", item.id)),
            version: (!item.version.is_empty()).then(|| item.version.clone()),
            size: item.size,
            origin: item.origin,
            installation: Some(item.installation),
            reference: Some(item.reference),
            package: None,
            path: None,
            commands: Vec::new(),
            services: Vec::new(),
            listing: None,
            id: item.id,
        })
        .collect()
}
