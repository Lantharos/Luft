mod system;

use std::path::{Path, PathBuf};
use std::process::Command;

use gio::prelude::*;
use skrifa::instance::{LocationRef, Size};
use skrifa::{FontRef, MetadataProvider};

pub use system::{Defaults, Role, defaults, reset, use_family};

const LIST_FORMAT: &str = "%{family[0]}\t%{style[0]}\t%{postscriptname}\t%{index}\t%{file}\n";
const FONT_EXTENSIONS: [&str; 6] = ["ttf", "otf", "ttc", "otc", "woff", "woff2"];
const INSTANCE_SHIFT: u32 = 16;
const WIDTH_SAMPLES: [char; 4] = ['i', 'M', '0', 'W'];

pub struct Face {
    pub family: String,
    pub style: String,
    pub postscript: String,
    pub face: u32,
    pub file: PathBuf,
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn face(line: &str) -> Option<Face> {
    let mut fields = line.splitn(5, '\t');
    let family = fields.next()?.to_owned();
    let style = fields.next()?.to_owned();
    let postscript = fields.next()?.to_owned();
    let index: u32 = fields.next()?.parse().ok()?;
    let file = PathBuf::from(fields.next()?);
    (!family.is_empty()).then_some(Face {
        family,
        style,
        postscript,
        face: index & ((1 << INSTANCE_SHIFT) - 1),
        file,
    })
}

pub fn installed() -> Result<Vec<Face>, String> {
    let output = Command::new("fc-list")
        .args(["--format", LIST_FORMAT])
        .output()
        .map_err(|_| "The font list isn't available".to_string())?;
    Ok(String::from_utf8_lossy(&output.stdout)
        .lines()
        .filter_map(face)
        .collect())
}

pub fn is_monospaced(file: &Path, face: u32) -> bool {
    let Ok(file) = std::fs::File::open(file) else {
        return false;
    };
    // SAFETY: the map is only read while parsing, and installed fonts aren't rewritten in place.
    let Ok(bytes) = (unsafe { memmap2::Mmap::map(&file) }) else {
        return false;
    };
    FontRef::from_index(&bytes, face).is_ok_and(|font| has_fixed_advances(&font))
}

pub fn has_fixed_advances(font: &FontRef) -> bool {
    let charmap = font.charmap();
    let metrics = font.glyph_metrics(Size::unscaled(), LocationRef::default());
    let advances: Option<Vec<f32>> = WIDTH_SAMPLES
        .iter()
        .map(|&character| metrics.advance_width(charmap.map(character)?))
        .collect();
    advances.is_some_and(|advances| {
        advances[0] > 0.0 && advances.iter().all(|&advance| advance == advances[0])
    })
}

pub fn user_folder() -> Result<PathBuf, String> {
    dirs::data_dir()
        .map(|data| data.join("fonts"))
        .ok_or_else(|| "There is no data folder".into())
}

fn user_folders() -> Vec<PathBuf> {
    user_folder()
        .into_iter()
        .chain(dirs::home_dir().map(|home| home.join(".fonts")))
        .filter_map(|folder| folder.canonicalize().ok())
        .collect()
}

pub fn is_font_file(path: &Path) -> bool {
    path.extension()
        .and_then(|extension| extension.to_str())
        .is_some_and(|extension| FONT_EXTENSIONS.contains(&extension.to_ascii_lowercase().as_str()))
}

pub fn belongs_to_user(path: &Path) -> bool {
    let Ok(path) = path.canonicalize() else {
        return false;
    };
    path.is_file()
        && is_font_file(&path)
        && user_folders().iter().any(|folder| path.starts_with(folder))
}

pub fn refresh() -> Result<(), String> {
    let folder = user_folder()?;
    let status = Command::new("fc-cache")
        .arg("-f")
        .arg(&folder)
        .status()
        .map_err(|_| "The font cache couldn't be refreshed".to_string())?;
    status
        .success()
        .then_some(())
        .ok_or_else(|| "The font cache couldn't be refreshed".into())
}

pub fn remove(files: &[PathBuf]) -> Result<(), String> {
    if files.is_empty() || !files.iter().all(|file| belongs_to_user(file)) {
        return Err("Only fonts you installed yourself can be removed".into());
    }
    for file in files {
        gio::File::for_path(file)
            .trash(gio::Cancellable::NONE)
            .map_err(failed)?;
    }
    refresh()
}
