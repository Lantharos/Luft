use std::cmp::Ordering;

const NIGHTLY: &str = "-nightly.";

#[derive(Debug, PartialEq, Eq)]
pub struct Version {
    major: u64,
    release: u64,
    nightly: Option<u64>,
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
            nightly,
        })
    }

    fn key(&self) -> (u64, u64, bool, Option<u64>) {
        (
            self.major,
            self.release,
            self.nightly.is_none(),
            self.nightly,
        )
    }
}

impl Ord for Version {
    fn cmp(&self, other: &Self) -> Ordering {
        self.key().cmp(&other.key())
    }
}

impl PartialOrd for Version {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

pub fn newer(version: &str, than: &str) -> bool {
    matches!(
        (Version::parse(version), Version::parse(than)),
        (Some(version), Some(than)) if version > than
    )
}

#[cfg(test)]
mod tests {
    use super::{Version, newer};

    #[test]
    fn reads_releases_and_nightlies() {
        assert_eq!(
            Version::parse("1.2"),
            Some(Version {
                major: 1,
                release: 2,
                nightly: None
            })
        );
        assert_eq!(
            Version::parse("1.2-nightly.21"),
            Some(Version {
                major: 1,
                release: 2,
                nightly: Some(21)
            })
        );
        assert_eq!(Version::parse("1"), None);
        assert_eq!(Version::parse("dev"), None);
        assert_eq!(Version::parse("1.2-nightly."), None);
    }

    #[test]
    fn nightlies_come_before_the_release_they_lead_to() {
        let mut versions = [
            "2.1-nightly.1",
            "1.2",
            "1.10-nightly.3",
            "1.1",
            "1.2-nightly.21",
            "1.2-nightly.3",
            "1.1-nightly.21",
            "2.1",
        ]
        .map(|text| Version::parse(text).unwrap());
        versions.sort();
        assert_eq!(
            versions,
            [
                "1.1-nightly.21",
                "1.1",
                "1.2-nightly.3",
                "1.2-nightly.21",
                "1.2",
                "1.10-nightly.3",
                "2.1-nightly.1",
                "2.1",
            ]
            .map(|text| Version::parse(text).unwrap())
        );
    }

    #[test]
    fn only_known_versions_are_newer() {
        assert!(newer("1.2-nightly.1", "1.1"));
        assert!(!newer("1.1-nightly.21", "1.1"));
        assert!(!newer("1.2", "1.2"));
        assert!(!newer("1.2", "dev"));
    }
}
