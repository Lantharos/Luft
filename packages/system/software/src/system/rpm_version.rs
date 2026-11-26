use std::cmp::Ordering;

/// Orders two RPM versions, each `[epoch:]version[-release]`, the way rpm and dnf do.
pub fn compare(a: &str, b: &str) -> Ordering {
    let (a_epoch, a_version, a_release) = split(a);
    let (b_epoch, b_version, b_release) = split(b);
    a_epoch
        .cmp(&b_epoch)
        .then_with(|| compare_part(a_version, b_version))
        .then_with(|| compare_part(a_release, b_release))
}

pub fn newer(candidate: &str, installed: &str) -> bool {
    compare(candidate, installed) == Ordering::Greater
}

fn split(evr: &str) -> (u64, &str, &str) {
    let (epoch, rest) = evr
        .split_once(':')
        .map_or((0, evr), |(epoch, rest)| (epoch.parse().unwrap_or(0), rest));
    let (version, release) = rest.rsplit_once('-').unwrap_or((rest, ""));
    (epoch, version, release)
}

fn compare_part(a: &str, b: &str) -> Ordering {
    let (mut a, mut b) = (a.as_bytes(), b.as_bytes());
    loop {
        a = skip_separators(a);
        b = skip_separators(b);
        match (a.first(), b.first()) {
            (Some(b'~'), Some(b'~')) | (Some(b'^'), Some(b'^')) => {
                a = &a[1..];
                b = &b[1..];
                continue;
            }
            (Some(b'~'), _) => return Ordering::Less,
            (_, Some(b'~')) => return Ordering::Greater,
            (None, Some(b'^')) => return Ordering::Less,
            (Some(b'^'), None) => return Ordering::Greater,
            (Some(b'^'), _) => return Ordering::Less,
            (_, Some(b'^')) => return Ordering::Greater,
            (None, None) => return Ordering::Equal,
            (None, Some(_)) => return Ordering::Less,
            (Some(_), None) => return Ordering::Greater,
            _ => {}
        }
        let numeric = a[0].is_ascii_digit();
        let take = |text: &[u8]| {
            text.iter()
                .take_while(|byte| {
                    if numeric {
                        byte.is_ascii_digit()
                    } else {
                        byte.is_ascii_alphabetic()
                    }
                })
                .count()
        };
        let (a_length, b_length) = (take(a), take(b));
        if b_length == 0 {
            return if numeric {
                Ordering::Greater
            } else {
                Ordering::Less
            };
        }
        let (a_segment, b_segment) = (&a[..a_length], &b[..b_length]);
        let order = if numeric {
            let a_digits = trim_zeros(a_segment);
            let b_digits = trim_zeros(b_segment);
            a_digits
                .len()
                .cmp(&b_digits.len())
                .then_with(|| a_digits.cmp(b_digits))
        } else {
            a_segment.cmp(b_segment)
        };
        if order != Ordering::Equal {
            return order;
        }
        a = &a[a_length..];
        b = &b[b_length..];
    }
}

fn skip_separators(text: &[u8]) -> &[u8] {
    let start = text
        .iter()
        .position(|byte| byte.is_ascii_alphanumeric() || *byte == b'~' || *byte == b'^')
        .unwrap_or(text.len());
    &text[start..]
}

fn trim_zeros(digits: &[u8]) -> &[u8] {
    let start = digits
        .iter()
        .position(|digit| *digit != b'0')
        .unwrap_or(digits.len());
    &digits[start..]
}

#[cfg(test)]
mod tests {
    use super::newer;

    #[test]
    fn numbers_compare_as_numbers() {
        assert!(newer("2.106.0-1.fc45", "2.105.0-1.fc45"));
        assert!(!newer("2.105.0-1.fc45", "2.106.0-1.fc45"));
        assert!(newer("1.10-1", "1.9-1"));
        assert!(!newer("1.010-1", "1.10-1"));
    }

    #[test]
    fn epoch_outranks_version() {
        assert!(newer("1:1.0-1", "9.9-1"));
    }

    #[test]
    fn release_breaks_ties() {
        assert!(newer("1.0-2.fc45", "1.0-1.fc45"));
    }

    #[test]
    fn tilde_comes_before_and_caret_after() {
        assert!(newer("1.0-1", "1.0~rc1-1"));
        assert!(newer("1.0^git1-1", "1.0-1"));
        assert!(newer("1.0.1-1", "1.0^git1-1"));
    }

    #[test]
    fn numbers_outrank_letters() {
        assert!(newer("1.0.1-1", "1.0.a-1"));
    }
}
