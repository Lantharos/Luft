const BASE_BLOCK_SIZE: usize = 4096;
const BIN_HEADER_SIZE: usize = 32;
const CHECKSUMMED_BYTES: usize = 508;
const NO_CELL: u32 = u32::MAX;
const ROOT_KEY: u16 = 0x0004;
const ASCII_NAME: u16 = 0x0020;
const REG_SZ: u32 = 1;
const REG_DWORD: u32 = 4;
const INLINE_DATA: u32 = 0x8000_0000;

pub(super) enum Data {
    String(&'static str),
    Dword(u32),
}

#[derive(Default)]
pub(super) struct Key {
    name: &'static str,
    values: Vec<(&'static str, Data)>,
    subkeys: Vec<Key>,
}

impl Key {
    pub(super) fn set(mut self, path: &'static str, name: &'static str, data: Data) -> Self {
        let mut key = &mut self;
        for component in path.split('\\') {
            let index = match key
                .subkeys
                .iter()
                .position(|subkey| subkey.name == component)
            {
                Some(index) => index,
                None => {
                    key.subkeys.push(Key {
                        name: component,
                        ..Key::default()
                    });
                    key.subkeys.len() - 1
                }
            };
            key = &mut key.subkeys[index];
        }
        key.values.push((name, data));
        self
    }

    pub(super) fn build(&self) -> Vec<u8> {
        let mut cells = Cells(vec![0; BIN_HEADER_SIZE]);
        let root = self.write(&mut cells, ROOT_KEY);
        let mut bin = cells.0;
        let free = bin.len().next_multiple_of(BASE_BLOCK_SIZE) - bin.len();
        if free > 0 {
            bin.extend((free as i32).to_le_bytes());
            bin.resize(bin.len() + free - 4, 0);
        }
        let bin_size = bin.len() as u32;
        bin[..4].copy_from_slice(b"hbin");
        bin[8..12].copy_from_slice(&bin_size.to_le_bytes());

        let mut hive = base_block(root, bin_size);
        hive.extend(bin);
        hive
    }

    fn write(&self, cells: &mut Cells, flags: u16) -> u32 {
        let mut subkeys: Vec<&Key> = self.subkeys.iter().collect();
        subkeys.sort_by_key(|subkey| subkey.name.to_ascii_uppercase());
        let children: Vec<(u32, &str)> = subkeys
            .iter()
            .map(|subkey| (subkey.write(cells, 0), subkey.name))
            .collect();
        let subkey_list = if children.is_empty() {
            NO_CELL
        } else {
            let mut list = b"lf".to_vec();
            list.extend((children.len() as u16).to_le_bytes());
            for (offset, name) in &children {
                list.extend(offset.to_le_bytes());
                let mut hint = [0u8; 4];
                for (slot, byte) in hint.iter_mut().zip(name.bytes()) {
                    *slot = byte;
                }
                list.extend(hint);
            }
            cells.push(&list)
        };

        let values: Vec<u32> = self
            .values
            .iter()
            .map(|(name, data)| value(cells, name, data))
            .collect();
        let value_list = if values.is_empty() {
            NO_CELL
        } else {
            cells.push(
                &values
                    .iter()
                    .flat_map(|offset| offset.to_le_bytes())
                    .collect::<Vec<_>>(),
            )
        };

        let mut node = b"nk".to_vec();
        node.extend((flags | ASCII_NAME).to_le_bytes());
        node.extend([0; 8 + 4 + 4]);
        node.extend((children.len() as u32).to_le_bytes());
        node.extend(0u32.to_le_bytes());
        node.extend(subkey_list.to_le_bytes());
        node.extend(NO_CELL.to_le_bytes());
        node.extend((values.len() as u32).to_le_bytes());
        node.extend(value_list.to_le_bytes());
        node.extend(NO_CELL.to_le_bytes());
        node.extend(NO_CELL.to_le_bytes());
        node.extend([0; 4 * 5]);
        node.extend((self.name.len() as u16).to_le_bytes());
        node.extend(0u16.to_le_bytes());
        node.extend(self.name.as_bytes());
        cells.push(&node)
    }
}

fn value(cells: &mut Cells, name: &str, data: &Data) -> u32 {
    let (kind, size, offset) = match data {
        Data::Dword(dword) => (REG_DWORD, INLINE_DATA | 4, *dword),
        Data::String(string) => {
            let bytes: Vec<u8> = string
                .encode_utf16()
                .chain([0])
                .flat_map(u16::to_le_bytes)
                .collect();
            (REG_SZ, bytes.len() as u32, cells.push(&bytes))
        }
    };
    let mut value = b"vk".to_vec();
    value.extend((name.len() as u16).to_le_bytes());
    value.extend(size.to_le_bytes());
    value.extend(offset.to_le_bytes());
    value.extend(kind.to_le_bytes());
    value.extend(1u16.to_le_bytes());
    value.extend(0u16.to_le_bytes());
    value.extend(name.as_bytes());
    cells.push(&value)
}

fn base_block(root: u32, bin_size: u32) -> Vec<u8> {
    let mut block = vec![0u8; BASE_BLOCK_SIZE];
    let fields: [(usize, u32); 10] = [
        (4, 1),
        (8, 1),
        (20, 1),
        (24, 5),
        (28, 0),
        (32, 1),
        (36, root),
        (40, bin_size),
        (44, 1),
        (0, u32::from_le_bytes(*b"regf")),
    ];
    for (offset, field) in fields {
        block[offset..offset + 4].copy_from_slice(&field.to_le_bytes());
    }
    let checksum = block[..CHECKSUMMED_BYTES]
        .as_chunks::<4>()
        .0
        .iter()
        .fold(0u32, |sum, dword| sum ^ u32::from_le_bytes(*dword));
    let checksum = match checksum {
        0 => 1,
        u32::MAX => u32::MAX - 1,
        checksum => checksum,
    };
    block[CHECKSUMMED_BYTES..CHECKSUMMED_BYTES + 4].copy_from_slice(&checksum.to_le_bytes());
    block
}

struct Cells(Vec<u8>);

impl Cells {
    fn push(&mut self, body: &[u8]) -> u32 {
        let offset = self.0.len();
        let size = (4 + body.len()).next_multiple_of(8);
        self.0.extend((-(size as i32)).to_le_bytes());
        self.0.extend(body);
        self.0.resize(offset + size, 0);
        offset as u32
    }
}
