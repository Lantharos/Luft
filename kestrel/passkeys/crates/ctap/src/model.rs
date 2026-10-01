use ciborium::Value;
use p256::elliptic_curve::sec1::ToSec1Point;

use crate::cbor::{self, Fields};
use crate::status::{Result, Status};

const EC2: i64 = 2;
const P256: i64 = 1;
pub const ES256: i64 = -7;
pub const ECDH_ES_HKDF_256: i64 = -25;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RelyingParty {
    pub id: String,
    pub name: Option<String>,
}

impl RelyingParty {
    pub fn parse(value: &Value) -> Result<Self> {
        let fields = Fields::new(value)?;
        Ok(Self {
            id: cbor::text(fields.required("id")?)?.to_owned(),
            name: fields
                .get("name")
                .map(cbor::text)
                .transpose()?
                .map(str::to_owned),
        })
    }

    pub fn to_cbor(&self) -> Value {
        let mut entries = vec![("id", Value::from(self.id.as_str()))];
        entries.extend(self.name.as_deref().map(|name| ("name", Value::from(name))));
        cbor::map(entries)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct User {
    pub id: Vec<u8>,
    pub name: Option<String>,
    pub display_name: Option<String>,
}

impl User {
    pub fn parse(value: &Value) -> Result<Self> {
        let fields = Fields::new(value)?;
        let id = cbor::bytes(fields.required("id")?)?;
        if id.is_empty() || id.len() > 64 {
            return Err(Status::InvalidParameter);
        }
        let text = |key| {
            fields
                .get(key)
                .map(cbor::text)
                .transpose()
                .map(|text| text.map(str::to_owned))
        };
        Ok(Self {
            id: id.to_vec(),
            name: text("name")?,
            display_name: text("displayName")?,
        })
    }

    pub fn to_cbor(&self, identifying: bool) -> Value {
        let mut entries = vec![("id", Value::Bytes(self.id.clone()))];
        if identifying {
            entries.extend(self.name.as_deref().map(|name| ("name", Value::from(name))));
            entries.extend(
                self.display_name
                    .as_deref()
                    .map(|name| ("displayName", Value::from(name))),
            );
        }
        cbor::map(entries)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct PublicKey {
    pub x: [u8; 32],
    pub y: [u8; 32],
}

impl PublicKey {
    pub fn from_p256(key: &p256::PublicKey) -> Self {
        let point = key.to_sec1_point(false);
        let bytes = point.as_bytes();
        Self {
            x: bytes[1..33].try_into().expect("uncompressed point"),
            y: bytes[33..65].try_into().expect("uncompressed point"),
        }
    }

    pub fn to_p256(self) -> Result<p256::PublicKey> {
        p256::PublicKey::from_sec1_bytes(&[[4].as_slice(), &self.x, &self.y].concat())
            .map_err(|_| Status::InvalidParameter)
    }

    pub fn to_cose(self, algorithm: i64) -> Value {
        cbor::map([
            (1, Value::from(EC2)),
            (3, Value::from(algorithm)),
            (-1, Value::from(P256)),
            (-2, Value::Bytes(self.x.to_vec())),
            (-3, Value::Bytes(self.y.to_vec())),
        ])
    }

    pub fn from_cose(value: &Value) -> Result<Self> {
        let fields = Fields::new(value)?;
        if cbor::integer(fields.required(1)?)? != EC2
            || cbor::integer(fields.required(-1)?)? != P256
        {
            return Err(Status::InvalidParameter);
        }
        let coordinate = |key| -> Result<[u8; 32]> {
            cbor::bytes(fields.required(key)?)?
                .try_into()
                .map_err(|_| Status::InvalidParameter)
        };
        Ok(Self {
            x: coordinate(-2)?,
            y: coordinate(-3)?,
        })
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Protection {
    UvOptional = 1,
    UvOptionalWithCredentialIdList = 2,
    UvRequired = 3,
}

impl Protection {
    pub fn from_level(level: i64) -> Result<Self> {
        match level {
            1 => Ok(Self::UvOptional),
            2 => Ok(Self::UvOptionalWithCredentialIdList),
            3 => Ok(Self::UvRequired),
            _ => Err(Status::InvalidParameter),
        }
    }

    pub fn level(self) -> i64 {
        self as i64
    }

    pub fn allows(self, verified: bool, listed: bool) -> bool {
        verified
            || match self {
                Self::UvOptional => true,
                Self::UvOptionalWithCredentialIdList => listed,
                Self::UvRequired => false,
            }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Credential {
    pub id: Vec<u8>,
    pub rp: RelyingParty,
    pub user: User,
    pub public_key: PublicKey,
    pub discoverable: bool,
    pub protection: Protection,
}

#[derive(Debug, Clone)]
pub struct NewCredential {
    pub rp: RelyingParty,
    pub user: User,
    pub discoverable: bool,
    pub protection: Protection,
}

pub fn descriptor(id: &[u8]) -> Value {
    cbor::map([
        ("id", Value::Bytes(id.to_vec())),
        ("type", Value::from("public-key")),
    ])
}

pub fn descriptor_ids(value: &Value) -> Result<Vec<Vec<u8>>> {
    let mut ids = Vec::new();
    for entry in cbor::array(value)? {
        let fields = Fields::new(entry)?;
        let id = cbor::bytes(fields.required("id")?)?;
        if cbor::text(fields.required("type")?)? == "public-key" {
            ids.push(id.to_vec());
        }
    }
    Ok(ids)
}
