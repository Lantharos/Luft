use std::ffi::CStr;
use std::fs;
use std::path::Path;

use crate::store::Person;

const FINGERPRINTS: &str = "/var/lib/fprint";

pub const SECURITY_KEY: &str = "security-key";
pub const SMART_CARD: &str = "smart-card";
pub const FINGERPRINT: &str = "fingerprint";
pub const PASSWORD: &str = "password";

/// Whether fprintd keeps a fingerprint of `user`, in any reader's folder.
pub fn has_fingerprints(user: &str) -> bool {
    fn any_file(path: &Path) -> bool {
        fs::read_dir(path)
            .into_iter()
            .flatten()
            .flatten()
            .any(|entry| {
                let path = entry.path();
                if path.is_dir() { any_file(&path) } else { true }
            })
    }
    !user.is_empty() && !user.contains('/') && any_file(&Path::new(FINGERPRINTS).join(user))
}

/// The ways someone can sign in, best first. Password comes last, and only
/// while they keep it on or nothing else is left, so turning it off can
/// never lock anyone out.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Ways {
    pub security_key: bool,
    pub smart_card: bool,
    pub fingerprint: bool,
    pub password_chosen: bool,
}

impl Ways {
    pub fn of(person: &Person, fingerprint: bool) -> Self {
        Self {
            security_key: !person.keys.is_empty(),
            smart_card: !person.cards.is_empty(),
            fingerprint,
            password_chosen: person.password,
        }
    }

    pub fn has_another(self) -> bool {
        self.security_key || self.smart_card || self.fingerprint
    }

    pub fn password(self) -> bool {
        self.password_chosen || !self.has_another()
    }

    pub fn names(self) -> Vec<String> {
        [
            (self.security_key, SECURITY_KEY),
            (self.smart_card, SMART_CARD),
            (self.fingerprint, FINGERPRINT),
            (self.password(), PASSWORD),
        ]
        .into_iter()
        .filter(|(available, _)| *available)
        .map(|(_, name)| name.to_owned())
        .collect()
    }
}

pub fn user_name(uid: u32) -> Option<String> {
    let entry = unsafe { libc::getpwuid(uid) };
    (!entry.is_null()).then(|| {
        unsafe { CStr::from_ptr((*entry).pw_name) }
            .to_string_lossy()
            .into_owned()
    })
}

pub fn uid_of(name: &str) -> Option<u32> {
    let name = std::ffi::CString::new(name).ok()?;
    let entry = unsafe { libc::getpwnam(name.as_ptr()) };
    (!entry.is_null()).then(|| unsafe { (*entry).pw_uid })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn password_stays_until_another_way_is_there() {
        let person = Person {
            password: false,
            ..Person::default()
        };
        let nothing_else = Ways::of(&person, false);
        assert!(nothing_else.password());
        assert_eq!(nothing_else.names(), [PASSWORD]);
        let fingerprint = Ways::of(&person, true);
        assert!(!fingerprint.password());
        assert_eq!(fingerprint.names(), [FINGERPRINT]);
    }

    #[test]
    fn ways_come_best_first() {
        let mut person = Person::default();
        person.cards.push(crate::store::SmartCard {
            id: "c".into(),
            name: "Badge".into(),
            certificate: Vec::new(),
            wrap: None,
            reader: None,
        });
        assert_eq!(
            Ways::of(&person, true).names(),
            [SMART_CARD, FINGERPRINT, PASSWORD]
        );
    }
}
