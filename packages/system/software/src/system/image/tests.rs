use super::notes::{Area, Section};
use super::*;

fn section(area: Area, title: &str, change: &str) -> Section {
    Section {
        area,
        title: title.into(),
        changes: vec![change.into()],
    }
}

fn deployments(fixture: &str) -> Deployments {
    Deployments(Host::parse(fixture).unwrap())
}

fn first() -> Release {
    Release {
        version: Some("1.1".into()),
        notes: Some(vec![section(
            Area::Desktop,
            "Desktop",
            "Faster startup and a fresher look.",
        )]),
        released: Some(1_791_987_953),
    }
}

fn second() -> Release {
    Release {
        version: Some("1.2".into()),
        notes: Some(vec![
            section(
                Area::Apps,
                "Settings",
                "Settings shows what's new in each update.",
            ),
            section(
                Area::System,
                "System",
                "Wi-Fi reconnects faster after sleep.",
            ),
        ]),
        released: Some(1_791_988_620),
    }
}

fn only(current: Release) -> Status {
    Status {
        current,
        staged: None,
        previous: None,
        returning: None,
        switching: None,
    }
}

#[test]
fn a_fresh_install_has_only_its_own_version() {
    assert_eq!(
        deployments(include_str!("fixtures/installed.json")).status(),
        only(first())
    );
}

#[test]
fn a_downloaded_update_waits_for_a_restart() {
    assert_eq!(
        deployments(include_str!("fixtures/staged.json")).status(),
        Status {
            staged: Some(second()),
            ..only(first())
        }
    );
}

#[test]
fn a_switch_to_the_nvidia_image_waits_for_a_restart() {
    assert_eq!(
        deployments(include_str!("fixtures/switching.json")).status(),
        Status {
            staged: Some(second()),
            switching: Some(Variant::Nvidia),
            ..only(first())
        }
    );
}

#[test]
fn after_updating_the_last_version_is_kept_to_go_back_to() {
    assert_eq!(
        deployments(include_str!("fixtures/updated.json")).status(),
        Status {
            previous: Some(first()),
            ..only(second())
        }
    );
}

#[test]
fn going_back_waits_for_a_restart() {
    assert_eq!(
        deployments(include_str!("fixtures/returning.json")).status(),
        Status {
            returning: Some(first()),
            ..only(second())
        }
    );
}

#[test]
fn an_update_is_new_until_it_is_downloaded() {
    let staged = deployments(include_str!("fixtures/staged.json"));
    let update = Update {
        release: second(),
        size: 0,
        layers: staged.0.staged.as_ref().unwrap().layers().to_vec(),
    };
    assert!(deployments(include_str!("fixtures/installed.json")).lacks(&update));
    assert!(!staged.lacks(&update));
}

#[test]
fn the_version_luft_went_back_from_is_not_offered_again() {
    let returned = deployments(include_str!("fixtures/updated.json"));
    let update = Update {
        release: first(),
        size: 0,
        layers: returned.0.rollback.as_ref().unwrap().layers().to_vec(),
    };
    assert!(!returned.lacks(&update));
}
