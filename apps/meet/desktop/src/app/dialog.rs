use std::num::NonZeroIsize;

use luft_i18n::t;
use raw_window_handle::{
    DisplayHandle, HandleError, HasDisplayHandle, HasWindowHandle, RawWindowHandle,
    Win32WindowHandle, WindowHandle,
};
use windows::Win32::UI::WindowsAndMessaging::FindWindowW;
use windows::core::{HSTRING, PCWSTR};

use super::TITLE;
use crate::L10N;

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

fn meet_window() -> Option<Owner> {
    let window = unsafe { FindWindowW(PCWSTR::null(), &HSTRING::from(TITLE)) }.ok()?;
    NonZeroIsize::new(window.0 as isize).map(Owner)
}

pub fn pick_iso() -> Option<String> {
    let mut dialog = rfd::FileDialog::new()
        .set_title(t!(L10N, "iso-dialog-title"))
        .add_filter(t!(L10N, "iso-dialog-filter"), &["iso"]);
    if let Some(owner) = meet_window() {
        dialog = dialog.set_parent(&owner);
    }
    dialog
        .pick_file()
        .map(|path| path.to_string_lossy().into_owned())
}
