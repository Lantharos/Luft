use std::collections::HashMap;

use zbus::names::OwnedUniqueName;

use crate::seat::SignedIn;

/// Whether the person at the computer has it unlocked. Each desktop's shell
/// says when it unlocks, and its word holds only while that shell stays on
/// the bus: one that crashes or is killed leaves its desktop locked.
#[derive(Default)]
pub struct Unlocked {
    signed_in: Option<SignedIn>,
    shells: HashMap<u32, OwnedUniqueName>,
}

impl Unlocked {
    pub fn at(signed_in: Option<SignedIn>) -> Self {
        Self {
            signed_in,
            shells: HashMap::new(),
        }
    }

    pub fn now(&self) -> bool {
        self.signed_in
            .is_some_and(|person| !person.locks || self.shells.contains_key(&person.uid))
    }

    pub fn person(&self) -> Option<u32> {
        self.signed_in.map(|person| person.uid)
    }

    pub fn switch(&mut self, signed_in: Option<SignedIn>) {
        self.signed_in = signed_in;
    }

    pub fn declare(&mut self, uid: u32, shell: OwnedUniqueName, locked: bool) {
        if locked {
            self.shells.remove(&uid);
        } else {
            self.shells.insert(uid, shell);
        }
    }

    pub fn left(&mut self, name: &str) {
        self.shells.retain(|_, shell| shell.as_str() != name);
    }
}
