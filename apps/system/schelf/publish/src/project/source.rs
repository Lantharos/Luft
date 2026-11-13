use std::sync::LazyLock;

use regex::Regex;

static OPEN_SOURCE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(
        r"^(MIT|ISC|Apache-2\.0|BSD-[23]-Clause|MPL-2\.0|[AL]?GPL-[23]\.0(-only|-or-later)?|Unlicense|0BSD|Zlib)$",
    )
    .unwrap()
});

/// Whether a project with `licence` is open source, and its licence when it is.
pub fn source_of(licence: Option<&str>) -> (&'static str, Option<String>) {
    match licence.filter(|licence| OPEN_SOURCE.is_match(licence)) {
        Some(licence) => ("open", Some(licence.to_owned())),
        None => ("proprietary", None),
    }
}
