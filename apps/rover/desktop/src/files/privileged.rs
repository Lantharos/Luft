use std::ffi::OsString;
use std::io;
use std::path::Path;
use std::process::Command;

const SYSTEM_BIN_DIRS: [&str; 2] = ["/usr/bin", "/bin"];

pub(crate) fn os(value: &str) -> OsString {
    OsString::from(value)
}

pub(crate) fn is_permission_error(error: &io::Error) -> bool {
    error.kind() == io::ErrorKind::PermissionDenied
}

pub(crate) fn run_pkexec(program: &str, args: &[OsString]) -> Result<(), String> {
    let program_path = system_program(program)?;
    let status = Command::new("pkexec")
        .arg("--keep-cwd")
        .arg(program_path)
        .args(args)
        .status()
        .map_err(|error| format!("Could not start privilege prompt: {error}"))?;

    match status.code() {
        Some(0) => Ok(()),
        Some(126) => Err("Authentication cancelled".to_string()),
        Some(127) => Err("Authentication failed or unavailable".to_string()),
        Some(code) => Err(format!("Elevated operation failed with exit code {code}")),
        None => Err("Elevated operation was interrupted".to_string()),
    }
}

pub(crate) fn remove_path(path: &Path) -> Result<(), String> {
    let result = if path.is_dir() {
        std::fs::remove_dir_all(path)
    } else {
        std::fs::remove_file(path)
    };

    match result {
        Ok(()) => Ok(()),
        Err(error) if is_permission_error(&error) => {
            run_pkexec("rm", &[os("-rf"), os("--"), path.as_os_str().into()])
        }
        Err(error) => Err(error.to_string()),
    }
}

pub(crate) fn create_dir_all(path: &Path) -> Result<(), String> {
    match std::fs::create_dir_all(path) {
        Ok(()) => Ok(()),
        Err(error) if is_permission_error(&error) => {
            run_pkexec("mkdir", &[os("-p"), os("--"), path.as_os_str().into()])
        }
        Err(error) => Err(error.to_string()),
    }
}

fn system_program(program: &str) -> Result<std::path::PathBuf, String> {
    SYSTEM_BIN_DIRS
        .iter()
        .map(|dir| Path::new(dir).join(program))
        .find(|path| path.is_file())
        .ok_or_else(|| format!("Required system tool is missing: {program}"))
}
