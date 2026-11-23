mod dialog;

use luft_app::{Appearance, Backdrop, Commands};
use sabine::{SabineLifecyclePolicy, SabineWindow, WindowRegion};
use serde::{Deserialize, Serialize};
use specta::Type;

use super::Windows;

pub use dialog::Dialog;

const DESKTOP_ENTRY: &str = "com.lantharos.schelf.parcel";
const SIZE: (u32, u32) = (480, 380);
const RADIUS: i32 = 15;

#[derive(Deserialize, Type)]
struct Request {
    request: u32,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct InstallState {
    #[serde(flatten)]
    appearance: Appearance,
    path: String,
}

fn frame(window: SabineWindow, title: &str) -> SabineWindow {
    window
        .desktop_entry(DESKTOP_ENTRY)
        .title(title)
        .frameless()
        .lifecycle_policy(SabineLifecyclePolicy::browser_tab())
        .input_region(WindowRegion::rounded_rect(RADIUS))
}

pub fn window(window: SabineWindow, title: &str, request: u32) -> SabineWindow {
    frame(window, title)
        .fixed_size(SIZE.0, SIZE.1)
        .glass()
        .backdrop(Backdrop::WINDOW.role, Backdrop::WINDOW.preference)
        .blur_region(WindowRegion::rounded_rect(RADIUS))
        .content_suffix(format!("#install/{request}"))
}

async fn state(windows: Windows, Request { request }: Request) -> Result<InstallState, String> {
    let path = windows.installer(request)?;
    Ok(InstallState {
        appearance: Appearance::current().await,
        path,
    })
}

pub fn register(window: SabineWindow, windows: &Windows) -> SabineWindow {
    dialog::register(window.with_async("install_state", windows, state), windows)
}
