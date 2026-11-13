use super::issues::{Issue, Level};
use crate::schema::listing::ListingToml;

const MIN_SCREENSHOTS: usize = 2;

/// What a store page lacks that review asks for.
pub fn listing_issues(file: &str, listing: &ListingToml) -> Vec<Issue> {
    let mut issues = Vec::new();
    let mut missing = |key: &str, message: String| {
        issues.push(Issue::new(Level::Warning, file, Some(key), message));
    };
    if listing.description.as_deref().is_none_or(str::is_empty) {
        missing("description", "No description; review asks for one".into());
    }
    if listing.icon.is_none() {
        missing("icon", "No icon".into());
    }
    let screenshots = listing.screenshots.as_ref().map_or(0, Vec::len);
    if screenshots < MIN_SCREENSHOTS {
        let plural = if screenshots == 1 { "" } else { "s" };
        missing(
            "screenshots",
            format!(
                "{screenshots} screenshot{plural}, and review asks for at least {MIN_SCREENSHOTS}"
            ),
        );
    }
    if listing.categories.as_ref().is_none_or(Vec::is_empty) {
        missing("categories", "No categories".into());
    }
    if listing.homepage.is_none() {
        missing("homepage", "No homepage".into());
    }
    if listing.support.is_none() {
        missing("support", "No support link".into());
    }
    issues
}
