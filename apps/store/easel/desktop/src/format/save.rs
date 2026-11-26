use luft_i18n::t;
use std::collections::BTreeMap;
use std::fs::File;
use std::io::Write;
use std::path::PathBuf;

use serde::Deserialize;
use serde_json::Value;
use specta::Type;
use zip::write::SimpleFileOptions;
use zip::{CompressionMethod, ZipWriter};

use super::tiles::{self, Tile};
use super::{DOCUMENT, MASK_TILE_BYTES, MIME, PREVIEW, TILE_BYTES};
use crate::files::{failed, write_atomically};
use crate::l10n::L10N;
use crate::picture::encode;

pub struct Save {
    path: PathBuf,
    document: Value,
    layers: BTreeMap<String, Vec<Tile>>,
    masks: BTreeMap<String, Vec<Tile>>,
    assets: BTreeMap<String, Vec<u8>>,
    preview: Option<(u32, u32, Vec<u8>)>,
}

#[derive(Deserialize, Type)]
pub struct Begin {
    pub path: String,
    pub document: Value,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Tiles {
    pub id: u32,
    pub layer: String,
    pub indices: Vec<u32>,
    pub mask: bool,
}

#[derive(Deserialize, Type)]
pub struct Asset {
    pub id: u32,
    pub name: String,
}

#[derive(Deserialize, Type)]
pub struct Preview {
    pub id: u32,
    pub width: u32,
    pub height: u32,
}

fn safe(name: &str) -> Result<&str, String> {
    let fine = !name.is_empty()
        && name
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | '.'))
        && !name.starts_with('.');
    fine.then_some(name)
        .ok_or_else(|| t!(L10N, "easel-error-bad-name", name = name))
}

impl Save {
    pub fn new(Begin { path, document }: Begin) -> Self {
        Self {
            path: PathBuf::from(path),
            document,
            layers: BTreeMap::new(),
            masks: BTreeMap::new(),
            assets: BTreeMap::new(),
            preview: None,
        }
    }

    pub fn add_tiles(
        &mut self,
        layer: &str,
        indices: &[u32],
        raw: &[u8],
        mask: bool,
    ) -> Result<(), String> {
        let compressed = tiles::compress(
            indices,
            raw,
            if mask { MASK_TILE_BYTES } else { TILE_BYTES },
        )?;
        let grids = if mask {
            &mut self.masks
        } else {
            &mut self.layers
        };
        grids
            .entry(safe(layer)?.to_string())
            .or_default()
            .extend(compressed);
        Ok(())
    }

    pub fn add_asset(&mut self, name: &str, data: Vec<u8>) -> Result<(), String> {
        self.assets.insert(safe(name)?.to_string(), data);
        Ok(())
    }

    pub fn set_preview(&mut self, width: u32, height: u32, data: Vec<u8>) {
        self.preview = Some((width, height, data));
    }

    pub fn write(self) -> Result<(), String> {
        let stored = SimpleFileOptions::default().compression_method(CompressionMethod::Stored);
        let deflated = SimpleFileOptions::default().compression_method(CompressionMethod::Deflated);
        let preview = self
            .preview
            .map(|(width, height, mut pixels)| {
                encode::unpremultiply(&mut pixels);
                encode::png(width, height, &pixels)
            })
            .transpose()?;
        write_atomically(&self.path, |file: &mut File| {
            let mut zip = ZipWriter::new(file);
            let mut put =
                |name: &str, options: SimpleFileOptions, data: &[u8]| -> Result<(), String> {
                    zip.start_file(name, options).map_err(failed)?;
                    zip.write_all(data).map_err(failed)
                };
            put("mimetype", stored, MIME.as_bytes())?;
            put(
                DOCUMENT,
                deflated,
                &serde_json::to_vec_pretty(&self.document).map_err(failed)?,
            )?;
            for (layer, tiles) in &self.masks {
                put(
                    &format!("masks/{layer}.tiles"),
                    stored,
                    &tiles::encode(tiles),
                )?;
            }
            for (layer, tiles) in &self.layers {
                put(
                    &format!("layers/{layer}.tiles"),
                    stored,
                    &tiles::encode(tiles),
                )?;
            }
            for (name, data) in &self.assets {
                put(&format!("assets/{name}"), stored, data)?;
            }
            if let Some(preview) = &preview {
                put(PREVIEW, stored, preview)?;
            }
            zip.finish().map_err(failed)?;
            Ok(())
        })
    }
}
