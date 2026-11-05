use std::io::{Read, Seek};

use anyhow::Result;
use luft_meet::regional::Hints;
use luft_meet::regional::windows::Settings;
use luft_windows::{Registry, System, Volume};

const SHARED_PROFILES: &[&str] = &["Default", "Default User", "Public", "All Users"];
const DEFAULT_USER_HIVE: &str = r"Windows\System32\config\DEFAULT";
const PRELOAD: &str = r"Keyboard Layout\Preload";
const SUBSTITUTES: &str = r"Keyboard Layout\Substitutes";
const LANGUAGES: [(&str, &str); 2] = [
    (r"Control Panel\Desktop", "PreferredUILanguages"),
    (
        r"Control Panel\Desktop\MuiCached",
        "MachinePreferredUILanguages",
    ),
];

pub(super) fn gather<R: Read + Seek>(volume: &mut Volume<R>, system: &System) -> Result<Hints> {
    let time_zone = match system.control_set() {
        Some(control_set) => system.registry().string(
            &format!(r"{control_set}\Control\TimeZoneInformation"),
            "TimeZoneKeyName",
        )?,
        None => None,
    };
    let Some(user) = user_hive(volume)? else {
        return Ok(Settings {
            time_zone: time_zone.as_deref(),
            ..Settings::default()
        }
        .hints());
    };
    let user = Registry::new(&user)?;
    let locale = user.string(r"Control Panel\International", "LocaleName")?;
    let language = language(&user)?;
    Ok(Settings {
        time_zone: time_zone.as_deref(),
        locale: locale.as_deref(),
        language: language.as_deref(),
        keyboards: keyboards(&user)?,
    }
    .hints())
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

fn language(user: &Registry) -> Result<Option<String>> {
    for (path, name) in LANGUAGES {
        if let Some(language) = user
            .string(path, name)?
            .filter(|language| !language.is_empty())
        {
            return Ok(Some(language));
        }
    }
    Ok(None)
}

fn keyboards(user: &Registry) -> Result<Vec<String>> {
    let mut klids = Vec::new();
    for order in 1.. {
        let Some(preload) = user.string(PRELOAD, &order.to_string())? else {
            break;
        };
        klids.push(user.string(SUBSTITUTES, &preload)?.unwrap_or(preload));
    }
    Ok(klids)
}
