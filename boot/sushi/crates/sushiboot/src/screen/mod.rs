mod bgrt;
mod mode;

use alloc::sync::Arc;
use alloc::vec::Vec;

use sushi_scene::tiny_skia::{Pixmap, PixmapMut, Transform};
use sushi_scene::{FirmwareLogo, Rect, Scene, Visuals};
use uefi::Handle;
use uefi::boot::ScopedProtocol;
use uefi::proto::console::gop::{BltOp, BltPixel, BltRegion, GraphicsOutput};

pub struct Screen {
    gop: ScopedProtocol<GraphicsOutput>,
    pub scene: Scene,
}

fn resolution(gop: &GraphicsOutput) -> (u32, u32) {
    let (width, height) = gop.current_mode_info().resolution();
    (width as u32, height as u32)
}

impl Screen {
    pub fn new(handle: Handle, mut gop: ScopedProtocol<GraphicsOutput>) -> Self {
        let framebuffer = resolution(&gop);
        let monitor = mode::monitor(handle);
        let switched = monitor
            .as_ref()
            .is_some_and(|monitor| mode::switch_to_best(&mut gop, monitor));
        let native = monitor.map(|monitor| monitor.native);
        let size = resolution(&gop);
        let logo = bgrt::load().map(|logo| {
            let placement = FirmwareLogo::infer(
                (logo.x, logo.y),
                (logo.image.width(), logo.image.height()),
                framebuffer,
                native,
            );
            (Arc::new(logo.image), placement)
        });
        let mut screen = Self {
            gop,
            scene: Scene::new(size, native.unwrap_or(size), logo),
        };
        if switched {
            let logo = Visuals {
                logo: 1.0,
                ..Visuals::default()
            };
            screen.draw(screen.scene.everything(), &logo, |_, _| {});
        }
        screen
    }

    pub fn draw(
        &mut self,
        area: Rect,
        visuals: &Visuals,
        overlay: impl FnOnce(&mut PixmapMut, Transform),
    ) {
        let (width, height) = self.scene.size();
        let Some(area) = area.clamp_to(width, height) else {
            return;
        };
        let Some(mut pixmap) = self.scene.render(area, visuals) else {
            return;
        };
        overlay(&mut pixmap.as_mut(), self.scene.view(area));
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
