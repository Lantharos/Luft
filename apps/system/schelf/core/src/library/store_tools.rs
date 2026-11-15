use super::{InstalledApp, Source};
use crate::l10n::L10N;
use crate::tools;
use luft_i18n::t;

/// Command-line tools from schelf.store.
pub fn installed() -> Vec<InstalledApp> {
    tools::installed()
        .into_iter()
        .map(|(name, tool)| InstalledApp {
            key: format!("storetool/{name}"),
            source: Source::StoreTool,
            id: name.clone(),
            desktop: None,
            name: name.clone(),
            summary: Some(t!(
                L10N,
                "core-tool-by",
                publisher = tool.publisher.as_str()
            )),
            icon: None,
            version: Some(tool.version),
            size: tool.path.metadata().map_or(0, |metadata| metadata.len()),
            origin: "schelf.store".to_owned(),
            installation: None,
            reference: None,
            package: Some(tool.address),
            path: Some(tool.path.to_string_lossy().into_owned()),
            commands: vec![name],
            services: Vec::new(),
            listing: None,
        })
        .collect()
}
