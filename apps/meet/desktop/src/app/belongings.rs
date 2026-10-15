use std::path::{Path, PathBuf};

use luft_meet::FolderKind;
use luft_meet::moving_box::Regional;
use serde::Serialize;
use windows::Win32::Foundation::{HANDLE, HLOCAL, LocalFree};
use windows::Win32::Globalization::GetUserDefaultLocaleName;
use windows::Win32::Security::Authentication::Identity::{GetUserNameExW, NameDisplay};
use windows::Win32::Security::Authorization::ConvertSidToStringSidW;
use windows::Win32::Security::{GetTokenInformation, TOKEN_QUERY, TOKEN_USER, TokenUser};
use windows::Win32::System::Com::CoTaskMemFree;
use windows::Win32::System::Registry::{
    HKEY, HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE, RRF_RT_REG_SZ, RegGetValueW,
};
use windows::Win32::System::Threading::{GetCurrentProcess, OpenProcessToken};
use windows::Win32::System::Time::{DYNAMIC_TIME_ZONE_INFORMATION, GetDynamicTimeZoneInformation};
use windows::Win32::System::WindowsProgramming::GetUserNameW;
use windows::Win32::UI::Shell::{
    FOLDERID_Desktop, FOLDERID_Documents, FOLDERID_Downloads, FOLDERID_Music, FOLDERID_Pictures,
    FOLDERID_Videos, KF_FLAG_DEFAULT, SHGetKnownFolderPath,
};
use windows::core::{GUID, HSTRING, PWSTR};

use crate::folders::{Item, walk};
use crate::protocol::ChosenAccount;

const LOCALE_NAME_MAX_LENGTH: usize = 85;
const PICTURES: &str = r"SOFTWARE\Microsoft\Windows\CurrentVersion\AccountPicture\Users";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FoundFolder {
    kind: FolderKind,
    path: String,
    files: u64,
    bytes: u64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Gathered {
    folders: Vec<FoundFolder>,
    wallpaper: Option<String>,
    account: ChosenAccount,
    regional: Regional,
}

fn known(kind: FolderKind) -> Option<PathBuf> {
    let id: &GUID = match kind {
        FolderKind::Desktop => &FOLDERID_Desktop,
        FolderKind::Documents => &FOLDERID_Documents,
        FolderKind::Downloads => &FOLDERID_Downloads,
        FolderKind::Music => &FOLDERID_Music,
        FolderKind::Pictures => &FOLDERID_Pictures,
        FolderKind::Videos => &FOLDERID_Videos,
    };
    unsafe {
        let path = SHGetKnownFolderPath(id, KF_FLAG_DEFAULT, None).ok()?;
        let text = path.to_string().ok();
        CoTaskMemFree(Some(path.0.cast()));
        text.map(PathBuf::from)
    }
}

fn string(root: HKEY, key: &str, value: &str) -> Option<String> {
    let mut buffer = vec![0u16; 1024];
    let mut size = (buffer.len() * 2) as u32;
    unsafe {
        RegGetValueW(
            root,
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
    Some(String::from_utf16_lossy(&buffer[..end])).filter(|text| !text.is_empty())
}

fn existing(path: PathBuf) -> Option<String> {
    path.is_file().then(|| path.to_string_lossy().into_owned())
}

fn wallpaper() -> Option<String> {
    string(HKEY_CURRENT_USER, r"Control Panel\Desktop", "WallPaper")
        .and_then(|path| existing(PathBuf::from(path)))
        .or_else(|| {
            let roaming = std::env::var_os("APPDATA")?;
            existing(Path::new(&roaming).join(r"Microsoft\Windows\Themes\TranscodedWallpaper"))
        })
}

fn user_sid() -> Option<String> {
    unsafe {
        let mut token = HANDLE::default();
        OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &mut token).ok()?;
        let mut size = 0u32;
        let _ = GetTokenInformation(token, TokenUser, None, 0, &mut size);
        let mut buffer = vec![0u8; size as usize];
        GetTokenInformation(
            token,
            TokenUser,
            Some(buffer.as_mut_ptr().cast()),
            size,
            &mut size,
        )
        .ok()?;
        let user = &*(buffer.as_ptr() as *const TOKEN_USER);
        let mut text = PWSTR::null();
        ConvertSidToStringSidW(user.User.Sid, &mut text).ok()?;
        let sid = text.to_string().ok();
        let _ = LocalFree(Some(HLOCAL(text.0.cast())));
        sid
    }
}

fn picture() -> Option<String> {
    let key = format!(r"{PICTURES}\{}", user_sid()?);
    ["Image1080", "Image448", "Image240"]
        .into_iter()
        .find_map(|size| {
            string(HKEY_LOCAL_MACHINE, &key, size).and_then(|path| existing(PathBuf::from(path)))
        })
}

fn account() -> ChosenAccount {
    let mut buffer = vec![0u16; 256];
    let mut size = buffer.len() as u32;
    let user_name = unsafe { GetUserNameW(Some(PWSTR(buffer.as_mut_ptr())), &mut size) }
        .ok()
        .map(|()| String::from_utf16_lossy(&buffer[..size.saturating_sub(1) as usize]))
        .unwrap_or_default();
    let mut size = buffer.len() as u32;
    let full_name =
        unsafe { GetUserNameExW(NameDisplay, Some(PWSTR(buffer.as_mut_ptr())), &mut size) }
            .then(|| String::from_utf16_lossy(&buffer[..size as usize]))
            .filter(|name| !name.is_empty())
            .unwrap_or_else(|| user_name.clone());
    ChosenAccount {
        full_name,
        user_name,
        picture: picture(),
    }
}

fn regional() -> Regional {
    let mut zone = DYNAMIC_TIME_ZONE_INFORMATION::default();
    unsafe { GetDynamicTimeZoneInformation(&mut zone) };
    let end = zone
        .TimeZoneKeyName
        .iter()
        .position(|unit| *unit == 0)
        .unwrap_or(zone.TimeZoneKeyName.len());
    let time_zone = String::from_utf16_lossy(&zone.TimeZoneKeyName[..end]);
    let preload = string(HKEY_CURRENT_USER, r"Keyboard Layout\Preload", "1");
    let keyboard = preload.as_deref().map(|layout| {
        string(HKEY_CURRENT_USER, r"Keyboard Layout\Substitutes", layout)
            .unwrap_or_else(|| layout.to_owned())
    });
    let mut locale = [0u16; LOCALE_NAME_MAX_LENGTH];
    let length = unsafe { GetUserDefaultLocaleName(&mut locale) } as usize;
    Regional {
        time_zone: (!time_zone.is_empty()).then_some(time_zone),
        keyboard,
        locale: (length > 1).then(|| String::from_utf16_lossy(&locale[..length - 1])),
    }
}

fn measure(kind: FolderKind) -> Option<FoundFolder> {
    let path = known(kind)?;
    let mut items: Vec<Item> = Vec::new();
    walk(&path, "", &mut items);
    Some(FoundFolder {
        kind,
        path: path.to_string_lossy().into_owned(),
        files: items.len() as u64,
        bytes: items.iter().map(|item| item.size).sum(),
    })
}

pub fn gather() -> Gathered {
    let folders = std::thread::scope(|scope| {
        let measuring: Vec<_> = FolderKind::ALL
            .map(|kind| scope.spawn(move || measure(kind)))
            .into();
        measuring
            .into_iter()
            .filter_map(|thread| thread.join().ok().flatten())
            .collect()
    });
    Gathered {
        folders,
        wallpaper: wallpaper(),
        account: account(),
        regional: regional(),
    }
}
