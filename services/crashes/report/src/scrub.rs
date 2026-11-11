//! Taking what could say who someone is out of the text of a report: paths
//! in home folders, email addresses, and the account's names and the
//! computer's.

const HOMES: [&str; 2] = ["/var/home/", "/home/"];
const CRATES: &str = "/.cargo/registry/src/";
const HIDDEN_PATH: &str = "~/…";
const HIDDEN: &str = "…";
const SHORTEST_NAME: usize = 3;

const QUOTES: &str = "\"'`";

/// Where a path ends: at its closing quote when it is quoted, which lets it
/// hold spaces, otherwise at a space, a bracket around it, or the colon
/// before a message or a line number.
fn path_length(path: &str, quote: Option<char>) -> usize {
    let bytes = path.as_bytes();
    path.char_indices()
        .find(|&(at, character)| match quote {
            Some(quote) => character == quote || character == '\n',
            None => {
                character.is_whitespace()
                    || QUOTES.contains(character)
                    || ")]>,;".contains(character)
                    || (character == ':'
                        && bytes
                            .get(at + 1)
                            .is_some_and(|next| *next == b' ' || next.is_ascii_digit()))
            }
        })
        .map_or(path.len(), |(at, _)| at)
}

/// A path in a home folder becomes `~/…`, except a crate's source in
/// Cargo's registry, which keeps the crate and the file within it.
fn without_homes(text: &str) -> String {
    let mut scrubbed = String::with_capacity(text.len());
    let mut rest = text;
    while let Some(at) = HOMES.iter().filter_map(|home| rest.find(home)).min() {
        scrubbed.push_str(&rest[..at]);
        let quote = rest[..at]
            .chars()
            .next_back()
            .filter(|before| QUOTES.contains(*before));
        let (path, after) = rest[at..].split_at(path_length(&rest[at..], quote));
        match path.find(CRATES).map(|found| &path[found + CRATES.len()..]) {
            Some(registry) => scrubbed.push_str(
                registry
                    .split_once('/')
                    .map_or(HIDDEN_PATH, |(_, source)| source),
            ),
            None => scrubbed.push_str(HIDDEN_PATH),
        }
        rest = after;
    }
    scrubbed.push_str(rest);
    scrubbed
}

fn is_address_character(character: char) -> bool {
    character.is_ascii_alphanumeric() || "._%+-".contains(character)
}

fn without_addresses(text: &str) -> String {
    let words: Vec<&str> = text
        .split_inclusive(|character: char| !is_address_character(character) && character != '@')
        .collect();
    words
        .iter()
        .map(|word| {
            let bare = word.trim_end_matches(|character: char| {
                !is_address_character(character) && character != '@'
            });
            let address = bare.split_once('@').is_some_and(|(local, domain)| {
                !local.is_empty()
                    && domain.rsplit_once('.').is_some_and(|(host, top)| {
                        !host.is_empty()
                            && top.len() >= 2
                            && top.chars().all(|c| c.is_ascii_alphabetic())
                    })
            });
            if address {
                word.replacen(bare, HIDDEN, 1)
            } else {
                (*word).to_owned()
            }
        })
        .collect()
}

fn replace_ignoring_case(text: &str, word: &str) -> String {
    let lower = text.to_lowercase();
    let word = word.to_lowercase();
    if lower.len() != text.len() || !lower.contains(&word) {
        return text.to_owned();
    }
    let mut scrubbed = String::with_capacity(text.len());
    let mut from = 0;
    for (at, _) in lower.match_indices(&word) {
        scrubbed.push_str(&text[from..at]);
        scrubbed.push_str(HIDDEN);
        from = at + word.len();
    }
    scrubbed.push_str(&text[from..]);
    scrubbed
}

pub struct Scrubber {
    names: Vec<String>,
}

impl Scrubber {
    /// Hides `names`, such as the account's login and real name and the
    /// computer's name, wherever they show up.
    pub fn hiding(names: impl IntoIterator<Item = String>) -> Self {
        let mut names: Vec<String> = names
            .into_iter()
            .flat_map(|name| {
                let parts: Vec<String> = name.split_whitespace().map(str::to_owned).collect();
                std::iter::once(name).chain(parts)
            })
            .map(|name| name.trim().to_owned())
            .filter(|name| name.chars().count() >= SHORTEST_NAME)
            .collect();
        names.sort_by_key(|name| std::cmp::Reverse(name.len()));
        names.dedup();
        Self { names }
    }

    pub fn text(&self, text: &str, longest: usize) -> String {
        let scrubbed = without_addresses(&without_homes(text));
        let scrubbed = self
            .names
            .iter()
            .fold(scrubbed, |text, name| replace_ignoring_case(&text, name));
        scrubbed.chars().take(longest).collect()
    }
}

#[cfg(test)]
mod tests {
    use super::Scrubber;

    fn scrub(text: &str) -> String {
        Scrubber::hiding([
            "mara".to_owned(),
            "Mara Lindqvist".to_owned(),
            "maras-laptop".to_owned(),
        ])
        .text(text, 1000)
    }

    #[test]
    fn hides_home_folders() {
        assert_eq!(
            scrub("couldn't open \"/var/home/mara/Documents/Tax 2025.pdf\": denied"),
            "couldn't open \"~/…\": denied"
        );
        assert_eq!(
            scrub("at file:///home/someone/x.js:3:1"),
            "at file://~/…:3:1"
        );
    }

    #[test]
    fn keeps_where_a_crate_panicked() {
        assert_eq!(
            scrub(
                "/var/home/mara/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/tokio-1.54.0/src/runtime/park.rs:12:5"
            ),
            "tokio-1.54.0/src/runtime/park.rs:12:5"
        );
    }

    #[test]
    fn hides_addresses_and_names() {
        assert_eq!(
            scrub("no account mara.l@example.org for Mara Lindqvist on MARAS-LAPTOP"),
            "no account … for … on …"
        );
    }

    #[test]
    fn leaves_script_frames_alone() {
        let frame = "vfunc_repaint@resource:///com/lantharos/kestrel/kestrel.js:18240:70";
        assert_eq!(scrub(frame), frame);
    }
}
