use luft_app::dbus::objects::{Object, Objects};
use serde::Serialize;

use super::health::{self, Health};
use super::volumes::{self, Segment};
use super::{BLOCK, DRIVE, JOB, LOOP, PARTITION, TABLE, bytes_text, system};

#[derive(Serialize)]
pub struct Snapshot {
    pub drives: Vec<Drive>,
}

#[derive(Serialize, Clone, Copy, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Kind {
    Nvme,
    Ssd,
    Hdd,
    Usb,
    Card,
    Optical,
    Image,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Drive {
    pub id: String,
    pub block: String,
    pub device: String,
    pub name: String,
    pub model: String,
    pub serial: String,
    pub size: u64,
    pub kind: Kind,
    pub removable: bool,
    pub can_power_off: bool,
    pub system: bool,
    pub read_only: bool,
    pub table: Option<String>,
    pub segments: Vec<Segment>,
    pub health: Option<Health>,
    pub job: Option<Job>,
    #[serde(skip)]
    sort_key: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Job {
    pub operation: String,
    pub progress: Option<f64>,
}

pub fn build(objects: &Objects) -> Snapshot {
    let jobs = Jobs::collect(objects);
    let usage = system::Usage::collect(objects);
    let mut drives: Vec<Drive> = objects
        .implementing(BLOCK)
        .filter(|block| is_whole_disk(objects, block))
        .filter_map(|block| drive(objects, block, &jobs, &usage))
        .collect();
    drives.sort_by(|a, b| {
        (!a.system, a.removable, a.kind == Kind::Image, &a.sort_key).cmp(&(
            !b.system,
            b.removable,
            b.kind == Kind::Image,
            &b.sort_key,
        ))
    });
    Snapshot { drives }
}

fn is_whole_disk(objects: &Objects, block: &Object) -> bool {
    objects.get(block.path, PARTITION).is_none()
        && block.link("CryptoBackingDevice").is_none()
        && !block.flag("HintIgnore")
        && block.get::<u64>("Size").unwrap_or(0) > 0
        && (block.link("Drive").is_some() || is_image(objects, block))
}

fn is_image(objects: &Objects, block: &Object) -> bool {
    objects.get(block.path, LOOP).is_some()
        && block.get::<String>("IdType").as_deref() != Some("squashfs")
}

fn drive(objects: &Objects, block: Object, jobs: &Jobs, usage: &system::Usage) -> Option<Drive> {
    let device = bytes_text(
        block
            .get("PreferredDevice")
            .or_else(|| block.get("Device"))?,
    );
    let size = block.get::<u64>("Size")?;
    let drive = block
        .link("Drive")
        .and_then(|path| objects.get(&path, DRIVE).map(|_| path));
    let info = drive.as_deref().and_then(|path| objects.get(path, DRIVE));
    let text = |name: &str| {
        info.and_then(|drive| drive.get::<String>(name))
            .unwrap_or_default()
            .trim()
            .to_owned()
    };
    let (vendor, model) = (text("Vendor"), text("Model"));
    let kind = info.map_or(Kind::Image, |drive| kind_of(objects, drive));
    let segments = volumes::map(objects, &block, size, jobs, usage);
    let system = segments.iter().any(Segment::system);
    Some(Drive {
        id: drive.clone().unwrap_or_else(|| block.path.to_owned()),
        block: block.path.to_owned(),
        name: name(&vendor, &model, kind, objects, &block),
        model: [vendor.as_str(), model.as_str()]
            .iter()
            .filter(|part| !part.is_empty())
            .copied()
            .collect::<Vec<_>>()
            .join(" "),
        serial: text("Serial"),
        removable: info
            .is_some_and(|drive| drive.flag("Removable") || drive.flag("MediaRemovable"))
            || kind == Kind::Usb,
        can_power_off: info
            .is_some_and(|drive| drive.flag("CanPowerOff") || drive.flag("Ejectable")),
        read_only: block.flag("ReadOnly"),
        table: objects
            .get(block.path, TABLE)
            .and_then(|table| table.get("Type")),
        health: drive
            .as_deref()
            .and_then(|path| health::read(objects, path)),
        job: jobs
            .on(block.path)
            .or_else(|| drive.as_deref().and_then(|path| jobs.on(path))),
        sort_key: text("SortKey"),
        system,
        segments,
        device,
        kind,
        size,
    })
}

fn kind_of(objects: &Objects, drive: Object) -> Kind {
    let bus = drive.get::<String>("ConnectionBus").unwrap_or_default();
    let media = drive.get::<String>("Media").unwrap_or_default();
    if drive.flag("Optical") || media.starts_with("optical") {
        Kind::Optical
    } else if media.starts_with("flash_sd") || media.starts_with("flash_ms") || bus == "sdio" {
        Kind::Card
    } else if bus == "usb" || bus == "ieee1394" {
        Kind::Usb
    } else if objects.get(drive.path, super::NVME).is_some() {
        Kind::Nvme
    } else if drive.get::<i32>("RotationRate").unwrap_or(-1) == 0 {
        Kind::Ssd
    } else {
        Kind::Hdd
    }
}

fn name(vendor: &str, model: &str, kind: Kind, objects: &Objects, block: &Object) -> String {
    if kind == Kind::Image {
        let backing = objects
            .get(block.path, LOOP)
            .and_then(|image| image.get::<Vec<u8>>("BackingFile"))
            .map(bytes_text)
            .unwrap_or_default();
        return std::path::Path::new(&backing).file_name().map_or_else(
            || "Disk image".to_owned(),
            |file| file.to_string_lossy().into_owned(),
        );
    }
    if model.is_empty() {
        return vendor.to_owned();
    }
    if vendor.is_empty() || model.to_lowercase().starts_with(&vendor.to_lowercase()) {
        return model.to_owned();
    }
    format!("{vendor} {model}")
}

pub struct Jobs(Vec<(Vec<String>, Job)>);

impl Jobs {
    fn collect(objects: &Objects) -> Self {
        Self(
            objects
                .implementing(JOB)
                .map(|job| {
                    let targets = job
                        .get::<Vec<zbus::zvariant::OwnedObjectPath>>("Objects")
                        .unwrap_or_default()
                        .into_iter()
                        .map(|path| path.to_string())
                        .collect();
                    let progress = job
                        .flag("ProgressValid")
                        .then(|| job.get::<f64>("Progress"))
                        .flatten();
                    (
                        targets,
                        Job {
                            operation: job.get("Operation").unwrap_or_default(),
                            progress,
                        },
                    )
                })
                .collect(),
        )
    }

    pub fn on(&self, path: &str) -> Option<Job> {
        self.0
            .iter()
            .find(|(targets, _)| targets.iter().any(|target| target == path))
            .map(|(_, job)| job.clone())
    }
}
