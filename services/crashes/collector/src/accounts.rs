//! Whose a crash is.

use luft_crash_report::PEOPLE;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Owner {
    Person(u32),
    System,
}

impl Owner {
    pub fn of(uid: u64) -> Self {
        u32::try_from(uid)
            .ok()
            .filter(|uid| PEOPLE.contains(uid))
            .map_or(Self::System, Self::Person)
    }

    pub fn folder(self) -> String {
        match self {
            Self::Person(uid) => uid.to_string(),
            Self::System => "system".into(),
        }
    }
}
