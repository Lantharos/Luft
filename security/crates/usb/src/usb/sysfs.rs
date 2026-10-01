use std::fs;
use std::path::{Path, PathBuf};

const BUS: &str = "/sys/bus/usb";
const DEVICES: &str = "/sys/bus/usb/devices";
const DEFAULT_POLICY: &str = "/sys/module/usbcore/parameters/authorized_default";
const UNNAMED: &str = "USB device";

pub struct Device {
    path: PathBuf,
}

pub struct Interface {
    name: String,
    path: PathBuf,
}

pub struct Bus {
    path: PathBuf,
}

fn read(path: &Path, attribute: &str) -> Option<String> {
    let value = fs::read_to_string(path.join(attribute)).ok()?;
    Some(value.trim().to_owned()).filter(|value| !value.is_empty())
}

fn write(path: &Path, attribute: &str, value: &str) {
    let file = path.join(attribute);
    if let Err(error) = fs::write(&file, value) {
        eprintln!("Couldn't write {value} to {}: {error}", file.display());
    }
}

fn is_authorized(path: &Path) -> bool {
    read(path, "authorized").as_deref() != Some("0")
}

fn authorize(path: &Path) {
    write(path, "authorized", "1");
}

fn entries(path: &Path) -> impl Iterator<Item = String> {
    fs::read_dir(path)
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| entry.file_name().into_string().ok())
}

pub fn is_root_hub(id: &str) -> bool {
    id.starts_with("usb")
}

impl Device {
    pub fn named(id: &str) -> Self {
        Self {
            path: Path::new(DEVICES).join(id),
        }
    }

    pub fn ids() -> impl Iterator<Item = String> {
        entries(Path::new(DEVICES)).filter(|id| !id.contains(':'))
    }

    pub fn is_authorized(&self) -> bool {
        is_authorized(&self.path)
    }

    pub fn authorize(&self) {
        authorize(&self.path);
    }

    pub fn descriptors(&self) -> Option<Vec<u8>> {
        fs::read(self.path.join("descriptors")).ok()
    }

    pub fn interfaces(&self) -> impl Iterator<Item = Interface> {
        entries(&self.path)
            .filter(|name| name.contains(':'))
            .map(|name| Interface {
                path: self.path.join(&name),
                name,
            })
    }

    pub fn name(&self) -> String {
        let product = read(&self.path, "product");
        match (read(&self.path, "manufacturer"), product) {
            (Some(maker), Some(product)) if !product.starts_with(&maker) => {
                format!("{maker} {product}")
            }
            (_, Some(product)) => product,
            (Some(maker), None) => maker,
            (None, None) => UNNAMED.to_owned(),
        }
    }
}

impl Interface {
    pub fn is_authorized(&self) -> bool {
        is_authorized(&self.path)
    }

    pub fn authorize(&self) {
        authorize(&self.path);
        write(Path::new(BUS), "drivers_probe", &self.name);
    }

    pub fn class(&self) -> Option<u8> {
        u8::from_str_radix(&read(&self.path, "bInterfaceClass")?, 16).ok()
    }
}

impl Bus {
    pub fn named(id: &str) -> Self {
        Self {
            path: Path::new(DEVICES).join(id),
        }
    }

    pub fn all() -> impl Iterator<Item = Self> {
        Device::ids()
            .filter(|id| is_root_hub(id))
            .map(|id| Self::named(&id))
    }

    pub fn hold_new_devices(&self) {
        write(&self.path, "authorized_default", "0");
        write(&self.path, "interface_authorized_default", "0");
    }

    pub fn welcome_new_devices(&self) {
        write(&self.path, "authorized_default", system_policy());
        write(&self.path, "interface_authorized_default", "1");
    }
}

fn system_policy() -> &'static str {
    match fs::read_to_string(DEFAULT_POLICY).as_deref().map(str::trim) {
        Ok("0") => "0",
        Ok("2") => "2",
        _ => "1",
    }
}
