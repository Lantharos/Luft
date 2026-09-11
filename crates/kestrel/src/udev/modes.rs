use super::*;

pub(super) fn select_mode(
    connector: &connector::Info,
    configured: Option<&luft_config::OutputConfig>,
) -> Result<smithay::reexports::drm::control::Mode, String> {
    let requested = configured.filter(|config| {
        config.width.is_some() || config.height.is_some() || config.refresh_millihertz.is_some()
    });
    let native_size = connector
        .modes()
        .iter()
        .filter(|mode| mode.mode_type().contains(ModeTypeFlags::PREFERRED))
        .max_by_key(|mode| u64::from(mode.size().0) * u64::from(mode.size().1))
        .map(|mode| mode.size());
    connector
        .modes()
        .iter()
        .copied()
        .filter(|mode| {
            let wl_mode = WlMode::from(*mode);
            if let Some(config) = requested {
                config.width.is_none_or(|width| width == wl_mode.size.w)
                    && config.height.is_none_or(|height| height == wl_mode.size.h)
                    && config
                        .refresh_millihertz
                        .is_none_or(|refresh| refresh == wl_mode.refresh)
            } else {
                native_size.is_none_or(|size| size == mode.size())
            }
        })
        .max_by_key(|mode| {
            let mode = WlMode::from(*mode);
            (
                i64::from(mode.size.w) * i64::from(mode.size.h),
                mode.refresh,
            )
        })
        .ok_or_else(|| {
            format!(
                "no matching mode for {}-{}",
                connector.interface().as_str(),
                connector.interface_id()
            )
        })
}
