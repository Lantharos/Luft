use serde::Deserialize;
use specta::Type;

use crate::imaging::{Mode, Quad};
use crate::scanners::Feed;
use crate::settings::PaperSize;

#[derive(Deserialize, Type)]
pub struct Id {
    pub id: String,
}

#[derive(Deserialize, Type)]
pub struct Corners {
    pub id: String,
    pub quad: Quad,
}

#[derive(Deserialize, Type)]
pub struct Turn {
    pub id: String,
    /// Quarter turns clockwise, negative for anticlockwise.
    pub quarters: i8,
}

#[derive(Deserialize, Type)]
pub struct Order {
    pub ids: Vec<String>,
}

#[derive(Deserialize, Type)]
pub struct SetMode {
    pub mode: Mode,
}

#[derive(Deserialize, Type)]
pub struct Scan {
    pub scanner: String,
    pub feed: Feed,
}

#[derive(Deserialize, Type)]
pub struct Address {
    pub address: String,
}

#[derive(Deserialize, Type)]
pub struct Paths {
    pub paths: Vec<String>,
}

#[derive(Deserialize, Type)]
pub struct Choose {
    pub title: String,
    pub filter: String,
}

#[derive(Deserialize, Type)]
pub struct Saved {
    pub path: String,
    pub token: Option<String>,
}

#[derive(Deserialize, Type)]
pub struct Files {
    pub files: Vec<String>,
}

/// The settings people choose in the window.
#[derive(Deserialize, Type)]
pub struct Preferences {
    pub languages: Vec<String>,
    pub paper: PaperSize,
    pub fine: bool,
    pub scanner: Option<String>,
}
