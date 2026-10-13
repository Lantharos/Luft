use anyhow::Result;
use nt_hive::{Hive, KeyValue};

pub(super) struct Registry<'a> {
    hive: Hive<&'a [u8]>,
}

impl<'a> Registry<'a> {
    pub(super) fn new(bytes: &'a [u8]) -> Result<Self> {
        let hive = Hive::without_validation(bytes)?;
        Ok(Self { hive })
    }

    pub(super) fn string(&self, path: &str, name: &str) -> Result<Option<String>> {
        let Some(value) = self.value(path, name)? else {
            return Ok(None);
        };
        let units: Vec<u16> = value
            .data()?
            .into_vec()?
            .as_chunks::<2>()
            .0
            .iter()
            .map(|unit| u16::from_le_bytes(*unit))
            .take_while(|unit| *unit != 0)
            .collect();
        Ok(Some(String::from_utf16_lossy(&units)))
    }

    pub(super) fn dword(&self, path: &str, name: &str) -> Result<Option<u32>> {
        let Some(value) = self.value(path, name)? else {
            return Ok(None);
        };
        Ok(Some(value.dword_data()?))
    }

    fn value(&self, path: &str, name: &str) -> Result<Option<KeyValue<'_, &'a [u8]>>> {
        let Some(key) = self.hive.root_key_node()?.subpath(path).transpose()? else {
            return Ok(None);
        };
        Ok(key.value(name).transpose()?)
    }
}
