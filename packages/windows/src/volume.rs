use std::io::{BufReader, Read, Seek};

use anyhow::{Context, Result};
use ntfs::indexes::NtfsFileNameIndex;
use ntfs::structured_values::{NtfsFileNamespace, NtfsVolumeFlags};
use ntfs::{KnownNtfsFileRecordNumber, Ntfs, NtfsFile};

pub struct Volume<R: Read + Seek> {
    ntfs: Ntfs,
    fs: BufReader<R>,
}

impl<R: Read + Seek> Volume<R> {
    pub fn open(reader: R) -> Result<Self> {
        let mut fs = BufReader::with_capacity(1 << 16, reader);
        let mut ntfs = Ntfs::new(&mut fs)?;
        ntfs.read_upcase_table(&mut fs)?;
        Ok(Self { ntfs, fs })
    }

    pub fn dirty(&mut self) -> Result<bool> {
        let info = self.ntfs.volume_info(&mut self.fs)?;
        Ok(info.flags().contains(NtfsVolumeFlags::IS_DIRTY))
    }

    pub fn used(&mut self) -> Result<u64> {
        let cluster_size = u64::from(self.ntfs.cluster_size());
        let clusters = self.ntfs.size() / cluster_size;
        let bitmap = self
            .ntfs
            .file(&mut self.fs, KnownNtfsFileRecordNumber::Bitmap as u64)?;
        let data = bitmap
            .data(&mut self.fs, "")
            .transpose()?
            .context("$Bitmap has no data")?;
        let attribute = data.to_attribute()?;
        let value = attribute.value(&mut self.fs)?;
        let mut reader = value.attach(&mut self.fs).take(clusters.div_ceil(8));

        let mut chunk = vec![0; 1 << 16];
        let mut allocated = 0u64;
        let mut last = 0u8;
        loop {
            let read = reader.read(&mut chunk)?;
            if read == 0 {
                break;
            }
            allocated += chunk[..read]
                .iter()
                .map(|byte| u64::from(byte.count_ones()))
                .sum::<u64>();
            last = chunk[read - 1];
        }
        let tail = clusters % 8;
        if tail != 0 {
            allocated -= u64::from((last >> tail).count_ones());
        }
        Ok(allocated * cluster_size)
    }

    pub fn read(&mut self, path: &str) -> Result<Option<Vec<u8>>> {
        self.read_limited(path, u64::MAX)
    }

    pub fn read_limited(&mut self, path: &str, limit: u64) -> Result<Option<Vec<u8>>> {
        let Some(file) = lookup(&self.ntfs, &mut self.fs, path)? else {
            return Ok(None);
        };
        read_data(&file, &mut self.fs, limit).map(Some)
    }

    pub fn modified(&mut self, path: &str) -> Result<Option<u64>> {
        let Some(file) = lookup(&self.ntfs, &mut self.fs, path)? else {
            return Ok(None);
        };
        Ok(Some(file.info()?.modification_time().nt_timestamp()))
    }

    pub fn subdirectories(&mut self, path: &str) -> Result<Vec<String>> {
        let Some(directory) = lookup(&self.ntfs, &mut self.fs, path)? else {
            return Ok(Vec::new());
        };
        let index = directory.directory_index(&mut self.fs)?;
        let mut entries = index.entries();
        let mut names = Vec::new();
        while let Some(entry) = entries.next(&mut self.fs) {
            let Some(name) = entry?.key().transpose()? else {
                continue;
            };
            if name.is_directory() && name.namespace() != NtfsFileNamespace::Dos {
                names.push(name.name().to_string_lossy());
            }
        }
        Ok(names)
    }
}

fn lookup<'n, R: Read + Seek>(
    ntfs: &'n Ntfs,
    fs: &mut R,
    path: &str,
) -> Result<Option<NtfsFile<'n>>> {
    let mut file = ntfs.root_directory(fs)?;
    for component in path.split('\\').filter(|component| !component.is_empty()) {
        if !file.is_directory() {
            return Ok(None);
        }
        let index = file.directory_index(fs)?;
        let mut finder = index.finder();
        let Some(entry) = NtfsFileNameIndex::find(&mut finder, ntfs, fs, component) else {
            return Ok(None);
        };
        file = entry?.to_file(ntfs, fs)?;
    }
    Ok(Some(file))
}

fn read_data<R: Read + Seek>(file: &NtfsFile, fs: &mut R, limit: u64) -> Result<Vec<u8>> {
    let Some(item) = file.data(fs, "") else {
        return Ok(Vec::new());
    };
    let item = item?;
    let attribute = item.to_attribute()?;
    let value = attribute.value(fs)?;
    let length = limit.min(value.len());
    let mut data = Vec::with_capacity(length as usize);
    value.attach(fs).take(length).read_to_end(&mut data)?;
    Ok(data)
}
