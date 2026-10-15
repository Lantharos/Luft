use std::collections::BTreeMap;
use std::io::{self, Read};

pub const SECTOR: u64 = 2048;
const FIRST_DESCRIPTOR: u64 = 16;
const ROOT_RECORD: usize = 156;
const JOLIET_ESCAPES: [&[u8]; 3] = [b"%/@", b"%/C", b"%/E"];
const DIRECTORY: u8 = 0x02;
const MORE_EXTENTS: u8 = 0x80;
const CHUNK: usize = 1 << 20;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Entry {
    pub path: String,
    pub size: u64,
}

pub trait Sink {
    fn wants(&self, path: &str) -> bool;
    fn write(&mut self, path: &str, offset: u64, data: &[u8]) -> io::Result<()>;
}

enum Pending {
    Directory {
        path: String,
        length: u64,
    },
    File {
        path: String,
        offset: u64,
        length: u64,
    },
}

impl Pending {
    fn length(&self) -> u64 {
        match self {
            Self::Directory { length, .. } | Self::File { length, .. } => *length,
        }
    }
}

struct Record<'a> {
    extent: u64,
    length: u64,
    flags: u8,
    name: &'a [u8],
}

fn invalid(message: &str) -> io::Error {
    io::Error::new(io::ErrorKind::InvalidData, message.to_owned())
}

fn records(data: &[u8]) -> impl Iterator<Item = Record<'_>> {
    let mut at = 0usize;
    std::iter::from_fn(move || {
        loop {
            if at >= data.len() {
                return None;
            }
            let length = data[at] as usize;
            if length == 0 {
                at = (at / SECTOR as usize + 1) * SECTOR as usize;
                continue;
            }
            let record = data.get(at..at + length)?;
            at += length;
            let name_length = *record.get(32)? as usize;
            return Some(Record {
                extent: u32::from_le_bytes(record.get(2..6)?.try_into().ok()?) as u64,
                length: u32::from_le_bytes(record.get(10..14)?.try_into().ok()?) as u64,
                flags: record[25],
                name: record.get(33..33 + name_length)?,
            });
        }
    })
}

fn joliet_name(bytes: &[u8]) -> String {
    let units: Vec<u16> = bytes
        .as_chunks::<2>()
        .0
        .iter()
        .map(|pair| u16::from_be_bytes(*pair))
        .collect();
    let name = String::from_utf16_lossy(&units);
    match name.rsplit_once(';') {
        Some((name, _)) => name.to_owned(),
        None => name,
    }
}

fn root_of(descriptor: &[u8]) -> Option<(u64, u64)> {
    let record = records(&descriptor[ROOT_RECORD..ROOT_RECORD + 34]).next()?;
    Some((record.extent, record.length))
}

struct Walker<R> {
    reader: R,
    position: u64,
    pending: BTreeMap<u64, Vec<Pending>>,
    entries: Vec<Entry>,
}

impl<R: Read> Walker<R> {
    fn new(reader: R) -> Self {
        Self {
            reader,
            position: 0,
            pending: BTreeMap::new(),
            entries: Vec::new(),
        }
    }

    fn sector(&mut self) -> io::Result<Vec<u8>> {
        let mut sector = vec![0; SECTOR as usize];
        self.reader.read_exact(&mut sector)?;
        self.position += SECTOR;
        Ok(sector)
    }

    fn skip_to(&mut self, offset: u64) -> io::Result<()> {
        if offset < self.position {
            return Err(invalid(
                "The ISO's files aren't in an order Meet Luft can read",
            ));
        }
        let skipped = io::copy(
            &mut (&mut self.reader).take(offset - self.position),
            &mut io::sink(),
        )?;
        self.position += skipped;
        if self.position < offset {
            return Err(io::ErrorKind::UnexpectedEof.into());
        }
        Ok(())
    }

    fn find_root(&mut self) -> io::Result<()> {
        self.skip_to(FIRST_DESCRIPTOR * SECTOR)?;
        loop {
            let descriptor = self.sector()?;
            if &descriptor[1..6] != b"CD001" {
                return Err(invalid("This isn't an ISO image"));
            }
            match descriptor[0] {
                2 if JOLIET_ESCAPES.contains(&&descriptor[88..91]) => {
                    let (extent, length) = root_of(&descriptor)
                        .ok_or_else(|| invalid("The ISO has no root folder"))?;
                    self.queue(
                        extent,
                        Pending::Directory {
                            path: String::new(),
                            length,
                        },
                    );
                }
                255 => break,
                _ => {}
            }
        }
        if self.pending.is_empty() {
            return Err(invalid("The ISO has no Joliet names"));
        }
        Ok(())
    }

