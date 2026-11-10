use std::sync::LazyLock;

use sha2::{Digest, Sha256};

pub const WORDS: usize = 12;
pub const SHORTEST_PREFIX: usize = 4;
const LONGEST_WORD: usize = 8;
const ENTROPY: usize = 16;
const INDEX_BITS: usize = 11;
const CHECKSUM_BITS: usize = 4;

static LIST: LazyLock<Vec<&'static str>> =
    LazyLock::new(|| include_str!("english.txt").lines().collect());

pub enum Reading {
    Key(Vec<u8>),
    Mistyped,
    NotAKey,
}

pub fn word(typed: &[u8]) -> Option<&'static str> {
    if typed.len() > LONGEST_WORD {
        return None;
    }
    let mut lower = [0u8; LONGEST_WORD];
    for (letter, byte) in lower.iter_mut().zip(typed) {
        *letter = byte.to_ascii_lowercase();
    }
    let found = std::str::from_utf8(&lower[..typed.len()])
        .ok()
        .and_then(find);
    wipe(&mut lower);
    found
}

fn find(typed: &str) -> Option<&'static str> {
    let list = &*LIST;
    let found = list[list.partition_point(|word| *word < typed)..].first()?;
    (*found == typed || (typed.len() >= SHORTEST_PREFIX && found.starts_with(typed)))
        .then_some(*found)
}

pub fn generate() -> Result<Vec<u8>, getrandom::Error> {
    let mut entropy = [0u8; ENTROPY];
    getrandom::fill(&mut entropy)?;
    let key = encode(&entropy);
    wipe(&mut entropy);
    Ok(key)
}

pub fn encode(entropy: &[u8; ENTROPY]) -> Vec<u8> {
    let bits = u128::from_be_bytes(*entropy);
    let last_bits = 128 - INDEX_BITS * (WORDS - 1);
    let mut indices = [0usize; WORDS];
    for (position, index) in indices.iter_mut().enumerate().take(WORDS - 1) {
        *index = (bits >> (128 - INDEX_BITS * (position + 1))) as usize & 0x7ff;
    }
    indices[WORDS - 1] = ((bits as usize & ((1 << last_bits) - 1)) << CHECKSUM_BITS)
        | usize::from(checksum(entropy));
    let words = indices.map(|index| LIST[index]);
    indices.fill(0);
    joined(&words)
}

pub fn checks(words: &[&str; WORDS]) -> bool {
    let mut bits = 0u128;
    let mut last = 0;
    for (position, word) in words.iter().enumerate() {
        let Ok(index) = LIST.binary_search(word) else {
            return false;
        };
        if position < WORDS - 1 {
            bits |= (index as u128) << (128 - INDEX_BITS * (position + 1));
        } else {
            bits |= (index >> CHECKSUM_BITS) as u128;
            last = index;
        }
    }
    let mut entropy = bits.to_be_bytes();
    let holds = usize::from(checksum(&entropy)) == last & ((1 << CHECKSUM_BITS) - 1);
    wipe(&mut entropy);
    holds
}

fn checksum(entropy: &[u8; ENTROPY]) -> u8 {
    Sha256::digest(entropy)[0] >> (8 - CHECKSUM_BITS)
}

fn joined(words: &[&str; WORDS]) -> Vec<u8> {
    let mut key = Vec::with_capacity(WORDS * (LONGEST_WORD + 1));
    for word in words {
        if !key.is_empty() {
            key.push(b' ');
        }
        key.extend_from_slice(word.as_bytes());
    }
    key
}

pub fn read(typed: &[u8]) -> Reading {
    let mut found = [""; WORDS];
    let mut tokens = typed
        .split(u8::is_ascii_whitespace)
        .filter(|token| !token.is_empty());
    for slot in &mut found {
        match tokens.next().and_then(word) {
            Some(word) => *slot = word,
            None => return Reading::NotAKey,
        }
    }
    if tokens.next().is_some() {
        Reading::NotAKey
    } else if checks(&found) {
        Reading::Key(joined(&found))
    } else {
        Reading::Mistyped
    }
}

fn wipe(bytes: &mut [u8]) {
    for byte in bytes {
        unsafe { std::ptr::write_volatile(byte, 0) };
    }
}

#[cfg(test)]
mod tests;
