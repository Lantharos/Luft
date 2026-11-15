use luft_i18n::{FluentArgs, t};

use crate::L10N;

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
    ("toner-low", "printer-toner-low-title", "printer-toner-low"),
    (
        "toner-empty",
        "printer-toner-empty-title",
        "printer-toner-empty",
    ),
    (
        CONNECTING,
        "printer-not-connected-title",
        "printer-not-connected",
    ),
    (
        "cover-open",
        "printer-cover-open-title",
        "printer-cover-open",
    ),
    (
        "cups-missing-filter",
        "printer-missing-filter-title",
        "printer-missing-filter",
    ),
    ("door-open", "printer-door-open-title", "printer-door-open"),
    (
        "marker-supply-low",
        "printer-supply-low-title",
        "printer-supply-low",
    ),
    (
        "marker-supply-empty",
        "printer-supply-empty-title",
        "printer-supply-empty",
    ),
    ("media-low", "printer-paper-low-title", "printer-paper-low"),
    (
        "media-empty",
        "printer-paper-empty-title",
        "printer-paper-empty",
    ),
    ("offline", "printer-offline-title", "printer-offline"),
    ("other", "printer-problem-title", "printer-problem"),
];

pub fn job_summary(state: u32) -> Option<String> {
    let id = match state {
        PROCESSING => "printer-job-printing",
        STOPPED => "printer-job-stopped",
        CANCELED => "printer-job-canceled",
        ABORTED => "printer-job-failed",
        COMPLETED => "printer-job-done",
        _ => return None,
    };
    Some(L10N.t(id))
}

pub fn job_finished(state: u32) -> bool {
    state >= STOPPED
}

pub fn reason(reason: &str, printer: &str) -> Option<(String, String)> {
    if let Some((_, title, body)) = KNOWN.iter().find(|(known, _, _)| reason.starts_with(known)) {
        let mut args = FluentArgs::new();
        args.set("printer", printer);
        return Some((L10N.t(title), L10N.format(body, Some(&args))));
    }
    if IGNORED.contains(&reason) || reason.starts_with("cups-remote-") {
        return None;
    }
    let summary = if reason.ends_with("-report") {
        t!(L10N, "printer-report")
    } else if reason.ends_with("-warning") {
        t!(L10N, "printer-warning")
    } else {
        t!(L10N, "printer-error")
    };
    Some((
        summary,
        t!(L10N, "printer-reports", printer = printer, reason = reason),
    ))
}
