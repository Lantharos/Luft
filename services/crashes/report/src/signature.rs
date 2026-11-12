//! What makes two crashes the same crash: the program, how it failed and
//! where. See [Grouping](https://docs.luft.computer/security/crash-reports/#grouping).

use sha2::{Digest, Sha256};

use crate::report::{Frame, Kind};

const TOP_FRAMES: usize = 5;
const TOP_SCRIPT_FRAMES: usize = 3;
const BUILD_PREFIX: usize = 12;
const SIGNATURE_LENGTH: usize = 32;
const HANDLERS: [&str; 2] = ["dump_gjs_stack_on_signal_handler", "__restore_rt"];
const C_LIBRARY: &str = "libc.so";
const ABORTING_MODULES: [&str; 4] = [C_LIBRARY, "libglib-2.0.so", "libstdc++.so", "libgcc_s.so"];
const ABORTING_SIGNALS: [&str; 2] = ["SIGABRT", "SIGTRAP"];

pub struct Failure<'a> {
    pub program: &'a str,
    pub kind: Kind,
    pub signal: Option<&'a str>,
    pub message: Option<&'a str>,
    pub location: Option<&'a str>,
    pub frames: &'a [Frame],
    pub script: &'a [String],
}

fn is_in(frame: &Frame, modules: &[&str]) -> bool {
    modules
        .iter()
        .any(|module| frame.module.starts_with(module))
}

/// The frames where the program went wrong, without the ones that only
/// report it: a signal handler with the C library's frames that run it, and
/// for an abort, the C library, GLib and C++ frames that abort.
pub fn meaningful<'a>(frames: &'a [Frame], signal: Option<&str>) -> &'a [Frame] {
    let handled = frames
        .iter()
        .position(|frame| {
            frame
                .function
                .as_deref()
                .is_some_and(|name| HANDLERS.contains(&name))
        })
        .map_or(0, |handler| {
            let after = handler + 1;
            after
                + usize::from(
                    frames
                        .get(after)
                        .is_some_and(|frame| is_in(frame, &[C_LIBRARY])),
                )
        });
    let rest = &frames[handled.min(frames.len())..];
    if !signal.is_some_and(|signal| ABORTING_SIGNALS.contains(&signal)) {
        return rest;
    }
    let aborting = rest
        .iter()
        .take_while(|frame| is_in(frame, &ABORTING_MODULES))
        .count();
    if aborting == rest.len() {
        rest
    } else {
        &rest[aborting..]
    }
}

fn frame_key(frame: &Frame) -> String {
    match &frame.function {
        Some(function) => format!("{} {function}", frame.module),
        None => {
            let build = frame.build.as_deref().unwrap_or("");
            let build = &build[..build.len().min(BUILD_PREFIX)];
            format!("{} {build}+{}", frame.module, frame.offset)
        }
    }
}

/// `file:line:column` without its column, which moves with any change to
/// the line.
fn without_column(place: &str) -> &str {
    match place.rsplit_once(':') {
        Some((rest, column))
            if column.bytes().all(|byte| byte.is_ascii_digit()) && rest.contains(':') =>
        {
            rest
        }
        _ => place,
    }
}

fn error_type(message: &str) -> &str {
    message
        .split_once(':')
        .map_or(message, |(name, _)| name)
        .trim()
}

fn parts(failure: &Failure<'_>) -> Vec<String> {
    let mut parts = vec![failure.program.to_owned()];
    match failure.kind {
        Kind::Script => {
            parts.push("script".into());
            parts.push(error_type(failure.message.unwrap_or("")).into());
            parts.extend(
                failure
                    .script
                    .iter()
                    .take(TOP_SCRIPT_FRAMES)
                    .map(|frame| without_column(frame).to_owned()),
            );
        }
        Kind::Panic if failure.location.is_some_and(|place| !place.is_empty()) => {
            parts.push("panic".into());
            parts.push(without_column(failure.location.unwrap_or("")).into());
        }
        Kind::Signal | Kind::Panic => {
            parts.push(failure.signal.unwrap_or("panic").into());
            parts.extend(
                meaningful(failure.frames, failure.signal)
                    .iter()
                    .take(TOP_FRAMES)
                    .map(frame_key),
            );
        }
    }
    parts
}

pub fn of(failure: &Failure<'_>) -> String {
    let digest = Sha256::digest(parts(failure).join("\n"));
    digest
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect::<String>()[..SIGNATURE_LENGTH]
        .to_owned()
}

#[cfg(test)]
mod tests {
    use super::{Failure, meaningful, of};
    use crate::report::{Frame, Kind};

    fn frame(module: &str, offset: &str, function: Option<&str>) -> Frame {
        Frame {
            module: module.into(),
            build: Some("0123456789abcdef0123".into()),
            offset: offset.into(),
            function: function.map(Into::into),
        }
    }

    fn aborted(frames: &[Frame]) -> String {
        of(&Failure {
            program: "kestrel",
            kind: Kind::Signal,
            signal: Some("SIGABRT"),
            message: None,
            location: None,
            frames,
            script: &[],
        })
    }

    fn real_stack(handler_offset: &str) -> Vec<Frame> {
        vec![
            frame("libc.so.6", "0xefacc", None),
            frame("libc.so.6", "0x93f4e", None),
            frame(
                "kestrel",
                handler_offset,
                Some("dump_gjs_stack_on_signal_handler"),
            ),
            frame("libc.so.6", "0x94070", None),
            frame("libc.so.6", "0x7b43f", None),
            frame("libglib-2.0.so.0", "0xb41bb", None),
            frame("libshell-51.so", "0x507aaf", Some("shell_app_dispose")),
            frame("libgobject-2.0.so.0", "0x3b6d9", None),
        ]
    }

    #[test]
    fn leaves_out_the_frames_that_report_an_abort() {
        let stack = real_stack("0x42c0");
        let left = meaningful(&stack, Some("SIGABRT"));
        assert_eq!(left[0].function.as_deref(), Some("shell_app_dispose"));
    }

    #[test]
    fn a_crash_reached_the_same_way_is_the_same_crash() {
        assert_eq!(
            aborted(&real_stack("0x42c0")),
            aborted(&real_stack("0x5000"))
        );
    }

    #[test]
    fn a_crash_in_another_place_is_another_crash() {
        let mut elsewhere = real_stack("0x42c0");
        elsewhere[6] = frame(
            "libshell-51.so",
            "0x50a087",
            Some("shell_app_system_finalize"),
        );
        assert_ne!(aborted(&real_stack("0x42c0")), aborted(&elsewhere));
    }

    #[test]
    fn panics_are_told_apart_by_where_they_happened() {
        let panic = |location| {
            of(&Failure {
                program: "luft-firewall",
                kind: Kind::Panic,
                signal: None,
                message: Some("index out of bounds: the len is 3 but the index is 7"),
                location: Some(location),
                frames: &[],
                script: &[],
            })
        };
        assert_eq!(panic("src/rules.rs:40:9"), panic("src/rules.rs:40:13"));
        assert_ne!(panic("src/rules.rs:40:9"), panic("src/rules.rs:52:9"));
    }
}
