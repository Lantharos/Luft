use std::fs::Metadata;
use std::io;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};

use bytes::{Bytes, BytesMut};
use futures_util::stream;
use http_body::Frame;
use http_body_util::{BodyExt, StreamBody};
use tokio::fs::File;
use tokio::io::AsyncReadExt;
use walkdir::WalkDir;

use crate::app::random_id;
use crate::localsend::client::{self, Body};
use crate::localsend::protocol::{FileDto, Metadata as Times};

const CHUNK: usize = 256 * 1024;

/// What one file of a transfer is read from.
pub enum Source {
    Path(PathBuf),
    Text(Bytes),
}

pub struct Outgoing {
    pub dto: FileDto,
    pub source: Source,
}

/// The files to send, with folders sent whole under their own name, as LocalSend's apps do.
pub fn collect(paths: &[PathBuf]) -> io::Result<Vec<Outgoing>> {
    let mut files = Vec::new();
    for path in paths {
        let base = path.parent().unwrap_or(Path::new("/"));
        for entry in WalkDir::new(path).follow_links(true).sort_by_file_name() {
            let entry = entry.map_err(io::Error::other)?;
            if !entry.file_type().is_file() {
                continue;
            }
            let name = entry.path().strip_prefix(base).unwrap_or(entry.path()).to_string_lossy().into_owned();
            let metadata = entry.metadata().map_err(io::Error::other)?;
            files.push(Outgoing { dto: describe(name, &metadata), source: Source::Path(entry.into_path()) });
        }
    }
    Ok(files)
}

/// Text travels as a text file that carries the text as its preview, so the other device can show it right away.
pub fn text(text: String) -> Outgoing {
    let bytes = Bytes::from(text.clone());
    Outgoing {
        dto: FileDto {
            id: random_id(),
            file_name: format!("{}.txt", random_id()),
            size: bytes.len() as u64,
            file_type: "text/plain".into(),
            sha256: None,
            preview: Some(text),
            metadata: None,
        },
        source: Source::Text(bytes),
    }
}

fn describe(name: String, metadata: &Metadata) -> FileDto {
    let stamp = |time: io::Result<std::time::SystemTime>| time.ok().and_then(|time| jiff::Timestamp::try_from(time).ok()).map(|time| time.to_string());
    FileDto {
        id: random_id(),
        file_type: kind(&name).into(),
        file_name: name,
        size: metadata.len(),
        sha256: None,
        preview: None,
        metadata: Some(Times { modified: stamp(metadata.modified()), accessed: stamp(metadata.accessed()) }),
    }
}

/// The type phones go by to put pictures and videos in their gallery.
fn kind(name: &str) -> &'static str {
    let extension = name.rsplit_once('.').map(|(_, extension)| extension.to_ascii_lowercase()).unwrap_or_default();
    match extension.as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "heic" => "image/heic",
        "heif" => "image/heif",
        "avif" => "image/avif",
        "jxl" => "image/jxl",
        "svg" => "image/svg+xml",
        "bmp" => "image/bmp",
        "tif" | "tiff" => "image/tiff",
        "mp4" | "m4v" => "video/mp4",
        "mov" => "video/quicktime",
        "mkv" => "video/x-matroska",
        "webm" => "video/webm",
        "avi" => "video/x-msvideo",
        "mp3" => "audio/mpeg",
        "m4a" => "audio/mp4",
        "ogg" | "oga" | "opus" => "audio/ogg",
        "flac" => "audio/flac",
        "wav" => "audio/wav",
        "pdf" => "application/pdf",
        "zip" => "application/zip",
        "apk" => "application/vnd.android.package-archive",
        "txt" | "md" => "text/plain",
        "html" | "htm" => "text/html",
        _ => "application/octet-stream",
    }
}

/// Reads the file as it goes out, counting what's read into `done`.
pub fn body(source: &Source, done: Arc<AtomicU64>) -> Body {
    let path = match source {
        Source::Text(bytes) => {
            done.fetch_add(bytes.len() as u64, Ordering::Relaxed);
            return client::full(bytes.clone());
        }
        Source::Path(path) => path.clone(),
    };
    let chunks = stream::try_unfold((None::<File>, path, done), |(file, path, done)| async move {
        let mut file = match file {
            Some(file) => file,
            None => File::open(&path).await?,
        };
        let mut chunk = BytesMut::with_capacity(CHUNK);
        if file.read_buf(&mut chunk).await? == 0 {
            return Ok(None);
        }
        done.fetch_add(chunk.len() as u64, Ordering::Relaxed);
        Ok(Some((Frame::data(chunk.freeze()), (Some(file), path, done))))
    });
    StreamBody::new(chunks).boxed()
}
