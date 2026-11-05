use std::fs::File;
use std::io::{self, Read, Write};
use std::path::{Component, Path};

use luft_i18n::t;
use zip::write::SimpleFileOptions;
use zip::{CompressionMethod, ZipArchive, ZipWriter};

use super::{Board, Look, failed, new_id};
use crate::L10N;

const MANIFEST: &str = "board.json";
const SOUNDS: &str = "sounds";

fn listed_files(board: &Board) -> impl Iterator<Item = &str> {
    board.sounds.iter().flat_map(|sound| {
        let picture = match &sound.look {
            Look::Picture(file) => Some(file.as_str()),
            _ => None,
        };
        std::iter::once(sound.file.as_str()).chain(picture)
    })
}

/// One zip with the board's description and its original files, which are compressed already.
pub fn write(board: &Board, folder: &Path, path: &Path) -> Result<(), String> {
    let mut archive = ZipWriter::new(File::create(path).map_err(failed)?);
    archive
        .start_file(
            MANIFEST,
            SimpleFileOptions::default().compression_method(CompressionMethod::Deflated),
        )
        .map_err(failed)?;
    archive
        .write_all(&serde_json::to_vec(board).map_err(failed)?)
        .map_err(failed)?;
    let stored = SimpleFileOptions::default()
        .compression_method(CompressionMethod::Stored)
        .large_file(true);
    for file in listed_files(board) {
        archive
            .start_file(format!("{SOUNDS}/{file}"), stored)
            .map_err(failed)?;
        io::copy(
            &mut File::open(folder.join(file)).map_err(failed)?,
            &mut archive,
        )
        .map_err(failed)?;
    }
    archive.finish().map(drop).map_err(failed)
}

fn plain_name(file: &str) -> bool {
    let mut parts = Path::new(file).components();
    matches!(
        (parts.next(), parts.next()),
        (Some(Component::Normal(_)), None)
    )
}

/// Unpacks a board into `folder` under new names. Boards come from other people, so it only opens the files the board
/// lists, and only plain names.
pub fn read(path: &Path, folder: &Path) -> Result<Board, String> {
    let mut archive = ZipArchive::new(File::open(path).map_err(failed)?).map_err(failed)?;
    let mut manifest = String::new();
    archive
        .by_name(MANIFEST)
        .map_err(failed)?
        .read_to_string(&mut manifest)
        .map_err(failed)?;
    let mut board: Board = serde_json::from_str(&manifest).map_err(failed)?;
    if !listed_files(&board).all(plain_name) {
        return Err(t!(L10N, "error-board-damaged"));
    }
    let mut unpack = |file: &str, name: String| -> Result<String, String> {
        let mut entry = archive
            .by_name(&format!("{SOUNDS}/{file}"))
            .map_err(failed)?;
        io::copy(
            &mut entry,
            &mut File::create(folder.join(&name)).map_err(failed)?,
        )
        .map_err(failed)?;
        Ok(name)
    };
    for sound in &mut board.sounds {
        sound.id = new_id();
        let extension = |file: &str| {
            Path::new(file)
                .extension()
                .map(|extension| extension.to_string_lossy().into_owned())
                .unwrap_or_default()
        };
        sound.file = unpack(
            &sound.file,
            format!("{}.{}", sound.id, extension(&sound.file)),
        )?;
        if let Look::Picture(picture) = &sound.look {
            let unpacked = unpack(
                picture,
                format!("{}-picture.{}", new_id(), extension(picture)),
            )?;
            sound.look = Look::Picture(unpacked);
        }
    }
    Ok(board)
}
