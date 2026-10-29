use std::collections::HashMap;
use std::fs::File;
use std::io::{BufReader, Read, Seek, SeekFrom, Take};
use std::path::Path;

use crate::apps::desktop::DesktopEntry;

const AR_MAGIC: &[u8; 8] = b"!<arch>\n";
const AR_HEADER: usize = 60;
const APPLICATIONS: &str = "usr/share/applications/";
const PIXMAPS: &str = "usr/share/pixmaps/";
const HICOLOR: &str = "usr/share/icons/hicolor/";
// The largest icons first, then scalable, which are the ones that look best in Schelf
const ICON_SIZES: [&str; 6] = [
    "256x256", "512x512", "128x128", "scalable", "96x96", "64x64",
];
const DAMAGED: &str = "This package file is damaged or isn't a Debian package.";

pub struct Icon {
    pub bytes: Vec<u8>,
    pub extension: String,
}

/// What a `.deb` file holds, read without installing it.
pub struct Deb {
    pub package: String,
    pub version: String,
    pub architecture: String,
    pub summary: String,
    pub description: String,
    pub homepage: Option<String>,
    pub size: u64,
    /// The name of its main app, from its menu entry, when it has one
    pub name: Option<String>,
    pub icon: Option<Icon>,
}

struct Member {
    name: String,
    size: u64,
}

fn member(reader: &mut impl Read) -> Result<Option<Member>, String> {
    let mut header = [0u8; AR_HEADER];
    match reader.read_exact(&mut header) {
        Ok(()) => {}
        Err(error) if error.kind() == std::io::ErrorKind::UnexpectedEof => return Ok(None),
        Err(error) => return Err(error.to_string()),
    }
    let field =
        |range: std::ops::Range<usize>| String::from_utf8_lossy(&header[range]).trim().to_owned();
    let size = field(48..58).parse().map_err(|_| DAMAGED.to_owned())?;
    Ok(Some(Member {
        name: field(0..16).trim_end_matches('/').to_owned(),
        size,
    }))
}

/// A tar archive inside the package, read through whichever compression it uses.
fn unpacked<'a>(
    name: &str,
    data: Take<&'a mut BufReader<File>>,
) -> Result<Box<dyn Read + 'a>, String> {
    Ok(
        match name.rsplit_once('.').map(|(_, extension)| extension) {
            Some("xz") => Box::new(liblzma::read::XzDecoder::new(data)),
            Some("zst") => {
                Box::new(zstd::stream::read::Decoder::new(data).map_err(|error| error.to_string())?)
            }
            Some("gz") => Box::new(flate2::read::GzDecoder::new(data)),
            Some("tar") => Box::new(data),
            _ => {
                return Err(format!(
                    "This package is packed in a way Schelf can't read ({name})."
                ));
            }
        },
    )
}

fn control_fields(text: &str) -> HashMap<String, String> {
    let mut fields = HashMap::new();
    let mut last: Option<String> = None;
    for line in text.lines() {
        if line.starts_with(' ') || line.starts_with('\t') {
            if let Some(field) = last.as_ref().and_then(|key| fields.get_mut(key)) {
                let continued = line.trim();
                let field: &mut String = field;
                field.push('\n');
                field.push_str(if continued == "." { "" } else { continued });
            }
        } else if let Some((key, value)) = line.split_once(':') {
            fields.insert(key.trim().to_owned(), value.trim().to_owned());
            last = Some(key.trim().to_owned());
        }
    }
    fields
}

fn entry_path(entry: &tar::Entry<impl Read>) -> String {
    entry
        .path()
        .map(|path| path.to_string_lossy().trim_start_matches("./").to_owned())
        .unwrap_or_default()
}

#[derive(Default)]
struct Contents {
    entries: Vec<(String, String)>,
    icons: HashMap<String, Icon>,
}

