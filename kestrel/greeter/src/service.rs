use std::sync::Arc;

use tokio::sync::Mutex;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::zvariant::OwnedFd;
use zbus::{Connection, interface};

use crate::access::{self, Access, CONFIGURE, SET_APPEARANCE};
use crate::error::Error;
use crate::idle::Idle;
use crate::options::Options;
use crate::store::{self, Config, Store};
use crate::system::greetd::{Greetd, InitialSession};
use crate::system::sessions::{self, Session};
use crate::system::{accounts, users};

pub struct Greeter {
    store: Store,
    greetd: Greetd,
    access: Access,
    idle: Arc<Idle>,
    writing: Mutex<()>,
}

impl Greeter {
    pub fn new(options: Options, idle: Arc<Idle>) -> Self {
        Self {
            store: Store::new(options.state_dir),
            greetd: Greetd::new(options.greetd_config),
            access: Access::new(options.unprivileged),
            idle,
            writing: Mutex::default(),
        }
    }

    async fn change_config(&self, change: impl FnOnce(&mut Config)) -> Result<(), Error> {
        let _writing = self.writing.lock().await;
        let mut config = self.store.config();
        change(&mut config);
        Ok(self.store.save_config(&config)?)
    }

    fn start_automatically(
        &self,
        user: &str,
        sessions: &[Session],
        default_session: &str,
    ) -> Result<(), Error> {
        let session = sessions::preferred(sessions, default_session)
            .ok_or_else(|| Error::NotSupported("No sessions are installed".into()))?;
        self.greetd.set_initial_session(Some(InitialSession {
            user,
            command: &session.command(),
        }))
    }
}

async fn prepare_wallpaper(wallpaper: OwnedFd) -> Result<Vec<u8>, Error> {
    tokio::task::spawn_blocking(move || store::prepare_wallpaper(wallpaper.into()))
        .await
        .unwrap_or_else(|_| Err(Error::unsupported_image("This picture couldn't be opened")))
}

fn require_regular_user(name: &str) -> Result<(), Error> {
    if users::is_regular(name) {
        Ok(())
    } else {
        Err(Error::InvalidArgs(format!(
            "{name} isn't a person who can sign in"
        )))
    }
}

fn session_named<'a>(sessions: &'a [Session], id: &str) -> Result<&'a Session, Error> {
    sessions
        .iter()
        .find(|session| session.id == id)
        .ok_or_else(|| Error::InvalidArgs(format!("There's no session called {id}")))
}

#[interface(name = "com.lantharos.Greeter1")]
impl Greeter {
    #[zbus(property)]
    fn shared_wallpaper(&self) -> String {
        self.store
            .shared_wallpaper()
            .map(|path| path.to_string_lossy().into_owned())
            .unwrap_or_default()
    }

    #[zbus(property)]
    fn show_users(&self) -> bool {
        self.store.config().show_users
    }

    #[zbus(property)]
    fn hidden_users(&self) -> Vec<String> {
        self.store.config().hidden_users
    }

    #[zbus(property)]
    fn default_session(&self) -> String {
        self.store.config().default_session
    }

    #[zbus(property)]
    fn automatic_login(&self) -> String {
        self.greetd.automatic_login()
    }

    #[zbus(property)]
    fn sessions(&self) -> Vec<(String, String, String)> {
        sessions::discover()
            .into_iter()
            .map(|session| (session.id, session.name, session.kind.as_str().to_owned()))
            .collect()
    }

    async fn set_appearance(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        wallpaper: OwnedFd,
    ) -> Result<(), Error> {
        let _active = self.idle.hold();
        self.access
            .authorize(connection, &header, SET_APPEARANCE)
            .await?;
        let uid = access::caller_uid(connection, &header).await?;
        let jpeg = prepare_wallpaper(wallpaper).await?;
        let _writing = self.writing.lock().await;
        Ok(self.store.save_user_wallpaper(uid, &jpeg)?)
    }

