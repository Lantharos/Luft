use std::fs;
use std::path::Path;

const WOFF: &[u8; 4] = b"wOFF";
const WOFF2: &[u8; 4] = b"wOF2";
const COLLECTION: &[u8; 4] = b"ttcf";
const CFF: &[u8; 4] = b"OTTO";

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Container {
    Sfnt,
    Woff,
    Woff2,
}

pub struct FontData {
    pub bytes: Vec<u8>,
    pub container: Container,
}

impl FontData {
    pub fn read(path: &Path) -> Result<Self, String> {
        let raw = fs::read(path).map_err(|error| error.to_string())?;
        let damaged = |_| "This font file is damaged".to_string();
        let (bytes, container) = match raw.get(..4) {
            Some(magic) if magic == WOFF => (
                wuff::decompress_woff1(&raw).map_err(damaged)?,
                Container::Woff,
            ),
            Some(magic) if magic == WOFF2 => (
                wuff::decompress_woff2(&raw).map_err(damaged)?,
                Container::Woff2,
            ),
            _ => (raw, Container::Sfnt),
        };
        Ok(Self { bytes, container })
    }

    pub fn is_collection(&self) -> bool {
        self.bytes.starts_with(COLLECTION)
    }

    pub fn extension(&self) -> &'static str {
        if self.is_collection() {
            "ttc"
        } else if self.bytes.starts_with(CFF) {
            "otf"
        } else {
            "ttf"
        }
    }

    pub fn format(&self) -> &'static str {
        match (
            self.container,
            self.is_collection(),
            self.bytes.starts_with(CFF),
        ) {
            (Container::Woff2, ..) => "WOFF2",
            (Container::Woff, ..) => "WOFF",
            (_, true, _) => "Font collection",
            (_, _, true) => "OpenType",
            _ => "TrueType",
        }
    }
}
