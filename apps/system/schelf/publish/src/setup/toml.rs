/// A TOML value in the order it's written.
#[derive(Clone, Debug, PartialEq)]
pub enum Toml {
    Text(String),
    Number(i64),
    Truth(bool),
    List(Vec<Toml>),
    Table(Vec<(String, Toml)>),
}

impl From<&str> for Toml {
    fn from(text: &str) -> Self {
        Self::Text(text.to_owned())
    }
}

impl From<String> for Toml {
    fn from(text: String) -> Self {
        Self::Text(text)
    }
}

/// The entries that have a value.
pub fn fields(entries: Vec<(&str, Option<Toml>)>) -> Vec<(String, Toml)> {
    entries
        .into_iter()
        .filter_map(|(key, value)| Some((key.to_owned(), value?)))
        .collect()
}

/// A table of the entries that have a value.
pub fn table(entries: Vec<(&str, Option<Toml>)>) -> Toml {
    Toml::Table(fields(entries))
}

pub fn texts(items: &[String]) -> Toml {
    Toml::List(items.iter().map(|item| Toml::Text(item.clone())).collect())
}

fn bare(key: &str) -> bool {
    !key.is_empty()
        && key.chars().all(|character| {
            character.is_ascii_alphanumeric() || character == '-' || character == '_'
        })
}

fn string(text: &str) -> String {
    serde_json::to_string(text)
        .expect("text serialises")
        .replace('\x7f', "\\u007f")
}

fn key(name: &str) -> String {
    if bare(name) {
        name.to_owned()
    } else {
        string(name)
    }
}

fn inline(value: &Toml) -> String {
    match value {
        Toml::Text(text) => string(text),
        Toml::Number(number) => number.to_string(),
        Toml::Truth(truth) => truth.to_string(),
        Toml::List(items) if items.is_empty() => "[]".into(),
        Toml::List(items) => format!(
            "[ {} ]",
            items.iter().map(inline).collect::<Vec<_>>().join(", ")
        ),
        Toml::Table(entries) if entries.is_empty() => "{}".into(),
        Toml::Table(entries) => format!(
            "{{ {} }}",
            entries
                .iter()
                .map(|(name, value)| format!("{} = {}", key(name), inline(value)))
                .collect::<Vec<_>>()
                .join(", ")
        ),
    }
}

fn tables_only(items: &[Toml]) -> bool {
    !items.is_empty() && items.iter().all(|item| matches!(item, Toml::Table(_)))
}

fn section(header: Option<&str>, entries: &[(String, Toml)], prefix: &str) -> String {
    let mut preamble = String::new();
    let mut tables = String::new();
    let mut add = |text: String| {
        if !tables.is_empty() {
            tables.push('\n');
        }
        tables.push_str(&text);
    };
    for (name, value) in entries {
        let full = if prefix.is_empty() {
            key(name)
        } else {
            format!("{prefix}.{}", key(name))
        };
        match value {
            Toml::List(items) if tables_only(items) => {
                let mut text = String::new();
                for item in items {
                    if !text.is_empty() {
                        text.push('\n');
                    }
                    text.push_str(&format!("[[{full}]]\n"));
                    if let Toml::Table(inner) = item {
                        text.push_str(&section(None, inner, &full));
                    }
                }
                add(text);
            }
            Toml::Table(inner) => add(section(Some(&full), inner, &full)),
            other => preamble.push_str(&format!("{} = {}\n", key(name), inline(other))),
        }
    }
    if let Some(header) = header
        && (!preamble.is_empty() || tables.is_empty())
    {
        preamble = if preamble.is_empty() {
            format!("[{header}]")
        } else {
            format!("[{header}]\n{preamble}")
        };
    }
    match (preamble.is_empty(), tables.is_empty()) {
        (false, false) => format!("{preamble}\n{tables}"),
        (false, true) => preamble,
        _ => tables,
    }
}

/// Writes a table as smol-toml's `stringify` does.
pub fn stringify(document: &[(String, Toml)]) -> String {
    let text = section(None, document, "");
    if text.ends_with('\n') {
        text
    } else {
        format!("{text}\n")
    }
}
