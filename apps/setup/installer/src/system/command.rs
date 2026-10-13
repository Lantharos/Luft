use std::ffi::OsStr;
use std::io::Write;
use std::process::{Child, Command, Stdio};

use anyhow::{Context, Result, bail};

pub struct Tool {
    command: Command,
    input: Option<Vec<u8>>,
}

impl Tool {
    pub fn new(program: &str) -> Self {
        let mut command = Command::new(program);
        command.env("LC_ALL", "C.UTF-8");
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

    pub fn input(mut self, input: &[u8]) -> Self {
        self.input = Some(input.to_vec());
        self
    }

    fn name(&self) -> String {
        self.command.get_program().to_string_lossy().into_owned()
    }

    pub fn spawn(mut self) -> Result<Child> {
        let name = self.name();
        self.command
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::inherit())
            .spawn()
            .with_context(|| format!("{name} couldn't be started"))
    }

    pub fn output(mut self) -> Result<String> {
        let name = self.name();
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
            stdin.write_all(&input)?;
        }
        let output = child.wait_with_output()?;
        if !output.status.success() {
            bail!(
                "{name} failed: {}",
                String::from_utf8_lossy(&output.stderr).trim()
            );
        }
        Ok(String::from_utf8_lossy(&output.stdout).into_owned())
    }

    pub fn run(self) -> Result<()> {
        self.output().map(drop)
    }
}

pub fn finished(mut child: Child, name: &str) -> Result<()> {
    let status = child.wait()?;
    if !status.success() {
        bail!("{name} stopped with {status}, see the journal for details");
    }
    Ok(())
}
