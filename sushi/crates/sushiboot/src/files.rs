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

const RENAME_STORAGE: usize = 1024;
const LARGEST_CONFIG: u64 = 64 << 10;

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

fn read_up_to(file: &mut RegularFile, largest: u64) -> Option<Vec<u8>> {
    let size = file.get_boxed_info::<FileInfo>().ok()?.file_size();
    if size > largest {
        return None;
    }
    let mut data = Vec::new();
    data.try_reserve_exact(size as usize).ok()?;
    data.resize(size as usize, 0);
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
        read_up_to(&mut self.file(path)?, u64::MAX)
    }

    pub fn read_config(&mut self, path: &str) -> Option<Vec<u8>> {
        read_up_to(&mut self.file(path)?, LARGEST_CONFIG)
    }

    pub fn rename(&mut self, path: &str, name: &str) -> Option<()> {
        let mut file = self
            .root
            .open(&path16(path)?, FileMode::ReadWrite, FileAttribute::empty())
            .ok()?;
        let info = file.get_boxed_info::<FileInfo>().ok()?;
        let name = CString16::try_from(name).ok()?;
        let mut storage = vec![0u8; RENAME_STORAGE];
        let renamed = FileInfo::new(
            &mut storage,
            info.file_size(),
            info.physical_size(),
            *info.create_time(),
            *info.last_access_time(),
            *info.modification_time(),
            info.attribute(),
            &name,
        )
        .ok()?;
        file.set_info(renamed).ok()?;
        file.flush().ok()
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
