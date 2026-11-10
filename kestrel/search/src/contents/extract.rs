use std::fs::File;
use std::io::Read;
use std::path::Path;
use std::process::{Command, Stdio};

use rustix::fs::{Mode, OFlags};

const TEXT_LIMIT: u64 = 1 << 20;
const PDF_LIMIT: u64 = 64 << 20;
const KEPT_LIMIT: usize = 512 << 10;
const BINARY_SNIFF: usize = 8 << 10;
const PDF_PAGES: &str = "40";
const PDF_SECONDS: &str = "20";

const TEXT_EXTENSIONS: &[&str] = &[
    "txt", "md", "markdown", "rst", "org", "adoc", "tex", "bib", "csv", "tsv", "json", "jsonc",
    "toml", "yaml", "yml", "ini", "conf", "cfg", "xml", "html", "htm", "css", "scss", "sass",
    "less", "js", "mjs", "cjs", "ts", "tsx", "jsx", "svelte", "vue", "py", "rs", "go", "c", "h",
    "cc", "cpp", "hpp", "cxx", "java", "kt", "kts", "swift", "rb", "php", "sh", "bash", "zsh",
    "fish", "lua", "sql", "cs", "scala", "dart", "zig", "nix", "hs", "ml", "ex", "exs", "erl",
    "clj", "pl", "r", "jl", "proto", "graphql",
];
const TEXT_NAMES: &[&str] = &[
    "README",
    "LICENSE",
    "COPYING",
    "CHANGELOG",
    "Makefile",
    "Dockerfile",
    "Containerfile",
    "TODO",
];

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Format {
    Text,
    Pdf,
}

pub fn format(name: &str) -> Option<Format> {
    let Some((stem, extension)) = name.rsplit_once('.').filter(|(stem, _)| !stem.is_empty()) else {
        return TEXT_NAMES.contains(&name).then_some(Format::Text);
    };
    let extension = extension.to_ascii_lowercase();
    if extension == "pdf" {
        Some(Format::Pdf)
    } else if TEXT_EXTENSIONS.contains(&extension.as_str()) || TEXT_NAMES.contains(&stem) {
        Some(Format::Text)
    } else {
        None
    }
}

pub fn fits(format: Format, size: u64) -> bool {
    size <= match format {
        Format::Text => TEXT_LIMIT,
        Format::Pdf => PDF_LIMIT,
    }
}

fn shorten(mut text: String) -> String {
    if text.len() > KEPT_LIMIT {
        let end = (0..=KEPT_LIMIT)
            .rev()
            .find(|&index| text.is_char_boundary(index))
            .unwrap_or(0);
        text.truncate(end);
    }
    text
}

fn open(path: &Path) -> Option<File> {
    let flags = OFlags::RDONLY | OFlags::NOFOLLOW | OFlags::NONBLOCK | OFlags::CLOEXEC;
    let file = File::from(rustix::fs::open(path, flags, Mode::empty()).ok()?);
    file.metadata().ok()?.is_file().then_some(file)
}

pub fn read_text(path: &Path) -> Option<String> {
    let mut bytes = Vec::new();
    open(path)?.take(TEXT_LIMIT).read_to_end(&mut bytes).ok()?;
    if bytes[..bytes.len().min(BINARY_SNIFF)].contains(&0) {
        return None;
    }
    Some(String::from_utf8_lossy(&bytes).into_owned())
}

fn read_pdf(path: &Path) -> Option<String> {
    let mut pdftotext = Command::new("timeout")
        .args([
            PDF_SECONDS,
            "pdftotext",
            "-q",
            "-enc",
            "UTF-8",
            "-l",
            PDF_PAGES,
        ])
        .args(["/dev/stdin", "-"])
        .stdin(open(path)?)
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .ok()?;
    let mut bytes = Vec::new();
    let read = pdftotext
        .stdout
        .take()?
        .take(KEPT_LIMIT as u64)
        .read_to_end(&mut bytes);
    let finished = pdftotext.wait().ok()?.success() || bytes.len() == KEPT_LIMIT;
    (read.is_ok() && finished).then(|| String::from_utf8_lossy(&bytes).into_owned())
}

pub fn extract(path: &Path, format: Format) -> String {
    let text = match format {
        Format::Text => read_text(path),
        Format::Pdf => read_pdf(path),
    };
    text.map(shorten).unwrap_or_default()
}
