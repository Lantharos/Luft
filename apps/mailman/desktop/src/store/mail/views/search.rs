use super::{Filter, Scope};

pub fn filter(query: &str) -> Filter {
    let mut conditions = vec!["coalesce(b.role, '') NOT IN ('trash', 'junk')".to_owned()];
    let mut terms = Vec::new();
    for word in query.split_whitespace() {
        match word.to_lowercase().as_str() {
            "is:unread" => conditions.push("m.seen = 0".into()),
            "is:starred" => conditions.push("m.flagged = 1".into()),
            "has:attachment" | "has:attachments" => conditions.push("m.attachments = 1".into()),
            "in:anywhere" => conditions.retain(|condition| !condition.contains("trash")),
            _ => {
                let (column, term) = match word.split_once(':') {
                    Some(("from" | "to", term)) => (Some("people"), term),
                    Some(("subject", term)) => (Some("subject"), term),
                    _ => (None, word),
                };
                let term = term.replace('"', "");
                if term.is_empty() {
                    continue;
                }
                let phrase = format!("\"{term}\"*");
                terms.push(
                    column
                        .map(|column| format!("{column}:{phrase}"))
                        .unwrap_or(phrase),
                );
            }
        }
    }
    Filter {
        scope: if terms.is_empty() {
            Scope::Everywhere
        } else {
            Scope::Matches(terms.join(" AND "))
        },
        rows: conditions.join(" AND "),
        reminders: false,
        category: None,
    }
}
