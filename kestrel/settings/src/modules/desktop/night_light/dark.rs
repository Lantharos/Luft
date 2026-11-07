use luft_daylight::{Daylight, Plan, Schedule, Window};

use crate::shared::settings::Schemas;

pub const SCHEMA: &str = "com.lantharos.kestrel";
pub const INTERFACE: &str = "org.gnome.desktop.interface";

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

    pub fn update(
        &mut self,
        settings: &Schemas,
        now: &glib::DateTime,
        daylight: Option<&Daylight>,
    ) {
        let Some(plan) = plan(settings, daylight) else {
            self.evaluated_at = None;
            return;
        };
        let due = self
            .evaluated_at
            .as_ref()
            .is_none_or(|evaluated_at| plan.passed_change(evaluated_at, now));
        self.evaluated_at = Some(now.clone());
        if due {
            set_dark(settings, plan.is_dark(now));
        }
    }
}

fn plan(settings: &Schemas, daylight: Option<&Daylight>) -> Option<Plan> {
    let custom = Window {
        from: settings.get(SCHEMA, "dark-schedule-from"),
        to: settings.get(SCHEMA, "dark-schedule-to"),
    };
    Schedule::parse(&settings.get::<String>(SCHEMA, "dark-schedule"), custom)
        .map(|schedule| schedule.plan(daylight))
}

fn set_dark(settings: &Schemas, dark: bool) {
    let scheme = if dark { "prefer-dark" } else { "default" };
    if settings.get::<String>(INTERFACE, "color-scheme") != scheme {
        settings.set(INTERFACE, "color-scheme", scheme);
    }
}
