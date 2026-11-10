use std::fs::File;
use std::io::Read;

use zbus::OwnedFd;

use super::error::Error;
use crate::system::secrets::secret::Secret;

const LONGEST: u64 = 4096;

pub async fn typed(secret: OwnedFd) -> Result<Secret, Error> {
    tokio::task::spawn_blocking(move || {
        let mut typed = Vec::new();
        let read = File::from(std::os::fd::OwnedFd::from(secret))
            .take(LONGEST + 1)
            .read_to_end(&mut typed);
        let typed = Secret::new(typed);
        match read {
            Ok(length) if length as u64 <= LONGEST => Ok(typed),
            Ok(_) => Err(Error::Unsupported(
                "That passphrase is too long.".to_owned(),
            )),
            Err(_) => Err(Error::Failed("The passphrase couldn't be read.".to_owned())),
        }
    })
    .await
    .map_err(|_| Error::Failed("The passphrase couldn't be read.".to_owned()))?
}
