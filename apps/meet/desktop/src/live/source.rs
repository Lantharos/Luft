use std::fs::{self, File};
use std::io::{self, Read};
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use super::download::{self, Channel, Download};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum Source {
    Download { channel: Channel },
    File { path: PathBuf },
}

pub struct Opened {
    pub reader: Box<dyn Read + Send>,
    pub total: u64,
}

impl Source {
    pub fn open(&self) -> io::Result<Opened> {
        match self {
            Self::Download { channel } => {
                let agent = download::agent();
                let located = download::locate(&agent, *channel)?;
                let stream = Download::open(&agent, &located.iso)?;
                Ok(Opened {
                    total: stream.total,
                    reader: Box::new(stream),
                })
            }
            Self::File { path } => {
                let file = File::open(path)?;
                Ok(Opened {
                    total: file.metadata()?.len(),
                    reader: Box::new(file),
                })
            }
        }
    }

    pub fn checksum(&self) -> io::Result<Option<[u8; 32]>> {
        match self {
            Self::Download { channel } => {
                download::locate(&download::agent(), *channel).map(|located| Some(located.checksum))
            }
            Self::File { path } => {
                let mut sidecar = path.clone().into_os_string();
                sidecar.push(".sha256");
                match fs::read_to_string(sidecar) {
                    Ok(text) => Ok(download::parse_checksum(&text)),
                    Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(None),
                    Err(error) => Err(error),
                }
            }
        }
    }
}
