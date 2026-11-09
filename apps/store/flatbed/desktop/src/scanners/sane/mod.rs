mod ffi;
mod helper;
mod pixels;
mod wire;

use std::fs;
use std::io::{BufReader, Write};
use std::net::IpAddr;
use std::path::PathBuf;
use std::process::{Child, ChildStdin, ChildStdout, Command, Stdio};
use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::time::{Duration, Instant};

pub use helper::run as run_helper;

use super::{Connection, Feed, Progress, ScanError, Scanner, found_sane};
use pixels::Assembly;
use wire::{Frame, Reply, Request};

/// The argument that starts Flatbed as its SANE helper.
pub const SANE_HELPER: &str = "--sane-helper";

const PREVIEW_EVERY: Duration = Duration::from_millis(350);

struct Helper {
    child: Child,
    output: BufReader<ChildStdout>,
}

static HELPER: Mutex<Option<Helper>> = Mutex::new(None);
static INPUT: Mutex<Option<ChildStdin>> = Mutex::new(None);
/// Set when the helper has to start again to read a new configuration.
static STALE: AtomicBool = AtomicBool::new(false);
/// The helper scanning right now, or 0.
static SCANNING: AtomicU32 = AtomicU32::new(0);
/// How long a driver gets to stop by itself after a cancel.
const STOP_WAIT: Duration = Duration::from_secs(6);

fn config_folder() -> PathBuf {
    dirs::state_dir()
        .or_else(dirs::data_local_dir)
        .unwrap_or_else(std::env::temp_dir)
        .join(crate::APP_ID)
        .join("sane")
}

/// SANE reads Flatbed's folder first, then wherever it would anyway.
fn config_path() -> String {
    let ours = config_folder().to_string_lossy().into_owned();
    let theirs = std::env::var("SANE_CONFIG_DIR").unwrap_or_default();
    format!("{ours}:{theirs}")
}

fn spawn() -> Result<Helper, String> {
    let program = std::env::current_exe().map_err(|error| error.to_string())?;
    let mut child = Command::new(program)
        .arg(SANE_HELPER)
        .env("SANE_CONFIG_DIR", config_path())
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|error| error.to_string())?;
    *INPUT.lock().expect("helper input lock") = child.stdin.take();
    let output = BufReader::new(child.stdout.take().ok_or("The helper has no output")?);
    Ok(Helper { child, output })
}

fn ask(request: &Request) -> Result<(), String> {
    let mut input = INPUT.lock().expect("helper input lock");
    let input = input.as_mut().ok_or("The SANE helper isn't running")?;
    let mut line = serde_json::to_vec(request).map_err(|error| error.to_string())?;
    line.push(b'\n');
    input.write_all(&line).map_err(|error| error.to_string())
}

/// Runs `work` with a running helper, starting one if there's none or the
/// one there is reads an old configuration.
fn with_helper<T>(work: impl FnOnce(&mut Helper) -> Result<T, String>) -> Result<T, String> {
    let mut helper = HELPER.lock().expect("helper lock");
    if STALE.swap(false, Ordering::Relaxed)
        && let Some(mut old) = helper.take()
    {
        let _ = old.child.kill();
        let _ = old.child.wait();
    }
    if helper.is_none() {
        *helper = Some(spawn()?);
    }
    let result = work(helper.as_mut().expect("started"));
    if result.is_err()
        && let Some(mut broken) = helper.take()
    {
        let _ = broken.child.kill();
        let _ = broken.child.wait();
    }
    result
}

pub fn start() {
    std::thread::Builder::new()
        .name("sane".into())
        .spawn(list)
        .expect("a thread for SANE");
}

