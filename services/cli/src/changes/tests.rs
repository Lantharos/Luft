use serde_json::json;

use super::Request;

fn reviewed(request: &Request) -> bool {
    request
        .changes
        .iter()
        .any(|change| change.setting.reviewed())
}

fn arguments(pairs: &[&str]) -> Vec<String> {
    pairs.iter().map(|pair| (*pair).to_owned()).collect()
}

#[test]
fn a_set_with_a_system_setting_is_reviewed_as_a_whole() {
    let request = Request::from_arguments(
        &arguments(&["appearance.style=dark", "security.developer-tools=on"]),
        false,
    )
    .unwrap();
    assert!(reviewed(&request));
    assert_eq!(request.changes[0].value, json!("dark"));
    assert_eq!(request.changes[1].value, json!(true));
    assert!(!reviewed(
        &Request::from_arguments(&arguments(&["appearance.style=light"]), false).unwrap()
    ));
}

#[test]
fn takes_settings_by_the_names_settings_shows() {
    let request = Request::from_arguments(&arguments(&["Release channel=Nightly"]), false).unwrap();
    assert_eq!(request.changes[0].setting.id, "updates.channel");
    assert_eq!(request.changes[0].value, json!("nightly"));
}

#[test]
fn refuses_the_whole_set_for_one_bad_change() {
    for bad in [
        &["appearance.style=dark", "updates.channel=beta"][..],
        &["appearance.style=dark", "online.accounts=on"],
        &["appearance.style=dark", "appearance.style=light"],
        &["appearance.style"],
        &[],
    ] {
        assert!(
            Request::from_arguments(&arguments(bad), false).is_err(),
            "{bad:?}"
        );
    }
}

#[test]
fn developer_switches_are_only_for_luft_developer() {
    assert!(
        Request::from_arguments(&arguments(&["developer.log-direct-scanout=on"]), false).is_err()
    );
    assert!(reviewed(
        &Request::from_object(&json!({ "security.developer-tools": "on" })).unwrap()
    ));
    assert!(Request::from_object(&json!(["security.developer-tools"])).is_err());
}
