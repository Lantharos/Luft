use luft_disks::moving;
use luft_disks::systems::{self, luft};
use luft_disks::udisks::{self, snapshot};
use luft_trust::Outcome;

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
        [command] if command == "rooms" => {
            let drives = snapshot::build(&udisks::objects().await?).drives;
            let rooms: Vec<_> = drives.iter().flat_map(|drive| &drive.luft).collect();
            serde_json::to_string(&rooms)
        }
        [command, offset] if command == "gift" => serde_json::to_string(
            &luft::preview(offset.parse().map_err(|_| "Not an offset")?).await?,
        ),
        [command, unlock] if command == "grow" => {
            serde_json::to_string(&match luft::grow(unlock).await? {
                Outcome::Done(grown) => grown,
                Outcome::WrongKey(message) => return Err(message),
            })
        }
        [command] if command == "grow-at-start" => {
            serde_json::to_string(&luft::grow_at_start().await?)
        }
        [command] if command == "cancel" => serde_json::to_string(&luft::cancel_resize().await?),
        [command] if command == "move-options" => serde_json::to_string(&moving::options().await?),
        [command, choice] if command == "move" => serde_json::to_string(
            &moving::apply(serde_json::from_str(choice).map_err(|error| error.to_string())?)
                .await?,
        ),
        [command] if command == "cancel-move" => serde_json::to_string(&moving::cancel().await?),
        [command, block, size] if command == "give-back" => serde_json::to_string(
            &systems::give_back(block, size.parse().map_err(|_| "Not a size")?).await?,
        ),
        _ => {
            return Err(
                "Usage: other-systems list | remove ID | rooms | gift OFFSET | grow KEY | grow-at-start | cancel | move-options | move CHOICE | cancel-move | give-back BLOCK SIZE"
                    .to_owned(),
            );
        }
    };
    println!("{}", output.map_err(|error| error.to_string())?);
    Ok(())
}
