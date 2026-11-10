use std::fs::{self, File};
use std::io::{BufReader, Read};
use std::path::Path;

use luft_i18n::t;
use luft_unpack::{Error, Rules, unpack_tar, unpack_zip};

use crate::L10N;

const RULES: Rules = Rules {
    max_bytes: 512 * 1024 * 1024,
    max_entries: 50_000,
    outward_links: false,
    keep_metadata: false,
};
const TAR_SUFFIXES: [(&str, Codec); 8] = [
    (".tar", Codec::Plain),
    (".tar.gz", Codec::Gzip),
    (".tgz", Codec::Gzip),
    (".tar.bz2", Codec::Bzip2),
    (".tbz2", Codec::Bzip2),
    (".tbz", Codec::Bzip2),
    (".tar.xz", Codec::Xz),
    (".txz", Codec::Xz),
];

#[derive(Clone, Copy)]
pub enum Codec {
    Plain,
    Gzip,
    Bzip2,
    Xz,
}

#[derive(Clone, Copy)]
pub enum Format {
    Zip,
    Tar(Codec),
}

impl Format {
    pub fn of(name: &str) -> Option<Format> {
        let name = name.to_ascii_lowercase();
        if name.ends_with(".zip") {
            return Some(Format::Zip);
        }
        TAR_SUFFIXES
            .iter()
            .find(|(suffix, _)| name.ends_with(suffix))
            .map(|(_, codec)| Format::Tar(*codec))
    }
}

fn decoder<'a>(codec: Codec, reader: impl Read + 'a) -> Box<dyn Read + 'a> {
    match codec {
        Codec::Plain => Box::new(reader),
        Codec::Gzip => Box::new(flate2::read::MultiGzDecoder::new(reader)),
        Codec::Bzip2 => Box::new(bzip2::read::MultiBzDecoder::new(reader)),
        Codec::Xz => Box::new(liblzma::read::XzDecoder::new_multi_decoder(reader)),
    }
}

fn explained(error: Error) -> String {
    match error {
        Error::TooLarge => t!(L10N, "desktop-cursors-unpacks-too-large"),
        Error::Damaged(_) => t!(L10N, "desktop-cursors-archive-damaged"),
        Error::Io(error) => error.to_string(),
    }
}

pub fn unpack(format: Format, archive: &Path, into: &Path) -> Result<(), String> {
    fs::create_dir_all(into).map_err(|error| error.to_string())?;
    let archive = BufReader::new(File::open(archive).map_err(|error| error.to_string())?);
    match format {
        Format::Zip => unpack_zip(archive, into, RULES, |_| {}),
        Format::Tar(codec) => unpack_tar(decoder(codec, archive), into, RULES, |_| {}),
    }
    .map_err(explained)
}
