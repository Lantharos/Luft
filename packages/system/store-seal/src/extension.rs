use serde::Deserialize;

const NOT_APPROVED: &str = "schelf.store hasn't approved this release to run inside Luft.";

#[derive(Deserialize)]
struct Listing {
    id: String,
    kind: String,
    publisher: Publisher,
    releases: Vec<Release>,
}

#[derive(Deserialize)]
struct Publisher {
    verified: bool,
}

#[derive(Deserialize)]
struct Release {
    version: String,
    #[serde(default)]
    runs_in_shell: bool,
    #[serde(default)]
    requires: Requires,
    artifacts: Vec<Artifact>,
}

#[derive(Deserialize, Default)]
struct Requires {
    luft: Option<String>,
}

#[derive(Deserialize)]
struct Artifact {
    format: String,
    kind: String,
    size: u64,
    sha256: String,
}

impl Artifact {
    fn is(&self, size: u64, sha256: &str) -> bool {
        self.format == "luft-extension"
            && self.kind == "extension"
            && self.size == size
            && self.sha256.eq_ignore_ascii_case(sha256)
    }
}

/// An extension release schelf.store approved to run inside the shell.
#[derive(Debug, PartialEq, Eq)]
pub struct InShell {
    pub version: String,
    pub luft: Option<String>,
}

/// The release of extension `id` whose file is `size` bytes with `sha256`,
/// when `listing`, schelf.store's signed listing of it, says its publisher is
/// verified and that release may run inside the shell. Anything else, a
/// listing without those fields included, isn't.
pub fn in_shell(listing: &[u8], id: &str, size: u64, sha256: &str) -> Result<InShell, String> {
    let listing: Listing = serde_json::from_slice(listing).map_err(|error| error.to_string())?;
    if listing.id != id || listing.kind != "extension" || !listing.publisher.verified {
        return Err(NOT_APPROVED.to_owned());
    }
    listing
        .releases
        .into_iter()
        .filter(|release| release.runs_in_shell)
        .find(|release| {
            release
                .artifacts
                .iter()
                .any(|artifact| artifact.is(size, sha256))
        })
        .map(|release| InShell {
            version: release.version,
            luft: release.requires.luft,
        })
        .ok_or_else(|| NOT_APPROVED.to_owned())
}

#[cfg(test)]
mod tests {
    use super::{InShell, in_shell};

    const SHA: &str = "ab12";

    fn listing(verified: bool, flag: &str) -> Vec<u8> {
        format!(
            r#"{{"id":"com.example.Clock","kind":"extension","publisher":{{"name":"Example","verified":{verified}}},
            "releases":[{{"version":"1.2.0",{flag}"requires":{{"extension_api":1,"luft":"1.2"}},
            "artifacts":[{{"platform":"luft","format":"luft-extension","kind":"extension","size":10,"sha256":"{SHA}"}}]}}]}}"#
        )
        .into_bytes()
    }

    #[test]
    fn only_an_approved_release_of_a_verified_publisher_runs_inside_the_shell() {
        let approved = listing(true, r#""runs_in_shell":true,"#);
        assert_eq!(
            in_shell(&approved, "com.example.Clock", 10, SHA),
            Ok(InShell {
                version: "1.2.0".into(),
                luft: Some("1.2".into())
            })
        );
        assert!(
            in_shell(
                &listing(false, r#""runs_in_shell":true,"#),
                "com.example.Clock",
                10,
                SHA
            )
            .is_err()
        );
        assert!(in_shell(&listing(true, ""), "com.example.Clock", 10, SHA).is_err());
        assert!(
            in_shell(
                &listing(true, r#""runs_in_shell":false,"#),
                "com.example.Clock",
                10,
                SHA
            )
            .is_err()
        );
    }

    #[test]
    fn the_file_and_the_listing_have_to_be_the_ones_approved() {
        let approved = listing(true, r#""runs_in_shell":true,"#);
        assert!(in_shell(&approved, "com.example.Clock", 11, SHA).is_err());
        assert!(in_shell(&approved, "com.example.Clock", 10, "cd34").is_err());
        assert!(in_shell(&approved, "com.example.Other", 10, SHA).is_err());
    }
}
