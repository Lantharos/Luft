use crate::portals::{Options, option, owned};

pub const COLOR: &str = "color";
pub const MONOCHROME: &str = "monochrome";

pub struct Paper {
    pub keyword: String,
    pub name: String,
    pub width: f64,
    pub height: f64,
}

pub struct Choices {
    pub printer: String,
    pub copies: i32,
    pub collate: bool,
    pub pages: String,
    pub ranges: String,
    pub orientation: String,
    pub sides: String,
    pub color_mode: String,
    pub paper: Option<Paper>,
}

impl Choices {
    pub fn read(chosen: &Options) -> Option<Self> {
        let text = |key: &str| option::<String>(chosen, key).unwrap_or_default();
        let paper = option::<String>(chosen, "paper").map(|keyword| Paper {
            keyword,
            name: text("paper-name"),
            width: option(chosen, "paper-width").unwrap_or_default(),
            height: option(chosen, "paper-height").unwrap_or_default(),
        });
        Some(Self {
            printer: option(chosen, "printer")?,
            copies: option(chosen, "copies").unwrap_or(1),
            collate: option(chosen, "collate").unwrap_or(true),
            pages: text("pages"),
            ranges: text("ranges"),
            orientation: text("orientation"),
            sides: text("sides"),
            color_mode: text("color-mode"),
            paper,
        })
    }

    pub fn job(&self, ranges_applied: bool) -> Options {
        let mut job = Options::from([
            ("copies".into(), owned(self.copies)),
            ("collate".into(), owned(self.collate)),
        ]);
        for (key, value) in [
            ("sides", &self.sides),
            ("print-color-mode", &self.color_mode),
        ] {
            if !value.is_empty() {
                job.insert(key.into(), owned(value.clone()));
            }
        }
        if let Some(paper) = &self.paper {
            job.insert("media".into(), owned(paper.keyword.clone()));
        }
        if !ranges_applied
            && self.pages == "ranges"
            && let Some(ranges) = parse_ranges(&self.ranges)
        {
            job.insert("page-ranges".into(), owned(ranges));
        }
        job
    }
}

fn page(text: &str) -> Option<i32> {
    text.trim().parse().ok().filter(|&page| page >= 1)
}

pub fn parse_ranges(text: &str) -> Option<Vec<(i32, i32)>> {
    let mut ranges = Vec::new();
    for part in text
        .split(',')
        .map(str::trim)
        .filter(|part| !part.is_empty())
    {
        let (start, end) = match part.split_once(['-', '–']) {
            Some((start, end)) => (page(start)?, page(end)?),
            None => (page(part)?, page(part)?),
        };
        if end < start {
            return None;
        }
        ranges.push((start, end));
    }
    (!ranges.is_empty()).then_some(ranges)
}
