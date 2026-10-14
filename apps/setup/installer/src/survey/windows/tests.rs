use luft_windows::testing::{Entry, HiveBuilder, Image, Value};

use super::{Hints, Keyboard, hints, inspect, keyboards, zones};

fn entry(path: &'static str, contents: Vec<u8>, age_days: u64) -> Entry {
    Entry {
        path,
        contents,
        age_days,
    }
}

fn user_hive(locale: &'static str, preload: &'static str) -> Vec<u8> {
    HiveBuilder::default()
        .set(
            r"Control Panel\International",
            "LocaleName",
            Value::Sz(locale.into()),
        )
        .set(r"Keyboard Layout\Preload", "1", Value::Sz(preload.into()))
        .build()
}

fn software_hive(product: &'static str, build: &'static str) -> Vec<u8> {
    HiveBuilder::default()
        .set(
            r"Microsoft\Windows NT\CurrentVersion",
            "ProductName",
            Value::Sz(product.into()),
        )
        .set(
            r"Microsoft\Windows NT\CurrentVersion",
            "CurrentBuildNumber",
            Value::Sz(build.into()),
        )
        .build()
}

fn keyboard(layout: &str, variant: &str) -> Option<Keyboard> {
    Some(Keyboard {
        layout: layout.into(),
        variant: variant.into(),
    })
}

#[test]
fn reads_installation_from_newest_user_profile() {
    let system = HiveBuilder::default()
        .set("Select", "Current", Value::Dword(2))
        .set(
            r"ControlSet001\Control\TimeZoneInformation",
            "TimeZoneKeyName",
            Value::Sz("Pacific Standard Time".into()),
        )
        .set(
            r"ControlSet002\Control\TimeZoneInformation",
            "TimeZoneKeyName",
            Value::Sz("W. Europe Standard Time".into()),
        )
        .set(
            r"ControlSet002\Control\Session Manager\Power",
            "HiberbootEnabled",
            Value::Dword(1),
        )
        .build();
    let bob = HiveBuilder::default()
        .set(
            r"Control Panel\International",
            "LocaleName",
            Value::Sz("nl-NL".into()),
        )
        .set(
            r"Keyboard Layout\Preload",
            "1",
            Value::Sz("00000413".into()),
        )
        .set(
            r"Keyboard Layout\Substitutes",
            "00000413",
            Value::Sz("00020409".into()),
        )
        .build();
    let mut hiberfil = b"HIBR".to_vec();
    hiberfil.resize(4096, 0);

    let Some(image) = Image::build(
        "installation",
        &[
            entry("WINDOWS/system32/Config/SYSTEM", system, 1),
            entry(
                "WINDOWS/system32/Config/SOFTWARE",
                software_hive("Windows 10 Pro", "22631"),
                1,
            ),
            entry(
                "WINDOWS/system32/Config/DEFAULT",
                user_hive("ja-JP", "00000411"),
                0,
            ),
            entry("hiberfil.sys", hiberfil, 0),
            entry("Users/alice/NTUSER.DAT", user_hive("en-US", "00000409"), 30),
            entry("Users/bob/NTUSER.DAT", bob, 2),
            entry(
                "Users/Default/NTUSER.DAT",
                user_hive("fr-FR", "0000040C"),
                0,
            ),
        ],
    ) else {
        return;
    };

    let windows = inspect(image.open()).unwrap().unwrap();
    assert_eq!(windows.version.as_deref(), Some("Windows 11 Pro"));
    assert!(windows.hibernated);
    assert!(windows.fast_startup);
    assert!(!windows.dirty);
    assert_eq!(windows.used, image.used_bytes());
    assert_eq!(
        windows.hints,
        Hints {
            timezone: Some("Europe/Berlin".into()),
            keyboard: keyboard("us", "intl"),
            locale: Some("nl_NL".into()),
        }
    );
}

#[test]
fn falls_back_to_default_user_hive() {
    let system = HiveBuilder::default()
        .set("Select", "Current", Value::Dword(1))
        .set(
            r"ControlSet001\Control\TimeZoneInformation",
            "TimeZoneKeyName",
            Value::Sz("Romance Standard Time".into()),
        )
        .set(
            r"ControlSet001\Control\Session Manager\Power",
            "HiberbootEnabled",
            Value::Dword(0),
        )
        .build();
    let mut hiberfil = b"wake".to_vec();
    hiberfil.resize(4096, 0);

    let Some(image) = Image::build(
        "default-hive",
        &[
            entry("Windows/System32/config/SYSTEM", system, 0),
            entry(
                "Windows/System32/config/SOFTWARE",
                software_hive("Windows 10 Home", "19045"),
                0,
            ),
            entry(
                "Windows/System32/config/DEFAULT",
                user_hive("de-DE", "00000407"),
                0,
            ),
            entry("hiberfil.sys", hiberfil, 0),
        ],
    ) else {
        return;
    };

    let windows = inspect(image.open()).unwrap().unwrap();
    assert_eq!(windows.version.as_deref(), Some("Windows 10 Home"));
    assert!(!windows.hibernated);
    assert!(!windows.fast_startup);
    assert_eq!(
        windows.hints,
        Hints {
            timezone: Some("Europe/Paris".into()),
            keyboard: keyboard("de", ""),
            locale: Some("de_DE".into()),
        }
    );
}

#[test]
fn ignores_volumes_without_windows() {
    let Some(image) = Image::build("empty", &[]) else {
        return;
    };
    assert!(inspect(image.open()).unwrap().is_none());
}

#[test]
fn maps_windows_time_zones() {
    assert_eq!(zones::iana("Tokyo Standard Time"), Some("Asia/Tokyo"));
    assert_eq!(zones::iana("UTC"), Some("Etc/UTC"));
    assert_eq!(zones::iana("Mars Standard Time"), None);
}

#[test]
fn maps_keyboard_layouts() {
    assert_eq!(keyboards::xkb("0001041f"), keyboard("tr", "f"));
    assert_eq!(keyboards::xkb("00000807"), keyboard("ch", ""));
    assert_eq!(keyboards::xkb("00000415"), keyboard("pl", ""));
    assert_eq!(keyboards::xkb("E0010804"), None);
}

#[test]
fn converts_locale_names() {
    assert_eq!(hints::posix_locale("pt-BR").as_deref(), Some("pt_BR"));
    assert_eq!(
        hints::posix_locale("sr-Latn-RS").as_deref(),
        Some("sr_RS@latin")
    );
    assert_eq!(hints::posix_locale("es-419"), None);
}
