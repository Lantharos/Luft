use tiny_skia::{FillRule, Paint, Path, PathBuilder, PixmapMut, Transform};

const WIDTH: f32 = 187.0;
const HEIGHT: f32 = 197.0;

type Curve = [(f32, f32); 3];

const LOWER: ((f32, f32), [Curve; 4]) = (
    (119.718, 130.99),
    [
        [(159.986, 113.061), (161.602, 43.9304), (179.53, 84.1989)],
        [(197.459, 124.467), (179.349, 171.645), (139.081, 189.574)],
        [(98.8128, 207.503), (51.6341, 189.393), (33.7053, 149.125)],
        [(15.7766, 108.856), (79.4495, 148.919), (119.718, 130.99)],
    ],
);

const UPPER: ((f32, f32), [Curve; 4]) = (
    (78.4133, 63.6013),
    [
        [(118.682, 45.6726), (131.515, -28.4531), (149.444, 11.8151)],
        [(167.372, 52.0837), (149.262, 99.2624), (108.993, 117.191)],
        [(68.7249, 135.12), (21.5471, 117.009), (3.61838, 76.7409)],
        [(-14.3103, 36.4724), (38.1448, 81.5298), (78.4133, 63.6013)],
    ],
);

fn shape(((x, y), curves): ((f32, f32), [Curve; 4])) -> Option<Path> {
    let mut path = PathBuilder::new();
    path.move_to(x, y);
    for [(x1, y1), (x2, y2), (x, y)] in curves {
        path.cubic_to(x1, y1, x2, y2, x, y);
    }
    path.close();
    path.finish()
}

pub fn width(height: f32) -> f32 {
    height * WIDTH / HEIGHT
}

pub fn draw(
    pixmap: &mut PixmapMut,
    view: Transform,
    (left, top): (f32, f32),
    height: f32,
    alpha: f32,
) {
    let size = height / HEIGHT;
    let placed = view.pre_translate(left, top).pre_scale(size, size);
    let mut paint = Paint {
        anti_alias: true,
        ..Paint::default()
    };
    for (part, opacity) in [(LOWER, 0.5), (UPPER, 1.0)] {
        let Some(path) = shape(part) else { continue };
        paint.set_color_rgba8(
            255,
            255,
            255,
            libm::roundf((alpha * opacity).clamp(0.0, 1.0) * 255.0) as u8,
        );
        pixmap.fill_path(&path, &paint, FillRule::Winding, placed, None);
    }
}
