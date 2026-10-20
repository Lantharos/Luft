#![allow(non_snake_case, non_camel_case_types)]

use std::path::PathBuf;

use luft_i18n::t;
use serde::{Deserialize, Serialize};
use wmi::WMIConnection;

use super::bitlocker::BitLocker;
use crate::L10N;
use crate::plan::layout::{Disk, Span, Windows};

pub const ESP_TYPE: &str = "{c12a7328-f81f-11d2-ba4b-00a0c93ec93b}";
pub const BASIC_TYPE: &str = "{ebd0a0a2-b9e5-4433-87c0-68b6b72699c7}";
const GPT: u16 = 2;

#[derive(Deserialize, Debug, Clone)]
pub struct MSFT_Partition {
    pub __Path: String,
    pub DiskNumber: u32,
    pub Offset: u64,
    pub Size: u64,
    pub Guid: Option<String>,
    pub GptType: Option<String>,
    pub IsSystem: bool,
    pub AccessPaths: Option<Vec<String>>,
}

#[derive(Deserialize)]
pub struct MSFT_Disk {
    pub __Path: String,
    pub Number: u32,
    pub Size: u64,
    pub LogicalSectorSize: u32,
    pub PartitionStyle: u16,
}

#[derive(Deserialize)]
pub struct MSFT_Volume {
    pub __Path: String,
    pub Size: u64,
    pub SizeRemaining: u64,
}

#[derive(Deserialize)]
struct Returned {
    ReturnValue: u32,
}

#[derive(Deserialize)]
struct SupportedSize {
    ReturnValue: u32,
    SizeMin: u64,
}

#[derive(Serialize)]
struct Resize {
    Size: u64,
}

#[derive(Serialize)]
struct CreatePartition {
    Size: u64,
    Offset: u64,
    GptType: String,
    AssignDriveLetter: bool,
}

#[derive(Serialize)]
struct Attributes {
    NoDefaultDriveLetter: bool,
}

#[derive(Serialize)]
struct Format {
    FileSystem: String,
    FileSystemLabel: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    AllocationUnitSize: Option<u32>,
    Full: bool,
    Force: bool,
}

pub struct Storage {
    wmi: WMIConnection,
}

fn checked(what: &str, value: u32) -> Result<(), String> {
    match value {
        0 => Ok(()),
        code => Err(t!(
            L10N,
            "drive-storage-error",
            what = L10N.t(what),
            code = code.to_string()
        )),
    }
}

fn wmi_error(error: wmi::WMIError) -> String {
    error.to_string()
}

impl MSFT_Partition {
    pub fn guid(&self) -> Option<String> {
        self.Guid.as_deref().map(luft_meet::handoff::partition_guid)
    }

    pub fn volume_path(&self) -> Option<PathBuf> {
        self.AccessPaths
            .iter()
            .flatten()
            .find(|path| path.starts_with(r"\\?\Volume{"))
            .map(PathBuf::from)
    }

    pub fn span(&self) -> Span {
        Span {
            offset: self.Offset,
            size: self.Size,
        }
    }

    pub fn is_type(&self, kind: &str) -> bool {
        self.GptType
            .as_deref()
            .is_some_and(|own| own.eq_ignore_ascii_case(kind))
    }
}

pub struct Layout {
    pub disk: MSFT_Disk,
    pub partitions: Vec<MSFT_Partition>,
    pub windows: MSFT_Partition,
}

impl Layout {
    pub fn gpt(&self) -> bool {
        self.disk.PartitionStyle == GPT
    }

    pub fn plan_disk(&self) -> Disk {
        Disk {
            size: self.disk.Size,
            partitions: self.partitions.iter().map(MSFT_Partition::span).collect(),
        }
    }

    pub fn esp_size(&self, made: &[MSFT_Partition]) -> u64 {
        self.partitions
            .iter()
            .filter(|partition| partition.IsSystem || partition.is_type(ESP_TYPE))
            .filter(|partition| !made.iter().any(|ours| ours.Offset == partition.Offset))
            .map(|partition| partition.Size)
            .max()
            .unwrap_or(0)
    }
}

impl Storage {
    pub fn open() -> Result<Self, String> {
        Ok(Self {
            wmi: WMIConnection::with_namespace_path(r"ROOT\Microsoft\Windows\Storage")
                .map_err(wmi_error)?,
        })
    }

    fn partitions_of(&self, disk: u32) -> Result<Vec<MSFT_Partition>, String> {
        let mut partitions: Vec<MSFT_Partition> = self
            .wmi
            .raw_query(format!(
                "SELECT * FROM MSFT_Partition WHERE DiskNumber = {disk}"
            ))
            .map_err(wmi_error)?;
        partitions.sort_by_key(|partition| partition.Offset);
        Ok(partitions)
    }

    pub fn all_partitions(&self) -> Result<Vec<MSFT_Partition>, String> {
        self.wmi
            .raw_query("SELECT * FROM MSFT_Partition")
            .map_err(wmi_error)
    }

    pub fn layout(&self, windows_volume: &str) -> Result<Layout, String> {
        let windows = self
            .all_partitions()?
            .into_iter()
            .find(|partition| {
                partition
                    .AccessPaths
                    .iter()
                    .flatten()
                    .any(|path| path.eq_ignore_ascii_case(windows_volume))
            })
            .ok_or_else(|| t!(L10N, "drive-windows-partition-missing"))?;
        let disks: Vec<MSFT_Disk> = self
            .wmi
            .raw_query(format!(
                "SELECT * FROM MSFT_Disk WHERE Number = {}",
                windows.DiskNumber
            ))
            .map_err(wmi_error)?;
        let disk = disks
            .into_iter()
            .next()
            .ok_or_else(|| t!(L10N, "drive-windows-drive-missing"))?;
        Ok(Layout {
            partitions: self.partitions_of(disk.Number)?,
            disk,
            windows,
        })
    }

