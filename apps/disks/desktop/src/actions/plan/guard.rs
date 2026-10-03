use crate::udisks;
use crate::udisks::snapshot::{self, Drive};
use crate::udisks::volumes::{Segment, Volume};

pub struct Guard {
    pub offset: u64,
    pub size: u64,
    pub system: bool,
    name: String,
    logical: bool,
    encrypted: bool,
}

fn writable(drive: &Drive) -> Result<(), String> {
    if drive.read_only {
        return Err(format!("{} can only be read", drive.name));
    }
    Ok(())
}

fn display_name(volume: &Volume) -> String {
    let inner = volume
        .encryption
        .as_ref()
        .and_then(|encryption| encryption.cleartext.as_deref());
    [
        volume.label.as_str(),
        inner.map_or("", |inner| inner.label.as_str()),
    ]
    .into_iter()
    .find(|label| !label.is_empty())
    .unwrap_or(volume.device.as_str())
    .to_owned()
}

impl Guard {
    pub fn table(table: &str) -> Result<(), String> {
        let snapshot = snapshot::build(&udisks::objects()?);
        let drive = snapshot
            .drives
            .iter()
            .find(|drive| drive.block == table)
            .ok_or("This drive is gone")?;
        writable(drive)
    }

    pub fn volume(block: &str) -> Result<Self, String> {
        let snapshot = snapshot::build(&udisks::objects()?);
        let (drive, volume) = snapshot
            .drives
            .iter()
            .find_map(|drive| {
                drive.segments.iter().find_map(|segment| match segment {
                    Segment::Volume(volume) if volume.block == block => Some((drive, volume)),
                    _ => None,
                })
            })
            .ok_or("This partition is gone")?;
        writable(drive)?;
        Ok(Self {
            offset: volume.offset,
            size: volume.size,
            system: volume.in_use_by_system(),
            name: display_name(volume),
            logical: volume.logical,
            encrypted: volume.encryption.is_some(),
        })
    }

    pub fn changeable(&self) -> Result<(), String> {
        if self.system {
            return Err(format!(
                "The running system uses “{}”, so it can't be changed while it runs",
                self.name
            ));
        }
        Ok(())
    }

    pub fn movable(&self) -> Result<(), String> {
        self.changeable()?;
        if self.logical {
            return Err(format!(
                "“{}” sits inside an extended partition, so it can't be moved",
                self.name
            ));
        }
        Ok(())
    }

    pub fn resizable(&self) -> Result<(), String> {
        if self.logical {
            return Err(format!(
                "“{}” sits inside an extended partition, so it can't be resized",
                self.name
            ));
        }
        if self.encrypted {
            return Err(format!(
                "“{}” is encrypted, so it can't be resized",
                self.name
            ));
        }
        Ok(())
    }
}
