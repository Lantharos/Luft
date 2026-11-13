mod extension;
mod stamp;
mod trust;

pub use extension::{Listed, listed};
pub use stamp::{Expiry, Stamp};
pub use trust::{Keys, Seal};

pub const STORE_KEYS: &str = "trust/v1/store-keys.json";
const INVITED_LISTINGS: &str = "invited/index/v1/apps";

/// Where schelf.store keeps an app's or extension's own listing.
pub fn listing_document(id: &str) -> String {
    format!("index/v1/apps/{id}.json")
}

/// Whether `channel` is a name schelf.store gives channels.
fn channel_name(channel: &str) -> bool {
    let mut characters = channel.chars();
    characters
        .next()
        .is_some_and(|first| first.is_ascii_lowercase())
        && channel.len() <= 20
        && characters.all(|character| {
            character.is_ascii_lowercase() || character.is_ascii_digit() || character == '-'
        })
}

/// Where schelf.store keeps the listing of `id` for the people invited to
/// its `channel`: the public releases and that channel's.
pub fn invited_document(id: &str, channel: &str) -> Option<String> {
    channel_name(channel).then(|| format!("{INVITED_LISTINGS}/{id}/{channel}.json"))
}

/// Whether `document` is one of the listings of `id`: its own, or the one
/// for people invited to one of its channels.
fn lists(document: &str, id: &str) -> bool {
    document == listing_document(id)
        || document
            .strip_prefix(INVITED_LISTINGS)
            .and_then(|rest| rest.strip_prefix('/'))
            .and_then(|rest| rest.strip_prefix(id))
            .and_then(|rest| rest.strip_prefix('/'))
            .and_then(|rest| rest.strip_suffix(".json"))
            .is_some_and(channel_name)
}

#[cfg(test)]
mod tests {
    use super::{invited_document, lists};

    const CLOCK: &str = "com.example.Clock";

    #[test]
    fn a_listing_is_the_public_one_or_one_for_an_invited_channel_of_the_same_item() {
        assert!(lists("index/v1/apps/com.example.Clock.json", CLOCK));
        assert!(lists(
            "invited/index/v1/apps/com.example.Clock/testers.json",
            CLOCK
        ));
        assert!(!lists(
            "invited/index/v1/apps/com.example.Other/testers.json",
            CLOCK
        ));
        assert!(!lists(
            "invited/index/v1/apps/com.example.Clock/../x.json",
            CLOCK
        ));
        assert!(!lists(
            "invited/index/v1/apps/com.example.Clock/a/b.json",
            CLOCK
        ));
        assert!(!lists("index/v1/catalog.json", CLOCK));
    }

    #[test]
    fn only_channel_names_make_an_invited_listing() {
        assert_eq!(
            invited_document(CLOCK, "early-2").as_deref(),
            Some("invited/index/v1/apps/com.example.Clock/early-2.json")
        );
        for name in ["", "Beta", "2nd", "../stable", "a/b", &"a".repeat(21)] {
            assert!(invited_document(CLOCK, name).is_none());
        }
    }
}
