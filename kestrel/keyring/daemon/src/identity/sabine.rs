use super::process::Process;
use super::program::{Program, file_name};

const HOST: &str = "sabine-host";
const HOST_DEPTH: usize = 8;
const RUNTIME_UNIT: &str = "sabine-runtime@";
const LUFT_PREFIX: &str = "com.lantharos.";
const SYSTEM_APPS: &str = "/usr/lib/sabine/";

/// Whether the process is the Chromium Sabine apps share, which runs as its
/// own user service rather than below the app that opened a window in it.
pub fn is_shared_runtime(process: &Process, executable: &str) -> bool {
    is_host(executable)
        && process.unit().is_some_and(|unit| {
            unit.strip_prefix(RUNTIME_UNIT)
                .is_some_and(|instance| instance.ends_with(".service"))
        })
}

pub fn is_host(executable: &str) -> bool {
    file_name(executable) == HOST
}

pub fn is_host_key(key: &str) -> bool {
    key.strip_prefix("exe:")
        .is_some_and(|program| is_host(&Program::parse(program).executable))
}

pub fn launcher(host: &Process) -> Option<Process> {
    let mut current = host.parent()?;
    for _ in 0..HOST_DEPTH {
        if !is_host(&current.executable()?) {
            return Some(current);
        }
        current = current.parent()?;
    }
    None
}

pub fn luft_app_id(process: &Process, executable: &str) -> Option<String> {
    let id = executable.strip_prefix(SYSTEM_APPS)?.split('/').next()?;
    (id.starts_with(LUFT_PREFIX) && process.runs_installed(executable)).then(|| id.to_owned())
}
