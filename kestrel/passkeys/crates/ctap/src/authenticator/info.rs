use ciborium::Value;

use super::response;
use crate::auth_data::AAGUID;
use crate::cbor;
use crate::model::ES256;

const MAX_MESSAGE_SIZE: i64 = 7609;
const MAX_CREDENTIALS_IN_LIST: i64 = 64;
const MAX_CREDENTIAL_ID_LENGTH: i64 = 64;

pub fn get_info() -> Value {
    let options = [
        ("rk", true),
        ("up", true),
        ("uv", true),
        ("plat", false),
        ("credMgmt", true),
        ("pinUvAuthToken", true),
    ];
    response([
        (
            0x01,
            Value::Array(vec!["FIDO_2_0".into(), "FIDO_2_1".into()]),
        ),
        (
            0x02,
            Value::Array(vec!["credProtect".into(), "hmac-secret".into()]),
        ),
        (0x03, Value::Bytes(AAGUID.to_vec())),
        (
            0x04,
            cbor::map(options.map(|(name, enabled)| (name, Value::from(enabled)))),
        ),
        (0x05, Value::from(MAX_MESSAGE_SIZE)),
        (0x06, Value::Array(vec![2.into(), 1.into()])),
        (0x07, Value::from(MAX_CREDENTIALS_IN_LIST)),
        (0x08, Value::from(MAX_CREDENTIAL_ID_LENGTH)),
        (0x09, Value::Array(vec!["usb".into()])),
        (
            0x0A,
            Value::Array(vec![cbor::map([
                ("alg", Value::from(ES256)),
                ("type", Value::from("public-key")),
            ])]),
        ),
        (0x0E, Value::from(1)),
    ])
}
