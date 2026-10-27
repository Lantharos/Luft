use luft_app::fonts::Role;
use luft_app::thumbnails::ThumbnailSize;
use serde::Deserialize;
use specta::Type;

#[derive(Deserialize, Type)]
pub struct Empty {}

#[derive(Deserialize, Type)]
pub struct Path {
    pub path: String,
}

#[derive(Deserialize, Type)]
pub struct Handoff {
    pub path: String,
    pub token: Option<String>,
}

#[derive(Deserialize, Type)]
pub struct Paths {
    pub paths: Vec<String>,
}

#[derive(Deserialize, Type)]
pub struct ThumbnailRequest {
    pub paths: Vec<String>,
    pub size: ThumbnailSize,
}

#[derive(Deserialize, Type)]
pub struct Subtitles {
    pub path: String,
    pub id: String,
}

#[derive(Deserialize, Type)]
pub struct OpenWith {
    pub path: String,
    pub app: String,
    pub token: Option<String>,
}

#[derive(Deserialize, Type)]
pub struct Uri {
    pub uri: String,
    pub token: Option<String>,
}

#[derive(Deserialize, Type)]
pub struct FontFace {
    pub path: String,
    pub index: u32,
}

#[derive(Deserialize, Type)]
pub struct FontUse {
    pub path: String,
    pub role: Role,
}
