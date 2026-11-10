use std::io;
use std::os::fd::OwnedFd;
use std::sync::Arc;

use luft_cups::ipp::{Attributes, JOB};
use luft_cups::{Cups, PRINT_JOB, expect_success, printer_uri};
use luft_dbus_macros::introspect;
use tokio::fs::File;
use zbus::object_server::SignalEmitter;
use zbus::{DeserializeDict, SerializeDict, Type, fdo, interface};

use super::defaults;
use super::discovery::Discovered;
use super::printer::{ATTRIBUTES, Printer};

pub const PATH: &str = "/com/lantharos/Settings/Printing";
const DOCUMENT_FORMAT: &str = "application/pdf";
const TEST_PAGE: &str = "/usr/share/cups/data/default-testpage.pdf";
const COLLATED: &str = "separate-documents-collated-copies";
const UNCOLLATED: &str = "separate-documents-uncollated-copies";
const PRINTERS_PATH: &str = "/printers/";

#[derive(SerializeDict, Type)]
#[zbus(signature = "a{sv}", rename_all = "kebab-case")]
pub struct Job {
    id: u32,
    printer: String,
    name: String,
    owner: String,
    state: i32,
    created: i32,
    mine: bool,
}

impl Job {
    fn from(attributes: &Attributes, user: &str) -> Option<Self> {
        let owner = attributes
            .text("job-originating-user-name")
            .unwrap_or_default()
            .to_owned();
        let printer = attributes.text("job-printer-uri")?;
        Some(Self {
            id: u32::try_from(attributes.integer("job-id")?).ok()?,
            printer: printer[printer.rfind(PRINTERS_PATH)? + PRINTERS_PATH.len()..].to_owned(),
            name: attributes.text("job-name").unwrap_or_default().to_owned(),
            state: attributes.integer("job-state").unwrap_or_default(),
            created: attributes.integer("time-at-creation").unwrap_or_default(),
            mine: owner == user,
            owner,
        })
    }
}

#[derive(DeserializeDict, Type, Default)]
#[zbus(signature = "a{sv}", rename_all = "kebab-case")]
pub struct JobOptions {
    copies: Option<i32>,
    collate: Option<bool>,
    sides: Option<String>,
    print_color_mode: Option<String>,
    media: Option<String>,
    page_ranges: Option<Vec<(i32, i32)>>,
}

pub struct Printing {
    cups: Arc<Cups>,
    discovered: Arc<Discovered>,
}

impl Printing {
    pub fn new(cups: Arc<Cups>, discovered: Arc<Discovered>) -> Self {
        Self { cups, discovered }
    }

    async fn send(
        &self,
        printer: &str,
        title: &str,
        format: &str,
        document: File,
        options: &JobOptions,
    ) -> fdo::Result<u32> {
        let mut request = self.cups.request(PRINT_JOB, &printer_uri(printer));
        request
            .name("job-name", title)
            .mime_type("document-format", format)
            .group(JOB);
        if let Some(copies) = options.copies {
            request.integer("copies", copies);
        }
        if let Some(collate) = options.collate {
            request.keywords(
                "multiple-document-handling",
                &[if collate { COLLATED } else { UNCOLLATED }],
            );
        }
        if let Some(sides) = &options.sides {
            request.keywords("sides", &[sides]);
        }
        if let Some(mode) = &options.print_color_mode {
            request.keywords("print-color-mode", &[mode]);
        }
        if let Some(media) = &options.media {
            request.keywords("media", &[media]);
        }
        if let Some(ranges) = &options.page_ranges {
            request.ranges("page-ranges", ranges);
        }
        let response = self
            .cups
            .send_document(request, document)
            .await
            .map_err(failed)?;
        expect_success(&response).map_err(failed)?;
        response
            .integer("job-id")
            .and_then(|job| u32::try_from(job).ok())
            .ok_or_else(|| fdo::Error::Failed("The printer didn't take the document".into()))
    }
}

fn failed(error: io::Error) -> fdo::Error {
    match error.kind() {
        io::ErrorKind::PermissionDenied => fdo::Error::AccessDenied(error.to_string()),
        _ => fdo::Error::Failed(error.to_string()),
    }
}

#[introspect]
#[interface(name = "com.lantharos.Settings.Printing")]
impl Printing {
    async fn printers(&self) -> fdo::Result<Vec<Printer>> {
        let (found, server_default, user_default) = tokio::join!(
            self.cups.printers(&ATTRIBUTES),
            self.cups.default_printer(),
            defaults::chosen()
        );
        let discovered = self.discovered.models();
        let mut printers: Vec<Printer> = found
            .map_err(failed)?
            .iter()
            .filter_map(Printer::from)
            .filter(|printer| !printer.reached_another_way(&discovered))
            .collect();
        let default = [user_default, server_default.map_err(failed)?]
            .into_iter()
            .flatten()
            .find(|name| printers.iter().any(|printer| printer.name == *name));
        for printer in &mut printers {
            printer.default = default.as_ref() == Some(&printer.name);
        }
        Ok(printers)
    }

    fn available(&self) -> Vec<(String, String, String)> {
        self.discovered
            .elsewhere()
            .into_iter()
            .map(|queue| (queue.name, queue.info, queue.location))
            .collect()
    }

    async fn add_available(
        &self,
        printer: &str,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        self.discovered
            .choose(&self.cups, printer)
            .await
            .ok_or_else(|| fdo::Error::InvalidArgs(format!("{printer} isn't nearby")))?
            .map_err(failed)?;
        Self::changed(&emitter).await?;
        Ok(())
    }

    async fn jobs(&self) -> fdo::Result<Vec<Job>> {
        let jobs = self.cups.jobs().await.map_err(failed)?;
        Ok(jobs
            .iter()
            .filter_map(|job| Job::from(job, self.cups.user()))
            .collect())
    }

    async fn cancel_job(&self, printer: &str, job: u32) -> fdo::Result<()> {
        self.cups.cancel_job(printer, job).await.map_err(failed)
    }

    async fn set_default(
        &self,
        printer: &str,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        defaults::choose(printer).await.map_err(failed)?;
        Self::changed(&emitter).await?;
        Ok(())
    }

    async fn print_test_page(&self, printer: &str) -> fdo::Result<u32> {
        let page = File::open(TEST_PAGE).await.map_err(failed)?;
        self.send(
            printer,
            "Test page",
            DOCUMENT_FORMAT,
            page,
            &JobOptions::default(),
        )
        .await
    }

    async fn print(
        &self,
        printer: &str,
        document: zbus::OwnedFd,
        title: &str,
        options: JobOptions,
    ) -> fdo::Result<u32> {
        let document = File::from_std(std::fs::File::from(OwnedFd::from(document)));
        self.send(printer, title, DOCUMENT_FORMAT, document, &options)
            .await
    }

    #[zbus(signal)]
    pub async fn changed(emitter: &SignalEmitter<'_>) -> zbus::Result<()>;
}
