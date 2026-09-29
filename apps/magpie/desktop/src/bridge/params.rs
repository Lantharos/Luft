use luft_app::thumbnails::ThumbnailSize;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Empty {}

#[derive(Deserialize)]
pub struct Path {
    pub path: String,
}

#[derive(Deserialize)]
pub struct Paths {
    pub paths: Vec<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Arguments {
    pub arguments: Vec<String>,
    pub working_directory: Option<String>,
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
}

#[derive(Deserialize)]
pub struct Uri {
    pub uri: String,
}