    pub fn volume(&self, path: &str) -> Result<MSFT_Volume, String> {
        let escaped = path.replace('\\', "\\\\");
        let volumes: Vec<MSFT_Volume> = self
            .wmi
            .raw_query(format!(
                "SELECT * FROM MSFT_Volume WHERE Path = '{escaped}'"
            ))
            .map_err(wmi_error)?;
        volumes
            .into_iter()
            .next()
            .ok_or_else(|| t!(L10N, "drive-volume-missing", path = path))
    }

    pub fn windows_plan(&self, layout: &Layout, windows_volume: &str) -> Result<Windows, String> {
        let volume = self.volume(windows_volume)?;
        let supported: SupportedSize = self
            .wmi
            .exec_instance_method::<MSFT_Partition, _>(
                &layout.windows.__Path,
                "GetSupportedSize",
                (),
            )
            .map_err(wmi_error)?;
        checked("drive-shrink-size-unknown", supported.ReturnValue)?;
        Ok(Windows {
            partition: layout.windows.span(),
            used: volume.Size.saturating_sub(volume.SizeRemaining),
            supported_min: supported.SizeMin,
        })
    }

    pub fn resize(&self, partition: &MSFT_Partition, size: u64) -> Result<(), String> {
        let returned: Returned = self
            .wmi
            .exec_instance_method::<MSFT_Partition, _>(
                &partition.__Path,
                "Resize",
                Resize { Size: size },
            )
            .map_err(wmi_error)?;
        checked("drive-resize-failed", returned.ReturnValue)
    }

    pub fn create(
        &self,
        layout: &Layout,
        span: Span,
        kind: &str,
    ) -> Result<MSFT_Partition, String> {
        let returned: Returned = self
            .wmi
            .exec_instance_method::<MSFT_Disk, _>(
                &layout.disk.__Path,
                "CreatePartition",
                CreatePartition {
                    Size: span.size,
                    Offset: span.offset,
                    GptType: kind.to_owned(),
                    AssignDriveLetter: false,
                },
            )
            .map_err(wmi_error)?;
        checked("drive-create-failed", returned.ReturnValue)?;
        let created = self
            .partitions_of(layout.disk.Number)?
            .into_iter()
            .find(|partition| partition.Offset == span.offset)
            .ok_or_else(|| t!(L10N, "drive-new-partition-missing"))?;
        if kind != ESP_TYPE
            && let Err(error) = self.hide(&created)
        {
            self.delete(&created)?;
            return Err(error);
        }
        self.refreshed(&created)
    }

    fn hide(&self, partition: &MSFT_Partition) -> Result<(), String> {
        let returned: Returned = self
            .wmi
            .exec_instance_method::<MSFT_Partition, _>(
                &partition.__Path,
                "SetAttributes",
                Attributes {
                    NoDefaultDriveLetter: true,
                },
            )
            .map_err(wmi_error)?;
        checked("drive-hide-failed", returned.ReturnValue)
    }

    pub fn refreshed(&self, partition: &MSFT_Partition) -> Result<MSFT_Partition, String> {
        self.partitions_of(partition.DiskNumber)?
            .into_iter()
            .find(|candidate| candidate.Offset == partition.Offset)
            .ok_or_else(|| t!(L10N, "drive-partition-gone"))
    }

    pub fn format(
        &self,
        partition: &MSFT_Partition,
        file_system: &str,
        label: &str,
        cluster: Option<u32>,
    ) -> Result<PathBuf, String> {
        let path = partition
            .volume_path()
            .ok_or_else(|| t!(L10N, "drive-new-partition-no-volume"))?;
        let volume = self.volume(&path.to_string_lossy())?;
        let returned: Returned = self
            .wmi
            .exec_instance_method::<MSFT_Volume, _>(
                &volume.__Path,
                "Format",
                Format {
                    FileSystem: file_system.to_owned(),
                    FileSystemLabel: label.to_owned(),
                    AllocationUnitSize: cluster,
                    Full: false,
                    Force: true,
                },
            )
            .map_err(wmi_error)?;
        checked("drive-format-failed", returned.ReturnValue)?;
        BitLocker::open()?.keep_readable(&path)?;
        Ok(path)
    }

    pub fn delete(&self, partition: &MSFT_Partition) -> Result<(), String> {
        let returned: Returned = self
            .wmi
            .exec_instance_method::<MSFT_Partition, _>(&partition.__Path, "DeleteObject", ())
            .map_err(wmi_error)?;
        checked("drive-remove-failed", returned.ReturnValue)
    }

    pub fn largest_windows(&self, partition: &MSFT_Partition) -> Result<u64, String> {
        #[derive(Deserialize)]
        struct Supported {
            ReturnValue: u32,
            SizeMax: u64,
        }
        let supported: Supported = self
            .wmi
            .exec_instance_method::<MSFT_Partition, _>(&partition.__Path, "GetSupportedSize", ())
            .map_err(wmi_error)?;
        checked("drive-grow-size-unknown", supported.ReturnValue)?;
        Ok(supported.SizeMax)
    }
}
