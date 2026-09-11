use std::{collections::HashMap, io::Read, sync::Arc, time::Duration};

use tracing::warn;
use xcursor::{
    CursorTheme,
    parser::{Image, parse_xcursor},
};

static FALLBACK_CURSOR_DATA: &[u8] = include_bytes!("../resources/cursor.rgba");

pub struct Cursor {
    icons: HashMap<String, Vec<Arc<Image>>>,
    theme: CursorTheme,
    size: u32,
}

impl Cursor {
    pub fn load() -> Cursor {
        let name = std::env::var("XCURSOR_THEME")
            .ok()
            .unwrap_or_else(|| "default".into());
        let size = std::env::var("XCURSOR_SIZE")
            .ok()
            .and_then(|s| s.parse().ok())
            .unwrap_or(24);

        let theme = CursorTheme::load(&name);
        let icons = load_icon(&theme, "default")
            .map_err(|err| warn!("Unable to load xcursor: {}, using fallback cursor", err))
            .unwrap_or_else(|_| {
                vec![Image {
                    size: 32,
                    width: 64,
                    height: 64,
                    xhot: 1,
                    yhot: 1,
                    delay: 1,
                    pixels_rgba: Vec::from(FALLBACK_CURSOR_DATA),
                    pixels_argb: vec![], //unused
                }]
            });

        Cursor {
            icons: HashMap::from([("default".into(), icons.into_iter().map(Arc::new).collect())]),
            theme,
            size,
        }
    }

    pub fn get_image(&mut self, name: &str, scale: u32, time: Duration) -> Arc<Image> {
        if !self.icons.contains_key(name) {
            let images = load_icon(&self.theme, name)
                .map(|images| images.into_iter().map(Arc::new).collect())
                .unwrap_or_else(|_| self.icons["default"].clone());
            self.icons.insert(name.to_owned(), images);
        }
        frame(
            time.as_millis() as u32,
            self.size * scale,
            &self.icons[name],
        )
    }
}

fn nearest_images(size: u32, images: &[Arc<Image>]) -> impl Iterator<Item = &Arc<Image>> {
    // Follow the nominal size of the cursor to choose the nearest
    let nearest_image = images
        .iter()
        .min_by_key(|image| (size as i32 - image.size as i32).abs())
        .unwrap();

    images.iter().filter(move |image| {
        image.width == nearest_image.width && image.height == nearest_image.height
    })
}

fn frame(mut millis: u32, size: u32, images: &[Arc<Image>]) -> Arc<Image> {
    let total = nearest_images(size, images).fold(0, |acc, image| acc + image.delay);
    if total == 0 {
        return nearest_images(size, images).next().unwrap().clone();
    }
    millis %= total;

    for img in nearest_images(size, images) {
        if millis < img.delay {
            return img.clone();
        }
        millis -= img.delay;
    }

    unreachable!()
}

#[derive(thiserror::Error, Debug)]
enum Error {
    #[error("Theme has no default cursor")]
    NoDefaultCursor,
    #[error("Error opening xcursor file: {0}")]
    File(#[from] std::io::Error),
    #[error("Failed to parse XCursor file")]
    Parse,
}

fn load_icon(theme: &CursorTheme, name: &str) -> Result<Vec<Image>, Error> {
    let icon_path = theme.load_icon(name).ok_or(Error::NoDefaultCursor)?;
    let mut cursor_file = std::fs::File::open(icon_path)?;
    let mut cursor_data = Vec::new();
    cursor_file.read_to_end(&mut cursor_data)?;
    parse_xcursor(&cursor_data)
        .filter(|images| !images.is_empty())
        .ok_or(Error::Parse)
}
