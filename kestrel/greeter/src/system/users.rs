use std::path::Path;

use nix::unistd::User;

const FIRST_REGULAR_UID: u32 = 1000;
const NOBODY_UID: u32 = 65534;
const NON_LOGIN_SHELLS: [&str; 2] = ["nologin", "false"];

pub fn is_regular(name: &str) -> bool {
    regular_uid(name).is_some()
}

pub fn regular_uid(name: &str) -> Option<u32> {
    let user = User::from_name(name).ok()??;
    is_regular_account(&user).then(|| user.uid.as_raw())
}

fn is_regular_account(user: &User) -> bool {
    let uid = user.uid.as_raw();
    uid >= FIRST_REGULAR_UID && uid != NOBODY_UID && can_log_in(&user.shell)
}

fn can_log_in(shell: &Path) -> bool {
    shell
        .file_name()
        .and_then(|name| name.to_str())
        .is_none_or(|name| !NON_LOGIN_SHELLS.contains(&name))
}
