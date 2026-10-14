use std::fs;
use std::path::Path;

use serde::{Deserialize, Serialize};

use super::cache::{cached_path, failed, store};
use super::saliency;
use super::thumbnail::{Image, preview};

#[derive(Clone, Copy, Serialize, Deserialize)]
#[serde(from = "(f64, f64)", into = "(f64, f64)")]
pub struct Focus {
    pub x: f64,
    pub y: f64,
}

impl Focus {
    pub const CENTER: Self = Self { x: 0.5, y: 0.5 };
}

impl From<(f64, f64)> for Focus {
    fn from((x, y): (f64, f64)) -> Self {
        Self {
            x: x.clamp(0.0, 1.0),
            y: y.clamp(0.0, 1.0),
        }
    }
}

impl From<Focus> for (f64, f64) {
    fn from(focus: Focus) -> Self {
        (focus.x, focus.y)
    }
}

#[derive(Deserialize)]
struct Details {
    focus: Focus,
}

fn from_details(wallpaper: &Path) -> Option<Focus> {
    let contents = fs::read(wallpaper.with_extension("json")).ok()?;
    serde_json::from_slice::<Details>(&contents)
        .ok()
        .map(|details| details.focus)
}

fn estimated(wallpaper: &Path) -> Result<Focus, String> {
    let cached = cached_path(wallpaper, "focus", "json")?;
    if let Some(focus) = fs::read(&cached)
        .ok()
        .and_then(|contents| serde_json::from_slice(&contents).ok())
    {
        return Ok(focus);
    }
    let picture = image::open(preview(wallpaper)?)
        .map_err(failed)?
        .into_rgb8();
    let focus = saliency::estimate(&picture);
    store(&cached, &serde_json::to_vec(&focus).map_err(failed)?)?;
    Ok(focus)
}

pub fn of(wallpaper: &Path) -> Focus {
    from_details(wallpaper)
        .or_else(|| estimated(wallpaper).ok())
        .unwrap_or(Focus::CENTER)
}

pub fn focus(Image { path }: Image) -> Result<Focus, String> {
    Ok(of(Path::new(&path)))
}
