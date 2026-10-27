use std::fs::OpenOptions;
use std::io::Read;
use std::os::unix::fs::OpenOptionsExt;

const REFUSED: &str = "fs-verity digest";
const LONGEST_RECORD: usize = 8192;

pub fn system_files() -> Vec<String> {
    let Ok(mut kernel_log) = OpenOptions::new()
        .read(true)
        .custom_flags(libc::O_NONBLOCK)
        .open("/dev/kmsg")
    else {
        return Vec::new();
    };
    let mut refused = Vec::new();
    let mut record = vec![0u8; LONGEST_RECORD];
    loop {
        match kernel_log.read(&mut record) {
            Ok(0) => return refused,
            Ok(length) => {
                let text = String::from_utf8_lossy(&record[..length]);
                let message = text.split_once(';').map_or(&*text, |(_, message)| message);
                if message.contains(REFUSED)
                    && !refused.iter().any(|seen| seen == message.trim_end())
                {
                    refused.push(message.trim_end().to_owned());
                }
            }
            Err(error) if error.raw_os_error() == Some(libc::EPIPE) => {}
            Err(_) => return refused,
        }
    }
}
