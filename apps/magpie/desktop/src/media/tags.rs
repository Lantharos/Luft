use std::fs;
use std::path::{Path, PathBuf};
use std::thread;

use lofty::file::{AudioFile, TaggedFileExt};
use lofty::picture::{Picture, PictureType};
use lofty::tag::{Accessor, ItemKey, Tag};
use serde::Serialize;

use crate::cache;

const FOLDER_ART: [&str; 4] = ["cover", "folder", "front", "album"];
const ART_EXTENSIONS: [&str; 4] = ["jpg", "jpeg", "png", "webp"];

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Tags {
    path: String,
    title: Option<String>,
    artist: Option<String>,
    album: Option<String>,
    album_artist: Option<String>,
    track: Option<u32>,
    disc: Option<u32>,
    year: Option<u16>,
    genre: Option<String>,
    duration: Option<f64>,
    art: Option<String>,
}

pub fn read_all(paths: Vec<String>) -> Vec<Tags> {
    let workers = thread::available_parallelism().map_or(2, |cores| cores.get().min(4));
    let chunk = paths.len().div_ceil(workers).max(1);
    thread::scope(|scope| {
        let handles: Vec<_> = paths
            .chunks(chunk)
            .map(|chunk| {
                scope.spawn(move || chunk.iter().map(|path| read(path)).collect::<Vec<_>>())
            })
            .collect();
        handles
            .into_iter()
            .flat_map(|handle| handle.join().unwrap_or_default())
            .collect()
    })
}

fn read(path: &str) -> Tags {
    let source = Path::new(path);
    let mut tags = lofty::read_from_path(source)
        .ok()
        .map(|file| {
            let duration = file.properties().duration().as_secs_f64();
            let tag = file.primary_tag().or_else(|| file.first_tag());
            let mut tags = tag.map(from_tag).unwrap_or_default();
            tags.duration = (duration > 0.0).then_some(duration);
            tags.art = tag.and_then(embedded_art);
            tags
        })
        .unwrap_or_default();
    tags.path = path.to_string();
    tags.art = tags.art.or_else(|| folder_art(source));
    tags
}

fn text(value: Option<std::borrow::Cow<'_, str>>) -> Option<String> {
    value
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn from_tag(tag: &Tag) -> Tags {
    Tags {
        title: text(tag.title()),
        artist: text(tag.artist()),
        album: text(tag.album()),
        album_artist: tag
            .get_string(ItemKey::AlbumArtist)
            .map(str::trim)
            .filter(|artist| !artist.is_empty())
            .map(str::to_string),
        track: tag.track(),
        disc: tag.disk(),
        year: tag.date().map(|date| date.year),
        genre: text(tag.genre()),
        ..Tags::default()
    }
}

fn cover(tag: &Tag) -> Option<&Picture> {
    let pictures = tag.pictures();
    pictures
        .iter()
        .find(|picture| picture.pic_type() == PictureType::CoverFront)
        .or_else(|| pictures.first())
}

fn embedded_art(tag: &Tag) -> Option<String> {
    let picture = cover(tag)?;
    let extension = picture
        .mime_type()
        .and_then(|mime| mime.ext())
        .unwrap_or("jpg");
    let folder = cache::folder("art").ok()?;
    let target = folder.join(format!("{}.{extension}", cache::digest(picture.data())));
    if !target.exists() {
        let partial = target.with_extension("partial");
        fs::write(&partial, picture.data()).ok()?;
        fs::rename(&partial, &target).ok()?;
    }
    Some(target.to_string_lossy().into_owned())
}

fn folder_art(source: &Path) -> Option<String> {
    let folder = source.parent()?;
    let entries: Vec<PathBuf> = fs::read_dir(folder)
        .ok()?
        .flatten()
        .map(|entry| entry.path())
        .collect();
    FOLDER_ART.iter().find_map(|name| {
        entries
            .iter()
            .find(|path| {
                let stem = path
                    .file_stem()
                    .map(|stem| stem.to_string_lossy().to_lowercase());
                let extension = crate::folder::kinds::extension(path);
                stem.as_deref() == Some(name) && ART_EXTENSIONS.contains(&extension.as_str())
            })
            .map(|path| path.to_string_lossy().into_owned())
    })
}
