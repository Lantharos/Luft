use zbus::Variant;

use super::{Setting, Value};

#[test]
fn every_setting_is_known_by_its_name() {
    for setting in Setting::ALL {
        assert_eq!(Setting::named(setting.name()), Some(setting));
    }
    assert_eq!(Setting::named("accounts"), None);
}

#[test]
fn takes_only_values_settings_offers() {
    assert_eq!(
        Setting::DeveloperTools.check(&Variant::Bool(true)),
        Ok(Value::Switch(true))
    );
    assert!(Setting::DeveloperTools.check(&Variant::from("on")).is_err());
    assert_eq!(
        Setting::UpdateChannel.check(&Variant::from("nightly")),
        Ok(Value::Text("nightly".to_owned()))
    );
    assert!(
        Setting::UpdateChannel
            .check(&Variant::from("beta"))
            .is_err()
    );
    assert!(Setting::UpdateChannel.check(&Variant::Bool(true)).is_err());
    assert!(
        Setting::UpdateSchedule
            .check(&Variant::from("hourly"))
            .is_err()
    );
    assert!(Setting::TimeZone.check(&Variant::from("UTC")).is_ok());
    assert!(
        Setting::TimeZone
            .check(&Variant::from("../../etc/shadow"))
            .is_err()
    );
}

#[test]
fn says_what_a_change_does() {
    assert_eq!(
        Setting::UsbProtection.describe(&Value::Switch(false)),
        "stop holding back new USB devices while locked"
    );
    assert_eq!(
        Setting::UpdateChannel.describe(&Value::Text("nightly".to_owned())),
        "get nightly versions of Luft"
    );
}
