use alloc::format;
use alloc::string::String;

use uefi::Handle;

use crate::files::Volume;

const EXTENSION: usize = ".efi".len();

#[derive(Clone, Copy)]
pub struct Tries {
    pub left: u32,
    pub done: u32,
}

impl Tries {
    pub fn exhausted(self) -> bool {
        self.left == 0
    }

    fn after_attempt(self) -> Self {
        Self {
            left: self.left.saturating_sub(1),
            done: self.done.saturating_add(1),
        }
    }
}

fn number(text: &str) -> Option<u32> {
    text.bytes()
        .all(|byte| byte.is_ascii_digit())
        .then(|| text.parse().ok())?
}

fn parse(counter: &str) -> Option<Tries> {
    let (left, done) = counter.split_once('-').unwrap_or((counter, "0"));
    Some(Tries {
        left: number(left)?,
        done: number(done)?,
    })
}

pub fn split(file: &str) -> (String, Option<Tries>) {
    let (stem, extension) = file.split_at(file.len() - EXTENSION);
    match stem
        .rsplit_once('+')
        .and_then(|(name, counter)| Some((name, parse(counter)?)))
    {
        Some((name, tries)) => (format!("{name}{extension}"), Some(tries)),
        None => (String::from(file), None),
    }
}

fn counted(name: &str, tries: Tries) -> String {
    let (stem, extension) = name.split_at(name.len() - EXTENSION);
    format!("{stem}+{}-{}{extension}", tries.left, tries.done)
}

pub fn record_attempt(volume: Handle, path: &str, tries: Tries) -> Option<(String, Tries)> {
    let (folder, file) = path.rsplit_once('\\')?;
    let attempted = tries.after_attempt();
    let renamed = counted(&split(file).0, attempted);
    Volume::open(volume)?.rename(path, &renamed)?;
    Some((format!("{folder}\\{renamed}"), attempted))
}
