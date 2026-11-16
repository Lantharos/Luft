use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

use resvg::{tiny_skia, usvg};

use crate::render::{Gpu, Slot};

/// Symbolic icons, found by name under the icon folders and kept in the
/// atlas as coverage at the sizes they are drawn.
pub struct Icons {
    roots: Vec<PathBuf>,
    files: Option<HashMap<String, PathBuf>>,
    masks: HashMap<(String, u32), Option<Slot>>,
}

impl Icons {
    pub fn new(roots: Vec<PathBuf>) -> Self {
        Self {
            roots,
            files: None,
            masks: HashMap::new(),
        }
    }

    pub fn mask(&mut self, gpu: &mut Gpu, name: &str, pixels: u32) -> Option<Slot> {
        if let Some(mask) = self.masks.get(&(name.to_owned(), pixels)) {
            return *mask;
        }
        let files = self.files.get_or_insert_with(|| {
            let mut files = HashMap::new();
            for root in self.roots.iter().rev() {
                index(root, &mut files);
            }
            files
        });
        let mask = files
            .get(name)
            .and_then(|path| rasterize(path, pixels))
            .map(|coverage| gpu.atlas.insert(&gpu.queue, pixels, pixels, &coverage));
        self.masks.insert((name.to_owned(), pixels), mask);
        mask
    }
}

fn index(folder: &Path, files: &mut HashMap<String, PathBuf>) {
    let Ok(entries) = fs::read_dir(folder) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            index(&path, files);
        } else if path.extension().is_some_and(|extension| extension == "svg")
            && let Some(name) = path.file_stem().and_then(|name| name.to_str())
        {
            files.insert(name.to_owned(), path);
        }
    }
}

fn rasterize(path: &Path, pixels: u32) -> Option<Vec<u8>> {
    let tree = usvg::Tree::from_data(&fs::read(path).ok()?, &usvg::Options::default()).ok()?;
    let mut pixmap = tiny_skia::Pixmap::new(pixels, pixels)?;
    let size = tree.size();
    let transform = tiny_skia::Transform::from_scale(
        pixels as f32 / size.width(),
        pixels as f32 / size.height(),
    );
    resvg::render(&tree, transform, &mut pixmap.as_mut());
    Some(pixmap.pixels().iter().map(|pixel| pixel.alpha()).collect())
}
