use std::ffi::CString;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};

use anyhow::Context;
use luft_dbus::idle::Idle;
use luft_dbus_macros::introspect;
use luft_i18n::t;
use luft_installer_contract::{InstallPlan, Regional};
use luft_meet::Handoff;
use luft_meet::sealed::Code;
use luft_trust::TRUST;
use tokio::sync::watch;
use zbus::message::Header;
use zbus::object_server::{InterfaceRef, ObjectServer, SignalEmitter};
use zbus::{Connection, OwnedObjectPath, interface};
use zeroize::Zeroizing;

use super::PATH;
use super::error::Error;
use super::language;
use super::setup::{self, Enrollment};
use crate::L10N;
use crate::config::Config;
use crate::first_boot::fingerprint::Enrolling;
use crate::install::configure::regional;
use crate::install::drive::plan;
use crate::install::windows::Windows;
use crate::install::{self, Account, Answers, Destination, Job, Stage, Status};
use crate::options::Options;
use crate::phase::Phase;
use crate::{first_boot, meet, phase, survey};

const INSTALL: &str = "com.lantharos.installer.install";
const FINISH: &str = "com.lantharos.installer.finish-first-boot";
const SET_UP: &str = "com.lantharos.installer.set-up";
const FIREWALL: &str = "com.lantharos.Firewall1";
const FIREWALL_PATH: &str = "/com/lantharos/Firewall1";

pub struct Installer {
    options: Arc<Options>,
    config: Arc<Config>,
    idle: Arc<Idle>,
    status: Arc<Mutex<Status>>,
    answers: Arc<Answers>,
    started: Arc<AtomicBool>,
    meet: Option<Handoff>,
    box_code: Arc<Mutex<Option<Zeroizing<String>>>>,
    enrollment: tokio::sync::Mutex<Option<Enrollment>>,
}

