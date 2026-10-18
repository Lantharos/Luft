/// Serbian is written in both Cyrillic and Latin, and the two map onto each
/// other letter for letter. Recognized Serbian is written in the script the
/// person types in.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Script {
    Latin,
    Cyrillic,
}

const LETTERS: &[(&str, &str)] = &[
    ("а", "a"),
    ("б", "b"),
    ("в", "v"),
    ("г", "g"),
    ("д", "d"),
    ("ђ", "đ"),
    ("е", "e"),
    ("ж", "ž"),
    ("з", "z"),
    ("и", "i"),
    ("ј", "j"),
    ("к", "k"),
    ("л", "l"),
    ("љ", "lj"),
    ("м", "m"),
    ("н", "n"),
    ("њ", "nj"),
    ("о", "o"),
    ("п", "p"),
    ("р", "r"),
    ("с", "s"),
    ("т", "t"),
    ("ћ", "ć"),
    ("у", "u"),
    ("ф", "f"),
    ("х", "h"),
    ("ц", "c"),
    ("ч", "č"),
    ("џ", "dž"),
    ("ш", "š"),
];
const FOREIGN: &[char] = &['q', 'w', 'x', 'y', 'Q', 'W', 'X', 'Y'];

impl Script {
    pub fn for_layout(code: &str, country: &str, variant: &str) -> Self {
        match (code, country) {
            ("sr", "rs") if variant.contains("latin") => Script::Latin,
            ("sr", "me") if !variant.contains("cyrillic") => Script::Latin,
            ("sr", _) => Script::Cyrillic,
            _ => Self::default_for(code),
        }
    }

    pub fn default_for(code: &str) -> Self {
        match code {
            "sr" | "mk" | "bg" | "ru" | "uk" | "be" | "kk" | "mn" | "tg" | "tt" | "ba" => {
                Script::Cyrillic
            }
            _ => Script::Latin,
        }
    }
}

pub fn write(text: &str, code: &str, script: Script) -> String {
    if code != "sr" {
        return text.to_owned();
    }
    match script {
        Script::Latin => to_latin(text),
        Script::Cyrillic => text
            .split_inclusive(char::is_whitespace)
            .map(word_to_cyrillic)
            .collect(),
    }
}

fn to_latin(text: &str) -> String {
    let characters: Vec<char> = text.chars().collect();
    let mut latin = String::with_capacity(text.len());
    for (index, character) in characters.iter().enumerate() {
        let lower = character.to_lowercase().to_string();
        let Some((_, letters)) = LETTERS.iter().find(|(cyrillic, _)| *cyrillic == lower) else {
            latin.push(*character);
            continue;
        };
        if !character.is_uppercase() {
            latin.push_str(letters);
            continue;
        }
        let shouting = characters
            .get(index + 1)
            .is_some_and(|next| next.is_uppercase())
            || index > 0 && characters[index - 1].is_uppercase();
        let mut upper = letters.chars();
        latin.extend(upper.next().into_iter().flat_map(char::to_uppercase));
        if shouting {
            latin.extend(upper.flat_map(char::to_uppercase));
        } else {
            latin.extend(upper);
        }
    }
    latin
}

fn word_to_cyrillic(word: &str) -> String {
    if word.contains(FOREIGN) {
        return word.to_owned();
    }
    let mut cyrillic = String::with_capacity(word.len() * 2);
    let mut rest = word;
    'letters: while let Some(character) = rest.chars().next() {
        for (letter, latin) in LETTERS
            .iter()
            .rev()
            .filter(|(_, latin)| latin.chars().count() == 2)
            .chain(LETTERS)
        {
            let len = latin.len();
            if rest.len() >= len
                && rest.is_char_boundary(len)
                && rest[..len].to_lowercase() == *latin
            {
                if character.is_uppercase() {
                    cyrillic.extend(letter.chars().flat_map(char::to_uppercase));
                } else {
                    cyrillic.push_str(letter);
                }
                rest = &rest[len..];
                continue 'letters;
            }
        }
        cyrillic.push(character);
        rest = &rest[character.len_utf8()..];
    }
    cyrillic
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cyrillic_becomes_latin() {
        assert_eq!(
            write("Љубав и џем, ћао!", "sr", Script::Latin),
            "Ljubav i džem, ćao!"
        );
        assert_eq!(write("ЊУЈОРК", "sr", Script::Latin), "NJUJORK");
    }

    #[test]
    fn latin_becomes_cyrillic() {
        assert_eq!(
            write("Ljubav i džem, ćao!", "sr", Script::Cyrillic),
            "Љубав и џем, ћао!"
        );
        assert_eq!(
            write("Đorđe piše šta želi", "sr", Script::Cyrillic),
            "Ђорђе пише шта жели"
        );
    }

    #[test]
    fn foreign_words_keep_their_spelling() {
        assert_eq!(
            write("Otvori Windows", "sr", Script::Cyrillic),
            "Отвори Windows"
        );
    }

    #[test]
    fn other_languages_are_left_alone() {
        assert_eq!(write("Ljubav", "hr", Script::Cyrillic), "Ljubav");
    }
}
