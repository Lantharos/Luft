use sabine::BridgeEvent;
use serde::Serialize;
use specta::Type;
use zbus::{OwnedVariant, Proxy};

pub const TYPOGRAPHY_CHANGED: BridgeEvent<Typography> = BridgeEvent::new("appearance.typography");

pub const INTERFACE: &str = "org.gnome.desktop.interface";
pub const INTERFACE_FONT: &str = "font-name";
pub const MONOSPACE_FONT: &str = "monospace-font-name";
const TEXT_SCALE: &str = "text-scaling-factor";

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

pub(crate) fn is_option(word: &str) -> bool {
    let word = word.to_ascii_lowercase();
    word.starts_with('@')
        || word.starts_with('#')
        || word.trim_end_matches("px").parse::<f64>().is_ok()
        || PANGO_WORDS.split(' ').any(|known| known == word)
}

pub fn family(description: &str) -> String {
    if let Some((families, _)) = description.split_once(',') {
        return families.trim().to_owned();
    }
    let mut words: Vec<&str> = description.split_whitespace().collect();
    while words.len() > 1 && words.last().is_some_and(|word| is_option(word)) {
        words.pop();
    }
    words.join(" ")
}

#[derive(Clone, PartialEq, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Typography {
    interface: Option<String>,
    monospace: Option<String>,
    text_scale: f64,
}

impl Default for Typography {
    fn default() -> Self {
        Self {
            interface: None,
            monospace: None,
            text_scale: 1.0,
        }
    }
}

async fn text(proxy: &Proxy<'_>, key: &str) -> Option<String> {
    let value = super::read(proxy, INTERFACE, key).await?;
    let description = String::try_from(value).ok()?;
    Some(family(&description)).filter(|family| !family.is_empty())
}

impl Typography {
    pub async fn read(proxy: &Proxy<'_>) -> Self {
        Self {
            interface: text(proxy, INTERFACE_FONT).await,
            monospace: text(proxy, MONOSPACE_FONT).await,
            text_scale: super::read(proxy, INTERFACE, TEXT_SCALE)
                .await
                .and_then(|value: OwnedVariant| f64::try_from(value).ok())
                .unwrap_or(1.0),
        }
    }

    pub async fn current() -> Self {
        match super::proxy().await {
            Ok(proxy) => Self::read(&proxy).await,
            Err(_) => Self::default(),
        }
    }
}

pub fn changed(namespace: &str, key: &str) -> bool {
    namespace == INTERFACE && [INTERFACE_FONT, MONOSPACE_FONT, TEXT_SCALE].contains(&key)
}

#[cfg(test)]
mod tests {
    use super::family;

    #[test]
    fn reads_the_family_from_a_font_description() {
        assert_eq!(family("Open Runde 11"), "Open Runde");
        assert_eq!(family("Cantarell Bold Italic 10.5"), "Cantarell");
        assert_eq!(family("Maple Mono NF, 11"), "Maple Mono NF");
    }
}
