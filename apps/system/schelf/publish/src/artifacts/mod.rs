pub mod bundle;
pub mod collect;
pub mod context;
pub mod files;
pub mod images;
pub mod kinds;
pub mod release;
pub mod version;

use std::collections::BTreeMap;
use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use std::path::Path;
use std::sync::LazyLock;

use base64::Engine;
use regex::Regex;

use crate::schema::parts::{PartSettings, part_of};
use crate::schema::platforms::PLATFORMS;

const MAX_BLOCKMAP_BASE64: u64 = 8 * 1024 * 1024;

static SABINE_NAME: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)-(linux|windows|macos)-(x86_64|aarch64)(?:-(appimage|deb|rpm|msi|exe|dmg))?\.(appimage|deb|rpm|msi|exe|dmg|tar\.gz|zip)$").unwrap()
});
static ARCH_IN_NAME: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)(?:^|[-_.])(x86_64|amd64|x64|aarch64|arm64)(?:[-_.]|$)").unwrap()
});
static IGNORED: LazyLock<[Regex; 4]> = LazyLock::new(|| {
    [
        Regex::new(r"\.executable$").unwrap(),
        Regex::new(r"^sabine-update\.json$").unwrap(),
        Regex::new(r"(?i)\.blockmap$").unwrap(),
        Regex::new(r"(?i)^latest(-[a-z0-9]+)*\.yml$").unwrap(),
    ]
});

/// A file of a release, with what its name and contents say it is.
#[derive(Clone, Debug, PartialEq)]
pub struct InferredArtifact {
    pub path: String,
    pub name: String,
    pub part: Option<String>,
    pub platform: String,
    pub kind: String,
    pub executable: Option<String>,
    pub signature: Option<String>,
    pub blockmap: Option<String>,
    pub blockmap_size: Option<u64>,
}

impl InferredArtifact {
    fn new(path: &str, name: &str, part: Option<String>, platform: String, kind: &str) -> Self {
        Self {
            path: path.to_owned(),
            name: name.to_owned(),
            part,
            platform,
            kind: kind.to_owned(),
            executable: None,
            signature: None,
            blockmap: None,
            blockmap_size: None,
        }
    }
}

/// The parts of schelf.toml that say how a release's files are read.
pub struct Shape<'a> {
    pub format: &'a str,
    pub parts: &'a BTreeMap<String, PartSettings>,
}

fn base_name(path: &str) -> &str {
    Path::new(path)
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or(path)
}

pub fn ignored_file(path: &str) -> bool {
    let name = base_name(path);
    IGNORED.iter().any(|pattern| pattern.is_match(name))
}

fn read_executable(path: &str, target: &str) -> Option<String> {
    let folder = Path::new(path).parent()?;
    let text = std::fs::read_to_string(folder.join(format!("{target}.executable"))).ok()?;
    Some(text.trim().to_owned()).filter(|text| !text.is_empty())
}

fn sabine_kind(target: &str) -> &'static str {
    match target {
        "appimage" => "app-image",
        "deb" => "deb",
        "rpm" => "rpm",
        "msi" => "msi",
        "exe" => "exe",
        _ => "dmg",
    }
}

fn sabine_artifact(
    path: &str,
    name: &str,
    part: Option<String>,
) -> Result<InferredArtifact, String> {
    let found = SABINE_NAME.captures(name).ok_or_else(|| {
        format!(
            "{name} isn't named like a Sabine bundle (…-linux-x86_64-appimage.AppImage). Pass the files Sabine's release workflow uploads."
        )
    })?;
    let platform = format!("{}-{}", found[1].to_lowercase(), found[2].to_lowercase());
    let target = found.get(3).map(|target| target.as_str().to_lowercase());
    let extension = found[4].to_lowercase();
    if target.is_none() && extension != "tar.gz" && extension != "zip" {
        return Err(format!("{name} has no package kind after its platform"));
    }
    let kind = target.as_deref().map_or("archive", sabine_kind);
    let update = match &target {
        Some(target) => format!("{platform}-{target}"),
        None => platform.clone(),
    };
    let mut artifact = InferredArtifact::new(path, name, part, platform, kind);
    artifact.executable = read_executable(path, &update);
    Ok(artifact)
}

/// The architecture an ELF file was built for, when it's one Schelf knows.
pub fn elf_architecture(path: &str) -> Option<&'static str> {
    let mut header = [0u8; 20];
    File::open(path).ok()?.read_exact(&mut header).ok()?;
    if header[..4] != [0x7f, b'E', b'L', b'F'] {
        return None;
    }
    match u16::from_le_bytes([header[18], header[19]]) {
        62 => Some("x86_64"),
        183 => Some("aarch64"),
        _ => None,
    }
}

