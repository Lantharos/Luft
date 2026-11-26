use luft_app::thumbnails::ThumbnailSize;
use serde::Deserialize;
use specta::Type;

#[derive(Deserialize, Type)]
pub struct Path {
    pub path: String,
}

#[derive(Deserialize, Type)]
pub struct Paths {
    pub paths: Vec<String>,
}

#[derive(Deserialize, Type)]
pub struct Job {
    pub id: u32,
}

#[derive(Deserialize, Type)]
pub struct ThumbnailRequest {
    pub paths: Vec<String>,
    pub size: ThumbnailSize,
}
