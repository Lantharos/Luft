use std::collections::HashMap;

use luft_meet::resize::ROOT_TYPE;
use wmi::{Variant, WMIConnection};

pub fn luft_installed() -> bool {
    WMIConnection::with_namespace_path(r"ROOT\Microsoft\Windows\Storage")
        .ok()
        .and_then(|wmi| {
            wmi.raw_query::<HashMap<String, Variant>>(format!(
                "SELECT DiskNumber FROM MSFT_Partition WHERE GptType = '{{{ROOT_TYPE}}}'"
            ))
            .ok()
        })
        .is_some_and(|found| !found.is_empty())
}
