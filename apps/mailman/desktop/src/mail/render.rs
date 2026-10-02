use std::collections::HashMap;
use std::path::{Path, PathBuf};

use mail_parser::{Message, MessageParser, MimeHeaders, PartType};
use serde::Serialize;

use super::{plain, sanitize};

const SNIPPET_LENGTH: usize = 180;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Attachment {
    pub index: u32,
    pub name: String,
    pub mime: String,
    pub size: usize,
    pub inline: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Rendered {
    pub html: String,
    pub plain: bool,
    pub designed: bool,
    pub remote: Vec<String>,
    pub trackers: usize,
    pub text: String,
    pub attachments: Vec<Attachment>,
}

pub fn parse(raw: &[u8]) -> Option<Message<'_>> {
    MessageParser::default().parse(raw)
}

pub fn render(raw: &[u8], parts: &Path) -> Option<Rendered> {
    let message = parse(raw)?;
    let text = message
        .body_text(0)
        .map(|text| text.into_owned())
        .unwrap_or_default();
    let html_part = message
        .html_part(0)
        .filter(|part| matches!(part.body, PartType::Html(_)));
    let inline = save_inline(&message, parts);
    let cleaned = match html_part.and_then(|_| message.body_html(0)) {
        Some(html) => sanitize::clean(&html, &inline),
        None => sanitize::Cleaned {
            html: plain::to_html(&text),
            ..Default::default()
        },
    };
    Some(Rendered {
        attachments: attachments(&message, &cleaned.cids),
        plain: html_part.is_none(),
        html: cleaned.html,
        designed: cleaned.designed,
        remote: cleaned.remote,
        trackers: cleaned.trackers,
        text,
    })
}

fn attachments(message: &Message, referenced: &[String]) -> Vec<Attachment> {
    message
        .attachments()
        .enumerate()
        .filter(|(_, part)| {
            !matches!(part.body, PartType::Text(_) | PartType::Html(_))
                || part.attachment_name().is_some()
        })
        .map(|(index, part)| Attachment {
            index: index as u32,
            name: part.attachment_name().unwrap_or("Attachment").to_owned(),
            mime: part
                .content_type()
                .map(|kind| {
                    format!(
                        "{}/{}",
                        kind.ctype(),
                        kind.subtype().unwrap_or("octet-stream")
                    )
                })
                .unwrap_or_else(|| "application/octet-stream".into()),
            size: part.contents().len(),
            inline: part.content_id().is_some_and(|cid| {
                referenced
                    .iter()
                    .any(|used| used == cid.trim_matches(['<', '>']))
            }),
        })
        .collect()
}

fn save_inline(message: &Message, folder: &Path) -> HashMap<String, PathBuf> {
    let mut saved = HashMap::new();
    for (index, part) in message.attachments().enumerate() {
        let Some(cid) = part.content_id() else {
            continue;
        };
        let is_image = part
            .content_type()
            .is_some_and(|kind| kind.ctype().eq_ignore_ascii_case("image"));
        if !is_image {
            continue;
        }
        let path = folder.join(format!("inline-{index}"));
        if path.exists()
            || std::fs::create_dir_all(folder)
                .and_then(|_| std::fs::write(&path, part.contents()))
                .is_ok()
        {
            saved.insert(cid.trim_matches(['<', '>']).to_owned(), path);
        }
    }
    saved
}

pub fn attachment(raw: &[u8], index: u32) -> Option<(String, Vec<u8>)> {
    let message = parse(raw)?;
    let part = message.attachments().nth(index as usize)?;
    Some((
        part.attachment_name().unwrap_or("Attachment").to_owned(),
        part.contents().to_vec(),
    ))
}

pub struct Indexed {
    pub snippet: String,
    pub text: String,
}

pub fn index(raw: &[u8]) -> Indexed {
    let text = parse(raw)
        .and_then(|message| message.body_text(0).map(|text| text.into_owned()))
        .unwrap_or_default();
    let fresh = plain::without_quotes(&text);
    let snippet: String = fresh
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
        .chars()
        .take(SNIPPET_LENGTH)
        .collect();
    Indexed {
        snippet,
        text: fresh,
    }
}
