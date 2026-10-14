use anyhow::Result;

use super::{Address, Key, Keys, LongTermKey, Pairing};
use crate::System;
use crate::registry::Data;

const PARAMETERS: &str = r"Services\BTHPORT\Parameters";
const LOW_ENERGY_DEVICES: &str = r"Enum\BTHLE";
const MITM: u32 = 0x04;
const RANDOM: u32 = 1;

pub fn pairings(system: &System) -> Result<Vec<Pairing>> {
    let Some(control_set) = system.control_set() else {
        return Ok(Vec::new());
    };
    let reader = Reader {
        system,
        control_set,
    };
    let keys = format!(r"{control_set}\{PARAMETERS}\Keys");
    let mut pairings = Vec::new();
    for adapter_name in system.registry().subkeys(&keys)? {
        let Some(adapter) = Address::from_hex(&adapter_name) else {
            continue;
        };
        let adapter_path = format!(r"{keys}\{adapter_name}");
        for (device, data) in system.registry().values(&adapter_path)? {
            if let (Some(device), Data::Binary(link_key)) = (Address::from_hex(&device), data)
                && let Ok(link_key) = Key::try_from(link_key.as_slice())
            {
                pairings.push(reader.pairing(adapter, device, Keys::Classic { link_key })?);
            }
        }
        for device_name in system.registry().subkeys(&adapter_path)? {
            let path = format!(r"{adapter_path}\{device_name}");
            if let Some((device, keys)) = reader.low_energy(&path, &device_name)? {
                pairings.push(reader.pairing(adapter, device, keys)?);
            }
        }
    }
    Ok(pairings)
}

struct Reader<'a, 'h> {
    system: &'a System<'h>,
    control_set: &'a str,
}

impl Reader<'_, '_> {
    fn pairing(&self, adapter: Address, device: Address, keys: Keys) -> Result<Pairing> {
        let hex = hex_name(device);
        let registry = self.system.registry();
        let known = format!(r"{}\{PARAMETERS}\Devices\{hex}", self.control_set);
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
        let registry = self.system.registry();
        let device = format!(r"{}\{LOW_ENERGY_DEVICES}\Dev_{hex}", self.control_set);
        for instance in registry.subkeys(&device)? {
            if let Some(name) = registry.string(&format!(r"{device}\{instance}"), "FriendlyName")? {
                return Ok(Some(name));
            }
        }
        Ok(None)
    }

    fn low_energy(&self, path: &str, name: &str) -> Result<Option<(Address, Keys)>> {
        let registry = self.system.registry();
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
    let name = String::from_utf8_lossy(&bytes[..end]).trim().to_owned();
    (!name.is_empty()).then_some(name)
}
