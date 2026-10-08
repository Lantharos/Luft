use std::env;
use std::ffi::OsString;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::LazyLock;

use serde_json::Value;

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

pub(super) fn run_json(program: &str, cwd: &Path, args: Vec<OsString>) -> Result<Value, String> {
    let text = run_text(program, cwd, args)?;
    serde_json::from_str(&text).map_err(|error| error.to_string())
}

pub(super) fn run_text(program: &str, cwd: &Path, args: Vec<OsString>) -> Result<String, String> {
    run_text_with_codes(program, cwd, args, &[0])
}

pub(super) fn run_text_with_codes(
    program: &str,
    cwd: &Path,
    args: Vec<OsString>,
    success_codes: &[i32],
) -> Result<String, String> {
    run_bytes(program, cwd, args, success_codes)
        .map(|output| String::from_utf8_lossy(&output).into_owned())
}

pub(super) fn run_bytes(
    program: &str,
    cwd: &Path,
    args: Vec<OsString>,
    success_codes: &[i32],
) -> Result<Vec<u8>, String> {
    let executable = find_program(program)
        .ok_or_else(|| format!("{} executable not found", program_label(program)))?;
    let output = Command::new(&executable)
        .args(args)
        .current_dir(cwd)
        .env("LC_ALL", "C")
        .env(
            "PATH",
            env::join_paths(SEARCH_PATH.iter()).unwrap_or_default(),
        )
        .output()
        .map_err(|error| {
            format!(
                "Failed to run {} from {}: {error}",
                program_label(program),
                cwd.display()
            )
        })?;
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

pub(super) fn is_installed(program: &str) -> bool {
    find_program(program).is_some()
}

fn find_program(program: &str) -> Option<PathBuf> {
    SEARCH_PATH
        .iter()
        .map(|dir| dir.join(program))
        .find(|candidate| candidate.is_file())
}

fn program_label(program: &str) -> &'static str {
    match program {
        "git" => "Git",
        "pig" => "Pig",
        _ => "Version control tool",
    }
}
