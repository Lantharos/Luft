use luft_app::dbus::objects::Objects;

use super::{FILESYSTEM, bytes_text};

const SYSTEM_MOUNTS: &[&str] = &[
    "/",
    "/boot",
    "/boot/efi",
    "/efi",
    "/home",
    "/usr",
    "/var",
    "/sysroot",
];

pub struct Usage {
    root_found: bool,
}

impl Usage {
    pub fn collect(objects: &Objects) -> Self {
        let root_found = objects.implementing(FILESYSTEM).any(|filesystem| {
            filesystem
                .get::<Vec<Vec<u8>>>("MountPoints")
                .unwrap_or_default()
                .into_iter()
                .any(|point| bytes_text(point) == "/")
        });
        Self { root_found }
    }

    pub fn holds(&self, mount_points: &[String]) -> bool {
        mount_points
            .iter()
            .any(|point| SYSTEM_MOUNTS.contains(&point.as_str()))
    }

    pub fn root_found(&self) -> bool {
        self.root_found
    }
}
