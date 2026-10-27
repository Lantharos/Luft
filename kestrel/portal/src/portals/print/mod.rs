mod choices;
mod gtk;
mod printers;

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use luft_i18n::t;
use zbus::message::Header;
use zbus::{Connection, fdo, interface};
use zbus::{Fd, ObjectPath, OwnedFd};

use super::apps::app_name;
use super::{ENDED, Options, Response, SUCCESS, option, owned};
use crate::L10N;
use crate::context::Context;
use crate::request::while_open;
use choices::Choices;

const TOKEN_LIFETIME: Duration = Duration::from_secs(300);
const SETTINGS_APP: &str = "com.lantharos.settings";

struct Job {
    app_id: String,
    printer: String,
    description: String,
    options: Options,
}

struct Dialog<'a> {
    app_id: &'a str,
    preferences: Options,
    pages: Vec<&'static str>,
    ranges_need_support: bool,
    orientation: bool,
    accept_label: String,
}

pub struct Print {
    context: Context,
    prepared: Arc<Mutex<HashMap<u32, Job>>>,
}

impl Print {
    pub fn new(context: &Context) -> Self {
        Self {
            context: context.clone(),
            prepared: Arc::default(),
        }
    }

    async fn choose(
        &self,
        handle: &ObjectPath<'_>,
        dialog: Dialog<'_>,
    ) -> (u32, Option<(Choices, String)>) {
        let printers = printers::list(&self.context.connection).await;
        let options = Options::from([
            ("pages".into(), owned(dialog.pages)),
            (
                "ranges_need_support".into(),
                owned(dialog.ranges_need_support),
            ),
            ("orientation".into(), owned(dialog.orientation)),
            ("accept_label".into(), owned(dialog.accept_label)),
        ]);
        let preferences = dialog.preferences;
        let (key, app_id, listed) = (handle.as_str(), dialog.app_id, &printers);
        let asked = self.context.shell.answer(|dialogs| async move {
            dialogs
                .choose_print(key, app_id, listed, &preferences, &options)
                .await
        });
        let Some((response, chosen)) = while_open(&self.context, handle, asked).await else {
            return (ENDED, None);
        };
        let choices = (response == SUCCESS)
            .then(|| Choices::read(&chosen))
            .flatten();
        let Some(choices) = choices else {
            return (if response == SUCCESS { ENDED } else { response }, None);
        };
        let description = printers
            .iter()
            .find(|printer| option::<String>(printer, "name").as_deref() == Some(&choices.printer))
            .and_then(|printer| option::<String>(printer, "description"))
            .unwrap_or_else(|| choices.printer.clone());
        (SUCCESS, Some((choices, description)))
    }

    fn remember(&self, job: Job) -> u32 {
        let mut prepared = self.prepared.lock().expect("prepared print jobs");
        let mut token = 0;
        while token == 0 || prepared.contains_key(&token) {
            token = rand_token();
        }
        prepared.insert(token, job);
        let forget = self.prepared.clone();
        tokio::spawn(async move {
            tokio::time::sleep(TOKEN_LIFETIME).await;
            forget.lock().expect("prepared print jobs").remove(&token);
        });
        token
    }

    fn take(&self, app_id: &str, token: u32) -> Option<Job> {
        let mut prepared = self.prepared.lock().expect("prepared print jobs");
        prepared.get(&token).filter(|job| job.app_id == app_id)?;
        prepared.remove(&token)
    }

    async fn submit(&self, document: &OwnedFd, job: &Job) -> u32 {
        let from = app_name(&self.context.gio, &job.app_id).await;
        let title = match &from {
            Some(app) => t!(L10N, "print-job-name-from-app", appName = app.as_str()),
            None => t!(L10N, "print-job-name"),
        };
        let submitted = printers::submit(
            &self.context.connection,
            &job.printer,
            Fd::from(document),
            &title,
            &job.options,
        )
        .await;
        match submitted {
            Ok(_) => SUCCESS,
            Err(error) => {
                eprintln!("Couldn't print on {}: {error}", job.printer);
                notify_failure(&self.context.connection, &job.description, from.as_deref()).await;
                ENDED
            }
        }
    }
}

