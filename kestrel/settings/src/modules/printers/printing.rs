use std::io;
use std::os::fd::OwnedFd;

use tokio::fs::File;
use zbus::zvariant::{self, DeserializeDict, SerializeDict, Type};
use zbus::{fdo, interface};

use super::cups::{self, Cups, PRINT_JOB};
use super::ipp::{Attributes, JOB};

pub const PATH: &str = "/com/lantharos/Settings/Printing";
const DOCUMENT_FORMAT: &str = "application/pdf";
const ATTRIBUTES: [&str; 13] = [
    "printer-name",
    "printer-info",
    "printer-location",
    "printer-state",
    "printer-is-accepting-jobs",
    "media-supported",
    "media-default",
    "sides-supported",
    "sides-default",
    "print-color-mode-supported",
    "print-color-mode-default",
    "copies-supported",
    "page-ranges-supported",
];
const COLLATED: &str = "separate-documents-collated-copies";
const UNCOLLATED: &str = "separate-documents-uncollated-copies";

#[derive(SerializeDict, Type)]
#[zvariant(
    signature = "a{sv}",
    rename_all = "kebab-case",
    crate = "zbus::zvariant"
)]
pub struct Printer {
    name: String,
    description: String,
    location: String,
    state: i32,
    accepting: bool,
    default: bool,
    media: Vec<String>,
    media_default: String,
    sides: Vec<String>,
    sides_default: String,
    color_modes: Vec<String>,
    color_mode_default: String,
    copies: i32,
    page_ranges: bool,
}

impl Printer {
    fn from(attributes: &Attributes) -> Option<Self> {
        let name = attributes.text("printer-name")?.to_owned();
        let text = |key| attributes.text(key).unwrap_or_default().to_owned();
        let description = Some(text("printer-info"))
            .filter(|info| !info.is_empty())
            .unwrap_or_else(|| name.clone());
        Some(Self {
            default: false,
            description,
            location: text("printer-location"),
            state: attributes.integer("printer-state").unwrap_or_default(),
            accepting: attributes.integer("printer-is-accepting-jobs") == Some(1),
            media: attributes
                .texts("media-supported")
                .into_iter()
                .filter(|media| {
                    !media.starts_with("custom_min_") && !media.starts_with("custom_max_")
                })
                .collect(),
            media_default: text("media-default"),
            sides: attributes.texts("sides-supported"),
            sides_default: text("sides-default"),
            color_modes: attributes.texts("print-color-mode-supported"),
            color_mode_default: text("print-color-mode-default"),
            copies: attributes
                .range("copies-supported")
                .map_or(1, |(_, most)| most),
            page_ranges: attributes.integer("page-ranges-supported") == Some(1),
            name,
        })
    }
}

#[derive(DeserializeDict, Type)]
#[zvariant(
    signature = "a{sv}",
    rename_all = "kebab-case",
    crate = "zbus::zvariant"
)]
pub struct JobOptions {
    copies: Option<i32>,
    collate: Option<bool>,
    sides: Option<String>,
    print_color_mode: Option<String>,
    media: Option<String>,
    page_ranges: Option<Vec<(i32, i32)>>,
}

pub struct Printing {
    cups: Cups,
}

impl Printing {
    pub fn new() -> Self {
        Self { cups: Cups::new() }
    }
}

fn printer_uri(name: &str) -> String {
    let path: String = name
        .bytes()
        .map(|byte| {
            if byte.is_ascii_alphanumeric() || b"-._~".contains(&byte) {
                char::from(byte).to_string()
            } else {
                format!("%{byte:02X}")
            }
        })
        .collect();
    format!("ipp://localhost/printers/{path}")
}

async fn user_default() -> Option<String> {
    let path = glib::home_dir().join(".cups/lpoptions");
    let options = tokio::fs::read_to_string(path).await.ok()?;
    options.lines().find_map(|line| {
        let destination = line.strip_prefix("Default ")?.split_whitespace().next()?;
        Some(destination.split('/').next()?.to_owned())
    })
}

fn failed(error: io::Error) -> fdo::Error {
    fdo::Error::Failed(error.to_string())
}

#[interface(name = "com.lantharos.Settings.Printing")]
impl Printing {
    async fn printers(&self) -> fdo::Result<Vec<Printer>> {
        let (found, server_default, user_default) = tokio::join!(
            self.cups.printers(&ATTRIBUTES),
            self.cups.default_printer(),
            user_default()
        );
        let mut printers: Vec<Printer> = found
            .map_err(failed)?
            .iter()
            .filter_map(Printer::from)
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

    async fn print(
        &self,
        printer: &str,
        document: zvariant::OwnedFd,
        title: &str,
        options: JobOptions,
    ) -> fdo::Result<u32> {
        let mut request = self.cups.request(PRINT_JOB, &printer_uri(printer));
        request
            .name("job-name", title)
            .mime_type("document-format", DOCUMENT_FORMAT)
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
        let document = File::from_std(std::fs::File::from(OwnedFd::from(document)));
        let response = self
            .cups
            .send_document(request.finish(), document)
            .await
            .map_err(failed)?;
        cups::expect_success(&response).map_err(failed)?;
        response
            .integer("job-id")
            .and_then(|job| u32::try_from(job).ok())
            .ok_or_else(|| fdo::Error::Failed("The printer didn't take the document".into()))
    }
}
