use std::sync::LazyLock;

use regex::Regex;

struct Pattern(LazyLock<Regex>);

macro_rules! pattern {
    ($text:expr) => {
        Pattern(LazyLock::new(|| Regex::new($text).unwrap()))
    };
}

static EXTENSIONS: [(Pattern, &str); 12] = [
    (pattern!(r"(?i)\.exe$"), "exe"),
    (pattern!(r"(?i)\.msi$"), "msi"),
    (pattern!(r"(?i)\.dmg$"), "dmg"),
    (pattern!(r"(?i)\.pkg$"), "pkg"),
    (pattern!(r"(?i)\.deb$"), "deb"),
    (pattern!(r"(?i)\.rpm$"), "rpm"),
    (pattern!(r"(?i)\.flatpak$"), "flatpak"),
    (pattern!(r"(?i)\.appimage$"), "appimage"),
    (pattern!(r"(?i)\.apk$"), "apk"),
    (pattern!(r"(?i)\.zip$"), "zip"),
    (
        pattern!(r"(?i)\.(tar\.(gz|xz|zst|bz2)|tgz|txz|tbz2)$"),
        "tarball",
    ),
    (pattern!(r"(?i)^[^.]+$|\.(bin|run)$"), "binary"),
];

static OS_IN_NAME: [(Pattern, &str); 4] = [
    (
        pattern!(r"(?i)(^|[-_.])(windows|win|win32|win64)([-_.]|$)"),
        "windows",
    ),
    (
        pattern!(r"(?i)(^|[-_.])(macos|mac|osx|darwin|apple)([-_.]|$)"),
        "macos",
    ),
    (pattern!(r"(?i)(^|[-_.])(linux)([-_.]|$)"), "linux"),
    (pattern!(r"(?i)(^|[-_.])(android)([-_.]|$)"), "android"),
];

static ARCH_IN_NAME: [(Pattern, &str); 3] = [
    (
        pattern!(r"(?i)(^|[-_.])(x86_64|x86-64|amd64|x64)([-_.]|$)"),
        "x86_64",
    ),
    (
        pattern!(r"(?i)(^|[-_.])(aarch64|arm64)([-_.]|$)"),
        "aarch64",
    ),
    (pattern!(r"(?i)(^|[-_.])(universal)([-_.]|$)"), "universal"),
];

fn first(patterns: &[(Pattern, &'static str)], name: &str) -> Option<&'static str> {
    patterns
        .iter()
        .find(|(pattern, _)| pattern.0.is_match(name))
        .map(|(_, value)| *value)
}

fn system_of(kind: &str) -> Option<&'static str> {
    match kind {
        "exe" | "msi" => Some("windows"),
        "dmg" | "pkg" => Some("macos"),
        "deb" | "rpm" | "flatpak" | "appimage" => Some("linux"),
        "apk" => Some("android"),
        _ => None,
    }
}

/// The kind of a file Schelf hosts and the system it's for, from its name.
pub fn infer_file(name: &str) -> Result<(&'static str, String), String> {
    let kind = first(&EXTENSIONS, name).ok_or_else(|| {
        let extension = name.rfind('.').map_or(name, |dot| &name[dot..]);
        format!("Schelf doesn't host {extension} files")
    })?;
    let system = system_of(kind).or_else(|| first(&OS_IN_NAME, name));
    let arch = first(&ARCH_IN_NAME, name);
    let platform = match (system, arch) {
        (Some("android"), _) => "android".to_owned(),
        (None, _) => "any".to_owned(),
        (Some("macos"), Some("universal")) => "macos-universal".to_owned(),
        (Some("macos"), arch) => format!("macos-{}", arch.unwrap_or("x86_64")),
        (Some(system), arch) => format!(
            "{system}-{}",
            if arch == Some("aarch64") {
                "aarch64"
            } else {
                "x86_64"
            }
        ),
    };
    Ok((kind, platform))
}
