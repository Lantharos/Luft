use std::fs;
use std::io;
use std::path::Path;

use crate::scene::Notice;

pub const SECONDS: &str = "{seconds}";

#[derive(Debug, Clone, Default, PartialEq)]
pub struct NoticeFile {
    pub notice: Notice,
    pub countdown: Option<u32>,
    pub keys: Vec<char>,
}

impl NoticeFile {
    pub fn load(path: &Path) -> io::Result<Self> {
        Self::parse(&fs::read_to_string(path)?)
            .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "the notice isn't readable"))
    }

    fn parse(text: &str) -> Option<Self> {
        let mut file = Self::default();
        for line in text.lines().filter(|line| !line.is_empty()) {
            let (field, value) = line.split_once(' ')?;
            match field {
                "title" => file.notice.title = value.to_owned(),
                "line" => file.notice.body.push(value.to_owned()),
                "step" => file.notice.steps.push(value.to_owned()),
                "footer" => file.notice.footer = value.to_owned(),
                "countdown" => file.countdown = Some(value.parse().ok()?),
                "key" => file.keys.push(value.chars().next()?.to_ascii_lowercase()),
                _ => return None,
            }
        }
        (!file.notice.title.is_empty()).then_some(file)
    }
}
