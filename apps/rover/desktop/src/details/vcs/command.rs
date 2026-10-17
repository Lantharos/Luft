use std::env;
use std::ffi::OsString;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::LazyLock;

static SEARCH_PATH: LazyLock<Vec<PathBuf>> = LazyLock::new(|| {
    let mut paths: Vec<PathBuf> = env::var_os("PATH")
        .map(|path| env::split_paths(&path).collect())
        .unwrap_or_default();
    if let Some(home) = dirs::home_dir() {
        paths.extend([".local/bin", ".cargo/bin", ".bun/bin"].map(|dir| home.join(dir)));
    }
    paths.extend(
        [
            "/usr/local/bin",
            "/usr/bin",
            "/bin",
            "/run/current-system/sw/bin",
            "/nix/var/nix/profiles/default/bin",
        ]
        .map(PathBuf::from),
    );
    paths
});

pub(super) fn args(values: &[&str]) -> Vec<OsString> {
    values.iter().map(OsString::from).collect()
}

pub(super) fn run_text_with_codes(
    cwd: &Path,
    args: Vec<OsString>,
    success_codes: &[i32],
) -> Result<String, String> {
    run_bytes(cwd, args, success_codes).map(|output| String::from_utf8_lossy(&output).into_owned())
}

pub(super) fn run_bytes(
    cwd: &Path,
    args: Vec<OsString>,
    success_codes: &[i32],
) -> Result<Vec<u8>, String> {
    let executable = find_git().ok_or("Git executable not found")?;
    let output = Command::new(&executable)
        .args(args)
        .current_dir(cwd)
        .env("LC_ALL", "C")
        .env(
            "PATH",
            env::join_paths(SEARCH_PATH.iter()).unwrap_or_default(),
        )
        .output()
        .map_err(|error| format!("Failed to run Git from {}: {error}", cwd.display()))?;
    if output
        .status
        .code()
        .is_some_and(|code| success_codes.contains(&code))
    {
        return Ok(output.stdout);
    }
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    Err(if stderr.is_empty() {
        String::from_utf8_lossy(&output.stdout).trim().to_string()
    } else {
        stderr
    })
}

pub(super) fn is_installed() -> bool {
    find_git().is_some()
}

fn find_git() -> Option<PathBuf> {
    SEARCH_PATH
        .iter()
        .map(|dir| dir.join("git"))
        .find(|candidate| candidate.is_file())
}