fn rand_token() -> u32 {
    let mut bytes = [0; 4];
    rustix::rand::getrandom(&mut bytes, rustix::rand::GetRandomFlags::empty())
        .expect("random bytes");
    u32::from_ne_bytes(bytes)
}

fn accept_label(options: &Options) -> String {
    let label = option::<String>(options, "accept_label").unwrap_or_default();
    let mut plain = String::with_capacity(label.len());
    let mut characters = label.chars();
    while let Some(character) = characters.next() {
        match character {
            '_' => plain.extend(characters.next()),
            other => plain.push(other),
        }
    }
    plain
}

async fn notify_failure(connection: &Connection, printer: &str, app: Option<&str>) {
    let body = match app {
        Some(app) => t!(
            L10N,
            "print-failed-from-app",
            printer = printer,
            appName = app
        ),
        None => t!(L10N, "print-failed", printer = printer),
    };
    let hints = HashMap::from([("desktop-entry", owned(SETTINGS_APP))]);
    let shown = connection
        .call_method(
            Some("org.freedesktop.Notifications"),
            "/org/freedesktop/Notifications",
            Some("org.freedesktop.Notifications"),
            "Notify",
            &(
                "",
                0u32,
                "printer-error-symbolic",
                t!(L10N, "print-failed-title"),
                body,
                Vec::<&str>::new(),
                hints,
                -1i32,
            ),
        )
        .await;
    if let Err(error) = shown {
        eprintln!("Couldn't tell that printing failed: {error}");
    }
}

#[interface(name = "org.freedesktop.impl.portal.Print")]
impl Print {
    #[allow(clippy::too_many_arguments)]
    async fn prepare_print(
        &self,
        handle: ObjectPath<'_>,
        app_id: &str,
        _parent_window: &str,
        _title: &str,
        settings: Options,
        page_setup: Options,
        options: Options,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<Response> {
        self.context.allow(&header).await?;
        let mut pages = vec!["all"];
        if option::<bool>(&options, "has_current_page").unwrap_or(false) {
            pages.push("current");
        }
        if option::<bool>(&options, "has_selected_pages").unwrap_or(false) {
            pages.push("selection");
        }
        pages.push("ranges");
        let dialog = Dialog {
            app_id,
            preferences: gtk::preferences(&settings, &page_setup),
            pages,
            ranges_need_support: false,
            orientation: true,
            accept_label: accept_label(&options),
        };
        let (response, chosen) = self.choose(&handle, dialog).await;
        let Some((choices, description)) = chosen else {
            return Ok((response, Options::new()));
        };
        let token = self.remember(Job {
            app_id: app_id.to_owned(),
            printer: choices.printer.clone(),
            description,
            options: choices.job(true),
        });
        Ok((
            SUCCESS,
            Options::from([
                ("settings".into(), owned(gtk::settings(&choices, &settings))),
                (
                    "page-setup".into(),
                    owned(gtk::page_setup(&choices, &page_setup)),
                ),
                ("token".into(), owned(token)),
            ]),
        ))
    }

    #[allow(clippy::too_many_arguments)]
    async fn print(
        &self,
        handle: ObjectPath<'_>,
        app_id: &str,
        _parent_window: &str,
        _title: &str,
        document: OwnedFd,
        options: Options,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<Response> {
        self.context.allow(&header).await?;
        if let Some(job) = self.take(app_id, option(&options, "token").unwrap_or(0)) {
            return Ok((self.submit(&document, &job).await, Options::new()));
        }
        let dialog = Dialog {
            app_id,
            preferences: Options::new(),
            pages: vec!["all", "ranges"],
            ranges_need_support: true,
            orientation: false,
            accept_label: String::new(),
        };
        let (response, chosen) = self.choose(&handle, dialog).await;
        let Some((choices, description)) = chosen else {
            return Ok((response, Options::new()));
        };
        let job = Job {
            app_id: app_id.to_owned(),
            printer: choices.printer.clone(),
            description,
            options: choices.job(false),
        };
        Ok((self.submit(&document, &job).await, Options::new()))
    }
}
