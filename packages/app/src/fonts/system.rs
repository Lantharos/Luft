use gio::prelude::*;
use serde::{Deserialize, Serialize};

use crate::desktop::typography::{self, INTERFACE, INTERFACE_FONT, MONOSPACE_FONT};

const DEFAULT_SIZE: f64 = 11.0;

pub fn size(description: &str) -> Option<f64> {
    description.split_whitespace().last()?.parse().ok()
}

pub fn describe(family: &str, size: f64) -> String {
    let separator = if family
        .split_whitespace()
        .last()
        .is_some_and(typography::is_option)
    {
        ", "
    } else {
        " "
    };
    format!("{family}{separator}{size}")
}

#[derive(Clone, Copy, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    Interface,
    Monospace,
}

impl Role {
    fn key(self) -> &'static str {
        match self {
            Self::Interface => INTERFACE_FONT,
            Self::Monospace => MONOSPACE_FONT,
        }
    }
}

#[derive(Serialize)]
pub struct Defaults {
    interface: String,
    monospace: String,
}

fn settings() -> gio::Settings {
    gio::Settings::new(INTERFACE)
}

fn default_family(settings: &gio::Settings, role: Role) -> String {
    settings
        .default_value(role.key())
        .and_then(|value| value.str().map(typography::family))
        .unwrap_or_default()
}

pub fn defaults() -> Defaults {
    let settings = settings();
    Defaults {
        interface: default_family(&settings, Role::Interface),
        monospace: default_family(&settings, Role::Monospace),
    }
}

pub fn use_family(role: Role, family: &str) -> Result<(), String> {
    let settings = settings();
    let size = size(&settings.string(role.key())).unwrap_or(DEFAULT_SIZE);
    settings
        .set_string(role.key(), &describe(family, size))
        .map_err(|error| error.to_string())?;
    gio::Settings::sync();
    Ok(())
}

pub fn reset(role: Role) {
    settings().reset(role.key());
    gio::Settings::sync();
}

#[cfg(test)]
mod tests {
    use super::{describe, size};
    use crate::desktop::typography::family;

    #[test]
    fn writes_descriptions_pango_reads_back() {
        assert_eq!(size("Open Runde 11"), Some(11.0));
        assert_eq!(describe("Open Runde", 11.0), "Open Runde 11");
        assert_eq!(
            describe("Inter Display Medium", 12.5),
            "Inter Display Medium, 12.5"
        );
        assert_eq!(
            family(&describe("Inter Display Medium", 12.5)),
            "Inter Display Medium"
        );
    }
}
