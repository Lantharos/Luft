use super::choices::{COLOR, Choices, MONOCHROME, parse_ranges};
use crate::portals::{Options, option, owned};

const DUPLEX: [(&str, &str); 3] = [
    ("simplex", "one-sided"),
    ("vertical", "two-sided-long-edge"),
    ("horizontal", "two-sided-short-edge"),
];
const PAGE_CHOICES: [&str; 4] = ["all", "current", "selection", "ranges"];
const REPLACED_SETTINGS: [&str; 2] = ["output-uri", "page-ranges"];

fn display_ranges(gtk: &str) -> String {
    gtk.split(',')
        .map(|range| {
            range
                .split('-')
                .map(|page| {
                    page.trim()
                        .parse::<u32>()
                        .map_or_else(|_| page.to_owned(), |page| (page + 1).to_string())
                })
                .collect::<Vec<_>>()
                .join("-")
        })
        .collect::<Vec<_>>()
        .join(", ")
}

fn gtk_ranges(ranges: &[(i32, i32)]) -> String {
    ranges
        .iter()
        .map(|&(start, end)| {
            if start == end {
                format!("{}", start - 1)
            } else {
                format!("{}-{}", start - 1, end - 1)
            }
        })
        .collect::<Vec<_>>()
        .join(",")
}

fn is_true(text: &str) -> bool {
    text.eq_ignore_ascii_case("true")
}

pub fn preferences(settings: &Options, page_setup: &Options) -> Options {
    let setting = |key: &str| option::<String>(settings, key);
    let mut wanted = Options::new();
    if let Some(printer) = setting("printer") {
        wanted.insert("printer".into(), owned(printer));
    }
    if let Some(copies) = setting("n-copies")
        .and_then(|copies| copies.parse::<i32>().ok())
        .filter(|&copies| copies > 0)
    {
        wanted.insert("copies".into(), owned(copies));
    }
    if let Some(collate) = setting("collate") {
        wanted.insert("collate".into(), owned(is_true(&collate)));
    }
    if let Some(pages) =
        setting("print-pages").filter(|pages| PAGE_CHOICES.contains(&pages.as_str()))
    {
        wanted.insert("pages".into(), owned(pages));
    }
    if let Some(ranges) = setting("page-ranges").filter(|ranges| !ranges.is_empty()) {
        wanted.insert("ranges".into(), owned(display_ranges(&ranges)));
    }
    if let (Some(width), Some(height)) = (
        option::<f64>(page_setup, "Width"),
        option::<f64>(page_setup, "Height"),
    ) {
        wanted.insert("size".into(), owned((width, height)));
    }
    let orientation =
        option::<String>(page_setup, "Orientation").or_else(|| setting("orientation"));
    let landscape = orientation.is_some_and(|orientation| orientation.ends_with("landscape"));
    wanted.insert(
        "orientation".into(),
        owned(if landscape { "landscape" } else { "portrait" }),
    );
    if let Some((_, sides)) =
        setting("duplex").and_then(|duplex| DUPLEX.into_iter().find(|(gtk, _)| *gtk == duplex))
    {
        wanted.insert("sides".into(), owned(sides));
    }
    if let Some(color) = setting("use-color") {
        wanted.insert(
            "color-mode".into(),
            owned(if is_true(&color) { COLOR } else { MONOCHROME }),
        );
    }
    wanted
}

pub fn settings(choices: &Choices, settings: &Options) -> Options {
    let mut updated: Options = settings
        .iter()
        .filter(|(key, _)| !REPLACED_SETTINGS.contains(&key.as_str()))
        .map(|(key, value)| (key.clone(), value.clone()))
        .collect();
    let mut set = |key: &str, value: String| {
        updated.insert(key.into(), owned(value));
    };
    set("printer", choices.printer.clone());
    set("n-copies", choices.copies.to_string());
    set("collate", choices.collate.to_string());
    set("print-pages", choices.pages.clone());
    set("orientation", choices.orientation.clone());
    set("output-file-format", "pdf".into());
    if choices.pages == "ranges"
        && let Some(ranges) = parse_ranges(&choices.ranges)
    {
        set("page-ranges", gtk_ranges(&ranges));
    }
    if let Some((duplex, _)) = DUPLEX
        .into_iter()
        .find(|(_, sides)| *sides == choices.sides)
    {
        set("duplex", duplex.into());
    }
    if !choices.color_mode.is_empty() {
        set("use-color", (choices.color_mode == COLOR).to_string());
    }
    if let Some(paper) = &choices.paper {
        set("paper-format", paper.keyword.clone());
        set("paper-width", paper.width.to_string());
        set("paper-height", paper.height.to_string());
    }
    updated
}

pub fn page_setup(choices: &Choices, page_setup: &Options) -> Options {
    let mut updated = page_setup.clone();
    updated.insert("Orientation".into(), owned(choices.orientation.clone()));
    if let Some(paper) = &choices.paper {
        updated.remove("PPDName");
        updated.insert("Name".into(), owned(paper.keyword.clone()));
        updated.insert("DisplayName".into(), owned(paper.name.clone()));
        updated.insert("Width".into(), owned(paper.width));
        updated.insert("Height".into(), owned(paper.height));
    }
    updated
}
