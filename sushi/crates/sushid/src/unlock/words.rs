use luft_recovery_key::{self as recovery, SHORTEST_PREFIX, WORDS};
use sushi::scene::{Shown, ShownKey, Slot};

pub struct Words {
    pub typed: usize,
    pub unknown: Option<usize>,
    pub holds: Option<bool>,
}

fn tokens(typed: &[u8]) -> impl Iterator<Item = &[u8]> {
    typed.split(|byte| *byte == b' ')
}

fn known(token: &[u8], current: bool) -> bool {
    (current && token.len() < SHORTEST_PREFIX) || recovery::word(token).is_some()
}

pub fn current(typed: &[u8]) -> usize {
    tokens(typed).count() - 1
}

pub fn can_move_on(typed: &[u8]) -> bool {
    typed.last().is_some_and(|last| *last != b' ') && current(typed) < WORDS - 1
}

pub fn read(typed: &[u8]) -> Words {
    let at = current(typed);
    let mut found = [""; WORDS];
    let mut unknown = None;
    let mut count = 0;
    for (index, token) in tokens(typed)
        .enumerate()
        .filter(|(_, token)| !token.is_empty())
    {
        count += 1;
        match recovery::word(token) {
            Some(word) => found[index] = word,
            None if !known(token, index == at) => {
                unknown.get_or_insert(index);
            }
            None => {}
        }
    }
    let complete = count == WORDS && found.iter().all(|word| !word.is_empty());
    Words {
        typed: count,
        unknown,
        holds: complete.then(|| recovery::checks(&found)),
    }
}

fn lowercase(token: &[u8]) -> Shown {
    Shown::new(String::from_utf8_lossy(token).to_lowercase())
}

pub fn shown(typed: &[u8]) -> ShownKey {
    let current = current(typed);
    let slots = tokens(typed)
        .enumerate()
        .filter(|(_, token)| !token.is_empty())
        .map(|(index, token)| {
            let word = recovery::word(token);
            let completes = token.len() >= SHORTEST_PREFIX;
            match word {
                Some(word) if index != current => Slot {
                    typed: Shown::new(word.to_owned()),
                    rest: Shown::default(),
                    known: true,
                },
                Some(word) if completes => Slot {
                    typed: lowercase(token),
                    rest: Shown::new(word[token.len()..].to_owned()),
                    known: true,
                },
                _ => Slot {
                    typed: lowercase(token),
                    rest: Shown::default(),
                    known: known(token, index == current),
                },
            }
        })
        .collect();
    ShownKey { slots, current }
}
