use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use std::path::Path;

use anyhow::{Context, Result, bail};

use crate::system::host::blocks;

pub const HEADER_ROOM: u64 = 32 << 20;
const SUPERBLOCK: u64 = 64 << 10;
const SUPERBLOCK_SIZE: usize = 4096;
const MAGIC: &[u8] = b"_BHRfS_M";

struct Superblock {
    total_bytes: u64,
    device_bytes: u64,
}

fn number_at(block: &[u8], offset: usize) -> u64 {
    u64::from_le_bytes(
        block[offset..offset + 8]
            .try_into()
            .expect("eight bytes make a u64"),
    )
}

impl Superblock {
    fn parse(block: &[u8; SUPERBLOCK_SIZE]) -> Option<Self> {
        (&block[64..72] == MAGIC).then(|| Self {
            total_bytes: number_at(block, 112),
            device_bytes: number_at(block, 209),
        })
    }

    fn read(device: &Path) -> Result<Self> {
        let mut block = [0u8; SUPERBLOCK_SIZE];
        let mut file = File::open(device)?;
        file.seek(SeekFrom::Start(SUPERBLOCK))?;
        file.read_exact(&mut block)?;
        Self::parse(&block).context("The system partition doesn't hold a btrfs file system")
    }
}

pub fn ensure_header_room(device: &Path) -> Result<()> {
    let size = blocks::kernel_name(device).map_or(0, |name| blocks::size_bytes(&name));
    let superblock = Superblock::read(device)?;
    let room = size.saturating_sub(HEADER_ROOM);
    if superblock.total_bytes > room || superblock.device_bytes > room {
        bail!(
            "The file system takes {} bytes but only {room} leave room for encryption's header, so the disk stays unencrypted",
            superblock.total_bytes.max(superblock.device_bytes)
        );
    }
    Ok(())
}
