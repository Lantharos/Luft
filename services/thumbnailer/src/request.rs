use std::ffi::OsString;
use std::path::PathBuf;

const MAX_SIZE: u32 = 1024;

pub enum Kind {
    App,
    Video,
    Cover,
}

pub struct Request {
    pub kind: Kind,
    pub size: u32,
    pub input: PathBuf,
    pub output: PathBuf,
}

impl Request {
    pub fn parse(mut arguments: impl Iterator<Item = OsString>) -> Option<Self> {
        let mut kind = Kind::App;
        let mut size = None;
        let mut paths = Vec::new();
        while let Some(argument) = arguments.next() {
            if argument == "-s" {
                size = arguments.next()?.to_str()?.parse().ok();
            } else if argument == "--video" {
                kind = Kind::Video;
            } else if argument == "--cover" {
                kind = Kind::Cover;
            } else {
                paths.push(PathBuf::from(argument));
            }
        }
        let [input, output] = <[PathBuf; 2]>::try_from(paths).ok()?;
        Some(Self {
            kind,
            size: size.filter(|size| (1..=MAX_SIZE).contains(size))?,
            input,
            output,
        })
    }
}
