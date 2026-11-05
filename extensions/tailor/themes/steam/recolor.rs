use super::palette::{self, ACCENT, ON_ACCENT, Use, role, written};

const WINS: &str = ":not(#\\9)";
const WHERE_RULES_NEST: [&str; 3] = ["@media", "@supports", "@container"];
const OTHER_INTERFACE: &str = "BasicUI";
const OWN_FONT: &str = "Motiva";
const FONT_STACK: &str = "var(--luft-font-stack)";
const NAMED_BLUES: [(&str, &str); 4] = [
    ("blue", "1a9fff"),
    ("cyan", "0ff"),
    ("aqua", "0ff"),
    ("dodgerblue", "1e90ff"),
];

/// Whether a `url(` opens with a quote. Without one, whatever comes before the bracket is part of the address.
fn quoted(address: &str) -> bool {
    address.trim_start().starts_with(['"', '\''])
}

/// Finds the end of a block, or of a piece of one, past strings, comments and brackets.
fn end_of(css: &str, start: usize, stops: &[u8]) -> usize {
    let bytes = css.as_bytes();
    let (mut at, mut depth, mut quote) = (start, 0_u32, None);
    while at < bytes.len() {
        let byte = bytes[at];
        match quote {
            Some(open) => {
                if byte == b'\\' {
                    at += 1;
                } else if byte == open {
                    quote = None;
                }
            }
            None => match byte {
                b'\\' => at += 1,
                b'"' | b'\'' => quote = Some(byte),
                b'/' if bytes.get(at + 1) == Some(&b'*') => {
                    at = css[at + 2..]
                        .find("*/")
                        .map_or(bytes.len(), |end| at + end + 3);
                }
                b'u' if css[at..].starts_with("url(") && !quoted(&css[at + 4..]) => {
                    at += css[at..].find(')').unwrap_or(bytes.len() - at);
                }
                b'(' | b'[' => depth += 1,
                b')' | b']' => depth = depth.saturating_sub(1),
                _ if depth == 0 && stops.contains(&byte) => return at,
                _ => {}
            },
        }
        at += 1;
    }
    bytes.len()
}

fn closing_brace(css: &str, open: usize) -> usize {
    let (mut at, mut depth) = (open + 1, 1);
    while depth > 0 && at < css.len() {
        at = end_of(css, at, b"{}");
        if at < css.len() {
            depth = if css.as_bytes()[at] == b'{' {
                depth + 1
            } else {
                depth - 1
            };
            at += 1;
        }
    }
    at.saturating_sub(1)
}

fn is_word(byte: u8) -> bool {
    byte.is_ascii_alphanumeric() || byte == b'-' || byte == b'_'
}

fn is_whole_word(text: &str, word: &str) -> bool {
    text.strip_prefix(word)
        .is_some_and(|after| !after.bytes().next().is_some_and(is_word))
}

struct Mapped {
    value: String,
    changed: bool,
    accent: bool,
}

/// Rewrites every colour of a value that has a place in Luft's palette.
fn map_value(value: &str, used: Use) -> Mapped {
    let bytes = value.as_bytes();
    let mut mapped = Mapped {
        value: String::with_capacity(value.len()),
        changed: false,
        accent: false,
    };
    let put = |color: Option<palette::Color>, original: &str, value: &mut Mapped| match color
        .and_then(|color| role(color, used).map(|role| (role, color.alpha)))
    {
        Some((role, alpha)) => {
            value.value.push_str(&written(role, alpha));
            value.changed = true;
            value.accent |= role == ACCENT;
        }
        None => value.value.push_str(original),
    };
    let mut at = 0;
    while at < bytes.len() {
        let rest = &value[at..];
        let starts_word = at == 0 || !is_word(bytes[at - 1]);
        if bytes[at] == b'#' {
            let length = rest[1..].bytes().take_while(u8::is_ascii_hexdigit).count();
            let original = &rest[..=length];
            put(palette::from_hex(&rest[1..=length]), original, &mut mapped);
            at += original.len();
        } else if starts_word && rest.starts_with("url(") {
            let end = end_of(rest, 4, b")");
            mapped.value.push_str(&rest[..(end + 1).min(rest.len())]);
            at += end + 1;
        } else if let Some((name, hex)) = NAMED_BLUES
            .into_iter()
            .find(|(name, _)| starts_word && is_whole_word(rest, name))
        {
            put(palette::from_hex(hex), name, &mut mapped);
            at += name.len();
        } else if let Some((name, read)) = starts_word
            .then(|| {
                [
                    ("rgba(", palette::from_rgb as fn(&str) -> _),
                    ("rgb(", palette::from_rgb),
                    ("hsla(", palette::from_hsl),
                    ("hsl(", palette::from_hsl),
                ]
                .into_iter()
                .find(|(name, _)| rest.starts_with(name))
            })
            .flatten()
        {
            let end = rest.find(')').unwrap_or(rest.len() - 1);
            put(read(&rest[name.len()..end]), &rest[..=end], &mut mapped);
            at += end + 1;
        } else {
            let length = rest.chars().next().map_or(1, char::len_utf8);
            mapped.value.push_str(&rest[..length]);
            at += length;
        }
    }
    mapped
}

