use jiff::tz::TimeZone;
use jiff::{Timestamp, ToSpan, Zoned};

use crate::incident::{Incident, Restart};

const COUNTDOWN_SECONDS: u32 = 20;
pub const FIRMWARE_KEY: &str = "f";

fn when(time: i64) -> String {
    let zone = TimeZone::system();
    let Ok(happened) = Timestamp::from_second(time).map(|time| time.to_zoned(zone.clone())) else {
        return "before the restart".into();
    };
    let today = Zoned::now().with_time_zone(zone).date();
    let clock = happened.strftime("%H:%M");
    if happened.date() == today {
        format!("today at {clock}")
    } else if today
        .checked_sub(1.day())
        .is_ok_and(|yesterday| happened.date() == yesterday)
    {
        format!("yesterday at {clock}")
    } else {
        format!("on {} at {clock}", happened.strftime("%-d %B"))
    }
}

fn aftermath(restart: Restart) -> &'static str {
    match restart {
        Restart::Graceful => "Your apps were asked to save their work before the restart.",
        Restart::Forced => "Some apps didn't close in time and were stopped.",
        Restart::Emergency => "The computer had to restart without waiting for apps.",
    }
}

pub fn compose(incident: &Incident, firmware: bool) -> String {
    let mut lines = vec![
        "title Your computer restarted because the graphics driver stopped responding".to_owned(),
        format!(
            "line It happened {}. {}",
            when(incident.time),
            aftermath(incident.restart)
        ),
    ];
    if incident.suggestions.is_empty() {
        lines.push("line If it keeps happening, Settings shows the details under About.".into());
    } else {
        lines.push(if incident.suggestions.len() == 1 {
            "line This can keep it from happening again:".into()
        } else {
            "line These can keep it from happening again:".into()
        });
        lines.extend(
            incident
                .suggestions
                .iter()
                .map(|suggestion| format!("step {}", suggestion.step)),
        );
    }
    lines.push(if firmware {
        "footer Press F to open the firmware settings, or Enter to continue. Continuing in {seconds} seconds.".into()
    } else {
        "footer Continuing in {seconds} seconds. Press Enter to continue now.".into()
    });
    lines.push(format!("countdown {COUNTDOWN_SECONDS}"));
    if firmware {
        lines.push(format!("key {FIRMWARE_KEY}"));
    }
    lines.join("\n") + "\n"
}
