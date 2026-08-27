use super::*;

impl Dispatch<ZwlrOutputConfigurationHeadV1, ConfigurationHeadData> for KestrelState {
    fn request(
        state: &mut Self,
        _: &Client,
        resource: &ZwlrOutputConfigurationHeadV1,
        request: zwlr_output_configuration_head_v1::Request,
        data: &ConfigurationHeadData,
        display: &DisplayHandle,
        _: &mut DataInit<'_, Self>,
    ) {
        let Some(configuration) = data.configuration.data::<ConfigurationData>() else {
            return;
        };
        if *configuration.used.lock().unwrap() {
            display.post_error(
                &data.configuration,
                zwlr_output_configuration_v1::Error::AlreadyUsed as u32,
                "output configuration has already been used".into(),
            );
            return;
        }
        let mut heads = configuration.heads.lock().unwrap();
        let Some(head) = heads.get_mut(&data.name) else {
            return;
        };
        match request {
            zwlr_output_configuration_head_v1::Request::SetMode { mode } => {
                if !mark_property(display, resource, &mut head.set, HeadProperties::MODE) {
                    return;
                }
                let Some(mode) = mode.data::<ModeData>() else {
                    return;
                };
                if mode.head_name != data.name {
                    display.post_error(
                        resource,
                        zwlr_output_configuration_head_v1::Error::InvalidMode as u32,
                        "mode belongs to another output".into(),
                    );
                    return;
                }
                head.width = mode.mode.size.w;
                head.height = mode.mode.size.h;
                head.refresh_millihertz = mode.mode.refresh_millihertz;
            }
            zwlr_output_configuration_head_v1::Request::SetCustomMode {
                width,
                height,
                refresh,
            } => {
                if !mark_property(display, resource, &mut head.set, HeadProperties::MODE) {
                    return;
                }
                let valid = state.outputs.managed(&data.name).is_some_and(|output| {
                    output.descriptor.modes.iter().any(|mode| {
                        mode.size.w == width
                            && mode.size.h == height
                            && (refresh == 0 || mode.refresh_millihertz == refresh)
                    })
                });
                if !valid {
                    display.post_error(
                        resource,
                        zwlr_output_configuration_head_v1::Error::InvalidCustomMode as u32,
                        "custom mode is not supported by this output".into(),
                    );
                    return;
                }
                head.width = width;
                head.height = height;
                if refresh > 0 {
                    head.refresh_millihertz = refresh;
                }
            }
            zwlr_output_configuration_head_v1::Request::SetPosition { x, y } => {
                if !mark_property(display, resource, &mut head.set, HeadProperties::POSITION) {
                    return;
                }
                head.x = x;
                head.y = y;
            }
            zwlr_output_configuration_head_v1::Request::SetTransform { transform } => {
                if !mark_property(display, resource, &mut head.set, HeadProperties::TRANSFORM) {
                    return;
                }
                let WEnum::Value(transform) = transform else {
                    display.post_error(
                        resource,
                        zwlr_output_configuration_head_v1::Error::InvalidTransform as u32,
                        "invalid output transform".into(),
                    );
                    return;
                };
                let Some(transform) = transform_from_wl(transform) else {
                    display.post_error(
                        resource,
                        zwlr_output_configuration_head_v1::Error::InvalidTransform as u32,
                        "invalid output transform".into(),
                    );
                    return;
                };
                head.transform = transform;
            }
            zwlr_output_configuration_head_v1::Request::SetScale { scale } => {
                if !mark_property(display, resource, &mut head.set, HeadProperties::SCALE) {
                    return;
                }
                if !(0.5..=4.0).contains(&scale) {
                    display.post_error(
                        resource,
                        zwlr_output_configuration_head_v1::Error::InvalidScale as u32,
                        "output scale must be between 0.5 and 4".into(),
                    );
                    return;
                }
                head.scale = scale;
            }
            zwlr_output_configuration_head_v1::Request::SetAdaptiveSync {
                state: adaptive_sync,
            } => {
                if !mark_property(
                    display,
                    resource,
                    &mut head.set,
                    HeadProperties::ADAPTIVE_SYNC,
                ) {
                    return;
                }
                match adaptive_sync {
                    WEnum::Value(zwlr_output_head_v1::AdaptiveSyncState::Enabled) => {
                        head.adaptive_sync = true
                    }
                    WEnum::Value(zwlr_output_head_v1::AdaptiveSyncState::Disabled) => {
                        head.adaptive_sync = false
                    }
                    _ => {
                        display.post_error(
                            resource,
                            zwlr_output_configuration_head_v1::Error::InvalidAdaptiveSyncState
                                as u32,
                            "invalid adaptive sync state".into(),
                        );
                    }
                }
            }
            _ => {}
        }
    }
}

fn mark_property(
    display: &DisplayHandle,
    resource: &ZwlrOutputConfigurationHeadV1,
    properties: &mut HeadProperties,
    property: HeadProperties,
) -> bool {
    if properties.contains(property) {
        display.post_error(
            resource,
            zwlr_output_configuration_head_v1::Error::AlreadySet as u32,
            "output property was set twice".into(),
        );
        false
    } else {
        properties.insert(property);
        true
    }
}
