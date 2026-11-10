use std::collections::HashMap;

use pdf_writer::types::{SystemInfo, TextRenderingMode, UnicodeCmap};
use pdf_writer::{Chunk, Content, Name, Rect, Ref, Str};

use crate::document::Word;

const CODES: usize = 255;
const GLYPH_WIDTH: f32 = 500.0;
const BASELINE: f32 = 0.78;

#[derive(Default)]
pub struct Letters {
    fonts: Vec<Vec<char>>,
    codes: HashMap<char, (usize, u8)>,
}

impl Letters {
    fn code(&mut self, letter: char) -> (usize, u8) {
        if let Some(code) = self.codes.get(&letter) {
            return *code;
        }
        if self.fonts.last().is_none_or(|font| font.len() >= CODES) {
            self.fonts.push(Vec::new());
        }
        let font = self.fonts.len() - 1;
        self.fonts[font].push(letter);
        let code = (font, self.fonts[font].len() as u8);
        self.codes.insert(letter, code);
        code
    }

    pub fn font_name(font: usize) -> String {
        format!("T{font}")
    }

    pub fn write(&self, chunk: &mut Chunk, mut next: impl FnMut() -> Ref) -> Vec<Ref> {
        let glyph = next();
        chunk.stream(glyph, b"500 0 0 0 0 0 d1");
        self.fonts
            .iter()
            .map(|letters| {
                let (font, cmap) = (next(), next());
                let mut map = UnicodeCmap::<u8>::new(
                    Name(b"Flatbed-Text"),
                    SystemInfo {
                        registry: Str(b"Adobe"),
                        ordering: Str(b"Identity"),
                        supplement: 0,
                    },
                );
                for (index, letter) in letters.iter().enumerate() {
                    map.pair(index as u8 + 1, *letter);
                }
                chunk.stream(cmap, &map.finish());
                let mut writer = chunk.type3_font(font);
                writer.bbox(Rect::new(0.0, 0.0, 0.0, 0.0));
                writer.matrix([0.001, 0.0, 0.0, 0.001, 0.0, 0.0]);
                writer.char_procs().pair(Name(b"g"), glyph);
                writer
                    .encoding_custom()
                    .differences()
                    .consecutive(1, letters.iter().map(|_| Name(b"g")));
                writer.first_char(1);
                writer.last_char(letters.len() as u8);
                writer.widths(letters.iter().map(|_| GLYPH_WIDTH));
                writer.resources();
                writer.to_unicode(cmap);
                font
            })
            .collect()
    }
}

pub struct Placement {
    pub scale: f32,
    pub left: f32,
    pub bottom: f32,
    pub height: u32,
}

pub fn draw(content: &mut Content, letters: &mut Letters, words: &[Word], placement: &Placement) {
    content.begin_text();
    content.set_text_rendering_mode(TextRenderingMode::Invisible);
    for word in words {
        let size = (word.line_height as f32 * placement.scale).max(1.0);
        let x = placement.left + word.left as f32 * placement.scale;
        let baseline = word.line_top as f32 + word.line_height as f32 * BASELINE;
        let y = placement.bottom + (placement.height as f32 - baseline) * placement.scale;
        let text: Vec<char> = word.text.chars().chain([' ']).collect();
        let natural = (text.len() - 1).max(1) as f32 * GLYPH_WIDTH / 1000.0 * size;
        let stretch = 100.0 * word.width as f32 * placement.scale / natural;
        let mut runs: Vec<(usize, Vec<u8>)> = Vec::new();
        for letter in text {
            let (font, code) = letters.code(letter);
            match runs.last_mut() {
                Some((current, codes)) if *current == font => codes.push(code),
                _ => runs.push((font, vec![code])),
            }
        }
        content.set_text_matrix([1.0, 0.0, 0.0, 1.0, x, y]);
        content.set_horizontal_scaling(stretch);
        for (font, codes) in runs {
            content.set_font(Name(Letters::font_name(font).as_bytes()), size);
            content.show(Str(&codes));
        }
    }
    content.end_text();
}
