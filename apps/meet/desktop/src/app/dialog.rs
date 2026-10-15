use std::num::NonZeroIsize;

use raw_window_handle::{
    DisplayHandle, HandleError, HasDisplayHandle, HasWindowHandle, RawWindowHandle,
    Win32WindowHandle, WindowHandle,
};
use windows::Win32::Foundation::{HWND, LPARAM};
use windows::Win32::System::Threading::GetCurrentProcessId;
use windows::Win32::UI::WindowsAndMessaging::{
    EnumWindows, GW_OWNER, GetWindow, GetWindowThreadProcessId, IsWindowVisible,
};
use windows::core::BOOL;

struct Owner(NonZeroIsize);

impl HasWindowHandle for Owner {
    fn window_handle(&self) -> Result<WindowHandle<'_>, HandleError> {
        let raw = RawWindowHandle::Win32(Win32WindowHandle::new(self.0));
        Ok(unsafe { WindowHandle::borrow_raw(raw) })
    }
}

impl HasDisplayHandle for Owner {
    fn display_handle(&self) -> Result<DisplayHandle<'_>, HandleError> {
        Ok(DisplayHandle::windows())
    }
}

unsafe extern "system" fn visit(window: HWND, found: LPARAM) -> BOOL {
    let mut process = 0u32;
    unsafe { GetWindowThreadProcessId(window, Some(&mut process)) };
    let ours = process == unsafe { GetCurrentProcessId() }
        && unsafe { IsWindowVisible(window) }.as_bool()
        && unsafe { GetWindow(window, GW_OWNER) }.is_err();
    if ours {
        unsafe { *(found.0 as *mut isize) = window.0 as isize };
    }
    BOOL::from(!ours)
}

fn own_window() -> Option<Owner> {
    let mut found = 0isize;
    let _ = unsafe { EnumWindows(Some(visit), LPARAM(&mut found as *mut isize as isize)) };
    NonZeroIsize::new(found).map(Owner)
}

pub fn pick_iso() -> Option<String> {
    let mut dialog = rfd::FileDialog::new()
        .set_title("Choose a Luft ISO")
        .add_filter("Luft ISO", &["iso"]);
    if let Some(owner) = own_window() {
        dialog = dialog.set_parent(&owner);
    }
    dialog
        .pick_file()
        .map(|path| path.to_string_lossy().into_owned())
}
