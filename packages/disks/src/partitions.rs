use zbus::Variant;

use crate::mounting;
use crate::udisks::{self, PARTITION, no_options};

pub async fn delete(block: &str) -> Result<(), String> {
    mounting::release(block).await?;
    let mut options = no_options();
    options.insert("tear-down", Variant::from(true));
    udisks::run(block, PARTITION, "Delete", &(options,)).await
}
