use std::process::{Command, Stdio};

use anyhow::{Context, Result, anyhow};

pub fn failure(program: &str, stderr: &[u8]) -> anyhow::Error {
    let text = String::from_utf8_lossy(stderr);
    let message = text
        .lines()
        .rev()
        .map(str::trim)
        .find(|line| !line.is_empty())
        .map(|line| {
            line.strip_prefix("error:")
                .or_else(|| line.strip_prefix("Error:"))
                .unwrap_or(line)
                .trim()
                .to_owned()
        })
        .unwrap_or_else(|| format!("{program} stopped unexpectedly."));
    anyhow!(message)
}

pub fn run(command: &mut Command) -> Result<Vec<u8>> {
    let output = command
        .stdin(Stdio::null())
        .output()
        .with_context(|| format!("Starting {command:?}"))?;
    if !output.status.success() {
        return Err(failure(
            &command.get_program().to_string_lossy(),
            &output.stderr,
        ));
    }
    Ok(output.stdout)
}
