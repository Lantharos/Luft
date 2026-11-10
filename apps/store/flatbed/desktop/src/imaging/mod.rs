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

const DESKEW_SIZE: u32 = 1000;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Mode {
    #[default]
    Colour,
    Grey,
    BlackAndWhite,
}

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

pub fn suggest(source: &RgbImage, origin: Origin) -> Quad {
    let small = detect::small_grey(source);
    let found = match origin {
        Origin::Scanner => detect::find_page_on_glass(&small),
        Origin::Camera | Origin::Picture => detect::find_page(&small),
    };
    found.unwrap_or_else(|| deskew::straightened(&detect::shrunk_grey(source, DESKEW_SIZE)))
}

pub fn develop(source: &RgbImage, quad: &Quad, turns: u8, origin: Origin, mode: Mode) -> Cleaned {
    let page = warp::rotate_quarter(warp::cut(source, quad), turns);
    let mut cleaned = clean::clean(page, origin, mode);
    if origin == Origin::Scanner {
        clean::whiten_edges(&mut cleaned);
    }
    cleaned
}

pub fn for_reading(source: &RgbImage, quad: &Quad, turns: u8, origin: Origin) -> GrayImage {
    clean::grey(warp::rotate_quarter(warp::cut(source, quad), turns), origin)
}
