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

#[cfg(test)]
mod tests {
    use zbus::names::OwnedUniqueName;

    use super::Unlocked;
    use crate::seat::SignedIn;

    const MARA: u32 = 1000;
    const ADA: u32 = 1001;

    fn desktop(uid: u32) -> Option<SignedIn> {
        Some(SignedIn { uid, locks: true })
    }

    fn shell(name: &str) -> OwnedUniqueName {
        OwnedUniqueName::try_from(name).unwrap()
    }

    #[test]
    fn a_desktop_is_unlocked_only_while_its_own_shell_says_so() {
        let mut unlocked = Unlocked::at(None);
        unlocked.declare(MARA, shell(":1.7"), false);
        assert!(!unlocked.now());

        unlocked.switch(desktop(MARA));
        assert!(unlocked.now());
        unlocked.declare(MARA, shell(":1.7"), true);
        assert!(!unlocked.now());

        unlocked.declare(ADA, shell(":1.9"), false);
        assert!(!unlocked.now());
        unlocked.switch(desktop(ADA));
        assert!(unlocked.now());
    }

    #[test]
    fn a_shell_that_leaves_the_bus_leaves_its_desktop_locked() {
        let mut unlocked = Unlocked::at(desktop(MARA));
        unlocked.declare(MARA, shell(":1.7"), false);
        unlocked.left(":1.8");
        assert!(unlocked.now());
        unlocked.left(":1.7");
        assert!(!unlocked.now());
    }

    #[test]
    fn a_text_console_has_no_lock_screen_to_wait_for() {
        let unlocked = Unlocked::at(Some(SignedIn {
            uid: MARA,
            locks: false,
        }));
        assert!(unlocked.now());
        assert_eq!(unlocked.person(), Some(MARA));
    }
}
