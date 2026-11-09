mod clean;
mod deskew;
mod detect;
mod geometry;
mod warp;

use image::{GrayImage, RgbImage};
use serde::{Deserialize, Serialize};
use specta::Type;

pub use detect::{find_page, small_grey};
pub use geometry::Quad;

/// How large straightening looks at a picture, on its longer side, where
/// lines of text are still a few pixels apart.
const DESKEW_SIZE: u32 = 1000;

/// How a page comes out.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Mode {
    #[default]
    Colour,
    Grey,
    BlackAndWhite,
}

/// Where a page's picture came from, which decides how much it needs
/// straightening and evening out.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Origin {
    Scanner,
    Camera,
    Picture,
}

pub enum Cleaned {
    Colour(RgbImage),
    Grey(GrayImage),
    BlackAndWhite(GrayImage),
}

impl Cleaned {
    pub fn size(&self) -> (u32, u32) {
        match self {
            Self::Colour(image) => image.dimensions(),
            Self::Grey(image) | Self::BlackAndWhite(image) => image.dimensions(),
        }
    }
}

/// Where a page lies on a picture with nothing marked: the paper for photos,
/// or on a scan a smaller paper on the glass, else the scan straightened.
pub fn suggest(source: &RgbImage, origin: Origin) -> Quad {
    let small = detect::small_grey(source);
    let found = match origin {
        Origin::Scanner => detect::find_page_on_glass(&small),
        Origin::Camera | Origin::Picture => detect::find_page(&small),
    };
    found.unwrap_or_else(|| deskew::straightened(&detect::shrunk_grey(source, DESKEW_SIZE)))
}

/// The page cut out of `source` along `quad`, turned by quarter turns and
/// cleaned up for `mode`.
pub fn develop(source: &RgbImage, quad: &Quad, turns: u8, origin: Origin, mode: Mode) -> Cleaned {
    let page = warp::rotate_quarter(warp::cut(source, quad), turns);
    let mut cleaned = clean::clean(page, origin, mode);
    if origin == Origin::Scanner {
        clean::whiten_edges(&mut cleaned);
    }
    cleaned
}

/// The page cut out and evened out in grey, as text recognition reads best.
pub fn for_reading(source: &RgbImage, quad: &Quad, turns: u8, origin: Origin) -> GrayImage {
    clean::grey(warp::rotate_quarter(warp::cut(source, quad), turns), origin)
}
