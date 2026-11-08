const NAMES: &[(&str, &str)] = &[
    ("sr-Latn", "Serbian, in the Latin alphabet"),
    ("sr-Cyrl", "Serbian, in the Cyrillic alphabet"),
    ("sr", "Serbian"),
    ("hr", "Croatian"),
    ("bs", "Bosnian"),
    ("sq", "Albanian"),
    ("de", "German"),
    ("en", "English"),
    ("fr", "French"),
    ("it", "Italian"),
    ("es", "Spanish"),
    ("pt", "Portuguese"),
    ("nl", "Dutch"),
    ("pl", "Polish"),
    ("cs", "Czech"),
    ("sk", "Slovak"),
    ("sl", "Slovenian"),
    ("hu", "Hungarian"),
    ("ro", "Romanian"),
    ("bg", "Bulgarian"),
    ("mk", "Macedonian"),
    ("el", "Greek"),
    ("tr", "Turkish"),
    ("ru", "Russian"),
    ("uk", "Ukrainian"),
    ("sv", "Swedish"),
    ("da", "Danish"),
    ("nb", "Norwegian"),
    ("fi", "Finnish"),
];

/// The language notes are written in, named in English for the model, such
/// as "Serbian, in the Latin alphabet" for `sr-Latn`.
pub fn name(tag: &str) -> &str {
    let base = tag.split('-').next().unwrap_or(tag);
    NAMES
        .iter()
        .find(|(known, _)| *known == tag)
        .or_else(|| NAMES.iter().find(|(known, _)| *known == base))
        .map_or(tag, |(_, name)| name)
}