/// Its menu entries and every icon it ships, since which icon an entry names isn't known until it's read.
fn contents(archive: impl Read) -> Result<Contents, String> {
    let mut contents = Contents::default();
    let mut archive = tar::Archive::new(archive);
    for entry in archive.entries().map_err(|_| DAMAGED.to_owned())? {
        let mut entry = entry.map_err(|_| DAMAGED.to_owned())?;
        let path = entry_path(&entry);
        let desktop = path.starts_with(APPLICATIONS) && path.ends_with(".desktop");
        let icon =
            (path.starts_with(HICOLOR) && path.contains("/apps/")) || path.starts_with(PIXMAPS);
        if !desktop && !icon || entry.header().entry_type() != tar::EntryType::Regular {
            continue;
        }
        let mut bytes = Vec::new();
        entry
            .read_to_end(&mut bytes)
            .map_err(|_| DAMAGED.to_owned())?;
        if desktop {
            contents
                .entries
                .push((path, String::from_utf8_lossy(&bytes).into_owned()));
        } else {
            let file = Path::new(&path);
            let extension = file
                .extension()
                .map(|extension| extension.to_string_lossy().into_owned())
                .unwrap_or_default();
            if extension == "png" || extension == "svg" {
                contents
                    .icons
                    .insert(path.clone(), Icon { bytes, extension });
            }
        }
    }
    Ok(contents)
}

fn pick_icon(icons: &mut HashMap<String, Icon>, name: &str) -> Option<Icon> {
    if let Some(absolute) = name.strip_prefix('/') {
        return icons.remove(absolute);
    }
    let candidates = ICON_SIZES
        .iter()
        .flat_map(|size| {
            ["png", "svg"].map(|extension| format!("{HICOLOR}{size}/apps/{name}.{extension}"))
        })
        .chain(["png", "svg"].map(|extension| format!("{PIXMAPS}{name}.{extension}")));
    for candidate in candidates.collect::<Vec<_>>() {
        if let Some(icon) = icons.remove(&candidate) {
            return Some(icon);
        }
    }
    None
}

pub fn inspect(path: &Path) -> Result<Deb, String> {
    let mut reader = BufReader::new(File::open(path).map_err(|error| error.to_string())?);
    let mut magic = [0u8; 8];
    reader
        .read_exact(&mut magic)
        .map_err(|_| DAMAGED.to_owned())?;
    if &magic != AR_MAGIC {
        return Err(DAMAGED.into());
    }
    let mut control = None;
    let mut found = Contents::default();
    while let Some(Member { name, size }) = member(&mut reader)? {
        let start = reader
            .stream_position()
            .map_err(|error| error.to_string())?;
        if name.starts_with("control.tar") {
            let mut archive = tar::Archive::new(unpacked(&name, (&mut reader).take(size))?);
            for entry in archive.entries().map_err(|_| DAMAGED.to_owned())? {
                let mut entry = entry.map_err(|_| DAMAGED.to_owned())?;
                if entry_path(&entry) == "control" {
                    let mut text = String::new();
                    entry
                        .read_to_string(&mut text)
                        .map_err(|_| DAMAGED.to_owned())?;
                    control = Some(control_fields(&text));
                }
            }
        } else if name.starts_with("data.tar") {
            found = contents(unpacked(&name, (&mut reader).take(size))?)?;
        }
        // Members are padded to an even length
        reader
            .seek(SeekFrom::Start(start + size + size % 2))
            .map_err(|error| error.to_string())?;
    }
    let control = control.ok_or(DAMAGED)?;
    let field = |key: &str| control.get(key).cloned().unwrap_or_default();
    let mut description = field("Description");
    let summary = match description.split_once('\n') {
        Some((summary, rest)) => {
            let summary = summary.to_owned();
            description = if rest.trim() == summary.trim() {
                String::new()
            } else {
                rest.trim().to_owned()
            };
            summary
        }
        None => std::mem::take(&mut description),
    };
    let entry = found
        .entries
        .iter()
        .map(|(_, text)| DesktopEntry::parse(text))
        .find(DesktopEntry::visible);
    let icon = entry
        .as_ref()
        .and_then(|entry| entry.get("Icon"))
        .and_then(|name| pick_icon(&mut found.icons, name));
    Ok(Deb {
        package: field("Package"),
        version: field("Version"),
        architecture: field("Architecture"),
        summary,
        description,
        homepage: control.get("Homepage").cloned(),
        size: field("Installed-Size").parse::<u64>().unwrap_or(0) * 1024,
        name: entry
            .as_ref()
            .and_then(|entry| entry.get("Name"))
            .map(str::to_owned),
        icon,
    })
    .and_then(|deb| {
        if deb.package.is_empty() {
            Err(DAMAGED.into())
        } else {
            Ok(deb)
        }
    })
}

