use std::ffi::OsString;
use std::path::PathBuf;

pub struct Request {
    pub size: u32,
    pub input: PathBuf,
    pub output: PathBuf,
}

impl Request {
    pub fn parse(mut arguments: impl Iterator<Item = OsString>) -> Option<Self> {
        let mut size = None;
        let mut paths = Vec::new();
        while let Some(argument) = arguments.next() {
            if argument == "-s" {
                size = arguments.next()?.to_str()?.parse().ok();
            } else {
                paths.push(PathBuf::from(argument));
            }
        }
        let [input, output] = <[PathBuf; 2]>::try_from(paths).ok()?;
        Some(Self {
            size: size.filter(|size| *size > 0)?,
            input,
            output,
        })
    }
}
