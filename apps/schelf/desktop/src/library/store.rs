use super::{InstalledApp, Source};
use crate::store::listing::Format;
use crate::store::record;

/// Sabine apps and extensions from schelf.store; its AppImages are listed
/// with the other AppImages.
pub fn installed() -> Vec<InstalledApp> {
    record::all()
        .into_iter()
        .filter_map(|(id, installed)| {
            let (key, source, desktop) = match installed.format {
                Format::Appimage => return None,
                Format::Sabine => (
                    format!("sabine/{id}"),
                    Source::Sabine,
                    Some(format!("{}.desktop", installed.local)),
                ),
                Format::LuftExtension => (format!("extension/{id}"), Source::Extension, None),
            };
            Some(InstalledApp {
                key,
                source,
                desktop,
                name: installed.name,
                summary: None,
                icon: installed.icon,
                version: Some(installed.version),
                size: 0,
                origin: "schelf.store".to_owned(),
                installation: None,
                reference: None,
                package: None,
                path: None,
                commands: Vec::new(),
                services: Vec::new(),
                listing: Some(id.clone()),
                id: installed.local,
            })
        })
        .collect()
}
