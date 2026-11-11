//! The stack of a crash: the crashing thread's frames from the trace
//! systemd-coredump writes into the journal, or the frames a panic recorded.

use std::collections::HashMap;
use std::path::Path;

mod elf;

use luft_crash_report::Frame;

pub use elf::build_id;

const CRASHING_THREAD: &str = "Stack trace of thread ";
const UNKNOWN: &str = "n/a";
const NO_BUILD: &str = "-";

fn base_name(module: &str) -> String {
    Path::new(module).file_name().map_or_else(
        || module.to_owned(),
        |name| name.to_string_lossy().into_owned(),
    )
}

/// `#3  0x00007f02bb298070 shell_app_dispose (libshell-51.so + 0x507aaf)`
fn frame(line: &str, builds: &HashMap<String, String>) -> Option<Frame> {
    let line = line.trim_start().strip_prefix('#')?;
    let (_, rest) = line.split_once(char::is_whitespace)?;
    let (_, rest) = rest.trim_start().split_once(char::is_whitespace)?;
    let (function, place) = rest.trim_start().rsplit_once(" (")?;
    let (module, offset) = place.strip_suffix(')')?.rsplit_once(" + ")?;
    let module = base_name(module);
    Some(Frame {
        build: builds.get(&module).cloned(),
        module,
        offset: offset.to_owned(),
        function: (function != UNKNOWN).then(|| function.to_owned()),
    })
}

/// The frames of the first thread in the trace, the one that crashed.
pub fn of_core_dump(message: &str, builds: &HashMap<String, String>) -> Vec<Frame> {
    message
        .split_once(CRASHING_THREAD)
        .map(|(_, trace)| {
            trace
                .lines()
                .skip(1)
                .map_while(|line| frame(line, builds))
                .collect()
        })
        .unwrap_or_default()
}

/// `kestrel-settings 0f3a… 0x4c2e1`, one frame a line.
pub fn of_panic(frames: &str) -> Vec<Frame> {
    frames
        .lines()
        .filter_map(|line| {
            let mut words = line.split_whitespace();
            let (module, build, offset) = (words.next()?, words.next()?, words.next()?);
            Some(Frame {
                module: module.to_owned(),
                build: (build != NO_BUILD).then(|| build.to_owned()),
                offset: offset.to_owned(),
                function: None,
            })
        })
        .collect()
}

/// The files mapped into a crashed process, from its saved memory map.
fn mapped_files(maps: &str) -> Vec<&str> {
    let mut files: Vec<&str> = maps
        .lines()
        .filter_map(|line| line.split_whitespace().nth(5))
        .filter(|path| path.starts_with('/'))
        .collect();
    files.sort_unstable();
    files.dedup();
    files
}

/// Reads the build IDs systemd-coredump didn't know from the files the
/// process had mapped, which are still the same during the start it
/// crashed in.
pub fn read_missing_builds(frames: &mut [Frame], maps: &str) {
    let mapped = mapped_files(maps);
    let mut read: HashMap<String, Option<String>> = HashMap::new();
    for frame in frames.iter_mut().filter(|frame| frame.build.is_none()) {
        let module = frame.module.clone();
        frame.build = read
            .entry(module.clone())
            .or_insert_with(|| {
                mapped
                    .iter()
                    .find(|file| base_name(file) == module)
                    .and_then(|file| elf::build_id(Path::new(file)))
            })
            .clone();
    }
}

/// Build IDs by module name, from the packages systemd-coredump recognised.
pub fn package_builds(packages: &str) -> HashMap<String, String> {
    let Ok(serde_json::Value::Object(packages)) = serde_json::from_str(packages) else {
        return HashMap::new();
    };
    packages
        .iter()
        .filter_map(|(path, package)| {
            Some((
                base_name(path),
                package.get("buildId")?.as_str()?.to_owned(),
            ))
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use super::of_core_dump;

    const TRACE: &str = "Process 1177429 (kestrel) of user 1000 dumped core.

Module /usr/lib64/libc.so.6 from rpm glibc-2.44-1.fc45.x86_64
Stack trace of thread 1177429:
#0  0x00007f02bb2f3acc n/a (/usr/lib64/libc.so.6 + 0xefacc)
#8  0x00007f02bc507aaf shell_app_dispose (libshell-51.so + 0x507aaf)

Stack trace of thread 1177439:
#0  0x00007f02bb37379d n/a (/usr/lib64/libc.so.6 + 0x16f79d)
";

    #[test]
    fn reads_the_crashing_thread() {
        let builds = HashMap::from([("libc.so.6".to_owned(), "31cb74".to_owned())]);
        let frames = of_core_dump(TRACE, &builds);
        assert_eq!(frames.len(), 2);
        assert_eq!(frames[0].module, "libc.so.6");
        assert_eq!(frames[0].build.as_deref(), Some("31cb74"));
        assert_eq!(frames[0].function, None);
        assert_eq!(frames[1].function.as_deref(), Some("shell_app_dispose"));
        assert_eq!(frames[1].offset, "0x507aaf");
    }
}
