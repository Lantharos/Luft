use std::fs;
use std::path::Path;

use pulldown_cmark::{Event, Options as Markdown, Parser, TagEnd, html};

use crate::engine::error::{Failure, Result};

const PAGE_STYLE: &str = "body{font:16px/1.6 system-ui,sans-serif;max-width:46rem;margin:2rem auto;padding:0 1rem}pre{overflow:auto}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:.3rem .6rem}img{max-width:100%}";

pub fn read(path: &Path) -> Result<String> {
    let bytes = fs::read(path)?;
    String::from_utf8(bytes).map_err(|_| Failure::damaged("text encoding"))
}

fn options() -> Markdown {
    Markdown::ENABLE_TABLES | Markdown::ENABLE_STRIKETHROUGH | Markdown::ENABLE_TASKLISTS
}

pub fn parser(markdown: &str) -> Parser<'_> {
    Parser::new_ext(markdown, options())
}

pub fn to_html(markdown: &str, title: &str) -> String {
    let mut body = String::with_capacity(markdown.len() * 2);
    html::push_html(&mut body, parser(markdown));
    let title = title.replace('&', "&amp;").replace('<', "&lt;");
    format!(
        "<!doctype html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n<title>{title}</title>\n<style>{PAGE_STYLE}</style>\n</head>\n<body>\n{body}</body>\n</html>\n"
    )
}

pub fn to_plain(markdown: &str) -> String {
    let mut out = String::with_capacity(markdown.len());
    for event in parser(markdown) {
        match event {
            Event::Text(text) | Event::Code(text) => out.push_str(&text),
            Event::SoftBreak | Event::HardBreak => out.push('\n'),
            Event::End(
                TagEnd::Paragraph | TagEnd::Heading(_) | TagEnd::CodeBlock | TagEnd::Table,
            ) => out.push_str("\n\n"),
            Event::End(TagEnd::Item | TagEnd::TableRow | TagEnd::TableHead) => out.push('\n'),
            Event::End(TagEnd::TableCell) => out.push('\t'),
            _ => {}
        }
    }
    out.trim_end().to_owned() + "\n"
}

pub fn html_to_markdown(html: &str) -> Result<String> {
    htmd::convert(html).map_err(Failure::damaged)
}

pub fn escape_plain(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    for line in text.lines() {
        if line.trim().is_empty() {
            out.push('\n');
        } else {
            out.push_str(line);
            out.push_str("  \n");
        }
    }
    out
}
