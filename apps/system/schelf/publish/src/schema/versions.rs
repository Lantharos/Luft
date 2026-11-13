use std::cmp::Ordering;
use std::sync::LazyLock;

use chrono::{DateTime, Utc};
use regex::{Captures, Regex};

pub const STABLE: &str = "stable";
pub const NIGHTLY: &str = "nightly";

pub static CHANNEL: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[a-z][a-z0-9-]{0,19}$").unwrap());
pub const CHANNEL_MESSAGE: &str = "A channel is a short lowercase name, like beta or nightly";

static VERSION: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$")
        .unwrap()
});

fn prerelease_channel(word: &str) -> Option<&'static str> {
    match word {
        "alpha" => Some("alpha"),
        "beta" | "rc" => Some("beta"),
        "nightly" | "canary" => Some(NIGHTLY),
        _ => None,
    }
}

pub fn channel_from_version(version: &str) -> &'static str {
    VERSION
        .captures(version)
        .and_then(|found| found.get(4))
        .and_then(|pre| pre.as_str().split(['.', '-']).next().map(str::to_lowercase))
        .and_then(|word| prerelease_channel(&word))
        .unwrap_or(STABLE)
}

pub fn version_from_tag(tag: &str) -> Option<String> {
    let name = &tag[tag.rfind('/').map_or(0, |slash| slash + 1)..];
    VERSION
        .captures(name)
        .map(|found| found[0].strip_prefix('v').unwrap_or(&found[0]).to_owned())
}

pub fn nightly_version(version: &str, commit: &str, at: DateTime<Utc>) -> Result<String, String> {
    let found = VERSION
        .captures(version)
        .ok_or_else(|| format!("{version} isn't a version"))?;
    let minor: u64 = found
        .get(2)
        .map_or(0, |minor| minor.as_str().parse().unwrap_or(0));
    Ok(format!(
        "{}.{}.0-nightly.{}.g{}",
        &found[1],
        minor + 1,
        at.format("%Y%m%d%H%M"),
        &commit[..commit.len().min(7)]
    ))
}

fn number(found: &Captures, index: usize) -> u64 {
    found
        .get(index)
        .map_or(0, |part| part.as_str().parse().unwrap_or(0))
}

/// Compares two pieces of text the way `localeCompare` with numbers on does:
/// runs of digits by their value.
pub fn natural(left: &str, right: &str) -> Ordering {
    let mut left = left.chars().peekable();
    let mut right = right.chars().peekable();
    loop {
        match (left.peek().copied(), right.peek().copied()) {
            (None, None) => return Ordering::Equal,
            (None, Some(_)) => return Ordering::Less,
            (Some(_), None) => return Ordering::Greater,
            (Some(a), Some(b)) if a.is_ascii_digit() && b.is_ascii_digit() => {
                let take = |chars: &mut std::iter::Peekable<std::str::Chars>| {
                    let mut digits = String::new();
                    while let Some(digit) = chars.next_if(char::is_ascii_digit) {
                        digits.push(digit);
                    }
                    digits.trim_start_matches('0').to_owned()
                };
                let (a, b) = (take(&mut left), take(&mut right));
                let order = a.len().cmp(&b.len()).then_with(|| a.cmp(&b));
                if order != Ordering::Equal {
                    return order;
                }
            }
            (Some(a), Some(b)) => {
                let order = char_order(a, b);
                if order != Ordering::Equal {
                    return order;
                }
                left.next();
                right.next();
            }
        }
    }
}

fn char_order(left: char, right: char) -> Ordering {
    left.to_lowercase()
        .cmp(right.to_lowercase())
        .then_with(|| left.is_uppercase().cmp(&right.is_uppercase()))
}

/// Orders paths the way JavaScript's `localeCompare` does closely enough for
/// file names: letters regardless of case, then lowercase first.
pub fn locale_compare(left: &str, right: &str) -> Ordering {
    let mut left_chars = left.chars();
    let mut right_chars = right.chars();
    loop {
        match (left_chars.next(), right_chars.next()) {
            (None, None) => return Ordering::Equal,
            (None, Some(_)) => return Ordering::Less,
            (Some(_), None) => return Ordering::Greater,
            (Some(a), Some(b)) => {
                let order = char_order(a, b);
                if order != Ordering::Equal {
                    return order;
                }
            }
        }
    }
}

pub fn compare_versions(left: &str, right: &str) -> Ordering {
    let (Some(a), Some(b)) = (VERSION.captures(left), VERSION.captures(right)) else {
        return locale_compare(left, right);
    };
    for index in [1, 2, 3] {
        let order = number(&a, index).cmp(&number(&b, index));
        if order != Ordering::Equal {
            return order;
        }
    }
    match (a.get(4), b.get(4)) {
        (None, None) => Ordering::Equal,
        (None, Some(_)) => Ordering::Greater,
        (Some(_), None) => Ordering::Less,
        (Some(a), Some(b)) => natural(a.as_str(), b.as_str()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn channels_follow_the_version() {
        assert_eq!(channel_from_version("2.0.0-beta.1"), "beta");
        assert_eq!(channel_from_version("2.0.0-rc.2"), "beta");
        assert_eq!(channel_from_version("2.0.0"), STABLE);
        assert_eq!(version_from_tag("notes/v1.5.0").as_deref(), Some("1.5.0"));
        assert_eq!(version_from_tag("latest"), None);
    }
}
