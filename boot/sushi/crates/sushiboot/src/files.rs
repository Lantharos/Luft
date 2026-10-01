use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec;
use alloc::vec::Vec;

use uefi::boot::ScopedProtocol;
use uefi::proto::media::file::{
    Directory, File, FileAttribute, FileInfo, FileMode, FileType, RegularFile,
};
use uefi::proto::media::fs::SimpleFileSystem;
use uefi::{CString16, Handle};

use crate::protocol;

pub struct Volume {
    _fs: ScopedProtocol<SimpleFileSystem>,
    root: Directory,
}

pub struct Listed {
    pub name: String,
    pub directory: bool,
}

pub fn efi_path(path: &str) -> String {
    let path = path.trim_start_matches(['\\', '/']).replace('/', "\\");
    format!("\\{path}")
}

fn path16(path: &str) -> Option<CString16> {
    CString16::try_from(efi_path(path).as_str()).ok()
}

pub fn read_to_end(file: &mut RegularFile) -> Option<Vec<u8>> {
    let info = file.get_boxed_info::<FileInfo>().ok()?;
    let mut data = vec![0u8; info.file_size() as usize];
    let read = file.read(&mut data).ok()?;
    data.truncate(read);
    Some(data)
}

impl Volume {
    pub fn open(handle: Handle) -> Option<Self> {
        let mut fs = protocol::shared::<SimpleFileSystem>(handle).ok()?;
        let root = fs.open_volume().ok()?;
        Some(Self { _fs: fs, root })
    }

    pub fn file(&mut self, path: &str) -> Option<RegularFile> {
        let file = self
            .root
            .open(&path16(path)?, FileMode::Read, FileAttribute::empty())
            .ok()?;
        match file.into_type().ok()? {
            FileType::Regular(regular) => Some(regular),
            FileType::Dir(_) => None,
        }
    }

    pub fn is_file(&mut self, path: &str) -> bool {
        self.file(path).is_some()
    }

    pub fn read(&mut self, path: &str) -> Option<Vec<u8>> {
        read_to_end(&mut self.file(path)?)
    }

    pub fn list(&mut self, path: &str) -> Vec<Listed> {
        let Some(FileType::Dir(mut directory)) = path16(path)
            .and_then(|path| {
                self.root
                    .open(&path, FileMode::Read, FileAttribute::empty())
                    .ok()
            })
            .and_then(|file| file.into_type().ok())
        else {
            return Vec::new();
        };
        let mut listed = Vec::new();
        while let Ok(Some(info)) = directory.read_entry_boxed() {
            let name = info.file_name().to_string();
            if name != "." && name != ".." {
                listed.push(Listed {
                    name,
                    directory: info.is_directory(),
                });
            }
        }
        listed
    }
}
