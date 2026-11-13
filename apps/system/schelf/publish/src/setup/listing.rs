use std::path::Path;

use super::files::PlannedFile;
use super::identity::Identity;
use super::workflow::listing_toml_for;
use crate::api::http::download;
use crate::artifacts::images::sniff_image;
use crate::error::Result;
use crate::project::Project;
use crate::project::files::read_optional;
use crate::schema::LISTING_TOML;
use crate::schema::listing::{
    ListingToml, MAX_CATEGORIES, MAX_KEYWORDS, MAX_SCREENSHOTS, Screenshot,
};
use crate::ui::output::caution;

pub const LISTING_FOLDER: &str = "store";

fn web(location: &str) -> bool {
    location.starts_with("http:") || location.starts_with("https:")
}

fn bytes_of(root: &Path, location: &str) -> std::result::Result<Vec<u8>, String> {
    if !web(location) {
        return std::fs::read(root.join(location)).map_err(|error| error.to_string());
    }
    download(location).map_err(|status| format!("{location} answered {status}"))
}

fn copied(root: &Path, location: &str, name: &str) -> Option<(String, Vec<u8>)> {
    let read = bytes_of(root, location).and_then(|bytes| {
        let image = sniff_image(&bytes, true).ok_or("it isn't a PNG, JPEG, WebP or SVG")?;
        Ok((format!("{name}.{}", image.extension), bytes))
    });
    read.map_err(|error| caution(&format!("Left out {location}: {error}")))
        .ok()
}

/// listing.toml and its pictures, from what the project says about itself,
/// unless it has one already.
pub fn listing_files(project: &Project, identity: &Identity) -> Result<Vec<PlannedFile>> {
    let file = format!("{LISTING_FOLDER}/{LISTING_TOML}");
    if read_optional(&project.root.join(&file))?.is_some() {
        return Ok(Vec::new());
    }
    let component = project.appstream.as_ref().map(|entry| &entry.component);
    let mut media = Vec::new();
    let mut place = |location: &str, name: &str| -> Option<String> {
        if let Some(inside) = location.strip_prefix(&format!("{LISTING_FOLDER}/"))
            && !web(location)
        {
            return Some(inside.to_owned());
        }
        let (path, bytes) = copied(&project.root, location, name)?;
        media.push(PlannedFile {
            path: format!("{LISTING_FOLDER}/{path}"),
            contents: bytes,
            existing: None,
        });
        Some(path)
    };
    let icon = project.icon.as_deref().and_then(|icon| place(icon, "icon"));
    let screenshots: Vec<Screenshot> = component
        .map(|component| {
            component
                .screenshots
                .iter()
                .take(MAX_SCREENSHOTS)
                .collect::<Vec<_>>()
        })
        .unwrap_or_default()
        .into_iter()
        .enumerate()
        .filter_map(|(index, shot)| place(&shot.url, &format!("screenshots/{}", index + 1)))
        .map(Screenshot::File)
        .collect();
    let some = |items: &[String], limit: usize| {
        (!items.is_empty()).then(|| items.iter().take(limit).cloned().collect())
    };
    let listing = ListingToml {
        name: identity.name.clone(),
        summary: identity.summary.clone(),
        description: component
            .map(|component| component.description.clone())
            .filter(|description| !description.is_empty())
            .or_else(|| {
                project
                    .sabine
                    .as_ref()
                    .and_then(|sabine| sabine.description.clone())
                    .filter(|description| !description.is_empty())
            }),
        keywords: component.and_then(|component| some(&component.keywords, MAX_KEYWORDS)),
        categories: component.and_then(|component| some(&component.categories, MAX_CATEGORIES)),
        homepage: component.and_then(|component| component.urls.get("homepage").cloned()),
        support: component.and_then(|component| {
            ["bugtracker", "help", "contact"]
                .iter()
                .find_map(|kind| component.urls.get(*kind).cloned())
        }),
        content_rating: component.and_then(|component| component.content_rating.clone()),
        icon,
        screenshots: (!screenshots.is_empty()).then_some(screenshots),
        ..ListingToml::default()
    };
    let mut files = vec![PlannedFile {
        path: file,
        contents: listing_toml_for(&listing).into_bytes(),
        existing: None,
    }];
    files.extend(media);
    Ok(files)
}
