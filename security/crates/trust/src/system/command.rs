use std::ffi::OsStr;
use std::io::Write;
use std::process::{Command, Stdio};

use anyhow::{Context, Result, bail};

use super::secret::Secret;

pub struct Tool {
    command: Command,
    input: Option<Secret>,
}

impl Tool {
    pub fn new(program: &str) -> Self {
        let mut command = Command::new(program);
        command.env("LC_ALL", "C.UTF-8").env("SYSTEMD_COLORS", "0");
        Self {
            command,
            input: None,
        }
    }

    pub fn arg(mut self, arg: impl AsRef<OsStr>) -> Self {
        self.command.arg(arg);
        self
    }

    pub fn args<I, S>(mut self, args: I) -> Self
    where
        I: IntoIterator<Item = S>,
        S: AsRef<OsStr>,
    {
        self.command.args(args);
        self
    }

    pub fn env(mut self, key: &str, value: impl AsRef<OsStr>) -> Self {
        self.command.env(key, value);
        self
    }

    pub fn input(mut self, secret: &Secret) -> Self {
        self.input = Some(secret.clone());
        self
    }

    pub fn output(self) -> Result<String> {
        self.output_bytes()
            .map(|bytes| String::from_utf8_lossy(&bytes).into_owned())
    }

    pub fn output_bytes(mut self) -> Result<Vec<u8>> {
        let name = self.command.get_program().to_string_lossy().into_owned();
        let mut child = self
            .command
            .stdin(if self.input.is_some() {
                Stdio::piped()
            } else {
                Stdio::null()
            })
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .with_context(|| format!("{name} couldn't be started"))?;
        if let (Some(input), Some(mut stdin)) = (self.input.take(), child.stdin.take()) {
            stdin.write_all(input.bytes())?;
        }
        let output = child.wait_with_output()?;
        if !output.status.success() {
            let message = String::from_utf8_lossy(&output.stderr);
            bail!("{name} failed: {}", message.trim());
        }
        Ok(output.stdout)
    }

    pub fn status(self) -> Result<()> {
        self.output().map(drop)
    }

    pub fn succeeds(self) -> bool {
        self.output().is_ok()
    }
}
