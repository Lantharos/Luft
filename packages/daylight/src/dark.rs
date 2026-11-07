use std::time::Duration;

use crate::clock::{Window, hours, is_between};
use crate::sun::Daylight;

const DAY_MICROSECONDS: i64 = 24 * 60 * 60 * 1_000_000;

pub enum Schedule {
    Custom(Window),
    Sunset { unlocated: Window },
}

pub enum Plan {
    Window(Window),
    Always(bool),
}

impl Schedule {
    pub fn parse(name: &str, custom: Window) -> Option<Self> {
        match name {
            "custom" => Some(Self::Custom(custom)),
            "sunset" => Some(Self::Sunset { unlocated: custom }),
            _ => None,
        }
    }

    pub fn plan(&self, daylight: Option<&Daylight>) -> Plan {
        match (self, daylight) {
            (Self::Custom(window), _) | (Self::Sunset { unlocated: window }, None) => {
                Plan::Window(*window)
            }
            (Self::Sunset { .. }, Some(Daylight::Sun(sun))) => Plan::Window(Window {
                from: sun.sunset,
                to: sun.sunrise,
            }),
            (Self::Sunset { .. }, Some(Daylight::PolarNight)) => Plan::Always(true),
            (Self::Sunset { .. }, Some(Daylight::PolarDay)) => Plan::Always(false),
        }
    }
}

impl Plan {
    pub fn is_dark(&self, now: &glib::DateTime) -> bool {
        match self {
            Self::Window(window) => is_between(hours(now), window.from, window.to),
            Self::Always(dark) => *dark,
        }
    }

    pub fn passed_change(&self, evaluated_at: &glib::DateTime, now: &glib::DateTime) -> bool {
        let elapsed = now.difference(evaluated_at).as_microseconds();
        if elapsed >= DAY_MICROSECONDS {
            return true;
        }
        let Self::Window(window) = self else {
            return false;
        };
        let (before, after) = (hours(evaluated_at), hours(now));
        elapsed > 0
            && before != after
            && (is_between(window.from, before, after) || is_between(window.to, before, after))
    }

    pub fn next_change(&self, now: &glib::DateTime) -> Duration {
        let hour = hours(now);
        let until = |change: f64| {
            let ahead = (change - hour).rem_euclid(24.0);
            if ahead > 0.0 { ahead } else { 24.0 }
        };
        let ahead = match self {
            Self::Window(window) => until(window.from).min(until(window.to)),
            Self::Always(_) => until(0.0),
        };
        Duration::from_secs_f64(ahead * 3600.0)
    }
}
