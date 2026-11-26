pub mod open;
pub mod save;
pub mod tiles;

pub const MIME: &str = "application/vnd.lantharos.easel";
pub const DOCUMENT: &str = "document.json";
pub const PREVIEW: &str = "preview.png";
pub const TILE: usize = 512;
pub const TILE_BYTES: usize = TILE * TILE * 4;
pub const MASK_TILE_BYTES: usize = TILE * TILE;
