mod a11y;
mod housekeeping;
mod keyboard;
mod night_light;
mod power;
mod printers;
mod rfkill;
mod sound;
mod timezone;
mod xsettings;

use crate::context::Context;

#[derive(Clone, Copy)]
pub enum Module {
    A11y,
    Housekeeping,
    Keyboard,
    NightLight,
    Power,
    Printers,
    Rfkill,
    Sound,
    Timezone,
    Xsettings,
}

impl Module {
    pub const ALL: [Self; 10] = [
        Self::A11y,
        Self::Housekeeping,
        Self::Keyboard,
        Self::NightLight,
        Self::Power,
        Self::Printers,
        Self::Rfkill,
        Self::Sound,
        Self::Timezone,
        Self::Xsettings,
    ];

    pub fn named(name: &str) -> Option<Self> {
        Self::ALL.into_iter().find(|module| module.name() == name)
    }

    fn name(self) -> &'static str {
        match self {
            Self::A11y => "a11y",
            Self::Housekeeping => "housekeeping",
            Self::Keyboard => "keyboard",
            Self::NightLight => "night-light",
            Self::Power => "power",
            Self::Printers => "printers",
            Self::Rfkill => "rfkill",
            Self::Sound => "sound",
            Self::Timezone => "timezone",
            Self::Xsettings => "xsettings",
        }
    }

    pub async fn start(self, context: &Context) {
        let started = match self {
            Self::A11y => a11y::start(context).await,
            Self::Housekeeping => housekeeping::start(context).await,
            Self::Keyboard => keyboard::start(context).await,
            Self::NightLight => night_light::start(context).await,
            Self::Power => power::start(context).await,
            Self::Printers => printers::start(context).await,
            Self::Rfkill => rfkill::start(context).await,
            Self::Sound => sound::start(context).await,
            Self::Timezone => timezone::start(context).await,
            Self::Xsettings => xsettings::start(context).await,
        };
        if let Err(error) = started {
            eprintln!("Couldn't start {}: {error}", self.name());
        }
    }
}
