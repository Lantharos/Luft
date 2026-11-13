use std::path::Path;

use super::issues::{Issue, Level};
use crate::artifacts::images::{Image, sniff_image};
use crate::schema::join_config_path;
use crate::schema::listing::ListingToml;

const MIN_SCREENSHOT_EDGE: u32 = 640;
const MIN_ICON_EDGE: u32 = 256;

fn image_at(root: &Path, path: &str) -> Option<Option<Image>> {
    std::fs::read(root.join(path))
        .ok()
        .map(|bytes| sniff_image(&bytes, true))
}

/// What's wrong with the listing's icon and screenshots.
pub fn media_issues(root: &Path, folder: &str, file: &str, listing: &ListingToml) -> Vec<Issue> {
    let mut issues = Vec::new();
    let mut problem = |key: &str, message: String| {
        issues.push(Issue::new(Level::Error, file, Some(key), message));
    };
    if let Some(icon) = &listing.icon {
        match image_at(root, &join_config_path(&[folder, icon])) {
            None => problem("icon", format!("{icon} isn't in {folder}")),
            Some(None) => problem("icon", format!("{icon} isn't a PNG, JPEG, WebP or SVG")),
            Some(Some(image)) if image.width != image.height => {
                problem("icon", format!("{icon} isn't square"))
            }
            Some(Some(image)) if image.extension != "svg" && image.width < MIN_ICON_EDGE => {
                problem(
                    "icon",
                    format!(
                        "{icon} is {} pixels wide; icons are an SVG or at least {MIN_ICON_EDGE} pixels",
                        image.width
                    ),
                )
            }
            Some(Some(_)) => {}
        }
    }
    for (index, entry) in listing.screenshots.iter().flatten().enumerate() {
        let shot = entry.file();
        let key = format!("screenshots.{index}");
        match image_at(root, &join_config_path(&[folder, shot])) {
            None => problem(&key, format!("{shot} isn't in {folder}")),
            Some(image) if image.is_none_or(|image| image.extension == "svg") => {
                problem(&key, format!("{shot} isn't a PNG, JPEG or WebP"))
            }
            Some(Some(image)) if image.width.min(image.height) < MIN_SCREENSHOT_EDGE => problem(
                &key,
                format!(
                    "{shot} is {}×{}; screenshots are at least {MIN_SCREENSHOT_EDGE} pixels on each side",
                    image.width, image.height
                ),
            ),
            Some(_) => {}
        }
    }
    issues
}
