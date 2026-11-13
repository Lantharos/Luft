use super::*;

const PLATFORM_GL: &str = "org.freedesktop.Platform.GL";
const STEAM_GL32: &str = "org.freedesktop.Platform.GL32";
const VAAPI: &str = "org.freedesktop.Platform.VAAPI.nvidia";

fn named(id: &str, branch: &str) -> Ref {
    Ref {
        id: id.into(),
        arch: "x86_64".into(),
        branch: branch.into(),
    }
}

fn point(owner: &Ref, name: &str, branches: &[&str], condition: Condition) -> Point {
    Point {
        owner: owner.clone(),
        name: name.into(),
        branches: branches.iter().map(|branch| (*branch).into()).collect(),
        download_if: Some(condition),
        prune_unless: Some(condition),
    }
}

fn steam_on_its_platform() -> Vec<Point> {
    let platform = named("org.freedesktop.Platform", "26.08");
    let steam = named("com.valvesoftware.Steam", "stable");
    let gl = ["26.08", "26.08-extra", "1.4"];
    vec![
        point(&platform, PLATFORM_GL, &gl, Condition::ActiveGlDriver),
        point(&platform, VAAPI, &["26.08"], Condition::NvidiaModule),
        point(&steam, STEAM_GL32, &gl, Condition::ActiveGlDriver),
    ]
}

fn installed(ids: &[&str]) -> BTreeSet<Ref> {
    ids.iter().map(|id| named(id, "1.4")).collect()
}

fn ids(plan: &Plan) -> (Vec<&str>, Vec<&str>) {
    (
        plan.install
            .iter()
            .map(|wanted| wanted.id.as_str())
            .collect(),
        plan.remove.iter().map(|stale| stale.id.as_str()).collect(),
    )
}

#[test]
fn a_new_driver_brings_its_extensions_and_keeps_those_of_the_version_to_go_back_to() {
    let installed = installed(&[
        "org.freedesktop.Platform.GL.nvidia-610-10-01",
        "org.freedesktop.Platform.GL.nvidia-615-78-08",
        "org.freedesktop.Platform.GL32.nvidia-615-78-08",
    ]);
    let after_an_update = Drivers {
        running: Some(driver_name("620.70.06")),
        staged: Some(Graphics::Nvidia(Some("625.10.02".into()))),
        rollback: Some(Graphics::Nvidia(Some("615.78.08".into()))),
    };
    assert_eq!(
        ids(&plan(
            &steam_on_its_platform(),
            &installed,
            &after_an_update
        )),
        (
            vec![
                "org.freedesktop.Platform.GL.nvidia-620-70-06",
                "org.freedesktop.Platform.GL.nvidia-625-10-02",
                VAAPI,
                "org.freedesktop.Platform.GL32.nvidia-620-70-06",
                "org.freedesktop.Platform.GL32.nvidia-625-10-02",
            ],
            vec!["org.freedesktop.Platform.GL.nvidia-610-10-01"],
        )
    );
}

#[test]
fn extensions_stay_while_a_version_on_the_computer_might_need_them() {
    let installed = installed(&["org.freedesktop.Platform.GL.nvidia-615-78-08"]);
    let unlabelled_rollback = Drivers {
        running: Some(driver_name("620.70.06")),
        staged: None,
        rollback: Some(Graphics::Nvidia(None)),
    };
    let plan = plan(&steam_on_its_platform(), &installed, &unlabelled_rollback);
    assert!(plan.remove.is_empty());
}

#[test]
fn without_nvidia_anywhere_its_extensions_go_and_nothing_is_fetched() {
    let mut installed = installed(&["org.freedesktop.Platform.GL32.nvidia-615-78-08"]);
    installed.insert(named(VAAPI, "26.08"));
    let standard = Drivers {
        running: None,
        staged: None,
        rollback: Some(Graphics::Standard),
    };
    assert_eq!(
        ids(&plan(&steam_on_its_platform(), &installed, &standard)),
        (
            vec![],
            vec!["org.freedesktop.Platform.GL32.nvidia-615-78-08", VAAPI]
        )
    );
}
