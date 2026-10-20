use std::borrow::Cow;

const PLAIN: &str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ACCENTED: &str = "åƀçđéƒĝĥîĵķļɱñöþǫŕšţûṽŵẋýžÅƁÇĐÉƑĜĤÎĴĶĻṀÑÖÞǪŔŠŢÛṼŴẊÝŽ";
const LENGTHENED: &str = "aeiouyAEIOUY";

pub fn pseudolocalize(text: &str) -> Cow<'_, str> {
    let mut result = String::with_capacity(text.len() * 2);
    for character in text.chars() {
        let accented = PLAIN
            .chars()
            .position(|plain| plain == character)
            .and_then(|index| ACCENTED.chars().nth(index))
            .unwrap_or(character);
        result.push(accented);
        if LENGTHENED.contains(character) {
            result.push(accented);
        }
    }
    Cow::Owned(result)
}
