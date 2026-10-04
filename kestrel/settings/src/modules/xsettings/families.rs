use std::io;
use std::path::PathBuf;

use crate::shared::settings::Schemas;

use super::snapshot::INTERFACE;

const FILE: &str = "50-kestrel-families.conf";
const PANGO_WORDS: &str = concat!(
    "normal roman italic oblique small-caps all-small-caps petite-caps ",
    "all-petite-caps unicase title-caps thin ultra-light ultralight extra-light ",
    "extralight light semi-light semilight demi-light demilight book regular medium ",
    "semi-bold semibold demi-bold demibold bold ultra-bold ultrabold extra-bold ",
    "extrabold heavy black ultra-heavy ultraheavy ultra-condensed ultracondensed ",
    "extra-condensed extracondensed condensed semi-condensed semicondensed ",
    "semi-expanded semiexpanded expanded extra-expanded extraexpanded ultra-expanded ",
    "ultraexpanded not-rotated south upside-down north rotated-left east ",
    "rotated-right west"
);

fn is_option(word: &str) -> bool {
    let word = word.to_ascii_lowercase();
    word.starts_with('@')
        || word.starts_with('#')
        || word.trim_end_matches("px").parse::<f64>().is_ok()
        || PANGO_WORDS.split(' ').any(|known| known == word)
}

fn family(description: &str) -> String {
    if let Some((families, _)) = description.split_once(',') {
        return families.trim().to_owned();
    }
    let mut words: Vec<&str> = description.split_whitespace().collect();
    while words.len() > 1 && words.last().is_some_and(|word| is_option(word)) {
        words.pop();
    }
    words.join(" ")
}

fn escape(text: &str) -> String {
    text.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

fn alias(generic: &str, family: &str) -> String {
    format!(
        "  <match target=\"pattern\">\n    <test name=\"family\"><string>{generic}</string></test>\n    <edit name=\"family\" mode=\"prepend\" binding=\"strong\"><string>{}</string></edit>\n  </match>\n",
        escape(family)
    )
}

fn config(settings: &Schemas) -> String {
    let interface = family(&settings.get::<String>(INTERFACE, "font-name"));
    let monospace = family(&settings.get::<String>(INTERFACE, "monospace-font-name"));
    let aliases: String = [
        ("sans-serif", &interface),
        ("system-ui", &interface),
        ("monospace", &monospace),
    ]
    .into_iter()
    .filter(|(_, family)| !family.is_empty())
    .map(|(generic, family)| alias(generic, family))
    .collect();
    format!(
        "<?xml version=\"1.0\"?>\n<!DOCTYPE fontconfig SYSTEM \"urn:fontconfig:fonts.dtd\">\n<fontconfig>\n{aliases}</fontconfig>\n"
    )
}

fn path() -> PathBuf {
    glib::user_config_dir()
        .join("fontconfig")
        .join("conf.d")
        .join(FILE)
}

pub fn write(settings: &Schemas) -> io::Result<bool> {
    let path = path();
    let contents = config(settings);
    if std::fs::read_to_string(&path).is_ok_and(|current| current == contents) {
        return Ok(false);
    }
    if let Some(folder) = path.parent() {
        std::fs::create_dir_all(folder)?;
    }
    std::fs::write(&path, contents)?;
    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::family;

    #[test]
    fn reads_the_family_from_a_font_description() {
        assert_eq!(family("Open Runde 11"), "Open Runde");
        assert_eq!(family("Cantarell Bold Italic 10.5"), "Cantarell");
        assert_eq!(family("Maple Mono NF, 11"), "Maple Mono NF");
        assert_eq!(
            family("Iosevka Term Medium, Bold 12"),
            "Iosevka Term Medium"
        );
        assert_eq!(family("Monospace"), "Monospace");
    }
}
