/// Where a mask sits in the atlas, in texels.
#[derive(Clone, Copy)]
pub struct Slot {
    pub x: u32,
    pub y: u32,
    pub width: u32,
    pub height: u32,
}

/// One texture of coverage masks, glyphs and icons side by side, packed in
/// shelves.
pub struct Atlas {
    texture: wgpu::Texture,
    pub view: wgpu::TextureView,
    cursor: (u32, u32),
    shelf: u32,
}

impl Atlas {
    pub const SIZE: u32 = 2048;
    const GAP: u32 = 1;

    pub fn new(device: &wgpu::Device) -> Self {
        let texture = device.create_texture(&wgpu::TextureDescriptor {
            label: Some("masks"),
            size: wgpu::Extent3d {
                width: Self::SIZE,
                height: Self::SIZE,
                depth_or_array_layers: 1,
            },
            mip_level_count: 1,
            sample_count: 1,
            dimension: wgpu::TextureDimension::D2,
            format: wgpu::TextureFormat::R8Unorm,
            usage: wgpu::TextureUsages::TEXTURE_BINDING | wgpu::TextureUsages::COPY_DST,
            view_formats: &[],
        });
        let view = texture.create_view(&wgpu::TextureViewDescriptor::default());
        Self {
            texture,
            view,
            cursor: (Self::GAP, Self::GAP),
            shelf: 0,
        }
    }

    pub fn insert(
        &mut self,
        queue: &wgpu::Queue,
        width: u32,
        height: u32,
        coverage: &[u8],
    ) -> Slot {
        if self.cursor.0 + width + Self::GAP > Self::SIZE {
            self.cursor = (Self::GAP, self.cursor.1 + self.shelf + Self::GAP);
            self.shelf = 0;
        }
        assert!(
            self.cursor.1 + height + Self::GAP <= Self::SIZE,
            "the mask atlas is full"
        );
        let slot = Slot {
            x: self.cursor.0,
            y: self.cursor.1,
            width,
            height,
        };
        self.cursor.0 += width + Self::GAP;
        self.shelf = self.shelf.max(height);
        if width > 0 && height > 0 {
            queue.write_texture(
                wgpu::TexelCopyTextureInfo {
                    texture: &self.texture,
                    mip_level: 0,
                    origin: wgpu::Origin3d {
                        x: slot.x,
                        y: slot.y,
                        z: 0,
                    },
                    aspect: wgpu::TextureAspect::All,
                },
                coverage,
                wgpu::TexelCopyBufferLayout {
                    offset: 0,
                    bytes_per_row: Some(width),
                    rows_per_image: Some(height),
                },
                wgpu::Extent3d {
                    width,
                    height,
                    depth_or_array_layers: 1,
                },
            );
        }
        slot
    }
}
