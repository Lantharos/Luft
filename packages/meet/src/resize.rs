use serde::{Deserialize, Serialize};

use crate::handoff::partition_guid;

pub const VARIABLE: &str = "LuftResize";
pub const VENDOR: &str = "b6a4c1e2-3f5d-4c8a-9e71-2d0f6a8b5c3e";
pub const ROOT_TYPE: &str = "4f68bce3-e8cd-4db1-96e7-fbcaf984b709";
pub const STARTUP_TYPE: &str = "bc13c2ff-59e6-4262-a352-b275fd6f7172";
pub const ROOT_NAME: &str = "Luft";
const LARGEST: usize = 512;

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(tag = "change", rename_all = "camelCase")]
pub enum Change {
    Grow,
    Shrink { bytes: u64 },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Request {
    #[serde(flatten)]
    pub change: Change,
    pub partition: String,
}

impl Request {
    pub fn parse(bytes: &[u8]) -> Result<Self, String> {
        if bytes.len() > LARGEST {
            return Err("The request is too long".to_owned());
        }
        let mut request: Self = serde_json::from_slice(bytes).map_err(|error| error.to_string())?;
        request.partition = partition_guid(&request.partition);
        if request.partition.len() != 36 {
            return Err(format!("{} isn't a partition GUID", request.partition));
        }
        Ok(request)
    }

    pub fn to_bytes(&self) -> Vec<u8> {
        serde_json::to_vec(self).expect("a request always serializes")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_request_names_the_change_and_luft_s_partition() {
        let request = Request {
            change: Change::Shrink { bytes: 20 << 30 },
            partition: "0a1b2c3d-0000-4000-8000-00000000aaaa".into(),
        };
        assert_eq!(Request::parse(&request.to_bytes()).unwrap(), request);
        let windows = br#"{"change":"grow","partition":"{0A1B2C3D-0000-4000-8000-00000000AAAA}"}"#;
        let parsed = Request::parse(windows).unwrap();
        assert_eq!(parsed.change, Change::Grow);
        assert_eq!(parsed.partition, "0a1b2c3d-0000-4000-8000-00000000aaaa");
        assert!(Request::parse(br#"{"change":"grow","partition":"sda"}"#).is_err());
    }
}
