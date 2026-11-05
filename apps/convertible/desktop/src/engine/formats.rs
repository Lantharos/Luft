use std::path::Path;

use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Family {
    Image,
    Video,
    Audio,
    Document,
    Sheet,
    Archive,
    Font,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Format {
    pub id: &'static str,
    pub label: &'static str,
    pub family: Family,
    pub extensions: &'static [&'static str],
    pub writable: bool,
}

const fn format(
    id: &'static str,
    label: &'static str,
    family: Family,
    extensions: &'static [&'static str],
    writable: bool,
) -> Format {
    Format {
        id,
        label,
        family,
        extensions,
        writable,
    }
}

pub const FORMATS: &[Format] = &[
    format("png", "PNG", Family::Image, &["png", "apng"], true),
    format(
        "jpeg",
        "JPEG",
        Family::Image,
        &["jpg", "jpeg", "jpe", "jfif"],
        true,
    ),
    format("webp", "WebP", Family::Image, &["webp"], true),
    format("avif", "AVIF", Family::Image, &["avif"], true),
    format("heic", "HEIC", Family::Image, &["heic", "heif"], true),
    format("jxl", "JPEG XL", Family::Image, &["jxl"], true),
    format("gif", "GIF", Family::Image, &["gif"], true),
    format("tiff", "TIFF", Family::Image, &["tiff", "tif"], true),
    format("bmp", "BMP", Family::Image, &["bmp", "dib"], true),
    format("ico", "ICO", Family::Image, &["ico", "cur"], true),
    format("tga", "TGA", Family::Image, &["tga"], true),
    format("qoi", "QOI", Family::Image, &["qoi"], true),
    format(
        "pnm",
        "PNM",
        Family::Image,
        &["pnm", "ppm", "pgm", "pbm", "pam"],
        true,
    ),
    format("exr", "OpenEXR", Family::Image, &["exr"], true),
    format("hdr", "Radiance HDR", Family::Image, &["hdr"], true),
    format("dds", "DDS", Family::Image, &["dds"], false),
    format("svg", "SVG", Family::Image, &["svg", "svgz"], false),
    format("mp4", "MP4", Family::Video, &["mp4", "m4v"], true),
    format("webm", "WebM", Family::Video, &["webm"], true),
    format("mkv", "MKV", Family::Video, &["mkv"], true),
    format("mov", "MOV", Family::Video, &["mov", "qt"], true),
    format("avi", "AVI", Family::Video, &["avi"], true),
    format("ogv", "Ogg Video", Family::Video, &["ogv"], false),
    format(
        "mpeg",
        "MPEG",
        Family::Video,
        &["mpeg", "mpg", "ts", "m2ts", "mts", "vob"],
        false,
    ),
    format("wmv", "WMV", Family::Video, &["wmv", "asf"], false),
    format("flv", "FLV", Family::Video, &["flv"], false),
    format("3gp", "3GP", Family::Video, &["3gp", "3g2"], false),
    format("mp3", "MP3", Family::Audio, &["mp3"], true),
    format("flac", "FLAC", Family::Audio, &["flac"], true),
    format("ogg", "Ogg Vorbis", Family::Audio, &["ogg", "oga"], true),
    format("opus", "Opus", Family::Audio, &["opus"], true),
    format("wav", "WAV", Family::Audio, &["wav"], true),
    format("m4a", "M4A", Family::Audio, &["m4a", "aac", "mp4a"], true),
    format("aiff", "AIFF", Family::Audio, &["aiff", "aif"], true),
    format("wma", "WMA", Family::Audio, &["wma"], false),
    format("pdf", "PDF", Family::Document, &["pdf"], true),
    format(
        "md",
        "Markdown",
        Family::Document,
        &["md", "markdown"],
        true,
    ),
    format("html", "HTML", Family::Document, &["html", "htm"], true),
    format(
        "txt",
        "TXT",
        Family::Document,
        &["txt", "text", "log"],
        true,
    ),
    format("docx", "Word", Family::Document, &["docx"], false),
    format(
        "odt",
        "OpenDocument Text",
        Family::Document,
        &["odt"],
        false,
    ),
    format("csv", "CSV", Family::Sheet, &["csv"], true),
    format("tsv", "TSV", Family::Sheet, &["tsv"], true),
    format(
        "xlsx",
        "Excel",
        Family::Sheet,
        &["xlsx", "xlsm", "xlsb", "xls"],
        true,
    ),
    format("ods", "OpenDocument Sheet", Family::Sheet, &["ods"], false),
    format("zip", "ZIP", Family::Archive, &["zip"], true),
    format("7z", "7z", Family::Archive, &["7z"], true),
    format("tar", "TAR", Family::Archive, &["tar"], true),
    format(
        "tar.gz",
        "TAR + Gzip",
        Family::Archive,
        &["tar.gz", "tgz"],
        true,
    ),
    format(
        "tar.xz",
        "TAR + XZ",
        Family::Archive,
        &["tar.xz", "txz"],
        true,
    ),
    format(
        "tar.zst",
        "TAR + Zstandard",
        Family::Archive,
        &["tar.zst", "tzst"],
        true,
    ),
    format(
        "tar.bz2",
        "TAR + Bzip2",
        Family::Archive,
        &["tar.bz2", "tbz2", "tbz"],
        true,
    ),
    format("folder", "Folder", Family::Archive, &[], true),
    format("ttf", "TrueType", Family::Font, &["ttf"], true),
    format("otf", "OpenType", Family::Font, &["otf"], true),
    format("woff", "WOFF", Family::Font, &["woff"], true),
    format("woff2", "WOFF2", Family::Font, &["woff2"], true),
];

