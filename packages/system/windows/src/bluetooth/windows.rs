use anyhow::Result;

use super::{Address, Key, Keys, LongTermKey, Pairing};
use crate::System;
use crate::registry::{Data, Registry};

const PARAMETERS: &str = r"Services\BTHPORT\Parameters";
const LOW_ENERGY_DEVICES: &str = r"Enum\BTHLE";
const MITM: u32 = 0x04;
const RANDOM: u32 = 1;
const LONGEST_NAME: usize = 248;

struct Place<'a, 'h> {
    registry: &'a Registry<'h>,
    path: String,
}

impl Place<'_, '_> {
    fn join(&self, below: &str) -> String {
        match (self.path.is_empty(), below.is_empty()) {
            (true, _) => below.to_owned(),
            (_, true) => self.path.clone(),
            _ => format!(r"{}\{below}", self.path),
        }
    }
}

pub fn pairings(system: &System) -> Result<Vec<Pairing>> {
    let Some(control_set) = system.control_set() else {
        return Ok(Vec::new());
    };
    let registry = system.registry();
    Reader {
        parameters: Place {
            registry,
            path: format!(r"{control_set}\{PARAMETERS}"),
        },
        low_energy: Some(Place {
            registry,
            path: format!(r"{control_set}\{LOW_ENERGY_DEVICES}"),
        }),
    }
    .pairings()
}

pub fn saved_pairings(parameters: &[u8], low_energy: Option<&[u8]>) -> Result<Vec<Pairing>> {
    let parameters = Registry::new(parameters)?;
    let low_energy = low_energy.map(Registry::new).transpose()?;
    Reader {
        parameters: Place {
            registry: &parameters,
            path: String::new(),
        },
        low_energy: low_energy.as_ref().map(|registry| Place {
            registry,
            path: String::new(),
        }),
    }
    .pairings()
}

struct Reader<'a, 'h> {
    parameters: Place<'a, 'h>,
    low_energy: Option<Place<'a, 'h>>,
}

impl Reader<'_, '_> {
    fn pairings(&self) -> Result<Vec<Pairing>> {
        let registry = self.parameters.registry;
        let keys = self.parameters.join("Keys");
        let mut pairings = Vec::new();
        for adapter_name in registry.subkeys(&keys)? {
            let Some(adapter) = Address::from_hex(&adapter_name) else {
                continue;
            };
            let adapter_path = format!(r"{keys}\{adapter_name}");
            for (device, data) in registry.values(&adapter_path)? {
                if let (Some(device), Data::Binary(link_key)) = (Address::from_hex(&device), data)
                    && let Ok(link_key) = Key::try_from(link_key.as_slice())
                {
                    pairings.push(self.pairing(adapter, device, Keys::Classic { link_key })?);
                }
            }
            for device_name in registry.subkeys(&adapter_path)? {
                let path = format!(r"{adapter_path}\{device_name}");
                if let Some((device, keys)) = self.low_energy(&path, &device_name)? {
                    pairings.push(self.pairing(adapter, device, keys)?);
                }
            }
        }
        Ok(pairings)
    }

    fn pairing(&self, adapter: Address, device: Address, keys: Keys) -> Result<Pairing> {
        let hex = hex_name(device);
        let registry = self.parameters.registry;
        let known = self.parameters.join(&format!(r"Devices\{hex}"));
        let name = match registry.binary(&known, "Name")? {
            Some(name) => utf8_name(&name),
            None => self.low_energy_name(&hex)?,
        };
        Ok(Pairing {
            adapter,
            device,
            name,
            class: registry.dword(&known, "COD")?,
            keys,
        })
    }

    fn low_energy_name(&self, hex: &str) -> Result<Option<String>> {
        let Some(place) = &self.low_energy else {
            return Ok(None);
        };
        let registry = place.registry;
        let device = place.join(&format!("Dev_{hex}"));
        for instance in registry.subkeys(&device)? {
            if let Some(name) = registry
                .string(&format!(r"{device}\{instance}"), "FriendlyName")?
                .and_then(|name| device_name(&name))
            {
                return Ok(Some(name));
            }
        }
        Ok(None)
    }

    fn low_energy(&self, path: &str, name: &str) -> Result<Option<(Address, Keys)>> {
        let registry = self.parameters.registry;
        let long_term_key = match registry.binary(path, "LTK")? {
            Some(key) => match Key::try_from(key.as_slice()) {
                Ok(key) => Some(LongTermKey {
                    key,
                    size: registry
                        .dword(path, "KeyLength")?
                        .map_or(16, |size| size.clamp(7, 16) as u8),
                    ediv: registry.dword(path, "EDIV")?.unwrap_or(0) as u16,
                    rand: registry.qword(path, "ERand")?.unwrap_or(0),
                    authenticated: registry.dword(path, "AuthReq")?.unwrap_or(0) & MITM != 0,
                }),
                Err(_) => None,
            },
            None => None,
        };
        let identity_key = registry
            .binary(path, "IRK")?
            .and_then(|key| Key::try_from(key.as_slice()).ok());
        if long_term_key.is_none() && identity_key.is_none() {
            return Ok(None);
        }
        let address = match registry.qword(path, "Address")? {
            Some(number) => Address::from_number(number),
            None => match Address::from_hex(name) {
                Some(address) => address,
                None => return Ok(None),
            },
        };
        Ok(Some((
            address,
            Keys::LowEnergy {
                random_address: registry.dword(path, "AddressType")? == Some(RANDOM),
                long_term_key,
                identity_key,
            },
        )))
    }
}

fn hex_name(address: Address) -> String {
    address.0.iter().map(|byte| format!("{byte:02x}")).collect()
}

fn utf8_name(bytes: &[u8]) -> Option<String> {
    let end = bytes
        .iter()
        .position(|byte| *byte == 0)
        .unwrap_or(bytes.len());
    device_name(&String::from_utf8_lossy(&bytes[..end]))
}

fn device_name(raw: &str) -> Option<String> {
    let mut name = String::new();
    for character in raw.chars().filter(|character| !character.is_control()) {
        if name.len() + character.len_utf8() > LONGEST_NAME {
            break;
        }
        name.push(character);
    }
    let name = name.trim();
    (!name.is_empty()).then(|| name.to_owned())
}