fn usage(property: &str) -> Option<Use> {
    match property {
        "color"
        | "fill"
        | "stroke"
        | "caret-color"
        | "-webkit-text-fill-color"
        | "text-decoration-color" => Some(Use::Text),
        "box-shadow" | "text-shadow" => Some(Use::Shadow),
        "background" | "background-color" | "background-image" => Some(Use::Surface),
        name if name.starts_with("--") => Some(
            if ["text", "foreground", "fg"]
                .iter()
                .any(|word| name.contains(word))
            {
                Use::Text
            } else {
                Use::Surface
            },
        ),
        name if name.starts_with("border") || name.starts_with("outline") => Some(Use::Surface),
        _ => None,
    }
}

/// Only the part of a border's or an outline's shorthand that's a colour, so its width and style stay Steam's.
fn color_property(property: &str) -> Option<&'static str> {
    match property {
        "border" => Some("border-color"),
        "border-top" => Some("border-top-color"),
        "border-right" => Some("border-right-color"),
        "border-bottom" => Some("border-bottom-color"),
        "border-left" => Some("border-left-color"),
        "outline" => Some("outline-color"),
        _ => None,
    }
}

fn is_a_color(token: &str) -> bool {
    token.starts_with("var(")
        || token.starts_with("color-mix(")
        || token.starts_with('#')
        || token.starts_with("rgb")
        || token.starts_with("hsl")
        || matches!(
            token,
            "transparent" | "currentColor" | "currentcolor" | "white" | "black"
        )
}

fn top_level_tokens(value: &str) -> Vec<&str> {
    let (mut tokens, mut at) = (Vec::new(), 0);
    while at < value.len() {
        let end = end_of(value, at, b" \t\n,");
        if end > at {
            tokens.push(&value[at..end]);
        }
        at = end + 1;
    }
    tokens
}

/// Splits `background` into what it paints, so a picture set elsewhere or a size in the same shorthand stays Steam's.
fn write_background(value: &str, important: &str, into: &mut String) {
    let tokens = top_level_tokens(value);
    let layers = end_of(value, 0, b",") < value.len();
    if layers {
        into.push_str(&format!("background:{value}{important};"));
        return;
    }
    match tokens.iter().find(|token| is_a_color(token)) {
        Some(color) => into.push_str(&format!("background-color:{color}{important};")),
        None if matches!(value, "none" | "0") => {
            into.push_str(&format!("background-color:transparent{important};"));
        }
        None => {}
    }
    if value == "none" || value == "0" {
        into.push_str(&format!("background-image:none{important};"));
    } else if let Some(image) = tokens
        .iter()
        .find(|token| token.contains("gradient(") || token.starts_with("url("))
    {
        into.push_str(&format!("background-image:{image}{important};"));
    }
}

fn split_important(value: &str) -> (&str, &'static str) {
    match value.trim_end().strip_suffix("!important") {
        Some(rest) => (rest.trim_end(), "!important"),
        None => (value, ""),
    }
}

/// Keeps a rule's plain colours too, so one that switches something off still wins over one that's been recoloured.
fn is_cascade_only(property: &str) -> bool {
    matches!(
        property,
        "background" | "background-color" | "background-image" | "color" | "fill"
    )
}

