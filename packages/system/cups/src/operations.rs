use std::io;

use crate::client::{Cups, expect_success};
use crate::ipp::{Attributes, JOB, PRINTER, SUBSCRIPTION};

pub const SERVER: &str = "ipp://localhost/";
pub const PRINT_JOB: u16 = 0x0002;
const CANCEL_JOB: u16 = 0x0008;
const GET_JOB_ATTRIBUTES: u16 = 0x0009;
const GET_JOBS: u16 = 0x000a;
const GET_PRINTER_ATTRIBUTES: u16 = 0x000b;
const CREATE_SUBSCRIPTIONS: u16 = 0x0016;
const RENEW_SUBSCRIPTION: u16 = 0x0018;
const CANCEL_SUBSCRIPTION: u16 = 0x001b;
const CUPS_GET_DEFAULT: u16 = 0x4001;
const CUPS_GET_PRINTERS: u16 = 0x4002;
const CUPS_ADD_MODIFY_PRINTER: u16 = 0x4003;
const CUPS_DELETE_PRINTER: u16 = 0x4004;
const CUPS_GET_DEVICES: u16 = 0x400b;
const CUPS_GET_PPDS: u16 = 0x400c;
const CUPS_CREATE_LOCAL_PRINTER: u16 = 0x4028;
const NOT_FOUND: u16 = 0x0406;
const IDLE: i32 = 3;
pub const LEASE_SECONDS: i32 = 3600;
const EVENTS: [&str; 7] = [
    "job-created",
    "job-completed",
    "job-state-changed",
    "job-state",
    "printer-added",
    "printer-deleted",
    "printer-state-changed",
];
const JOB_ATTRIBUTES: [&str; 6] = [
    "job-id",
    "job-name",
    "job-originating-user-name",
    "job-state",
    "job-printer-uri",
    "time-at-creation",
];
const DEVICE_ATTRIBUTES: [&str; 5] = [
    "device-uri",
    "device-class",
    "device-info",
    "device-make-and-model",
    "device-id",
];
const DRIVER_ATTRIBUTES: [&str; 2] = ["ppd-name", "ppd-make-and-model"];

pub fn printer_uri(name: &str) -> String {
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

#[derive(Default)]
pub struct Queue<'a> {
    pub device: Option<&'a str>,
    pub driver: Option<&'a str>,
    pub info: Option<&'a str>,
    pub location: Option<&'a str>,
    pub defaults: &'a [(&'a str, &'a str)],
}

impl Cups {
    pub async fn subscribe(&self) -> io::Result<i32> {
        let mut request = self.request(CREATE_SUBSCRIPTIONS, SERVER);
        request
            .group(SUBSCRIPTION)
            .uri("notify-recipient-uri", "dbus://")
            .keywords("notify-events", &EVENTS)
            .integer("notify-lease-duration", LEASE_SECONDS);
        let response = self.send(request).await?;
        response
            .integer("notify-subscription-id")
            .filter(|_| response.successful())
            .ok_or_else(|| io::Error::other("The printing service refused to send updates"))
    }

    pub async fn renew(&self, subscription: i32) -> io::Result<()> {
        let mut request = self.request(RENEW_SUBSCRIPTION, SERVER);
        request
            .integer("notify-subscription-id", subscription)
            .group(SUBSCRIPTION)
            .integer("notify-lease-duration", LEASE_SECONDS);
        expect_success(&self.send(request).await?)
    }

    pub fn cancel_subscription(&self, subscription: i32) -> io::Result<()> {
        let mut request = self.request(CANCEL_SUBSCRIPTION, SERVER);
        request.integer("notify-subscription-id", subscription);
        expect_success(&self.send_blocking(request)?)
    }

    pub async fn job_owner(&self, printer: &str, job: u32) -> io::Result<String> {
        let mut request = self.request(GET_JOB_ATTRIBUTES, printer);
        request
            .integer("job-id", job as i32)
            .keywords("requested-attributes", &["job-originating-user-name"]);
        let response = self.send(request).await?;
        Ok(response
            .text("job-originating-user-name")
            .unwrap_or_default()
            .to_owned())
    }

