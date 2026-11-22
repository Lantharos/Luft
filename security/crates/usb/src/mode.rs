use crate::usb::Function;

/// How strictly new USB devices are let in. Each mode also holds new
/// devices back while the screen is locked, except [`Mode::Off`].
#[derive(Clone, Copy, PartialEq, Eq, Debug, Default)]
pub enum Mode {
    Off,
    #[default]
    WhileLocked,
    NoDrives,
    KnownOnly,
}

impl Mode {
    const ALL: [Self; 4] = [
        Self::Off,
        Self::WhileLocked,
        Self::NoDrives,
        Self::KnownOnly,
    ];

    pub fn name(self) -> &'static str {
        match self {
            Self::Off => "off",
            Self::WhileLocked => "while-locked",
            Self::NoDrives => "no-drives",
            Self::KnownOnly => "known-only",
        }
    }

    pub fn named(name: &str) -> Option<Self> {
        Self::ALL.into_iter().find(|mode| mode.name() == name)
    }
}

/// What may connect right now, given the mode and whether the person at
/// the computer has it unlocked.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct Rules {
    pub mode: Mode,
    pub locked: bool,
}

impl Rules {
    fn guards_lock(self) -> bool {
        self.locked && self.mode != Mode::Off
    }

    pub fn holds_devices(self) -> bool {
        self.mode == Mode::KnownOnly || self.guards_lock()
    }

    pub fn holds_parts(self) -> bool {
        self.mode == Mode::NoDrives || self.guards_lock()
    }

    pub fn holds_anything(self) -> bool {
        self.holds_devices() || self.holds_parts()
    }

    pub fn needs_approval(self, known: bool) -> bool {
        self.mode == Mode::KnownOnly && !known
    }

    pub fn admits_device(self, known: bool, functions: &[Function]) -> bool {
        !self.needs_approval(known)
            && (!self.guards_lock() || functions.iter().any(|part| part.usable_while_locked()))
    }

    pub fn admits_part(self, part: Function, drive: bool) -> bool {
        if self.guards_lock() {
            part.usable_while_locked()
        } else {
            self.mode != Mode::NoDrives || !drive
        }
    }

    /// Whether a part that isn't admitted now connects once the computer is
    /// unlocked, rather than staying out for as long as the mode holds.
    pub fn waits_for_unlock(self, part: Function, drive: bool) -> bool {
        self.guards_lock()
            && (Rules {
                locked: false,
                ..self
            })
            .admits_part(part, drive)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const KEYBOARD: Function = Function {
        class: 0x03,
        subclass: 0x01,
        protocol: 0x01,
    };
    const STICK: Function = Function {
        class: 0x08,
        subclass: 0x06,
        protocol: 0x50,
    };
    const NETWORK: Function = Function {
        class: 0x02,
        subclass: 0x0d,
        protocol: 0x00,
    };

    fn rules(mode: Mode, locked: bool) -> Rules {
        Rules { mode, locked }
    }

    #[test]
    fn a_device_nobody_trusted_waits_for_approval_even_while_unlocked() {
        let unlocked = rules(Mode::KnownOnly, false);
        assert!(!unlocked.admits_device(false, &[KEYBOARD]));
        assert!(unlocked.needs_approval(false));
        assert!(unlocked.admits_device(true, &[STICK]));
        assert!(unlocked.holds_devices());
    }

    #[test]
    fn a_trusted_device_still_only_gets_its_keyboard_while_locked() {
        let locked = rules(Mode::KnownOnly, true);
        assert!(!locked.admits_device(false, &[KEYBOARD]));
        assert!(locked.admits_device(true, &[KEYBOARD, STICK]));
        assert!(!locked.admits_device(true, &[STICK]));
        assert!(locked.admits_part(KEYBOARD, false));
        assert!(!locked.admits_part(STICK, true));
        assert!(locked.waits_for_unlock(STICK, true));
    }

    #[test]
    fn no_drives_keeps_drives_out_and_lets_the_rest_in() {
        let unlocked = rules(Mode::NoDrives, false);
        assert!(unlocked.admits_device(false, &[STICK]));
        assert!(!unlocked.admits_part(STICK, true));
        assert!(unlocked.admits_part(NETWORK, false));
        assert!(unlocked.admits_part(KEYBOARD, false));
        assert!(!unlocked.waits_for_unlock(STICK, true));

        let locked = rules(Mode::NoDrives, true);
        assert!(!locked.admits_part(NETWORK, false));
        assert!(locked.waits_for_unlock(NETWORK, false));
        assert!(!locked.waits_for_unlock(STICK, true));
    }

    #[test]
    fn off_lets_everything_in_even_while_locked() {
        let locked = rules(Mode::Off, true);
        assert!(!locked.holds_anything());
        assert!(locked.admits_device(false, &[STICK]));
        assert!(locked.admits_part(STICK, true));
    }

    #[test]
    fn the_default_only_holds_while_locked() {
        assert!(!rules(Mode::WhileLocked, false).holds_anything());
        assert!(rules(Mode::WhileLocked, true).holds_devices());
        assert!(rules(Mode::WhileLocked, false).admits_device(false, &[STICK]));
        assert!(!rules(Mode::WhileLocked, true).admits_device(false, &[STICK]));
    }
}
