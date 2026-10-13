use super::*;

fn status(fixture: &str) -> Status {
    let deployments = Deployment::parse(serde_json::from_str(fixture).unwrap()).unwrap();
    Deployments(deployments).status().unwrap()
}

fn first() -> Release {
    Release {
        version: Some("45.1".into()),
        notes: Some("Faster startup and a fresher look.".into()),
        released: Some(1_791_925_321),
    }
}

fn second() -> Release {
    Release {
        version: Some("45.2".into()),
        notes: Some(
            "Wi-Fi reconnects faster after sleep, and Settings shows what's new in each update."
                .into(),
        ),
        released: Some(1_791_925_454),
    }
}

fn nothing_else(current: Release) -> Status {
    Status {
        current,
        staged: None,
        previous: None,
        returning: None,
        layered: Vec::new(),
        installing: Vec::new(),
        removing: Vec::new(),
    }
}

#[test]
fn a_fresh_install_has_only_its_own_version() {
    let installed = status(include_str!("fixtures/installed.json"));
    assert_eq!(
        installed,
        nothing_else(Release {
            released: Some(1_791_924_427),
            ..first()
        })
    );
}

#[test]
fn a_downloaded_update_waits_with_the_packages_added_meanwhile() {
    assert_eq!(
        status(include_str!("fixtures/installing.json")),
        Status {
            staged: Some(second()),
            installing: vec!["htop".into()],
            ..nothing_else(first())
        }
    );
}

#[test]
fn after_updating_the_last_version_is_kept_to_go_back_to() {
    assert_eq!(
        status(include_str!("fixtures/updated.json")),
        Status {
            previous: Some(first()),
            layered: vec!["htop".into()],
            ..nothing_else(second())
        }
    );
}

#[test]
fn going_back_waits_for_a_restart() {
    assert_eq!(
        status(include_str!("fixtures/returning.json")),
        Status {
            returning: Some(first()),
            layered: vec!["htop".into()],
            ..nothing_else(second())
        }
    );
}
