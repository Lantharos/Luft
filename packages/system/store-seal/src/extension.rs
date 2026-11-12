use serde::Deserialize;

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

/// An extension release schelf.store lists, and whether it approved that
/// release to run inside the shell.
#[derive(Debug, PartialEq, Eq)]
pub struct Listed {
    pub version: String,
    pub luft: Option<String>,
    pub in_shell: bool,
}

/// The release of extension `id` whose file is `size` bytes with `sha256`,
/// as `listing`, schelf.store's signed listing of it, lists it. It runs
/// inside the shell only when the listing says its publisher is verified and
/// that release may; a listing without those fields says it may not.
pub fn listed(listing: &[u8], id: &str, size: u64, sha256: &str) -> Result<Listed, String> {
    let listing: Listing = serde_json::from_slice(listing).map_err(|error| error.to_string())?;
    if listing.id != id || listing.kind != "extension" {
        return Err(format!("schelf.store doesn't list {id} as an extension."));
    }
    let verified = listing.publisher.verified;
    listing
        .releases
        .into_iter()
        .find(|release| {
            release
                .artifacts
                .iter()
                .any(|artifact| artifact.is(size, sha256))
        })
        .map(|release| Listed {
            in_shell: verified && release.runs_in_shell,
            version: release.version,
            luft: release.requires.luft,
        })
        .ok_or_else(|| format!("schelf.store doesn't list this file as a release of {id}."))
}

#[cfg(test)]
mod tests {
    use super::{Listed, listed};

    const SHA: &str = "ab12";
    const CLOCK: &str = "com.example.Clock";

    fn listing(verified: bool, flag: &str) -> Vec<u8> {
        format!(
            r#"{{"id":"com.example.Clock","kind":"extension","publisher":{{"name":"Example","verified":{verified}}},
            "releases":[{{"version":"1.2.0",{flag}"requires":{{"extension_api":1,"luft":"1.2"}},
            "artifacts":[{{"platform":"luft","format":"luft-extension","kind":"extension","size":10,"sha256":"{SHA}"}}]}}]}}"#
        )
        .into_bytes()
    }

    fn in_shell(verified: bool, flag: &str) -> bool {
        listed(&listing(verified, flag), CLOCK, 10, SHA)
            .unwrap()
            .in_shell
    }

    #[test]
    fn only_an_approved_release_of_a_verified_publisher_runs_inside_the_shell() {
        assert_eq!(
            listed(&listing(true, r#""runs_in_shell":true,"#), CLOCK, 10, SHA),
            Ok(Listed {
                version: "1.2.0".into(),
                luft: Some("1.2".into()),
                in_shell: true,
            })
        );
        assert!(!in_shell(false, r#""runs_in_shell":true,"#));
        assert!(!in_shell(true, ""));
        assert!(!in_shell(true, r#""runs_in_shell":false,"#));
    }

    #[test]
    fn the_file_and_the_listing_have_to_be_the_ones_listed() {
        let approved = listing(true, r#""runs_in_shell":true,"#);
        assert!(listed(&approved, CLOCK, 11, SHA).is_err());
        assert!(listed(&approved, CLOCK, 10, "cd34").is_err());
        assert!(listed(&approved, "com.example.Other", 10, SHA).is_err());
    }
}
