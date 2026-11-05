use std::fs;

use krilla::Document;
use krilla::color::rgb;
use krilla::geom::{PathBuilder, Point, Size};
use krilla::page::PageSettings;
use krilla::paint::{Fill, Stroke};
use krilla::surface::Surface;
use krilla::text::{Font, TextDirection};
use pulldown_cmark::{Event, HeadingLevel, Tag, TagEnd};
use skrifa::instance::{LocationRef, Size as FontSize};
use skrifa::{FontRef, MetadataProvider};

use super::text::parser;
use crate::engine::error::{Failure, Result};
use crate::l10n::L10N;
use luft_i18n::t;

const PAGE: (f32, f32) = (595.28, 841.89);
const MARGIN: f32 = 56.0;
const BODY_SIZE: f32 = 11.0;
const CODE_SIZE: f32 = 9.5;
const LEADING: f32 = 1.45;
const BLOCK_GAP: f32 = 8.0;
const INDENT: f32 = 16.0;
const REGULAR: &[u8] =
    include_bytes!("../../../../../../../packages/web/ui/fonts/OpenRunde-Regular.woff2");
const SEMIBOLD: &[u8] =
    include_bytes!("../../../../../../../packages/web/ui/fonts/OpenRunde-Semibold.woff2");
const MONO: &[u8] =
    include_bytes!("../../../../../../../packages/web/ui/fonts/MapleMono-NF-Regular.woff2");

#[derive(Clone, Copy, PartialEq)]
enum Face {
    Regular,
    Bold,
    Mono,
}

struct Faces {
    data: [Vec<u8>; 3],
    fonts: [Font; 3],
}

fn unpack(woff2: &[u8]) -> Result<Vec<u8>> {
    wuff::decompress_woff2(woff2).map_err(|error| Failure::damaged(format!("{error:?}")))
}

fn font(data: &[u8]) -> Result<Font> {
    Font::new(data.to_vec().into(), 0).ok_or_else(|| Failure::damaged("font"))
}

impl Faces {
    fn load() -> Result<Self> {
        let data = [unpack(REGULAR)?, unpack(SEMIBOLD)?, unpack(MONO)?];
        let fonts = [font(&data[0])?, font(&data[1])?, font(&data[2])?];
        Ok(Self { data, fonts })
    }

    fn font(&self, face: Face) -> &Font {
        &self.fonts[face as usize]
    }

    fn has(&self, face: Face, letter: char) -> bool {
        let font = FontRef::new(&self.data[face as usize]).expect("the bundled fonts parse");
        font.charmap().map(letter).is_some()
    }

    fn width(&self, face: Face, size: f32, text: &str) -> f32 {
        let font = FontRef::new(&self.data[face as usize]).expect("the bundled fonts parse");
        let (charmap, metrics) = (
            font.charmap(),
            font.glyph_metrics(FontSize::new(size), LocationRef::default()),
        );
        text.chars()
            .filter_map(|character| metrics.advance_width(charmap.map(character)?))
            .sum()
    }
}

#[derive(Clone)]
struct Span {
    text: String,
    face: Face,
}

#[derive(Clone)]
enum Block {
    Text {
        spans: Vec<Span>,
        size: f32,
        indent: f32,
        marker: Option<String>,
    },
    Code(String),
    Rule,
}

#[derive(Default)]
struct Collector {
    blocks: Vec<Block>,
    spans: Vec<Span>,
    bold: u32,
    size: Option<f32>,
    code: Option<String>,
    lists: Vec<Option<u64>>,
    marker: Option<String>,
    quote: u32,
}

fn heading_size(level: HeadingLevel) -> f32 {
    match level {
        HeadingLevel::H1 => 22.0,
        HeadingLevel::H2 => 17.0,
        HeadingLevel::H3 => 14.0,
        _ => 12.0,
    }
}

impl Collector {
    fn push_text(&mut self, text: &str, face: Option<Face>) {
        if let Some(code) = &mut self.code {
            code.push_str(text);
            return;
        }
        let face = face.unwrap_or(if self.bold > 0 || self.size.is_some() {
            Face::Bold
        } else {
            Face::Regular
        });
        self.spans.push(Span {
            text: text.to_owned(),
            face,
        });
    }

