use crate::shared::location::{self, Coordinates};

pub const NEUTRAL: f64 = 6500.0;
const SMEAR_HOURS: f64 = 1.0;

pub struct Window {
    pub from: f64,
    pub to: f64,
}

pub struct Sun {
    pub sunrise: f64,
    pub sunset: f64,
}

pub fn now() -> glib::DateTime {
    let zone = location::timezone()
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

pub fn sun(time: &glib::DateTime, at: Coordinates) -> Option<Sun> {
    let offset = time.utc_offset().as_seconds() as f64 / 3600.0;
    let days_since_1900 = (time.to_unix() as f64 / 86400.0 + 25569.0).floor();
    let julian_day = days_since_1900 + 2415018.5 - offset / 24.0;
    let century = (julian_day - 2451545.0) / 36525.0;
    let mean_longitude = (280.46646 + century * (36000.76983 + century * 0.0003032)) % 360.0;
    let mean_anomaly = 357.52911 + century * (35999.05029 - 0.0001537 * century);
    let eccentricity = 0.016708634 - century * (0.000042037 + 0.0000001267 * century);
    let anomaly = mean_anomaly.to_radians();
    let center = anomaly.sin() * (1.914602 - century * (0.004817 + 0.000014 * century))
        + (2.0 * anomaly).sin() * (0.019993 - 0.000101 * century)
        + (3.0 * anomaly).sin() * 0.000289;
    let apparent_longitude = mean_longitude + center
        - 0.00569
        - 0.00478 * (125.04 - 1934.136 * century).to_radians().sin();
    let mean_obliquity = 23.0
        + (26.0 + (21.448 - century * (46.815 + century * (0.00059 - century * 0.001813))) / 60.0)
            / 60.0;
    let obliquity = mean_obliquity + 0.00256 * (125.04 - 1934.136 * century).to_radians().cos();
    let declination = (obliquity.to_radians().sin() * apparent_longitude.to_radians().sin()).asin();
    let y = (obliquity / 2.0).to_radians().tan().powi(2);
    let longitude = mean_longitude.to_radians();
    let equation_of_time = 4.0
        * (y * (2.0 * longitude).sin() - 2.0 * eccentricity * anomaly.sin()
            + 4.0 * eccentricity * y * anomaly.sin() * (2.0 * longitude).cos()
            - 0.5 * y * y * (4.0 * longitude).sin()
            - 1.25 * eccentricity * eccentricity * (2.0 * anomaly).sin())
        .to_degrees();
    let latitude = at.latitude.to_radians();
    let hour_angle = (90.833_f64.to_radians().cos() / (latitude.cos() * declination.cos())
        - latitude.tan() * declination.tan())
    .acos()
    .to_degrees();
    if hour_angle.is_nan() {
        return None;
    }
    let solar_noon = (720.0 - 4.0 * at.longitude - equation_of_time + offset * 60.0) / 1440.0;
    Some(Sun {
        sunrise: (solar_noon - hour_angle * 4.0 / 1440.0) * 24.0,
        sunset: (solar_noon + hour_angle * 4.0 / 1440.0) * 24.0,
    })
}

pub fn temperature(now: f64, window: &Window, warm: f64) -> Option<f64> {
    let span = (window.to - window.from).abs();
    let smear = SMEAR_HOURS.min(span.min(24.0 - span));
    if !is_between(now, window.from - smear, window.to) {
        return None;
    }
    if smear < 0.01 {
        return Some(warm);
    }
    let blend = |factor: f64| (NEUTRAL - warm) * factor + warm;
    if is_between(now, window.from - smear, window.from) {
        return Some(blend(
            1.0 - (now - (window.from - smear)).rem_euclid(24.0) / smear,
        ));
    }
    if is_between(now, window.to - smear, window.to) {
        return Some(blend((now - (window.to - smear)).rem_euclid(24.0) / smear));
    }
    Some(warm)
}
