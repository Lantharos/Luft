use crate::shared::settings::Schemas;

use super::schedule::{self, Daylight, Window};

pub const SCHEMA: &str = "com.lantharos.kestrel";
pub const INTERFACE: &str = "org.gnome.desktop.interface";
const DAY_MICROSECONDS: i64 = 24 * 60 * 60 * 1_000_000;

enum Plan {
    Window(Window),
    Always(bool),
}

#[derive(Default)]
pub struct DarkSchedule {
    evaluated_at: Option<glib::DateTime>,
}

pub fn follows_sun(settings: &Schemas) -> bool {
    settings.get::<String>(SCHEMA, "dark-schedule") == "sunset"
}

pub fn is_schedule_key(schema: &str, key: &str) -> bool {
    schema == SCHEMA && key.starts_with("dark-schedule")
}

impl DarkSchedule {
    pub fn restart(&mut self) {
        self.evaluated_at = None;
    }

    pub fn update(&mut self, settings: &Schemas, now: &glib::DateTime, daylight: Option<&Daylight>) {
        let Some(plan) = plan(settings, daylight) else {
            self.evaluated_at = None;
            return;
        };
        let due = self
            .evaluated_at
            .as_ref()
            .is_none_or(|evaluated_at| passed_change(&plan, evaluated_at, now));
        self.evaluated_at = Some(now.clone());
        if due {
            set_dark(settings, is_dark(&plan, schedule::hours(now)));
        }
    }
}

fn plan(settings: &Schemas, daylight: Option<&Daylight>) -> Option<Plan> {
    let custom = || {
        Plan::Window(Window {
            from: settings.get(SCHEMA, "dark-schedule-from"),
            to: settings.get(SCHEMA, "dark-schedule-to"),
        })
    };
    match settings.get::<String>(SCHEMA, "dark-schedule").as_str() {
        "sunset" => Some(match daylight {
            Some(Daylight::Sun(sun)) => Plan::Window(Window {
                from: sun.sunset,
                to: sun.sunrise,
            }),
            Some(Daylight::PolarNight) => Plan::Always(true),
            Some(Daylight::PolarDay) => Plan::Always(false),
            None => custom(),
        }),
        "custom" => Some(custom()),
        _ => None,
    }
}

fn passed_change(plan: &Plan, evaluated_at: &glib::DateTime, now: &glib::DateTime) -> bool {
    let elapsed = now.difference(evaluated_at).as_microseconds();
    if elapsed >= DAY_MICROSECONDS {
        return true;
    }
    let Plan::Window(window) = plan else {
        return false;
    };
    let (before, after) = (schedule::hours(evaluated_at), schedule::hours(now));
    elapsed > 0
        && before != after
        && (schedule::is_between(window.from, before, after)
            || schedule::is_between(window.to, before, after))
}

fn is_dark(plan: &Plan, hour: f64) -> bool {
    match plan {
        Plan::Window(window) => schedule::is_between(hour, window.from, window.to),
        Plan::Always(dark) => *dark,
    }
}

fn set_dark(settings: &Schemas, dark: bool) {
    let scheme = if dark { "prefer-dark" } else { "default" };
    if settings.get::<String>(INTERFACE, "color-scheme") != scheme {
        settings.set(INTERFACE, "color-scheme", scheme);
    }
}
