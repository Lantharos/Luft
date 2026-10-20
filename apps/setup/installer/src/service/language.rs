use crate::L10N;

const CHOSEN: &str = "/run/luft-installer/language";

pub fn restore() {
    if let Ok(locale) = std::fs::read_to_string(CHOSEN) {
        L10N.use_locale(locale.trim());
    }
}

pub fn choose(requested: &str) {
    L10N.use_locale(requested);
    if let Err(error) = std::fs::write(CHOSEN, L10N.locale()) {
        eprintln!("The setup language wasn't remembered: {error}");
    }
}
