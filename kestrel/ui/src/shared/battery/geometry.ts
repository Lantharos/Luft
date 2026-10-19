import Pango from 'gi://Pango';
import PangoCairo from 'gi://PangoCairo';

const WIDEST_LEVEL = '100';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BatteryGeometry {
  width: number;
  height: number;
  body: Rect;
  radius: number;
  nub: Rect;
  bolt: Rect;
  fontSize: number;
}

export interface GeometryOptions {
  size: number;
  margin: number;
  numbered: boolean;
  boltOutside: boolean;
  family: string;
}

function levelFont(family: string, size: number): Pango.FontDescription {
  const font = Pango.FontDescription.from_string(family);
  font.set_weight(Pango.Weight.BOLD);
  font.set_absolute_size(size * Pango.SCALE);
  return font;
}

export function levelLayout(context: Pango.Context, text: string, family: string, size: number): Pango.Layout {
  const layout = Pango.Layout.new(context);
  layout.set_font_description(levelFont(family, size));
  const attributes = new Pango.AttrList();
  attributes.insert(Pango.attr_font_features_new('tnum'));
  layout.set_attributes(attributes);
  layout.set_text(text, -1);
  return layout;
}

let measuring: Pango.Context | null = null;

function inkWidth(family: string, size: number): number {
  measuring ??= PangoCairo.FontMap.get_default().create_context();
  const [ink] = levelLayout(measuring, WIDEST_LEVEL, family, size).get_extents();
  return ink!.width / Pango.SCALE;
}

export function batteryGeometry({ size, margin, numbered, boltOutside, family }: GeometryOptions): BatteryGeometry {
  const bodyHeight = size * 0.75;
  const fontSize = bodyHeight * 0.8;
  const plainWidth = size * 1.5;
  const bodyWidth = numbered ? Math.max(size * 1.625, inkWidth(family, fontSize) + bodyHeight * 0.55) : plainWidth;
  const body = { x: margin, y: (size - bodyHeight) / 2, width: bodyWidth, height: bodyHeight };
  const nubHeight = bodyHeight * 0.4;
  const nub = { x: body.x + bodyWidth + size * 0.06, y: (size - nubHeight) / 2, width: size * 0.1, height: nubHeight };
  const boltHeight = bodyHeight * (boltOutside ? 1.05 : 0.86);
  const boltWidth = boltHeight * 0.62;
  const bolt = boltOutside
    ? { x: nub.x + nub.width + size * 0.14, y: (size - boltHeight) / 2, width: boltWidth, height: boltHeight }
    : { x: body.x + (bodyWidth - boltWidth) / 2, y: (size - boltHeight) / 2, width: boltWidth, height: boltHeight };
  const right = boltOutside ? bolt.x + bolt.width : nub.x + nub.width;
  return { width: Math.ceil(right + margin), height: size, body, radius: bodyHeight * 0.3, nub, bolt, fontSize };
}