fn appimage_artifact(path: &str, name: &str) -> Result<InferredArtifact, String> {
    if !name.to_lowercase().ends_with(".appimage") {
        return Err(format!("{name} isn't an AppImage"));
    }
    let arch = elf_architecture(path)
        .ok_or_else(|| format!("{name} isn't an x86_64 or aarch64 AppImage"))?;
    Ok(InferredArtifact::new(
        path,
        name,
        None,
        format!("linux-{arch}"),
        "appimage",
    ))
}

fn extension_artifact(path: &str, name: &str) -> Result<InferredArtifact, String> {
    let lowered = name.to_lowercase();
    let Some(stem) = lowered.strip_suffix(".tar.zst") else {
        return Err(format!("{name} isn't a .tar.zst of the extension folder"));
    };
    let platform = match ARCH_IN_NAME
        .captures(stem)
        .map(|found| found[1].to_lowercase())
    {
        Some(arch) if arch == "aarch64" || arch == "arm64" => "luft-aarch64",
        Some(_) => "luft-x86_64",
        None => "luft",
    };
    Ok(InferredArtifact::new(
        path,
        name,
        None,
        platform.into(),
        "extension",
    ))
}

fn read_blockmap(path: &str) -> Option<String> {
    let bytes = std::fs::read(format!("{path}.blockmap")).ok()?;
    Some(base64::engine::general_purpose::STANDARD.encode(bytes))
}

fn is_blockmap(deflated: &[u8]) -> bool {
    let mut inflated = Vec::new();
    flate2::read::DeflateDecoder::new(deflated)
        .read_to_end(&mut inflated)
        .is_ok()
        && serde_json::from_slice::<serde_json::Value>(&inflated)
            .is_ok_and(|value| value["files"].is_array())
}

fn embedded_blockmap_size(path: &str) -> Option<u64> {
    let mut file = File::open(path).ok()?;
    let size = file.metadata().ok()?.len();
    let mut trailer = [0u8; 4];
    file.seek(SeekFrom::Start(size.checked_sub(4)?)).ok()?;
    file.read_exact(&mut trailer).ok()?;
    let length = u64::from(u32::from_be_bytes(trailer));
    if length + 4 >= size || length > MAX_BLOCKMAP_BASE64 {
        return None;
    }
    let mut blockmap = vec![0u8; length as usize];
    file.seek(SeekFrom::Start(size - 4 - length)).ok()?;
    file.read_exact(&mut blockmap).ok()?;
    is_blockmap(&blockmap).then_some(length)
}

fn general_artifact(
    path: &str,
    name: &str,
    part: Option<String>,
) -> Result<InferredArtifact, String> {
    let (kind, platform) = kinds::infer_file(name)?;
    let linux = kind == "appimage" || kind == "binary";
    let platform = linux
        .then(|| elf_architecture(path))
        .flatten()
        .map_or(platform, |arch| format!("linux-{arch}"));
    let mut artifact = InferredArtifact::new(path, name, part, platform, kind);
    artifact.blockmap = read_blockmap(path);
    artifact.blockmap_size = (kind == "appimage")
        .then(|| embedded_blockmap_size(path))
        .flatten();
    Ok(artifact)
}

/// Reads what the file at `path` is, from its name and, where it says,
/// its contents.
pub fn infer_artifact(path: &str, shape: &Shape) -> Result<InferredArtifact, String> {
    let name = base_name(path);
    let part = part_of(name, shape.parts)?;
    let format = match &part {
        Some(part) => shape.parts[part].format(),
        None => shape.format,
    };
    match format {
        "sabine" => sabine_artifact(path, name, part),
        "files" => general_artifact(path, name, part),
        _ if shape.format == "appimage" => appimage_artifact(path, name),
        _ => extension_artifact(path, name),
    }
}

/// A pattern of files with the system its files are for, after a `#`.
pub fn split_platform(entry: &str) -> Result<(&str, Option<String>), String> {
    let Some(at) = entry.rfind('#') else {
        return Ok((entry, None));
    };
    let platform = &entry[at + 1..];
    if !PLATFORMS.contains(&platform) {
        return Err(format!("{platform} isn't a system Schelf knows"));
    }
    Ok((&entry[..at], Some(platform.to_owned())))
}

#[cfg(test)]
mod tests;
