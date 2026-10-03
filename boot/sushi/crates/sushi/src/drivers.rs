use std::path::{Path, PathBuf};
use std::process::{Child, Command, ExitStatus, Stdio};

const CONFIGS: [&str; 2] = [
    "/etc/modprobe.d/sushi.conf",
    "/usr/lib/modprobe.d/sushi.conf",
];
const PCI_DEVICES: &str = "/sys/bus/pci/devices";
const LOADED: &str = "/sys/module";
const DISPLAY_CLASS: &str = "0x03";

/// Graphics drivers that udev leaves alone so the splash can load them at a moment of its choosing.
#[derive(Debug, Default, PartialEq, Eq)]
pub struct Waiting {
    pub boot_display: Vec<String>,
    pub others: Vec<String>,
}

impl Waiting {
    pub fn is_empty(&self) -> bool {
        self.boot_display.is_empty() && self.others.is_empty()
    }

    pub fn all(&self) -> Vec<String> {
        self.boot_display
            .iter()
            .chain(&self.others)
            .cloned()
            .collect()
    }
}

fn normalized(name: &str) -> String {
    name.trim().replace('-', "_")
}

fn deferred() -> Vec<String> {
    let text = CONFIGS
        .iter()
        .find_map(|path| std::fs::read_to_string(path).ok())
        .unwrap_or_default();
    parse_deferred(&text)
}

fn parse_deferred(text: &str) -> Vec<String> {
    text.lines()
        .filter_map(|line| line.trim().strip_prefix("blacklist "))
        .map(normalized)
        .collect()
}

fn resolve(alias: &str) -> Vec<String> {
    Command::new("modprobe")
        .args(["--resolve-alias", alias])
        .stderr(Stdio::null())
        .output()
        .map(|output| {
            String::from_utf8_lossy(&output.stdout)
                .lines()
                .map(normalized)
                .collect()
        })
        .unwrap_or_default()
}

fn read(device: &Path, attribute: &str) -> String {
    std::fs::read_to_string(device.join(attribute))
        .unwrap_or_default()
        .trim()
        .to_owned()
}

fn is_loaded(module: &str) -> bool {
    Path::new(LOADED).join(module).exists()
}

/// The deferred drivers this computer's graphics cards need and that aren't loaded yet.
pub fn waiting() -> Waiting {
    let deferred = deferred();
    let mut waiting = Waiting::default();
    if deferred.is_empty() {
        return waiting;
    }
    for device in display_devices() {
        let boot_display = read(&device, "boot_vga") == "1";
        for module in resolve(&read(&device, "modalias")) {
            if !deferred.contains(&module) || is_loaded(&module) {
                continue;
            }
            let list = if boot_display {
                &mut waiting.boot_display
            } else {
                &mut waiting.others
            };
            if !list.contains(&module) {
                list.push(module);
            }
        }
    }
    waiting
        .others
        .retain(|module| !waiting.boot_display.contains(module));
    waiting
}

fn display_devices() -> impl Iterator<Item = PathBuf> {
    std::fs::read_dir(PCI_DEVICES)
        .into_iter()
        .flatten()
        .flatten()
        .map(|entry| entry.path())
        .filter(|device| read(device, "class").starts_with(DISPLAY_CLASS))
}

/// Whether udev is about to load a driver for the screen the firmware lit, which will take it over.
pub fn boot_display_awaits_driver() -> bool {
    let deferred = deferred();
    display_devices()
        .filter(|device| read(device, "boot_vga") == "1" && !device.join("driver").exists())
        .any(|device| {
            resolve(&read(&device, "modalias"))
                .iter()
                .any(|module| !deferred.contains(module))
        })
}

fn modprobe(modules: &[String]) -> Command {
    let mut command = Command::new("modprobe");
    command
        .arg("--all")
        .args(modules)
        .stdin(Stdio::null())
        .stdout(Stdio::null());
    command
}

pub fn start_loading(modules: &[String]) -> std::io::Result<Child> {
    modprobe(modules).spawn()
}

pub fn load(modules: &[String]) -> std::io::Result<ExitStatus> {
    modprobe(modules).status()
}

pub fn load_in_background(modules: Vec<String>) {
    if modules.is_empty() {
        return;
    }
    std::thread::spawn(move || {
        if let Err(error) = load(&modules) {
            eprintln!("Couldn't load {}: {error}", modules.join(", "));
        }
    });
}

#[cfg(test)]
mod tests {
    use super::parse_deferred;

    #[test]
    fn reads_the_deferred_drivers_from_the_blacklist() {
        assert_eq!(
            parse_deferred(
                "# Sushi loads these\nblacklist nvidia-drm\n  blacklist bochs\noptions x y=1\n"
            ),
            ["nvidia_drm", "bochs"]
        );
    }
}