    fn queue(&mut self, extent: u64, pending: Pending) {
        self.pending
            .entry(extent * SECTOR)
            .or_default()
            .push(pending);
    }

    fn read_directory(
        &mut self,
        parent: &str,
        data: &[u8],
        sink: Option<&dyn Sink>,
    ) -> Vec<String> {
        let mut empty = Vec::new();
        let mut continuing: Option<(String, u64)> = None;
        for record in records(data) {
            if record.name == [0] || record.name == [1] {
                continue;
            }
            let name = joliet_name(record.name);
            let path = if parent.is_empty() {
                name
            } else {
                format!("{parent}/{name}")
            };
            if record.flags & DIRECTORY != 0 {
                self.queue(
                    record.extent,
                    Pending::Directory {
                        path,
                        length: record.length,
                    },
                );
                continue;
            }
            let offset = match continuing.take() {
                Some((previous, offset)) if previous == path => offset,
                _ => 0,
            };
            if record.flags & MORE_EXTENTS != 0 {
                continuing = Some((path.clone(), offset + record.length));
            } else {
                self.entries.push(Entry {
                    path: path.clone(),
                    size: offset + record.length,
                });
            }
            if !sink.is_some_and(|sink| sink.wants(&path)) {
                continue;
            }
            if record.length == 0 {
                empty.push(path);
            } else {
                self.queue(
                    record.extent,
                    Pending::File {
                        path,
                        offset,
                        length: record.length,
                    },
                );
            }
        }
        empty
    }

    fn next_group(&mut self, directories_only: bool) -> Option<(u64, Vec<Pending>)> {
        if directories_only {
            let offset = *self
                .pending
                .iter()
                .find(|(_, group)| {
                    group
                        .iter()
                        .any(|item| matches!(item, Pending::Directory { .. }))
                })?
                .0;
            self.pending.remove(&offset).map(|group| (offset, group))
        } else {
            self.pending.pop_first()
        }
    }

    fn walk(&mut self, mut sink: Option<&mut dyn Sink>) -> io::Result<()> {
        self.find_root()?;
        while let Some((offset, group)) = self.next_group(sink.is_none()) {
            self.skip_to(offset)?;
            let length = group.iter().map(Pending::length).max().unwrap_or(0);
            if group
                .iter()
                .any(|item| matches!(item, Pending::Directory { .. }))
            {
                let mut data = vec![0; length.div_ceil(SECTOR) as usize * SECTOR as usize];
                self.reader.read_exact(&mut data)?;
                self.position += data.len() as u64;
                for item in &group {
                    if let Pending::Directory { path, length } = item {
                        let empty = self.read_directory(
                            path,
                            &data[..*length as usize],
                            sink.as_deref().map(|sink| sink as &dyn Sink),
                        );
                        if let Some(sink) = sink.as_deref_mut() {
                            for path in empty {
                                sink.write(&path, 0, &[])?;
                            }
                        }
                    }
                }
                continue;
            }
            let sink = sink
                .as_deref_mut()
                .expect("files are only queued when extracting");
            self.stream(&group, length, sink)?;
        }
        Ok(())
    }

    fn stream(&mut self, group: &[Pending], length: u64, sink: &mut dyn Sink) -> io::Result<()> {
        let mut buffer = vec![0; CHUNK];
        let mut done = 0u64;
        while done < length {
            let wanted = (length - done).min(CHUNK as u64) as usize;
            self.reader.read_exact(&mut buffer[..wanted])?;
            for item in group {
                if let Pending::File {
                    path,
                    offset,
                    length,
                } = item
                    && done < *length
                {
                    let end = (*length - done).min(wanted as u64) as usize;
                    sink.write(path, offset + done, &buffer[..end])?;
                }
            }
            done += wanted as u64;
        }
        self.position += length;
        Ok(())
    }
}

pub fn list(reader: impl Read) -> io::Result<Vec<Entry>> {
    let mut walker = Walker::new(reader);
    walker.walk(None)?;
    Ok(walker.entries)
}

pub fn extract(reader: impl Read, sink: &mut dyn Sink) -> io::Result<Vec<Entry>> {
    let mut walker = Walker::new(reader);
    walker.walk(Some(sink))?;
    io::copy(&mut walker.reader, &mut io::sink())?;
    Ok(walker.entries)
}

