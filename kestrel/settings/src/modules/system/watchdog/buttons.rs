use std::fs::{self, File, OpenOptions};
use std::io::{self, Read};
use std::os::unix::fs::OpenOptionsExt;
use std::path::{Path, PathBuf};

use futures_util::future::select_all;
use rustix::fs::OFlags;
use tokio::io::Interest;
use tokio::io::unix::AsyncFd;

const ROOT_OVERRIDE: &str = "LUFT_INPUT_ROOT";
const EVENT_SIZE: usize = 24;
const EV_KEY: u16 = 1;
const KEY_A: u16 = 30;
const POWER_KEYS: [u16; 3] = [116, 142, 205];

fn has_key(bitmap: &str, key: u16) -> bool {
    bitmap
        .split_whitespace()
        .rev()
        .nth(usize::from(key / 64))
        .and_then(|word| u64::from_str_radix(word, 16).ok())
        .is_some_and(|word| word >> (key % 64) & 1 == 1)
}

fn is_power_button(class: &Path) -> bool {
    fs::read_to_string(class.join("device/capabilities/key")).is_ok_and(|bitmap| {
        POWER_KEYS.iter().any(|key| has_key(&bitmap, *key)) && !has_key(&bitmap, KEY_A)
    })
}

fn open(node: &Path) -> io::Result<AsyncFd<File>> {
    let file = OpenOptions::new()
        .read(true)
        .custom_flags(OFlags::NONBLOCK.bits() as i32)
        .open(node)?;
    // SAFETY: the AsyncFd owns the file, so its descriptor stays open for its whole life.
    Ok(unsafe { AsyncFd::register_with_interest(file, Interest::READABLE)? })
}

fn pressed(event: &[u8; EVENT_SIZE]) -> bool {
    let kind = u16::from_ne_bytes([event[16], event[17]]);
    let code = u16::from_ne_bytes([event[18], event[19]]);
    let value = i32::from_ne_bytes([event[20], event[21], event[22], event[23]]);
    kind == EV_KEY && value == 1 && POWER_KEYS.contains(&code)
}

async fn next_press(device: &AsyncFd<File>) -> io::Result<bool> {
    let mut buffer = [0; EVENT_SIZE * 16];
    loop {
        let mut guard = device.readable().await?;
        match guard.try_io(|file| file.get_ref().read(&mut buffer)) {
            Ok(Ok(0)) => return Err(io::ErrorKind::UnexpectedEof.into()),
            Ok(Ok(read)) => return Ok(buffer[..read].as_chunks().0.iter().any(pressed)),
            Ok(Err(error)) => return Err(error),
            Err(_) => {}
        }
    }
}

pub struct Buttons(Vec<AsyncFd<File>>);

impl Buttons {
    pub fn open() -> Self {
        let root =
            std::env::var_os(ROOT_OVERRIDE).map_or_else(|| PathBuf::from("/"), PathBuf::from);
        let Ok(classes) = fs::read_dir(root.join("sys/class/input")) else {
            return Self(Vec::new());
        };
        Self(
            classes
                .flatten()
                .filter(|class| class.file_name().to_string_lossy().starts_with("event"))
                .filter(|class| is_power_button(&class.path()))
                .filter_map(|class| {
                    let node = root.join("dev/input").join(class.file_name());
                    open(&node)
                        .inspect_err(|error| {
                            eprintln!(
                                "Can't follow the power button at {}: {error}",
                                node.display()
                            )
                        })
                        .ok()
                })
                .collect(),
        )
    }

    pub async fn pressed(&mut self) {
        loop {
            if self.0.is_empty() {
                return std::future::pending().await;
            }
            let (index, outcome) = {
                let waits = self.0.iter().enumerate().map(|(index, device)| {
                    Box::pin(async move { (index, next_press(device).await) })
                });
                select_all(waits).await.0
            };
            match outcome {
                Ok(true) => return,
                Ok(false) => {}
                Err(error) => {
                    eprintln!("Stopped following a power button: {error}");
                    self.0.swap_remove(index);
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::has_key;

    #[test]
    fn reads_key_bitmaps_from_the_kernel() {
        let power_button = "8000 10000000000000 0";
        assert!(has_key(power_button, 116));
        assert!(has_key(power_button, 143));
        assert!(!has_key(power_button, 30));
        assert!(has_key(
            "483ffff17aff32d bfd4444600000000 1 130ff38b17c007 ffff7bfad941dfff febeffdfffefffff fffffffffffffffe",
            30
        ));
    }
}
