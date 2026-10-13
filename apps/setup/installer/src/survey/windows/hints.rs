use std::io::{Read, Seek};

use anyhow::Result;

use super::registry::Registry;
use super::volume::Volume;
use super::{Hints, Keyboard, keyboards, zones};

const SHARED_PROFILES: &[&str] = &["Default", "Default User", "Public", "All Users"];
const DEFAULT_USER_HIVE: &str = r"Windows\System32\config\DEFAULT";

pub(super) fn gather<R: Read + Seek>(
    volume: &mut Volume<R>,
    system: &Registry,
    control_set: Option<&str>,
) -> Result<Hints> {
    let timezone = match control_set {
        Some(control_set) => timezone(system, control_set)?,
        None => None,
    };
    let Some(user) = user_hive(volume)? else {
        return Ok(Hints {
            timezone,
            ..Hints::default()
        });
    };
    let user = Registry::new(&user)?;
    Ok(Hints {
        timezone,
        keyboard: keyboard(&user)?,
        locale: user
            .string(r"Control Panel\International", "LocaleName")?
            .as_deref()
            .and_then(posix_locale),
    })
}

fn timezone(system: &Registry, control_set: &str) -> Result<Option<String>> {
    let path = format!(r"{control_set}\Control\TimeZoneInformation");
    let name = system.string(&path, "TimeZoneKeyName")?;
    Ok(name.and_then(|name| zones::iana(&name)).map(Into::into))
}

fn user_hive<R: Read + Seek>(volume: &mut Volume<R>) -> Result<Option<Vec<u8>>> {
    let mut newest: Option<(u64, String)> = None;
    for profile in volume.subdirectories("Users")? {
        if SHARED_PROFILES
            .iter()
            .any(|shared| shared.eq_ignore_ascii_case(&profile))
        {
            continue;
        }
        let path = format!(r"Users\{profile}\NTUSER.DAT");
        if let Some(modified) = volume.modified(&path)?
            && newest.as_ref().is_none_or(|(time, _)| modified > *time)
        {
            newest = Some((modified, path));
        }
    }
    match newest {
        Some((_, path)) => volume.read(&path),
        None => volume.read(DEFAULT_USER_HIVE),
    }
}

fn keyboard(user: &Registry) -> Result<Option<Keyboard>> {
    let Some(preload) = user.string(r"Keyboard Layout\Preload", "1")? else {
        return Ok(None);
    };
    let klid = user
        .string(r"Keyboard Layout\Substitutes", &preload)?
        .unwrap_or(preload);
    Ok(keyboards::xkb(&klid))
}

pub(super) fn posix_locale(name: &str) -> Option<String> {
    let mut parts = name.split('-');
    let language = parts.next().filter(|language| {
        (2..=3).contains(&language.len()) && language.bytes().all(|b| b.is_ascii_alphabetic())
    })?;
    let mut script = None;
    let mut region = None;
    for part in parts {
        match part.len() {
            4 => script = Some(part),
            2 if part.bytes().all(|b| b.is_ascii_alphabetic()) => region = Some(part),
            _ => {}
        }
    }
    let modifier = match (language, script) {
        ("sr", Some("Latn")) => "@latin",
        _ => "",
    };
    Some(format!(
        "{}_{}{modifier}",
        language.to_ascii_lowercase(),
        region?.to_ascii_uppercase()
    ))
}
