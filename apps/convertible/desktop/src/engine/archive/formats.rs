use std::fs::File;
use std::io::{self, BufReader, BufWriter, Read, Seek, Write};
use std::path::Path;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use bzip2::read::BzDecoder;
use bzip2::write::BzEncoder;
use flate2::Compression;
use flate2::read::GzDecoder;
use flate2::write::GzEncoder;
use liblzma::read::XzDecoder;
use liblzma::write::XzEncoder;
use sevenz_rust2::{ArchiveEntry, ArchiveReader, ArchiveWriter, Password};
use tar::{Archive, Builder, EntryType, Header};
use zip::write::SimpleFileOptions;
use zip::{CompressionMethod, ZipArchive, ZipWriter};

use super::entries::{Entry, Sink, Visit, safe_path};
use crate::engine::error::{Failure, Result};
use crate::l10n::L10N;
use luft_i18n::t;

fn tar_reader(path: &Path, id: &str) -> Result<Box<dyn Read>> {
    let file = BufReader::new(File::open(path)?);
    Ok(match id {
        "tar.gz" => Box::new(GzDecoder::new(file)),
        "tar.xz" => Box::new(XzDecoder::new(file)),
        "tar.zst" => Box::new(zstd::Decoder::new(file)?),
        "tar.bz2" => Box::new(BzDecoder::new(file)),
        _ => Box::new(file),
    })
}

fn visit_tar(path: &Path, id: &str, visit: &mut Visit<'_>) -> Result<()> {
    let mut archive = Archive::new(tar_reader(path, id)?);
    for item in archive.entries()? {
        let mut item = item?;
        let kind = item.header().entry_type();
        if !matches!(
            kind,
            EntryType::Regular | EntryType::Directory | EntryType::Continuous
        ) {
            continue;
        }
        let name = item.path()?.to_string_lossy().into_owned();
        let Some(safe) = safe_path(&name) else {
            continue;
        };
        let entry = Entry {
            path: safe,
            directory: kind == EntryType::Directory,
            mode: item.header().mode().unwrap_or(0o644),
            modified: item
                .header()
                .mtime()
                .ok()
                .map(|time| UNIX_EPOCH + Duration::from_secs(time)),
            size: item.header().size().unwrap_or(0),
        };
        visit(&entry, &mut item)?;
    }
    Ok(())
}

fn zip_time(value: Option<zip::DateTime>) -> Option<SystemTime> {
    let value = value?;
    let month = time::Month::try_from(value.month()).ok()?;
    let date = time::Date::from_calendar_date(i32::from(value.year()), month, value.day()).ok()?;
    let clock = time::Time::from_hms(value.hour(), value.minute(), value.second()).ok()?;
    Some(
        time::PrimitiveDateTime::new(date, clock)
            .assume_utc()
            .into(),
    )
}

fn visit_zip(path: &Path, visit: &mut Visit<'_>) -> Result<()> {
    let mut archive =
        ZipArchive::new(BufReader::new(File::open(path)?)).map_err(Failure::damaged)?;
    for index in 0..archive.len() {
        let mut item = archive.by_index(index).map_err(|error| match error {
            zip::result::ZipError::UnsupportedArchive(detail) if detail.contains("Password") => {
                Failure::new(t!(L10N, "failure-password"))
            }
            other => Failure::damaged(other),
        })?;
        let Some(safe) = item
            .enclosed_name()
            .and_then(|name| safe_path(&name.to_string_lossy()))
        else {
            continue;
        };
        if item.is_symlink() {
            continue;
        }
        let entry = Entry {
            path: safe,
            directory: item.is_dir(),
            mode: item.unix_mode().unwrap_or(0o644),
            modified: zip_time(item.last_modified()),
            size: item.size(),
        };
        visit(&entry, &mut item)?;
    }
    Ok(())
}

fn visit_seven(path: &Path, visit: &mut Visit<'_>) -> Result<()> {
    let mut archive = ArchiveReader::open(path, Password::empty()).map_err(seven_failure)?;
    archive
        .for_each_entries(|item, reader| {
            let Some(safe) = safe_path(item.name()) else {
                return Ok(true);
            };
            let entry = Entry {
                path: safe,
                directory: item.is_directory(),
                mode: 0o644,
                modified: item
                    .has_last_modified_date
                    .then(|| item.last_modified_date.into()),
                size: item.size(),
            };
            visit(&entry, reader)
                .map_err(|failure| sevenz_rust2::Error::Other(failure.0.into()))?;
            Ok(true)
        })
        .map_err(seven_failure)
}

fn seven_failure(error: sevenz_rust2::Error) -> Failure {
    match error {
        sevenz_rust2::Error::PasswordRequired | sevenz_rust2::Error::MaybeBadPassword(_) => {
            Failure::new(t!(L10N, "failure-password"))
        }
        sevenz_rust2::Error::UnsupportedCompressionMethod(method) if method.contains("AES") => {
            Failure::new(t!(L10N, "failure-password"))
        }
        other => Failure::damaged(other),
    }
}

