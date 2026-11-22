use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

use toml::{Table, Value};

use crate::{Policy, check};

/// Policy baked into an image built from Luft's, signed and read-only with it.
pub const IMAGE: &str = "/usr/share/luft/policy.d";
/// Policy a local administrator adds to one computer.
pub const LOCAL: &str = "/etc/luft/policy.d";

pub(crate) const FOLDERS: [&str; 2] = [LOCAL, IMAGE];

/// A value the policy decides, and the file it was last set in.
#[derive(Clone, Debug, PartialEq)]
pub struct Decided {
    pub key: String,
    pub value: Value,
    pub file: PathBuf,
}

/// Every value the policy decides, by key, and the files left out with what is wrong in them.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct Explained {
    pub decided: Vec<Decided>,
    pub left_out: Vec<(PathBuf, Vec<String>)>,
}

impl Policy {
    /// The policy of this computer: the files in `/etc/luft/policy.d`, then those in
    /// `/usr/share/luft/policy.d`, so the image has the last word.
    pub fn load() -> Self {
        Self::from_folders(&FOLDERS.map(Path::new))
    }

    /// Merges the `.toml` files of each folder in name order, the folders in the order given,
    /// each value replacing the one an earlier file set. A file that doesn't read as policy is
    /// left out whole and named on standard error.
    pub fn from_folders(folders: &[&Path]) -> Self {
        let mut merged = Table::new();
        for (file, read) in layers(folders) {
            match read {
                Ok(table) => merge(&mut merged, table),
                Err(problems) => eprintln!(
                    "Leaving out the policy in {}: {}",
                    file.display(),
                    problems.join("; ")
                ),
            }
        }
        Value::Table(merged)
            .try_into()
            .expect("merged policy files each read as policy")
    }

    /// Which file decides each value of this computer's policy.
    pub fn explain() -> Explained {
        Self::explain_folders(&FOLDERS.map(Path::new))
    }

    pub fn explain_folders(folders: &[&Path]) -> Explained {
        let mut decided = BTreeMap::new();
        let mut left_out = Vec::new();
        for (file, read) in layers(folders) {
            match read {
                Ok(table) => flatten(&table, "", &mut |key, value| {
                    decided.insert(key, (value.clone(), file.clone()));
                }),
                Err(problems) => left_out.push((file, problems)),
            }
        }
        Explained {
            decided: decided
                .into_iter()
                .map(|(key, (value, file))| Decided { key, value, file })
                .collect(),
            left_out,
        }
    }
}

type Layer = (PathBuf, Result<Table, Vec<String>>);

fn layers(folders: &[&Path]) -> Vec<Layer> {
    folders
        .iter()
        .flat_map(|folder| files(folder))
        .map(|file| {
            let read = fs::read_to_string(&file)
                .map_err(|error| vec![error.to_string()])
                .and_then(|text| check(&text));
            (file, read)
        })
        .collect()
}

pub(crate) fn files(folder: &Path) -> Vec<PathBuf> {
    let Ok(entries) = fs::read_dir(folder) else {
        return Vec::new();
    };
    let mut files: Vec<PathBuf> = entries
        .filter_map(|entry| Some(entry.ok()?.path()))
        .filter(|path| {
            path.extension()
                .is_some_and(|extension| extension == "toml")
        })
        .collect();
    files.sort();
    files
}

fn merge(into: &mut Table, from: Table) {
    for (key, value) in from {
        match (into.get_mut(&key), value) {
            (Some(Value::Table(existing)), Value::Table(table)) => merge(existing, table),
            (_, value) => {
                into.insert(key, value);
            }
        }
    }
}

fn flatten(table: &Table, prefix: &str, found: &mut impl FnMut(String, &Value)) {
    for (key, value) in table {
        let key = if prefix.is_empty() {
            key.clone()
        } else {
            format!("{prefix}.{key}")
        };
        match value {
            Value::Table(table) => flatten(table, &key, found),
            value => found(key, value),
        }
    }
}

