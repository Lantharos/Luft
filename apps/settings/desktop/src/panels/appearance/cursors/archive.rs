use std::fs::{self, File};
use std::io::{self, BufReader, Read};
use std::os::unix::fs::symlink;
use std::path::{Component, Path, PathBuf};

const MAX_EXTRACTED_BYTES: u64 = 512 * 1024 * 1024;
const MAX_ENTRIES: u32 = 50_000;
const MAX_LINK_LENGTH: u64 = 4096;
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
const TOO_LARGE: &str = "This download unpacks to more than a cursor theme should need";
const DAMAGED: &str = "This download is damaged or isn't an archive Settings can open";

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

fn damaged(_: impl std::fmt::Display) -> String {
    DAMAGED.into()
}

fn relative(path: &Path) -> Option<PathBuf> {
    let mut clean = PathBuf::new();
    for component in path.components() {
        match component {
            Component::Normal(part) => clean.push(part),
            Component::CurDir => {}
            _ => return None,
        }
    }
    (!clean.as_os_str().is_empty()).then_some(clean)
}

fn descending(target: &Path) -> bool {
    target
        .components()
        .all(|component| matches!(component, Component::Normal(_) | Component::CurDir))
}

struct Unpacker<'a> {
    root: &'a Path,
    written: u64,
    entries: u32,
}

impl Unpacker<'_> {
    fn count(&mut self) -> Result<(), String> {
        self.entries += 1;
        (self.entries <= MAX_ENTRIES)
            .then_some(())
            .ok_or_else(|| TOO_LARGE.into())
    }

    fn directory(&self, relative: &Path) -> Result<PathBuf, String> {
        let mut path = self.root.to_path_buf();
        for part in relative.components() {
            path.push(part);
            match fs::symlink_metadata(&path) {
                Ok(metadata) if metadata.is_dir() => {}
                Ok(_) => return Err(DAMAGED.into()),
                Err(error) if error.kind() == io::ErrorKind::NotFound => {
                    fs::create_dir(&path).map_err(|error| error.to_string())?
                }
                Err(error) => return Err(error.to_string()),
            }
        }
        Ok(path)
    }

    fn slot(&self, relative: &Path) -> Result<PathBuf, String> {
        let parent = self.directory(relative.parent().unwrap_or(Path::new("")))?;
        let path = parent.join(relative.file_name().ok_or(DAMAGED)?);
        if fs::symlink_metadata(&path).is_ok_and(|metadata| !metadata.is_dir()) {
            fs::remove_file(&path).map_err(|error| error.to_string())?;
        }
        Ok(path)
    }

    fn file(&mut self, relative: &Path, contents: &mut impl Read) -> Result<(), String> {
        let path = self.slot(relative)?;
        let budget = MAX_EXTRACTED_BYTES - self.written;
        let copied = io::copy(
            &mut contents.take(budget + 1),
            &mut File::create(path).map_err(|error| error.to_string())?,
        )
        .map_err(damaged)?;
        self.written += copied;
        (copied <= budget)
            .then_some(())
            .ok_or_else(|| TOO_LARGE.into())
    }

    fn link(&self, relative: &Path, target: &Path) -> Result<(), String> {
        if descending(target) {
            symlink(target, self.slot(relative)?).map_err(|error| error.to_string())?;
        }
        Ok(())
    }

    fn copy(&mut self, relative: &Path, source: &Path) -> Result<(), String> {
        let Some(source) = self::relative(source).map(|source| self.root.join(source)) else {
            return Ok(());
        };
        if fs::symlink_metadata(&source).is_ok_and(|metadata| metadata.is_file()) {
            self.file(
                relative,
                &mut File::open(source).map_err(|error| error.to_string())?,
            )?;
        }
        Ok(())
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

fn unpack_tar(codec: Codec, archive: File, unpacker: &mut Unpacker) -> Result<(), String> {
    let mut tar = tar::Archive::new(decoder(codec, BufReader::new(archive)));
    for entry in tar.entries().map_err(damaged)? {
        let mut entry = entry.map_err(damaged)?;
        unpacker.count()?;
        let Some(path) = relative(&entry.path().map_err(damaged)?) else {
            continue;
        };
        let kind = entry.header().entry_type();
        if kind.is_dir() {
            unpacker.directory(&path)?;
        } else if kind.is_file() {
            unpacker.file(&path, &mut entry)?;
        } else if kind.is_symlink() || kind.is_hard_link() {
            let Some(target) = entry.link_name().map_err(damaged)? else {
                continue;
            };
            if kind.is_symlink() {
                unpacker.link(&path, &target)?;
            } else {
                unpacker.copy(&path, &target)?;
            }
        }
    }
    Ok(())
}

fn unpack_zip(archive: File, unpacker: &mut Unpacker) -> Result<(), String> {
    let mut zip = zip::ZipArchive::new(BufReader::new(archive)).map_err(damaged)?;
    for index in 0..zip.len() {
        let mut entry = zip.by_index(index).map_err(damaged)?;
        unpacker.count()?;
        let Some(path) = entry.enclosed_name().as_deref().and_then(relative) else {
            continue;
        };
        if entry.is_dir() {
            unpacker.directory(&path)?;
        } else if entry.is_symlink() {
            let mut target = String::new();
            (&mut entry)
                .take(MAX_LINK_LENGTH)
                .read_to_string(&mut target)
                .map_err(damaged)?;
            unpacker.link(&path, Path::new(&target))?;
        } else {
            unpacker.file(&path, &mut entry)?;
        }
    }
    Ok(())
}

pub fn unpack(format: Format, archive: &Path, into: &Path) -> Result<(), String> {
    fs::create_dir_all(into).map_err(|error| error.to_string())?;
    let file = File::open(archive).map_err(|error| error.to_string())?;
    let mut unpacker = Unpacker {
        root: into,
        written: 0,
        entries: 0,
    };
    match format {
        Format::Zip => unpack_zip(file, &mut unpacker),
        Format::Tar(codec) => unpack_tar(codec, file, &mut unpacker),
    }
}
