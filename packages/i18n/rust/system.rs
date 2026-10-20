use std::collections::HashMap;
use std::fs;

const LOCALE_DIR: &str = "/usr/share/locale";
const MAGIC: u32 = 0x9504_12de;

pub struct SystemCatalog(HashMap<String, String>);

impl SystemCatalog {
    pub fn load(domains: &[&str], locale: &str) -> Self {
        let messages = folders(locale)
            .iter()
            .flat_map(|folder| {
                domains
                    .iter()
                    .map(move |domain| format!("{LOCALE_DIR}/{folder}/LC_MESSAGES/{domain}.mo"))
            })
            .find_map(|path| fs::read(path).ok())
            .and_then(|bytes| parse(&bytes))
            .unwrap_or_default();
        Self(messages)
    }

    pub fn translate<'a>(&'a self, text: &'a str) -> &'a str {
        self.0.get(text).map_or(text, String::as_str)
    }
}

fn folders(locale: &str) -> Vec<String> {
    let mut parts = locale.split('-');
    let language = parts.next().unwrap_or_default();
    let mut script = None;
    let mut region = None;
    for part in parts {
        if part.len() == 4 {
            script = Some(part);
        } else {
            region = Some(part);
        }
    }
    let base = match script {
        Some("Latn") => format!("{language}@latin"),
        _ => language.to_owned(),
    };
    region
        .map(|region| format!("{language}_{region}"))
        .into_iter()
        .chain([base])
        .collect()
}

fn parse(bytes: &[u8]) -> Option<HashMap<String, String>> {
    let word = |at: usize, big: bool| -> Option<u32> {
        let raw: [u8; 4] = bytes.get(at..at + 4)?.try_into().ok()?;
        Some(if big {
            u32::from_be_bytes(raw)
        } else {
            u32::from_le_bytes(raw)
        })
    };
    let big = word(0, false)? != MAGIC;
    if word(0, big)? != MAGIC {
        return None;
    }
    let count = word(8, big)? as usize;
    let originals = word(12, big)? as usize;
    let translations = word(16, big)? as usize;
    let string = |table: usize, index: usize| -> Option<&str> {
        let length = word(table + index * 8, big)? as usize;
        let offset = word(table + index * 8 + 4, big)? as usize;
        std::str::from_utf8(bytes.get(offset..offset + length)?).ok()
    };
    Some(
        (0..count)
            .filter_map(|index| Some((string(originals, index)?, string(translations, index)?)))
            .filter(|(original, translation)| {
                !original.is_empty() && !original.contains('\0') && !translation.is_empty()
            })
            .map(|(original, translation)| (original.to_owned(), translation.to_owned()))
            .collect(),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finds_regional_and_script_folders() {
        assert_eq!(folders("pt-BR"), ["pt_BR", "pt"]);
        assert_eq!(folders("sr-Latn"), ["sr@latin"]);
        assert_eq!(folders("hu"), ["hu"]);
    }
}
