use alloc::format;
use alloc::string::{String, ToString};

use uefi::Handle;

use crate::files::Volume;
use crate::loader::vars;

#[derive(Clone, Copy, PartialEq, Eq)]
pub struct Tries {
    pub left: u32,
    pub done: u32,
}

#[derive(Clone)]
pub struct Counted {
    pub volume: Handle,
    pub directory: &'static str,
    pub stem: String,
    pub file: String,
    pub tries: Tries,
}

fn number(text: &str) -> Option<u32> {
    (!text.is_empty() && text.bytes().all(|byte| byte.is_ascii_digit()))
        .then(|| text.parse().ok())
        .flatten()
}

pub fn split(name: &str) -> (String, Option<(String, Tries)>) {
    let counted = name.strip_suffix(".conf").and_then(|base| {
        let (stem, counter) = base.rsplit_once('+')?;
        let (left, done) = counter.split_once('-').unwrap_or((counter, "0"));
        Some((
            stem,
            Tries {
                left: number(left)?,
                done: number(done)?,
            },
        ))
    });
    match counted {
        Some((stem, tries)) => (format!("{stem}.conf"), Some((stem.to_string(), tries))),
        None => (name.to_string(), None),
    }
}

impl Counted {
    pub fn bad(&self) -> bool {
        self.tries.left == 0
    }

    pub fn start(&self) {
        let directory = self.directory;
        let mut file = self.file.clone();
        if self.tries.left > 0 {
            let next = format!(
                "{}+{}-{}.conf",
                self.stem,
                self.tries.left - 1,
                self.tries.done.saturating_add(1)
            );
            let renamed = Volume::open(self.volume)
                .and_then(|mut volume| volume.rename(&format!("{directory}\\{file}"), &next));
            if renamed.is_none() {
                return;
            }
            file = next;
        }
        vars::boot_count_path(&format!("{directory}\\{file}"));
    }
}
