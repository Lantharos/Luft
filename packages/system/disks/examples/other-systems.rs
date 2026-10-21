use luft_disks::systems;

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), String> {
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    let output = match arguments.as_slice() {
        [command] if command == "list" => serde_json::to_string(&systems::find().await?),
        [command, id] if command == "remove" => serde_json::to_string(
            &systems::remove(id, |step| {
                eprintln!("{}", serde_json::to_string(&step).unwrap_or_default());
            })
            .await?,
        ),
        _ => return Err("Usage: other-systems list | remove ID".to_owned()),
    };
    println!("{}", output.map_err(|error| error.to_string())?);
    Ok(())
}
