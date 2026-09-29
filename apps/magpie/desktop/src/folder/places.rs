use std::path::PathBuf;

use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Place {
    Pictures,
    Videos,
    Music,
    Documents,
}

#[derive(Serialize)]
pub struct Location {
    place: Place,
    path: String,
}

pub fn places() -> Vec<Location> {
    let folders: [(Place, Option<PathBuf>); 4] = [
        (Place::Pictures, dirs::picture_dir()),
        (Place::Videos, dirs::video_dir()),
        (Place::Music, dirs::audio_dir()),
        (Place::Documents, dirs::document_dir()),
    ];
    folders
        .into_iter()
        .filter_map(|(place, path)| {
            let path = path.filter(|path| path.is_dir())?;
            Some(Location {
                place,
                path: path.to_string_lossy().into_owned(),
            })
        })
        .collect()
}
