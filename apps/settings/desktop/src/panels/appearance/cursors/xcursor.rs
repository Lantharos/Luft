use image::RgbaImage;

const MAGIC: &[u8; 4] = b"Xcur";
const IMAGE_CHUNK: u32 = 0xfffd0002;
const FILE_HEADER: usize = 16;
const TOC_ENTRY: usize = 12;
const IMAGE_HEADER: usize = 36;
const MAX_DIMENSION: u32 = 0x7fff;

fn word(bytes: &[u8], offset: usize) -> Option<u32> {
    let slice = bytes.get(offset..offset + 4)?;
    Some(u32::from_le_bytes(slice.try_into().ok()?))
}

fn unpremultiply(channel: u8, alpha: u8) -> u8 {
    ((channel as u32 * 255 + alpha as u32 / 2) / alpha as u32).min(255) as u8
}

fn image_at(bytes: &[u8], position: usize) -> Option<RgbaImage> {
    let (width, height) = (word(bytes, position + 16)?, word(bytes, position + 20)?);
    if width == 0 || height == 0 || width > MAX_DIMENSION || height > MAX_DIMENSION {
        return None;
    }
    let start = position + IMAGE_HEADER;
    let pixels = bytes.get(start..start + width as usize * height as usize * 4)?;
    let rgba = pixels
        .as_chunks::<4>()
        .0
        .iter()
        .flat_map(|bgra| match bgra[3] {
            0 => [0; 4],
            alpha => [
                unpremultiply(bgra[2], alpha),
                unpremultiply(bgra[1], alpha),
                unpremultiply(bgra[0], alpha),
                alpha,
            ],
        })
        .collect();
    RgbaImage::from_raw(width, height, rgba)
}

pub fn closest_image(bytes: &[u8], size: u32) -> Option<RgbaImage> {
    if bytes.get(..4)? != MAGIC {
        return None;
    }
    let count = word(bytes, 12)? as usize;
    let (_, position) = (0..count)
        .filter_map(|index| {
            let entry = FILE_HEADER + index * TOC_ENTRY;
            (word(bytes, entry)? == IMAGE_CHUNK)
                .then(|| Some((word(bytes, entry + 4)?, word(bytes, entry + 8)? as usize)))
                .flatten()
        })
        .min_by_key(|(nominal, _)| (nominal.abs_diff(size), u32::MAX - nominal))?;
    image_at(bytes, position)
}
