//! The uncaught error or unhandled promise rejection Kestrel's scripts hit
//! last before Kestrel crashed, as Kestrel marked it in the journal.

use crate::journal::{self, TIME};

const UNCAUGHT: &str = "JS ERROR: ";
const UNHANDLED: &str = "Unhandled promise rejection";
const UNHANDLED_ADVICE_ENDS: &str = "await expression.";
const STACK_HEADING: &str = "Stack trace";
const BEFORE_CRASH_MICROSECONDS: u64 = 60_000_000;

pub struct ScriptError {
    pub message: String,
    pub frames: Vec<String>,
}

fn is_frame(line: &str) -> bool {
    line.contains('@') && line.contains(':') && !line.contains(' ')
}

fn parse(logged: &str) -> Option<ScriptError> {
    let (described, mut message_lines) = if let Some((_, error)) = logged.split_once(UNCAUGHT) {
        (error, Vec::new())
    } else {
        let (_, rest) = logged.split_once(UNHANDLED)?;
        let rest = rest
            .split_once(UNHANDLED_ADVICE_ENDS)
            .map_or(rest, |(_, after)| after);
        (rest, vec![UNHANDLED.to_owned()])
    };
    let lines = described
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty());
    let (frames, words): (Vec<&str>, Vec<&str>) = lines.partition(|line| is_frame(line));
    message_lines.extend(
        words
            .into_iter()
            .filter(|line| !line.starts_with(STACK_HEADING))
            .map(str::to_owned),
    );
    Some(ScriptError {
        message: message_lines.join("\n"),
        frames: frames.into_iter().map(str::to_owned).collect(),
    })
}

/// The last script error process `pid` logged in the minute before it
/// crashed at `crashed`, in microseconds since the epoch.
pub fn last_before(boot: &str, pid: u64, crashed: u64) -> Option<ScriptError> {
    journal::script_errors(boot, pid)
        .ok()?
        .iter()
        .filter(|entry| {
            entry.number(TIME).is_some_and(|logged| {
                logged <= crashed && crashed - logged <= BEFORE_CRASH_MICROSECONDS
            })
        })
        .filter_map(|entry| parse(entry.get("MESSAGE")?))
        .next_back()
}

#[cfg(test)]
mod tests {
    use super::parse;

    #[test]
    fn reads_an_uncaught_error() {
        let error = parse(
            "JS ERROR: TypeError: can't access property \"get_progress\" of undefined\n\
             vfunc_repaint@resource:///com/lantharos/kestrel/kestrel.js:18240:70\n\
             @resource:///com/lantharos/kestrel/kestrel.js:73663:18\n",
        )
        .unwrap();
        assert_eq!(
            error.message,
            "TypeError: can't access property \"get_progress\" of undefined"
        );
        assert_eq!(error.frames.len(), 2);
    }

    #[test]
    fn reads_an_unhandled_rejection() {
        let error = parse(
            "Unhandled promise rejection. To suppress this warning, add an error handler to your promise chain \
             with .catch() or a try-catch block around your await expression. Stack trace of the failed promise:\n  \
             load@resource:///com/lantharos/kestrel/kestrel.js:12:3\n",
        )
        .unwrap();
        assert_eq!(error.message, "Unhandled promise rejection");
        assert_eq!(
            error.frames,
            ["load@resource:///com/lantharos/kestrel/kestrel.js:12:3"]
        );
    }
}
