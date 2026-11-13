use regex::Regex;
use toml::{Table, Value};

use super::ConfigIssue;

/// What an enum's own message says about a value it doesn't take.
pub type Refusal<'a> = &'a dyn Fn(Option<&Value>) -> String;

/// Whose words an issue is in: `schelf check`'s plain ones, or the schema
/// library's own, which permission declarations are read with.
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Words {
    Plain,
    Schema,
}

pub enum Text<'a> {
    Trim,
    Lower,
    Min(usize),
    Max(usize),
    Pattern(&'a Regex, &'a str),
    Refine(fn(&str) -> bool, &'a str),
    Url,
}

#[derive(Clone, Copy)]
pub enum Kind {
    Text,
    Number,
    Whole,
    Truth,
    List,
    Table,
}

impl Kind {
    fn plain(self) -> &'static str {
        match self {
            Self::Text => "text in quotes",
            Self::Number => "a number",
            Self::Whole => "a whole number",
            Self::Truth => "true or false",
            Self::List => "a list",
            Self::Table => "a table",
        }
    }

    fn schema(self) -> &'static str {
        match self {
            Self::Text => "string",
            Self::Number => "number",
            Self::Whole => "int",
            Self::Truth => "boolean",
            Self::List => "array",
            Self::Table => "object",
        }
    }
}

fn received(value: Option<&Value>) -> &'static str {
    match value {
        None => "undefined",
        Some(Value::String(_)) => "string",
        Some(Value::Integer(_) | Value::Float(_)) => "number",
        Some(Value::Boolean(_)) => "boolean",
        Some(Value::Array(_)) => "array",
        Some(Value::Table(_)) => "object",
        Some(Value::Datetime(_)) => "date",
    }
}

pub fn key_of(path: &[String]) -> Option<String> {
    (!path.is_empty()).then(|| path.join("."))
}

pub fn at(path: &[String], key: impl ToString) -> Vec<String> {
    let mut path = path.to_vec();
    path.push(key.to_string());
    path
}

/// Checks TOML values against a schema, collecting what's wrong in the
/// words and order the store's schemas report it.
pub struct Checker {
    pub file: String,
    pub words: Words,
    pub issues: Vec<ConfigIssue>,
}

impl Checker {
    pub fn new(file: &str, words: Words) -> Self {
        Self {
            file: file.to_owned(),
            words,
            issues: Vec::new(),
        }
    }

    pub fn issue(&mut self, path: &[String], message: impl Into<String>) {
        self.issues.push(ConfigIssue {
            file: self.file.clone(),
            key: key_of(path),
            message: message.into(),
            allowed: None,
        });
    }

    pub fn wrong_type(&mut self, path: &[String], expected: Kind, value: Option<&Value>) {
        let message = match (self.words, value) {
            (Words::Plain, None) => "is required".to_owned(),
            (Words::Plain, Some(_)) => format!("should be {}", expected.plain()),
            (Words::Schema, _) => format!(
                "Invalid input: expected {}, received {}",
                expected.schema(),
                received(value)
            ),
        };
        self.issue(path, message);
    }

    pub fn clean(&self, since: usize) -> bool {
        self.issues.len() == since
    }

