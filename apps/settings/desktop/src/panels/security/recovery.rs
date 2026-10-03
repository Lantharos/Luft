use luft_app::recovery::{Sheet, computer};

const EXPLANATION: [&str; 3] = [
    "If your computer asks for a recovery key when it starts, type this key",
    "to unlock its disk. Keep it somewhere other than the computer itself,",
    "such as on paper or in a password manager.",
];

fn sheet(key: &str) -> Sheet<'_> {
    Sheet {
        key,
        name: computer(),
        explanation: &EXPLANATION,
    }
}

pub fn save(key: &str) -> Result<bool, String> {
    sheet(key).save("Recovery key.txt")
}

pub fn print(key: &str) -> Result<(), String> {
    sheet(key).print()
}
