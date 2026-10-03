use mail_parser::{HeaderValue, Message, MessageParser, MimeHeaders};
use serde::{Deserialize, Serialize};

use super::classify::{self, Category};

pub const HEADERS: [&str; 20] = [
    "From",
    "To",
    "Cc",
    "Reply-To",
    "Sender",
    "Subject",
    "Date",
    "Message-ID",
    "In-Reply-To",
    "References",
    "Content-Type",
    "List-Unsubscribe",
    "List-Unsubscribe-Post",
    "List-Id",
    "List-Post",
    "Precedence",
    "Auto-Submitted",
    "X-GitHub-Reason",
    "Delivered-To",
    "X-Original-To",
];

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Address {
    pub name: String,
    pub address: String,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Recipients {
    pub to: Vec<Address>,
    pub cc: Vec<Address>,
    pub reply_to: Vec<Address>,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Unsubscribe {
    pub http: Option<String>,
    pub mailto: Option<String>,
    pub one_click: bool,
}

#[derive(Clone, Debug, Default)]
pub struct Envelope {
    pub message_id: Option<String>,
    pub in_reply_to: Option<String>,
    pub references: Vec<String>,
    pub subject: String,
    pub from: Address,
    pub recipients: Recipients,
    pub date: Option<i64>,
    pub unsubscribe: Option<Unsubscribe>,
    pub category: Category,
    pub attachments: bool,
}

pub fn parse(raw: &[u8]) -> Envelope {
    MessageParser::default()
        .parse_headers(raw)
        .map(|message| from_message(&message))
        .unwrap_or_default()
}

pub fn from_message(message: &Message) -> Envelope {
    let from = message
        .from()
        .or_else(|| message.sender())
        .and_then(|address| address.first())
        .map(address)
        .unwrap_or_default();
    let unsubscribe = unsubscribe(message);
    let category = classify::categorize(message, &from, unsubscribe.is_some());
    Envelope {
        message_id: message.message_id().map(str::to_owned),
        in_reply_to: text_list(message.in_reply_to()).into_iter().next(),
        references: text_list(message.references()),
        subject: message.subject().unwrap_or_default().trim().to_owned(),
        recipients: Recipients {
            to: addresses(message.to()),
            cc: addresses(message.cc()),
            reply_to: addresses(message.reply_to()),
        },
        date: message.date().map(|date| date.to_timestamp()),
        attachments: message.content_type().is_some_and(|kind| {
            kind.c_type.eq_ignore_ascii_case("multipart")
                && kind
                    .subtype()
                    .is_some_and(|subtype| subtype.eq_ignore_ascii_case("mixed"))
        }),
        from,
        unsubscribe,
        category,
    }
}

fn address(address: &mail_parser::Addr) -> Address {
    Address {
        name: address
            .name()
            .unwrap_or_default()
            .trim()
            .trim_matches('"')
            .to_owned(),
        address: address.address().unwrap_or_default().trim().to_lowercase(),
    }
}

fn addresses(list: Option<&mail_parser::Address>) -> Vec<Address> {
    list.map(|list| {
        list.iter()
            .map(address)
            .filter(|address| !address.address.is_empty())
            .collect()
    })
    .unwrap_or_default()
}

fn text_list(value: &HeaderValue) -> Vec<String> {
    value
        .as_text_list()
        .map(|list| list.iter().map(|item| item.to_string()).collect())
        .unwrap_or_default()
}

fn unsubscribe(message: &Message) -> Option<Unsubscribe> {
    let header = message.header_raw("List-Unsubscribe")?;
    let mut unsubscribe = Unsubscribe::default();
    for target in header.split(',') {
        let target = target
            .trim()
            .trim_start_matches('<')
            .trim_end_matches('>')
            .trim();
        let lower = target.to_ascii_lowercase();
        if lower.starts_with("https://") || lower.starts_with("http://") {
            unsubscribe.http.get_or_insert_with(|| target.to_owned());
        } else if lower.starts_with("mailto:") {
            unsubscribe.mailto.get_or_insert_with(|| target.to_owned());
        }
    }
    unsubscribe.one_click = unsubscribe.http.is_some()
        && message
            .header_raw("List-Unsubscribe-Post")
            .is_some_and(|post| {
                post.to_ascii_lowercase()
                    .contains("list-unsubscribe=one-click")
            });
    (unsubscribe.http.is_some() || unsubscribe.mailto.is_some()).then_some(unsubscribe)
}
