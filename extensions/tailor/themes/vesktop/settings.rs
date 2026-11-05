use std::collections::HashMap;
use std::fs;
use std::io;
use std::ops::Range;
use std::path::Path;

use serde_json::value::RawValue;

use crate::files::replace;

const KEY: &str = "enabledThemes";
const INDENT: &str = "        ";

type Top<'a> = HashMap<&'a str, &'a RawValue>;

fn invalid(error: serde_json::Error) -> io::Error {
    io::Error::new(io::ErrorKind::InvalidData, error)
}

/// Where the list of enabled themes sits in the file, and what it holds.
fn list(settings: &str) -> io::Result<Option<(Range<usize>, Vec<String>)>> {
    let top: Top = serde_json::from_str(settings).map_err(invalid)?;
    let Some(value) = top.get(KEY) else {
        return Ok(None);
    };
    let start = value.get().as_ptr() as usize - settings.as_ptr() as usize;
    let themes = serde_json::from_str(value.get()).map_err(invalid)?;
    Ok(Some((start..start + value.get().len(), themes)))
}

/// Writes a list the way Vencord does, so taking our entry out again gives back the bytes it had.
fn written(themes: &[String]) -> io::Result<String> {
    if themes.is_empty() {
        return Ok("[]".to_owned());
    }
    let items = themes
        .iter()
        .map(|theme| serde_json::to_string(theme).map(|text| format!("{INDENT}{text}")))
        .collect::<Result<Vec<_>, _>>()
        .map_err(invalid)?;
    Ok(format!("[\n{}\n    ]", items.join(",\n")))
}

fn rewrite(path: &Path, change: impl Fn(&mut Vec<String>)) -> io::Result<bool> {
    let settings = fs::read_to_string(path)?;
    let Some((span, mut themes)) = list(&settings)? else {
        return Ok(false);
    };
    let before = themes.clone();
    change(&mut themes);
    if themes == before {
        return Ok(true);
    }
    let mut changed = settings;
    changed.replace_range(span, &written(&themes)?);
    replace(path, changed.as_bytes())?;
    Ok(true)
}

/// Says whether the list has this theme. A file without the list is one Vencord hasn't written yet.
pub fn lists(path: &Path, theme: &str) -> io::Result<Option<bool>> {
    let Ok(settings) = fs::read_to_string(path) else {
        return Ok(None);
    };
    Ok(list(&settings)?.map(|(_, themes)| themes.iter().any(|listed| listed == theme)))
}

/// Adds the theme, touching only the list. Says whether there was a list to add to.
pub fn enable(path: &Path, theme: &str) -> io::Result<bool> {
    rewrite(path, |themes| {
        if !themes.iter().any(|listed| listed == theme) {
            themes.push(theme.to_owned());
        }
    })
}

pub fn disable(path: &Path, theme: &str) -> io::Result<()> {
    rewrite(path, |themes| themes.retain(|listed| listed != theme)).map(|_| ())
}

#[cfg(test)]
mod tests {
    use super::{disable, enable, lists};

    const THEME: &str = "luft.theme.css";
    const SETTINGS: &str = "{\n    \"autoUpdate\": true,\n    \"themeLinks\": [],\n    \"enabledThemes\": [],\n    \"plugins\": {\n        \"BadgeAPI\": {\n            \"enabled\": true\n        }\n    },\n    \"ratio\": 1.50,\n    \"name\": \"caf\\u00e9\"\n}";

    fn fixture(settings: &str) -> (tempfile::TempDir, std::path::PathBuf) {
        let folder = tempfile::tempdir().unwrap();
        let path = folder.path().join("settings.json");
        std::fs::write(&path, settings).unwrap();
        (folder, path)
    }

    #[test]
    fn taking_the_theme_out_gives_back_the_same_bytes() {
        let (_folder, path) = fixture(SETTINGS);
        assert!(enable(&path, THEME).unwrap());
        assert_eq!(lists(&path, THEME).unwrap(), Some(true));
        disable(&path, THEME).unwrap();
        assert_eq!(std::fs::read_to_string(&path).unwrap(), SETTINGS);
    }

    #[test]
    fn only_the_list_changes() {
        let (_folder, path) = fixture(SETTINGS);
        enable(&path, THEME).unwrap();
        let enabled = std::fs::read_to_string(&path).unwrap();
        assert_eq!(
            enabled,
            SETTINGS.replace(
                "\"enabledThemes\": []",
                "\"enabledThemes\": [\n        \"luft.theme.css\"\n    ]"
            )
        );
    }

    #[test]
    fn the_person_s_own_themes_stay() {
        let mine = SETTINGS.replace(
            "\"enabledThemes\": []",
            "\"enabledThemes\": [\n        \"mine.theme.css\"\n    ]",
        );
        let (_folder, path) = fixture(&mine);
        enable(&path, THEME).unwrap();
        disable(&path, THEME).unwrap();
        assert_eq!(std::fs::read_to_string(&path).unwrap(), mine);
    }

    #[test]
    fn a_file_without_the_list_is_left_alone() {
        let (_folder, path) = fixture("{}");
        assert!(!enable(&path, THEME).unwrap());
        assert_eq!(lists(&path, THEME).unwrap(), None);
        assert_eq!(std::fs::read_to_string(&path).unwrap(), "{}");
    }
}
