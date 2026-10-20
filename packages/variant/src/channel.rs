const REPOSITORY: &str = "lantharos/luft";
const RETIRED_MAJOR: &str = "45";
const MAJOR: &str = "1";

/// The reference an install that follows one of the tags named after Fedora's release, such as
/// `:45-nightly`, follows now that Luft's versions start at 1, such as `:1-nightly`.
pub fn renamed(reference: &str) -> Option<String> {
    let (repository, tag) = reference.rsplit_once(':')?;
    let rest = tag.strip_prefix(RETIRED_MAJOR)?;
    (repository.ends_with(REPOSITORY) && (rest.is_empty() || rest.starts_with('-')))
        .then(|| format!("{repository}:{MAJOR}{rest}"))
}

#[cfg(test)]
mod tests {
    use super::renamed;

    #[test]
    fn tags_named_after_fedora_move_to_luft_one() {
        for (old, new) in [
            (
                "ghcr.io/lantharos/luft:45-nightly",
                "ghcr.io/lantharos/luft:1-nightly",
            ),
            (
                "ghcr.io/lantharos/luft:45-nightly-nvidia",
                "ghcr.io/lantharos/luft:1-nightly-nvidia",
            ),
            ("ghcr.io/lantharos/luft:45", "ghcr.io/lantharos/luft:1"),
            (
                "10.0.2.2:5000/lantharos/luft:45-nvidia",
                "10.0.2.2:5000/lantharos/luft:1-nvidia",
            ),
        ] {
            assert_eq!(renamed(old).as_deref(), Some(new));
        }
        for kept in [
            "ghcr.io/lantharos/luft:1-nightly",
            "ghcr.io/lantharos/luft:45.20261019.53-nightly",
            "quay.io/fedora/fedora-bootc:45",
        ] {
            assert_eq!(renamed(kept), None);
        }
    }
}
