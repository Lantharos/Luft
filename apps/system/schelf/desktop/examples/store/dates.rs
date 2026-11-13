use std::time::{SystemTime, UNIX_EPOCH};

const DAY_SECONDS: u64 = 86_400;

fn today() -> i64 {
    let seconds = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("the clock is after 1970")
        .as_secs();
    (seconds / DAY_SECONDS) as i64
}

/// The calendar date `days` after 1970-01-01, by Howard Hinnant's algorithm.
fn civil(days: i64) -> (i64, u32, u32) {
    let z = days + 719_468;
    let era = z.div_euclid(146_097);
    let day_of_era = z.rem_euclid(146_097);
    let year_of_era =
        (day_of_era - day_of_era / 1460 + day_of_era / 36_524 - day_of_era / 146_096) / 365;
    let day_of_year = day_of_era - (365 * year_of_era + year_of_era / 4 - year_of_era / 100);
    let shifted_month = (5 * day_of_year + 2) / 153;
    let day = (day_of_year - (153 * shifted_month + 2) / 5 + 1) as u32;
    let month = if shifted_month < 10 {
        shifted_month + 3
    } else {
        shifted_month - 9
    } as u32;
    let year = year_of_era + era * 400 + i64::from(month <= 2);
    (year, month, day)
}

/// The day `ago` days before today, as the store writes days.
pub fn day(ago: i64) -> String {
    let (year, month, day) = civil(today() - ago);
    format!("{year:04}-{month:02}-{day:02}")
}

/// A moment `ago` days before today at `hour`, as the store writes times.
pub fn at(ago: i64, hour: u32) -> String {
    format!("{}T{hour:02}:12:00.000Z", day(ago))
}
