use std::path::{Path, PathBuf};

use luft_meet::FolderKind;
use windows::Win32::Foundation::{HANDLE, HLOCAL, LocalFree};
use windows::Win32::Security::Authentication::Identity::{GetUserNameExW, NameDisplay};
use windows::Win32::Security::Authorization::ConvertSidToStringSidW;
use windows::Win32::Security::{GetTokenInformation, TOKEN_QUERY, TOKEN_USER, TokenUser};
use windows::Win32::System::Com::CoTaskMemFree;
use windows::Win32::System::Registry::{HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE};
use windows::Win32::System::Threading::{GetCurrentProcess, OpenProcessToken};
use windows::Win32::System::WindowsProgramming::GetUserNameW;
use windows::Win32::UI::Shell::{
    FOLDERID_Desktop, FOLDERID_Documents, FOLDERID_Downloads, FOLDERID_Music, FOLDERID_Pictures,
    FOLDERID_Videos, KF_FLAG_DEFAULT, SHGetKnownFolderPath,
};
use windows::core::{GUID, PWSTR};

use super::folders::{Item, walk};
use super::registry::string;
use crate::protocol::ChosenAccount;
use crate::protocol::answers::{Belongings, FoundFolder};

const PICTURES: &str = r"SOFTWARE\Microsoft\Windows\CurrentVersion\AccountPicture\Users";

pub(super) fn known(kind: FolderKind) -> Option<PathBuf> {
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

fn measure(kind: FolderKind) -> Option<FoundFolder> {
    let path = known(kind)?;
    let mut items: Vec<Item> = Vec::new();
    walk(&path, "", &mut items);
    if items.is_empty() {
        return None;
    }
    Some(FoundFolder {
        kind,
        path: path.to_string_lossy().into_owned(),
        files: items.len() as u64,
        bytes: items.iter().map(|item| item.size).sum(),
    })
}

pub fn gather() -> Belongings {
    let folders = std::thread::scope(|scope| {
        let measuring: Vec<_> = FolderKind::ALL
            .map(|kind| scope.spawn(move || measure(kind)))
            .into();
        measuring
            .into_iter()
            .filter_map(|thread| thread.join().ok().flatten())
            .collect()
    });
    Belongings {
        folders,
        wallpaper: wallpaper(),
        account: account(),
    }
}
