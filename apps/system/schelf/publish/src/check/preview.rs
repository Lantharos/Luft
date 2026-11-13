use super::Validation;
use crate::ui::output::{blank, field, line};
use crate::ui::style::{bold, muted};

const DESCRIPTION_LINES: usize = 8;

fn width() -> usize {
    let columns = std::env::var("COLUMNS")
        .ok()
        .and_then(|columns| columns.parse().ok())
        .unwrap_or(80usize);
    columns.min(88) - 4
}

/// `text` broken into lines of at most `width` characters at spaces.
pub fn wrap(text: &str, width: usize) -> Vec<String> {
    let mut lines = Vec::new();
    for paragraph in text.split('\n') {
        let mut current = String::new();
        for word in paragraph.split(' ') {
            if !current.is_empty() && current.chars().count() + word.chars().count() + 1 > width {
                lines.push(std::mem::take(&mut current));
                current.push_str(word);
            } else if current.is_empty() {
                current.push_str(word);
            } else {
                current.push(' ');
                current.push_str(word);
            }
        }
        lines.push(current);
    }
    lines
}

/// Shows how the store page will look, when there's a listing to show.
pub fn preview(validation: &Validation) -> bool {
    let Some(listing) = &validation.listing else {
        return false;
    };
    let page = listing;
    line(&bold(&page.name));
    line(&page.summary);
    let manifest = validation.manifest.as_ref();
    let source = manifest.and_then(|manifest| {
        manifest
            .licence
            .clone()
            .or((manifest.distribution == "proprietary").then(|| "Closed source".to_owned()))
    });
    let access = if validation.full_access {
        "Full access"
    } else {
        "Limited access"
    };
    let byline: Vec<String> = source.into_iter().chain([access.to_owned()]).collect();
    line(&muted(&byline.join(" · ")));
    if let Some(description) = page.description.as_deref().filter(|text| !text.is_empty()) {
        blank();
        let lines = wrap(description, width());
        for text in lines.iter().take(DESCRIPTION_LINES) {
            line(text);
        }
        if lines.len() > DESCRIPTION_LINES {
            line(&muted("…"));
        }
    }
    blank();
    let mut access = validation.access.iter();
    field(
        "Permissions",
        access.next().map_or(
            "Nothing beyond its own place on the desktop",
            String::as_str,
        ),
    );
    for text in access {
        field("", text);
    }
    field(
        "Screenshots",
        &page.screenshots.as_ref().map_or(0, Vec::len).to_string(),
    );
    if let Some(categories) = page
        .categories
        .as_ref()
        .filter(|categories| !categories.is_empty())
    {
        field("Categories", &categories.join(", "));
    }
    if let Some(homepage) = &page.homepage {
        field("Homepage", homepage);
    }
    if let Some(support) = &page.support {
        field("Support", support);
    }
    if let Some(translations) = &page.translations {
        let languages: Vec<&str> = std::iter::once("en")
            .chain(translations.keys().map(String::as_str))
            .collect();
        field("Languages", &languages.join(", "));
    }
    true
}
