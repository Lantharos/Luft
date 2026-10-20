use std::path::Path;

use luft_i18n::t;
use windows::Win32::Foundation::ERROR_NO_MORE_ITEMS;
use windows::Win32::Security::SE_BACKUP_NAME;
use windows::Win32::System::Registry::{
    HKEY, HKEY_LOCAL_MACHINE, KEY_READ, KEY_SET_VALUE, REG_DWORD, REG_LATEST_FORMAT,
    REG_OPTION_BACKUP_RESTORE, RRF_RT_REG_DWORD, RRF_RT_REG_SZ, RegCloseKey, RegEnumKeyExW,
    RegEnumValueW, RegGetValueW, RegOpenKeyExW, RegSaveKeyExW, RegSetKeyValueW,
};
use windows::core::{HSTRING, PWSTR};

use super::privilege;
use crate::L10N;

const LONGEST_NAME: usize = 256;

pub fn dword(key: &str, value: &str) -> Option<u32> {
    let mut data = 0u32;
    let mut size = 4u32;
    unsafe {
        RegGetValueW(
            HKEY_LOCAL_MACHINE,
            &HSTRING::from(key),
            &HSTRING::from(value),
            RRF_RT_REG_DWORD,
            None,
            Some((&mut data as *mut u32).cast()),
            Some(&mut size),
        )
    }
    .ok()
    .ok()?;
    Some(data)
}

pub fn string(key: &str, value: &str) -> Option<String> {
    let mut buffer = vec![0u16; 512];
    let mut size = (buffer.len() * 2) as u32;
    unsafe {
        RegGetValueW(
            HKEY_LOCAL_MACHINE,
            &HSTRING::from(key),
            &HSTRING::from(value),
            RRF_RT_REG_SZ,
            None,
            Some(buffer.as_mut_ptr().cast()),
            Some(&mut size),
        )
    }
    .ok()
    .ok()?;
    let end = buffer
        .iter()
        .position(|unit| *unit == 0)
        .unwrap_or(buffer.len());
    Some(String::from_utf16_lossy(&buffer[..end]))
}

pub fn set_dword(key: &str, value: &str, data: u32) -> Result<(), String> {
    let mut opened = HKEY::default();
    unsafe {
        RegOpenKeyExW(
            HKEY_LOCAL_MACHINE,
            &HSTRING::from(key),
            None,
            KEY_SET_VALUE,
            &mut opened,
        )
    }
    .ok()
    .map_err(|error| {
        t!(
            L10N,
            "helper-registry-not-opened",
            key = key,
            error = error.to_string()
        )
    })?;
    let bytes = data.to_le_bytes();
    let written = unsafe {
        RegSetKeyValueW(
            opened,
            None,
            &HSTRING::from(value),
            REG_DWORD.0,
            Some(bytes.as_ptr().cast()),
            4,
        )
    };
    unsafe {
        let _ = RegCloseKey(opened);
    }
    written.ok().map_err(|error| {
        t!(
            L10N,
            "helper-registry-not-changed",
            value = value,
            error = error.to_string()
        )
    })
}

pub struct Protected(HKEY);

impl Drop for Protected {
    fn drop(&mut self) {
        unsafe {
            let _ = RegCloseKey(self.0);
        }
    }
}

impl Protected {
    pub fn open(key: &str) -> Option<Self> {
        privilege::enable(SE_BACKUP_NAME).ok()?;
        let mut opened = HKEY::default();
        unsafe {
            RegOpenKeyExW(
                HKEY_LOCAL_MACHINE,
                &HSTRING::from(key),
                Some(REG_OPTION_BACKUP_RESTORE.0),
                KEY_READ,
                &mut opened,
            )
        }
        .ok()
        .ok()?;
        Some(Self(opened))
    }

    pub fn child(&self, name: &str) -> Option<Self> {
        let mut opened = HKEY::default();
        unsafe {
            RegOpenKeyExW(
                self.0,
                &HSTRING::from(name),
                Some(REG_OPTION_BACKUP_RESTORE.0),
                KEY_READ,
                &mut opened,
            )
        }
        .ok()
        .ok()?;
        Some(Self(opened))
    }

    fn names(
        &self,
        next: impl Fn(u32, PWSTR, &mut u32) -> windows::Win32::Foundation::WIN32_ERROR,
    ) -> Vec<String> {
        let mut names = Vec::new();
        let mut buffer = [0u16; LONGEST_NAME];
        for index in 0.. {
            let mut length = buffer.len() as u32;
            let result = next(index, PWSTR(buffer.as_mut_ptr()), &mut length);
            if result == ERROR_NO_MORE_ITEMS || result.is_err() {
                break;
            }
            names.push(String::from_utf16_lossy(&buffer[..length as usize]));
        }
        names
    }

    pub fn subkeys(&self) -> Vec<String> {
        self.names(|index, name, length| unsafe {
            RegEnumKeyExW(self.0, index, Some(name), length, None, None, None, None)
        })
    }

    pub fn values(&self) -> Vec<String> {
        self.names(|index, name, length| unsafe {
            RegEnumValueW(self.0, index, Some(name), length, None, None, None, None)
        })
    }

    pub fn save(&self, file: &Path) -> Result<(), String> {
        let _ = std::fs::remove_file(file);
        unsafe {
            RegSaveKeyExW(
                self.0,
                &HSTRING::from(file.as_os_str()),
                None,
                REG_LATEST_FORMAT,
            )
        }
        .ok()
        .map_err(|error| {
            t!(
                L10N,
                "helper-registry-not-saved",
                file = file.display().to_string(),
                error = error.to_string()
            )
        })
    }
}
