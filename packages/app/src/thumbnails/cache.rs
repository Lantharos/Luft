use std::fs::{self, File, OpenOptions};
use std::io::{self, BufReader, BufWriter, Read, Seek, SeekFrom};
use std::os::unix::fs::{MetadataExt, OpenOptionsExt};
use std::path::{Path, PathBuf};
use std::sync::OnceLock;

use image::RgbaImage;
use md5::{Digest, Md5};
use serde::Deserialize;

const FAIL_FOLDER: &str = concat!("fail/luft-", env!("CARGO_PKG_VERSION"));
const PNG_SIGNATURE: &[u8; 8] = b"\x89PNG\r\n\x1a\n";
const URI_KEY: &str = "Thumb::URI";
const MTIME_KEY: &str = "Thumb::MTime";

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ThumbnailSize {
    Normal,
    Large,
    XLarge,
    XxLarge,
}

impl ThumbnailSize {
    const ALL: [Self; 4] = [Self::Normal, Self::Large, Self::XLarge, Self::XxLarge];

    pub fn pixels(self) -> u32 {
        match self {
            Self::Normal => 128,
            Self::Large => 256,
            Self::XLarge => 512,
            Self::XxLarge => 1024,
        }
    }

    fn folder(self) -> &'static str {
        match self {
            Self::Normal => "normal",
            Self::Large => "large",
            Self::XLarge => "x-large",
            Self::XxLarge => "xx-large",
        }
    }
}

pub struct Source {
    pub path: PathBuf,
    pub uri: String,
    pub mtime: i64,
    pub bytes: u64,
    hash: String,
}

impl Source {
    pub fn new(path: PathBuf) -> Option<Self> {
        let metadata = fs::metadata(&path).ok()?;
        if !metadata.is_file() {
            return None;
        }
        let uri = gio::glib::filename_to_uri(&path, None).ok()?.to_string();
        let hash = Md5::digest(uri.as_bytes())
            .iter()
            .map(|byte| format!("{byte:02x}"))
            .collect();
        Some(Self {
            path,
            uri,
            mtime: metadata.mtime(),
            bytes: metadata.len(),
            hash,
        })
    }

    pub fn is_cache_file(&self) -> bool {
        self.path.starts_with(root())
    }
}

pub fn lookup(source: &Source, size: ThumbnailSize) -> Option<PathBuf> {
    ThumbnailSize::ALL
        .into_iter()
        .filter(|candidate| *candidate >= size)
        .map(|candidate| entry(candidate.folder(), source))
        .find(|path| matches(path, source))
}

pub fn has_failed(source: &Source) -> bool {
    matches(&entry(FAIL_FOLDER, source), source)
}

pub fn store(source: &Source, size: ThumbnailSize, image: &RgbaImage) -> Result<PathBuf, String> {
    let path = entry(size.folder(), source);
    write(&path, source, image)?;
    Ok(path)
}

pub fn mark_failed(source: &Source) {
    let _ = write(&entry(FAIL_FOLDER, source), source, &RgbaImage::new(1, 1));
}

fn root() -> &'static Path {
    static ROOT: OnceLock<PathBuf> = OnceLock::new();
    ROOT.get_or_init(|| {
        dirs::cache_dir()
            .unwrap_or_else(std::env::temp_dir)
            .join("thumbnails")
    })
}

fn entry(folder: &str, source: &Source) -> PathBuf {
    root().join(folder).join(format!("{}.png", source.hash))
}

fn matches(path: &Path, source: &Source) -> bool {
    let Ok(file) = File::open(path) else {
        return false;
    };
    let mut uri = None;
    let mut mtime = None;
    let _ = read_text(BufReader::new(file), |key, value| match key {
        URI_KEY => uri = Some(value == source.uri),
        MTIME_KEY => mtime = Some(value.parse::<i64>().ok() == Some(source.mtime)),
        _ => {}
    });
    uri == Some(true) && mtime == Some(true)
}

fn read_text(mut reader: impl Read + Seek, mut visit: impl FnMut(&str, &str)) -> io::Result<()> {
    let mut signature = [0_u8; 8];
    reader.read_exact(&mut signature)?;
    if &signature != PNG_SIGNATURE {
        return Ok(());
    }
    let mut header = [0_u8; 8];
    loop {
        reader.read_exact(&mut header)?;
        let length = u32::from_be_bytes([header[0], header[1], header[2], header[3]]) as usize;
        match &header[4..] {
            b"tEXt" => {
                let mut data = vec![0_u8; length];
                reader.read_exact(&mut data)?;
                if let Some(split) = data.iter().position(|byte| *byte == 0) {
                    let key = String::from_utf8_lossy(&data[..split]);
                    let value = String::from_utf8_lossy(&data[split + 1..]);
                    visit(&key, &value);
                }
                reader.seek(SeekFrom::Current(4))?;
            }
            b"IDAT" | b"IEND" => return Ok(()),
            _ => {
                reader.seek(SeekFrom::Current(length as i64 + 4))?;
            }
        }
    }
}

fn write(path: &Path, source: &Source, image: &RgbaImage) -> Result<(), String> {
    let folder = path.parent().ok_or("Invalid thumbnail path")?;
    fs::create_dir_all(folder).map_err(|error| error.to_string())?;
    let temporary = folder.join(format!(".{}.luft-{}", source.hash, std::process::id()));
    let result = encode(&temporary, source, image)
        .and_then(|()| fs::rename(&temporary, path).map_err(|error| error.to_string()));
    if result.is_err() {
        let _ = fs::remove_file(&temporary);
    }
    result
}

fn encode(path: &Path, source: &Source, image: &RgbaImage) -> Result<(), String> {
    let file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .mode(0o600)
        .open(path)
        .map_err(|error| error.to_string())?;
    let mut encoder = png::Encoder::new(BufWriter::new(file), image.width(), image.height());
    encoder.set_color(png::ColorType::Rgba);
    encoder.set_depth(png::BitDepth::Eight);
    encoder.set_compression(png::Compression::Fast);
    let text = [
        (URI_KEY, source.uri.clone()),
        (MTIME_KEY, source.mtime.to_string()),
        ("Thumb::Size", source.bytes.to_string()),
        ("Software", "Luft".to_string()),
    ];
    for (key, value) in text {
        encoder
            .add_text_chunk(key.to_string(), value)
            .map_err(|error| error.to_string())?;
    }
    let mut writer = encoder.write_header().map_err(|error| error.to_string())?;
    writer
        .write_image_data(image.as_raw())
        .map_err(|error| error.to_string())?;
    writer.finish().map_err(|error| error.to_string())
}
