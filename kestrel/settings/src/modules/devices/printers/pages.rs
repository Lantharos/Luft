use hayro_syntax::Pdf;

/// The pages a job will print, counting every copy, when its document says how many it has:
/// a PDF's own pages, or one for a picture.
pub fn printed(
    document: Vec<u8>,
    format: &str,
    ranges: Option<&[(i32, i32)]>,
    copies: Option<i32>,
) -> Option<i32> {
    let pages = match format {
        "application/pdf" => i32::try_from(Pdf::new(document).ok()?.pages().len()).ok()?,
        picture if picture.starts_with("image/") => 1,
        _ => return None,
    };
    let chosen = ranges.map_or(pages, |ranges| {
        ranges
            .iter()
            .map(|&(first, last)| (last.min(pages) - first.max(1) + 1).max(0))
            .sum()
    });
    (chosen > 0).then(|| chosen * copies.unwrap_or(1).max(1))
}

#[cfg(test)]
mod tests {
    use super::printed;

    #[test]
    fn ranges_past_the_last_page_count_only_pages_that_exist() {
        assert_eq!(
            printed(Vec::new(), "image/png", Some(&[(1, 4)]), None),
            Some(1)
        );
    }

    #[test]
    fn copies_multiply_the_chosen_pages() {
        assert_eq!(printed(Vec::new(), "image/jpeg", None, Some(3)), Some(3));
    }

    #[test]
    fn documents_it_cannot_read_have_no_count() {
        assert_eq!(
            printed(b"not a pdf".to_vec(), "application/pdf", None, None),
            None
        );
        assert_eq!(
            printed(Vec::new(), "application/postscript", None, None),
            None
        );
    }
}
