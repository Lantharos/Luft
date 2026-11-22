use toml::{Table, Value};

use crate::Policy;

/// Reads a policy file's text, or says what is wrong with it: each key Luft doesn't know and
/// each value of the wrong kind, named by its full key.
pub fn check(text: &str) -> Result<Table, Vec<String>> {
    let table: Table = text
        .parse()
        .map_err(|error: toml::de::Error| vec![error.to_string().trim_end().to_owned()])?;
    let problems: Vec<String> = table
        .iter()
        .flat_map(|(section, value)| match value {
            Value::Table(keys) if problem(section, section, Table::new()).is_none() => keys
                .iter()
                .filter_map(|(key, value)| {
                    let path = format!("{section}.{key}");
                    problem(
                        &path,
                        section,
                        Table::from_iter([(key.clone(), value.clone())]),
                    )
                })
                .collect(),
            value => Vec::from_iter(problem_with(
                section,
                Table::from_iter([(section.clone(), value.clone())]),
            )),
        })
        .collect();
    if problems.is_empty() {
        Ok(table)
    } else {
        Err(problems)
    }
}

fn problem(path: &str, section: &str, keys: Table) -> Option<String> {
    problem_with(
        path,
        Table::from_iter([(section.to_owned(), Value::Table(keys))]),
    )
}

fn problem_with(path: &str, policy: Table) -> Option<String> {
    Value::Table(policy)
        .try_into::<Policy>()
        .err()
        .map(|error| format!("{path}: {}", plain(&error.to_string())))
}

fn plain(message: &str) -> String {
    message
        .lines()
        .next()
        .unwrap_or_default()
        .replace("expected u32", "expected a whole number")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn names_every_problem_by_its_key() {
        let problems = check(
            "[screen-lock]\nscreen-of = 60\nlock-after = \"soon\"\n\n[nearby-sharing]\nvisible-to = \"friends\"\n\n[spam]\neggs = 1\n",
        )
        .unwrap_err();
        assert_eq!(problems.len(), 4, "{problems:#?}");
        assert!(problems[0].starts_with("nearby-sharing.visible-to: unknown variant `friends`"));
        assert_eq!(
            problems[1],
            "screen-lock.lock-after: invalid type: string \"soon\", expected a whole number"
        );
        assert!(problems[2].starts_with("screen-lock.screen-of: unknown field `screen-of`"));
        assert!(problems[3].starts_with("spam: unknown field `spam`"));
    }

    #[test]
    fn says_where_the_text_stops_being_toml() {
        let problems = check("[software\n").unwrap_err();
        assert!(problems[0].contains("line 1"), "{problems:?}");
    }

    #[test]
    fn accepts_every_kind_of_key() {
        let table = check(
            "organization.name = \"Acme\"\n[software]\napp-sources = [\"flathub\", \"ubuntu\"]\n[crash-reports]\nsend = \"never\"\n[remote-login]\npasswords = false\n",
        )
        .unwrap();
        let policy: Policy = Value::Table(table).try_into().unwrap();
        assert_eq!(policy.organization.name.as_deref(), Some("Acme"));
        assert!(!policy.software.allows(crate::AppSource::SchelfStore));
        assert!(policy.software.allows(crate::AppSource::Ubuntu));
        assert!(policy.remote_login.allowed);
        assert!(!policy.remote_login.passwords);
    }
}
