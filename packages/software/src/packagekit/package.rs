use serde::Serialize;

#[derive(Serialize, Clone, Debug, PartialEq, Eq, Hash)]
#[serde(rename_all = "camelCase")]
pub struct PackageId {
    pub id: String,
    pub name: String,
    pub version: String,
    pub arch: String,
    pub data: String,
}

impl PackageId {
    pub fn parse(id: &str) -> Option<Self> {
        let mut parts = id.split(';');
        let (name, version, arch, data) =
            (parts.next()?, parts.next()?, parts.next()?, parts.next()?);
        Some(Self {
            id: id.to_owned(),
            name: name.to_owned(),
            version: version.to_owned(),
            arch: arch.to_owned(),
            data: data.to_owned(),
        })
    }
}

#[derive(Clone, Debug)]
pub struct Package {
    pub id: PackageId,
    pub info: u32,
    pub summary: String,
}

impl Package {
    pub fn new(info: u32, id: &str, summary: String) -> Option<Self> {
        Some(Self {
            id: PackageId::parse(id)?,
            info: info & 0xffff,
            summary,
        })
    }
}
