use std::fs::{self, DirBuilder};
use std::io::{PipeReader, Write};
use std::os::fd::{AsRawFd, RawFd};
use std::os::unix::fs::DirBuilderExt;
use std::path::PathBuf;
use std::process::Stdio;
use std::time::{Duration, Instant};

use anyhow::Result;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::{Child, Command};
use tokio::sync::{broadcast, watch};
use tokio::time::{sleep, timeout};

use super::rc::Rc;
use super::secret::Secret;

const STARTUP: Duration = Duration::from_secs(20);
const RESTART_DELAY: Duration = Duration::from_secs(3);
const LONGEST_RESTART_DELAY: Duration = Duration::from_secs(5 * 60);
const STEADY: Duration = Duration::from_secs(60);
const PASSWORDS: RawFd = 3;

pub struct Process {
    socket: PathBuf,
    cache: PathBuf,
    secret: Secret,
    logs: broadcast::Sender<String>,
    started: watch::Sender<u64>,
}

impl Process {
    pub fn prepare(
        runtime: PathBuf,
        socket: PathBuf,
        cache: PathBuf,
        secret: Secret,
    ) -> Result<(Self, broadcast::Sender<String>, watch::Receiver<u64>)> {
        DirBuilder::new()
            .recursive(true)
            .mode(0o700)
            .create(&runtime)?;
        fs::create_dir_all(&cache)?;
        let (logs, _) = broadcast::channel(256);
        let (started, starts) = watch::channel(0);
        let process = Self {
            socket,
            cache,
            secret,
            logs: logs.clone(),
            started,
        };
        Ok((process, logs, starts))
    }

    pub async fn supervise(self) {
        let mut delay = RESTART_DELAY;
        loop {
            let began = Instant::now();
            match self.run_once().await {
                Ok(()) => eprintln!("rclone stopped, starting it again"),
                Err(error) => eprintln!("rclone couldn't run: {error:#}"),
            }
            if began.elapsed() >= STEADY {
                delay = RESTART_DELAY;
            }
            sleep(delay).await;
            delay = (delay * 2).min(LONGEST_RESTART_DELAY);
        }
    }

    async fn run_once(&self) -> Result<()> {
        let _ = fs::remove_file(&self.socket);
        let mut child = self.spawn()?;
        let rc = Rc::new(self.socket.clone(), &self.secret);
        let ready = timeout(STARTUP, async {
            while !rc.reachable().await {
                sleep(Duration::from_millis(50)).await;
            }
        })
        .await;
        if ready.is_err() {
            child.kill().await?;
            anyhow::bail!("rclone didn't start listening");
        }
        self.started.send_modify(|generation| *generation += 1);
        child.wait().await?;
        Ok(())
    }

    fn passwords(&self) -> Result<PipeReader> {
        let (reader, mut writer) = std::io::pipe()?;
        writer.write_all(self.secret.htpasswd().as_bytes())?;
        Ok(reader)
    }

    fn spawn(&self) -> Result<Child> {
        let passwords = self.passwords()?;
        let inherited = passwords.as_raw_fd();
        let mut command = Command::new("rclone");
        unsafe {
            command.pre_exec(move || {
                if libc::dup2(inherited, PASSWORDS) < 0
                    || libc::fcntl(PASSWORDS, libc::F_SETFD, 0) < 0
                {
                    return Err(std::io::Error::last_os_error());
                }
                Ok(())
            });
        }
        let mut child = command
            .arg("rcd")
            .arg(format!("--rc-addr=unix://{}", self.socket.display()))
            .arg(format!("--rc-htpasswd=/dev/fd/{PASSWORDS}"))
            .args([
                "--config=/notfound",
                "--log-level=INFO",
                "--use-mmap",
                "--default-time=1970-01-01T00:00:00Z",
            ])
            .arg(format!("--cache-dir={}", self.cache.display()))
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .kill_on_drop(true)
            .spawn()?;
        drop(passwords);
        let stderr = child.stderr.take().expect("stderr is piped");
        let logs = self.logs.clone();
        tokio::spawn(async move {
            let mut lines = BufReader::new(stderr).lines();
            while let Ok(Some(line)) = lines.next_line().await {
                eprintln!("rclone: {line}");
                let _ = logs.send(line);
            }
        });
        Ok(child)
    }
}