fn list() {
    let devices = with_helper(|helper| {
        ask(&Request::List)?;
        match wire::receive(&mut helper.output).map_err(|error| error.to_string())? {
            Frame::Reply(Reply::Devices(devices)) => Ok(devices),
            Frame::Reply(Reply::Failed(error)) => Err(format!("{error:?}")),
            _ => Err("The SANE helper answered something else".into()),
        }
    });
    let Ok(devices) = devices else {
        return;
    };
    found_sane(
        devices
            .into_iter()
            .map(|device| {
                let scanner = Scanner {
                    id: format!("sane:{}", device.name),
                    name: device.title,
                    connection: if device.address.is_some() {
                        Connection::Network
                    } else {
                        Connection::Usb
                    },
                    feeds: device.feeds,
                };
                (scanner, device.address)
            })
            .collect(),
    );
}

/// Points SANE's Canon driver at the Canon scanners announced on the
/// network and looks for scanners again.
pub fn look_again(hosts: Vec<IpAddr>) {
    let lines: String = hosts
        .iter()
        .map(|host| format!("bjnp://{host}\n"))
        .collect();
    if fs::create_dir_all(config_folder()).is_err()
        || fs::write(config_folder().join("pixma.conf"), lines).is_err()
    {
        return;
    }
    STALE.store(true, Ordering::Relaxed);
    start();
}

/// Asks the driver to stop, and stops the helper if the driver doesn't.
pub fn cancel() {
    let _ = ask(&Request::Cancel);
    let scanning = SCANNING.load(Ordering::Relaxed);
    if scanning == 0 {
        return;
    }
    std::thread::spawn(move || {
        std::thread::sleep(STOP_WAIT);
        if SCANNING.load(Ordering::Relaxed) == scanning {
            // SAFETY: kill only signals the helper Flatbed started, which is still scanning.
            unsafe { libc::kill(scanning as libc::pid_t, libc::SIGKILL) };
        }
    });
}

pub fn scan(
    device: &str,
    feed: Feed,
    colour: bool,
    dpi: u32,
    cancel: &AtomicBool,
    progress: &mut dyn Progress,
) -> Result<(), ScanError> {
    let outcome = with_helper(|helper| {
        SCANNING.store(helper.child.id(), Ordering::Relaxed);
        let outcome = ask(&Request::Scan {
            device: device.to_owned(),
            feed,
            colour,
            dpi,
        })
        .and_then(|()| receive(helper, cancel, progress));
        SCANNING.store(0, Ordering::Relaxed);
        outcome
    });
    match outcome {
        Ok(result) => result,
        Err(_) if cancel.load(Ordering::Relaxed) => Err(ScanError::Cancelled),
        Err(error) => Err(ScanError::Failed(error)),
    }
}

/// The pages the helper sends until it's done; `Err` when it stopped answering.
fn receive(
    helper: &mut Helper,
    cancel: &AtomicBool,
    progress: &mut dyn Progress,
) -> Result<Result<(), ScanError>, String> {
    let mut page: Option<Assembly> = None;
    let mut shown = Instant::now();
    loop {
        match wire::receive(&mut helper.output).map_err(|error| error.to_string())? {
            Frame::Reply(Reply::Page {
                width,
                lines,
                bytes_per_line,
                depth,
                colour,
                dpi,
            }) => {
                page = Some(Assembly::new(
                    width,
                    lines,
                    bytes_per_line,
                    depth,
                    colour,
                    dpi,
                ));
            }
            Frame::Pixels(bytes) => {
                if let Some(page) = page.as_mut() {
                    page.push(&bytes);
                    if shown.elapsed() >= PREVIEW_EVERY && !cancel.load(Ordering::Relaxed) {
                        if let Some(preview) = page.preview() {
                            progress.preview(&preview);
                        }
                        shown = Instant::now();
                    }
                }
            }
            Frame::Reply(Reply::PageDone) => {
                if let Some(page) = page.take() {
                    let dpi = page.dpi;
                    progress.page_pixels(page.finish(), dpi);
                }
            }
            Frame::Reply(Reply::Done) => return Ok(Ok(())),
            Frame::Reply(Reply::Failed(error)) => return Ok(Err(error)),
            Frame::Reply(Reply::Devices(_)) => {}
        }
    }
}
