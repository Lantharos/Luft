use crate::L10N;

const CHOSEN: &str = "/run/luft-installer/language";

fn use_locale(requested: &str) {
    L10N.use_locale(requested);
    luft_trust::L10N.use_locale(requested);
}

pub fn restore() {
    if let Ok(locale) = std::fs::read_to_string(CHOSEN) {
        use_locale(locale.trim());
    }
}

pub fn choose(requested: &str) {
    use_locale(requested);
    if let Err(error) = std::fs::write(CHOSEN, L10N.locale()) {
        eprintln!("The setup language wasn't remembered: {error}");
    }
}
