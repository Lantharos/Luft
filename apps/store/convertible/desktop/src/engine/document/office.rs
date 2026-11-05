use std::fs::File;
use std::io::{BufReader, Read};
use std::path::Path;

use quick_xml::Reader;
use quick_xml::events::{BytesStart, Event};
use zip::ZipArchive;

use crate::engine::error::{Failure, Result};

const MAX_XML: u64 = 256 << 20;

fn part(path: &Path, name: &str) -> Result<String> {
    let mut archive =
        ZipArchive::new(BufReader::new(File::open(path)?)).map_err(Failure::damaged)?;
    let file = archive.by_name(name).map_err(Failure::damaged)?;
    let mut text = String::new();
    file.take(MAX_XML)
        .read_to_string(&mut text)
        .map_err(Failure::damaged)?;
    Ok(text)
}

fn attribute(element: &BytesStart<'_>, name: &str) -> Option<String> {
    element
        .attributes()
        .flatten()
        .find(|item| item.key.as_ref() == name)
        .map(|item| item.value.into_owned())
}

#[derive(Default)]
struct Paragraph {
    prefix: String,
    text: String,
}

#[derive(Default)]
struct Run {
    bold: bool,
    italic: bool,
}

fn wrapped(text: &str, run: &Run) -> String {
    let marker = match (run.bold, run.italic) {
        (true, true) => "***",
        (true, false) => "**",
        (false, true) => "*",
        (false, false) => "",
    };
    let trimmed = text.trim();
    if marker.is_empty() || trimmed.is_empty() {
        return text.to_owned();
    }
    let start = &text[..text.len() - text.trim_start().len()];
    let end = &text[text.trim_end().len()..];
    format!("{start}{marker}{trimmed}{marker}{end}")
}

fn table_markdown(rows: &[Vec<String>]) -> String {
    let columns = rows.iter().map(Vec::len).max().unwrap_or(0);
    let mut out = String::new();
    for (index, row) in rows.iter().enumerate() {
        let cells: Vec<String> = (0..columns)
            .map(|column| {
                row.get(column)
                    .map_or(String::new(), |cell| cell.replace('|', "\\|"))
            })
            .collect();
        out.push_str(&format!("| {} |\n", cells.join(" | ")));
        if index == 0 {
            out.push_str(&format!("|{}\n", " --- |".repeat(columns)));
        }
    }
    out.push('\n');
    out
}

#[derive(Default)]
struct Builder {
    out: String,
    paragraph: Paragraph,
    run: Run,
    rows: Vec<Vec<String>>,
    in_table: u32,
}

impl Builder {
    fn finish_paragraph(&mut self) {
        let paragraph = std::mem::take(&mut self.paragraph);
        if self.in_table > 0 {
            if let Some(row) = self.rows.last_mut() {
                match row.last_mut() {
                    Some(cell) if !cell.is_empty() => {
                        cell.push(' ');
                        cell.push_str(paragraph.text.trim());
                    }
                    Some(cell) => cell.push_str(paragraph.text.trim()),
                    None => row.push(paragraph.text.trim().to_owned()),
                }
            }
            return;
        }
        if paragraph.text.trim().is_empty() {
            return;
        }
        self.out.push_str(&paragraph.prefix);
        self.out.push_str(paragraph.text.trim_end());
        self.out.push_str(if paragraph.prefix.ends_with("- ") {
            "\n"
        } else {
            "\n\n"
        });
    }

    fn finish_table(&mut self) {
        self.in_table -= 1;
        if self.in_table == 0 {
            self.out.push_str(&table_markdown(&self.rows));
            self.rows.clear();
        }
    }
}

fn heading(level: usize) -> String {
    format!("{} ", "#".repeat(level.clamp(1, 6)))
}

