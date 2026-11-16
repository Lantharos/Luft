use std::borrow::Cow;
use std::collections::HashMap;
use std::rc::Rc;
use std::sync::Arc;

use parley::fontique::Blob;
use parley::{
    FontContext, FontFamily, FontWeight, Layout, LayoutContext, PositionedLayoutItem, StyleProperty,
};
use swash::FontRef;
use swash::scale::{Render, ScaleContext, Source};
use swash::zeno::{Format, Vector};

use crate::color::Color;
use crate::render::{Gpu, Scene, Slot};

const FAMILY: &str = "Open Runde";
const FONTS: [&[u8]; 3] = [
    include_bytes!("../../../engine/data/fonts/OpenRunde-Regular.otf"),
    include_bytes!("../../../engine/data/fonts/OpenRunde-Medium.otf"),
    include_bytes!("../../../engine/data/fonts/OpenRunde-Semibold.otf"),
];
const SUBPIXEL_STEPS: f32 = 4.0;

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct TextStyle {
    pub size: f32,
    pub weight: f32,
    pub color: Color,
}

#[derive(Clone, Eq, Hash, PartialEq)]
struct LayoutKey {
    text: String,
    size: u32,
    weight: u32,
    scale: u32,
    width: Option<u32>,
}

#[derive(Clone, Copy, Eq, Hash, PartialEq)]
struct GlyphKey {
    font: u64,
    index: u32,
    glyph: u32,
    size: u32,
    step: u8,
}

#[derive(Clone, Copy)]
struct Mask {
    slot: Slot,
    left: i32,
    top: i32,
}

/// Shapes text with Parley and keeps its glyphs in the atlas.
pub struct Text {
    fonts: FontContext,
    layouts: LayoutContext<()>,
    scaler: ScaleContext,
    shaped: HashMap<LayoutKey, Rc<Layout<()>>>,
    glyphs: HashMap<GlyphKey, Option<Mask>>,
}

impl Text {
    pub fn new() -> Self {
        let mut fonts = FontContext::new();
        for font in FONTS {
            fonts
                .collection
                .register_fonts(Blob::new(Arc::new(font)), None);
        }
        Self {
            fonts,
            layouts: LayoutContext::new(),
            scaler: ScaleContext::new(),
            shaped: HashMap::new(),
            glyphs: HashMap::new(),
        }
    }

    fn layout(
        &mut self,
        text: &str,
        style: TextStyle,
        scale: f32,
        width: Option<f32>,
    ) -> Rc<Layout<()>> {
        let key = LayoutKey {
            text: text.to_owned(),
            size: style.size.to_bits(),
            weight: style.weight.to_bits(),
            scale: scale.to_bits(),
            width: width.map(f32::to_bits),
        };
        if let Some(layout) = self.shaped.get(&key) {
            return layout.clone();
        }
        let mut builder = self
            .layouts
            .ranged_builder(&mut self.fonts, text, scale, true);
        builder.push_default(StyleProperty::FontFamily(FontFamily::Source(
            Cow::Borrowed(FAMILY),
        )));
        builder.push_default(StyleProperty::FontSize(style.size));
        builder.push_default(StyleProperty::FontWeight(FontWeight::new(style.weight)));
        let mut layout = builder.build(text);
        layout.break_all_lines(width.map(|width| width * scale));
        let layout = Rc::new(layout);
        self.shaped.insert(key, layout.clone());
        layout
    }

    /// The size of the text in logical pixels, wrapped to `width`.
    pub fn measure(
        &mut self,
        text: &str,
        style: TextStyle,
        scale: f32,
        width: Option<f32>,
    ) -> (f32, f32) {
        let layout = self.layout(text, style, scale, width);
        (layout.width() / scale, layout.height() / scale)
    }

    /// Draws the text with its top left corner at a physical pixel.
    #[allow(clippy::too_many_arguments)]
    pub fn draw(
        &mut self,
        gpu: &mut Gpu,
        scene: &mut Scene,
        text: &str,
        style: TextStyle,
        scale: f32,
        width: Option<f32>,
        origin: (f32, f32),
    ) {
        let layout = self.layout(text, style, scale, width);
        for line in layout.lines() {
            for item in line.items() {
                let PositionedLayoutItem::GlyphRun(run) = item else {
                    continue;
                };
                let font = run.run().font();
                let size = run.run().font_size();
                for glyph in run.positioned_glyphs() {
                    let x = origin.0 + glyph.x;
                    let step = (x.fract() * SUBPIXEL_STEPS) as u8;
                    let key = GlyphKey {
                        font: font.data.id(),
                        index: font.index,
                        glyph: glyph.id,
                        size: size.to_bits(),
                        step,
                    };
                    let mask = *self.glyphs.entry(key).or_insert_with(|| {
                        let font = FontRef::from_index(font.data.data(), font.index as usize)?;
                        let mut scaler = self.scaler.builder(font).size(size).build();
                        let image = Render::new(&[Source::Outline])
                            .format(Format::Alpha)
                            .offset(Vector::new(f32::from(step) / SUBPIXEL_STEPS, 0.0))
                            .render(&mut scaler, glyph.id as u16)?;
                        let slot = gpu.atlas.insert(
                            &gpu.queue,
                            image.placement.width,
                            image.placement.height,
                            &image.data,
                        );
                        Some(Mask {
                            slot,
                            left: image.placement.left,
                            top: image.placement.top,
                        })
                    });
                    if let Some(mask) = mask {
                        scene.mask(
                            x.floor() + mask.left as f32,
                            (origin.1 + glyph.y).round() - mask.top as f32,
                            mask.slot,
                            style.color,
                        );
                    }
                }
            }
        }
    }
}

impl Default for Text {
    fn default() -> Self {
        Self::new()
    }
}
