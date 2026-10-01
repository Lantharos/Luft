use std::path::Path;
use std::sync::Arc;

use sushi_scene::FirmwareLogo;
use sushi_scene::tiny_skia::Pixmap;

const BGRT: &str = "/sys/firmware/acpi/bgrt";

#[derive(Clone)]
pub struct Logo {
    image: Arc<Pixmap>,
    x: i32,
    y: i32,
}

impl Logo {
    pub fn from_firmware() -> Option<Self> {
        let read = |name: &str| {
            std::fs::read_to_string(Path::new(BGRT).join(name))
                .ok()?
                .trim()
                .parse::<i32>()
                .ok()
        };
        if read("status")? & 1 == 0 {
            return None;
        }
        let image = sushi_scene::decode_bmp(&std::fs::read(Path::new(BGRT).join("image")).ok()?)?;
        Some(Self {
            image: Arc::new(image),
            x: read("xoffset")?,
            y: read("yoffset")?,
        })
    }

    pub fn on_screen(&self, width: u32, height: u32) -> (Arc<Pixmap>, FirmwareLogo) {
        let placement = FirmwareLogo {
            x: self.x,
            y: self.y,
            width: self.image.width(),
            height: self.image.height(),
            screen_width: width,
            screen_height: height,
        };
        (self.image.clone(), placement)
    }
}
