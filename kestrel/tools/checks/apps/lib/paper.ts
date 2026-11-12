import Cairo from 'cairo';
import Pango from 'gi://Pango';
import PangoCairo from 'gi://PangoCairo';

export const A4 = {width: 595.28, height: 841.89};

export interface Block {
  text: string;
  size: number;
  bold?: boolean;
  after?: number;
  align?: 'left' | 'center' | 'right';
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ALIGNMENTS = {left: Pango.Alignment.LEFT, center: Pango.Alignment.CENTER, right: Pango.Alignment.RIGHT};

/** Sets blocks of text down an A4 page in points, and says where each line of each block went. */
export function typeset(context: Cairo.Context, blocks: Block[], family: string, margin = 64): Box[][] {
  const width = A4.width - 2 * margin;
  let top = margin;
  return blocks.map(({text, size, bold = false, after = size * 0.8, align = 'left'}) => {
    const layout = PangoCairo.create_layout(context);
    layout.set_font_description(Pango.FontDescription.from_string(`${family} ${bold ? 'Bold ' : ''}${size}px`));
    layout.set_width(width * Pango.SCALE);
    layout.set_alignment(ALIGNMENTS[align]);
    layout.set_text(text, -1);
    context.moveTo(margin, top);
    PangoCairo.show_layout(context, layout);
    const lines: Box[] = [];
    const iter = layout.get_iter();
    do {
      const {x, y, width: wide, height} = iter.get_line_extents()[1]!;
      lines.push({x: margin + x / Pango.SCALE, y: top + y / Pango.SCALE, width: wide / Pango.SCALE, height: height / Pango.SCALE});
    } while (iter.next_line());
    top += layout.get_pixel_size()[1] + after;
    return lines;
  });
}
