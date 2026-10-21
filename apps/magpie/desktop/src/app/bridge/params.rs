use luft_app::fonts::Role;
use luft_app::thumbnails::ThumbnailSize;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Empty {}

#[derive(Deserialize)]
pub struct Path {
    pub path: String,
}

#[derive(Deserialize)]
pub struct Handoff {
    pub path: String,
    pub token: Option<String>,
}

#[derive(Deserialize)]
pub struct Paths {
    pub paths: Vec<String>,
}

#[derive(Deserialize)]
pub struct ThumbnailRequest {
    pub paths: Vec<String>,
    pub size: ThumbnailSize,
}

#[derive(Deserialize)]
pub struct Subtitles {
    pub path: String,
    pub id: String,
}

#[derive(Deserialize)]
pub struct OpenWith {
    pub path: String,
    pub app: String,
    pub token: Option<String>,
}

#[derive(Deserialize)]
pub struct Uri {
    pub uri: String,
    pub token: Option<String>,
}

#[derive(Deserialize)]
pub struct FontFace {
    pub path: String,
    pub index: u32,
}

#[derive(Deserialize)]
pub struct FontUse {
    pub path: String,
    pub role: Role,
}
