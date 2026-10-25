use luft_software::apps::debian;

use super::{InstalledApp, Source};

pub fn installed() -> Vec<InstalledApp> {
    debian::installed()
        .into_iter()
        .map(|app| InstalledApp {
            key: format!("deb/{}", app.package),
            source: Source::Debian,
            id: app.package.clone(),
            desktop: app.desktop.first().cloned(),
            name: app.name,
            summary: Some(app.summary).filter(|summary| !summary.is_empty()),
            icon: app.icon,
            version: Some(app.version),
            size: app.size,
            origin: debian::container.to_owned(),
            installation: None,
            reference: None,
            package: Some(app.package),
            path: None,
            commands: Vec::new(),
            services: Vec::new(),
        })
        .collect()
}
