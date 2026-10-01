mod cups;
mod ipp;
mod messages;

use std::collections::{HashMap, HashSet};
use std::time::Duration;

use futures_util::StreamExt;
use tokio::time::{Instant, interval, sleep_until};
use zbus::message::Type;
use zbus::{Connection, MatchRule, Message, MessageStream};

use crate::context::Context;
use crate::shared::notify::{self, Notification, URGENCY_CRITICAL, URGENCY_NORMAL};
use cups::{Cups, LEASE_SECONDS};
use messages::{CONNECTING, PROCESSING};

const NOTIFIER: &str = "org.cups.cupsd.Notifier";
const RETRY: Duration = Duration::from_secs(300);
const CONNECTING_GRACE: Duration = Duration::from_secs(60);
const REMOTE_PRINTER: i32 = 0x0002;
const DISCOVERED_PRINTER: i32 = 0x0100_0000;

type PrinterEvent = (String, String, String, u32, String, bool);
type JobEvent = (
    String,
    String,
    String,
    u32,
    String,
    bool,
    u32,
    u32,
    String,
    String,
    u32,
);

struct Printers {
    session: Connection,
    cups: Cups,
    subscription: Option<i32>,
    renewed_at: Option<Instant>,
    owned_jobs: HashMap<u32, bool>,
    job_notifications: HashMap<u32, u32>,
    printing: HashSet<String>,
    reasons: HashMap<String, Vec<String>>,
    reason_notifications: HashMap<(String, String), u32>,
    unreachable_since: HashMap<String, Instant>,
}

pub async fn start(context: &Context) -> zbus::Result<()> {
    let rule = MatchRule::builder()
        .msg_type(Type::Signal)
        .interface(NOTIFIER)?
        .path("/org/cups/cupsd/Notifier")?
        .build();
    let mut events = MessageStream::for_match_rule(rule, &context.system, None).await?;
    let mut printers = Printers {
        session: context.session.clone(),
        cups: Cups::new(),
        subscription: None,
        renewed_at: None,
        owned_jobs: HashMap::new(),
        job_notifications: HashMap::new(),
        printing: HashSet::new(),
        reasons: HashMap::new(),
        reason_notifications: HashMap::new(),
        unreachable_since: HashMap::new(),
    };
    tokio::spawn(async move {
        let renewal = Duration::from_secs(LEASE_SECONDS as u64 - 100);
        let mut keep_up = interval(RETRY.min(renewal));
        loop {
            let next_unreachable = printers
                .unreachable_since
                .values()
                .min()
                .map(|since| *since + CONNECTING_GRACE);
            tokio::select! {
                _ = keep_up.tick() => printers.keep_subscribed(renewal).await,
                Some(Ok(message)) = events.next() => printers.handle(&message).await,
                () = sleep_until(next_unreachable.unwrap_or_else(Instant::now)), if next_unreachable.is_some() => {
                    printers.report_unreachable().await;
                }
            }
        }
    });
    Ok(())
}

impl Printers {
    async fn keep_subscribed(&mut self, renewal: Duration) {
        if self.subscription.is_some() && self.renewed_at.is_some_and(|at| at.elapsed() < renewal) {
            return;
        }
        let renewed = match self.subscription {
            Some(subscription) => match self.cups.renew(subscription).await {
                Ok(()) => Ok(subscription),
                Err(_) => self.cups.subscribe().await,
            },
            None => self.cups.subscribe().await,
        };
        match renewed {
            Ok(subscription) => self.subscription = Some(subscription),
            Err(error) if self.subscription.is_some() || self.renewed_at.is_none() => {
                self.subscription = None;
                eprintln!("Printer updates are unavailable: {error}");
            }
            Err(_) => {}
        }
        self.renewed_at = Some(Instant::now());
    }

    async fn handle(&mut self, message: &Message) {
        let header = message.header();
        let Some(member) = header.member() else {
            return;
        };
        let body = message.body();
        match member.as_str() {
            "JobCreated" | "JobState" | "JobCompleted" => {
                if let Ok(event) = body.deserialize::<JobEvent>() {
                    self.job_changed(event).await;
                }
            }
            "PrinterStateChanged" => {
                if let Ok((_, _, printer, _, reasons, _)) = body.deserialize::<PrinterEvent>() {
                    self.reasons_changed(printer, &reasons).await;
                }
            }
            "PrinterAdded" => {
                if let Ok((_, uri, printer, ..)) = body.deserialize::<PrinterEvent>() {
                    self.printer_added(&uri, &printer).await;
                }
            }
            _ => {}
        }
    }

