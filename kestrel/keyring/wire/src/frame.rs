use std::fmt;
use std::io::{self, Read, Write};

use serde::Serialize;
use serde::de::DeserializeOwned;
use zeroize::Zeroizing;

pub const MAX_FRAME: usize = 64 * 1024;

#[derive(Debug)]
pub enum FrameError {
    Io(io::Error),
    TooLarge(usize),
    Malformed(postcard::Error),
}

impl fmt::Display for FrameError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Io(error) => write!(formatter, "{error}"),
            Self::TooLarge(size) => write!(formatter, "a {size} byte message is too large"),
            Self::Malformed(error) => write!(formatter, "malformed message: {error}"),
        }
    }
}

impl std::error::Error for FrameError {}

impl From<io::Error> for FrameError {
    fn from(error: io::Error) -> Self {
        Self::Io(error)
    }
}

fn encode(message: &impl Serialize) -> Result<Zeroizing<Vec<u8>>, FrameError> {
    let size = postcard::experimental::serialized_size(message).map_err(FrameError::Malformed)?;
    if size > MAX_FRAME {
        return Err(FrameError::TooLarge(size));
    }
    let length = u32::try_from(size).map_err(|_| FrameError::TooLarge(size))?;
    let mut frame = Zeroizing::new(vec![0; 4 + size]);
    frame[..4].copy_from_slice(&length.to_le_bytes());
    postcard::to_slice(message, &mut frame[4..]).map_err(FrameError::Malformed)?;
    Ok(frame)
}

fn payload_size(header: [u8; 4]) -> Result<usize, FrameError> {
    let size = u32::from_le_bytes(header) as usize;
    if size > MAX_FRAME {
        return Err(FrameError::TooLarge(size));
    }
    Ok(size)
}

fn decode<T: DeserializeOwned>(payload: &[u8]) -> Result<T, FrameError> {
    postcard::from_bytes(payload).map_err(FrameError::Malformed)
}

pub fn write(stream: &mut impl Write, message: &impl Serialize) -> Result<(), FrameError> {
    stream.write_all(&encode(message)?)?;
    Ok(stream.flush()?)
}

pub fn read<T: DeserializeOwned>(stream: &mut impl Read) -> Result<T, FrameError> {
    let mut header = [0; 4];
    stream.read_exact(&mut header)?;
    let mut payload = Zeroizing::new(vec![0; payload_size(header)?]);
    stream.read_exact(&mut payload)?;
    decode(&payload)
}

#[cfg(feature = "tokio")]
pub async fn write_async(
    stream: &mut (impl tokio::io::AsyncWrite + Unpin),
    message: &impl Serialize,
) -> Result<(), FrameError> {
    use tokio::io::AsyncWriteExt;
    stream.write_all(&encode(message)?).await?;
    Ok(stream.flush().await?)
}

#[cfg(feature = "tokio")]
pub async fn read_async<T: DeserializeOwned>(
    stream: &mut (impl tokio::io::AsyncRead + Unpin),
) -> Result<T, FrameError> {
    use tokio::io::AsyncReadExt;
    let mut header = [0; 4];
    stream.read_exact(&mut header).await?;
    let mut payload = Zeroizing::new(vec![0; payload_size(header)?]);
    stream.read_exact(&mut payload).await?;
    decode(&payload)
}
