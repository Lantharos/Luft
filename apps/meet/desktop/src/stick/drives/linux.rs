use serde::Deserialize;

use super::{Stick, Volume, add_volume, name};

pub const COLUMNS: &str = "NAME,PATH,TYPE,TRAN,RM,HOTPLUG,RO,SIZE,VENDOR,MODEL,SERIAL,LABEL,FSTYPE,START,LOG-SEC,MOUNTPOINTS";
const USB: &str = "usb";
const STICK_MOUNTS: [&str; 3] = ["/run/media/", "/media/", "/mnt/"];
const STACKED: [&str; 3] = ["crypt", "lvm", "dm"];

#[derive(Deserialize, Clone, Debug)]
pub struct Block {
    pub name: String,
    pub path: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub tran: Option<String>,
    #[serde(default)]
    pub rm: bool,
    #[serde(default)]
    pub hotplug: bool,
    #[serde(default)]
    pub ro: bool,
    #[serde(default)]
    pub size: u64,
    pub vendor: Option<String>,
    pub model: Option<String>,
    pub serial: Option<String>,
    pub label: Option<String>,
    pub fstype: Option<String>,
    pub start: Option<u64>,
    #[serde(rename = "log-sec", default)]
    pub sector: u64,
    #[serde(default)]
    pub mountpoints: Vec<Option<String>>,
    #[serde(default)]
    pub children: Vec<Block>,
}

#[derive(Deserialize)]
pub struct Listing {
    pub blockdevices: Vec<Block>,
}

impl Block {
    pub fn descendants(&self) -> Vec<&Block> {
        self.children
            .iter()
            .flat_map(|child| std::iter::once(child).chain(child.descendants()))
            .collect()
    }

    pub fn mounts(&self) -> impl Iterator<Item = &str> {
        self.mountpoints.iter().flatten().map(String::as_str)
    }

    fn in_use(&self) -> bool {
        std::iter::once(self)
            .chain(self.descendants())
            .any(|block| {
                STACKED.contains(&block.kind.as_str())
                    || block.kind.starts_with("raid")
                    || block
                        .mounts()
                        .any(|mount| !STICK_MOUNTS.iter().any(|place| mount.starts_with(place)))
            })
    }

    pub fn id(&self) -> String {
        format!(
            "{}:{}:{}",
            self.path,
            self.size,
            self.serial.as_deref().unwrap_or_default()
        )
    }

    fn volume(&self) -> Option<Volume> {
        self.fstype.as_ref()?;
        Some(Volume {
            label: self.label.clone().filter(|label| !label.is_empty()),
            filesystem: self.fstype.clone(),
            size: self.size,
        })
    }

    pub fn describe(&self, ventoy: bool) -> Stick {
        let mut volumes = Vec::new();
        for block in std::iter::once(self).chain(self.children.iter()) {
            if let Some(volume) = block.volume() {
                add_volume(&mut volumes, volume);
            }
        }
        Stick {
            id: self.id(),
            name: name(self.vendor.as_deref(), self.model.as_deref()),
            size: self.size,
            volumes,
            ventoy,
        }
    }
}

pub fn removable_usb(block: &Block, holding_iso: Option<&str>) -> bool {
    block.kind == "disk"
        && block.tran.as_deref() == Some(USB)
        && (block.rm || block.hotplug)
        && !block.ro
        && block.size > 0
        && Some(block.name.as_str()) != holding_iso
        && !block.in_use()
}

pub fn sticks<'a>(blocks: &'a [Block], holding_iso: Option<&str>) -> Vec<&'a Block> {
    blocks
        .iter()
        .filter(|block| removable_usb(block, holding_iso))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn listing() -> Vec<Block> {
        serde_json::from_str::<Listing>(include_str!("samples/lsblk.json"))
            .unwrap()
            .blockdevices
    }

    fn names(found: &[&Block]) -> Vec<String> {
        found.iter().map(|block| block.name.clone()).collect()
    }

    #[test]
    fn only_removable_usb_drives_that_hold_nothing_of_the_system_are_offered() {
        assert_eq!(names(&sticks(&listing(), None)), ["sda", "sdd"]);
    }

    #[test]
    fn the_drive_with_the_chosen_iso_is_left_out() {
        assert_eq!(names(&sticks(&listing(), Some("sda"))), ["sdd"]);
    }

    #[test]
    fn a_stick_shows_what_is_on_it() {
        let blocks = listing();
        let stick = sticks(&blocks, None)[0].describe(false);
        assert_eq!(stick.name, "SanDisk Ultra");
        assert_eq!(stick.id, "/dev/sda:30752636928:4C530001230521116221");
        assert_eq!(
            stick.volumes,
            [Volume {
                label: Some("PHOTOS".into()),
                filesystem: Some("vfat".into()),
                size: 30751588352
            }]
        );
    }

    #[test]
    fn a_flashed_luft_stick_lists_each_volume_once() {
        let blocks = listing();
        let stick = sticks(&blocks, None)[1].describe(false);
        let labels: Vec<_> = stick
            .volumes
            .iter()
            .map(|volume| volume.label.as_deref().unwrap_or_default())
            .collect();
        assert_eq!(labels, ["Luft-45", "LUFT-EFI"]);
    }
}
