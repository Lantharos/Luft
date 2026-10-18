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
    assert_eq!(posix("sr_RS.UTF-8@latin").as_deref(), Some("sr_RS@latin"));
    assert_eq!(posix("en_GB.UTF-8").as_deref(), Some("en_GB"));
    assert_eq!(posix("C.UTF-8"), None);
    assert_eq!(posix("POSIX"), None);
}

#[test]
fn reads_gnome_input_sources() {
    assert_eq!(
        from_gnome("[('xkb', 'rs+latin'), ('ibus', 'anthy'), ('xkb', 'us')]\n"),
        [keyboard("rs", "latin"), keyboard("us", "")]
    );
    assert_eq!(from_gnome("@a(ss) []\n"), []);
}

#[test]
fn reads_keyboard_settings_files() {
    assert_eq!(
        from_settings(
            "XKBMODEL=\"pc105\"\nXKBLAYOUT=\"us,rs\"\nXKBVARIANT=\",latin\"\n",
            "XKBLAYOUT",
            "XKBVARIANT"
        ),
        [keyboard("us", ""), keyboard("rs", "latin")]
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
