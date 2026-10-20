//! Flatpak apps given full access, listed one app ID per line in a file only
//! root can change. Kestrel, Schelf and Luft's services treat them like apps
//! installed on the system.

use std::collections::BTreeSet;
use std::fs::Metadata;
use std::os::unix::fs::MetadataExt;
use std::sync::{Arc, Mutex};

pub const PATH: &str = "/etc/kestrel/trusted-apps";
const LONGEST_ID: usize = 255;

/// Whether `id` is a Flatpak app ID: three or more dot-separated parts of
/// letters, digits and underscores, none starting with a digit, with dashes
/// allowed in the last part only.
pub fn is_app_id(id: &str) -> bool {
    let parts: Vec<&str> = id.split('.').collect();
    id.len() <= LONGEST_ID
        && parts.len() >= 3
        && parts.iter().enumerate().all(|(index, part)| {
            let last = index == parts.len() - 1;
            part.chars()
                .next()
                .is_some_and(|first| !first.is_ascii_digit())
                && part.chars().all(|character| {
                    character.is_ascii_alphanumeric()
                        || character == '_'
                        || last && character == '-'
                })
        })
}

pub fn parse(text: &str) -> BTreeSet<String> {
    text.lines()
        .map(str::trim)
        .filter(|line| is_app_id(line))
        .map(str::to_owned)
        .collect()
}

pub fn read() -> BTreeSet<String> {
    std::fs::read_to_string(PATH)
        .map(|text| parse(&text))
        .unwrap_or_default()
}

#[derive(PartialEq, Eq, Clone, Copy)]
struct Stamp {
    device: u64,
    inode: u64,
    modified: i64,
    modified_nanoseconds: i64,
    size: u64,
}

impl Stamp {
    fn of(metadata: &Metadata) -> Self {
        Self {
            device: metadata.dev(),
            inode: metadata.ino(),
            modified: metadata.mtime(),
            modified_nanoseconds: metadata.mtime_nsec(),
            size: metadata.size(),
        }
    }
}

type Cached = (Option<Stamp>, Arc<BTreeSet<String>>);

static CACHE: Mutex<Option<Cached>> = Mutex::new(None);

/// The list as it is on disk now, read again only when the file changed.
pub fn current() -> Arc<BTreeSet<String>> {
    let stamp = std::fs::metadata(PATH)
        .ok()
        .map(|metadata| Stamp::of(&metadata));
    let mut cache = CACHE.lock().expect("trusted apps cache");
    if let Some((cached, apps)) = cache.as_ref()
        && *cached == stamp
    {
        return apps.clone();
    }
    let apps = Arc::new(if stamp.is_some() {
        read()
    } else {
        BTreeSet::new()
    });
    *cache = Some((stamp, apps.clone()));
    apps
}

pub fn is_trusted(id: &str) -> bool {
    current().contains(id)
}

/// The app ID in a Flatpak sandbox's `.flatpak-info`.
pub fn flatpak_app_id(info: &str) -> Option<&str> {
    let mut in_application = false;
    for line in info.lines().map(str::trim) {
        if line.starts_with('[') {
            in_application = line == "[Application]";
        } else if in_application && let Some(name) = line.strip_prefix("name=") {
            return Some(name.trim());
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn app_ids_follow_flatpak_rules() {
        assert!(is_app_id("com.onepassword.OnePassword"));
        assert!(is_app_id("com.anthropic.claude-desktop"));
        assert!(is_app_id("org.example.App_2"));
        assert!(!is_app_id("org.example"));
        assert!(!is_app_id("org.2example.App"));
        assert!(!is_app_id("org.my-example.App"));
        assert!(!is_app_id("org..App"));
        assert!(!is_app_id("org.example.App/../../etc"));
        assert!(!is_app_id("org.example.App\nnet.evil.App"));
        assert!(!is_app_id(&format!(
            "org.example.{}",
            "a".repeat(LONGEST_ID)
        )));
    }

    #[test]
    fn the_list_skips_blank_and_malformed_lines() {
        let apps =
            parse("com.onepassword.OnePassword\n\n  org.example.Notes  \n# comment\nnot an id\n");
        assert_eq!(
            apps.into_iter().collect::<Vec<_>>(),
            ["com.onepassword.OnePassword", "org.example.Notes"]
        );
    }

    #[test]
    fn the_app_id_comes_from_the_application_group() {
        let info = "[Instance]\nname=org.example.Fake\n\n[Application]\nname=org.example.Notes\nruntime=runtime/org.gnome.Platform\n";
        assert_eq!(flatpak_app_id(info), Some("org.example.Notes"));
        assert_eq!(flatpak_app_id("[Runtime]\nname=org.gnome.Platform\n"), None);
    }
}
