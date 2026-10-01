use std::collections::HashMap;
use std::path::{Path, PathBuf};

const SYSTEM: &str = "/etc/X11/Xresources";
const MAX_INCLUDE_DEPTH: usize = 16;
const DISPLAY_DEFINES: [(&str, &str); 5] = [
    ("COLOR", "1"),
    ("CLASS", "TrueColor"),
    ("CLASS_TrueColor", "1"),
    ("PLANES", "24"),
    ("BITS_PER_RGB", "8"),
];

pub type Resources = Vec<(String, String)>;

pub fn load() -> Resources {
    let mut resources = Resources::new();
    if let Ok(text) = std::fs::read_to_string(SYSTEM) {
        merge(&mut resources, &text);
    }
    let user = glib::home_dir().join(".Xresources");
    if let Ok(text) = std::fs::read_to_string(&user) {
        let mut preprocessor = Preprocessor::new();
        let mut output = String::new();
        preprocessor.run(
            &text,
            user.parent().unwrap_or(Path::new("/")),
            0,
            &mut output,
        );
        merge(&mut resources, &output);
    }
    resources
}

fn merge(resources: &mut Resources, text: &str) {
    let joined = text.replace("\\\n", "");
    for line in joined.lines() {
        let line = line.trim_start();
        if line.is_empty() || line.starts_with('!') || line.starts_with('#') {
            continue;
        }
        let Some((name, value)) = line.split_once(':') else {
            continue;
        };
        let name = name.trim();
        let value = value.trim_start();
        match resources.iter_mut().find(|(existing, _)| existing == name) {
            Some(entry) => entry.1 = value.to_owned(),
            None => resources.push((name.to_owned(), value.to_owned())),
        }
    }
}

struct Preprocessor {
    defines: HashMap<String, String>,
    conditions: Vec<Condition>,
}

#[derive(Clone, Copy)]
struct Condition {
    active: bool,
    taken: bool,
}

impl Preprocessor {
    fn new() -> Self {
        Self {
            defines: DISPLAY_DEFINES
                .iter()
                .map(|(name, value)| ((*name).to_owned(), (*value).to_owned()))
                .collect(),
            conditions: Vec::new(),
        }
    }

    fn emitting(&self) -> bool {
        self.conditions.iter().all(|condition| condition.active)
    }

    fn run(&mut self, text: &str, directory: &Path, depth: usize, output: &mut String) {
        for line in strip_comments(&text.replace("\\\n", "")).lines() {
            let trimmed = line.trim_start();
            match trimmed.strip_prefix('#') {
                Some(directive) => self.directive(directive.trim_start(), directory, depth, output),
                None if self.emitting() => {
                    output.push_str(&self.expand(line));
                    output.push('\n');
                }
                None => {}
            }
        }
    }

    fn directive(&mut self, directive: &str, directory: &Path, depth: usize, output: &mut String) {
        let (keyword, rest) = directive
            .split_once(char::is_whitespace)
            .unwrap_or((directive, ""));
        let rest = rest.trim();
        match keyword {
            "ifdef" | "ifndef" => {
                let defined = self.defines.contains_key(first_word(rest));
                self.open(defined == (keyword == "ifdef"));
            }
            "if" => {
                let holds = self.holds(rest);
                self.open(holds);
            }
            "else" => {
                if let Some(condition) = self.conditions.last_mut() {
                    condition.active = !condition.taken;
                    condition.taken = true;
                }
            }
            "endif" => {
                self.conditions.pop();
            }
            _ if !self.emitting() => {}
            "define" => {
                let (name, value) = rest.split_once(char::is_whitespace).unwrap_or((rest, ""));
                if !name.contains('(') {
                    self.defines
                        .insert(name.to_owned(), value.trim().to_owned());
                }
            }
            "undef" => {
                self.defines.remove(first_word(rest));
            }
            "include" if depth < MAX_INCLUDE_DEPTH => {
                let path = include_path(rest, directory);
                if let Some(text) = path
                    .as_ref()
                    .and_then(|path| std::fs::read_to_string(path).ok())
                {
                    let parent = path.as_deref().and_then(Path::parent).unwrap_or(directory);
                    self.run(&text, parent, depth + 1, output);
                }
            }
            _ => {}
        }
    }

    fn open(&mut self, active: bool) {
        self.conditions.push(Condition {
            active,
            taken: active,
        });
    }

    fn holds(&self, expression: &str) -> bool {
        let expression = expression.trim();
        if let Some(negated) = expression.strip_prefix('!') {
            return !self.holds(negated);
        }
        if let Some(name) = expression.strip_prefix("defined") {
            let name = name
                .trim()
                .trim_start_matches('(')
                .trim_end_matches(')')
                .trim();
            return self.defines.contains_key(name);
        }
        let expanded = self.expand(expression);
        for operator in [">=", "<=", "==", "!=", ">", "<"] {
            if let Some((left, right)) = expanded.split_once(operator) {
                let (Some(left), Some(right)) = (number(left), number(right)) else {
                    return false;
                };
                return match operator {
                    ">=" => left >= right,
                    "<=" => left <= right,
                    "==" => left == right,
                    "!=" => left != right,
                    ">" => left > right,
                    _ => left < right,
                };
            }
        }
        number(&expanded).is_some_and(|value| value != 0)
    }

    fn expand(&self, line: &str) -> String {
        let mut text = line.to_owned();
        for _ in 0..MAX_INCLUDE_DEPTH {
            let next = self.substitute(&text);
            if next == text {
                break;
            }
            text = next;
        }
        text
    }

    fn substitute(&self, text: &str) -> String {
        let mut output = String::with_capacity(text.len());
        let mut rest = text;
        while let Some(start) = rest.find(is_identifier_start) {
            output.push_str(&rest[..start]);
            let word = &rest[start..];
            let end = word
                .find(|character: char| !is_identifier(character))
                .unwrap_or(word.len());
            let identifier = &word[..end];
            output.push_str(
                self.defines
                    .get(identifier)
                    .map_or(identifier, String::as_str),
            );
            rest = &word[end..];
        }
        output.push_str(rest);
        output
    }
}

fn strip_comments(text: &str) -> String {
    let mut output = String::with_capacity(text.len());
    let mut rest = text;
    while let Some(start) = rest.find("/*") {
        output.push_str(&rest[..start]);
        let Some(end) = rest[start + 2..].find("*/") else {
            return output;
        };
        let comment = &rest[start..start + 2 + end + 2];
        output.extend(comment.chars().filter(|character| *character == '\n'));
        output.push(' ');
        rest = &rest[start + 2 + end + 2..];
    }
    output.push_str(rest);
    output
}

fn include_path(argument: &str, directory: &Path) -> Option<PathBuf> {
    let name = argument
        .strip_prefix('"')
        .and_then(|name| name.strip_suffix('"'))
        .or_else(|| {
            argument
                .strip_prefix('<')
                .and_then(|name| name.strip_suffix('>'))
        })?;
    let path = Path::new(name);
    Some(if path.is_absolute() {
        path.to_path_buf()
    } else {
        directory.join(path)
    })
}

fn number(text: &str) -> Option<i64> {
    text.trim().parse().ok()
}

fn first_word(text: &str) -> &str {
    text.split_whitespace().next().unwrap_or_default()
}

fn is_identifier_start(character: char) -> bool {
    character.is_ascii_alphabetic() || character == '_'
}

fn is_identifier(character: char) -> bool {
    character.is_ascii_alphanumeric() || character == '_'
}
