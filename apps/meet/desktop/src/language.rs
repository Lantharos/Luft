use std::sync::OnceLock;

#[cfg(target_os = "linux")]
use luft_i18n::{formats, requested as preferred};
use serde::Serialize;
use specta::Type;

use crate::L10N;
#[cfg(windows)]
use crate::windows::regional::{formats, preferred};

const ENGLISH: &str = "en-US";

struct Chosen {
    preferred: Vec<String>,
    locale: &'static str,
    formats: String,
}

#[derive(Serialize, Type)]
pub struct Locale {
    languages: Vec<String>,
    formats: String,
    fixed: bool,
}

static CHOSEN: OnceLock<Chosen> = OnceLock::new();

fn chosen() -> &'static Chosen {
    CHOSEN.get_or_init(|| {
        let preferred = if luft_i18n::overridden() {
            luft_i18n::requested()
        } else {
            preferred()
        };
        Chosen {
            locale: luft_i18n::negotiate(&preferred),
            preferred,
            formats: formats(),
        }
    })
}

pub fn choose() {
    L10N.use_locale(chosen().locale);
}

pub fn shown() -> &'static str {
    chosen().locale
}

pub fn locale() -> Locale {
    let chosen = chosen();
    Locale {
        languages: vec![chosen.locale.to_owned()],
        formats: chosen.formats.clone(),
        fixed: true,
    }
}

pub fn hint() -> &'static str {
    let chosen = chosen();
    chosen
        .preferred
        .iter()
        .find(|tag| luft_i18n::negotiate(&[tag]) == chosen.locale)
        .map_or(ENGLISH, String::as_str)
}