    fn flush(&mut self) {
        if self.spans.is_empty() {
            return;
        }
        let indent = (self.lists.len() as f32 + self.quote as f32) * INDENT;
        self.blocks.push(Block::Text {
            spans: std::mem::take(&mut self.spans),
            size: self.size.unwrap_or(BODY_SIZE),
            indent,
            marker: self.marker.take(),
        });
    }

    fn event(&mut self, event: Event<'_>) {
        match event {
            Event::Start(Tag::Heading { level, .. }) => self.size = Some(heading_size(level)),
            Event::End(TagEnd::Heading(_)) => {
                self.flush();
                self.size = None;
            }
            Event::End(TagEnd::Paragraph | TagEnd::TableRow | TagEnd::TableHead) => self.flush(),
            Event::End(TagEnd::TableCell) => self.push_text("    ", None),
            Event::Start(Tag::Strong) => self.bold += 1,
            Event::End(TagEnd::Strong) => self.bold -= 1,
            Event::Start(Tag::BlockQuote(_)) => self.quote += 1,
            Event::End(TagEnd::BlockQuote(_)) => self.quote -= 1,
            Event::Start(Tag::List(first)) => {
                self.flush();
                self.lists.push(first);
            }
            Event::End(TagEnd::List(_)) => {
                self.lists.pop();
            }
            Event::Start(Tag::Item) => {
                self.flush();
                self.marker = Some(match self.lists.last_mut() {
                    Some(Some(number)) => {
                        *number += 1;
                        format!("{}.", *number - 1)
                    }
                    _ => "•".to_owned(),
                });
            }
            Event::End(TagEnd::Item) => self.flush(),
            Event::Start(Tag::CodeBlock(_)) => self.code = Some(String::new()),
            Event::End(TagEnd::CodeBlock) => {
                if let Some(code) = self.code.take() {
                    self.blocks.push(Block::Code(code));
                }
            }
            Event::Text(text) => self.push_text(&text, None),
            Event::Code(text) => self.push_text(&text, Some(Face::Mono)),
            Event::SoftBreak => self.push_text(" ", None),
            Event::HardBreak => self.flush(),
            Event::Rule => self.blocks.push(Block::Rule),
            _ => {}
        }
    }
}

fn check_letters(blocks: &[Block], faces: &Faces) -> Result<()> {
    let missing = blocks
        .iter()
        .flat_map(|block| match block {
            Block::Text { spans, .. } => spans
                .iter()
                .flat_map(|span| span.text.chars().map(|letter| (letter, span.face)))
                .collect(),
            Block::Code(code) => code.chars().map(|letter| (letter, Face::Mono)).collect(),
            Block::Rule => Vec::new(),
        })
        .find(|(letter, face)| !letter.is_control() && !faces.has(*face, *letter));
    match missing {
        Some((letter, _)) => Err(Failure::new(t!(
            L10N,
            "failure-pdf-letter",
            letter = letter.to_string()
        ))),
        None => Ok(()),
    }
}

struct Word {
    text: String,
    face: Face,
    width: f32,
}

fn words(spans: &[Span], faces: &Faces, size: f32) -> Vec<Word> {
    let mut words = Vec::new();
    for span in spans {
        for part in span.text.split_inclusive(' ') {
            words.push(Word {
                width: faces.width(span.face, size, part),
                text: part.to_owned(),
                face: span.face,
            });
        }
    }
    words
}

fn wrap(words: Vec<Word>, width: f32) -> Vec<Vec<Word>> {
    let mut lines = vec![Vec::new()];
    let mut used = 0.0;
    for word in words {
        let line = lines.last_mut().expect("there is always a current line");
        if used + word.width > width && !line.is_empty() {
            used = 0.0;
            lines.push(Vec::new());
        }
        used += word.width;
        lines
            .last_mut()
            .expect("there is always a current line")
            .push(word);
    }
    lines
}

struct Pen<'a> {
    document: &'a mut Document,
    pages: Vec<Vec<Draw>>,
    y: f32,
}

enum Draw {
    Text {
        x: f32,
        y: f32,
        face: Face,
        size: f32,
        text: String,
    },
    Rule {
        y: f32,
    },
}

