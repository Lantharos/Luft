mod fingerprint;
mod password;
mod picture;

use std::path::Path;

use luft_app::dbus;
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use zbus::blocking::Proxy;
use zbus::proxy::MethodFlags;
use zbus::zvariant::{DynamicType, OwnedObjectPath};

const ACCOUNTS: &str = "org.freedesktop.Accounts";
const ACCOUNTS_PATH: &str = "/org/freedesktop/Accounts";
const USER: &str = "org.freedesktop.Accounts.User";
const ADMINISTRATOR: i32 = 1;
const REGULAR_PASSWORD: i32 = 0;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct User {
    user_name: String,
    real_name: String,
    picture: Option<String>,
    administrator: bool,
    automatic_login: bool,
    has_password: bool,
}

#[derive(Serialize)]
struct Users {
    me: User,
    others: Vec<User>,
}

#[derive(Deserialize)]
struct Rename {
    name: String,
}

#[derive(Deserialize)]
struct AutomaticLogin {
    enabled: bool,
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn explain(error: zbus::Error) -> String {
    match &error {
        zbus::Error::MethodError(name, _, _) if name.ends_with("PermissionDenied") => {
            "Administrator rights are needed to change this".to_owned()
        }
        _ => error.to_string(),
    }
}

fn accounts() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system()?, ACCOUNTS, ACCOUNTS_PATH, ACCOUNTS).map_err(failed)
}

fn account(path: OwnedObjectPath) -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system()?, ACCOUNTS, path, USER).map_err(failed)
}

fn me() -> Result<Proxy<'static>, String> {
    let uid = i64::from(unsafe { libc::getuid() });
    let path: OwnedObjectPath = accounts()?.call("FindUserById", &uid).map_err(explain)?;
    account(path)
}

fn change<B: serde::Serialize + DynamicType>(method: &str, body: &B) -> Result<(), String> {
    me()?
        .call_with_flags::<_, _, ()>(method, MethodFlags::AllowInteractiveAuth.into(), body)
        .map(|_| ())
        .map_err(explain)
}

fn has_password(user: &Proxy) -> Result<bool, String> {
    let mode: i32 = user.get_property("PasswordMode").map_err(failed)?;
    Ok(mode == REGULAR_PASSWORD)
}

fn describe(user: &Proxy) -> Result<User, String> {
    let picture: String = user.get_property("IconFile").map_err(failed)?;
    let account_type: i32 = user.get_property("AccountType").map_err(failed)?;
    Ok(User {
        user_name: user.get_property("UserName").map_err(failed)?,
        real_name: user.get_property("RealName").map_err(failed)?,
        picture: Path::new(&picture).is_file().then_some(picture),
        administrator: account_type == ADMINISTRATOR,
        automatic_login: user.get_property("AutomaticLogin").map_err(failed)?,
        has_password: has_password(user)?,
    })
}

fn users() -> Result<Users, String> {
    let me = describe(&me()?)?;
    let cached: Vec<OwnedObjectPath> = accounts()?.call("ListCachedUsers", &()).map_err(explain)?;
    let others = cached
        .into_iter()
        .map(|path| describe(&account(path)?))
        .filter(|user| !matches!(user, Ok(user) if user.user_name == me.user_name))
        .collect::<Result<_, _>>()?;
    Ok(Users { me, others })
}

fn choose_picture(_: Value) -> Result<bool, String> {
    let Some(picture) = picture::choose()? else {
        return Ok(false);
    };
    change("SetIconFile", &picture.to_string_lossy().as_ref())?;
    Ok(true)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .command("users", |_: Value| users())
        .command("users_rename", |Rename { name }| {
            change("SetRealName", &name.trim())
        })
        .command("users_choose_picture", choose_picture)
        .command("users_set_automatic_login", |AutomaticLogin { enabled }| {
            change("SetAutomaticLogin", &enabled)
        })
        .command("users_change_password", password::change)
        .command("users_fingerprints", |_: Value| Ok(fingerprint::list()))
        .with("users_fingerprint_enroll", events, fingerprint::enroll)
        .command("users_fingerprint_stop", |_: Value| {
            fingerprint::stop();
            Ok(())
        })
        .command("users_fingerprint_delete", fingerprint::delete)
}
