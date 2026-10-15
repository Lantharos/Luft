use alloc::string::{String, ToString};

use uefi::Handle;

use crate::files::Volume;
use crate::tpm;

pub struct LoaderConfig {
    pub default: Option<String>,
    pub timeout: u32,
}

pub fn load(device: Handle) -> LoaderConfig {
    let Some(contents) =
        Volume::open(device).and_then(|mut volume| volume.read("\\loader\\loader.conf"))
    else {
        return parse("");
    };
    tpm::measure_loader_conf(&contents);
    parse(&String::from_utf8(contents).unwrap_or_default())
}

fn parse(text: &str) -> LoaderConfig {
    let mut config = LoaderConfig {
        default: None,
        timeout: 5,
    };
    for line in text.lines().map(str::trim) {
        let Some((key, value)) = line.split_once(char::is_whitespace) else {
            continue;
        };
        match key {
            "default" => config.default = Some(value.trim().to_string()),
            "timeout" => {
                if let Ok(seconds) = value.trim().parse() {
                    config.timeout = seconds;
                }
            }
            _ => {}
        }
    }
    config
}
