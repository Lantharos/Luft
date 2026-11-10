use luft_app::dbus;
use tokio::sync::watch;
use zbus::OwnedFd;

const LOGIN: &str = "org.freedesktop.login1";
const LOGIN_PATH: &str = "/org/freedesktop/login1";
const LOGIN_MANAGER: &str = "org.freedesktop.login1.Manager";
const KEPT: &str = "shutdown:sleep";
const NAME: &str = "Rover";
const REASON: &str = "Files are still being copied, moved or deleted";

pub struct Awake(watch::Sender<bool>);

impl Awake {
    pub fn new() -> Self {
        let (wanted, mut changes) = watch::channel(false);
        luft_app::spawn(async move {
            let mut held = None;
            while changes.changed().await.is_ok() {
                let wanted = *changes.borrow_and_update();
                held = match (wanted, held) {
                    (true, None) => inhibit().await,
                    (true, held) => held,
                    (false, _) => None,
                };
            }
        });
        Self(wanted)
    }

    pub fn keep(&self, wanted: bool) {
        self.0
            .send_if_modified(|current| std::mem::replace(current, wanted) != wanted);
    }
}

async fn inhibit() -> Option<OwnedFd> {
    dbus::system()
        .await
        .ok()?
        .call_method(
            Some(LOGIN),
            LOGIN_PATH,
            Some(LOGIN_MANAGER),
            "Inhibit",
            &(KEPT, NAME, REASON, "block"),
        )
        .await
        .ok()?
        .body()
        .deserialize()
        .ok()
}
