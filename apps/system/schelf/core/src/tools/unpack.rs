use std::fs::{self, File};
use std::io::{self, BufReader, Read, Seek};
use std::path::Path;

const ONE_PROGRAM: &str = "The download holds more than one program, so it wasn't installed.";
const NO_PROGRAM: &str = "The download holds no program, so it wasn't installed.";

/// Puts the one program in `download`, a file of `kind` as the index names
/// it, at `program`.
pub fn program(download: &Path, kind: &str, program: &Path) -> Result<(), String> {
    match kind {
        "binary" => fs::copy(download, program)
            .map(|_| ())
            .map_err(|error| error.to_string()),
        "tarball" => from_tarball(download, program),
        "zip" => from_zip(download, program),
        kind => Err(format!(
            "Schelf can't install a tool that comes as a {kind} here."
        )),
    }
}

fn decompressed(download: &Path) -> io::Result<Box<dyn Read>> {
    let mut file = File::open(download)?;
    let mut magic = [0u8; 6];
    let read = file.read(&mut magic)?;
    file.rewind()?;
    let file = BufReader::new(file);
    Ok(match &magic[..read] {
        [0x1f, 0x8b, ..] => Box::new(flate2::read::GzDecoder::new(file)),
        [0xfd, b'7', b'z', b'X', b'Z', 0x00] => Box::new(liblzma::read::XzDecoder::new(file)),
        [0x28, 0xb5, 0x2f, 0xfd, ..] => Box::new(zstd::Decoder::with_buffer(file)?),
        [b'B', b'Z', b'h', ..] => Box::new(bzip2::read::BzDecoder::new(file)),
        _ => Box::new(file),
    })
}

fn from_tarball(download: &Path, program: &Path) -> Result<(), String> {
    let failed = |error: io::Error| error.to_string();
    let mut archive = tar::Archive::new(decompressed(download).map_err(failed)?);
    let mut found = false;
    for entry in archive.entries().map_err(failed)? {
        let mut entry = entry.map_err(failed)?;
        match entry.header().entry_type() {
            tar::EntryType::Directory => continue,
            tar::EntryType::Regular if !found => {
                io::copy(&mut entry, &mut File::create(program).map_err(failed)?)
                    .map_err(failed)?;
                found = true;
            }
            _ => {
                let _ = fs::remove_file(program);
                return Err(ONE_PROGRAM.into());
            }
        }
    }
    found.then_some(()).ok_or_else(|| NO_PROGRAM.into())
}

fn from_zip(download: &Path, program: &Path) -> Result<(), String> {
    let failed = |error: zip::result::ZipError| error.to_string();
    let mut archive =
        zip::ZipArchive::new(File::open(download).map_err(|error| error.to_string())?)
            .map_err(failed)?;
    let files: Vec<usize> = (0..archive.len())
        .filter(|index| archive.by_index(*index).is_ok_and(|entry| !entry.is_dir()))
        .collect();
    let [only] = files[..] else {
        return Err(if files.is_empty() {
            NO_PROGRAM
        } else {
            ONE_PROGRAM
        }
        .into());
    };
    let mut entry = archive.by_index(only).map_err(failed)?;
    if !entry.is_file() {
        return Err(ONE_PROGRAM.into());
    }
    let mut output = File::create(program).map_err(|error| error.to_string())?;
    io::copy(&mut entry, &mut output)
        .map(|_| ())
        .map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tarball(files: &[(&str, &[u8])]) -> Vec<u8> {
        let mut builder = tar::Builder::new(Vec::new());
        for (name, contents) in files {
            let mut header = tar::Header::new_gnu();
            header.set_size(contents.len() as u64);
            header.set_mode(0o755);
            builder.append_data(&mut header, name, *contents).unwrap();
        }
        let mut gzip = flate2::write::GzEncoder::new(Vec::new(), flate2::Compression::fast());
        io::Write::write_all(&mut gzip, &builder.into_inner().unwrap()).unwrap();
        gzip.finish().unwrap()
    }

    #[test]
    fn a_tarball_gives_up_its_one_program() {
        let folder = tempfile::tempdir().unwrap();
        let download = folder.path().join("notes.tar.gz");
        fs::write(&download, tarball(&[("notes-1.2/notes", b"#!/bin/sh\n")])).unwrap();
        let installed = folder.path().join("notes");
        program(&download, "tarball", &installed).unwrap();
        assert_eq!(fs::read(installed).unwrap(), b"#!/bin/sh\n");
    }

    #[test]
    fn a_tarball_with_more_than_the_program_is_refused() {
        let folder = tempfile::tempdir().unwrap();
        let download = folder.path().join("notes.tar.gz");
        fs::write(&download, tarball(&[("notes", b"1"), ("README", b"2")])).unwrap();
        let installed = folder.path().join("notes");
        assert_eq!(
            program(&download, "tarball", &installed),
            Err(ONE_PROGRAM.into())
        );
        assert!(!installed.exists());
    }
}
