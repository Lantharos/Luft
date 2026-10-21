use std::collections::HashMap;

const FOLDER: &str = "/etc/yum.repos.d/";

/// The values shell variables are first given, when they're plain text.
fn assignments(script: &str) -> HashMap<&str, String> {
    let mut values = HashMap::new();
    for line in script.lines() {
        let line = line.trim().trim_start_matches("export ").trim_start();
        let Some((name, value)) = line.split_once('=') else {
            continue;
        };
        let simple = !name.is_empty()
            && name
                .chars()
                .next()
                .is_some_and(|first| !first.is_ascii_digit())
            && name
                .chars()
                .all(|character| character.is_ascii_alphanumeric() || character == '_');
        if !simple || value.contains("$(") || value.contains('`') {
            continue;
        }
        let value = value
            .strip_prefix('"')
            .and_then(|rest| rest.strip_suffix('"'))
            .or_else(|| {
                value
                    .strip_prefix('\'')
                    .and_then(|rest| rest.strip_suffix('\''))
            })
            .unwrap_or(value);
        values.entry(name).or_insert_with(|| value.to_owned());
    }
    values
}

/// Fills in the script's own variables, leaving dnf's, such as `$basearch`, as they are.
fn expand(text: &str, values: &HashMap<&str, String>) -> String {
    let mut expanded = String::new();
    let mut rest = text;
    while let Some(at) = rest.find(['$', '\\']) {
        expanded.push_str(&rest[..at]);
        let after = &rest[at + 1..];
        if rest[at..].starts_with('\\') {
            match after.chars().next() {
                Some(escaped @ ('$' | '\\' | '`')) => {
                    expanded.push(escaped);
                    rest = &after[1..];
                }
                _ => {
                    expanded.push('\\');
                    rest = after;
                }
            }
            continue;
        }
        let (name, used) = match after.strip_prefix('{') {
            Some(braced) => match braced.find('}') {
                Some(end) => (&braced[..end], end + 2),
                None => ("", 0),
            },
            None => {
                let end = after
                    .find(|character: char| !character.is_ascii_alphanumeric() && character != '_')
                    .unwrap_or(after.len());
                (&after[..end], end)
            }
        };
        match values.get(name) {
            Some(value) if !name.is_empty() => {
                expanded.push_str(value);
                rest = &after[used..];
            }
            _ => {
                expanded.push('$');
                rest = after;
            }
        }
    }
    expanded.push_str(rest);
    expanded
}

struct HereDocument<'a> {
    target: &'a str,
    delimiter: &'a str,
    strip_tabs: bool,
    literal: bool,
}

fn word(text: &str) -> &str {
    let text = text.trim_start();
    let end = text
        .find(|character: char| character.is_whitespace() || character == ';')
        .unwrap_or(text.len());
    text[..end].trim_matches(['"', '\''])
}

fn here_document(line: &str) -> Option<HereDocument<'_>> {
    let (before, after) = line.split_once("<<")?;
    let (strip_tabs, after) = match after.strip_prefix('-') {
        Some(rest) => (true, rest),
        None => (false, after),
    };
    let raw = after.trim_start();
    let delimiter = word(raw);
    let redirect = before
        .rsplit_once('>')
        .map(|(_, target)| target)
        .or_else(|| after.split_once('>').map(|(_, target)| target))?;
    Some(HereDocument {
        target: word(redirect),
        delimiter,
        strip_tabs,
        literal: raw.starts_with(['"', '\'']),
    })
}

/// The repository files a package's scriptlets write with `cat > FILE <<EOF`, as dnf would
/// read them: file name and contents.
pub fn written(script: &str) -> Vec<(String, String)> {
    let values = assignments(script);
    let mut found: Vec<(String, String)> = Vec::new();
    let mut lines = script.lines();
    while let Some(line) = lines.next() {
        let Some(document) = here_document(line) else {
            continue;
        };
        let mut body = String::new();
        for line in lines.by_ref() {
            let line = if document.strip_tabs {
                line.trim_start_matches('\t')
            } else {
                line
            };
            if line == document.delimiter {
                break;
            }
            body.push_str(line);
            body.push('\n');
        }
        let target = expand(document.target, &values);
        let Some(name) = target
            .strip_prefix(FOLDER)
            .and_then(|name| name.strip_suffix(".repo"))
        else {
            continue;
        };
        if name.contains('/') || found.iter().any(|(known, _)| known == name) {
            continue;
        }
        let text = if document.literal {
            body
        } else {
            expand(&body, &values)
        };
        found.push((name.to_owned(), text));
    }
    found
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_the_repository_1passwords_scriptlet_writes() {
        let script = "CHANNEL=\"stable\"\nONEPASSWORD_KEY_URL=\"https://downloads.1password.com/linux/keys/1password.asc\"\n\
            installRpmChannel() {\n  case $CHANNEL in\n    \"stable\")\n      NAME=\"1Password Stable Channel\"\n      ;;\n    *)\n      NAME=\"1Password\"\n  esac\n\
            \tcat > /etc/yum.repos.d/1password.repo <<- EOM\n\t[1password]\n\tname=$NAME\n\
            \tbaseurl=https://downloads.1password.com/linux/rpm/${CHANNEL}/\\$basearch\n\tgpgcheck=1\n\
            \tgpgkey=$ONEPASSWORD_KEY_URL\n\tEOM\n\
            cat > /etc/zypp/repos.d/1password.repo <<- EOM\n[1password]\nEOM\n}\n";
        assert_eq!(
            written(script),
            [(
                "1password".to_owned(),
                "[1password]\nname=1Password Stable Channel\n\
                 baseurl=https://downloads.1password.com/linux/rpm/stable/$basearch\ngpgcheck=1\n\
                 gpgkey=https://downloads.1password.com/linux/keys/1password.asc\n"
                    .to_owned()
            )]
        );
    }

    #[test]
    fn follows_a_variable_naming_the_file() {
        let script = "REPOCONFIG=\"https://dl.google.com/linux/chrome/rpm/stable\"\nDEFAULT_ARCH=\"x86_64\"\n\
            YUM_REPO_FILE=\"/etc/yum.repos.d/google-chrome.repo\"\n\
            cat > \"$YUM_REPO_FILE\" << REPOCONTENT\n[google-chrome]\nbaseurl=$REPOCONFIG/$DEFAULT_ARCH\nREPOCONTENT\n";
        assert_eq!(
            written(script),
            [(
                "google-chrome".to_owned(),
                "[google-chrome]\nbaseurl=https://dl.google.com/linux/chrome/rpm/stable/x86_64\n"
                    .to_owned()
            )]
        );
    }
}