    async fn set_displays(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        arrangement: OwnedFd,
    ) -> Result<(), Error> {
        let _active = self.idle.hold();
        self.access
            .authorize(connection, &header, SET_APPEARANCE)
            .await?;
        let arrangement = store::prepare_displays(arrangement.into())?;
        let _writing = self.writing.lock().await;
        Ok(self.store.save_displays(&arrangement)?)
    }

    async fn set_num_lock(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        on: bool,
    ) -> Result<(), Error> {
        let _active = self.idle.hold();
        self.access
            .authorize(connection, &header, SET_APPEARANCE)
            .await?;
        self.change_config(|config| config.num_lock = on).await
    }

    async fn set_shared_wallpaper(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        wallpaper: OwnedFd,
    ) -> Result<(), Error> {
        let _active = self.idle.hold();
        self.access
            .authorize(connection, &header, CONFIGURE)
            .await?;
        let jpeg = prepare_wallpaper(wallpaper).await?;
        {
            let _writing = self.writing.lock().await;
            self.store.save_shared_wallpaper(&jpeg)?;
        }
        Ok(self.shared_wallpaper_changed(&emitter).await?)
    }

    async fn clear_shared_wallpaper(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        let _active = self.idle.hold();
        self.access
            .authorize(connection, &header, CONFIGURE)
            .await?;
        {
            let _writing = self.writing.lock().await;
            self.store.clear_shared_wallpaper()?;
        }
        Ok(self.shared_wallpaper_changed(&emitter).await?)
    }

    async fn set_show_users(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        show: bool,
    ) -> Result<(), Error> {
        let _active = self.idle.hold();
        self.access
            .authorize(connection, &header, CONFIGURE)
            .await?;
        self.change_config(|config| config.show_users = show)
            .await?;
        Ok(self.show_users_changed(&emitter).await?)
    }

    async fn set_hidden_users(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        users: Vec<String>,
    ) -> Result<(), Error> {
        let _active = self.idle.hold();
        self.access
            .authorize(connection, &header, CONFIGURE)
            .await?;
        for user in &users {
            require_regular_user(user)?;
        }
        self.change_config(|config| config.hidden_users = users)
            .await?;
        Ok(self.hidden_users_changed(&emitter).await?)
    }

    async fn set_default_session(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        session: String,
    ) -> Result<(), Error> {
        let _active = self.idle.hold();
        self.access
            .authorize(connection, &header, CONFIGURE)
            .await?;
        let sessions = sessions::discover();
        if !session.is_empty() {
            session_named(&sessions, &session)?;
        }
        {
            let _writing = self.writing.lock().await;
            let mut config = self.store.config();
            config.default_session = session;
            self.store.save_config(&config)?;
            let user = self.greetd.automatic_login();
            if !user.is_empty() {
                self.start_automatically(&user, &sessions, &config.default_session)?;
            }
        }
        Ok(self.default_session_changed(&emitter).await?)
    }

    async fn set_automatic_login(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        user: String,
    ) -> Result<(), Error> {
        let _active = self.idle.hold();
        self.access
            .authorize(connection, &header, CONFIGURE)
            .await?;
        {
            let _writing = self.writing.lock().await;
            if user.is_empty() {
                self.greetd.set_initial_session(None)?;
            } else {
                require_regular_user(&user)?;
                let default_session = self.store.config().default_session;
                self.start_automatically(&user, &sessions::discover(), &default_session)?;
            }
        }
        Ok(self.automatic_login_changed(&emitter).await?)
    }

    async fn remember_session(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        username: String,
        session: String,
    ) -> Result<(), Error> {
        let _active = self.idle.hold();
        self.access.authorize_greeter(connection, &header).await?;
        let sessions = sessions::discover();
        let session = session_named(&sessions, &session)?;
        accounts::remember_session(connection, &username, session)
            .await
            .map_err(|error| {
                eprintln!("Couldn't remember {username}'s session: {error}");
                Error::Failed("The session couldn't be remembered".into())
            })
    }
}
