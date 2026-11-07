use std::time::Duration;

use luft_daylight::{Coordinates, Schedule, Window};
use serde::{Deserialize, Serialize};

use super::Style;
use crate::error::Error;

const NO_SCHEDULE: &str = "off";

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StyleChoice {
    style: Style,
    schedule: String,
    window: (f64, f64),
    coordinates: Option<(f64, f64)>,
    rounded_corners: bool,
}

impl StyleChoice {
    pub fn new(
        style: &str,
        schedule: String,
        window: (f64, f64),
        coordinates: (f64, f64),
        rounded_corners: bool,
    ) -> Result<Self, Error> {
        let style = Style::parse(style)?;
        let hour = |value: f64| (0.0..=24.0).contains(&value);
        if !hour(window.0) || !hour(window.1) {
            return Err(Error::invalid(
                "The schedule's hours must lie between 0 and 24",
            ));
        }
        let custom = Window {
            from: window.0,
            to: window.1,
        };
        let coordinates = match Schedule::parse(&schedule, custom) {
            Some(Schedule::Sunset { .. }) => Coordinates::known(coordinates).map(|_| coordinates),
            Some(Schedule::Custom(_)) => None,
            None if schedule == NO_SCHEDULE => None,
            None => {
                return Err(Error::InvalidArgs(format!(
                    "There's no schedule called {schedule}"
                )));
            }
        };
        Ok(Self {
            style,
            schedule,
            window,
            coordinates,
            rounded_corners,
        })
    }

    pub fn rounded_corners(&self) -> bool {
        self.rounded_corners
    }

    pub fn now(&self) -> (Style, Option<Duration>) {
        let custom = Window {
            from: self.window.0,
            to: self.window.1,
        };
        let Some(schedule) = Schedule::parse(&self.schedule, custom) else {
            return (self.style, None);
        };
        let now = luft_daylight::now();
        let daylight = self
            .coordinates
            .and_then(Coordinates::known)
            .or_else(|| {
                luft_daylight::timezone().and_then(|zone| luft_daylight::zone_coordinates(&zone))
            })
            .map(|at| luft_daylight::daylight(&now, at));
        let plan = schedule.plan(daylight.as_ref());
        let style = if plan.is_dark(&now) {
            Style::Dark
        } else {
            Style::Light
        };
        (style, Some(plan.next_change(&now)))
    }
}
