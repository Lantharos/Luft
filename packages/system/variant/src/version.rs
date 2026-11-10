const NIGHTLY: &str = "-nightly.";

/// A version of Luft, such as 1.2 or 1.2-nightly.21, ordered the way versions are released:
/// every nightly comes before the release it leads to.
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct Version {
    major: u64,
    release: u64,
    released: bool,
    nightly: u64,
}

impl Version {
    pub fn parse(text: &str) -> Option<Self> {
        let (release, nightly) = match text.split_once(NIGHTLY) {
            Some((release, number)) => (release, Some(number.parse().ok()?)),
            None => (text, None),
        };
        let (major, release) = release.split_once('.')?;
        Some(Self {
            major: major.parse().ok()?,
            release: release.parse().ok()?,
            released: nightly.is_none(),
            nightly: nightly.unwrap_or_default(),
        })
    }

    /// Whether `version` was released after `than`, which is never true of
    /// text that isn't a version of Luft.
    pub fn newer(version: &str, than: &str) -> bool {
        matches!(
            (Self::parse(version), Self::parse(than)),
            (Some(version), Some(than)) if version > than
        )
    }
}

#[cfg(test)]
mod tests {
    use super::Version;

    #[test]
    fn nightlies_come_before_the_release_they_lead_to() {
        let ordered = [
            "1.1-nightly.21",
            "1.1",
            "1.2-nightly.3",
            "1.2-nightly.21",
            "1.2",
            "1.10-nightly.3",
            "2.0-nightly.1",
            "2.0",
        ]
        .map(|text| Version::parse(text).unwrap());
        assert!(ordered.is_sorted());
        assert!(ordered.windows(2).all(|pair| pair[0] != pair[1]));
    }

    #[test]
    fn only_known_versions_are_newer() {
        assert!(Version::newer("1.2-nightly.1", "1.1"));
        assert!(!Version::newer("1.1-nightly.21", "1.1"));
        assert!(!Version::newer("1.2", "1.2"));
        assert!(!Version::newer("1.2", "dev"));
    }

    #[test]
    fn only_luft_versions_are_read() {
        for text in ["dev", "1", "1.2-nightly.", "1.x", ""] {
            assert_eq!(Version::parse(text), None, "{text}");
        }
    }
}