#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use super::*;

    struct Iso {
        sectors: Vec<[u8; SECTOR as usize]>,
    }

    fn record(name: &[u8], extent: u32, length: u32, flags: u8) -> Vec<u8> {
        let size = 33 + name.len() + (name.len() + 1) % 2;
        let mut record = vec![0; size];
        record[0] = size as u8;
        record[2..6].copy_from_slice(&extent.to_le_bytes());
        record[10..14].copy_from_slice(&length.to_le_bytes());
        record[25] = flags;
        record[32] = name.len() as u8;
        record[33..33 + name.len()].copy_from_slice(name);
        record
    }

    fn joliet(name: &str) -> Vec<u8> {
        name.encode_utf16().flat_map(u16::to_be_bytes).collect()
    }

    impl Iso {
        fn new(count: usize) -> Self {
            Self {
                sectors: vec![[0; SECTOR as usize]; count],
            }
        }

        fn put(&mut self, sector: usize, bytes: &[u8]) {
            for (index, chunk) in bytes.chunks(SECTOR as usize).enumerate() {
                self.sectors[sector + index][..chunk.len()].copy_from_slice(chunk);
            }
        }

        fn bytes(&self) -> Vec<u8> {
            self.sectors.concat()
        }
    }

    fn sample() -> Iso {
        let mut iso = Iso::new(40);
        let mut joliet_descriptor = vec![0; SECTOR as usize];
        joliet_descriptor[0] = 2;
        joliet_descriptor[1..6].copy_from_slice(b"CD001");
        joliet_descriptor[88..91].copy_from_slice(b"%/E");
        let root = record(&[0], 18, SECTOR as u32, DIRECTORY);
        joliet_descriptor[ROOT_RECORD..ROOT_RECORD + root.len()].copy_from_slice(&root);
        iso.put(16, &joliet_descriptor);
        let mut terminator = vec![0; 7];
        terminator[0] = 255;
        terminator[1..6].copy_from_slice(b"CD001");
        iso.put(17, &terminator);
        let root_dir = [
            record(&[0], 18, SECTOR as u32, DIRECTORY),
            record(&[1], 18, SECTOR as u32, DIRECTORY),
            record(&joliet("LiveOS"), 19, SECTOR as u32, DIRECTORY),
            record(&joliet("readme.txt;1"), 20, 5, 0),
        ]
        .concat();
        iso.put(18, &root_dir);
        let live_dir = [
            record(&[0], 19, SECTOR as u32, DIRECTORY),
            record(&[1], 18, SECTOR as u32, DIRECTORY),
            record(&joliet("luft.erofs;1"), 21, 4096, MORE_EXTENTS),
            record(&joliet("luft.erofs;1"), 30, 10, 0),
            record(&joliet("empty;1"), 0, 0, 0),
        ]
        .concat();
        iso.put(19, &live_dir);
        iso.put(20, b"hello");
        iso.put(21, &[1; 4096]);
        iso.put(30, &[2; 10]);
        iso
    }

    #[derive(Default)]
    struct Collect(HashMap<String, Vec<u8>>);

    impl Sink for Collect {
        fn wants(&self, path: &str) -> bool {
            path.starts_with("LiveOS/")
        }

        fn write(&mut self, path: &str, offset: u64, data: &[u8]) -> io::Result<()> {
            let file = self.0.entry(path.to_owned()).or_default();
            let end = offset as usize + data.len();
            file.resize(file.len().max(end), 0);
            file[offset as usize..end].copy_from_slice(data);
            Ok(())
        }
    }

    #[test]
    fn listing_stops_reading_after_the_folders() {
        let bytes = sample().bytes();
        let mut reader = &bytes[..20 * SECTOR as usize];
        let entries = list(&mut reader).unwrap();
        assert_eq!(
            entries,
            [
                Entry {
                    path: "readme.txt".into(),
                    size: 5
                },
                Entry {
                    path: "LiveOS/luft.erofs".into(),
                    size: 4106
                },
                Entry {
                    path: "LiveOS/empty".into(),
                    size: 0
                },
            ]
        );
    }

    #[test]
    fn wanted_files_are_put_together_from_every_extent() {
        let bytes = sample().bytes();
        let mut sink = Collect::default();
        extract(&bytes[..], &mut sink).unwrap();
        let erofs = &sink.0["LiveOS/luft.erofs"];
        assert_eq!(erofs.len(), 4106);
        assert!(
            erofs[..4096].iter().all(|byte| *byte == 1)
                && erofs[4096..].iter().all(|byte| *byte == 2)
        );
        assert_eq!(sink.0["LiveOS/empty"], b"");
        assert!(!sink.0.contains_key("readme.txt"));
    }
}
