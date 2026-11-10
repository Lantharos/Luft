use std::io::{PipeReader, Write};

use zbus::Fd;

use crate::{DRIVES, Outcome, unlocking};

fn piped(secret: &str) -> Result<PipeReader, String> {
    let (reader, mut writer) = std::io::pipe().map_err(|error| error.to_string())?;
    writer
        .write_all(secret.as_bytes())
        .map_err(|error| error.to_string())?;
    Ok(reader)
}

/// Opens an encrypted drive and returns the opened device. The passphrase
/// goes to trustd through a pipe, so it is never part of a message on the bus.
pub async fn unlock(device: &str, passphrase: &str) -> Result<Outcome<String>, String> {
    let passphrase = piped(passphrase)?;
    unlocking(
        &DRIVES,
        "UnlockWithPassphrase",
        &(device, Fd::from(&passphrase)),
    )
    .await
}

pub async fn change_passphrase(
    device: &str,
    current: &str,
    new: &str,
) -> Result<Outcome<()>, String> {
    let (current, new) = (piped(current)?, piped(new)?);
    unlocking(
        &DRIVES,
        "ChangePassphrase",
        &(device, Fd::from(&current), Fd::from(&new)),
    )
    .await
}
