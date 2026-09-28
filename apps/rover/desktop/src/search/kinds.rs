use serde::Deserialize;

#[derive(Debug, Clone, Copy, PartialEq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Kind {
    Folder,
    Image,
    Video,
    Audio,
    Document,
    Archive,
    Code,
}

const IMAGES: &[&str] = &[
    "jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "ico", "avif", "heic", "heif", "tif",
    "tiff", "jxl", "raw", "cr2", "nef", "dng", "psd", "xcf",
];
const VIDEOS: &[&str] = &[
    "mp4", "webm", "mkv", "avi", "mov", "wmv", "flv", "m4v", "mpg", "mpeg", "ogv", "3gp",
];
const AUDIO: &[&str] = &[
    "mp3", "wav", "ogg", "flac", "aac", "m4a", "wma", "opus", "aiff", "mid", "midi",
];
const DOCUMENTS: &[&str] = &[
    "pdf", "doc", "docx", "odt", "rtf", "xls", "xlsx", "ods", "csv", "ppt", "pptx", "odp", "epub",
    "txt", "md", "tex",
];
const ARCHIVES: &[&str] = &[
    "zip", "rar", "7z", "tar", "gz", "tgz", "bz2", "tbz2", "xz", "txz", "zst", "tzst", "lz4", "iso",
];
const CODE: &[&str] = &[
    "json", "xml", "yaml", "yml", "toml", "js", "mjs", "cjs", "ts", "jsx", "tsx", "css", "scss",
    "html", "svelte", "vue", "py", "rb", "rs", "go", "java", "kt", "c", "cc", "cpp", "h", "hpp",
    "cs", "swift", "sh", "bash", "zsh", "fish", "lua", "php", "sql", "zig", "nix", "ini", "conf",
    "cfg", "env", "lock",
];

pub fn kind_of(name: &str, is_dir: bool) -> Option<Kind> {
    if is_dir {
        return Some(Kind::Folder);
    }
    let extension = extension(name)?;
    [
        (Kind::Image, IMAGES),
        (Kind::Video, VIDEOS),
        (Kind::Audio, AUDIO),
        (Kind::Document, DOCUMENTS),
        (Kind::Archive, ARCHIVES),
        (Kind::Code, CODE),
    ]
    .into_iter()
    .find(|(_, extensions)| extensions.contains(&extension.as_str()))
    .map(|(kind, _)| kind)
}

pub fn is_binary_extension(name: &str) -> bool {
    extension(name).is_some_and(|extension| {
        [IMAGES, VIDEOS, AUDIO, ARCHIVES]
            .iter()
            .any(|extensions| extensions.contains(&extension.as_str()))
            || matches!(
                extension.as_str(),
                "pdf"
                    | "doc"
                    | "docx"
                    | "odt"
                    | "xls"
                    | "xlsx"
                    | "ods"
                    | "ppt"
                    | "pptx"
                    | "odp"
                    | "epub"
                    | "so"
                    | "o"
                    | "a"
                    | "bin"
                    | "exe"
                    | "dll"
                    | "class"
                    | "jar"
                    | "wasm"
                    | "ttf"
                    | "otf"
                    | "woff"
                    | "woff2"
                    | "db"
                    | "sqlite"
            )
    })
}

fn extension(name: &str) -> Option<String> {
    let (stem, extension) = name.rsplit_once('.')?;
    (!stem.is_empty()).then(|| extension.to_ascii_lowercase())
}
