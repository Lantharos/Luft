use std::fs;
use std::path::Path;
use std::time::SystemTime;

use gio::prelude::*;
use serde::Serialize;

const DIRECTORY_TYPE: &str = "inode/directory";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileDetails {
    kind: String,
    mime_type: Option<String>,
    created: Option<i64>,
    accessed: Option<i64>,
    dimensions: Option<(usize, usize)>,
    item_count: Option<usize>,
    link_target: Option<String>,
}

pub fn inspect(path: &str) -> Result<FileDetails, String> {
    let path = Path::new(path);
    let metadata = fs::metadata(path).map_err(|error| error.to_string())?;
    let content_type = content_type(path);
    let mime_type = gio::content_type_get_mime_type(&content_type).map(String::from);
    Ok(FileDetails {
        kind: gio::content_type_get_description(&content_type).to_string(),
        dimensions: mime_type
            .as_deref()
            .filter(|mime| mime.starts_with("image/"))
            .and_then(|_| imagesize::size(path).ok())
            .map(|size| (size.width, size.height)),
        mime_type,
        created: metadata.created().ok().and_then(unix_seconds),
        accessed: metadata.accessed().ok().and_then(unix_seconds),
        item_count: metadata.is_dir().then(|| visible_children(path)),
        link_target: fs::read_link(path)
            .ok()
            .map(|target| target.to_string_lossy().into_owned()),
    })
}

fn content_type(path: &Path) -> String {
    gio::File::for_path(path)
        .query_info(
            gio::FILE_ATTRIBUTE_STANDARD_CONTENT_TYPE,
            gio::FileQueryInfoFlags::NONE,
            gio::Cancellable::NONE,
        )
        .ok()
        .and_then(|info| info.content_type())
        .map_or_else(|| DIRECTORY_TYPE.to_string(), String::from)
}

fn visible_children(path: &Path) -> usize {
    fs::read_dir(path).map_or(0, |entries| {
        entries
            .flatten()
            .filter(|entry| !entry.file_name().as_encoded_bytes().starts_with(b"."))
            .count()
    })
}

fn unix_seconds(time: SystemTime) -> Option<i64> {
    time.duration_since(SystemTime::UNIX_EPOCH)
        .ok()
        .map(|duration| duration.as_secs() as i64)
}
