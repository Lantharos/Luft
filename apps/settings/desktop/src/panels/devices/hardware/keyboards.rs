use std::fs;

const INPUT: &str = "/sys/class/input";
const KEY_F23: usize = 193;
const KEY_ASSISTANT: usize = 583;
const WORD_BITS: usize = 64;

/// Whether a keyboard here has keys the Copilot key can send: Shift, Super and
/// F23 on most laptops, or an assistant key of its own.
pub fn copilot_key() -> bool {
    fs::read_dir(INPUT)
        .into_iter()
        .flatten()
        .flatten()
        .filter(|entry| entry.file_name().to_string_lossy().starts_with("event"))
        .filter_map(|entry| fs::read_to_string(entry.path().join("device/capabilities/key")).ok())
        .any(|keys| declares(&keys, KEY_F23) || declares(&keys, KEY_ASSISTANT))
}

fn declares(capabilities: &str, key: usize) -> bool {
    capabilities
        .split_whitespace()
        .rev()
        .nth(key / WORD_BITS)
        .and_then(|word| u64::from_str_radix(word, 16).ok())
        .is_some_and(|word| word >> (key % WORD_BITS) & 1 == 1)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_keys_from_the_kernels_bitmask() {
        let keyboard = "7 ff80000000000454 80b0ffcd01cfffff febffbffdffffffe";
        assert!(declares(keyboard, KEY_F23));
        assert!(!declares(keyboard, KEY_ASSISTANT));
        let mouse = "70000 0 0 0 0";
        assert!(!declares(mouse, KEY_F23));
        let assistant = "80 0 0 0 0 0 0 0 0 0";
        assert!(declares(assistant, KEY_ASSISTANT));
    }
}
