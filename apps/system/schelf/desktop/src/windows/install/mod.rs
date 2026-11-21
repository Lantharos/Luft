use luft_app::{Appearance, Backdrop, Commands};
use sabine::{
    SabineLifecyclePolicy, SabineWindow, SabineWindowControlAction, WindowRegion, WindowRegionRect,
};
use serde::{Deserialize, Serialize};
use specta::Type;

use super::Windows;

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

pub fn window(window: SabineWindow, title: &str, request: u32) -> SabineWindow {
    window
        .title(title)
        .fixed_size(SIZE.0, SIZE.1)
        .frameless()
        .glass()
        .backdrop(Backdrop::WINDOW.role, Backdrop::WINDOW.preference)
        .lifecycle_policy(SabineLifecyclePolicy::browser_tab())
        .blur_region(WindowRegion::rounded_rect(RADIUS))
        .input_region(WindowRegion::rounded_rect(RADIUS))
        .control_region(
            SabineWindowControlAction::Close,
            WindowRegionRect::new(-44, 12, 28, 28),
        )
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
    window.with_async("install_state", windows, state)
}
