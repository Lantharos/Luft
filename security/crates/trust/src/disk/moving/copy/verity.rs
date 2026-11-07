use std::fs::File;
use std::os::fd::AsRawFd;
use std::path::Path;

use anyhow::{Context, Result, bail};

const READ_METADATA: libc::c_ulong = 0xC028_6687;
const ENABLE: libc::c_ulong = 0x4080_6685;
const DESCRIPTOR: u64 = 2;
const DESCRIPTOR_SIZE: usize = 256;
const SALT_AT: usize = 0x50;
pub const FLAG: u32 = 0x0010_0000;
const BUSY_TRIES: u32 = 100;
const BUSY_WAIT: std::time::Duration = std::time::Duration::from_millis(20);

#[repr(C)]
struct ReadMetadata {
    metadata_type: u64,
    offset: u64,
    length: u64,
    buf_ptr: u64,
    reserved: u64,
}

#[repr(C)]
struct Enable {
    version: u32,
    hash_algorithm: u32,
    block_size: u32,
    salt_size: u32,
    salt_ptr: u64,
    sig_size: u32,
    reserved1: u32,
    sig_ptr: u64,
    reserved2: [u64; 11],
}

pub struct Verity {
    hash_algorithm: u8,
    log_block_size: u8,
    salt: Vec<u8>,
}

pub fn read(file: &File) -> Result<Verity> {
    let mut descriptor = [0u8; DESCRIPTOR_SIZE];
    let mut request = ReadMetadata {
        metadata_type: DESCRIPTOR,
        offset: 0,
        length: DESCRIPTOR_SIZE as u64,
        buf_ptr: descriptor.as_mut_ptr() as u64,
        reserved: 0,
    };
    let read = unsafe { libc::ioctl(file.as_raw_fd(), READ_METADATA, &raw mut request) };
    if read < 4 {
        bail!(
            "fs-verity's descriptor couldn't be read: {}",
            std::io::Error::last_os_error()
        );
    }
    let salt_size = usize::from(descriptor[3]);
    Ok(Verity {
        hash_algorithm: descriptor[1],
        log_block_size: descriptor[2],
        salt: descriptor[SALT_AT..SALT_AT + salt_size].to_vec(),
    })
}

pub fn enable(path: &Path, verity: &Verity) -> Result<()> {
    let file = File::open(path)?;
    let request = Enable {
        version: 1,
        hash_algorithm: u32::from(verity.hash_algorithm),
        block_size: 1 << verity.log_block_size,
        salt_size: verity.salt.len() as u32,
        salt_ptr: verity.salt.as_ptr() as u64,
        sig_size: 0,
        reserved1: 0,
        sig_ptr: 0,
        reserved2: [0; 11],
    };
    for _ in 0..BUSY_TRIES {
        if unsafe { libc::ioctl(file.as_raw_fd(), ENABLE, &raw const request) } == 0 {
            return Ok(());
        }
        let error = std::io::Error::last_os_error();
        if error.raw_os_error() != Some(libc::ETXTBSY) {
            return Err(error).with_context(|| {
                format!("fs-verity couldn't be turned on for {}", path.display())
            });
        }
        std::thread::sleep(BUSY_WAIT);
    }
    bail!("{} stayed open for writing", path.display())
}
