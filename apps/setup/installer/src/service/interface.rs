use std::ffi::CString;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};

use access::Idle;
use tokio::sync::watch;
use zbus::message::Header;
use zbus::object_server::{InterfaceRef, ObjectServer};
use zbus::{Connection, interface};

use super::PATH;
use super::error::Error;
use crate::config::Config;
use crate::install::drive::plan::{self, Request};
use crate::install::windows::Windows;
use crate::install::{self, Account, Answers, Job, Regional, Stage, Status};
use crate::options::Options;
use crate::{first_boot, phase, survey};

const INSTALL: &str = "com.lantharos.installer.install";
const FINISH: &str = "com.lantharos.installer.finish-first-boot";

pub struct Installer {
    options: Arc<Options>,
    config: Arc<Config>,
    idle: Arc<Idle>,
    status: Arc<Mutex<Status>>,
    answers: Arc<Answers>,
    started: AtomicBool,
}

impl Installer {
    pub fn new(options: Options, config: Config, idle: Arc<Idle>) -> Self {
        Self {
            options: Arc::new(options),
            config: Arc::new(config),
            idle,
            status: Arc::new(Mutex::new(Status::idle())),
            answers: Arc::default(),
            started: AtomicBool::new(false),
        }
    }

    fn current(&self) -> Status {
        self.status.lock().expect("status lock").clone()
    }

    async fn authorize(
        &self,
        connection: &Connection,
        header: &Header<'_>,
        action: &str,
    ) -> Result<(), Error> {
        if access::is_authorized(connection, header, action).await? {
            Ok(())
        } else {
            Err(Error::not_authorized())
        }
    }

    async fn blocking<T: Send + 'static>(
        work: impl FnOnce() -> anyhow::Result<T> + Send + 'static,
    ) -> Result<T, Error> {
        tokio::task::spawn_blocking(work)
            .await
            .map_err(|_| Error::Failed("The installer stopped unexpectedly.".to_owned()))?
            .map_err(Error::from)
    }
}

fn uid_of(user: &str) -> Option<u32> {
    let name = CString::new(user).ok()?;
    let entry = unsafe { libc::getpwnam(name.as_ptr()) };
    (!entry.is_null()).then(|| unsafe { (*entry).pw_uid })
}

async fn forward(installer: InterfaceRef<Installer>, mut updates: watch::Receiver<Status>) {
    while updates.changed().await.is_ok() {
        let status = updates.borrow_and_update().clone();
        let inner = installer.get().await;
        let previous = std::mem::replace(
            &mut *inner.status.lock().expect("status lock"),
            status.clone(),
        );
        let emitter = installer.signal_emitter();
        if previous.stage != status.stage {
            let _ = inner.stage_changed(emitter).await;
        }
        if previous.error != status.error {
            let _ = inner.error_changed(emitter).await;
        }
        if previous.secure_boot_code != status.secure_boot_code {
            let _ = inner.secure_boot_code_changed(emitter).await;
        }
        let _ = inner.progress_changed(emitter).await;
    }
}

#[interface(name = "com.lantharos.Installer1")]
impl Installer {
    #[zbus(property)]
    fn phase(&self) -> String {
        phase::detect(&self.options.state_dir).name().to_owned()
    }

    #[zbus(property)]
    fn stage(&self) -> String {
        self.current().stage.name().to_owned()
    }

    #[zbus(property)]
    fn progress(&self) -> f64 {
        self.current().progress
    }

    #[zbus(property)]
    fn error(&self) -> String {
        self.current().error
    }

    #[zbus(property)]
    fn secure_boot_code(&self) -> String {
        self.current().secure_boot_code
    }

    async fn survey(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<String, Error> {
        self.authorize(connection, &header, INSTALL).await?;
        let _activity = self.idle.hold();
        let smallest = self.config.smallest_system;
        Self::blocking(move || {
            let survey = survey::take(smallest).map_err(anyhow::Error::msg)?;
            Ok(serde_json::to_string(&survey)?)
        })
        .await
    }

    async fn install(
        &self,
        request: String,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(object_server)] server: &ObjectServer,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, INSTALL).await?;
        let request: Request = serde_json::from_str(&request)
            .map_err(|error| Error::Failed(format!("The request isn't valid: {error}")))?;
        let image = self.config.image(&request.variant)?;
        let smallest = self.config.smallest_system;
        let (plan, windows) = Self::blocking(move || {
            let survey = survey::take(smallest).map_err(anyhow::Error::msg)?;
            let plan = plan::resolve(&survey, &request.target)?;
            let windows = Windows::chosen(&survey, &plan.drive, request.windows);
            Ok((plan, windows))
        })
        .await?;
        if self.started.swap(true, Ordering::SeqCst) {
            return Err(Error::Busy("Luft is already being installed.".to_owned()));
        }
        let (sender, updates) = watch::channel(Status::idle());
        let installer = server.interface::<_, Installer>(PATH).await?;
        tokio::spawn(forward(installer, updates));
        let (options, answers, idle) = (
            self.options.clone(),
            self.answers.clone(),
            self.idle.clone(),
        );
        tokio::spawn(async move {
            let _activity = idle.hold();
            let _ = tokio::task::spawn_blocking(move || {
                let job = Job {
                    image: &image,
                    plan,
                    target: &options.target,
                    answers: &answers,
                    windows,
                };
                install::run(job, |status| {
                    let _ = sender.send(status);
                });
            })
            .await;
            std::future::pending::<()>().await;
        });
        Ok(())
    }

    async fn configure(
        &self,
        regional: String,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, INSTALL).await?;
        let regional: Regional = serde_json::from_str(&regional)
            .map_err(|error| Error::Failed(format!("The settings aren't valid: {error}")))?;
        regional.check()?;
        self.answers.set_regional(regional);
        Ok(())
    }

    async fn create_account(
        &self,
        name: String,
        full_name: String,
        password: String,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, INSTALL).await?;
        let account = Account {
            name,
            full_name,
            password,
        };
        account.check()?;
        if matches!(self.current().stage, Stage::Configuring | Stage::Finished) {
            return Err(Error::Busy("The account was already made.".to_owned()));
        }
        self.answers.set_account(account);
        Ok(())
    }

    async fn finish_first_boot(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, FINISH).await?;
        let state_dir = self.options.state_dir.clone();
        let pending = phase::pending_user(&state_dir).and_then(|user| uid_of(&user));
        let caller = access::caller_uid(connection, &header).await?;
        if pending.is_none() || pending != caller {
            return Err(Error::not_authorized());
        }
        Self::blocking(move || first_boot::finish(&state_dir)).await
    }
}
