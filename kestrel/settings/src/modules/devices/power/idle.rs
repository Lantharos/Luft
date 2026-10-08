pub const SCREEN_OFF_AFTER_LOCK: u32 = 30;
const DIM_WITHOUT_SCREEN_OFF: u32 = 60;
const SHORTEST_DIM: u32 = 10;
const WARNING_GAP: u32 = 30;

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum Action {
    Blank,
    Suspend,
    Shutdown,
    Hibernate,
    Interactive,
    Nothing,
    Logout,
}

impl Action {
    pub fn named(name: &str) -> Self {
        match name {
            "blank" => Self::Blank,
            "suspend" => Self::Suspend,
            "shutdown" => Self::Shutdown,
            "hibernate" => Self::Hibernate,
            "interactive" => Self::Interactive,
            "logout" => Self::Logout,
            _ => Self::Nothing,
        }
    }

    pub fn inhibitors(self) -> u32 {
        const LOGOUT: u32 = 1;
        const SUSPEND: u32 = 4;
        const IDLE: u32 = 8;
        match self {
            Self::Blank | Self::Shutdown | Self::Interactive => IDLE,
            Self::Suspend | Self::Hibernate => SUSPEND,
            Self::Logout => LOGOUT,
            Self::Nothing => 0,
        }
    }

    pub fn warns(self) -> bool {
        matches!(self, Self::Logout | Self::Suspend | Self::Hibernate)
    }

    pub fn sleeps(self) -> bool {
        matches!(self, Self::Suspend | Self::Hibernate)
    }
}

pub struct Situation {
    pub screen_locked: bool,
    pub saving_power: bool,
    pub dim_when_idle: bool,
    pub screen_off_delay: u32,
    pub action: Action,
    pub action_delay: u32,
    pub action_allowed: bool,
    pub virtual_machine: bool,
}

#[derive(Default, PartialEq, Debug)]
pub struct Timeouts {
    pub dim: u32,
    pub act: u32,
    pub warn: u32,
}

pub fn timeouts(situation: &Situation) -> Timeouts {
    let dim = if situation.screen_locked {
        0
    } else if situation.saving_power {
        SCREEN_OFF_AFTER_LOCK
    } else if !situation.dim_when_idle {
        0
    } else if situation.screen_off_delay == 0 {
        DIM_WITHOUT_SCREEN_OFF
    } else if situation.screen_off_delay / 2 < SHORTEST_DIM {
        0
    } else {
        situation.screen_off_delay / 2
    };
    let mut act = if situation.action_allowed {
        situation.action_delay
    } else {
        0
    };
    if situation.virtual_machine && situation.action.sleeps() {
        act = 0;
    }
    if act == 0 || situation.action == Action::Nothing {
        return Timeouts {
            dim,
            act: 0,
            warn: 0,
        };
    }
    let mut warn = 0;
    if situation.action.warns() {
        warn = act / 2;
        if dim != 0 && warn == dim {
            warn = if warn > WARNING_GAP {
                warn - WARNING_GAP
            } else {
                dim / 2
            };
        }
        if warn < SHORTEST_DIM {
            warn = 1;
        }
    }
    Timeouts { dim, act, warn }
}
