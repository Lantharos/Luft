use std::cmp::Ordering;

/// A version as schelf.store orders them: up to three numbers, then an
/// optional pre-release, which comes before the same numbers without one.
struct Parsed<'a> {
    numbers: [u64; 3],
    prerelease: Option<&'a str>,
}

fn parse(version: &str) -> Option<Parsed<'_>> {
    let version = version.strip_prefix('v').unwrap_or(version);
    let version = version.split_once('+').map_or(version, |(base, _)| base);
    let (core, prerelease) = match version.split_once('-') {
        Some((core, prerelease)) => (core, Some(prerelease)),
        None => (version, None),
    };
    if prerelease.is_some_and(str::is_empty) {
        return None;
    }
    let mut numbers = [0; 3];
    let mut parts = core.split('.');
    for (index, part) in parts.by_ref().take(3).enumerate() {
        if part.is_empty() || !part.bytes().all(|byte| byte.is_ascii_digit()) {
            return None;
        }
        numbers[index] = part.parse().ok()?;
    }
    if parts.next().is_some() {
        return None;
    }
    Some(Parsed {
        numbers,
        prerelease,
    })
}

#[derive(PartialEq, Eq, PartialOrd, Ord)]
enum Chunk {
    Number(u64),
    Text(String),
}

fn chunks(label: &str) -> Vec<Chunk> {
    let mut chunks = Vec::new();
    let mut rest = label;
    while let Some(first) = rest.chars().next() {
        let digit = first.is_ascii_digit();
        let end = rest
            .find(|character: char| character.is_ascii_digit() != digit)
            .unwrap_or(rest.len());
        let (chunk, after) = rest.split_at(end);
        chunks.push(if digit {
            Chunk::Number(chunk.parse().unwrap_or(u64::MAX))
        } else {
            Chunk::Text(chunk.to_ascii_lowercase())
        });
        rest = after;
    }
    chunks
}

/// Compares pre-release labels the way people read them, so `beta.10`
/// comes after `beta.9`.
fn compare_labels(left: &str, right: &str) -> Ordering {
    chunks(left).cmp(&chunks(right))
}

pub fn compare(left: &str, right: &str) -> Ordering {
    let (Some(a), Some(b)) = (parse(left), parse(right)) else {
        return left.cmp(right);
    };
    a.numbers
        .cmp(&b.numbers)
        .then_with(|| match (a.prerelease, b.prerelease) {
            (None, None) => Ordering::Equal,
            (None, Some(_)) => Ordering::Greater,
            (Some(_), None) => Ordering::Less,
            (Some(a), Some(b)) => compare_labels(a, b),
        })
}

pub fn newer(candidate: &str, installed: &str) -> bool {
    compare(candidate, installed) == Ordering::Greater
}

#[cfg(test)]
mod tests {
    use super::newer;

    #[test]
    fn numbers_count_as_numbers() {
        assert!(newer("1.10.0", "1.9.0"));
        assert!(newer("2", "1.9.9"));
        assert!(newer("v1.2.1", "1.2"));
        assert!(!newer("1.2.0", "1.2"));
    }

    #[test]
    fn a_prerelease_comes_before_its_release() {
        assert!(newer("1.3.0", "1.3.0-beta.4"));
        assert!(!newer("1.3.0-beta.4", "1.3.0"));
        assert!(newer("1.3.0-beta.10", "1.3.0-beta.9"));
        assert!(newer("1.3.0-rc.1", "1.3.0-beta.9"));
        assert!(newer("1.3.0-beta.1", "1.2.9"));
    }

    #[test]
    fn build_metadata_does_not_change_the_order() {
        assert!(!newer("1.2.0+linux", "1.2.0"));
        assert!(newer("1.2.1+linux", "1.2.0"));
    }
}
