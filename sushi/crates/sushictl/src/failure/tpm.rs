use std::fs::OpenOptions;
use std::io::{self, Read, Write};

const CHIP: &str = "/dev/tpmrm0";
const VERSION: &str = "/sys/class/tpm/tpm0/tpm_version_major";
const STARTUP_IMAGE: u32 = 11;
const SYSTEM_IDENTITY: u32 = 15;
const MARK: &[u8; 32] = b"Luft opened a shell at startup. ";
const WITH_SESSIONS: u16 = 0x8002;
const PCR_EXTEND: u32 = 0x0182;
const EMPTY_PASSWORD: [u8; 9] = [0x40, 0, 0, 0x09, 0, 0, 0, 0, 0];
const SHA256: u16 = 0x000b;
const HEADER: usize = 10;
const SUCCESS: u32 = 0;

fn command(pcr: u32) -> Vec<u8> {
    let mut body = Vec::new();
    body.extend(pcr.to_be_bytes());
    body.extend((EMPTY_PASSWORD.len() as u32).to_be_bytes());
    body.extend(EMPTY_PASSWORD);
    body.extend(1u32.to_be_bytes());
    body.extend(SHA256.to_be_bytes());
    body.extend(MARK);
    let mut command = Vec::with_capacity(HEADER + body.len());
    command.extend(WITH_SESSIONS.to_be_bytes());
    command.extend(((HEADER + body.len()) as u32).to_be_bytes());
    command.extend(PCR_EXTEND.to_be_bytes());
    command.extend(body);
    command
}

fn extend(pcr: u32) -> io::Result<()> {
    let mut chip = OpenOptions::new().read(true).write(true).open(CHIP)?;
    chip.write_all(&command(pcr))?;
    let mut response = [0u8; 64];
    let length = chip.read(&mut response)?;
    let code = response[..length]
        .get(6..HEADER)
        .and_then(|code| code.try_into().ok())
        .map(u32::from_be_bytes)
        .ok_or_else(|| io::Error::other("the TPM's answer was cut short"))?;
    if code == SUCCESS {
        Ok(())
    } else {
        Err(io::Error::other(format!("the TPM answered {code:#x}")))
    }
}

fn has_chip() -> bool {
    std::fs::read_to_string(VERSION).is_ok_and(|version| version.trim() == "2")
}

pub fn stop_unlocking() -> io::Result<bool> {
    if !has_chip() {
        return Ok(false);
    }
    extend(STARTUP_IMAGE)?;
    extend(SYSTEM_IDENTITY)?;
    Ok(true)
}