    pub fn table<'a>(&mut self, path: &[String], value: Option<&'a Value>) -> Option<&'a Table> {
        match value {
            Some(Value::Table(table)) => Some(table),
            other => {
                self.wrong_type(path, Kind::Table, other);
                None
            }
        }
    }

    /// Reports the keys of `table` that aren't in `allowed`.
    pub fn strict(&mut self, path: &[String], table: &Table, allowed: &[&str]) {
        let unknown: Vec<&String> = table
            .keys()
            .filter(|key| !allowed.contains(&key.as_str()))
            .collect();
        if unknown.is_empty() {
            return;
        }
        if self.words == Words::Schema {
            let names = unknown
                .iter()
                .map(|key| format!("\"{key}\""))
                .collect::<Vec<_>>()
                .join(", ");
            let plural = if unknown.len() > 1 { "s" } else { "" };
            self.issue(path, format!("Unrecognized key{plural}: {names}"));
            return;
        }
        for key in unknown {
            self.issues.push(ConfigIssue {
                file: self.file.clone(),
                key: key_of(&at(path, key)),
                message: format!("{key} isn't something {} sets", self.file),
                allowed: Some(allowed.iter().map(|key| (*key).to_owned()).collect()),
            });
        }
    }

    pub fn text(
        &mut self,
        path: &[String],
        value: Option<&Value>,
        rules: &[Text],
    ) -> Option<String> {
        let Some(Value::String(text)) = value else {
            self.wrong_type(path, Kind::Text, value);
            return None;
        };
        let since = self.issues.len();
        let mut text = text.clone();
        for rule in rules {
            match rule {
                Text::Trim => text = text.trim().to_owned(),
                Text::Lower => text = text.to_lowercase(),
                Text::Min(minimum) if utf16(&text) < *minimum => self.issue(
                    path,
                    format!("Too small: expected string to have >={minimum} characters"),
                ),
                Text::Max(maximum) if utf16(&text) > *maximum => self.issue(
                    path,
                    format!("Too big: expected string to have <={maximum} characters"),
                ),
                Text::Pattern(pattern, message) if !pattern.is_match(&text) => {
                    self.issue(path, *message)
                }
                Text::Refine(accepts, message) if !accepts(&text) => self.issue(path, *message),
                Text::Url if !web_link(&text) => self.issue(path, "Invalid URL"),
                _ => {}
            }
        }
        self.clean(since).then_some(text)
    }

    pub fn truth(&mut self, path: &[String], value: Option<&Value>) -> Option<bool> {
        match value {
            Some(Value::Boolean(truth)) => Some(*truth),
            other => {
                self.wrong_type(path, Kind::Truth, other);
                None
            }
        }
    }

    /// A whole number from `minimum` (or above zero, for `None`) to `maximum`.
    pub fn whole(
        &mut self,
        path: &[String],
        value: Option<&Value>,
        minimum: Option<i64>,
        maximum: Option<i64>,
    ) -> Option<i64> {
        let number = match value {
            Some(Value::Integer(number)) => *number,
            Some(Value::Float(number)) if number.fract() == 0.0 => *number as i64,
            Some(Value::Float(_)) => {
                self.wrong_type(path, Kind::Whole, value);
                return None;
            }
            other => {
                self.wrong_type(path, Kind::Number, other);
                return None;
            }
        };
        let since = self.issues.len();
        match minimum {
            Some(minimum) if number < minimum => self.issue(
                path,
                format!("Too small: expected number to be >={minimum}"),
            ),
            None if number <= 0 => self.issue(path, "Too small: expected number to be >0"),
            _ => {}
        }
        if let Some(maximum) = maximum.filter(|maximum| number > *maximum) {
            self.issue(path, format!("Too big: expected number to be <={maximum}"));
        }
        self.clean(since).then_some(number)
    }

    /// One of `allowed`, or the message `custom` gives for anything else.
    pub fn choice(
        &mut self,
        path: &[String],
        value: Option<&Value>,
        allowed: &[&str],
        custom: Option<Refusal>,
    ) -> Option<String> {
        if let Some(Value::String(text)) = value
            && allowed.contains(&text.as_str())
        {
            return Some(text.clone());
        }
        if let Some(custom) = custom {
            self.issue(path, custom(value));
            return None;
        }
        let message = match self.words {
            Words::Plain => "isn't one of the allowed values".to_owned(),
            Words::Schema => format!(
                "Invalid option: expected one of {}",
                allowed
                    .iter()
                    .map(|value| format!("\"{value}\""))
                    .collect::<Vec<_>>()
                    .join("|")
            ),
        };
        self.issues.push(ConfigIssue {
            file: self.file.clone(),
            key: key_of(path),
            message,
            allowed: (self.words == Words::Plain)
                .then(|| allowed.iter().map(|value| (*value).to_owned()).collect()),
        });
        None
    }

    /// A list of between `minimum` and `maximum` items, each read by `item`.
    pub fn list<T>(
        &mut self,
        path: &[String],
        value: Option<&Value>,
        minimum: Option<usize>,
        maximum: Option<usize>,
        mut item: impl FnMut(&mut Self, &[String], &Value) -> Option<T>,
    ) -> Option<Vec<T>> {
        let Some(Value::Array(items)) = value else {
            self.wrong_type(path, Kind::List, value);
            return None;
        };
        let since = self.issues.len();
        let read: Vec<Option<T>> = items
            .iter()
            .enumerate()
            .map(|(index, entry)| item(self, &at(path, index), entry))
            .collect();
        if let Some(minimum) = minimum.filter(|minimum| items.len() < *minimum) {
            self.issue(
                path,
                format!("Too small: expected array to have >={minimum} items"),
            );
        }
        if let Some(maximum) = maximum.filter(|maximum| items.len() > *maximum) {
            self.issue(
                path,
                format!("Too big: expected array to have <={maximum} items"),
            );
        }
        if !self.clean(since) {
            return None;
        }
        read.into_iter().collect()
    }
}

fn utf16(text: &str) -> usize {
    text.encode_utf16().count()
}

fn web_link(text: &str) -> bool {
    let Some((scheme, rest)) = text.split_once("://") else {
        return false;
    };
    matches!(scheme, "http" | "https")
        && rest
            .split(['/', '?', '#'])
            .next()
            .is_some_and(|host| !host.is_empty() && !host.contains(' '))
}
