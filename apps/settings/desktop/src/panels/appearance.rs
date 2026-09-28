use std::fs;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::bridge::Commands;
use crate::events::Events;
use crate::portal::{self, Filter};

const IMAGE_EXTENSIONS: [&str; 6] = ["jpg", "jpeg", "png", "webp", "jxl", "avif"];
const SYSTEM_BACKGROUNDS: &str = "/usr/share/backgrounds";
const MAX_DEPTH: usize = 3;
const THUMBNAIL_WIDTH: u32 = 480;
const THUMBNAIL_EXTENSIONS: [&str; 5] = ["jpg", "jpeg", "png", "webp", "jxl"];

#[derive(Deserialize)]
struct Image {
    path: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Wallpaper {
    path: String,
    dark_path: Option<String>,
    name: String,
}

fn is_image(path: &Path) -> bool {
    path.extension()
        .and_then(|extension| extension.to_str())
        .is_some_and(|extension| IMAGE_EXTENSIONS.contains(&extension.to_ascii_lowercase().as_str()))
}

fn collect(directory: &Path, depth: usize, found: &mut Vec<PathBuf>) {
    let Ok(entries) = fs::read_dir(directory) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() && depth < MAX_DEPTH {
            collect(&path, depth + 1, found);
        } else if is_image(&path) {
            found.push(path);
        }
    }
}

fn property_directories() -> Vec<PathBuf> {
    let mut directories: Vec<PathBuf> = std::env::var("XDG_DATA_DIRS")
        .unwrap_or_else(|_| "/usr/local/share:/usr/share".into())
        .split(':')
        .map(|directory| Path::new(directory).join("gnome-background-properties"))
        .collect();
    directories.extend(dirs::data_dir().map(|data| data.join("gnome-background-properties")));
    directories
}

fn described() -> Vec<Wallpaper> {
    let mut wallpapers = Vec::new();
    for directory in property_directories() {
        let Ok(entries) = fs::read_dir(&directory) else {
            continue;
        };
        for entry in entries.flatten() {
            let Ok(xml) = fs::read_to_string(entry.path()) else {
                continue;
            };
            let Ok(document) = roxmltree::Document::parse_with_options(&xml, roxmltree::ParsingOptions { allow_dtd: true, ..Default::default() }) else {
                continue;
            };
            for node in document.descendants().filter(|node| node.has_tag_name("wallpaper") && node.attribute("deleted") != Some("true")) {
                let text = |tag: &str| {
                    node.children()
                        .find(|child| child.has_tag_name(tag))
                        .and_then(|child| child.text())
                        .map(|text| text.trim().to_owned())
                };
                let Some(path) = text("filename").filter(|path| is_image(Path::new(path)) && Path::new(path).exists()) else {
                    continue;
                };
                wallpapers.push(Wallpaper {
                    name: text("name").unwrap_or_else(|| display_name(Path::new(&path))),
                    dark_path: text("filename-dark").filter(|dark| is_image(Path::new(dark)) && Path::new(dark).exists()),
                    path,
                });
            }
        }
    }
    wallpapers
}

fn display_name(path: &Path) -> String {
    path.file_stem().map(|stem| stem.to_string_lossy().replace(['-', '_'], " ")).unwrap_or_default()
}

fn wallpapers() -> Result<Vec<Wallpaper>, String> {
    let mut wallpapers = described();
    let mut loose = Vec::new();
    let mut roots = vec![PathBuf::from(SYSTEM_BACKGROUNDS)];
    roots.extend(dirs::picture_dir().map(|pictures| pictures.join("Wallpapers")));
    roots.extend(dirs::data_dir().map(|data| data.join("backgrounds")));
    for root in roots {
        collect(&root, 0, &mut loose);
    }
    loose.sort();
    loose.dedup();
    for path in loose {
        let path_text = path.to_string_lossy().into_owned();
        if wallpapers.iter().any(|wallpaper| wallpaper.path == path_text || wallpaper.dark_path.as_deref() == Some(path_text.as_str())) {
            continue;
        }
        wallpapers.push(Wallpaper {
            name: display_name(&path),
            path: path_text,
            dark_path: None,
        });
    }
    Ok(wallpapers)
}

fn decode(source: &Path, extension: &str) -> Result<image::DynamicImage, String> {
    if extension == "jxl" {
        let file = fs::File::open(source).map_err(|error| error.to_string())?;
        let decoder = jxl_oxide::integration::JxlDecoder::new(file).map_err(|error| error.to_string())?;
        return image::DynamicImage::from_decoder(decoder).map_err(|error| error.to_string());
    }
    image::open(source).map_err(|error| error.to_string())
}

fn thumbnail(Image { path }: Image) -> Result<String, String> {
    let source = Path::new(&path);
    let extension = source
        .extension()
        .and_then(|extension| extension.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();
    if !THUMBNAIL_EXTENSIONS.contains(&extension.as_str()) {
        return Ok(path);
    }
    let metadata = fs::metadata(source).map_err(|error| error.to_string())?;
    let mut hasher = DefaultHasher::new();
    path.hash(&mut hasher);
    metadata.len().hash(&mut hasher);
    metadata
        .modified()
        .ok()
        .and_then(|modified| modified.duration_since(UNIX_EPOCH).ok())
        .map(|modified| modified.as_secs())
        .hash(&mut hasher);
    let cache = dirs::cache_dir()
        .ok_or("There is no cache folder")?
        .join("dev.lantharos.settings")
        .join("wallpapers");
    let target = cache.join(format!("{:016x}.jpg", hasher.finish()));
    if target.exists() {
        return Ok(target.to_string_lossy().into_owned());
    }
    let image = decode(source, &extension)?;
    let height = (image.height() as f64 * THUMBNAIL_WIDTH as f64 / image.width().max(1) as f64)
        .round() as u32;
    let preview = image.thumbnail(THUMBNAIL_WIDTH, height.max(1)).into_rgb8();
    fs::create_dir_all(&cache).map_err(|error| error.to_string())?;
    preview.save(&target).map_err(|error| error.to_string())?;
    Ok(target.to_string_lossy().into_owned())
}

fn choose_image(_: Value) -> Result<Option<String>, String> {
    portal::open_file(
        "Choose a Wallpaper",
        Filter {
            name: "Images",
            patterns: IMAGE_EXTENSIONS
                .iter()
                .map(|extension| format!("*.{extension}"))
                .collect(),
        },
    )
}

pub fn register(window: SabineWindow, _events: &Events) -> SabineWindow {
    window
        .command("appearance_wallpapers", |_: Value| wallpapers())
        .command("appearance_thumbnail", thumbnail)
        .command("appearance_choose_image", choose_image)
}
