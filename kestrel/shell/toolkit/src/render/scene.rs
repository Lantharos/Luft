use bytemuck::{Pod, Zeroable};

use super::atlas::{Atlas, Slot};
use crate::color::Color;

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
pub struct Instance {
    rect: [f32; 4],
    uv: [f32; 4],
    color: [f32; 4],
    shape: [f32; 4],
}

/// A rectangle in physical pixels.
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Rect {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
}

impl Rect {
    pub fn contains(&self, x: f32, y: f32) -> bool {
        x >= self.x && y >= self.y && x < self.x + self.width && y < self.y + self.height
    }
}

/// What one frame draws, back to front.
#[derive(Default)]
pub struct Scene {
    pub(super) instances: Vec<Instance>,
}

impl Scene {
    pub fn clear(&mut self) {
        self.instances.clear();
    }

    pub fn fill(&mut self, rect: Rect, radius: f32, color: Color) {
        if color.a <= 0.0 {
            return;
        }
        self.instances.push(Instance {
            rect: [rect.x, rect.y, rect.width, rect.height],
            uv: [0.0; 4],
            color: color.array(),
            shape: [radius, 0.0, 0.0, 0.0],
        });
    }

    pub fn mask(&mut self, x: f32, y: f32, slot: Slot, color: Color) {
        let size = Atlas::SIZE as f32;
        self.instances.push(Instance {
            rect: [x, y, slot.width as f32, slot.height as f32],
            uv: [
                slot.x as f32 / size,
                slot.y as f32 / size,
                (slot.x + slot.width) as f32 / size,
                (slot.y + slot.height) as f32 / size,
            ],
            color: color.array(),
            shape: [0.0, 1.0, 0.0, 0.0],
        });
    }
}
