use super::process::Process;
use super::program::{Program, file_name};

const HOST: &str = "sabine-host";
const HOST_DEPTH: usize = 8;
const LUFT_PREFIX: &str = "com.lantharos.";

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

pub fn luft_app_id(executable: &str) -> Option<String> {
    let home = std::env::var("HOME").ok()?;
    let apps = format!("{home}/.local/share/sabine/apps/");
    let id = executable.strip_prefix(&apps)?.split('/').next()?;
    id.starts_with(LUFT_PREFIX).then(|| id.to_owned())
}
