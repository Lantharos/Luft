use luft_app::dbus;
use zbus::OwnedFd;

const APP: &str = "com.lantharos.disks";
const NAME: &str = "Disks";

const LOGIN: &str = "org.freedesktop.login1";
const LOGIN_PATH: &str = "/org/freedesktop/login1";
const LOGIN_MANAGER: &str = "org.freedesktop.login1.Manager";
const KEPT_AWAKE: &str = "shutdown:sleep:handle-lid-switch";

const SESSION: &str = "org.gnome.SessionManager";
const SESSION_PATH: &str = "/org/gnome/SessionManager";
const NO_WINDOW: u32 = 0;
const LOG_OUT: u32 = 1;
const SUSPEND: u32 = 4;

pub struct Hold {
    _awake: Option<OwnedFd>,
    session: Option<u32>,
}

async fn awake(reason: &str) -> Option<OwnedFd> {
    dbus::system()
        .await
        .ok()?
        .call_method(
            Some(LOGIN),
            LOGIN_PATH,
            Some(LOGIN_MANAGER),
            "Inhibit",
            &(KEPT_AWAKE, NAME, reason, "block"),
        )
        .await
        .ok()?
        .body()
        .deserialize()
        .ok()
}

async fn signed_in(reason: &str) -> Option<u32> {
    dbus::session()
        .await
        .ok()?
        .call_method(
            Some(SESSION),
            SESSION_PATH,
            Some(SESSION),
            "Inhibit",
            &(APP, NO_WINDOW, reason, LOG_OUT | SUSPEND),
        )
        .await
        .ok()?
        .body()
        .deserialize()
        .ok()
}

impl Hold {
    pub async fn take(reason: &str) -> Self {
        Self {
            _awake: awake(reason).await,
            session: signed_in(reason).await,
        }
    }
}

impl Drop for Hold {
    fn drop(&mut self) {
        let Some(cookie) = self.session else {
            return;
        };
        luft_app::spawn(async move {
            if let Ok(session) = dbus::session().await {
                let _ = session
                    .call_method(
                        Some(SESSION),
                        SESSION_PATH,
                        Some(SESSION),
                        "Uninhibit",
                        &(cookie,),
                    )
                    .await;
            }
        });
    }
}

pub async fn during<T>(
    reason: &str,
    work: impl Future<Output = Result<T, String>>,
) -> Result<T, String> {
    let _hold = Hold::take(reason).await;
    work.await
}
