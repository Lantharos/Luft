use std::path::PathBuf;

use anyhow::Result;

use crate::paths;
use crate::system::efi;

use super::esp::{self, Esp};
use super::images;

const TRIES: u32 = 3;
const FAILED: &str = "failed-start";
const MAIN_PROFILE: &str = "main";

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct Tries {
    pub left: u32,
    pub done: u32,
}

impl Tries {
    pub fn untried() -> Self {
        Self {
            left: TRIES,
            done: 0,
        }
    }

    fn reported() -> Self {
        Self { left: 0, done: 0 }
    }

    pub fn counter(self) -> String {
        match self.done {
            0 => format!("+{}", self.left),
            done => format!("+{}-{done}", self.left),
        }
    }

    fn attempted(self) -> bool {
        self.done > 0
    }

    fn failed(self) -> bool {
        self.left == 0 && self.attempted()
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

pub fn split(stem: &str) -> (&str, Option<Tries>) {
    match stem
        .rsplit_once('+')
        .and_then(|(version, counter)| Some((version, parse(counter)?)))
    {
        Some((version, tries)) => (version, Some(tries)),
        None => (stem, None),
    }
}

fn failed_record() -> PathBuf {
    PathBuf::from(paths::RUNTIME).join(FAILED)
}

fn booted_version() -> Option<String> {
    let entry = efi::selected_entry()?;
    let (file, profile) = entry.split_once('@').unwrap_or((&entry, MAIN_PROFILE));
    if profile != MAIN_PROFILE {
        return None;
    }
    images::version_of(file).map(str::to_owned)
}

pub fn mark_good() -> Result<()> {
    let Some(version) = booted_version() else {
        return Ok(());
    };
    let esp = esp::find()?;
    if let Some(image) = images::find(&esp, &version)
        && image.tries.is_some_and(Tries::attempted)
    {
        images::set_tries(&image, None)?;
        rustix::fs::sync();
    }
    Ok(())
}

pub fn note_failures(esp: &Esp) -> Result<()> {
    let Some(booted) = booted_version() else {
        return Ok(());
    };
    let failed: Vec<_> = images::present(esp)
        .into_iter()
        .filter(|image| image.version != booted && image.tries.is_some_and(Tries::failed))
        .collect();
    let Some(newest) = failed.first() else {
        return Ok(());
    };
    paths::ensure_private(paths::RUNTIME)?;
    std::fs::write(failed_record(), &newest.version)?;
    for image in &failed {
        images::set_tries(image, Some(Tries::reported()))?;
    }
    rustix::fs::sync();
    Ok(())
}

pub fn failed_version() -> String {
    std::fs::read_to_string(failed_record()).unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_the_counter_after_the_version() {
        assert_eq!(
            split("7.2.8-300.fc45.x86_64+2-1"),
            ("7.2.8-300.fc45.x86_64", Some(Tries { left: 2, done: 1 }))
        );
        assert_eq!(
            split("7.2.8-300.fc45.x86_64+3"),
            ("7.2.8-300.fc45.x86_64", Some(Tries { left: 3, done: 0 }))
        );
        assert_eq!(split("6.1.0+rpt-rpi"), ("6.1.0+rpt-rpi", None));
    }
}
