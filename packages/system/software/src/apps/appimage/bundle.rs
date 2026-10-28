use std::collections::HashMap;
use std::fs::File;
use std::io::{BufReader, Read};
use std::path::{Component, Path, PathBuf};

use backhand::{FilesystemReader, InnerNode, Node, SquashfsFileReader};

use super::declaration::{self, Declaration};
use super::elf;
use super::library::IconSize;
use crate::apps::chromium;
use crate::apps::desktop::DesktopEntry;

const MAX_LINKS: usize = 8;
const MAX_FILE_BYTES: u64 = 16 << 20;
const THEMED_ICONS: &str = "/usr/share/icons/hicolor";
const ELECTRON_MARKERS: [&str; 2] = ["/chrome-sandbox", "/resources/app.asar"];
const IMAGE_EXTENSIONS: [&str; 2] = ["png", "svg"];

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
    pub chromium: bool,
    /// What a Sabine app declares about its sandbox; none for other apps.
    pub declaration: Option<Declaration>,
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
            .take(MAX_FILE_BYTES + 1)
            .read_to_end(&mut bytes)
            .ok()?;
        (bytes.len() as u64 <= MAX_FILE_BYTES).then_some(bytes)
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

    fn icons(&self, name: Option<&str>) -> Vec<Icon> {
        let named = name.into_iter().flat_map(|name| {
            self.themed(name)
                .into_iter()
                .map(Path::to_path_buf)
                .chain([format!("/{name}.svg"), format!("/{name}.png")].map(PathBuf::from))
        });
        let mut icons: Vec<Icon> = named
            .chain(std::iter::once(PathBuf::from("/.DirIcon")))
            .filter_map(|path| self.icon_at(&path))
            .collect();
        if icons.is_empty() {
            icons = self
                .nodes
                .keys()
                .filter(|path| path.parent() == Some(Path::new("/")))
                .filter(|path| {
                    path.extension().is_some_and(|extension| {
                        IMAGE_EXTENSIONS.iter().any(|known| extension == *known)
                    })
                })
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

fn unreadable() -> String {
    "This file isn't an AppImage this computer can open.".to_string()
}

fn open(path: &Path) -> Result<FilesystemReader<'static>, String> {
    let mut file = File::open(path).map_err(|error| error.to_string())?;
    let offset = elf::payload_offset(&mut file).ok_or_else(unreadable)?;
    FilesystemReader::from_reader_with_offset(BufReader::new(file), offset)
        .map_err(|_| unreadable())
}

pub fn icons(path: &Path) -> Result<Vec<Icon>, String> {
    let filesystem = open(path)?;
    let contents = Contents::new(&filesystem);
    let name = contents
        .desktop_file()
        .and_then(|desktop| contents.read(&desktop))
        .and_then(|text| {
            DesktopEntry::parse(&String::from_utf8_lossy(&text))
                .get("Icon")
                .map(str::to_owned)
        });
    Ok(contents.icons(name.as_deref()))
}

pub fn read(path: &Path) -> Result<Bundle, String> {
    let filesystem = open(path)?;
    let contents = Contents::new(&filesystem);
    let desktop = contents
        .desktop_file()
        .ok_or("This AppImage doesn't say how to start it.")?;
    let entry_text =
        String::from_utf8_lossy(&contents.read(&desktop).ok_or_else(unreadable)?).into_owned();
    let entry = DesktopEntry::parse(&entry_text);
    let icons = contents.icons(entry.get("Icon"));
    let declaration = contents
        .nodes
        .keys()
        .find(|path| declaration::is_manifest(path))
        .map(|manifest| {
            let text = contents.read(manifest).ok_or_else(unreadable)?;
            Declaration::read(&String::from_utf8_lossy(&text))
                .map_err(|error| format!("What it asks of its sandbox can't be read: {error}"))
        })
        .transpose()?;
    let sabine = declaration.is_some();
    let electron = !sabine
        && ELECTRON_MARKERS
            .iter()
            .any(|marker| contents.nodes.contains_key(Path::new(marker)));
    let chromium = !sabine
        && contents.nodes.keys().any(|path| {
            path.file_name()
                .is_some_and(|name| name == chromium::RESOURCES)
        });
    Ok(Bundle {
        desktop_id: desktop
            .file_stem()
            .map(|stem| stem.to_string_lossy().into_owned()),
        entry,
        entry_text,
        icons,
        electron,
        chromium,
        declaration,
    })
}
