//! Which unit of a person's own systemd a process runs in.

const LEVELS: usize = 5;
const SESSION_SLICE: &str = "session.slice";

/// A unit in the session slice of a person's own systemd, where Kestrel and
/// the services that make up the desktop run.
#[derive(Debug, PartialEq, Eq)]
pub struct SessionUnit {
    pub uid: u32,
    pub name: String,
    /// The unit's control group, below the root of the hierarchy.
    pub cgroup: String,
}

fn plain(name: &str) -> bool {
    name.bytes()
        .all(|byte| byte.is_ascii_alphanumeric() || b":_.\\@-".contains(&byte))
}

/// The session unit a control group belongs to, itself or a group inside it.
pub fn session_unit(cgroup: &str) -> Option<SessionUnit> {
    let parts: Vec<&str> = cgroup.split('/').collect();
    let [root, user, manager, slice, unit, ..] = parts[..] else {
        return None;
    };
    let uid: u32 = user
        .strip_prefix("user-")?
        .strip_suffix(".slice")?
        .parse()
        .ok()?;
    let own_manager = manager
        .strip_prefix("user@")
        .and_then(|rest| rest.strip_suffix(".service"))
        == Some(uid.to_string().as_str());
    (root == "user.slice" && own_manager && slice == SESSION_SLICE && plain(unit)).then(|| {
        SessionUnit {
            uid,
            name: unit.to_owned(),
            cgroup: parts[..LEVELS].join("/"),
        }
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keeps_to_the_unit_inside_nested_groups() {
        assert_eq!(
            session_unit(
                "user.slice/user-1000.slice/user@1000.service/session.slice/kestrel.service/shell"
            ),
            Some(SessionUnit {
                uid: 1000,
                name: "kestrel.service".to_owned(),
                cgroup:
                    "user.slice/user-1000.slice/user@1000.service/session.slice/kestrel.service"
                        .to_owned(),
            })
        );
    }

    #[test]
    fn only_units_of_the_session_slice_count() {
        for cgroup in [
            "system.slice/sshd.service",
            "user.slice/user-1000.slice/session-2.scope",
            "user.slice/user-1000.slice/user@1001.service/session.slice/kestrel.service",
            "user.slice/user-1000.slice/user@1000.service/app.slice/kestrel.service",
            "user.slice/user-1000.slice/user@1000.service/session.slice",
            "user.slice/user-1000.slice/user@1000.service/session.slice/bad\"name.service",
        ] {
            assert_eq!(session_unit(cgroup), None, "{cgroup}");
        }
    }
}
