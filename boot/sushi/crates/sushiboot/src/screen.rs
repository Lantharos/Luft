use alloc::sync::Arc;
use alloc::vec::Vec;

use sushi_scene::tiny_skia::{Pixmap, PixmapMut};
use sushi_scene::{FirmwareLogo, Rect, Scene, Visuals};
use uefi::boot::ScopedProtocol;
use uefi::proto::console::gop::{BltOp, BltPixel, BltRegion, GraphicsOutput};

use crate::bgrt;

pub struct Screen {
    gop: ScopedProtocol<GraphicsOutput>,
    pub scene: Scene,
}

impl Screen {
    pub fn new(gop: ScopedProtocol<GraphicsOutput>) -> Self {
        let (width, height) = gop.current_mode_info().resolution();
        let (width, height) = (width as u32, height as u32);
        let logo = bgrt::load().map(|logo| {
            let placement = FirmwareLogo {
                x: logo.x,
                y: logo.y,
                width: logo.image.width(),
                height: logo.image.height(),
                screen_width: width,
                screen_height: height,
            };
            (Arc::new(logo.image), placement)
        });
        Self {
            gop,
            scene: Scene::new(width, height, logo),
        }
    }

    pub fn draw(
        &mut self,
        area: Rect,
        visuals: &Visuals,
        overlay: impl FnOnce(&mut PixmapMut, (i32, i32)),
    ) {
        let Some(area) = area.clamp_to(self.scene.layout.width, self.scene.layout.height) else {
            return;
        };
        let Some(mut pixmap) = self.scene.render(area, visuals) else {
            return;
        };
        overlay(&mut pixmap.as_mut(), (area.x, area.y));
        self.present(area, &pixmap);
    }

    fn present(&mut self, area: Rect, pixmap: &Pixmap) {
        let pixels: Vec<BltPixel> = pixmap
            .pixels()
            .iter()
            .map(|pixel| BltPixel::new(pixel.red(), pixel.green(), pixel.blue()))
            .collect();
        let _ = self.gop.blt(BltOp::BufferToVideo {
            buffer: &pixels,
            src: BltRegion::Full,
            dest: (area.x as usize, area.y as usize),
            dims: (area.width as usize, area.height as usize),
        });
    }
}
