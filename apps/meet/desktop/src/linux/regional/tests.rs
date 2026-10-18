use luft_meet::regional::Keyboard;

use super::keyboards::{from_gnome, from_settings};
use super::posix;

fn keyboard(layout: &str, variant: &str) -> Keyboard {
    Keyboard {
        layout: layout.into(),
        variant: variant.into(),
    }
}

#[test]
fn locales_lose_their_encoding() {
    assert_eq!(
        posix("uz_UZ.UTF-8@cyrillic").as_deref(),
        Some("uz_UZ@cyrillic")
    );
    assert_eq!(posix("en_GB.UTF-8").as_deref(), Some("en_GB"));
    assert_eq!(posix("C.UTF-8"), None);
    assert_eq!(posix("POSIX"), None);
}

#[test]
fn reads_gnome_input_sources() {
    assert_eq!(
        from_gnome("[('xkb', 'ch+fr'), ('ibus', 'anthy'), ('xkb', 'us')]\n"),
        [keyboard("ch", "fr"), keyboard("us", "")]
    );
    assert_eq!(from_gnome("@a(ss) []\n"), []);
}

#[test]
fn reads_keyboard_settings_files() {
    assert_eq!(
        from_settings(
            "XKBMODEL=\"pc105\"\nXKBLAYOUT=\"us,ua\"\nXKBVARIANT=\",phonetic\"\n",
            "XKBLAYOUT",
            "XKBVARIANT"
        ),
        [keyboard("us", ""), keyboard("ua", "phonetic")]
    );
    assert_eq!(
        from_settings(
            "[Layout]\nLayoutList=de\nUse=true\n",
            "LayoutList",
            "VariantList"
        ),
        [keyboard("de", "")]
    );
    assert_eq!(
        from_settings(
            "Section \"InputClass\"\n        Option \"XkbLayout\" \"de\"\n        Option \"XkbVariant\" \"nodeadkeys\"\nEndSection\n",
            "XkbLayout",
            "XkbVariant"
        ),
        [keyboard("de", "nodeadkeys")]
    );
    assert_eq!(from_settings("KEYMAP=us\n", "XKBLAYOUT", "XKBVARIANT"), []);
}
