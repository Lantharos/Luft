use zbus::Variant;

use super::{Setting, Value};

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
