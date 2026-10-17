mod password;
mod picture;

use std::path::Path;

use futures_util::future::{try_join, try_join_all};
use luft_app::dbus::{self, error_name, failed};
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use zbus::proxy::MethodFlags;
use zbus::{DynamicType, OwnedObjectPath, Proxy};

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

fn explain(error: zbus::Error) -> String {
    match error_name(&error) {
        Some(name) if name.ends_with("PermissionDenied") => {
            "Administrator rights are needed to change this".to_owned()
        }
        _ => error.to_string(),
    }
}

async fn accounts() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system().await?, ACCOUNTS, ACCOUNTS_PATH, ACCOUNTS)
        .await
        .map_err(failed)
}

async fn account(path: OwnedObjectPath) -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system().await?, ACCOUNTS, path, USER)
        .await
        .map_err(failed)
}

async fn me() -> Result<OwnedObjectPath, String> {
    let uid = i64::from(unsafe { libc::getuid() });
    accounts()
        .await?
        .call("FindUserById", &uid)
        .await
        .map_err(explain)
}

async fn change<B: serde::Serialize + DynamicType>(method: &str, body: &B) -> Result<(), String> {
    account(me().await?)
        .await?
        .call_with_flags::<_, _, ()>(method, MethodFlags::ALLOW_INTERACTIVE_AUTH, body)
        .await
        .map(|_| ())
        .map_err(explain)
}

async fn describe(path: OwnedObjectPath) -> Result<User, String> {
    let user = account(path).await?;
    let picture: String = user.get_property("IconFile").await.map_err(failed)?;
    let account_type: i32 = user.get_property("AccountType").await.map_err(failed)?;
    let password_mode: i32 = user.get_property("PasswordMode").await.map_err(failed)?;
    Ok(User {
        user_name: user.get_property("UserName").await.map_err(failed)?,
        real_name: user.get_property("RealName").await.map_err(failed)?,
        picture: Path::new(&picture).is_file().then_some(picture),
        administrator: account_type == ADMINISTRATOR,
        has_password: password_mode == REGULAR_PASSWORD,
    })
}

async fn users(_: Value) -> Result<Users, String> {
    let cached: Vec<OwnedObjectPath> = accounts()
        .await?
        .call("ListCachedUsers", &())
        .await
        .map_err(explain)?;
    let others = try_join_all(cached.into_iter().map(describe));
    let (me, mut others) = try_join(describe(me().await?), others).await?;
    others.retain(|user| user.user_name != me.user_name);
    Ok(Users { me, others })
}

async fn choose_picture(_: Value) -> Result<bool, String> {
    let Some(picture) = picture::choose().await? else {
        return Ok(false);
    };
    change("SetIconFile", &picture.to_string_lossy().as_ref()).await?;
    Ok(true)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    let window = window
        .command_async("users", users)
        .command_async("users_rename", |Rename { name }| async move {
            change("SetRealName", &name.trim()).await
        })
        .command_async("users_choose_picture", choose_picture)
        .command("users_change_password", password::change);
    luft_fingerprint::register(window, events)
}
