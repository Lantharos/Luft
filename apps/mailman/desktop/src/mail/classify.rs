use mail_parser::Message;
use serde::{Deserialize, Serialize};

use super::envelope::Address;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Category {
    #[default]
    Primary,
    Newsletter,
    Receipt,
    Notification,
}

impl Category {
    pub fn as_str(self) -> &'static str {
        match self {
            Category::Primary => "primary",
            Category::Newsletter => "newsletter",
            Category::Receipt => "receipt",
            Category::Notification => "notification",
        }
    }
}

const ROBOT_SENDERS: [&str; 10] = [
    "noreply",
    "no-reply",
    "no_reply",
    "donotreply",
    "do-not-reply",
    "notifications",
    "notification",
    "notify",
    "alerts",
    "alert",
];
const DELIVERY_SENDERS: [&str; 2] = ["mailer-daemon", "postmaster"];
const RECEIPT_WORDS: [&str; 16] = [
    "receipt",
    "invoice",
    "your order",
    "order confirmation",
    "order #",
    "order no",
    "has shipped",
    "shipping confirmation",
    "payment received",
    "payment confirmation",
    "purchase",
    "booking confirmation",
    "reservation confirmation",
    "your trip",
    "subscription renewed",
    "billing statement",
];

pub fn is_delivery_report(from: &Address) -> bool {
    let local = from.address.split('@').next().unwrap_or_default();
    DELIVERY_SENDERS.contains(&local)
}

pub fn categorize(message: &Message, from: &Address, unsubscribe: bool) -> Category {
    if is_delivery_report(from) {
        return Category::Primary;
    }
    let local = from.address.split('@').next().unwrap_or_default();
    let robot = ROBOT_SENDERS.iter().any(|name| local.contains(name));
    let header = |name: &str| {
        message
            .header_raw(name)
            .map(|value| value.trim().to_ascii_lowercase())
    };
    let automated = header("Auto-Submitted").is_some_and(|value| value != "no");
    let bulk = header("Precedence")
        .is_some_and(|value| value == "bulk" || value == "list" || value == "junk");
    let discussion = message.header_raw("List-Post").is_some();
    let subject = message.subject().unwrap_or_default().to_lowercase();

    if (robot || automated || bulk || unsubscribe)
        && RECEIPT_WORDS.iter().any(|word| subject.contains(word))
    {
        return Category::Receipt;
    }
    if discussion {
        return Category::Primary;
    }
    if automated
        || local.contains("notif")
        || local.contains("alert")
        || message.header_raw("X-GitHub-Reason").is_some()
    {
        return Category::Notification;
    }
    if unsubscribe || bulk {
        return Category::Newsletter;
    }
    if robot {
        return Category::Notification;
    }
    Category::Primary
}
