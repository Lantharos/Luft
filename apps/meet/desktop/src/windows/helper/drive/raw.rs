use std::fs::File;
use std::io::{Read, Seek, SeekFrom};

use luft_i18n::t;

use crate::L10N;
use crate::boot::gpt::{self, Entry, Header};

pub struct RawDisk {
    file: File,
    pub sector: u64,
}

impl RawDisk {
    pub fn open(number: u32, sector: u32) -> Result<Self, String> {
        Ok(Self {
            file: File::open(format!(r"\\.\PhysicalDrive{number}"))
                .map_err(|error| error.to_string())?,
            sector: u64::from(sector.max(512)),
        })
    }

    pub fn read(&mut self, offset: u64, length: usize) -> Result<Vec<u8>, String> {
        let start = offset / self.sector * self.sector;
        let skip = (offset - start) as usize;
        let span = (skip + length).div_ceil(self.sector as usize) * self.sector as usize;
        let mut buffer = vec![0u8; span];
        self.file
            .seek(SeekFrom::Start(start))
            .and_then(|_| self.file.read_exact(&mut buffer))
            .map_err(|error| error.to_string())?;
        buffer.drain(..skip);
        buffer.truncate(length);
        Ok(buffer)
    }

    pub fn table(&mut self) -> Result<(Header, Vec<u8>), String> {
        let lba1 = self.read(self.sector, self.sector as usize)?;
        let header = gpt::header(&lba1).ok_or_else(|| t!(L10N, "drive-not-gpt"))?;
        let length = header.count as usize * header.entry_size as usize;
        let table = self.read(header.entries_lba * self.sector, length)?;
        Ok((header, table))
    }

    pub fn entries(&mut self) -> Result<Vec<Entry>, String> {
        let (header, table) = self.table()?;
        Ok(gpt::entries(&header, &table))
    }
}
