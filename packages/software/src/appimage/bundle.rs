use std::collections::HashMap;
use std::fs::File;
use std::io::{BufReader, Read};
use std::path::{Component, Path, PathBuf};

use backhand::{FilesystemReader, InnerNode, Node, SquashfsFileReader};

use super::elf;
use crate::desktop::DesktopEntry;

const MAX_LINKS: usize = 8;
const ICON_SIZES: [&str; 5] = ["scalable", "512x512", "256x256", "128x128", "64x64"];
const ELECTRON_MARKERS: [&str; 2] = ["/chrome-sandbox", "/resources/app.asar"];

pub struct Icon {
    pub bytes: Vec<u8>,
    pub extension: &'static str,
}

pub struct Bundle {
    pub entry: DesktopEntry,
    pub entry_text: String,
    pub icon: Option<Icon>,
    pub electron: bool,
}

struct Contents<'a, 'b> {
    filesystem: &'a FilesystemReader<'b>,
    nodes: HashMap<&'a Path, &'a Node<SquashfsFileReader>>,
}

impl<'a, 'b> Contents<'a, 'b> {
    fn new(filesystem: &'a FilesystemReader<'b>) -> Self {
        let nodes = filesystem
            .files()
            .map(|node| (node.fullpath.as_path(), node))
            .collect();
        Self { filesystem, nodes }
    }

    fn resolve(&self, path: &Path) -> Option<&'a SquashfsFileReader> {
        let mut path = path.to_path_buf();
        for _ in 0..MAX_LINKS {
            match &self.nodes.get(path.as_path())?.inner {
                InnerNode::File(file) => return Some(file),
                InnerNode::Symlink(link) => path = normalize(path.parent()?, &link.link),
                _ => return None,
            }
        }
        None
    }

    fn read(&self, path: &Path) -> Option<Vec<u8>> {
        let file = self.resolve(path)?;
        let mut bytes = Vec::new();
        self.filesystem
            .file(file)
            .reader()
            .read_to_end(&mut bytes)
            .ok()?;
        Some(bytes)
    }

    fn desktop_file(&self) -> Option<PathBuf> {
        let mut entries: Vec<&Path> = self
            .nodes
            .keys()
            .copied()
            .filter(|path| path.parent() == Some(Path::new("/")))
            .filter(|path| {
                path.extension()
                    .is_some_and(|extension| extension == "desktop")
            })
            .collect();
        entries.sort();
        entries.first().map(|path| path.to_path_buf())
    }

    fn icon(&self, name: &str) -> Option<Icon> {
        let mut candidates: Vec<PathBuf> = ["svg", "png"]
            .iter()
            .map(|extension| PathBuf::from(format!("/{name}.{extension}")))
            .collect();
        candidates.push(PathBuf::from("/.DirIcon"));
        for size in ICON_SIZES {
            for extension in ["svg", "png"] {
                candidates.push(PathBuf::from(format!(
                    "/usr/share/icons/hicolor/{size}/apps/{name}.{extension}"
                )));
            }
        }
        candidates.iter().find_map(|path| {
            let bytes = self.read(path)?;
            let extension = image_kind(&bytes)?;
            Some(Icon { bytes, extension })
        })
    }
}

fn normalize(base: &Path, link: &Path) -> PathBuf {
    let mut path = if link.is_absolute() {
        PathBuf::from("/")
    } else {
        base.to_path_buf()
    };
    for component in link.components() {
        match component {
            Component::ParentDir => {
                path.pop();
            }
            Component::Normal(part) => path.push(part),
            _ => {}
        }
    }
    path
}

fn image_kind(bytes: &[u8]) -> Option<&'static str> {
    if bytes.starts_with(b"\x89PNG") {
        return Some("png");
    }
    let head = String::from_utf8_lossy(&bytes[..bytes.len().min(1024)]);
    head.contains("<svg").then_some("svg")
}

pub fn read(path: &Path) -> Result<Bundle, String> {
    let unreadable = || "This file isn't an AppImage this computer can open.".to_string();
    let mut file = File::open(path).map_err(|error| error.to_string())?;
    let offset = elf::payload_offset(&mut file).ok_or_else(unreadable)?;
    let filesystem = FilesystemReader::from_reader_with_offset(BufReader::new(file), offset)
        .map_err(|_| unreadable())?;
    let contents = Contents::new(&filesystem);
    let desktop = contents
        .desktop_file()
        .ok_or("This AppImage doesn't say how to start it.")?;
    let entry_text =
        String::from_utf8_lossy(&contents.read(&desktop).ok_or_else(unreadable)?).into_owned();
    let entry = DesktopEntry::parse(&entry_text);
    let icon = entry.get("Icon").and_then(|name| contents.icon(name));
    let electron = ELECTRON_MARKERS
        .iter()
        .any(|marker| contents.nodes.contains_key(Path::new(marker)));
    Ok(Bundle {
        entry,
        entry_text,
        icon,
        electron,
    })
}