    pub async fn printer(&self, printer: &str, attributes: &[&str]) -> io::Result<Attributes> {
        let mut request = self.request(GET_PRINTER_ATTRIBUTES, printer);
        request.keywords("requested-attributes", attributes);
        let response = self.send(request).await?;
        expect_success(&response)?;
        Ok(response
            .into_groups(PRINTER)
            .into_iter()
            .next()
            .unwrap_or_default())
    }

    pub async fn printers(&self, attributes: &[&str]) -> io::Result<Vec<Attributes>> {
        let mut request = self.request(CUPS_GET_PRINTERS, SERVER);
        request.keywords("requested-attributes", attributes);
        let response = self.send(request).await?;
        if response.status == NOT_FOUND {
            return Ok(Vec::new());
        }
        expect_success(&response)?;
        Ok(response.into_groups(PRINTER))
    }

    pub async fn default_printer(&self) -> io::Result<Option<String>> {
        let mut request = self.request(CUPS_GET_DEFAULT, SERVER);
        request.keywords("requested-attributes", &["printer-name"]);
        let response = self.send(request).await?;
        Ok(response.text("printer-name").map(str::to_owned))
    }

    pub async fn jobs(&self) -> io::Result<Vec<Attributes>> {
        let mut request = self.request(GET_JOBS, SERVER);
        request
            .keywords("which-jobs", &["not-completed"])
            .keywords("requested-attributes", &JOB_ATTRIBUTES);
        let response = self.send(request).await?;
        if response.status == NOT_FOUND {
            return Ok(Vec::new());
        }
        expect_success(&response)?;
        Ok(response.into_groups(JOB))
    }

    pub async fn cancel_job(&self, printer: &str, job: u32) -> io::Result<()> {
        let mut request = self.request(CANCEL_JOB, &printer_uri(printer));
        request.integer("job-id", job as i32);
        expect_success(&self.send(request).await?)
    }

    pub async fn create_local(
        &self,
        name: &str,
        device: &str,
        info: &str,
        location: &str,
    ) -> io::Result<()> {
        let mut request = self.request(CUPS_CREATE_LOCAL_PRINTER, SERVER);
        request
            .group(PRINTER)
            .name("printer-name", name)
            .uri("device-uri", device)
            .text("printer-info", info)
            .text("printer-location", location);
        expect_success(&self.send(request).await?)
    }

    pub async fn keep(&self, name: &str, queue: &Queue<'_>) -> io::Result<()> {
        let mut request = self.request(CUPS_ADD_MODIFY_PRINTER, &printer_uri(name));
        request.group(PRINTER);
        if let Some(device) = queue.device {
            request.uri("device-uri", device);
        }
        if let Some(info) = queue.info {
            request.text("printer-info", info);
        }
        if let Some(location) = queue.location {
            request.text("printer-location", location);
        }
        if let Some(driver) = queue.driver {
            request.name("ppd-name", driver);
        }
        for (name, value) in queue.defaults {
            request.keywords(name, &[value]);
        }
        request
            .boolean("printer-is-temporary", false)
            .boolean("printer-is-shared", false)
            .boolean("printer-is-accepting-jobs", true)
            .enumeration("printer-state", IDLE);
        expect_success(&self.send(request).await?)
    }

    pub async fn delete(&self, name: &str) -> io::Result<()> {
        let request = self.request(CUPS_DELETE_PRINTER, &printer_uri(name));
        expect_success(&self.send(request).await?)
    }

    pub async fn devices(&self, timeout: i32, schemes: &[&str]) -> io::Result<Vec<Attributes>> {
        let mut request = self.request(CUPS_GET_DEVICES, SERVER);
        request
            .integer("timeout", timeout)
            .keywords("requested-attributes", &DEVICE_ATTRIBUTES);
        if !schemes.is_empty() {
            request.names("include-schemes", schemes);
        }
        let response = self.send(request).await?;
        if response.status == NOT_FOUND {
            return Ok(Vec::new());
        }
        expect_success(&response)?;
        Ok(response.into_groups(PRINTER))
    }

    pub async fn drivers(&self, make: &str) -> io::Result<Vec<Attributes>> {
        let mut request = self.request(CUPS_GET_PPDS, SERVER);
        request
            .text("ppd-make", make)
            .keywords("requested-attributes", &DRIVER_ATTRIBUTES);
        let response = self.send(request).await?;
        if response.status == NOT_FOUND {
            return Ok(Vec::new());
        }
        expect_success(&response)?;
        Ok(response.into_groups(PRINTER))
    }
}
