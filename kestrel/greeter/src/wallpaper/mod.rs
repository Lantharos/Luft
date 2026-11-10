mod confine;
mod encode;

use std::fs::File;
use std::io::Write;
use std::os::fd::{AsFd, OwnedFd};
use std::os::unix::fs::MetadataExt;
use std::process::{ExitCode, Stdio};
use std::time::Duration;

use tokio::io::AsyncReadExt;
use tokio::process::Command;
use tokio::time::timeout;

use crate::error::Error;

pub const ENCODE_FLAG: &str = "--encode-wallpaper";
const TIME_LIMIT: Duration = Duration::from_secs(60);
const MAX_JPEG_BYTES: u64 = 64 << 20;

#[derive(Clone, Copy)]
pub enum Refusal {
    Unreadable = 10,
    TooLarge = 11,
    Unsupported = 12,
    Broken = 13,
    Unsaved = 14,
}

impl Refusal {
    fn with_code(code: Option<i32>) -> Self {
        [
            Self::Unreadable,
            Self::TooLarge,
            Self::Unsupported,
            Self::Unsaved,
        ]
        .into_iter()
        .find(|refusal| Some(*refusal as i32) == code)
        .unwrap_or(Self::Broken)
    }
}

impl From<Refusal> for Error {
    fn from(refusal: Refusal) -> Self {
        match refusal {
            Refusal::Unreadable => Self::invalid("The picture can't be read"),
            Refusal::TooLarge => Self::unsupported_image("This picture is too large"),
            Refusal::Unsupported => {
                Self::unsupported_image("This picture's format isn't supported")
            }
            Refusal::Broken => Self::unsupported_image("This picture couldn't be opened"),
            Refusal::Unsaved => Self::Failed("The picture couldn't be saved".into()),
        }
    }
}

pub fn same_file(first: &impl AsFd, second: &impl AsFd) -> bool {
    identity(first).is_some_and(|found| Some(found) == identity(second))
}

fn identity(file: &impl AsFd) -> Option<(u64, u64)> {
    let metadata = File::from(file.as_fd().try_clone_to_owned().ok()?)
        .metadata()
        .ok()?;
    Some((metadata.dev(), metadata.ino()))
}

pub async fn encode(picture: OwnedFd) -> Result<Vec<u8>, Error> {
    let mut encoder = Command::new(std::env::current_exe()?)
        .arg(ENCODE_FLAG)
        .stdin(Stdio::from(picture))
        .stdout(Stdio::piped())
        .kill_on_drop(true)
        .spawn()?;
    let output = encoder
        .stdout
        .take()
        .expect("the encoder's output is piped");
    let finished = async {
        let mut jpeg = Vec::new();
        output.take(MAX_JPEG_BYTES).read_to_end(&mut jpeg).await?;
        Ok::<_, std::io::Error>((encoder.wait().await?, jpeg))
    };
    match timeout(TIME_LIMIT, finished).await {
        Ok(Ok((status, jpeg))) if status.success() => Ok(jpeg),
        Ok(Ok((status, _))) => Err(Refusal::with_code(status.code()).into()),
        Ok(Err(_)) | Err(_) => Err(Refusal::Broken.into()),
    }
}

pub fn encode_standard_input() -> ExitCode {
    let encoded = std::io::stdin()
        .as_fd()
        .try_clone_to_owned()
        .map_err(|_| Refusal::Unreadable)
        .and_then(|input| encode::read(File::from(input)))
        .and_then(|bytes| {
            confine::to_memory_and_output().map_err(|error| {
                eprintln!("Couldn't confine the wallpaper encoder: {error}");
                Refusal::Broken
            })?;
            encode::encode(&bytes)
        });
    match encoded {
        Ok(jpeg) if std::io::stdout().write_all(&jpeg).is_ok() => ExitCode::SUCCESS,
        Ok(_) => ExitCode::from(Refusal::Unsaved as u8),
        Err(refusal) => ExitCode::from(refusal as u8),
    }
}
