use std::fs::{self, File};
use std::io::{self, BufReader, BufWriter, Write};
use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};

use chrono::{DateTime, Local};
use serde::Deserialize;
use zip::CompressionMethod;
use zip::write::{SimpleFileOptions, ZipWriter};

use super::progress::{Counted, Progress};

const ZSTD_LEVEL: i32 = 3;
const READ_BUFFER: usize = 256 * 1024;

#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ArchiveFormat {
    Zip,
    TarZst,
}

impl ArchiveFormat {
    pub fn extension(self) -> &'static str {
        match self {
            Self::Zip => "zip",
            Self::TarZst => "tar.zst",
        }
    }
}

pub(super) fn write(
    format: ArchiveFormat,
    sources: &[PathBuf],
    output: File,
    progress: &Progress,
) -> io::Result<()> {
    let writer = BufWriter::new(output);
    match format {
        ArchiveFormat::Zip => write_zip(sources, writer, progress),
        ArchiveFormat::TarZst => write_tar_zst(sources, writer, progress),
    }
}

fn write_zip(sources: &[PathBuf], writer: BufWriter<File>, progress: &Progress) -> io::Result<()> {
    let mut zip = ZipWriter::new(writer);
    for entry in entries(sources) {
        let (path, name, metadata) = entry?;
        progress.guard()?;
        let mut options = SimpleFileOptions::default()
            .compression_method(CompressionMethod::Deflated)
            .unix_permissions(metadata.permissions().mode() & 0o7777);
        if let Some(modified) = modified(&metadata) {
            options = options.last_modified_time(modified);
        }
        if metadata.is_dir() {
            zip.add_directory(format!("{name}/"), options)?;
        } else if metadata.is_symlink() {
            let target = fs::read_link(&path)?;
            zip.add_symlink(name, target.to_string_lossy(), options)?;
        } else {
            zip.start_file(name, options.large_file(metadata.len() >= u32::MAX as u64))?;
            copy_file(&path, &mut zip, progress)?;
        }
        progress.item(&path);
    }
    zip.finish()?.flush()
}

fn write_tar_zst(
    sources: &[PathBuf],
    writer: BufWriter<File>,
    progress: &Progress,
) -> io::Result<()> {
    let mut encoder = zstd::Encoder::new(writer, ZSTD_LEVEL)?;
    let threads = std::thread::available_parallelism().map_or(1, usize::from) as u32;
    encoder.multithread(threads)?;
    let mut builder = tar::Builder::new(encoder);
    builder.follow_symlinks(false);
    for entry in entries(sources) {
        let (path, name, metadata) = entry?;
        progress.guard()?;
        if metadata.is_file() {
            let mut header = tar::Header::new_gnu();
            header.set_metadata(&metadata);
            let reader =
                BufReader::with_capacity(READ_BUFFER, Counted::new(File::open(&path)?, progress));
            builder.append_data(&mut header, &name, reader)?;
        } else {
            builder.append_path_with_name(&path, &name)?;
        }
        progress.item(&path);
    }
    builder.into_inner()?.finish()?.flush()
}

type Entry = (PathBuf, String, fs::Metadata);

fn entries(sources: &[PathBuf]) -> impl Iterator<Item = io::Result<Entry>> + '_ {
    sources.iter().flat_map(|source| {
        let base = source.parent().unwrap_or(Path::new("/")).to_path_buf();
        walkdir::WalkDir::new(source)
            .follow_links(false)
            .sort_by_file_name()
            .into_iter()
            .map(move |entry| {
                let entry = entry.map_err(io::Error::from)?;
                let name = entry
                    .path()
                    .strip_prefix(&base)
                    .map_err(io::Error::other)?
                    .to_string_lossy()
                    .into_owned();
                let metadata = entry.metadata().map_err(io::Error::from)?;
                Ok((entry.into_path(), name, metadata))
            })
    })
}

fn copy_file(path: &Path, writer: &mut impl Write, progress: &Progress) -> io::Result<()> {
    let mut reader =
        BufReader::with_capacity(READ_BUFFER, Counted::new(File::open(path)?, progress));
    io::copy(&mut reader, writer).map(drop)
}

fn modified(metadata: &fs::Metadata) -> Option<zip::DateTime> {
    let modified: DateTime<Local> = metadata.modified().ok()?.into();
    zip::DateTime::try_from(modified.naive_local()).ok()
}
