use luft_config::InputConfig;
use smithay::input::keyboard::XkbConfig;

pub fn keyboard(config: &InputConfig) -> XkbConfig<'_> {
    XkbConfig {
        layout: &config.keyboard_layout,
        variant: &config.keyboard_variant,
        options: (!config.keyboard_options.is_empty()).then(|| config.keyboard_options.clone()),
        ..XkbConfig::default()
    }
}

#[cfg(feature = "session-backend")]
pub fn device(device: &mut smithay::reexports::input::Device, config: &InputConfig) {
    let mut results = Vec::new();
    if device.config_tap_finger_count() > 0 {
        results.push(device.config_tap_set_enabled(config.tap_to_click));
    }
    if device.config_scroll_has_natural_scroll() {
        results.push(device.config_scroll_set_natural_scroll_enabled(config.natural_scroll));
    }
    if device.config_dwt_is_available() {
        results.push(device.config_dwt_set_enabled(config.disable_while_typing));
    }
    if device.config_accel_is_available() {
        results.push(device.config_accel_set_speed(config.pointer_acceleration));
    }
    for result in results {
        if let Err(error) = result {
            tracing::warn!(?error, "input device rejected configuration");
        }
    }
}
