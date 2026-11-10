use std::ffi::CStr;
use std::io;
use std::os::fd::AsFd;

use rustix::fs::{
    SeekFrom, XattrFlags, copy_file_range, fgetxattr, flistxattr, fsetxattr, ftruncate,
    ioctl_ficlone, seek,
};
use rustix::io::{Errno, pread, pwrite};

const CHUNK: usize = 4 * 1024 * 1024;
const BUFFER: usize = 1024 * 1024;
const OWN_ATTRIBUTES: &[u8] = b"user.";

/// Fills `output` with the `length` bytes of `input`, sharing the data when
/// the filesystem can, copying inside the kernel otherwise, and leaving the
/// holes of a sparse file as holes. `copied` hears of every stretch as it
/// lands and stops the copy by failing.
pub fn contents(
    input: impl AsFd,
    output: impl AsFd,
    length: u64,
    mut copied: impl FnMut(u64) -> io::Result<()>,
) -> io::Result<()> {
    let (input, output) = (input.as_fd(), output.as_fd());
    if length > 0 && ioctl_ficlone(output, input).is_ok() {
        return copied(length);
    }
    let mut range = Range {
        offset: 0,
        in_kernel: true,
        buffer: Vec::new(),
    };
    while range.offset < length {
        let data = match seek(input, SeekFrom::Data(range.offset)) {
            Ok(data) => data.min(length),
            Err(Errno::NXIO) => length,
            Err(_) => range.offset,
        };
        let end = match seek(input, SeekFrom::Hole(data)) {
            Ok(end) if end > data => end.min(length),
            _ => length,
        };
        copied(data - range.offset)?;
        range.offset = data;
        while range.offset < end {
            let wanted = usize::try_from(end - range.offset).map_or(CHUNK, |left| left.min(CHUNK));
            let moved = range.advance(input, output, wanted)?;
            if moved == 0 {
                return ftruncate(output, range.offset).map_err(io::Error::from);
            }
            copied(moved as u64)?;
        }
    }
    ftruncate(output, length)?;
    Ok(())
}

/// Carries a file's or folder's own extended attributes over, such as where
/// a download came from. Attributes the destination can't hold are left out.
pub fn attributes(input: impl AsFd, output: impl AsFd) -> io::Result<()> {
    let (input, output) = (input.as_fd(), output.as_fd());
    let mut names = Vec::new();
    match flistxattr(input, &mut [0_u8; 0][..]) {
        Ok(0) | Err(Errno::NOTSUP) => return Ok(()),
        Ok(size) => names.reserve(size),
        Err(error) => return Err(error.into()),
    }
    flistxattr(input, rustix::buffer::spare_capacity(&mut names))?;
    let mut value = Vec::new();
    for name in names
        .split_inclusive(|byte| *byte == 0)
        .filter(|name| name.starts_with(OWN_ATTRIBUTES))
        .filter_map(|name| CStr::from_bytes_with_nul(name).ok())
    {
        value.clear();
        let Ok(size) = fgetxattr(input, name, &mut [0_u8; 0][..]) else {
            continue;
        };
        value.reserve(size);
        if fgetxattr(input, name, rustix::buffer::spare_capacity(&mut value)).is_err() {
            continue;
        }
        match fsetxattr(output, name, &value, XattrFlags::empty()) {
            Ok(()) | Err(Errno::NOTSUP | Errno::PERM | Errno::NOSPC | Errno::DQUOT) => {}
            Err(error) => return Err(error.into()),
        }
    }
    Ok(())
}

struct Range {
    offset: u64,
    in_kernel: bool,
    buffer: Vec<u8>,
}

impl Range {
    fn advance(
        &mut self,
        input: impl AsFd + Copy,
        output: impl AsFd + Copy,
        wanted: usize,
    ) -> io::Result<usize> {
        if self.in_kernel {
            let (mut from, mut to) = (self.offset, self.offset);
            match copy_file_range(input, Some(&mut from), output, Some(&mut to), wanted) {
                Ok(moved) => {
                    self.offset += moved as u64;
                    return Ok(moved);
                }
                Err(Errno::XDEV | Errno::INVAL | Errno::NOSYS | Errno::OPNOTSUPP) => {
                    self.in_kernel = false;
                }
                Err(error) => return Err(error.into()),
            }
        }
        self.buffer.resize(BUFFER, 0);
        let limit = wanted.min(self.buffer.len());
        let read = pread(input, &mut self.buffer[..limit], self.offset)?;
        let mut written = 0;
        while written < read {
            written += pwrite(
                output,
                &self.buffer[written..read],
                self.offset + written as u64,
            )?;
        }
        self.offset += read as u64;
        Ok(read)
    }
}

#[cfg(test)]
mod tests {
    use std::fs::File;
    use std::io::{Read, Seek, Write};
    use std::os::unix::fs::MetadataExt;

    use super::*;

    #[test]
    fn keeps_holes_and_reports_every_byte() {
        let folder = tempfile::tempdir().unwrap();
        let mut source = File::create_new(folder.path().join("sparse")).unwrap();
        let length = 64 * 1024 * 1024 + 5;
        source.write_all(b"start").unwrap();
        source.seek(io::SeekFrom::Start(length - 3)).unwrap();
        source.write_all(b"end").unwrap();
        let source = File::open(folder.path().join("sparse")).unwrap();
        let copy_path = folder.path().join("copy");
        let copy = File::create_new(&copy_path).unwrap();

        let mut reported = 0;
        contents(&source, &copy, length, |bytes| {
            reported += bytes;
            Ok(())
        })
        .unwrap();

        assert_eq!(reported, length);
        let metadata = std::fs::metadata(&copy_path).unwrap();
        assert_eq!(metadata.len(), length);
        assert!(metadata.blocks() * 512 < length / 2);
        let mut written = Vec::new();
        File::open(&copy_path)
            .unwrap()
            .read_to_end(&mut written)
            .unwrap();
        assert!(written.starts_with(b"start") && written.ends_with(b"end"));
    }

    #[test]
    fn stops_when_told_to() {
        let folder = tempfile::tempdir().unwrap();
        std::fs::write(folder.path().join("file"), vec![7_u8; 3 * CHUNK]).unwrap();
        let source = File::open(folder.path().join("file")).unwrap();
        let copy = File::create_new(folder.path().join("copy")).unwrap();

        let stopped = contents(&source, &copy, 3 * CHUNK as u64, |_| {
            Err(io::Error::other("stop"))
        });

        assert!(stopped.is_err());
    }
}