pub fn by_id(id: &str) -> Option<&'static Format> {
    FORMATS.iter().find(|format| format.id == id)
}

fn lower_name(path: &Path) -> Option<String> {
    Some(path.file_name()?.to_str()?.to_lowercase())
}

fn by_name(path: &Path) -> Option<&'static Format> {
    let name = lower_name(path)?;
    let matches = |format: &&Format| {
        format
            .extensions
            .iter()
            .any(|extension| name.ends_with(&format!(".{extension}")))
    };
    FORMATS
        .iter()
        .filter(|format| format.family == Family::Archive)
        .find(matches)
        .or_else(|| FORMATS.iter().find(matches))
}

fn by_content(path: &Path) -> Option<&'static Format> {
    let kind = infer::get_from_path(path).ok()??;
    FORMATS
        .iter()
        .find(|format| format.extensions.contains(&kind.extension()))
}

pub fn detect(path: &Path) -> Option<&'static Format> {
    by_name(path).or_else(|| by_content(path))
}

pub fn file_stem(path: &Path, format: Option<&Format>) -> String {
    let name = path
        .file_name()
        .map_or_else(String::new, |name| name.to_string_lossy().into_owned());
    let lower = name.to_lowercase();
    let extension = format
        .into_iter()
        .flat_map(|format| format.extensions)
        .find(|extension| lower.ends_with(&format!(".{extension}")));
    match extension {
        Some(extension) => name[..name.len() - extension.len() - 1].to_owned(),
        None => path
            .file_stem()
            .map_or(name.clone(), |stem| stem.to_string_lossy().into_owned()),
    }
}

const STILLS: &[&str] = &[
    "png", "jpeg", "webp", "avif", "heic", "jxl", "tiff", "bmp", "ico", "tga", "qoi", "pnm", "exr",
    "hdr", "gif",
];
const VIDEOS: &[&str] = &["mp4", "webm", "mkv", "mov", "avi"];
const AUDIOS: &[&str] = &["mp3", "m4a", "flac", "opus", "ogg", "wav", "aiff"];
const ARCHIVES: &[&str] = &["zip", "7z", "tar.gz", "tar.xz", "tar.zst", "tar.bz2", "tar"];

fn image_targets(source: &Format) -> Vec<&'static str> {
    let suggested: &[&str] = match source.id {
        "heic" | "avif" | "jxl" | "tiff" | "bmp" => &["jpeg", "png", "webp"],
        "png" | "svg" | "gif" => &["webp", "jpeg", "avif"],
        "jpeg" => &["webp", "png", "avif"],
        "webp" => &["png", "jpeg", "gif"],
        "ico" | "tga" | "qoi" | "pnm" | "dds" => &["png", "jpeg", "webp"],
        _ => &["png", "jpeg", "webp"],
    };
    let mut targets = suggested.to_vec();
    targets.extend(STILLS.iter().filter(|id| !suggested.contains(id)));
    targets.push("pdf");
    if source.id == "gif" {
        targets.extend(["mp4", "webm"]);
    }
    targets
}

fn font_targets(source: &Format) -> Vec<&'static str> {
    match source.id {
        "ttf" | "otf" => vec!["woff2", "woff"],
        "woff" => vec!["woff2", "ttf", "otf"],
        _ => vec!["woff", "ttf", "otf"],
    }
}

pub fn targets(source: &Format) -> Vec<&'static str> {
    let mut targets = match source.family {
        Family::Image => image_targets(source),
        Family::Video => {
            let mut targets = VIDEOS.to_vec();
            targets.push("gif");
            targets.extend(AUDIOS);
            targets
        }
        Family::Audio => AUDIOS.to_vec(),
        Family::Archive => {
            let mut targets = vec!["folder"];
            targets.extend(ARCHIVES);
            targets
        }
        Family::Font => font_targets(source),
        Family::Sheet => vec!["csv", "tsv", "xlsx"],
        Family::Document => match source.id {
            "pdf" => vec!["png", "jpeg", "webp", "tiff", "txt", "pdf"],
            "md" => vec!["pdf", "html", "txt"],
            "html" => vec!["md", "txt", "pdf"],
            "txt" => vec!["pdf", "md", "html"],
            _ => vec!["md", "html", "txt"],
        },
    };
    let keeps_same = source.id == "pdf"
        || matches!(source.family, Family::Image | Family::Video | Family::Audio);
    if !keeps_same {
        targets.retain(|id| *id != source.id);
    }
    targets
}

pub fn suggested_count(source: &Format) -> usize {
    match source.family {
        Family::Image | Family::Video | Family::Audio | Family::Archive => 3,
        _ => 2,
    }
}

pub fn extension_for(id: &str) -> &'static str {
    by_id(id)
        .and_then(|format| format.extensions.first())
        .copied()
        .unwrap_or("")
}