impl Pen<'_> {
    fn room(&mut self, height: f32) {
        if self.y + height > PAGE.1 - MARGIN {
            self.pages.push(Vec::new());
            self.y = MARGIN;
        }
    }

    fn draw(&mut self, draw: Draw) {
        self.pages
            .last_mut()
            .expect("there is always a current page")
            .push(draw);
    }
}

fn place(blocks: &[Block], faces: &Faces, pen: &mut Pen<'_>) {
    let full = PAGE.0 - MARGIN * 2.0;
    for block in blocks {
        match block {
            Block::Text {
                spans,
                size,
                indent,
                marker,
            } => {
                let lines = wrap(words(spans, faces, *size), full - indent);
                let line_height = size * LEADING;
                for (index, line) in lines.into_iter().enumerate() {
                    pen.room(line_height);
                    pen.y += line_height;
                    if let (0, Some(marker)) = (index, marker) {
                        pen.draw(Draw::Text {
                            x: MARGIN + indent - INDENT,
                            y: pen.y,
                            face: Face::Regular,
                            size: *size,
                            text: marker.clone(),
                        });
                    }
                    let mut x = MARGIN + indent;
                    for word in line {
                        pen.draw(Draw::Text {
                            x,
                            y: pen.y,
                            face: word.face,
                            size: *size,
                            text: word.text,
                        });
                        x += word.width;
                    }
                }
                pen.y += BLOCK_GAP;
            }
            Block::Code(code) => {
                let line_height = CODE_SIZE * LEADING;
                for line in code.lines() {
                    pen.room(line_height);
                    pen.y += line_height;
                    pen.draw(Draw::Text {
                        x: MARGIN + INDENT / 2.0,
                        y: pen.y,
                        face: Face::Mono,
                        size: CODE_SIZE,
                        text: line.to_owned(),
                    });
                }
                pen.y += BLOCK_GAP;
            }
            Block::Rule => {
                pen.room(BLOCK_GAP * 2.0);
                pen.y += BLOCK_GAP;
                pen.draw(Draw::Rule { y: pen.y });
                pen.y += BLOCK_GAP;
            }
        }
    }
}

fn paint(surface: &mut Surface<'_>, faces: &Faces, draws: Vec<Draw>) {
    surface.set_fill(Some(Fill {
        paint: rgb::Color::black().into(),
        ..Fill::default()
    }));
    for draw in draws {
        match draw {
            Draw::Text {
                x,
                y,
                face,
                size,
                text,
            } => {
                surface.draw_text(
                    Point::from_xy(x, y),
                    faces.font(face).clone(),
                    size,
                    &text,
                    false,
                    TextDirection::Auto,
                );
            }
            Draw::Rule { y } => {
                let mut path = PathBuilder::new();
                path.move_to(MARGIN, y);
                path.line_to(PAGE.0 - MARGIN, y);
                if let Some(path) = path.finish() {
                    surface.set_stroke(Some(Stroke::default()));
                    surface.draw_path(&path);
                    surface.set_stroke(None);
                }
            }
        }
    }
}

pub fn to_pdf(markdown: &str, out: &std::path::Path) -> Result<()> {
    let faces = Faces::load()?;
    let mut collector = Collector::default();
    parser(markdown).for_each(|event| collector.event(event));
    collector.flush();
    check_letters(&collector.blocks, &faces)?;
    let mut document = Document::new();
    let mut pen = Pen {
        document: &mut document,
        pages: vec![Vec::new()],
        y: MARGIN,
    };
    place(&collector.blocks, &faces, &mut pen);
    let pages = std::mem::take(&mut pen.pages);
    for draws in pages {
        let size = Size::from_wh(PAGE.0, PAGE.1).expect("the page size is valid");
        let mut page = pen.document.start_page_with(PageSettings::new(size));
        let mut surface = page.surface();
        paint(&mut surface, &faces, draws);
        surface.finish();
        page.finish();
    }
    let bytes = document
        .finish()
        .map_err(|error| Failure::damaged(format!("{error:?}")))?;
    fs::write(out, bytes)?;
    Ok(())
}
