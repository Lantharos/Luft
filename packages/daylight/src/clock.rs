use crate::place;

#[derive(Clone, Copy)]
pub struct Window {
    pub from: f64,
    pub to: f64,
}

pub fn now() -> glib::DateTime {
    let zone = place::timezone()
        .and_then(|identifier| glib::TimeZone::from_identifier(Some(&identifier)))
        .unwrap_or_else(glib::TimeZone::local);
    glib::DateTime::now(&zone).expect("the clock reads the current time")
}

pub fn hours(time: &glib::DateTime) -> f64 {
    f64::from(time.hour()) + f64::from(time.minute()) / 60.0 + f64::from(time.second()) / 3600.0
}

pub fn is_between(value: f64, start: f64, end: f64) -> bool {
    let end = if end <= start { end + 24.0 } else { end };
    let value = if value < start && value < end {
        value + 24.0
    } else {
        value
    };
    value >= start && value < end
}
