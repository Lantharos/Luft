use std::collections::BTreeMap;
use std::sync::Mutex;

use super::escl::Pin;

const FILE: &str = "com.lantharos.flatbed/scanners.json";

static CERTIFICATES: Mutex<Option<BTreeMap<String, String>>> = Mutex::new(None);

fn change<T>(change: impl FnOnce(&mut BTreeMap<String, String>) -> T) -> T {
    let mut certificates = CERTIFICATES.lock().expect("known scanners lock");
    change(certificates.get_or_insert_with(|| luft_app::settings::load(FILE).unwrap_or_default()))
}

fn save(certificates: &BTreeMap<String, String>) {
    if let Err(error) = luft_app::settings::save(FILE, certificates) {
        eprintln!("flatbed: couldn't remember a scanner's certificate: {error}");
    }
}

/// The certificate the scanner `id` has to show, once it's been seen.
pub fn pin(id: &str) -> Pin {
    Pin::expecting(change(|certificates| certificates.get(id).cloned()))
}

/// Remembers the certificate a scanner showed the first time.
pub fn remember(id: &str, pin: &Pin) {
    if let Some(first) = pin.first() {
        change(|certificates| {
            certificates.insert(id.to_owned(), first);
            save(certificates);
        });
    }
}

/// Forgets a scanner's certificate, so the one it shows next is trusted.
pub fn forget(id: &str) {
    change(|certificates| {
        if certificates.remove(id).is_some() {
            save(certificates);
        }
    });
}
