use std::collections::HashMap;
use std::fs::File;
use std::io::{BufReader, Read};
use std::path::{Component, Path, PathBuf};

use backhand::{FilesystemReader, InnerNode, Node, SquashfsFileReader};

use super::elf;
use super::library::IconSize;
use crate::desktop::DesktopEntry;

const MAX_LINKS: usize = 8;
const THEMED_ICONS: &str = "/usr/share/icons/hicolor";
const ELECTRON_MARKERS: [&str; 2] = ["/chrome-sandbox", "/resources/app.asar"];

pub struct Icon {
    pub bytes: Vec<u8>,
    pub extension: &'static str,
    pub size: IconSize,
}

pub struct Bundle {
    pub desktop_id: Option<String>,
    pub entry: DesktopEntry,
    pub entry_text: String,
    pub icons: Vec<Icon>,
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

    fn icon_at(&self, path: &Path) -> Option<Icon> {
        let bytes = self.read(path)?;
        let (extension, size) = image_kind(&bytes)?;
        Some(Icon {
            bytes,
            extension,
            size,
        })
    }

    fn themed(&self, name: &str) -> Vec<&'a Path> {
        self.nodes
            .keys()
            .copied()
            .filter(|path| path.starts_with(THEMED_ICONS))
            .filter(|path| path.parent().is_some_and(|folder| folder.ends_with("apps")))
            .filter(|path| path.file_stem().is_some_and(|stem| stem == name))
            .collect()
    }

    fn icons(&self, name: &str) -> Vec<Icon> {
        let root = [
            format!("/{name}.svg"),
            format!("/{name}.png"),
            "/.DirIcon".to_owned(),
        ];
        let mut icons: Vec<Icon> = self
            .themed(name)
            .into_iter()
            .chain(root.iter().map(Path::new))
            .filter_map(|path| self.icon_at(path))
            .collect();
        if icons.is_empty() {
            icons = self
                .nodes
                .keys()
                .filter(|path| path.parent() == Some(Path::new("/")))
                .filter_map(|path| self.icon_at(path))
                .collect();
        }
        icons.sort_by_key(|icon| std::cmp::Reverse(icon.size));
        icons.dedup_by_key(|icon| icon.size.folder());
        icons
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

fn image_kind(bytes: &[u8]) -> Option<(&'static str, IconSize)> {
    if bytes.starts_with(b"\x89PNG") {
        return IconSize::of_png(bytes).map(|size| ("png", size));
    }
    let head = String::from_utf8_lossy(&bytes[..bytes.len().min(1024)]);
    head.contains("<svg").then_some(("svg", IconSize::Scalable))
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
    let icons = entry
        .get("Icon")
        .map(|name| contents.icons(name))
        .unwrap_or_default();
    let electron = ELECTRON_MARKERS
        .iter()
        .any(|marker| contents.nodes.contains_key(Path::new(marker)));
    Ok(Bundle {
        desktop_id: desktop
            .file_stem()
            .map(|stem| stem.to_string_lossy().into_owned()),
        entry,
        entry_text,
        icons,
        electron,
    })
}
