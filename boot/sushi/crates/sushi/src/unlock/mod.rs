//! LUKS unlock orchestration and systemd ask-password agent.

pub mod luks;
pub mod tpm;

pub use luks::{CrypttabEntry, LuksUnlock, UnlockOutcome};
pub use tpm::TpmUnlock;

use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{self, Receiver, Sender};
use std::sync::Arc;
use std::thread;
use std::time::Duration;

use anyhow::{Context, Result};
use crate::core::{SushiEvent, SushiEventKind, SushiStage, VisualMode};
use crate::log::log_event;
use thiserror::Error;

pub const ASK_PASSWORD_DIR: &str = "/run/systemd/ask-password";
pub const SUSHI_ASK_AGENT_PID: &str = "/run/sushi/ask-agent.pid";

#[derive(Debug, Error)]
pub enum UnlockError {
    #[error("ask-password request failed")]
    RequestFailed,
    #[error("passphrase rejected")]
    Rejected,
}

#[derive(Debug, Clone)]
pub struct PasswordRequest {
    pub id: String,
    pub message: String,
    pub pid: String,
    pub socket_path: PathBuf,
}

#[derive(Debug)]
pub enum UnlockMessage {
    Request(PasswordRequest),
    Shutdown,
}

pub struct AskPasswordAgent {
    shutdown: Arc<AtomicBool>,
    handle: Option<thread::JoinHandle<()>>,
}

impl AskPasswordAgent {
    pub fn start() -> Result<(Self, Receiver<UnlockMessage>)> {
        fs::create_dir_all("/run/sushi").context("create /run/sushi")?;
        let (tx, rx) = mpsc::channel();
        let shutdown = Arc::new(AtomicBool::new(false));
        let worker_shutdown = shutdown.clone();
        let handle = thread::spawn(move || watch_ask_password(tx, worker_shutdown));
        fs::write(SUSHI_ASK_AGENT_PID, std::process::id().to_string())?;
        Ok((Self { shutdown, handle: Some(handle) }, rx))
    }

    pub fn shutdown(&mut self) {
        self.shutdown.store(true, Ordering::SeqCst);
        if let Some(handle) = self.handle.take() {
            let _ = handle.join();
        }
        let _ = fs::remove_file(SUSHI_ASK_AGENT_PID);
    }
}

impl Drop for AskPasswordAgent {
    fn drop(&mut self) {
        self.shutdown();
    }
}

pub fn respond_to_request(request: &PasswordRequest, passphrase: &str) -> Result<()> {
    let mut stream = std::os::unix::net::UnixStream::connect(&request.socket_path)
        .with_context(|| format!("connect {}", request.socket_path.display()))?;
    stream.write_all(passphrase.as_bytes())?;
    stream.write_all(b"\n")?;
    stream.flush()?;
    Ok(())
}

pub fn secure_wipe(passphrase: &mut String) {
    unsafe {
        let bytes = passphrase.as_mut_vec();
        for b in bytes.iter_mut() {
            *b = 0;
        }
    }
    passphrase.clear();
}

pub fn log_unlock_event(kind: SushiEventKind) {
    log_event(&SushiEvent::new(SushiStage::Initramfs, kind));
}

pub fn enter_unlock_mode() -> SushiEvent {
    log_unlock_event(SushiEventKind::UnlockManualRequired);
    SushiEvent::new(SushiStage::Initramfs, SushiEventKind::UnlockManualRequired)
}

pub fn unlock_failed() -> SushiEvent {
    log_unlock_event(SushiEventKind::UnlockManualFailed);
    SushiEvent::new(SushiStage::Initramfs, SushiEventKind::UnlockManualFailed)
}

pub fn mode_for_unlock(visual_mode: &mut VisualMode) {
    *visual_mode = VisualMode::Unlocking;
}

fn watch_ask_password(tx: Sender<UnlockMessage>, shutdown: Arc<AtomicBool>) {
    let mut seen = std::collections::HashSet::new();
    while !shutdown.load(Ordering::SeqCst) {
        if let Ok(requests) = scan_ask_password_dir() {
            for req in requests {
                if seen.insert(req.id.clone()) {
                    let _ = tx.send(UnlockMessage::Request(req));
                }
            }
        }
        thread::sleep(Duration::from_millis(200));
    }
}

fn scan_ask_password_dir() -> Result<Vec<PasswordRequest>> {
    let dir = Path::new(ASK_PASSWORD_DIR);
    if !dir.exists() {
        return Ok(Vec::new());
    }

    let mut out = Vec::new();
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        if let Some(req) = parse_ask_password_file(&path) {
            out.push(req);
        }
    }
    Ok(out)
}

fn parse_ask_password_file(path: &Path) -> Option<PasswordRequest> {
    let content = fs::read_to_string(path).ok()?;
    let mut id = String::new();
    let mut message = String::new();
    let mut pid = String::new();
    let mut socket_path = None;

    for line in content.lines() {
        if let Some((key, value)) = line.split_once('=') {
            match key {
                "Id" => id = value.to_string(),
                "Message" => message = value.to_string(),
                "PID" => pid = value.to_string(),
                "Socket" => socket_path = Some(PathBuf::from(value)),
                _ => {}
            }
        }
    }

    let socket_path = socket_path?;
    Some(PasswordRequest {
        id,
        message,
        pid,
        socket_path,
    })
}

pub struct TtyReader;

impl TtyReader {
    pub fn read_line_hidden(prompt: &str) -> Result<String> {
        use std::io::{self, BufRead, stdin};
        eprint!("{prompt}");
        let _ = io::stderr().flush();

        let mut termios: libc::termios = unsafe { std::mem::zeroed() };
        let tty = "/dev/tty";
        let fd = unsafe {
            libc::open(
                tty.as_ptr() as *const libc::c_char,
                libc::O_RDONLY,
            )
        };
        if fd >= 0 {
            unsafe {
                libc::tcgetattr(fd, &mut termios);
                let mut hidden = termios;
                hidden.c_lflag &= !libc::ECHO;
                libc::tcsetattr(fd, libc::TCSANOW, &hidden);
            }
        }

        let mut line = String::new();
        stdin().lock().read_line(&mut line)?;

        if fd >= 0 {
            unsafe {
                libc::tcsetattr(fd, libc::TCSANOW, &termios);
                libc::close(fd);
            }
        }
        eprintln!();
        Ok(line.trim_end().to_string())
    }
}