use std::fs;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

use image::RgbaImage;
use image::imageops::{self, FilterType};
use serde::Deserialize;

use super::xcursor;

const CELL: u32 = 64;
const CONTENT: u32 = 44;
const SHAPES: [&[&str]; 5] = [
    &["default", "left_ptr", "arrow", "top_left_arrow"],
    &["pointer", "hand2", "pointing_hand", "hand1", "hand"],
    &["text", "xterm", "ibeam"],
    &["wait", "watch"],
    &[
        "ew-resize",
        "sb_h_double_arrow",
        "size_hor",
        "h_double_arrow",
        "col-resize",
    ],
];

#[derive(Deserialize)]
pub struct Theme {
    path: String,
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn modified(path: &Path) -> Option<u64> {
    fs::metadata(path)
        .ok()?
        .modified()
        .ok()?
        .duration_since(UNIX_EPOCH)
        .ok()
        .map(|time| time.as_secs())
}

fn cached_path(theme: &Path) -> Result<PathBuf, String> {
    let mut hasher = DefaultHasher::new();
    theme.hash(&mut hasher);
    modified(&theme.join("cursors")).hash(&mut hasher);
    Ok(dirs::cache_dir()
        .ok_or("There is no cache folder")?
        .join("com.lantharos.settings")
        .join("cursors")
        .join(format!("{:016x}.png", hasher.finish())))
}

fn visible_bounds(image: &RgbaImage) -> Option<(u32, u32, u32, u32)> {
    let (mut left, mut top, mut right, mut bottom) = (u32::MAX, u32::MAX, 0, 0);
    for (x, y, pixel) in image.enumerate_pixels() {
        if pixel[3] > 0 {
            (left, top) = (left.min(x), top.min(y));
            (right, bottom) = (right.max(x), bottom.max(y));
        }
    }
    (left <= right).then(|| (left, top, right - left + 1, bottom - top + 1))
}

fn shape(cursors: &Path, names: &[&str]) -> Option<RgbaImage> {
    let image = names
        .iter()
        .filter_map(|name| fs::read(cursors.join(name)).ok())
        .find_map(|bytes| xcursor::closest_image(&bytes, CELL))?;
    let (x, y, width, height) = visible_bounds(&image)?;
    let cropped = imageops::crop_imm(&image, x, y, width, height).to_image();
    let scale = CONTENT as f32 / width.max(height) as f32;
    let target = |side: u32| ((side as f32 * scale).round() as u32).clamp(1, CONTENT);
    Some(imageops::resize(
        &cropped,
        target(width),
        target(height),
        FilterType::CatmullRom,
    ))
}

fn render(theme: &Path) -> Option<RgbaImage> {
    let cursors = theme.join("cursors");
    let shapes: Vec<RgbaImage> = SHAPES
        .iter()
        .filter_map(|names| shape(&cursors, names))
        .collect();
    if shapes.is_empty() {
        return None;
    }
    let mut strip = RgbaImage::new(CELL * shapes.len() as u32, CELL);
    for (index, shape) in shapes.iter().enumerate() {
        let x = index as u32 * CELL + (CELL - shape.width()) / 2;
        let y = (CELL - shape.height()) / 2;
        imageops::overlay(&mut strip, shape, x.into(), y.into());
    }
    Some(strip)
}

pub fn preview(Theme { path }: Theme) -> Result<String, String> {
    let theme = Path::new(&path);
    let target = cached_path(theme)?;
    if !target.exists() {
        let strip = render(theme).ok_or("This theme has no cursors to show")?;
        fs::create_dir_all(target.parent().ok_or("There is no cache folder")?).map_err(failed)?;
        strip.save(&target).map_err(failed)?;
    }
    Ok(target.to_string_lossy().into_owned())
}
