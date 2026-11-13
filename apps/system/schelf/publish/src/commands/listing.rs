use std::collections::BTreeMap;

use serde::Serialize;
use serde_json::Value;

use super::context::{Verb, signed_in, verbs};
use crate::api::dashboard::{items, text};
use crate::api::http::download;
use crate::args::Args;
use crate::artifacts::images::sniff_image;
use crate::error::{Error, Result};
use crate::project::config::{config_place, relative};
use crate::project::files::read_optional;
use crate::schema::listing::{ListingToml, Screenshot, Translation};
use crate::schema::{LISTING_TOML, schelf};
use crate::setup::listing::LISTING_FOLDER;
use crate::setup::workflow::listing_toml_for;
use crate::ui::output::{blank, done, emit, field, note, title};
use crate::ui::{OK, USAGE};

/// A picture of the store page, saved under the listing folder.
pub struct Image {
    pub path: String,
    pub bytes: Vec<u8>,
}

fn image(
    fetch: &dyn Fn(&str) -> std::result::Result<Vec<u8>, String>,
    url: &str,
    name: &str,
) -> Result<Image> {
    let bytes = fetch(url).map_err(|status| {
        Error::hinted(
            format!("Couldn't download {url}"),
            format!("It answered {status}."),
            crate::ui::FAILED,
        )
    })?;
    let sniffed = sniff_image(&bytes, true)
        .ok_or_else(|| Error::failure(format!("{url} isn't a PNG, JPEG, WebP or SVG")))?;
    Ok(Image {
        path: format!("{name}.{}", sniffed.extension),
        bytes,
    })
}

fn given(value: &Value) -> Option<String> {
    value
        .as_str()
        .filter(|text| !text.is_empty())
        .map(str::to_owned)
}

fn words(value: &Value) -> Option<Vec<String>> {
    let found: Vec<String> = items(value)
        .iter()
        .filter_map(|word| word.as_str().map(str::to_owned))
        .collect();
    (!found.is_empty()).then_some(found)
}

/// The store page as the dashboard has it, as listing.toml and its pictures.
pub fn listing_of(
    settings: &Value,
    fetch: &dyn Fn(&str) -> std::result::Result<Vec<u8>, String>,
) -> Result<(ListingToml, Vec<Image>)> {
    let languages = settings["listing"].as_object().cloned().unwrap_or_default();
    let english = languages
        .get("en")
        .ok_or_else(|| Error::failure("The store page has no English name and summary yet"))?;
    let meta = &settings["meta"];
    let icon = given(&meta["icon"])
        .map(|url| image(fetch, &url, "icon"))
        .transpose()?;
    let shots = items(&settings["screenshots"])
        .iter()
        .enumerate()
        .map(|(index, shot)| {
            image(
                fetch,
                text(shot, "url"),
                &format!("screenshots/{}", index + 1),
            )
        })
        .collect::<Result<Vec<_>>>()?;
    let screenshots: Vec<Screenshot> = shots
        .iter()
        .zip(items(&settings["screenshots"]))
        .map(|(saved, shot)| {
            let (caption, platform) = (given(&shot["caption"]), given(&shot["platform"]));
            if caption.is_none() && platform.is_none() {
                Screenshot::File(saved.path.clone())
            } else {
                Screenshot::Described {
                    file: saved.path.clone(),
                    caption,
                    platform,
                }
            }
        })
        .collect();
    let app = &settings["app"];
    let translations: BTreeMap<String, Translation> = languages
        .iter()
        .filter(|(locale, _)| *locale != "en")
        .map(|(locale, page)| {
            (
                locale.clone(),
                Translation {
                    name: given(&page["name"]),
                    summary: given(&page["summary"]),
                    description: given(&page["description"]),
                    keywords: words(&page["keywords"]),
                },
            )
        })
        .collect();
    let listed =
        text(app, "visibility") == "listed" || app["listing_requested"].as_bool() == Some(true);
    let indexed =
        text(app, "visibility") == "unlisted" && app["page_indexed"].as_bool() == Some(true);
    let listing = ListingToml {
        name: text(english, "name").to_owned(),
        summary: text(english, "summary").to_owned(),
        description: given(&english["description"]),
        keywords: words(&english["keywords"]),
        categories: words(&meta["categories"]),
        homepage: given(&meta["homepage"]),
        support: given(&meta["support"]),
        privacy_url: given(&meta["privacy_url"]),
        content_rating: given(&meta["content_rating"]),
        brand_color: given(&meta["brand_color"]),
        icon: icon.as_ref().map(|icon| icon.path.clone()),
        screenshots: (!screenshots.is_empty()).then_some(screenshots),
        listed: listed.then_some(true),
        indexed: indexed.then_some(true),
        translations: (!translations.is_empty()).then_some(translations),
    };
    Ok((listing, icon.into_iter().chain(shots).collect()))
}

