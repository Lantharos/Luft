use std::sync::LazyLock;

use regex::Regex;
use toml::{Table, Value};

use crate::error::{Error, Result};

/// A Sabine app as its Sabine.toml describes it.
#[derive(Clone, Debug, PartialEq)]
pub struct SabineApp {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub sandbox: bool,
    pub updates_provider: Option<String>,
}

fn text(table: Option<&Table>, key: &str) -> Option<String> {
    table?.get(key)?.as_str().map(str::to_owned)
}

pub fn read_sabine(source: &str) -> Result<SabineApp> {
    let file: Table = source
        .parse()
        .map_err(|error: toml::de::Error| Error::Other(error.message().to_owned()))?;
    let app = file.get("app").and_then(Value::as_table);
    let (Some(id), Some(name)) = (
        text(app, "id").filter(|id| !id.is_empty()),
        text(app, "name").filter(|name| !name.is_empty()),
    ) else {
        return Err(Error::Other("Sabine.toml needs [app] id and name".into()));
    };
    Ok(SabineApp {
        id,
        name,
        description: text(app, "description"),
        icon: text(app, "icon"),
        sandbox: file.contains_key("sandbox"),
        updates_provider: text(file.get("updates").and_then(Value::as_table), "provider"),
    })
}

static TABLE_HEADER: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^\s*\[([^\]]+)\]\s*(#.*)?$").unwrap());
static REPLACED_KEYS: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^\s*(provider|repository|url|public_key)\s*=").unwrap());

/// Sabine.toml with its updates coming from Schelf, keeping everything else.
pub fn follow_schelf_updates(text: &str) -> String {
    let lines: Vec<&str> = text.split('\n').collect();
    let header = |line: &str| {
        TABLE_HEADER
            .captures(line)
            .map(|found| found[1].trim().to_owned())
    };
    let Some(start) = lines
        .iter()
        .position(|line| header(line).as_deref() == Some("updates"))
    else {
        return format!(
            "{}\n\n[updates]\nprovider = \"schelf\"\n",
            text.trim_end_matches('\n')
        );
    };
    let end = lines
        .iter()
        .enumerate()
        .skip(start + 1)
        .find(|(_, line)| TABLE_HEADER.is_match(line))
        .map_or(lines.len(), |(index, _)| index);
    let body = lines[start + 1..end]
        .iter()
        .filter(|line| !REPLACED_KEYS.is_match(line));
    lines[..=start]
        .iter()
        .copied()
        .chain(std::iter::once("provider = \"schelf\""))
        .chain(body.copied())
        .chain(lines[end..].iter().copied())
        .collect::<Vec<_>>()
        .join("\n")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn adds_an_updates_table_when_there_is_none() {
        assert_eq!(
            follow_schelf_updates("[app]\nid = \"a.b.C\"\nname = \"C\"\n"),
            "[app]\nid = \"a.b.C\"\nname = \"C\"\n\n[updates]\nprovider = \"schelf\"\n"
        );
    }

    #[test]
    fn replaces_another_provider_and_its_source_keeping_the_rest() {
        let before = "[app]\nid = \"a.b.C\"\nname = \"C\"\n\n[updates]\nprovider = \"github\"\nrepository = \"alice/c\"\npublic_key = \"abc\"\npolicy = \"notify\"\n\n[sandbox]\nnetwork = false";
        let after = follow_schelf_updates(before);
        assert_eq!(
            after,
            "[app]\nid = \"a.b.C\"\nname = \"C\"\n\n[updates]\nprovider = \"schelf\"\npolicy = \"notify\"\n\n[sandbox]\nnetwork = false"
        );
        let read = read_sabine(&after).unwrap();
        assert_eq!(read.updates_provider.as_deref(), Some("schelf"));
        assert!(read.sandbox);
    }

    #[test]
    fn needs_an_id_and_a_name() {
        assert!(matches!(
            read_sabine("[app]\nid = \"a.b.C\""),
            Err(Error::Other(message)) if message.contains("id and name")
        ));
    }
}
