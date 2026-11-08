pub fn decode(text: &str) -> String {
    let bytes = text.as_bytes();
    let mut decoded = Vec::with_capacity(bytes.len());
    let mut index = 0;
    while index < bytes.len() {
        let escaped = (bytes[index] == b'%')
            .then(|| text.get(index + 1..index + 3))
            .flatten()
            .and_then(|hex| u8::from_str_radix(hex, 16).ok());
        match escaped {
            Some(byte) => {
                decoded.push(byte);
                index += 3;
            }
            None => {
                decoded.push(bytes[index]);
                index += 1;
            }
        }
    }
    String::from_utf8_lossy(&decoded).into_owned()
}

pub fn queue_name(text: &str) -> String {
    let mut name = String::new();
    for character in text.chars() {
        if character.is_ascii_alphanumeric() {
            name.push(character);
        } else if !name.ends_with('_') {
            name.push('_');
        }
    }
    name
}

pub fn service_queue(device: &str) -> Option<String> {
    let host = device.strip_prefix("dnssd://")?.split('/').next()?;
    let service = &host[..host.find("._ipp")?];
    Some(queue_name(&decode(service)))
}

#[cfg(test)]
mod tests {
    use super::service_queue;

    #[test]
    fn names_network_printers_like_cups() {
        let device = "dnssd://Canon%20MX490%20series-6._ipp._tcp.local/?uuid=00000000-0000-1000-8000-F4A99782B2CD";
        assert_eq!(
            service_queue(device).as_deref(),
            Some("Canon_MX490_series_6")
        );
        assert_eq!(service_queue("usb://Canon/MX490%20series"), None);
    }
}
