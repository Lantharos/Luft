use crate::mounting;
use crate::udisks::{self, PARTITION};

pub async fn delete(block: &str) -> Result<(), String> {
    let objects = udisks::objects().await?;
    mounting::release_in(&objects, block).await?;
    let options = mounting::tear_down(&objects, block);
    udisks::run(block, PARTITION, "Delete", &(options,)).await
}
