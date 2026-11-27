mod defaults;
mod discovery;
mod home;
mod printer;
mod printing;

use std::sync::Arc;
use std::time::Duration;

use futures_util::StreamExt;
use luft_cups::{Cups, LEASE_SECONDS};
use luft_i18n::t;
use tokio::sync::mpsc::{UnboundedReceiver, UnboundedSender, unbounded_channel};
use tokio::time::{Instant, interval, sleep};
use zbus::message::Type;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, MatchRule, Message, MessageStream};

use crate::L10N;
use crate::context::Context;
use crate::shared::notify::{Notification, Sound, URGENCY_NORMAL};
use discovery::Discovered;
use printing::Printing;

const NOTIFIER: &str = "org.cups.cupsd.Notifier";
const RETRY: Duration = Duration::from_secs(300);
const SETTLE: Duration = Duration::from_millis(250);
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
    cups: Arc<Cups>,
    changed: UnboundedSender<()>,
    subscription: Option<i32>,
    renewed_at: Option<Instant>,
}

fn user() -> String {
    glib::user_name().to_string_lossy().into_owned()
}

async fn announce(session: Connection, mut changed: UnboundedReceiver<()>) {
    while changed.recv().await.is_some() {
        sleep(SETTLE).await;
        while changed.try_recv().is_ok() {}
        if let Ok(emitter) = SignalEmitter::new(&session, printing::PATH)
            && let Err(error) = Printing::changed(&emitter).await
        {
            eprintln!("Couldn't announce a printer change: {error}");
        }
    }
}

pub async fn start(context: &Context) -> zbus::Result<()> {
    let cups = Arc::new(Cups::new(user()));
    let discovered = Arc::new(Discovered::default());
    let (changed, announced) = unbounded_channel();
    context
        .session
        .object_server()
        .at(
            printing::PATH,
            Printing::new(cups.clone(), discovered.clone()),
        )
        .await?;
    tokio::spawn(announce(context.session.clone(), announced));
    let system = context.system.clone();
    let browsing = (cups.clone(), changed.clone());
    tokio::spawn(async move {
        let (cups, changed) = browsing;
        if let Err(error) = discovery::run(system, cups, discovered, changed).await {
            eprintln!("Printers on the network won't show up: {error}");
        }
    });
    let rule = MatchRule::builder()
        .msg_type(Type::Signal)
        .interface(NOTIFIER)
        .path("/org/cups/cupsd/Notifier")
        .build()?;
    let mut events = MessageStream::for_match_rule(rule, &context.system, None).await?;
    let mut printers = Printers {
        session: context.session.clone(),
        cups,
        changed,
        subscription: None,
        renewed_at: None,
    };
    tokio::spawn(async move {
        let renewal = Duration::from_secs(LEASE_SECONDS as u64 - 100);
        let mut keep_up = interval(RETRY.min(renewal));
        loop {
            tokio::select! {
                _ = keep_up.tick() => printers.keep_subscribed(renewal).await,
                Some(Ok(message)) = events.next() => printers.handle(&message).await,
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
        let _ = self.changed.send(());
        match member.as_str() {
            "JobCompleted" => {
                if let Ok(event) = body.deserialize::<JobEvent>() {
                    self.job_finished(event).await;
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

    async fn job_finished(&self, event: JobEvent) {
        let (_, printer_uri, printer, _, _, _, job, state, _, name, _) = event;
        let owned = self
            .cups
            .job_owner(&printer_uri, job)
            .await
            .is_ok_and(|owner| owner == self.cups.user());
        if !owned {
            return;
        }
        if let Ok(emitter) = SignalEmitter::new(&self.session, printing::PATH)
            && let Err(error) = Printing::job_finished(&emitter, job, &printer, &name, state).await
        {
            eprintln!("Couldn't announce a finished print job: {error}");
        }
    }

    async fn printer_added(&mut self, uri: &str, printer: &str) {
        let Ok(added) = self
            .cups
            .printer(uri, &["printer-type", "printer-is-temporary"])
            .await
        else {
            return;
        };
        let kind = added.integer("printer-type").unwrap_or_default();
        if kind & (REMOTE_PRINTER | DISCOVERED_PRINTER) == 0
            && !added.boolean("printer-is-temporary")
        {
            self.show(&t!(L10N, "printer-added"), printer).await;
        }
    }

    async fn show(&self, summary: &str, body: &str) {
        let shown = Notification {
            app: "Printers",
            icon: "printer-symbolic",
            summary,
            body,
            actions: &[],
            urgency: URGENCY_NORMAL,
            transient: false,
            sound: Sound::Usual,
            shows_when_locked: false,
        }
        .show(&self.session, 0)
        .await;
        if let Err(error) = shown {
            eprintln!("Couldn't show a printer notification: {error}");
        }
    }
}

impl Drop for Printers {
    fn drop(&mut self) {
        if let Some(subscription) = self.subscription
            && let Err(error) = self.cups.cancel_subscription(subscription)
        {
            eprintln!("Couldn't stop printer updates: {error}");
        }
    }
}
