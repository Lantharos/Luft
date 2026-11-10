use std::fs::File;
use std::io::{self, BufReader, BufWriter, Read};
use std::path::Path;

use luft_unpack::{Rules, unpack_tar, unpack_zip};

use super::progress::{Counted, Progress};

const READ_BUFFER: usize = 256 * 1024;
const UNBOUNDED: Rules = Rules {
    max_bytes: u64::MAX,
    max_entries: u32::MAX,
    outward_links: true,
    keep_metadata: true,
};
const TAR_SUFFIXES: [(&str, Codec); 11] = [
    (".tar", Codec::Plain),
    (".gtar", Codec::Plain),
    (".tar.gz", Codec::Gzip),
    (".tgz", Codec::Gzip),
    (".tar.bz2", Codec::Bzip2),
    (".tbz2", Codec::Bzip2),
    (".tb2", Codec::Bzip2),
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
const ZIP_SUFFIXES: [&str; 6] = [".zip", ".zipx", ".jar", ".cbz", ".epub", ".apk"];

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
    let unpacked = |path: &Path| progress.item(&staging.join(path));
    match format {
        Format::Zip => unpack_zip(reader, staging, UNBOUNDED, unpacked).map_err(io::Error::from),
        Format::SevenZip => sevenz_rust2::decompress_with_extract_fn(
            reader,
            staging,
            sevenz_rust2::default_entry_extract_fn,
        )
        .map_err(io::Error::other),
        Format::Tar(codec) => unpack_tar(decoder(codec, reader)?, staging, UNBOUNDED, unpacked)
            .map_err(io::Error::from),
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
