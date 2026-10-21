use luft_software::apps::toolbox;

use super::{InstalledApp, Source};

pub fn installed() -> Vec<InstalledApp> {
    let container = toolbox::container();
    toolbox::installed()
        .into_iter()
        .map(|tool| InstalledApp {
            key: format!("tool/{}", tool.package),
            source: Source::Tool,
            id: tool.package.clone(),
            desktop: None,
            name: tool.package.clone(),
            summary: Some(tool.summary),
            icon: None,
            version: Some(tool.version),
            size: tool.size,
            origin: container.clone(),
            installation: None,
            reference: None,
            package: Some(tool.package),
            path: None,
            commands: tool.commands,
            services: Vec::new(),
        })
        .collect()
}