impl Installer {
    pub fn new(options: Options, config: Config, meet: Option<Handoff>, idle: Arc<Idle>) -> Self {
        Self {
            meet,
            options: Arc::new(options),
            config: Arc::new(config),
            idle,
            status: Arc::new(Mutex::new(Status::idle())),
            answers: Arc::default(),
            started: Arc::default(),
            box_code: Arc::default(),
            enrollment: tokio::sync::Mutex::default(),
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
        if luft_dbus::polkit::is_authorized(connection, header, action).await? {
            Ok(())
        } else {
            Err(Error::not_authorized())
        }
    }

    async fn setup_app_user(
        &self,
        connection: &Connection,
        header: &Header<'_>,
    ) -> Result<String, Error> {
        self.authorize(connection, header, SET_UP).await?;
        setup::setup_app_user(connection, header, &self.options.state_dir, uid_of).await
    }

    async fn blocking<T: Send + 'static>(
        work: impl FnOnce() -> anyhow::Result<T> + Send + 'static,
    ) -> Result<T, Error> {
        tokio::task::spawn_blocking(work)
            .await
            .map_err(|_| Error::Failed(t!(L10N, "installer-stopped")))?
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

#[introspect]
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
        let handoff = self.meet.clone();
        let scratch = self.options.target.with_extension("moving-box");
        Self::blocking(move || {
            let survey =
                survey::take(smallest, handoff.as_ref(), &scratch).map_err(anyhow::Error::msg)?;
            Ok(serde_json::to_string(&survey.found)?)
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
        let request = Zeroizing::new(request);
        let mut request: InstallPlan = serde_json::from_str(&request).map_err(|error| {
            Error::Failed(t!(
                L10N,
                "installer-request-invalid",
                error = error.to_string()
            ))
        })?;
        let image = self.config.image(&request.variant)?;
        let encryption = request.encryption.take();
        let smallest = self.config.smallest_system;
        let handoff = self.meet.clone();
        let scratch = self.options.target.with_extension("moving-box");
        let (destination, windows) = Self::blocking(move || {
            let survey =
                survey::take(smallest, handoff.as_ref(), &scratch).map_err(anyhow::Error::msg)?;
            let destination = plan::resolve(&survey, &request.target)?;
            let windows = match destination {
                Destination::Partitions(_) => {
                    Windows::chosen(&survey, destination.drive(), request.windows)
                }
                Destination::Replace(_) => None,
            };
            Ok((destination, windows))
        })
        .await?;
        if self.started.swap(true, Ordering::SeqCst) {
            return Err(Error::Busy(t!(L10N, "installer-busy")));
        }
        let box_code = self.box_code.lock().expect("box code lock").clone();
        self.answers.forget_account();
        let (sender, updates) = watch::channel(Status::idle());
        let installer = server.interface::<_, Installer>(PATH).await?;
        tokio::spawn(forward(installer, updates));
        let (options, answers, idle, meet, started) = (
            self.options.clone(),
            self.answers.clone(),
            self.idle.clone(),
            self.meet.clone(),
            self.started.clone(),
        );
        tokio::spawn(async move {
            let _activity = idle.hold();
            let installed = tokio::task::spawn_blocking(move || {
                let job = Job {
                    image: &image,
                    destination,
                    target: &options.target,
                    answers: &answers,
                    windows,
                    meet,
                    encryption,
                    box_code: box_code.as_deref().and_then(|code| Code::parse(code)),
                };
                install::run(job, |status| {
                    let _ = sender.send(status);
                })
            })
            .await;
            if !installed.unwrap_or(false) {
                started.store(false, Ordering::SeqCst);
            }
            std::future::pending::<()>().await;
        });
        Ok(())
    }

    /// Opens the moving box Meet Luft packed with the code it showed, and
    /// keeps the code so the install unpacks the box into the new account.
    async fn open_moving_box(
        &self,
        code: String,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<String, Error> {
        self.authorize(connection, &header, INSTALL).await?;
        let _activity = self.idle.hold();
        let code = Zeroizing::new(code);
        let handoff = self.meet.clone();
        let scratch = self.options.target.with_extension("moving-box");
        let typed = code.clone();
        let opened = Self::blocking(move || {
            let handoff = handoff.with_context(|| t!(L10N, "installer-box-unopened"))?;
            let found = meet::open(&handoff, &scratch, &meet::parse_code(&typed)?)?;
            Ok(serde_json::to_string(&found)?)
        })
        .await?;
        *self.box_code.lock().expect("box code lock") = Some(code);
        Ok(opened)
    }

    async fn configure(
        &self,
        regional: String,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, INSTALL).await?;
        let regional: Regional = serde_json::from_str(&regional).map_err(|error| {
            Error::Failed(t!(
                L10N,
                "installer-settings-invalid",
                error = error.to_string()
            ))
        })?;
        regional::check(&regional)?;
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
            password: Zeroizing::new(password),
        };
        account.check()?;
        if matches!(self.current().stage, Stage::Configuring | Stage::Finished) {
            return Err(Error::Busy(t!(L10N, "installer-account-exists")));
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
        let Some(user) = phase::pending_user(&state_dir) else {
            return Err(Error::not_authorized());
        };
        let pending = uid_of(&user);
        if pending.is_none() || pending != luft_identity::caller::uid(connection, &header).await? {
            return Err(Error::not_authorized());
        }
        let _activity = self.idle.hold();
        Self::blocking(move || first_boot::finish(&state_dir)).await
    }

    /// Says whether a network the computer is on is a home or a public one,
    /// for the person setting it up, whom the firewall would otherwise ask
    /// for the password they just chose.
    async fn set_network_type(
        &self,
        network: OwnedObjectPath,
        kind: String,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        self.setup_app_user(connection, &header).await?;
        let _activity = self.idle.hold();
        zbus::Proxy::new(connection, FIREWALL, FIREWALL_PATH, FIREWALL)
            .await?
            .call::<_, _, ()>("SetNetworkType", &(network, kind))
            .await
            .map_err(|error| {
                Error::Failed(
                    luft_dbus::error_message(&error)
                        .map_or_else(|| error.to_string(), str::to_owned),
                )
            })
    }

    async fn enroll_signing_key(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<String, Error> {
        self.setup_app_user(connection, &header).await?;
        let _activity = self.idle.hold();
        luft_trust::call(&TRUST, "EnrollSigningKey", &())
            .await
            .map_err(Error::Failed)
    }

    async fn enroll_fingerprint(
        &self,
        finger: String,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        let user = self.setup_app_user(connection, &header).await?;
        let mut enrollment = self.enrollment.lock().await;
        if let Some(previous) = enrollment.take() {
            previous.end().await;
        }
        let enrolling = Enrolling::start(connection, &user, &finger)
            .await
            .map_err(Error::relayed)?;
        *enrollment = Some(
            setup::follow(
                connection,
                &header,
                enrolling,
                emitter.into_owned(),
                self.idle.clone(),
            )
            .await?,
        );
        Ok(())
    }

    async fn stop_fingerprint(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        self.setup_app_user(connection, &header).await?;
        if let Some(enrollment) = self.enrollment.lock().await.take() {
            enrollment.end().await;
        }
        Ok(())
    }

    async fn use_language(
        &self,
        language: &str,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        match phase::detect(&self.options.state_dir) {
            Phase::Live => self.authorize(connection, &header, INSTALL).await?,
            Phase::FirstBoot | Phase::Installed => {
                self.setup_app_user(connection, &header).await?;
            }
        }
        language::choose(language);
        Ok(())
    }

    #[zbus(signal)]
    pub async fn fingerprint_status(
        emitter: &SignalEmitter<'_>,
        result: &str,
        done: bool,
    ) -> zbus::Result<()>;
}
