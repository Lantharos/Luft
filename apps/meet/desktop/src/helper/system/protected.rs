use std::fs::{self, File};
use std::io::{self, Read};
use std::os::windows::io::{AsRawHandle, FromRawHandle, OwnedHandle};
use std::path::{Path, PathBuf};

use windows::Win32::Foundation::{ERROR_ALREADY_EXISTS, ERROR_SUCCESS, HANDLE, HLOCAL, LocalFree};
use windows::Win32::Security::Authorization::{
    ConvertStringSecurityDescriptorToSecurityDescriptorW, GetSecurityInfo, SDDL_REVISION_1,
    SE_FILE_OBJECT, SetSecurityInfo,
};
use windows::Win32::Security::{
    ACL, DACL_SECURITY_INFORMATION, GetSecurityDescriptorDacl, GetSecurityDescriptorOwner,
    IsWellKnownSid, OWNER_SECURITY_INFORMATION, PROTECTED_DACL_SECURITY_INFORMATION,
    PSECURITY_DESCRIPTOR, PSID, SE_RESTORE_NAME, SE_TAKE_OWNERSHIP_NAME, SECURITY_ATTRIBUTES,
    WinBuiltinAdministratorsSid, WinLocalSystemSid,
};
use windows::Win32::Storage::FileSystem::{
    CreateDirectoryW, CreateFileW, FILE_ATTRIBUTE_DIRECTORY, FILE_ATTRIBUTE_REPARSE_POINT,
    FILE_FLAG_BACKUP_SEMANTICS, FILE_FLAG_OPEN_REPARSE_POINT, FILE_SHARE_DELETE, FILE_SHARE_READ,
    FILE_SHARE_WRITE, GetFileInformationByHandle, OPEN_EXISTING, READ_CONTROL, WRITE_DAC,
    WRITE_OWNER,
};
use windows::Win32::System::Com::CoTaskMemFree;
use windows::Win32::UI::Shell::{FOLDERID_ProgramData, KF_FLAG_DEFAULT, SHGetKnownFolderPath};
use windows::core::HSTRING;

use super::privilege;

const ADMINISTRATORS_ONLY: &str = "O:BAD:P(A;OICI;FA;;;SY)(A;OICI;FA;;;BA)";
const FOLDERS: [&str; 2] = ["Lantharos", "Meet Luft"];

struct Descriptor(PSECURITY_DESCRIPTOR);

impl Descriptor {
    fn administrators_only() -> Result<Self, String> {
        let mut descriptor = PSECURITY_DESCRIPTOR::default();
        unsafe {
            ConvertStringSecurityDescriptorToSecurityDescriptorW(
                &HSTRING::from(ADMINISTRATORS_ONLY),
                SDDL_REVISION_1,
                &mut descriptor,
                None,
            )
        }
        .map_err(|error| error.to_string())?;
        Ok(Self(descriptor))
    }

    fn owner(&self) -> Result<PSID, String> {
        let mut owner = PSID::default();
        let mut defaulted = false.into();
        unsafe { GetSecurityDescriptorOwner(self.0, &mut owner, &mut defaulted) }
            .map_err(|error| error.to_string())?;
        Ok(owner)
    }

    fn dacl(&self) -> Result<*const ACL, String> {
        let mut present = false.into();
        let mut dacl = std::ptr::null_mut();
        let mut defaulted = false.into();
        unsafe { GetSecurityDescriptorDacl(self.0, &mut present, &mut dacl, &mut defaulted) }
            .map_err(|error| error.to_string())?;
        Ok(dacl)
    }
}

impl Drop for Descriptor {
    fn drop(&mut self) {
        unsafe { LocalFree(Some(HLOCAL(self.0.0))) };
    }
}

fn program_data() -> Result<PathBuf, String> {
    let path = unsafe { SHGetKnownFolderPath(&FOLDERID_ProgramData, KF_FLAG_DEFAULT, None) }
        .map_err(|error| error.to_string())?;
    let folder = unsafe { path.to_string() }.map_err(|error| error.to_string());
    unsafe { CoTaskMemFree(Some(path.0.cast())) };
    Ok(PathBuf::from(folder?))
}

fn create(path: &Path, descriptor: &Descriptor) -> io::Result<bool> {
    let attributes = SECURITY_ATTRIBUTES {
        nLength: size_of::<SECURITY_ATTRIBUTES>() as u32,
        lpSecurityDescriptor: descriptor.0.0,
        bInheritHandle: false.into(),
    };
    match unsafe { CreateDirectoryW(&HSTRING::from(path), Some(&attributes)) } {
        Ok(()) => Ok(true),
        Err(error) if error.code() == ERROR_ALREADY_EXISTS.to_hresult() => Ok(false),
        Err(error) => Err(io::Error::other(error.message())),
    }
}

