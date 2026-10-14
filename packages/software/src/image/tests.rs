use super::*;

fn deployments(fixture: &str) -> Deployments {
    Deployments(Host::parse(fixture).unwrap())
}

fn first() -> Release {
    Release {
        version: Some("45.1".into()),
        notes: Some("Faster startup and a fresher look.".into()),
        released: Some(1_791_987_953),
    }
}

fn second() -> Release {
    Release {
        version: Some("45.2".into()),
        notes: Some(
            "Wi-Fi reconnects faster after sleep.\nSettings shows what's new in each update."
                .into(),
        ),
        released: Some(1_791_988_620),
    }
}

fn only(current: Release) -> Status {
    Status {
        current,
        staged: None,
        previous: None,
        returning: None,
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
