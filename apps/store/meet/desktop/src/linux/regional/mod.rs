mod keyboards;
#[cfg(test)]
mod tests;

use std::path::Path;

use luft_meet::regional::{self, Hints};

use crate::language;

const LOCAL_TIME: &str = "/etc/localtime";
const TIME_ZONE: &str = "/etc/timezone";
const ZONE_INFO: &str = "zoneinfo/";

fn variable(names: &[&str]) -> Option<String> {
    names
        .iter()
        .filter_map(|name| std::env::var(name).ok())
        .find(|value| !value.is_empty())
}

fn posix(locale: &str) -> Option<String> {
    let (name, modifier) = locale.split_once('@').unwrap_or((locale, ""));
    let name = name.split('.').next()?;
    let (language, region) = name.split_once('_')?;
    let plain =
        |part: &str| !part.is_empty() && part.bytes().all(|byte| byte.is_ascii_alphabetic());
    if !plain(language) || !plain(region) {
        return None;
    }
    Some(match modifier {
        "" => name.to_owned(),
        modifier => format!("{name}@{modifier}"),
    })
}

fn time_zone() -> Option<String> {
    let linked = std::fs::read_link(LOCAL_TIME).ok().and_then(|target| {
        let target = target.to_string_lossy().into_owned();
        Some(target.split_once(ZONE_INFO)?.1.to_owned())
    });
    let name = linked.or_else(|| {
        std::fs::read_to_string(Path::new(TIME_ZONE))
            .ok()
            .map(|text| text.trim().to_owned())
    })?;
    regional::canonical_zone(&name)
}

pub fn hints() -> Hints {
    Hints {
        language: regional::posix_language(language::hint()),
        locale: variable(&["LC_ALL", "LC_TIME", "LANG"])
            .as_deref()
            .and_then(posix),
        timezone: time_zone(),
        keyboards: regional::distinct(keyboards::active()),
    }
}
