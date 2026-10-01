pub const PROCESSING: u32 = 5;
const STOPPED: u32 = 6;
const CANCELED: u32 = 7;
const ABORTED: u32 = 8;
const COMPLETED: u32 = 9;

pub const CONNECTING: &str = "connecting-to-device";
const IGNORED: [&str; 3] = [
    "none",
    "com.apple.print.recoverable",
    "cups-waiting-for-job-completed",
];
const KNOWN: [(&str, &str, &str); 12] = [
    ("toner-low", "Toner low", "{} is low on toner."),
    ("toner-empty", "Toner empty", "{} has no toner left."),
    (
        CONNECTING,
        "Printer not connected",
        "{} may not be connected.",
    ),
    ("cover-open", "Cover open", "The cover is open on {}."),
    (
        "cups-missing-filter",
        "Printer can't print",
        "{} is missing a print filter.",
    ),
    ("door-open", "Door open", "The door is open on {}."),
    (
        "marker-supply-low",
        "Ink low",
        "{} is low on ink or another supply.",
    ),
    (
        "marker-supply-empty",
        "Ink empty",
        "{} is out of ink or another supply.",
    ),
    ("media-low", "Paper low", "{} is low on paper."),
    ("media-empty", "Out of paper", "{} is out of paper."),
    ("offline", "Printer offline", "{} is offline."),
    ("other", "Printer problem", "There is a problem with {}."),
];

pub fn job_summary(state: u32) -> Option<&'static str> {
    match state {
        PROCESSING => Some("Printing"),
        STOPPED => Some("Printing stopped"),
        CANCELED => Some("Printing canceled"),
        ABORTED => Some("Printing failed"),
        COMPLETED => Some("Printing done"),
        _ => None,
    }
}

pub fn job_finished(state: u32) -> bool {
    state >= STOPPED
}

pub fn reason(reason: &str, printer: &str) -> Option<(String, String)> {
    if let Some((_, summary, body)) = KNOWN.iter().find(|(known, _, _)| reason.starts_with(known)) {
        return Some(((*summary).to_owned(), body.replace("{}", printer)));
    }
    if IGNORED.contains(&reason) || reason.starts_with("cups-remote-") {
        return None;
    }
    let summary = if reason.ends_with("-report") {
        "Printer report"
    } else if reason.ends_with("-warning") {
        "Printer warning"
    } else {
        "Printer error"
    };
    Some((summary.to_owned(), format!("{printer} reports “{reason}”.")))
}