pub fn docx_to_markdown(path: &Path) -> Result<String> {
    let xml = part(path, "word/document.xml")?;
    let mut reader = Reader::from_str(&xml);
    let mut builder = Builder::default();
    let mut in_text = false;
    loop {
        match reader.read_event().map_err(Failure::damaged)? {
            Event::Start(element) | Event::Empty(element) => match element.name().as_ref() {
                "w:t" => in_text = true,
                "w:b" => builder.run.bold = attribute(&element, "w:val").as_deref() != Some("0"),
                "w:i" => builder.run.italic = attribute(&element, "w:val").as_deref() != Some("0"),
                "w:pStyle" => {
                    let style = attribute(&element, "w:val").unwrap_or_default();
                    if let Some(level) = style
                        .strip_prefix("Heading")
                        .and_then(|level| level.parse().ok())
                    {
                        builder.paragraph.prefix = heading(level);
                    }
                }
                "w:ilvl" => {
                    let depth: usize = attribute(&element, "w:val")
                        .and_then(|level| level.parse().ok())
                        .unwrap_or(0);
                    builder.paragraph.prefix = format!("{}- ", "  ".repeat(depth));
                }
                "w:tab" if !builder.paragraph.text.is_empty() => builder.paragraph.text.push('\t'),
                "w:br" => builder.paragraph.text.push_str("  \n"),
                "w:tbl" => builder.in_table += 1,
                "w:tr" => builder.rows.push(Vec::new()),
                "w:tc" => {
                    if let Some(row) = builder.rows.last_mut() {
                        row.push(String::new());
                    }
                }
                _ => {}
            },
            Event::Text(text) if in_text => {
                let decoded = text.xml10_content();
                builder
                    .paragraph
                    .text
                    .push_str(&wrapped(&decoded, &builder.run));
            }
            Event::GeneralRef(reference) if in_text => {
                builder
                    .paragraph
                    .text
                    .push_str(&named_reference(&reference));
            }
            Event::End(element) => match element.name().as_ref() {
                "w:t" => in_text = false,
                "w:r" => builder.run = Run::default(),
                "w:p" => builder.finish_paragraph(),
                "w:tbl" => builder.finish_table(),
                _ => {}
            },
            Event::Eof => break,
            _ => {}
        }
    }
    Ok(builder.out)
}

fn named_reference(name: &str) -> String {
    match name {
        "amp" => "&".to_owned(),
        "lt" => "<".to_owned(),
        "gt" => ">".to_owned(),
        "quot" => "\"".to_owned(),
        "apos" => "'".to_owned(),
        other => other
            .strip_prefix("#x")
            .and_then(|hex| u32::from_str_radix(hex, 16).ok())
            .or_else(|| {
                other
                    .strip_prefix('#')
                    .and_then(|decimal| decimal.parse().ok())
            })
            .and_then(char::from_u32)
            .map_or_else(String::new, String::from),
    }
}

pub fn odt_to_markdown(path: &Path) -> Result<String> {
    let xml = part(path, "content.xml")?;
    let mut reader = Reader::from_str(&xml);
    let mut builder = Builder::default();
    let mut depth = 0usize;
    let mut in_body = false;
    loop {
        match reader.read_event().map_err(Failure::damaged)? {
            Event::Start(element) => match element.name().as_ref() {
                "office:text" => in_body = true,
                "text:h" => {
                    let level = attribute(&element, "text:outline-level")
                        .and_then(|level| level.parse().ok())
                        .unwrap_or(1);
                    builder.paragraph.prefix = heading(level);
                }
                "text:list" => depth += 1,
                "text:p" if depth > 0 => {
                    builder.paragraph.prefix = format!("{}- ", "  ".repeat(depth - 1))
                }
                "table:table" => builder.in_table += 1,
                "table:table-row" => builder.rows.push(Vec::new()),
                "table:table-cell" => {
                    if let Some(row) = builder.rows.last_mut() {
                        row.push(String::new());
                    }
                }
                _ => {}
            },
            Event::Empty(element) => match element.name().as_ref() {
                "text:line-break" => builder.paragraph.text.push_str("  \n"),
                "text:s" => builder.paragraph.text.push(' '),
                "text:tab" => builder.paragraph.text.push('\t'),
                _ => {}
            },
            Event::Text(text) if in_body => {
                builder.paragraph.text.push_str(&text.xml10_content());
            }
            Event::GeneralRef(reference) if in_body => {
                builder
                    .paragraph
                    .text
                    .push_str(&named_reference(&reference));
            }
            Event::End(element) => match element.name().as_ref() {
                "text:p" | "text:h" => builder.finish_paragraph(),
                "text:list" => depth -= 1,
                "table:table" => builder.finish_table(),
                _ => {}
            },
            Event::Eof => break,
            _ => {}
        }
    }
    Ok(builder.out)
}