fn reclaim(path: &Path, descriptor: &Descriptor) -> Result<(), String> {
    let handle = unsafe {
        CreateFileW(
            &HSTRING::from(path),
            (READ_CONTROL | WRITE_DAC | WRITE_OWNER).0,
            FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
            None,
            OPEN_EXISTING,
            FILE_FLAG_BACKUP_SEMANTICS | FILE_FLAG_OPEN_REPARSE_POINT,
            None,
        )
    }
    .map_err(|error| format!("{}: {error}", path.display()))?;
    let owned = unsafe { OwnedHandle::from_raw_handle(handle.0) };
    let mut information = Default::default();
    unsafe { GetFileInformationByHandle(handle, &mut information) }
        .map_err(|error| error.to_string())?;
    let attributes = information.dwFileAttributes;
    if attributes & FILE_ATTRIBUTE_DIRECTORY.0 == 0
        || attributes & FILE_ATTRIBUTE_REPARSE_POINT.0 != 0
    {
        drop(owned);
        fs::remove_dir(path)
            .or_else(|_| fs::remove_file(path))
            .map_err(|error| format!("{}: {error}", path.display()))?;
        return match create(path, descriptor) {
            Ok(true) => Ok(()),
            Ok(false) => Err(format!("{} keeps coming back", path.display())),
            Err(error) => Err(error.to_string()),
        };
    }
    let result = unsafe {
        SetSecurityInfo(
            handle,
            SE_FILE_OBJECT,
            OWNER_SECURITY_INFORMATION
                | DACL_SECURITY_INFORMATION
                | PROTECTED_DACL_SECURITY_INFORMATION,
            Some(descriptor.owner()?),
            None,
            Some(descriptor.dacl()?),
            None,
        )
    };
    drop(owned);
    (result == ERROR_SUCCESS)
        .then_some(())
        .ok_or_else(|| format!("{}: {}", path.display(), result.to_hresult().message()))
}

pub fn folder() -> Result<PathBuf, String> {
    privilege::enable(SE_RESTORE_NAME)?;
    privilege::enable(SE_TAKE_OWNERSHIP_NAME)?;
    let descriptor = Descriptor::administrators_only()?;
    let mut path = program_data()?;
    for name in FOLDERS {
        path.push(name);
        if !create(&path, &descriptor).map_err(|error| error.to_string())? {
            reclaim(&path, &descriptor)?;
        }
    }
    Ok(path)
}

fn owned_by_administrators(file: &File) -> bool {
    let mut owner = PSID::default();
    let mut descriptor = PSECURITY_DESCRIPTOR::default();
    let result = unsafe {
        GetSecurityInfo(
            HANDLE(file.as_raw_handle()),
            SE_FILE_OBJECT,
            OWNER_SECURITY_INFORMATION,
            Some(&mut owner),
            None,
            None,
            None,
            Some(&mut descriptor),
        )
    };
    if result != ERROR_SUCCESS {
        return false;
    }
    let trusted = unsafe {
        IsWellKnownSid(owner, WinBuiltinAdministratorsSid).as_bool()
            || IsWellKnownSid(owner, WinLocalSystemSid).as_bool()
    };
    unsafe { LocalFree(Some(HLOCAL(descriptor.0))) };
    trusted
}

pub fn read(path: &Path) -> Option<String> {
    let mut file = File::open(path).ok()?;
    if !owned_by_administrators(&file) {
        drop(file);
        let _ = fs::remove_file(path);
        return None;
    }
    let mut text = String::new();
    file.read_to_string(&mut text).ok()?;
    Some(text)
}

pub struct Scratch(PathBuf);

impl Scratch {
    pub fn new(name: &str) -> Result<Self, String> {
        let path = folder()?.join(format!("{name}-{}", std::process::id()));
        match fs::remove_dir_all(&path) {
            Err(error) if error.kind() != io::ErrorKind::NotFound => {
                return Err(format!("{}: {error}", path.display()));
            }
            _ => {}
        }
        fs::create_dir(&path).map_err(|error| format!("{}: {error}", path.display()))?;
        Ok(Self(path))
    }

    pub fn path(&self) -> &Path {
        &self.0
    }
}

impl Drop for Scratch {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.0);
    }
}
