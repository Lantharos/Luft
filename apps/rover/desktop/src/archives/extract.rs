use std::fs::{self, File};
use std::io::{self, BufReader, BufWriter, Read};
use std::os::unix::fs::{PermissionsExt, symlink};
use std::path::Path;

use super::progress::{Counted, Progress};

const READ_BUFFER: usize = 256 * 1024;
const TAR_SUFFIXES: [(&str, Codec); 9] = [
    (".tar", Codec::Plain),
    (".tar.gz", Codec::Gzip),
    (".tgz", Codec::Gzip),
    (".tar.bz2", Codec::Bzip2),
    (".tbz2", Codec::Bzip2),
    (".tar.xz", Codec::Xz),
    (".txz", Codec::Xz),
    (".tar.zst", Codec::Zstd),
    (".tzst", Codec::Zstd),
];
const STREAM_SUFFIXES: [(&str, Codec); 4] = [
    (".gz", Codec::Gzip),
    (".bz2", Codec::Bzip2),
    (".xz", Codec::Xz),
    (".zst", Codec::Zstd),
];
const ZIP_SUFFIXES: [&str; 5] = [".zip", ".jar", ".cbz", ".epub", ".apk"];

#[derive(Clone, Copy)]
pub(super) enum Codec {
    Plain,
    Gzip,
    Bzip2,
    Xz,
    Zstd,
}

#[derive(Clone, Copy)]
pub(super) enum Format {
    Zip,
    SevenZip,
    Tar(Codec),
    Stream(Codec),
}

pub(super) fn detect(path: &Path) -> Option<(Format, String)> {
    let name = path.file_name()?.to_string_lossy().into_owned();
    let lowered = name.to_lowercase();
    let strip = |suffix: &str| name[..name.len() - suffix.len()].to_string();
    if let Some(suffix) = ZIP_SUFFIXES
        .iter()
        .find(|suffix| lowered.ends_with(*suffix))
    {
        return Some((Format::Zip, strip(suffix)));
    }
    if lowered.ends_with(".7z") {
        return Some((Format::SevenZip, strip(".7z")));
    }
    if let Some((suffix, codec)) = TAR_SUFFIXES
        .iter()
        .find(|(suffix, _)| lowered.ends_with(suffix))
    {
        return Some((Format::Tar(*codec), strip(suffix)));
    }
    STREAM_SUFFIXES
        .iter()
        .find(|(suffix, _)| lowered.ends_with(suffix))
        .map(|(suffix, codec)| (Format::Stream(*codec), strip(suffix)))
}

pub(super) fn unpack(
    format: Format,
    archive: &Path,
    stem: &str,
    staging: &Path,
    progress: &Progress,
) -> io::Result<()> {
    let reader =
        BufReader::with_capacity(READ_BUFFER, Counted::new(File::open(archive)?, progress));
    match format {
        Format::Zip => unpack_zip(reader, staging, progress),
        Format::SevenZip => sevenz_rust2::decompress_with_extract_fn(
            reader,
            staging,
            sevenz_rust2::default_entry_extract_fn,
        )
        .map_err(io::Error::other),
        Format::Tar(codec) => {
            let mut tar = tar::Archive::new(decoder(codec, reader)?);
            tar.set_preserve_permissions(true);
            tar.set_preserve_mtime(true);
            tar.set_overwrite(false);
            tar.unpack(staging)
        }
        Format::Stream(codec) => {
            let mut output = BufWriter::new(File::create_new(staging.join(stem))?);
            io::copy(&mut decoder(codec, reader)?, &mut output).map(drop)
        }
    }
}

fn decoder<'a>(codec: Codec, reader: impl Read + 'a) -> io::Result<Box<dyn Read + 'a>> {
    Ok(match codec {
        Codec::Plain => Box::new(reader),
        Codec::Gzip => Box::new(flate2::read::MultiGzDecoder::new(reader)),
        Codec::Bzip2 => Box::new(bzip2::read::MultiBzDecoder::new(reader)),
        Codec::Xz => Box::new(liblzma::read::XzDecoder::new_multi_decoder(reader)),
        Codec::Zstd => Box::new(zstd::Decoder::new(reader)?),
    })
}

fn unpack_zip(reader: impl Read + io::Seek, staging: &Path, progress: &Progress) -> io::Result<()> {
    let mut archive = zip::ZipArchive::new(reader).map_err(io::Error::other)?;
    for index in 0..archive.len() {
        let mut entry = archive.by_index(index).map_err(io::Error::other)?;
        let Some(relative) = entry.enclosed_name() else {
            continue;
        };
        let target = staging.join(relative);
        if entry.is_dir() {
            fs::create_dir_all(&target)?;
            continue;
        }
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent)?;
        }
        if entry.is_symlink() {
            let mut link = String::new();
            entry.read_to_string(&mut link)?;
            symlink(link, &target)?;
        } else {
            let mut output = BufWriter::new(File::create_new(&target)?);
            io::copy(&mut entry, &mut output)?;
            if let Some(mode) = entry.unix_mode() {
                output
                    .get_ref()
                    .set_permissions(fs::Permissions::from_mode(mode & 0o7777))?;
            }
        }
        progress.item(&target);
    }
    Ok(())
}
