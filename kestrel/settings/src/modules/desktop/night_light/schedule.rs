use luft_daylight::{Window, is_between};

pub const NEUTRAL: f64 = 6500.0;
const SMEAR_HOURS: f64 = 1.0;

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