/// Whether this computer can run a package built for this architecture.
pub fn runs_here(architecture: &str) -> bool {
    let here = match std::env::consts::ARCH {
        "x86_64" => "amd64",
        "aarch64" => "arm64",
        other => other,
    };
    architecture == "all" || architecture == here
}

#[cfg(test)]
mod tests {
    use std::io::Write;

    use super::{control_fields, inspect};

    fn tarball(files: &[(&str, &[u8])]) -> Vec<u8> {
        let mut builder = tar::Builder::new(Vec::new());
        for (path, bytes) in files {
            let mut header = tar::Header::new_gnu();
            header.set_size(bytes.len() as u64);
            header.set_mode(0o644);
            header.set_cksum();
            builder.append_data(&mut header, path, *bytes).unwrap();
        }
        builder.into_inner().unwrap()
    }

    fn ar_member(archive: &mut Vec<u8>, name: &str, bytes: &[u8]) {
        writeln!(
            archive,
            "{name:<16}{:<12}{:<6}{:<6}{:<8}{:<10}`",
            0,
            0,
            0,
            100644,
            bytes.len()
        )
        .unwrap();
        archive.extend_from_slice(bytes);
        if bytes.len() % 2 == 1 {
            archive.push(b'\n');
        }
    }

    #[test]
    fn reads_what_a_package_holds() {
        let control = tarball(&[("./control", b"Package: hello\nVersion: 2.1-1\nArchitecture: amd64\nInstalled-Size: 300\nDescription: Says hello\n It greets you.\n")]);
        let entry = b"[Desktop Entry]\nType=Application\nName=Hello World\nExec=/usr/bin/hello\nIcon=hello\n";
        let data = tarball(&[
            ("./usr/bin/hello", b"#!/bin/sh\n"),
            ("./usr/share/applications/hello.desktop", entry),
            ("./usr/share/icons/hicolor/48x48/apps/hello.png", b"small"),
            ("./usr/share/icons/hicolor/256x256/apps/hello.png", b"large"),
        ]);
        let mut compressed = liblzma::write::XzEncoder::new(Vec::new(), 6);
        compressed.write_all(&control).unwrap();
        let control = compressed.finish().unwrap();
        let data = zstd::stream::encode_all(data.as_slice(), 3).unwrap();
        let mut deb = b"!<arch>\n".to_vec();
        ar_member(&mut deb, "debian-binary", b"2.0\n");
        ar_member(&mut deb, "control.tar.xz", &control);
        ar_member(&mut deb, "data.tar.zst", &data);
        let path = std::env::temp_dir().join(format!("luft-test-{}.deb", std::process::id()));
        std::fs::write(&path, deb).unwrap();
        let read = inspect(&path);
        std::fs::remove_file(&path).unwrap();
        let read = read.unwrap();
        assert_eq!(
            (
                read.package.as_str(),
                read.version.as_str(),
                read.architecture.as_str()
            ),
            ("hello", "2.1-1", "amd64")
        );
        assert_eq!(
            (read.summary.as_str(), read.description.as_str()),
            ("Says hello", "It greets you.")
        );
        assert_eq!(read.size, 300 * 1024);
        assert_eq!(read.name.as_deref(), Some("Hello World"));
        assert_eq!(read.icon.map(|icon| icon.bytes), Some(b"large".to_vec()));
    }

    #[test]
    fn reads_folded_descriptions() {
        let fields = control_fields(
            "Package: hello\nVersion: 1.0\nDescription: Says hello\n Says hello\n .\n to everyone.\nHomepage: https://example.com\n",
        );
        assert_eq!(fields["Package"], "hello");
        assert_eq!(
            fields["Description"],
            "Says hello\nSays hello\n\nto everyone."
        );
        assert_eq!(fields["Homepage"], "https://example.com");
    }
}
