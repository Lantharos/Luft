//! Parse `loader/loader.conf` (systemd-boot compatible subset).

use alloc::string::{String, ToString};

use uefi::boot;
use uefi::proto::media::file::{File, FileAttribute, FileInfo, FileMode, FileType};
use uefi::proto::media::fs::SimpleFileSystem;
use uefi::Handle;

#[derive(Clone, Debug)]
pub struct LoaderConfig {
    pub default_id: Option<String>,
    pub timeout_secs: u32,
}

impl Default for LoaderConfig {
    fn default() -> Self {
        Self {
            default_id: None,
            timeout_secs: 5,
        }
    }
}

pub fn load(device: Handle) -> LoaderConfig {
    let mut fs = match boot::open_protocol_exclusive::<SimpleFileSystem>(device) {
        Ok(fs) => fs,
        Err(_) => return LoaderConfig::default(),
    };
    let mut root = match fs.open_volume() {
        Ok(root) => root,
        Err(_) => return LoaderConfig::default(),
    };
    for path in [
        uefi::cstr16!("\\loader\\loader.conf"),
        uefi::cstr16!("loader\\loader.conf"),
        uefi::cstr16!("loader/loader.conf"),
    ] {
        if let Some(conf) = read_conf(&mut root, path) {
            return conf;
        }
    }
    LoaderConfig::default()
}

fn read_conf(
    root: &mut uefi::proto::media::file::Directory,
    path: &uefi::CStr16,
) -> Option<LoaderConfig> {
    let file = root.open(path, FileMode::Read, FileAttribute::empty()).ok()?;
    let FileType::Regular(mut regular) = file.into_type().ok()? else {
        return None;
    };
    let info = regular.get_boxed_info::<FileInfo>().ok()?;
    let mut data = alloc::vec![0u8; info.file_size() as usize];
    regular.read(&mut data).ok()?;
    Some(parse(core::str::from_utf8(&data).ok()?))
}

fn parse(text: &str) -> LoaderConfig {
    let mut conf = LoaderConfig::default();
    for line in text.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        let Some((k, v)) = line.split_once(char::is_whitespace) else {
            continue;
        };
        match k {
            "default" => conf.default_id = Some(v.trim().to_string()),
            "timeout" => {
                if let Ok(secs) = v.trim().parse::<u32>() {
                    conf.timeout_secs = secs;
                }
            }
            _ => {}
        }
    }
    conf
}