use std::ffi::OsStr;
use std::io::{Read, Write};
use std::process::{Command, Output, Stdio};
use std::sync::mpsc;
use std::time::{Duration, Instant};

use anyhow::{Context, Result, bail};

use crate::system::secrets::secret::Secret;

const USUAL_LIMIT: Duration = Duration::from_secs(5 * 60);

pub struct Tool {
    command: Command,
    input: Option<Secret>,
    limit: Option<Duration>,
}

fn collect(pipe: Option<impl Read + Send + 'static>) -> mpsc::Receiver<Vec<u8>> {
    let (sender, receiver) = mpsc::channel();
    std::thread::spawn(move || {
        let mut bytes = Vec::new();
        if let Some(mut pipe) = pipe {
            let _ = pipe.read_to_end(&mut bytes);
        }
        let _ = sender.send(bytes);
    });
    receiver
}

fn finished(name: &str, output: Output) -> Result<Vec<u8>> {
    if !output.status.success() {
        let message = String::from_utf8_lossy(&output.stderr);
        bail!("{name} failed: {}", message.trim());
    }
    Ok(output.stdout)
}

impl Tool {
    pub fn new(program: &str) -> Self {
        let mut command = Command::new(program);
        command.env("LC_ALL", "C.UTF-8").env("SYSTEMD_COLORS", "0");
        Self {
            command,
            input: None,
            limit: Some(USUAL_LIMIT),
        }
    }

    pub fn unhurried(mut self) -> Self {
        self.limit = None;
        self
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
        let Some(limit) = self.limit else {
            return finished(&name, child.wait_with_output()?);
        };
        let deadline = Instant::now() + limit;
        let (stdout, stderr) = (collect(child.stdout.take()), collect(child.stderr.take()));
        let within = |pipe: mpsc::Receiver<Vec<u8>>| {
            pipe.recv_timeout(deadline.saturating_duration_since(Instant::now()))
        };
        let (Ok(stdout), Ok(stderr)) = (within(stdout), within(stderr)) else {
            let _ = child.kill();
            let _ = child.wait();
            bail!(
                "{name} didn't finish within {} minutes",
                limit.as_secs() / 60
            );
        };
        finished(
            &name,
            Output {
                status: child.wait()?,
                stdout,
                stderr,
            },
        )
    }

    pub fn status(self) -> Result<()> {
        self.output().map(drop)
    }

    pub fn succeeds(self) -> bool {
        self.output().is_ok()
    }
}