#[cfg(test)]
mod tests {
    use luft_variant::Channel;
    use tempfile::TempDir;

    use super::*;
    use crate::UpdateSchedule;

    fn folder(files: &[(&str, &str)]) -> TempDir {
        let folder = TempDir::new().unwrap();
        for (name, text) in files {
            fs::write(folder.path().join(name), text).unwrap();
        }
        folder
    }

    #[test]
    fn later_files_replace_single_values() {
        let local = folder(&[
            ("20-updates.toml", "[updates]\nschedule = \"never\"\n"),
            (
                "10-base.toml",
                "[updates]\nschedule = \"weekly\"\nchannel = \"nightly\"\n",
            ),
            ("notes.txt", "[updates]\nschedule = \"daily\"\n"),
        ]);
        let policy = Policy::from_folders(&[local.path()]);
        assert_eq!(policy.updates.schedule, Some(UpdateSchedule::Never));
        assert_eq!(policy.updates.channel, Some(Channel::Nightly));
    }

    #[test]
    fn image_policy_wins_over_local() {
        let local = folder(&[(
            "99-local.toml",
            "[firewall]\npublic-access = true\nopen-ports = false\n[developer]\ntools = true\n",
        )]);
        let image = folder(&[(
            "00-image.toml",
            "[firewall]\npublic-access = false\n[developer]\ntools = false\n",
        )]);
        let policy = Policy::from_folders(&[local.path(), image.path()]);
        assert!(!policy.firewall.public_access);
        assert!(!policy.firewall.open_ports);
        assert!(policy.firewall.home_networks);
        assert_eq!(policy.developer.tools, Some(false));
    }

    #[test]
    fn a_broken_file_is_left_out_whole() {
        let local = folder(&[
            (
                "10-good.toml",
                "[screen-lock]\nenabled = true\nlock-after = 0\n",
            ),
            (
                "20-typo.toml",
                "[screen-lock]\nlock-after = 600\nscreen-of = 60\n",
            ),
            ("30-bad.toml", "[software\n"),
        ]);
        let policy = Policy::from_folders(&[local.path()]);
        assert_eq!(policy.screen_lock.enabled, Some(true));
        assert_eq!(policy.screen_lock.lock_after, Some(0));
        assert_eq!(policy.screen_lock.screen_off, None);
    }

    #[test]
    fn missing_folders_leave_everything_open() {
        let policy = Policy::from_folders(&[Path::new("/nonexistent/policy.d")]);
        assert_eq!(policy, Policy::default());
    }

    #[test]
    fn explains_which_file_decides_each_value() {
        let local = folder(&[
            (
                "10-base.toml",
                "organization.name = \"Acme\"\n[software]\napp-sources = [\"flathub\"]\nsystem-packages = false\n",
            ),
            ("20-typo.toml", "[software]\nsytem-packages = false\n"),
        ]);
        let image = folder(&[(
            "00-image.toml",
            "[software]\napp-sources = [\"schelf-store\"]\n",
        )]);
        let explained = Policy::explain_folders(&[local.path(), image.path()]);
        let decided: Vec<(&str, String, PathBuf)> = explained
            .decided
            .iter()
            .map(|decided| {
                (
                    decided.key.as_str(),
                    decided.value.to_string(),
                    decided.file.clone(),
                )
            })
            .collect();
        let base = local.path().join("10-base.toml");
        assert_eq!(
            decided,
            [
                ("organization.name", "\"Acme\"".to_owned(), base.clone()),
                (
                    "software.app-sources",
                    "[\"schelf-store\"]".to_owned(),
                    image.path().join("00-image.toml")
                ),
                ("software.system-packages", "false".to_owned(), base),
            ]
        );
        assert_eq!(explained.left_out.len(), 1);
        assert_eq!(explained.left_out[0].0, local.path().join("20-typo.toml"));
    }
}
