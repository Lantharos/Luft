use zeroize::Zeroizing;

const ALPHABET: &[u8; 32] = b"0123456789ABCDEFGHJKMNPQRSTVWXYZ";
pub const LENGTH: usize = 12;
const GROUP: usize = 4;

/// The code that opens a sealed moving box: twelve characters, 60 bits,
/// from an alphabet without letters that look like digits.
pub struct Code(Zeroizing<[u8; LENGTH]>);

impl Code {
    pub fn random() -> Self {
        let mut code = Zeroizing::new([0; LENGTH]);
        getrandom::fill(code.as_mut()).expect("the system's random generator is always available");
        for character in code.iter_mut() {
            *character = ALPHABET[usize::from(*character) % ALPHABET.len()];
        }
        Self(code)
    }

    /// Reads a code as someone typed it: in any case, with or without the
    /// dashes, and with the letters O, I and L for the digits they look like.
    pub fn parse(typed: &str) -> Option<Self> {
        let mut code = Zeroizing::new([0; LENGTH]);
        let mut length = 0;
        for character in typed
            .chars()
            .filter(|character| !"- \t".contains(*character))
        {
            let character = match character.to_ascii_uppercase() {
                'O' => '0',
                'I' | 'L' => '1',
                character => character,
            };
            let known = u8::try_from(character)
                .ok()
                .filter(|byte| ALPHABET.contains(byte))?;
            *code.get_mut(length)? = known;
            length += 1;
        }
        (length == LENGTH).then_some(Self(code))
    }

    pub(super) fn bytes(&self) -> &[u8] {
        self.0.as_ref()
    }

    /// The code as it's shown, `XXXX-XXXX-XXXX`.
    pub fn grouped(&self) -> String {
        self.0
            .chunks(GROUP)
            .map(|group| String::from_utf8_lossy(group).into_owned())
            .collect::<Vec<_>>()
            .join("-")
    }
}
