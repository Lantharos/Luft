use std::fs::File;
use std::path::Path;

use glib::{Bytes, Variant, VariantDict, VariantTy};
use luft_software::apps::appimage::{Icon, IconSize};
use memmap2::Mmap;

const MAGICS: [&[u8]; 2] = [b"flatpak\0\x01\0\x89\xe5", b"xdg-app\0\x01\0\x89\xe5"];
const SUPERBLOCK: &str = "(a{sv}tayay(a(uayttay)a(yaytt)))";
const ICON_KEYS: [&str; 2] = ["icon-128", "icon-64"];

pub fn is_bundle(head: &[u8]) -> bool {
    MAGICS.iter().any(|magic| head.starts_with(magic))
}

pub fn icons(path: &Path) -> Result<Vec<Icon>, String> {
    let file = File::open(path).map_err(|error| error.to_string())?;
    let mapped = unsafe { Mmap::map(&file) }.map_err(|error| error.to_string())?;
    let superblock = Variant::from_bytes_with_type(
        &Bytes::from_owned(mapped),
        VariantTy::new(SUPERBLOCK).map_err(|error| error.to_string())?,
    );
    let metadata = VariantDict::new(Some(&superblock.child_value(0)));
    Ok(ICON_KEYS
        .iter()
        .filter_map(|key| metadata.lookup_value(key, Some(VariantTy::BYTE_STRING)))
        .filter_map(|icon| {
            let bytes = icon.fixed_array::<u8>().ok()?.to_vec();
            Some(Icon {
                size: IconSize::of_png(&bytes)?,
                bytes,
                extension: "png",
            })
        })
        .collect())
}
