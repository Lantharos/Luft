mod service;

#[tokio::main(flavor = "current_thread")]
async fn main() -> anyhow::Result<()> {
    luft_dbus::panics::report();
    service::run().await
}