#[derive(Serialize)]
struct Pulled<'a> {
    file: &'a str,
    images: Vec<&'a str>,
    listing: &'a ListingToml,
}

fn pull(args: &mut Args) -> Result<i32> {
    let place = config_place(args.flag("config"));
    let Some(text) = read_optional(&place.config)? else {
        return Err(Error::hinted(
            "There's no schelf.toml here",
            "Run this in the app's folder, or pass --config.",
            USAGE,
        ));
    };
    let manifest = schelf::read(&text)?;
    let folder = place
        .folder
        .join(manifest.listing.as_deref().unwrap_or(LISTING_FOLDER));
    let file = folder.join(LISTING_TOML);
    let here = std::env::current_dir()?;
    let shown = relative(&here, &file);
    if read_optional(&file)?.is_some() && !args.has("force") {
        return Err(Error::hinted(
            format!("{shown} exists already"),
            "Pass --force to replace it with what the store has.",
            USAGE,
        ));
    }
    let context = signed_in(args)?;
    let settings = context.dashboard.app(manifest.name())?.value;
    let (listing, images) = listing_of(&settings, &download)?;
    std::fs::create_dir_all(&folder)?;
    for each in &images {
        let path = folder.join(&each.path);
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(path, &each.bytes)?;
    }
    std::fs::write(&file, listing_toml_for(&listing))?;
    emit(&Pulled {
        file: &shown,
        images: images.iter().map(|each| each.path.as_str()).collect(),
        listing: &listing,
    });
    title(&format!(
        "The store page of {}",
        crate::api::dashboard::text(&settings["app"], "name")
    ));
    field("Wrote", &shown);
    for each in &images {
        field("Saved", &relative(&here, &folder.join(&each.path)));
    }
    blank();
    if manifest.listing.is_none() {
        note(&format!(
            "Add listing = \"{LISTING_FOLDER}\" to schelf.toml so schelf apply sends it."
        ));
    }
    done("The listing is in your files now; change it there and run schelf apply");
    blank();
    Ok(OK)
}

pub const VERBS: [Verb; 1] = [Verb {
    name: "pull",
    usage: "pull [--force]",
    about: "Write the store page as it is now into listing.toml, with its icon and screenshots",
    run: pull,
}];

pub fn listing(args: &mut Args) -> Result<i32> {
    verbs("listing", &VERBS, args)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::schema::listing::parse;

    #[test]
    fn the_store_page_comes_back_as_a_listing_toml_that_apply_takes_as_it_is() {
        let settings = serde_json::json!({
            "app": { "visibility": "unlisted", "listing_requested": false, "page_indexed": true },
            "listing": {
                "en": { "name": "Notes", "summary": "Notes that stay out of the way", "description": "Write.", "keywords": [] },
                "sq": { "name": "Shënime", "summary": "Shënime që nuk të pengojnë", "description": "", "keywords": ["shënime"] }
            },
            "meta": {
                "icon": "https://dl.schelf.store/media/x/icon.svg",
                "categories": ["Office"],
                "homepage": "https://example.com",
                "support": null,
                "privacy_url": null,
                "content_rating": null,
                "brand_color": "#3e6b4f"
            },
            "screenshots": [{ "url": "https://dl.schelf.store/media/x/one.svg", "caption": "The editor", "platform": null }]
        });
        let svg = |_: &str| {
            Ok(b"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1 1\"/>".to_vec())
        };
        let (listing, images) = listing_of(&settings, &svg).unwrap();
        assert_eq!(
            images
                .iter()
                .map(|image| image.path.as_str())
                .collect::<Vec<_>>(),
            ["icon.svg", "screenshots/1.svg"]
        );
        let read = parse(LISTING_TOML, &listing_toml_for(&listing)).unwrap();
        assert_eq!(
            read,
            ListingToml {
                name: "Notes".into(),
                summary: "Notes that stay out of the way".into(),
                description: Some("Write.".into()),
                categories: Some(vec!["Office".into()]),
                homepage: Some("https://example.com".into()),
                brand_color: Some("#3e6b4f".into()),
                icon: Some("icon.svg".into()),
                screenshots: Some(vec![Screenshot::Described {
                    file: "screenshots/1.svg".into(),
                    caption: Some("The editor".into()),
                    platform: None,
                }]),
                indexed: Some(true),
                translations: Some(BTreeMap::from([(
                    "sq".to_owned(),
                    Translation {
                        name: Some("Shënime".into()),
                        summary: Some("Shënime që nuk të pengojnë".into()),
                        description: None,
                        keywords: Some(vec!["shënime".into()]),
                    },
                )])),
                ..ListingToml::default()
            }
        );
    }
}
