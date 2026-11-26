use std::fs;
use std::path::Path;

use psd::Psd;
use rayon::prelude::*;
use serde::Serialize;
use specta::Type;

use super::premultiply;
use crate::files::{cache_file, failed};

#[derive(Serialize, Type)]
pub struct ImportedLayer {
    file: String,
    name: String,
    opacity: f64,
    visible: bool,
    blend: &'static str,
}

#[derive(Serialize, Type)]
pub struct Layered {
    width: u32,
    height: u32,
    layers: Vec<ImportedLayer>,
}

fn blend(mode: impl std::fmt::Debug) -> &'static str {
    match format!("{mode:?}").as_str() {
        "Multiply" => "multiply",
        "Screen" => "screen",
        "Overlay" => "overlay",
        "Darken" => "darken",
        "Lighten" => "lighten",
        "ColorDodge" => "color-dodge",
        "ColorBurn" => "color-burn",
        "HardLight" => "hard-light",
        "SoftLight" => "soft-light",
        "Difference" => "difference",
        "LinearDodge" => "add",
        _ => "normal",
    }
}

fn shown(psd: &Psd, hidden_bit: bool, mut group: Option<u32>) -> bool {
    if hidden_bit {
        return false;
    }
    while let Some(id) = group {
        let Some(parent) = psd.groups().get(&id) else {
            return true;
        };
        if parent.visible() {
            return false;
        }
        group = parent.parent_id();
    }
    true
}

fn written(mut rgba: Vec<u8>) -> Result<String, String> {
    premultiply(&mut rgba);
    let target = cache_file("layer")?;
    fs::write(&target, rgba).map_err(failed)?;
    Ok(target.to_string_lossy().into_owned())
}

pub fn open_psd(path: &Path) -> Result<Layered, String> {
    let psd = Psd::from_bytes(&fs::read(path).map_err(failed)?).map_err(failed)?;
    let layers = if psd.layers().is_empty() {
        vec![ImportedLayer {
            file: written(psd.rgba())?,
            name: String::new(),
            opacity: 1.0,
            visible: true,
            blend: "normal",
        }]
    } else {
        psd.layers()
            .par_iter()
            .rev()
            .map(|layer| {
                Ok(ImportedLayer {
                    file: written(layer.rgba())?,
                    name: layer.name().to_string(),
                    opacity: f64::from(layer.opacity()) / 255.0,
                    visible: shown(&psd, layer.visible(), layer.parent_id()),
                    blend: blend(layer.blend_mode()),
                })
            })
            .collect::<Result<_, String>>()?
    };
    Ok(Layered {
        width: psd.width(),
        height: psd.height(),
        layers,
    })
}