fn declarations(body: &str) -> Vec<(&str, &str)> {
    let (mut found, mut at) = (Vec::new(), 0);
    while at < body.len() {
        let end = end_of(body, at, b";");
        if let Some((property, value)) = body[at..end].split_once(':') {
            let property = property.rsplit("*/").next().unwrap_or(property);
            found.push((property.trim(), value.trim()));
        }
        at = end + 1;
    }
    found
}

fn recolor_declarations(body: &str) -> String {
    let declarations = declarations(body);
    let paints_accent = declarations.iter().any(|(property, value)| {
        property.starts_with("background") && map_value(value, Use::Surface).accent
    });
    let mut out = String::new();
    let mut changed = false;
    for (property, value) in declarations {
        let lowered = property.to_ascii_lowercase();
        if lowered == "font-family" {
            if value.contains(OWN_FONT) {
                out.push_str(&format!("font-family:{FONT_STACK};"));
                changed = true;
            }
            continue;
        }
        let Some(used) = usage(&lowered) else {
            continue;
        };
        let (plain, important) = split_important(value);
        let mapped = map_value(plain, used);
        changed |= mapped.changed;
        let value = if paints_accent && used == Use::Text && mapped.changed {
            format!("var({ON_ACCENT})")
        } else {
            mapped.value
        };
        if lowered == "background" {
            write_background(&value, important, &mut out);
        } else if !mapped.changed && !is_cascade_only(&lowered) {
            continue;
        } else if let Some(color) = color_property(&lowered) {
            if let Some(token) = top_level_tokens(&value)
                .into_iter()
                .find(|token| is_a_color(token))
            {
                out.push_str(&format!("{color}:{token}{important};"));
            }
        } else {
            out.push_str(&format!("{property}:{value}{important};"));
        }
    }
    if changed { out } else { String::new() }
}

/// The selector, so it outranks every rule of Steam's whatever order they load in. An id in `:not` adds that weight
/// without changing what it matches, and unlike `!important` leaves colours Steam's code sets on an element alone.
fn outranking(selector: &str) -> String {
    let selector = selector.trim();
    for root in [":root", "html"] {
        if let Some(rest) = selector.strip_prefix(root) {
            return format!("{root}{WINS}{rest}");
        }
    }
    format!("{WINS} {selector}")
}

fn selectors(prelude: &str) -> Option<String> {
    let (mut kept, mut at) = (Vec::new(), 0);
    while at < prelude.len() {
        let end = end_of(prelude, at, b",");
        let selector = &prelude[at..end];
        if !selector.contains(OTHER_INTERFACE) {
            kept.push(outranking(selector));
        }
        at = end + 1;
    }
    (!kept.is_empty()).then(|| kept.join(","))
}

/// Steam's rules that draw with colour, drawn from Luft's palette instead. Steam's stylesheets write nearly every
/// colour out by hand on generated class names, so reading them leaves nothing out and follows every update.
pub fn recolor(css: &str, into: &mut String) {
    let mut at = 0;
    while at < css.len() {
        let open = end_of(css, at, b"{;");
        if open >= css.len() {
            return;
        }
        if css.as_bytes()[open] == b';' {
            at = open + 1;
            continue;
        }
        let close = closing_brace(css, open);
        let prelude = css[at..open].trim();
        let body = &css[open + 1..close];
        if WHERE_RULES_NEST
            .iter()
            .any(|name| prelude.starts_with(name))
        {
            let mut inner = String::new();
            recolor(body, &mut inner);
            if !inner.is_empty() {
                into.push_str(&format!("{prelude}{{{inner}}}"));
            }
        } else if !prelude.starts_with('@') {
            let recolored = recolor_declarations(body);
            if !recolored.is_empty()
                && let Some(selectors) = selectors(prelude)
            {
                into.push_str(&format!("{selectors}{{{recolored}}}\n"));
            }
        }
        at = close + 1;
    }
}

#[cfg(test)]
mod tests {
    use super::recolor;

    fn recolored(css: &str) -> String {
        let mut out = String::new();
        recolor(css, &mut out);
        out
    }

    #[test]
    fn a_rule_keeps_its_selector_and_outranks_steam_s() {
        assert_eq!(
            recolored(".a,.b:hover{color:#dfe3e6;width:3px}"),
            ":not(#\\9) .a,:not(#\\9) .b:hover{color:var(--luft-ink);}\n"
        );
        assert_eq!(
            recolored(":root .a{color:#fff}html.b{color:#fff}"),
            ":root:not(#\\9) .a{color:var(--luft-ink);}\nhtml:not(#\\9).b{color:var(--luft-ink);}\n"
        );
    }

