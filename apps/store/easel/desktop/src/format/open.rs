use luft_i18n::t;
use std::fs::{self, File};
use std::io::Read;
use std::path::Path;

use serde::Serialize;
use serde_json::Value;
use specta::Type;
use zip::ZipArchive;

use super::{DOCUMENT, MASK_TILE_BYTES, MIME, PREVIEW, TILE_BYTES, tiles};
use crate::files::{cache_file, failed};
use crate::l10n::L10N;

#[derive(Serialize, Type)]
pub struct LayerPixels {
    layer: String,
    file: String,
    indices: Vec<u32>,
    mask: bool,
}

#[derive(Serialize, Type)]
pub struct AssetFile {
    name: String,
    file: String,
}

#[derive(Serialize, Type)]
pub struct Opened {
    document: Value,
    layers: Vec<LayerPixels>,
    assets: Vec<AssetFile>,
}

fn read_entry(archive: &mut ZipArchive<File>, index: usize) -> Result<(String, Vec<u8>), String> {
    let mut entry = archive.by_index(index).map_err(failed)?;
    let mut data = Vec::with_capacity(entry.size() as usize);
    entry.read_to_end(&mut data).map_err(failed)?;
    Ok((entry.name().map_err(failed)?.into_owned(), data))
}

fn archive(path: &Path) -> Result<ZipArchive<File>, String> {
    let mut archive = ZipArchive::new(File::open(path).map_err(failed)?).map_err(failed)?;
    let (_, mime) = read_entry(&mut archive, 0)?;
    if mime != MIME.as_bytes() {
        return Err(t!(L10N, "easel-error-not-document"));
    }
    Ok(archive)
}

fn grid_name(name: &str) -> Option<(&str, bool)> {
    let (folder, rest) = name.split_once('/')?;
    let layer = rest.strip_suffix(".tiles")?;
    match folder {
        "layers" => Some((layer, false)),
        "masks" => Some((layer, true)),
        _ => None,
    }
}

pub fn open(path: &Path) -> Result<Opened, String> {
    let mut archive = archive(path)?;
    let mut document = Value::Null;
    let mut layers = Vec::new();
    let mut assets = Vec::new();
    for index in 1..archive.len() {
        let (name, data) = read_entry(&mut archive, index)?;
        if name == DOCUMENT {
            document = serde_json::from_slice(&data).map_err(failed)?;
        } else if let Some((layer, mask)) = grid_name(&name) {
            let (indices, pixels) =
                tiles::decode(&data, if mask { MASK_TILE_BYTES } else { TILE_BYTES })?;
            let file = cache_file("tiles")?;
            fs::write(&file, pixels).map_err(failed)?;
            layers.push(LayerPixels {
                layer: layer.to_string(),
                file: file.to_string_lossy().into_owned(),
                indices,
                mask,
            });
        } else if let Some(asset) = name.strip_prefix("assets/") {
            let file = cache_file(asset)?;
            fs::write(&file, data).map_err(failed)?;
            assets.push(AssetFile {
                name: asset.to_string(),
                file: file.to_string_lossy().into_owned(),
            });
        }
    }
    Ok(Opened {
        document,
        layers,
        assets,
    })
}

pub fn preview(path: &Path) -> Result<String, String> {
    let mut archive = archive(path)?;
    let mut entry = archive.by_name(PREVIEW).map_err(failed)?;
    let mut data = Vec::new();
    entry.read_to_end(&mut data).map_err(failed)?;
    let file = cache_file("preview.png")?;
    fs::write(&file, data).map_err(failed)?;
    Ok(file.to_string_lossy().into_owned())
}
