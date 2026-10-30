use std::fs::{self, DirBuilder};
use std::os::unix::fs::DirBuilderExt;
use std::path::PathBuf;
use std::process::Stdio;
use std::time::Duration;

use anyhow::Result;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::{Child, Command};
use tokio::sync::{broadcast, watch};
use tokio::time::{sleep, timeout};

use super::rc::Rc;

const STARTUP: Duration = Duration::from_secs(20);
const RESTART_DELAY: Duration = Duration::from_secs(3);

pub struct Process {
    socket: PathBuf,
    cache: PathBuf,
    logs: broadcast::Sender<String>,
    started: watch::Sender<u64>,
}

impl Process {
    pub fn prepare(
        runtime: PathBuf,
        socket: PathBuf,
        cache: PathBuf,
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
            logs: logs.clone(),
            started,
        };
        Ok((process, logs, starts))
    }

    pub async fn supervise(self) {
        loop {
            match self.run_once().await {
                Ok(()) => eprintln!("rclone stopped, starting it again"),
                Err(error) => eprintln!("rclone couldn't run: {error:#}"),
            }
            sleep(RESTART_DELAY).await;
        }
    }

    async fn run_once(&self) -> Result<()> {
        let _ = fs::remove_file(&self.socket);
        let mut child = self.spawn()?;
        let rc = Rc::new(self.socket.clone());
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

    fn spawn(&self) -> Result<Child> {
        let mut child = Command::new("rclone")
            .arg("rcd")
            .arg(format!("--rc-addr=unix://{}", self.socket.display()))
            .args([
                "--rc-no-auth",
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
