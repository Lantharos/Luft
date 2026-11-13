use std::sync::LazyLock;

use regex::Regex;

/// What kind of picture a file is and how big.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Image {
    pub extension: &'static str,
    pub width: u32,
    pub height: u32,
}

const SVG_SIZE: u32 = 512;

static SVG_START: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]").unwrap()
});
static SVG_FORBIDDEN: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?i)<script|<foreignObject|\son[a-z]+\s*=|javascript:").unwrap());

fn be16(bytes: &[u8], at: usize) -> u32 {
    u32::from(u16::from_be_bytes([bytes[at], bytes[at + 1]]))
}

fn le16(bytes: &[u8], at: usize) -> u32 {
    u32::from(u16::from_le_bytes([bytes[at], bytes[at + 1]]))
}

fn png(bytes: &[u8]) -> Option<Image> {
    const SIGNATURE: [u8; 8] = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    if bytes.len() < 24 || bytes[..8] != SIGNATURE {
        return None;
    }
    let word =
        |at: usize| u32::from_be_bytes([bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]]);
    Some(Image {
        extension: "png",
        width: word(16),
        height: word(20),
    })
}

fn jpeg(bytes: &[u8]) -> Option<Image> {
    if bytes.len() < 2 || bytes[0] != 0xff || bytes[1] != 0xd8 {
        return None;
    }
    let mut offset = 2;
    while offset + 9 < bytes.len() {
        if bytes[offset] != 0xff {
            return None;
        }
        let marker = bytes[offset + 1];
        let length = be16(bytes, offset + 2) as usize;
        if (0xc0..=0xcf).contains(&marker) && ![0xc4, 0xc8, 0xcc].contains(&marker) {
            return Some(Image {
                extension: "jpg",
                height: be16(bytes, offset + 5),
                width: be16(bytes, offset + 7),
            });
        }
        offset += 2 + length;
    }
    None
}

fn webp(bytes: &[u8]) -> Option<Image> {
    if bytes.len() < 30 || &bytes[0..4] != b"RIFF" || &bytes[8..12] != b"WEBP" {
        return None;
    }
    let image = |width, height| Image {
        extension: "webp",
        width,
        height,
    };
    match &bytes[12..16] {
        b"VP8X" => {
            let three = |at: usize| {
                1 + (u32::from(bytes[at])
                    | u32::from(bytes[at + 1]) << 8
                    | u32::from(bytes[at + 2]) << 16)
            };
            Some(image(three(24), three(27)))
        }
        b"VP8L" => {
            let bits = u32::from_le_bytes([bytes[21], bytes[22], bytes[23], bytes[24]]);
            Some(image(1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff)))
        }
        b"VP8 " => Some(image(le16(bytes, 26) & 0x3fff, le16(bytes, 28) & 0x3fff)),
        _ => None,
    }
}

fn svg(bytes: &[u8]) -> Option<Image> {
    let text = String::from_utf8_lossy(bytes);
    (SVG_START.is_match(&text) && !SVG_FORBIDDEN.is_match(&text)).then_some(Image {
        extension: "svg",
        width: SVG_SIZE,
        height: SVG_SIZE,
    })
}

/// Reads what picture `bytes` hold: PNG, JPEG, WebP, and SVG when it's allowed.
pub fn sniff_image(bytes: &[u8], allow_svg: bool) -> Option<Image> {
    png(bytes)
        .or_else(|| jpeg(bytes))
        .or_else(|| webp(bytes))
        .or_else(|| allow_svg.then(|| svg(bytes)).flatten())
}
