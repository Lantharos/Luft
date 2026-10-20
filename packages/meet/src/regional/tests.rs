use super::windows::Settings;
use super::{Hints, Keyboard, canonical_zone};

fn keyboard(layout: &str, variant: &str) -> Keyboard {
    Keyboard {
        layout: layout.into(),
        variant: variant.into(),
    }
}

#[test]
fn windows_settings_from_slovakia() {
    let settings = Settings {
        time_zone: Some("Central Europe Standard Time"),
        locale: Some("sk-SK"),
        language: Some("en-US"),
        keyboards: vec!["0001041b".into(), "00000409".into(), "0001041B".into()],
    };
    assert_eq!(
        settings.hints(),
        Hints {
            language: Some("en_US".into()),
            locale: Some("sk_SK".into()),
            timezone: Some("Europe/Bratislava".into()),
            keyboards: vec![keyboard("sk", "qwerty"), keyboard("us", "")],
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
    assert_eq!(locale("sr-Latn-ME").as_deref(), Some("sr_ME@latin"));
    assert_eq!(locale("uz-Cyrl-UZ").as_deref(), Some("uz_UZ@cyrillic"));
    assert_eq!(locale("es-419"), None);
    assert_eq!(locale("en"), None);
}

#[test]
fn windows_languages_keep_their_region_when_they_have_one() {
    let language = |tag| {
        Settings {
            language: Some(tag),
            ..Settings::default()
        }
        .hints()
        .language
    };
    assert_eq!(language("de-AT").as_deref(), Some("de_AT"));
    assert_eq!(language("sr-Latn-RS").as_deref(), Some("sr_RS@latin"));
    assert_eq!(language("es-419").as_deref(), Some("es"));
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
        canonical_zone("Europe/Bratislava").as_deref(),
        Some("Europe/Bratislava")
    );
    assert_eq!(canonical_zone("Nowhere/Atlantis"), None);
}
