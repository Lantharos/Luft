use anyhow::{Context, Result};

const WORD_START: char = '\u{2581}';

/// The SentencePiece pieces Parakeet speaks in, by id. The last one is the
/// blank that means nothing new was heard.
pub struct Vocabulary {
    pieces: Vec<String>,
}

impl Vocabulary {
    pub fn parse(text: &str) -> Result<Self> {
        let mut pieces = Vec::new();
        for line in text.lines().filter(|line| !line.is_empty()) {
            let (piece, id) = line
                .rsplit_once(' ')
                .context("A vocabulary line has no id")?;
            let id: usize = id.parse().context("A vocabulary id isn't a number")?;
            if pieces.len() <= id {
                pieces.resize(id + 1, String::new());
            }
            pieces[id] = piece.to_owned();
        }
        Ok(Self { pieces })
    }

    pub fn len(&self) -> usize {
        self.pieces.len()
    }

    pub fn blank(&self) -> usize {
        self.pieces.len() - 1
    }

    pub fn text(&self, ids: &[usize]) -> String {
        let joined: String = ids
            .iter()
            .filter_map(|id| self.pieces.get(*id))
            .filter(|piece| !(piece.starts_with('<') && piece.ends_with('>')))
            .map(String::as_str)
            .collect();
        joined.replace(WORD_START, " ").trim().to_owned()
    }
}

#[cfg(test)]
mod tests {
    use super::Vocabulary;

    #[test]
    fn pieces_join_into_words() {
        let vocabulary =
            Vocabulary::parse("<unk> 0\n\u{2581}hel 1\nlo 2\n\u{2581}world 3\n, 4\n<blk> 5\n")
                .unwrap();
        assert_eq!(vocabulary.blank(), 5);
        assert_eq!(vocabulary.text(&[1, 2, 4, 3]), "hello, world");
        assert_eq!(vocabulary.text(&[0, 1, 2]), "hello");
    }
}
