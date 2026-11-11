use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::sync::OnceLock;

use ammonia::{Builder, UrlRelative};
use lol_html::{RewriteStrSettings, element, rewrite_str};
use url::Url;

const EXTRA_TAGS: [&str; 4] = ["style", "font", "center", "big"];
const EXTRA_ATTRIBUTES: [&str; 17] = [
    "style",
    "class",
    "id",
    "align",
    "valign",
    "width",
    "height",
    "bgcolor",
    "color",
    "dir",
    "lang",
    "border",
    "cellpadding",
    "cellspacing",
    "face",
    "size",
    "role",
];
const SCHEMES: [&str; 5] = ["http", "https", "mailto", "tel", "cid"];
const TRACKERS: [&str; 22] = [
    "/track/open",
    "/open.php",
    "/open.aspx",
    "/o.gif",
    "/wf/open",
    "list-manage.com/track",
    "mailtrack.io",
    "/e2t/to",
    "/trk?",
    "/trk/",
    "/open?",
    "openrate",
    "mandrillapp.com/track",
    "sendgrid.net/wf",
    "/emimp/",
    "pixel.",
    "/pixel",
    "beacon",
    "/tracking/",
    "spacer.gif",
    "/imp?",
    "mailstat",
];

#[derive(Default)]
pub struct Cleaned {
    pub html: String,
    pub designed: bool,
    pub remote: Vec<String>,
    pub trackers: usize,
    pub cids: Vec<String>,
}

fn sanitizer() -> &'static Builder<'static> {
    static BUILDER: OnceLock<Builder<'static>> = OnceLock::new();
    BUILDER.get_or_init(|| {
        let mut builder = Builder::default();
        builder
            .add_tags(EXTRA_TAGS)
            .rm_clean_content_tags(["style"])
            .add_generic_attributes(EXTRA_ATTRIBUTES)
            .url_schemes(HashSet::from(SCHEMES))
            .url_relative(UrlRelative::Deny)
            .link_rel(Some("noopener noreferrer"))
            .strip_comments(true);
        builder
    })
}

fn tiny(value: Option<String>) -> bool {
    value.is_some_and(|value| {
        value
            .trim()
            .trim_end_matches("px")
            .parse::<f32>()
            .is_ok_and(|size| size <= 2.0)
    })
}

fn hidden(style: Option<String>) -> bool {
    style.is_some_and(|style| {
        let style = style.replace(' ', "").to_ascii_lowercase();
        style.contains("display:none")
            || style.contains("width:1px")
            || style.contains("height:1px")
            || style.contains("width:0")
            || style.contains("height:0")
    })
}

fn is_tracker(url: &str) -> bool {
    let url = url.to_ascii_lowercase();
    TRACKERS.iter().any(|pattern| url.contains(pattern))
}

pub fn clean(html: &str, inline: &HashMap<String, PathBuf>) -> Cleaned {
    let safe = sanitizer().clean(html).to_string();
    let designed = {
        let lower = safe.to_ascii_lowercase();
        lower.contains("bgcolor")
            || lower.contains("background")
            || lower.matches("<table").count() > 2
    };
    let remote = RefCell::new(Vec::new());
    let cids = RefCell::new(Vec::new());
    let trackers = RefCell::new(0usize);
    let rewritten = rewrite_str(
        &safe,
        RewriteStrSettings::new()
            .append_element_content_handler(element!("img", |image| {
                let source = image.get_attribute("src").unwrap_or_default();
                image.remove_attribute("src");
                image.remove_attribute("srcset");
                match Url::parse(&source) {
                    Ok(url) if url.scheme() == "cid" => {
                        let cid = source.trim().split_once(':').map_or("", |(_, cid)| cid);
                        if let Some(path) = inline.get(cid) {
                            image.set_attribute("data-mm-file", &path.to_string_lossy())?;
                            cids.borrow_mut().push(cid.to_owned());
                        }
                    }
                    Ok(url) if matches!(url.scheme(), "http" | "https") => {
                        let tracker = tiny(image.get_attribute("width"))
                            || tiny(image.get_attribute("height"))
                            || hidden(image.get_attribute("style"))
                            || is_tracker(url.as_str());
                        if tracker {
                            *trackers.borrow_mut() += 1;
                            image.remove();
                        } else {
                            image.set_attribute("data-mm-remote", url.as_str())?;
                            remote.borrow_mut().push(url.into());
                        }
                    }
                    _ => {}
                }
                Ok(())
            }))
            .append_element_content_handler(element!("[background]", |element| {
                element.remove_attribute("background");
                Ok(())
            })),
    )
    .unwrap_or_default();
    let mut remote = remote.into_inner();
    remote.dedup();
    Cleaned {
        html: rewritten,
        designed,
        remote,
        trackers: trackers.into_inner(),
        cids: cids.into_inner(),
    }
}
