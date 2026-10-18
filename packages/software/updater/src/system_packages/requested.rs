use std::collections::BTreeSet;
use std::fs;
use std::io::ErrorKind;
use std::path::Path;

use anyhow::{Context, Result, bail};

pub type Requested = BTreeSet<String>;

pub fn valid(name: &str) -> bool {
    let mut characters = name.chars();
    characters
        .next()
        .is_some_and(|first| first.is_ascii_alphanumeric())
        && characters
            .all(|character| character.is_ascii_alphanumeric() || "._+-".contains(character))
}

pub fn load(path: &Path) -> Result<Requested> {
    let text = match fs::read_to_string(path) {
        Ok(text) => text,
        Err(error) if error.kind() == ErrorKind::NotFound => return Ok(Requested::new()),
        Err(error) => return Err(error).with_context(|| format!("Reading {}", path.display())),
    };
    Ok(text
        .lines()
        .map(str::trim)
        .filter(|line| valid(line))
        .map(str::to_owned)
        .collect())
}

pub fn save(path: &Path, requested: &Requested) -> Result<()> {
    if requested.is_empty() {
        return match fs::remove_file(path) {
            Err(error) if error.kind() != ErrorKind::NotFound => Err(error.into()),
            _ => Ok(()),
        };
    }
    let mut text = String::new();
    for name in requested {
        text.push_str(name);
        text.push('\n');
    }
    super::replace(path, text.as_bytes())
}

pub fn changed(current: &Requested, add: &[String], remove: &[String]) -> Result<Requested> {
    let mut next = current.clone();
    for name in add {
        if !valid(name) {
            bail!("“{name}” isn't a package name.");
        }
        if !next.insert(name.clone()) {
            bail!("{name} is already a system package.");
        }
    }
    for name in remove {
        if !next.remove(name) {
            bail!("{name} isn't a system package.");
        }
    }
    Ok(next)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn refuses_names_dnf_would_read_as_options_or_patterns() {
        for name in [
            "-y",
            "--repo=evil",
            "tail*",
            "a b",
            "../x",
            "",
            "https://x/y.rpm",
        ] {
            assert!(!valid(name), "{name}");
        }
        for name in [
            "tailscale",
            "libvirt-daemon-kvm",
            "gtk+",
            "python3.13",
            "NetworkManager-l2tp",
        ] {
            assert!(valid(name), "{name}");
        }
    }

    #[test]
    fn changes_the_set_only_with_new_names_or_ones_in_it() {
        let current = Requested::from(["tailscale".to_owned()]);
        let next = changed(&current, &["cups".to_owned()], &["tailscale".to_owned()]).unwrap();
        assert_eq!(next, Requested::from(["cups".to_owned()]));
        assert!(changed(&current, &["tailscale".to_owned()], &[]).is_err());
        assert!(changed(&current, &[], &["cups".to_owned()]).is_err());
    }
}
