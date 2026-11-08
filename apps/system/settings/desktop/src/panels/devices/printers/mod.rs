mod queue;
mod setup;

use std::collections::HashMap;

use futures_util::StreamExt;
use luft_app::dbus::explain;
use luft_app::{Commands, Empty, Events};
use sabine::{BridgeEvent, SabineWindow};
use serde::{Deserialize, Serialize};
use tokio::sync::OnceCell;

const PRINTERS_CHANGED: BridgeEvent<PrintersState> = BridgeEvent::new("printers.changed");

static WATCH: OnceCell<()> = OnceCell::const_new();

#[derive(Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
struct PrintersState {
    printers: Vec<queue::Printer>,
    jobs: Vec<queue::PrintJob>,
}

#[derive(Deserialize, specta::Type)]
struct PrinterName {
    name: String,
}

#[derive(Deserialize, specta::Type)]
struct JobChoice {
    printer: String,
    job: u32,
}

#[derive(Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
struct DriverQuery {
    device_id: String,
    model: String,
}

#[derive(Deserialize, specta::Type)]
struct NewPrinter {
    device: String,
    driver: String,
    name: String,
    location: String,
}

#[derive(Deserialize, specta::Type)]
struct PrinterOptions {
    name: String,
    options: HashMap<String, String>,
}

async fn read() -> Result<PrintersState, String> {
    let (printers, jobs) = tokio::join!(queue::printers(), queue::jobs());
    Ok(PrintersState {
        printers: printers?,
        jobs: jobs.unwrap_or_default(),
    })
}

async fn watch(events: Events) -> Result<(), String> {
    let mut changes = queue::proxy()
        .await?
        .receive_changed()
        .await
        .map_err(|error| explain(&error))?;
    luft_app::spawn(async move {
        while changes.next().await.is_some() {
            if let Ok(state) = read().await {
                events.emit(PRINTERS_CHANGED, state);
            }
        }
    });
    Ok(())
}

async fn state(events: Events, Empty {}: Empty) -> Result<PrintersState, String> {
    WATCH.get_or_try_init(|| watch(events)).await?;
    read().await
}

async fn set_default(PrinterName { name }: PrinterName) -> Result<(), String> {
    queue::proxy()
        .await?
        .set_default(&name)
        .await
        .map_err(|error| explain(&error))
}

async fn test_page(PrinterName { name }: PrinterName) -> Result<u32, String> {
    queue::proxy()
        .await?
        .print_test_page(&name)
        .await
        .map_err(|error| explain(&error))
}

async fn cancel_job(JobChoice { printer, job }: JobChoice) -> Result<(), String> {
    queue::proxy()
        .await?
        .cancel_job(&printer, job)
        .await
        .map_err(|error| explain(&error))
}

async fn drivers(
    DriverQuery { device_id, model }: DriverQuery,
) -> Result<Vec<setup::PrinterDriver>, String> {
    setup::drivers(&device_id, &model).await
}

async fn add(
    NewPrinter {
        device,
        driver,
        name,
        location,
    }: NewPrinter,
) -> Result<String, String> {
    setup::add(&device, &driver, &name, &location).await
}

async fn remove(PrinterName { name }: PrinterName) -> Result<(), String> {
    setup::remove(&name).await
}

async fn configure(PrinterOptions { name, options }: PrinterOptions) -> Result<(), String> {
    setup::configure(&name, &options).await
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&PRINTERS_CHANGED)
        .with_async("printers_state", events, state)
        .command_async("printers_set_default", set_default)
        .command_async("printers_test_page", test_page)
        .command_async("printers_cancel_job", cancel_job)
        .command_async("printers_devices", |Empty {}| setup::devices())
        .command_async("printers_drivers", drivers)
        .command_async("printers_add", add)
        .command_async("printers_remove", remove)
        .command_async("printers_configure", configure)
}