pub fn visit_archive(path: &Path, id: &str, visit: &mut Visit<'_>) -> Result<()> {
    match id {
        "zip" => visit_zip(path, visit),
        "7z" => visit_seven(path, visit),
        _ => visit_tar(path, id, visit),
    }
}

struct TarSink<W: Write> {
    builder: Builder<W>,
    close: fn(W) -> io::Result<()>,
}

impl<W: Write> Sink for TarSink<W> {
    fn add(&mut self, entry: &Entry, content: &mut dyn Read) -> Result<()> {
        let mut header = Header::new_gnu();
        header.set_size(entry.size);
        header.set_mode(entry.mode & 0o7777);
        let seconds = entry
            .modified
            .and_then(|time| time.duration_since(UNIX_EPOCH).ok());
        header.set_mtime(seconds.map_or(0, |time| time.as_secs()));
        header.set_entry_type(if entry.directory {
            EntryType::Directory
        } else {
            EntryType::Regular
        });
        header.set_cksum();
        self.builder
            .append_data(&mut header, &entry.path, content)?;
        Ok(())
    }

    fn finish(self: Box<Self>) -> Result<()> {
        let inner = self.builder.into_inner()?;
        (self.close)(inner)?;
        Ok(())
    }
}

fn tar_sink<W: Write + 'static>(writer: W, close: fn(W) -> io::Result<()>) -> Box<dyn Sink> {
    let mut builder = Builder::new(writer);
    builder.mode(tar::HeaderMode::Complete);
    Box::new(TarSink { builder, close })
}

struct ZipSink<W: Write + Seek> {
    writer: ZipWriter<W>,
    level: i64,
}

impl<W: Write + Seek> Sink for ZipSink<W> {
    fn add(&mut self, entry: &Entry, content: &mut dyn Read) -> Result<()> {
        let name = entry.path.to_string_lossy();
        let mut options = SimpleFileOptions::default()
            .compression_method(CompressionMethod::Deflated)
            .compression_level(Some(self.level))
            .unix_permissions(entry.mode & 0o777)
            .large_file(entry.size >= u64::from(u32::MAX));
        if let Some(time) = entry.modified.and_then(zip_stamp) {
            options = options.last_modified_time(time);
        }
        if entry.directory {
            self.writer
                .add_directory(name, options)
                .map_err(Failure::damaged)?;
            return Ok(());
        }
        self.writer
            .start_file(name, options)
            .map_err(Failure::damaged)?;
        io::copy(content, &mut self.writer)?;
        Ok(())
    }

    fn finish(self: Box<Self>) -> Result<()> {
        self.writer.finish().map_err(Failure::damaged)?;
        Ok(())
    }
}

fn zip_stamp(time: SystemTime) -> Option<zip::DateTime> {
    let moment = time::OffsetDateTime::from(time);
    let year = u16::try_from(moment.year()).ok()?;
    zip::DateTime::from_date_and_time(
        year,
        moment.month().into(),
        moment.day(),
        moment.hour(),
        moment.minute(),
        moment.second(),
    )
    .ok()
}

struct SevenSink {
    writer: ArchiveWriter<File>,
}

impl Sink for SevenSink {
    fn add(&mut self, entry: &Entry, content: &mut dyn Read) -> Result<()> {
        let name = entry.path.to_string_lossy().into_owned();
        let mut item = if entry.directory {
            ArchiveEntry::new_directory(&name)
        } else {
            ArchiveEntry::new_file(&name)
        };
        if let Some(modified) = entry.modified.and_then(|time| time.try_into().ok()) {
            item.has_last_modified_date = true;
            item.last_modified_date = modified;
        }
        let source = (!entry.directory).then_some(content);
        self.writer
            .push_archive_entry(item, source)
            .map_err(Failure::damaged)?;
        Ok(())
    }

    fn finish(self: Box<Self>) -> Result<()> {
        self.writer.finish()?;
        Ok(())
    }
}

pub fn archive_sink(path: &Path, id: &str, level: u8) -> Result<Box<dyn Sink>> {
    let level = u32::from(level.clamp(1, 9));
    let file = BufWriter::new(File::create(path)?);
    Ok(match id {
        "zip" => Box::new(ZipSink {
            writer: ZipWriter::new(file),
            level: i64::from(level),
        }),
        "7z" => Box::new(SevenSink {
            writer: ArchiveWriter::create(path).map_err(Failure::damaged)?,
        }),
        "tar.gz" => tar_sink(GzEncoder::new(file, Compression::new(level)), |writer| {
            writer.finish()?.flush()
        }),
        "tar.xz" => tar_sink(XzEncoder::new(file, level), |writer| {
            writer.finish()?.flush()
        }),
        "tar.zst" => tar_sink(zstd::Encoder::new(file, level as i32)?, |writer| {
            writer.finish()?.flush()
        }),
        "tar.bz2" => tar_sink(
            BzEncoder::new(file, bzip2::Compression::new(level)),
            |writer| writer.finish()?.flush(),
        ),
        _ => tar_sink(file, |mut writer| writer.flush()),
    })
}
