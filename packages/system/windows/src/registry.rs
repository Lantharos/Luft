use anyhow::Result;
use nt_hive::{Hive, KeyNode, KeyValue, KeyValueDataType};

pub struct Registry<'a> {
    hive: Hive<&'a [u8]>,
}

pub enum Data {
    Binary(Vec<u8>),
    Other,
}

impl<'a> Registry<'a> {
    pub fn new(bytes: &'a [u8]) -> Result<Self> {
        let hive = Hive::without_validation(bytes)?;
        Ok(Self { hive })
    }

    pub fn string(&self, path: &str, name: &str) -> Result<Option<String>> {
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

    pub fn dword(&self, path: &str, name: &str) -> Result<Option<u32>> {
        let Some(value) = self.value(path, name)? else {
            return Ok(None);
        };
        Ok(Some(value.dword_data()?))
    }

    pub fn qword(&self, path: &str, name: &str) -> Result<Option<u64>> {
        let Some(value) = self.value(path, name)? else {
            return Ok(None);
        };
        Ok(Some(value.qword_data()?))
    }

    pub fn binary(&self, path: &str, name: &str) -> Result<Option<Vec<u8>>> {
        let Some(value) = self.value(path, name)? else {
            return Ok(None);
        };
        Ok(Some(value.data()?.into_vec()?))
    }

    pub fn subkeys(&self, path: &str) -> Result<Vec<String>> {
        let Some(key) = self.key(path)? else {
            return Ok(Vec::new());
        };
        let Some(subkeys) = key.subkeys().transpose()? else {
            return Ok(Vec::new());
        };
        subkeys
            .map(|subkey| Ok(subkey?.name()?.to_string_lossy()))
            .collect()
    }

    pub fn values(&self, path: &str) -> Result<Vec<(String, Data)>> {
        let Some(key) = self.key(path)? else {
            return Ok(Vec::new());
        };
        let Some(values) = key.values().transpose()? else {
            return Ok(Vec::new());
        };
        values
            .map(|value| {
                let value = value?;
                let data = match value.data_type()? {
                    KeyValueDataType::RegBinary => Data::Binary(value.data()?.into_vec()?),
                    _ => Data::Other,
                };
                Ok((value.name()?.to_string_lossy(), data))
            })
            .collect()
    }

    fn key(&self, path: &str) -> Result<Option<KeyNode<'_, &'a [u8]>>> {
        Ok(self.hive.root_key_node()?.subpath(path).transpose()?)
    }

    fn value(&self, path: &str, name: &str) -> Result<Option<KeyValue<'_, &'a [u8]>>> {
        let Some(key) = self.key(path)? else {
            return Ok(None);
        };
        Ok(key.value(name).transpose()?)
    }
}
