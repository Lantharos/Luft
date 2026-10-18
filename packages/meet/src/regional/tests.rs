use super::windows::Settings;
use super::{Hints, Keyboard, canonical_zone};

fn keyboard(layout: &str, variant: &str) -> Keyboard {
    Keyboard {
        layout: layout.into(),
        variant: variant.into(),
    }
}

#[test]
fn windows_settings_from_serbia() {
    let settings = Settings {
        time_zone: Some("Central Europe Standard Time"),
        locale: Some("sr-Latn-RS"),
        language: Some("en-US"),
        keyboards: vec!["0000081a".into(), "00000409".into(), "0000081A".into()],
    };
    assert_eq!(
        settings.hints(),
        Hints {
            language: Some("en_US".into()),
            locale: Some("sr_RS@latin".into()),
            timezone: Some("Europe/Belgrade".into()),
            keyboards: vec![keyboard("rs", "latin"), keyboard("us", "")],
        }
    );
}

#[test]
fn windows_time_zones_follow_the_region() {
    let zone = |time_zone, locale| {
        Settings {
            time_zone: Some(time_zone),
            locale,
            ..Settings::default()
        }
        .hints()
        .timezone
    };
    assert_eq!(
        zone("Central Europe Standard Time", None).as_deref(),
        Some("Europe/Budapest")
    );
    assert_eq!(
        zone("India Standard Time", Some("hi-IN")).as_deref(),
        Some("Asia/Kolkata")
    );
    assert_eq!(
        zone("FLE Standard Time", Some("uk-UA")).as_deref(),
        Some("Europe/Kyiv")
    );
    assert_eq!(zone("Mars Standard Time", None), None);
}

#[test]
fn windows_locale_names_become_posix() {
    let locale = |name| {
        Settings {
            locale: Some(name),
            ..Settings::default()
        }
        .hints()
        .locale
    };
    assert_eq!(locale("pt-BR").as_deref(), Some("pt_BR"));
    assert_eq!(locale("de-DE_phoneb").as_deref(), Some("de_DE"));
    assert_eq!(locale("uz-Cyrl-UZ").as_deref(), Some("uz_UZ@cyrillic"));
    assert_eq!(locale("es-419"), None);
    assert_eq!(locale("en"), None);
}

#[test]
fn windows_keyboard_layouts_become_xkb() {
    let keyboards = |klids: &[&str]| {
        Settings {
            keyboards: klids.iter().map(|klid| (*klid).to_owned()).collect(),
            ..Settings::default()
        }
        .hints()
        .keyboards
    };
    assert_eq!(keyboards(&["0001041f"]), [keyboard("tr", "f")]);
    assert_eq!(
        keyboards(&["00020409", "00000807"]),
        [keyboard("us", "intl"), keyboard("ch", "")]
    );
    assert_eq!(keyboards(&["E0010804", "nonsense"]), []);
}

#[test]
fn old_zone_names_become_current_ones() {
    assert_eq!(
        canonical_zone("Europe/Kiev").as_deref(),
        Some("Europe/Kyiv")
    );
    assert_eq!(
        canonical_zone("Europe/Belgrade").as_deref(),
        Some("Europe/Belgrade")
    );
    assert_eq!(canonical_zone("Nowhere/Atlantis"), None);
}
