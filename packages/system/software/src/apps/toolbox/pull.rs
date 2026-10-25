use std::collections::HashMap;
use std::io::{BufRead, BufReader, Write};
use std::os::fd::AsRawFd;
use std::os::unix::net::{UnixListener, UnixStream};
use std::os::unix::process::CommandExt;
use std::process::{Command, Stdio};

use serde::Deserialize;

use crate::progress::Stage;
use crate::task::{CANCELLED, Task};

const LISTEN_FD: i32 = 3;
const UNREACHABLE: &str =
    "Couldn't reach the container registry. Check your connection and try again.";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Event {
    id: Option<String>,
    #[serde(default)]
    progress_detail: Detail,
    error: Option<String>,
}

#[derive(Deserialize, Default)]
struct Detail {
    current: Option<u64>,
    total: Option<u64>,
}

#[derive(Default)]
struct Layers(HashMap<String, (u64, u64)>);

impl Layers {
    fn update(&mut self, id: String, detail: Detail) -> Option<f32> {
        let layer = self.0.entry(id).or_default();
        if let Some(total) = detail.total {
            layer.1 = total;
        }
        layer.0 = detail.current.unwrap_or(layer.1).min(layer.1);
        let (current, total) = self.0.values().fold((0, 0), |(current, total), layer| {
            (current + layer.0, total + layer.1)
        });
        (total > 0).then(|| current as f32 / total as f32)
    }
}

fn service(listener: &UnixListener) -> Result<std::process::Child, String> {
    let socket = listener.as_raw_fd();
    let mut command = Command::new("sh");
    command
        .args([
            "-c",
            "LISTEN_PID=$$ LISTEN_FDS=1 exec podman system service --time=0",
        ])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null());
    unsafe {
        command.pre_exec(move || {
            let inherited = if socket == LISTEN_FD {
                libc::fcntl(socket, libc::F_SETFD, 0)
            } else {
                libc::dup2(socket, LISTEN_FD)
            };
            match inherited {
                -1 => Err(std::io::Error::last_os_error()),
                _ => Ok(()),
            }
        });
    }
    command
        .spawn()
        .map_err(|_| "Podman isn't installed.".to_string())
}

fn follow(stream: UnixStream, task: Task) -> Result<(), String> {
    let mut layers = Layers::default();
    let lines = BufReader::new(stream)
        .lines()
        .map_while(Result::ok)
        .skip_while(|line| !line.trim().is_empty());
    for line in lines {
        let Ok(event) = serde_json::from_str::<Event>(&line) else {
            continue;
        };
        if let Some(error) = event.error {
            eprintln!("Pulling a container image: {error}");
            return Err(UNREACHABLE.into());
        }
        if let Some(fraction) = event
            .id
            .and_then(|id| layers.update(id, event.progress_detail))
        {
            task.progress(Stage::Downloading, Some(fraction));
        }
    }
    if task.cancel.is_cancelled() {
        return Err(CANCELLED.into());
    }
    Ok(())
}

pub fn pull(image: &str, task: Task) -> Result<(), String> {
    let (name, tag) = image
        .rsplit_once(':')
        .ok_or("The tools image has no tag.")?;
    let folder = dirs::runtime_dir().ok_or("There's no runtime folder for Podman.")?;
    let path = folder.join(format!("luft-toolbox-{}.sock", std::process::id()));
    let _ = std::fs::remove_file(&path);
    let listener = UnixListener::bind(&path).map_err(|error| error.to_string())?;
    let mut service = service(&listener)?;
    let connected = UnixStream::connect(&path);
    drop(listener);
    let _ = std::fs::remove_file(&path);
    let pulled = connected
        .map_err(|error| error.to_string())
        .and_then(|mut stream| {
            write!(
            stream,
            "POST /v5.0.0/images/create?fromImage={name}&tag={tag} HTTP/1.0\r\nHost: podman\r\n\r\n"
        )
        .map_err(|error| error.to_string())?;
            let closer = stream.try_clone().map_err(|error| error.to_string())?;
            task.cancel
                .while_running(
                    move || {
                        let _ = closer.shutdown(std::net::Shutdown::Both);
                    },
                    || follow(stream, task),
                )
                .unwrap_or_else(|| Err(CANCELLED.into()))
        });
    let _ = service.kill();
    let _ = service.wait();
    pulled
}
