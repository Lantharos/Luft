use std::fs::{self, File};
use std::os::fd::AsRawFd;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result, bail};

const CODECS: &str = "/sys/class/sound";
const FUNCTION_RESET: u32 = 0x7ff;
const VERB_WRITE: libc::c_ulong = 0xc008_4811;

#[repr(C)]
struct Verb {
    verb: u32,
    result: u32,
}

struct Codec {
    name: String,
    device: File,
}

impl Codec {
    fn send(&self, node: u32, verb: u32, payload: u32) -> Result<()> {
        let mut request = Verb {
            verb: (node << 24) | (verb << 8) | payload,
            result: 0,
        };
        let status = unsafe { libc::ioctl(self.device.as_raw_fd(), VERB_WRITE, &raw mut request) };
        if status < 0 {
            return Err(std::io::Error::last_os_error()).context("The codec didn't answer");
        }
        Ok(())
    }

    fn audio_function(&self) -> Result<u32> {
        let node = fs::read_to_string(self.sysfs().join("afg"))?;
        let node = u32::from_str_radix(node.trim().trim_start_matches("0x"), 16)?;
        if node == 0 {
            bail!("{} has no audio function", self.name);
        }
        Ok(node)
    }

    fn sysfs(&self) -> PathBuf {
        Path::new(CODECS).join(&self.name)
    }

    fn reset(self) -> Result<()> {
        let function = self.audio_function()?;
        self.send(function, FUNCTION_RESET, 0)?;
        self.send(function, FUNCTION_RESET, 0)?;
        let reconfigure = self.sysfs().join("reconfig");
        drop(self.device);
        fs::write(reconfigure, "1").context("The codec's driver couldn't set it up again")
    }
}

fn analog_codecs() -> Result<Vec<Codec>> {
    let mut codecs = Vec::new();
    for entry in fs::read_dir(CODECS)?.flatten() {
        let name = entry.file_name().to_string_lossy().into_owned();
        if !name.starts_with("hwC") {
            continue;
        }
        let chip = fs::read_to_string(entry.path().join("chip_name")).unwrap_or_default();
        if chip.is_empty() || chip.contains("HDMI") {
            continue;
        }
        let device = File::options()
            .read(true)
            .write(true)
            .open(Path::new("/dev/snd").join(&name))?;
        codecs.push(Codec { name, device });
    }
    Ok(codecs)
}

pub fn reset_codecs() {
    let codecs = match analog_codecs() {
        Ok(codecs) => codecs,
        Err(error) => {
            eprintln!("Couldn't find the sound codecs: {error:#}");
            return;
        }
    };
    for codec in codecs {
        let name = codec.name.clone();
        match codec.reset() {
            Ok(()) => eprintln!("Reset {name} after Windows"),
            Err(error) => eprintln!("Couldn't reset {name}: {error:#}"),
        }
    }
}
