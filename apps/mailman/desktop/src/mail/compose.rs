use std::path::Path;

use mail_builder::MessageBuilder;
use mail_builder::headers::address::Address as BuiltAddress;
use rand::RngExt;
use serde::{Deserialize, Serialize};

use super::envelope::Address;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Attached {
    pub path: String,
    pub name: String,
    pub cid: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Draft {
    pub account: i64,
    pub identity: i64,
    pub from: Option<String>,
    pub to: Vec<Address>,
    pub cc: Vec<Address>,
    pub bcc: Vec<Address>,
    pub subject: String,
    pub html: String,
    pub text: String,
    pub attachments: Vec<Attached>,
    pub in_reply_to: Option<String>,
    pub references: Vec<String>,
    pub send_at: Option<i64>,
    pub remind_after: Option<i64>,
}

pub struct Built {
    pub raw: Vec<u8>,
    pub recipients: Vec<String>,
}

fn built_addresses(addresses: &[Address]) -> BuiltAddress<'static> {
    BuiltAddress::new_list(
        addresses
            .iter()
            .map(|address| {
                BuiltAddress::new_address(
                    Some(address.name.clone()).filter(|name| !name.is_empty()),
                    address.address.clone(),
                )
            })
            .collect(),
    )
}

fn content_type(path: &Path) -> &'static str {
    match path
        .extension()
        .and_then(|extension| extension.to_str())
        .map(str::to_ascii_lowercase)
        .as_deref()
    {
        Some("png") => "image/png",
        Some("jpg" | "jpeg") => "image/jpeg",
        Some("gif") => "image/gif",
        Some("webp") => "image/webp",
        Some("svg") => "image/svg+xml",
        Some("pdf") => "application/pdf",
        Some("txt" | "md") => "text/plain",
        Some("html" | "htm") => "text/html",
        Some("zip") => "application/zip",
        Some("ics") => "text/calendar",
        Some("csv") => "text/csv",
        Some("json") => "application/json",
        _ => "application/octet-stream",
    }
}

pub fn message_id(from: &str) -> String {
    let domain = from.rsplit('@').next().unwrap_or("mailman.local");
    let token: String = rand::rng()
        .sample_iter(rand::distr::Alphanumeric)
        .take(24)
        .map(char::from)
        .collect();
    format!("{token}@{domain}")
}

pub fn build(draft: &Draft, from: &Address, reply_to: &str) -> Result<Built, String> {
    let message_id = message_id(&from.address);
    let mut builder = MessageBuilder::new()
        .from(BuiltAddress::new_address(
            Some(from.name.clone()).filter(|name| !name.is_empty()),
            from.address.clone(),
        ))
        .subject(draft.subject.clone())
        .message_id(message_id)
        .date(crate::store::now())
        .text_body(draft.text.clone());
    if !draft.html.is_empty() {
        builder = builder.html_body(draft.html.clone());
    }
    if !reply_to.is_empty() {
        builder = builder.reply_to(BuiltAddress::new_address(
            None::<String>,
            reply_to.to_owned(),
        ));
    }
    if !draft.to.is_empty() {
        builder = builder.to(built_addresses(&draft.to));
    }
    if !draft.cc.is_empty() {
        builder = builder.cc(built_addresses(&draft.cc));
    }
    if let Some(parent) = &draft.in_reply_to {
        builder = builder.in_reply_to(parent.clone());
    }
    if !draft.references.is_empty() {
        builder = builder.references(draft.references.clone());
    }
    for attached in &draft.attachments {
        let path = Path::new(&attached.path);
        let bytes = std::fs::read(path)
            .map_err(|error| format!("{} couldn't be attached: {error}", attached.name))?;
        builder = match &attached.cid {
            Some(cid) => builder.inline(content_type(path), cid.clone(), bytes),
            None => builder.attachment(content_type(path), attached.name.clone(), bytes),
        };
    }
    let raw = builder.write_to_vec().map_err(|error| error.to_string())?;
    let recipients = draft
        .to
        .iter()
        .chain(&draft.cc)
        .chain(&draft.bcc)
        .map(|address| address.address.clone())
        .collect();
    Ok(Built { raw, recipients })
}
