use super::*;

const VECTORS: [(&str, &str); 5] = [
    (
        "00000000000000000000000000000000",
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
    ),
    (
        "7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f",
        "legal winner thank year wave sausage worth useful legal winner thank yellow",
    ),
    (
        "80808080808080808080808080808080",
        "letter advice cage absurd amount doctor acoustic avoid letter advice cage above",
    ),
    (
        "ffffffffffffffffffffffffffffffff",
        "zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong",
    ),
    (
        "9e885d952ad362caeb4efe34a8e91bd2",
        "ozone drill grab fiber curtain grace pudding thank cruise elder eight picnic",
    ),
];

fn entropy(hex: &str) -> [u8; ENTROPY] {
    let mut bytes = [0u8; ENTROPY];
    for (index, byte) in bytes.iter_mut().enumerate() {
        *byte = u8::from_str_radix(&hex[index * 2..index * 2 + 2], 16).unwrap();
    }
    bytes
}

fn key(typed: &str) -> Option<String> {
    match read(typed.as_bytes()) {
        Reading::Key(key) => Some(String::from_utf8(key).unwrap()),
        Reading::Mistyped | Reading::NotAKey => None,
    }
}

#[test]
fn encodes_like_bip39() {
    for (hex, words) in VECTORS {
        assert_eq!(String::from_utf8(encode(&entropy(hex))).unwrap(), words);
    }
}

#[test]
fn reads_generated_keys_back() {
    for _ in 0..64 {
        let made = String::from_utf8(generate().unwrap()).unwrap();
        assert_eq!(key(&made).as_deref(), Some(made.as_str()));
    }
}

#[test]
fn reads_words_by_their_first_letters_in_any_case_and_spacing() {
    assert_eq!(
        key("  LEGA winn thank YEAR\twave sausa worth usef legal winner than yell\n").as_deref(),
        Some(VECTORS[1].1)
    );
}

#[test]
fn short_words_are_typed_whole() {
    assert_eq!(word(b"zoo"), Some("zoo"));
    assert_eq!(word(b"act"), Some("act"));
    assert_eq!(word(b"Acti"), Some("action"));
    assert_eq!(word(b"ab"), None);
    assert_eq!(word(b"abandn"), None);
}

#[test]
fn a_wrong_word_breaks_the_checksum() {
    let swapped = VECTORS[1].1.replacen("thank", "token", 1);
    assert!(matches!(read(swapped.as_bytes()), Reading::Mistyped));
}

#[test]
fn anything_else_is_not_a_key() {
    for typed in [
        "correct horse battery staple",
        "legal winner thank year wave sausage worth useful legal winner thank yellow zoo",
        "legal winner thank year wave sausage worth useful legal winner thank yelow",
        "",
    ] {
        assert!(
            matches!(read(typed.as_bytes()), Reading::NotAKey),
            "{typed}"
        );
    }
}