    async fn owns(&mut self, printer_uri: &str, job: u32) -> bool {
        if let Some(owned) = self.owned_jobs.get(&job) {
            return *owned;
        }
        let owned = self
            .cups
            .job_owner(printer_uri, job)
            .await
            .is_ok_and(|owner| owner == self.cups.user());
        self.owned_jobs.insert(job, owned);
        owned
    }

    async fn job_changed(&mut self, event: JobEvent) {
        let (_, printer_uri, printer, _, _, _, job, state, _, name, _) = event;
        if !self.owns(&printer_uri, job).await {
            return;
        }
        if state == PROCESSING {
            self.printing.insert(printer.clone());
        }
        if let Some(summary) = messages::job_summary(state) {
            let body = format!("“{name}” on {printer}");
            let replaces = self.job_notifications.get(&job).copied().unwrap_or(0);
            let id = self.show(summary, &body, URGENCY_NORMAL, replaces).await;
            self.job_notifications.insert(job, id);
        }
        if messages::job_finished(state) {
            self.owned_jobs.remove(&job);
            self.job_notifications.remove(&job);
            self.printing.remove(&printer);
        }
    }

    async fn reasons_changed(&mut self, printer: String, reasons: &str) {
        let current: Vec<String> = reasons
            .split(',')
            .filter(|reason| !reason.is_empty())
            .map(str::to_owned)
            .collect();
        if !current.iter().any(|reason| reason.starts_with(CONNECTING)) {
            self.unreachable_since.remove(&printer);
        }
        let gone: Vec<(String, String)> = self
            .reason_notifications
            .keys()
            .filter(|(name, reason)| *name == printer && !current.contains(reason))
            .cloned()
            .collect();
        for key in gone {
            if let Some(id) = self.reason_notifications.remove(&key) {
                notify::close(&self.session, id).await;
            }
        }
        let previous = self
            .reasons
            .insert(printer.clone(), current.clone())
            .unwrap_or_default();
        if !self.printing.contains(&printer) {
            return;
        }
        for reason in current.iter().filter(|reason| !previous.contains(reason)) {
            if reason.starts_with(CONNECTING) {
                self.unreachable_since
                    .insert(printer.clone(), Instant::now());
                continue;
            }
            self.report(&printer, reason).await;
        }
    }

    async fn report(&mut self, printer: &str, reason: &str) {
        if let Some((summary, body)) = messages::reason(reason, printer) {
            let id = self.show(&summary, &body, URGENCY_CRITICAL, 0).await;
            self.reason_notifications
                .insert((printer.to_owned(), reason.to_owned()), id);
        }
    }

    async fn report_unreachable(&mut self) {
        let now = Instant::now();
        let due: Vec<String> = self
            .unreachable_since
            .iter()
            .filter(|(_, since)| now - **since >= CONNECTING_GRACE)
            .map(|(printer, _)| printer.clone())
            .collect();
        for printer in due {
            self.unreachable_since.remove(&printer);
            self.report(&printer, CONNECTING).await;
        }
    }

    async fn printer_added(&mut self, uri: &str, printer: &str) {
        let Ok(kind) = self.cups.printer_type(uri).await else {
            return;
        };
        if kind & (REMOTE_PRINTER | DISCOVERED_PRINTER) == 0 {
            self.show("Printer added", printer, URGENCY_NORMAL, 0).await;
        }
    }

    async fn show(&self, summary: &str, body: &str, urgency: u8, replaces: u32) -> u32 {
        let shown = Notification {
            app: "Printers",
            icon: "printer-symbolic",
            summary,
            body,
            actions: &[],
            urgency,
            transient: false,
        }
        .show(&self.session, replaces)
        .await;
        shown.unwrap_or_else(|error| {
            eprintln!("Couldn't show a printer notification: {error}");
            replaces
        })
    }
}

impl Drop for Printers {
    fn drop(&mut self) {
        if let Some(subscription) = self.subscription
            && let Err(error) = self.cups.cancel(subscription)
        {
            eprintln!("Couldn't stop printer updates: {error}");
        }
    }
}
