use std::fs;
use std::path::{Path, PathBuf};

use toml::{Table, Value};

use crate::Policy;

/// Policy baked into an image built from Luft's, signed and read-only with it.
pub const IMAGE: &str = "/usr/share/luft/policy.d";
/// Policy a local administrator adds to one computer.
pub const LOCAL: &str = "/etc/luft/policy.d";

impl Policy {
    /// The policy of this computer: the files in `/etc/luft/policy.d`, then those in
    /// `/usr/share/luft/policy.d`, so the image has the last word.
    pub fn load() -> Self {
        Self::from_folders(&[Path::new(LOCAL), Path::new(IMAGE)])
    }

    /// Merges the `.toml` files of each folder in name order, the folders in the order given,
    /// each value replacing the one an earlier file set. A file that doesn't read as policy is
    /// left out whole and named on standard error.
    pub fn from_folders(folders: &[&Path]) -> Self {
        let mut merged = Table::new();
        for file in folders.iter().flat_map(|folder| files(folder)) {
            match read(&file) {
                Ok(table) => merge(&mut merged, table),
                Err(error) => eprintln!("Leaving out the policy in {}: {error}", file.display()),
            }
        }
        Value::Table(merged)
            .try_into()
            .expect("merged policy files each read as policy")
    }
}

fn files(folder: &Path) -> Vec<PathBuf> {
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

fn read(file: &Path) -> Result<Table, String> {
    let text = fs::read_to_string(file).map_err(|error| error.to_string())?;
    let table: Table = text
        .parse()
        .map_err(|error: toml::de::Error| error.to_string())?;
    Value::Table(table.clone())
        .try_into::<Policy>()
        .map_err(|error| error.to_string())?;
    Ok(table)
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
}
