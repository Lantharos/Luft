use tiny_skia::Pixmap;

fn read_u16(data: &[u8], at: usize) -> Option<u16> {
    Some(u16::from_le_bytes(data.get(at..at + 2)?.try_into().ok()?))
}

fn read_u32(data: &[u8], at: usize) -> Option<u32> {
    Some(u32::from_le_bytes(data.get(at..at + 4)?.try_into().ok()?))
}

/// Decodes the uncompressed 24 and 32 bit bitmaps firmware uses for its boot logo.
pub fn decode_bmp(data: &[u8]) -> Option<Pixmap> {
    if data.get(0..2)? != b"BM" {
        return None;
    }
    let offset = read_u32(data, 10)? as usize;
    let width = read_u32(data, 18)? as i32;
    let raw_height = read_u32(data, 22)? as i32;
    let bits = read_u16(data, 28)?;
    let compression = read_u32(data, 30)?;
    if width <= 0 || raw_height == 0 || !matches!(bits, 24 | 32) || !matches!(compression, 0 | 3) {
        return None;
    }
    let (width, height) = (width as u32, raw_height.unsigned_abs());
    let bytes_per_pixel = bits as usize / 8;
    let stride = (width as usize * bytes_per_pixel).div_ceil(4) * 4;
    let mut pixmap = Pixmap::new(width, height)?;
    let pixels = pixmap.data_mut();

    for row in 0..height as usize {
        let source_row = if raw_height < 0 {
            row
        } else {
            height as usize - 1 - row
        };
        let source = data.get(
            offset + source_row * stride
                ..offset + source_row * stride + width as usize * bytes_per_pixel,
        )?;
        let target = &mut pixels[row * width as usize * 4..(row + 1) * width as usize * 4];
        for (pixel, out) in source
            .chunks_exact(bytes_per_pixel)
            .zip(target.as_chunks_mut::<4>().0)
        {
            out.copy_from_slice(&[pixel[2], pixel[1], pixel[0], 255]);
        }
    }
    Some(pixmap)
}
