//! Resolve which logo to show: OEM/firmware asset → Linux logo fallback.

use sushi::{LogoSource, SushiVisualState};
use sushi::{probe_oem_asset, LINUX_LOGO_NATIVE};

/// Apply logo priority (OEM/firmware asset → Linux fallback) unless EFI already handed off a concrete asset.
pub fn resolve_logo(state: &mut SushiVisualState) {
    if let Some(path) = state.logo.path.as_deref() {
        if std::path::Path::new(path).exists()
            && matches!(
                state.logo.source,
                LogoSource::Firmware | LogoSource::OemAsset
            )
            && state.logo.native_width > 0
            && state.logo.native_height > 0
        {
            state.apply_layout();
            return;
        }
    }

    if let Some((path, native_w, native_h)) = probe_oem_asset() {
        state.logo.source = LogoSource::OemAsset;
        state.logo.path = Some(path);
        state.logo.native_width = native_w;
        state.logo.native_height = native_h;
        state.apply_layout();
        return;
    }

    state.logo.source = LogoSource::Distro;
    state.logo.path = None;
    state.logo.native_width = LINUX_LOGO_NATIVE.0;
    state.logo.native_height = LINUX_LOGO_NATIVE.1;
    state.apply_layout();
}