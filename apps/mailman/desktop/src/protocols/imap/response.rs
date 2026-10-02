use super::parse::{Parser, Value};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Status {
    Ok,
    No,
    Bad,
    Bye,
    PreAuth,
}

impl Status {
    fn parse(word: &str) -> Option<Self> {
        Some(match word.to_ascii_uppercase().as_str() {
            "OK" => Self::Ok,
            "NO" => Self::No,
            "BAD" => Self::Bad,
            "BYE" => Self::Bye,
            "PREAUTH" => Self::PreAuth,
            _ => return None,
        })
    }
}

#[derive(Debug)]
pub enum Response {
    Tagged {
        tag: String,
        status: Status,
        code: Option<String>,
        text: String,
    },
    Untagged(Untagged),
    Continue,
}

#[derive(Debug)]
pub enum Untagged {
    Status {
        status: Status,
        code: Option<String>,
    },
    Capability(Vec<String>),
    Exists(u32),
    Expunge,
    Fetch(Fetch),
    List {
        attributes: Vec<String>,
        delimiter: Option<String>,
        name: String,
    },
    Search(Vec<u32>),
    Vanished(String),
    Other,
}

#[derive(Debug, Default)]
pub struct Fetch {
    pub items: Vec<(String, Value)>,
}

impl Fetch {
    pub fn get(&self, name: &str) -> Option<&Value> {
        self.items
            .iter()
            .find(|(key, _)| {
                key.eq_ignore_ascii_case(name)
                    || key.to_ascii_uppercase().starts_with(&format!("{name}["))
            })
            .map(|(_, value)| value)
    }

    pub fn uid(&self) -> Option<u32> {
        self.get("UID")?.number().map(|uid| uid as u32)
    }

    pub fn flags(&self) -> Option<Vec<String>> {
        self.get("FLAGS")
            .map(|flags| flags.list().iter().filter_map(Value::text).collect())
    }

    pub fn number(&self, name: &str) -> Option<u64> {
        self.get(name).and_then(|value| match value {
            Value::List(items) => items.first()?.number(),
            other => other.number(),
        })
    }

    pub fn section(&self, prefix: &str) -> Option<&[u8]> {
        self.items
            .iter()
            .find(|(key, _)| key.to_ascii_uppercase().starts_with(prefix))
            .and_then(|(_, value)| value.bytes())
    }
}

pub fn parse(line: &[u8]) -> Response {
    let mut parser = Parser::new(line);
    let tag = parser
        .value()
        .and_then(|value| value.text())
        .unwrap_or_default();
    if tag == "+" {
        return Response::Continue;
    }
    if tag != "*" {
        let status = parser
            .value()
            .and_then(|value| value.text())
            .and_then(|word| Status::parse(&word))
            .unwrap_or(Status::Bad);
        let code = parser.code();
        return Response::Tagged {
            tag,
            status,
            code,
            text: parser.rest(),
        };
    }
    Response::Untagged(untagged(&mut parser))
}

fn untagged(parser: &mut Parser) -> Untagged {
    let Some(first) = parser.value().and_then(|value| value.text()) else {
        return Untagged::Other;
    };
    if let Some(status) = Status::parse(&first) {
        let code = parser.code();
        if let Some(capabilities) = code
            .as_deref()
            .and_then(|code| code.strip_prefix("CAPABILITY "))
        {
            return Untagged::Capability(
                capabilities.split_whitespace().map(str::to_owned).collect(),
            );
        }
        return Untagged::Status { status, code };
    }
    if let Ok(number) = first.parse::<u32>() {
        let kind = parser
            .value()
            .and_then(|value| value.text())
            .unwrap_or_default()
            .to_ascii_uppercase();
        return match kind.as_str() {
            "EXISTS" => Untagged::Exists(number),
            "EXPUNGE" => Untagged::Expunge,
            "FETCH" => Untagged::Fetch(fetch(parser.value())),
            _ => Untagged::Other,
        };
    }
    match first.to_ascii_uppercase().as_str() {
        "CAPABILITY" => {
            Untagged::Capability(parser.values().iter().filter_map(Value::text).collect())
        }
        "LIST" | "XLIST" => {
            let attributes = parser
                .value()
                .map(|value| value.list().iter().filter_map(Value::text).collect())
                .unwrap_or_default();
            let delimiter = parser.value().and_then(|value| value.text());
            let name = parser
                .value()
                .and_then(|value| value.text())
                .unwrap_or_default();
            Untagged::List {
                attributes,
                delimiter,
                name,
            }
        }
        "SEARCH" => Untagged::Search(
            parser
                .values()
                .iter()
                .filter_map(Value::number)
                .map(|uid| uid as u32)
                .collect(),
        ),
        "VANISHED" => {
            let values = parser.values();
            let set = values
                .iter()
                .rfind(|value| !matches!(value, Value::List(_)))
                .and_then(Value::text);
            set.map(Untagged::Vanished).unwrap_or(Untagged::Other)
        }
        _ => Untagged::Other,
    }
}

fn fetch(value: Option<Value>) -> Fetch {
    let mut items = Vec::new();
    let mut values = value
        .map(|value| match value {
            Value::List(items) => items,
            _ => Vec::new(),
        })
        .unwrap_or_default()
        .into_iter();
    while let (Some(key), Some(value)) = (values.next(), values.next()) {
        if let Some(key) = key.text() {
            items.push((key, value));
        }
    }
    Fetch { items }
}