    #[test]
    fn rules_without_colors_of_valve_s_are_left_out() {
        assert_eq!(
            recolored(".a{width:3px}.b{color:#70d61d}.c{background:none}"),
            ""
        );
    }

    #[test]
    fn gradients_become_luft_s_with_their_shape_kept() {
        assert_eq!(
            recolored(
                ".a{background-image:linear-gradient(90deg, #06bfff 0%, rgba(45, 115, 255, 0.5) 100%)}"
            ),
            ":not(#\\9) .a{background-image:linear-gradient(90deg, var(--luft-accent) 0%, color-mix(in srgb, var(--luft-accent) 50.0%, transparent) 100%);}\n"
        );
    }

    #[test]
    fn a_background_shorthand_only_sets_what_it_paints() {
        let css = recolored(".a{background:#171d25 url(/images/a.png) no-repeat}");
        assert!(css.contains("background-color:var(--luft-low);"));
        assert!(css.contains("background-image:url(/images/a.png);"));
        assert!(!css.contains("no-repeat"));
    }

    #[test]
    fn a_border_keeps_its_width_and_style() {
        assert_eq!(
            recolored(".a{border:1px solid #3d4450}"),
            ":not(#\\9) .a{border-color:var(--luft-highest);}\n"
        );
    }

    #[test]
    fn text_on_the_accent_stays_readable() {
        let css = recolored(".a{background:#1a9fff;color:#fff}");
        assert!(css.contains("color:var(--luft-on-accent);"));
    }

    #[test]
    fn what_switches_something_off_in_a_recolored_rule_comes_along() {
        let css = recolored(".a{background:none;color:#8b929a}");
        assert!(css.contains("background-color:transparent;"));
        assert!(css.contains("background-image:none;"));
    }

    #[test]
    fn the_font_follows_and_monospace_stays() {
        let css = recolored(".a{font-family:\"Motiva Sans\",sans-serif}.b{font-family:monospace}");
        assert_eq!(css, ":not(#\\9) .a{font-family:var(--luft-font-stack);}\n");
    }

    #[test]
    fn media_queries_are_kept_and_animations_left_out() {
        assert_eq!(
            recolored("@media(max-width:9px){.a{color:#fff}}@keyframes x{0%{color:#fff}}"),
            "@media(max-width:9px){:not(#\\9) .a{color:var(--luft-ink);}\n}"
        );
    }

    #[test]
    fn the_interface_for_televisions_stays_as_it_is() {
        assert_eq!(recolored(".BasicUI .a{color:#fff}"), "");
    }

    #[test]
    fn ids_in_links_and_pictures_aren_t_colors() {
        assert_eq!(recolored(".a{fill:url(#abc)}"), "");
        assert_eq!(
            recolored(".a{background-image:url(\"data:image/svg+xml,%23fff#abc\");color:#fff}")
                .matches("--luft")
                .count(),
            1
        );
    }

    #[test]
    fn a_quote_inside_a_bare_address_doesn_t_swallow_what_follows() {
        let css = recolored(".a{background:url(data:image/svg+xml,it's)}.b{color:#fff}");
        assert!(css.contains(".b{color:var(--luft-ink);}"));
    }

    #[test]
    fn an_escaped_bracket_in_a_class_name_is_part_of_the_name() {
        let css = recolored(".Key_\\[{color:#fff}.b{color:#fff}");
        assert_eq!(css.matches("color:var(--luft-ink)").count(), 2);
    }

    #[test]
    fn blues_by_name_and_inside_fallbacks_are_found() {
        assert!(recolored(".a{background-color:blue}").contains("var(--luft-accent)"));
        assert!(recolored(".a{color:var(--x, #1a9fff)}").contains("var(--x, var(--luft-accent))"));
        assert_eq!(recolored(".a{color:blue-thing}"), "");
    }

    #[test]
    fn semicolons_in_strings_and_comments_don_t_end_anything() {
        let css = recolored(".a{content:\";}\";/* } */color:#fff}.b[title=\"{\"]{color:#fff}");
        assert_eq!(css.matches("color:var(--luft-ink)").count(), 2);
    }
}
