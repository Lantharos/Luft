use std::collections::BTreeMap;
use std::sync::LazyLock;

use regex::Regex;

use super::platforms::PLATFORMS;

pub static PART_NAME: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[a-z][a-z0-9-]{0,19}$").unwrap());
const SYSTEM_WORDS: [&str; 7] = [
    "windows", "macos", "linux", "android", "luft", "phone", "other",
];

pub static FILE_NAME: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[A-Za-z0-9*?][A-Za-z0-9._+*?-]*$").unwrap());
pub const FILE_NAME_MESSAGE: &str = "A file name, with * for any run of characters";

pub fn free_name(name: &str) -> bool {
    !PLATFORMS.contains(&name) && !SYSTEM_WORDS.contains(&name)
}

/// A named group of files inside each release, like a cli beside the app.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct PartSettings {
    pub files: Vec<String>,
    pub platforms: Vec<String>,
    pub id: Option<String>,
    pub format: Option<String>,
    pub updater: Option<String>,
    pub tool: Option<String>,
}

impl PartSettings {
    pub fn format(&self) -> &str {
        self.format.as_deref().unwrap_or("files")
    }
}

fn matches(glob: &str, name: &str) -> bool {
    let mut pattern = String::from("^");
    for character in glob.chars() {
        match character {
            '*' => pattern.push_str(".*"),
            '?' => pattern.push('.'),
            other => pattern.push_str(&regex::escape(&other.to_string())),
        }
    }
    pattern.push('$');
    Regex::new(&pattern).is_ok_and(|pattern| pattern.is_match(name))
}

/// The part whose files `name` is one of, or none for the app's own files.
pub fn part_of(
    name: &str,
    parts: &BTreeMap<String, PartSettings>,
) -> Result<Option<String>, String> {
    let found: Vec<&String> = parts
        .iter()
        .filter(|(_, settings)| settings.files.iter().any(|glob| matches(glob, name)))
        .map(|(part, _)| part)
        .collect();
    match found.as_slice() {
        [] => Ok(None),
        [only] => Ok(Some((*only).clone())),
        many => Err(format!(
            "{name} matches the files of {}",
            many.iter()
                .map(|part| part.as_str())
                .collect::<Vec<_>>()
                .join(" and ")
        )),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn parts(entries: &[(&str, &[&str])]) -> BTreeMap<String, PartSettings> {
        entries
            .iter()
            .map(|(name, files)| {
                (
                    (*name).to_owned(),
                    PartSettings {
                        files: files.iter().map(|file| (*file).to_owned()).collect(),
                        ..PartSettings::default()
                    },
                )
            })
            .collect()
    }

    #[test]
    fn a_file_joins_the_part_whose_names_it_matches_and_the_app_otherwise() {
        let plan = parts(&[("cli", &["notes-cli-*"])]);
        assert_eq!(
            part_of("notes-cli-linux-x86_64.tar.gz", &plan)
                .unwrap()
                .as_deref(),
            Some("cli")
        );
        assert_eq!(part_of("Notes-1.0.0-setup.exe", &plan).unwrap(), None);
    }

    #[test]
    fn a_file_that_matches_two_parts_is_refused() {
        let plan = parts(&[("a", &["notes-*"]), ("b", &["*.zip"])]);
        assert!(
            part_of("notes-cli.zip", &plan)
                .unwrap_err()
                .contains("matches the files of a and b")
        );
    }
}
