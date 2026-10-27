import St from 'gi://St';

import { setSourceColor } from '../../shared/display/cairo.js';

export function drawArrowBorder(area: St.DrawingArea, themeNode: St.ThemeNode, side: St.Side, origin: number): void {
  const borderWidth = themeNode.get_length('-arrow-border-width');
  const base = themeNode.get_length('-arrow-base');
  const rise = themeNode.get_length('-arrow-rise');
  const borderRadius = themeNode.get_length('-arrow-border-radius');

  const halfBorder = borderWidth / 2;
  const halfBase = Math.floor(base / 2);

  const [width, height] = area.get_surface_size();
  let [boxWidth, boxHeight] = [width, height];
  if (side === St.Side.TOP || side === St.Side.BOTTOM) boxHeight -= rise;
  else boxWidth -= rise;

  const cr = area.get_context();

  if (side === St.Side.TOP) cr.translate(0, rise);
  else if (side === St.Side.LEFT) cr.translate(rise, 0);

  const [x1, y1] = [halfBorder, halfBorder];
  const [x2, y2] = [boxWidth - halfBorder, boxHeight - halfBorder];

  let skipTopLeft = false;
  let skipTopRight = false;
  let skipBottomLeft = false;
  let skipBottomRight = false;

  if (rise) {
    switch (side) {
      case St.Side.TOP:
        if (origin === x1) skipTopLeft = true;
        else if (origin === x2) skipTopRight = true;
        break;
      case St.Side.RIGHT:
        if (origin === y1) skipTopRight = true;
        else if (origin === y2) skipBottomRight = true;
        break;
      case St.Side.BOTTOM:
        if (origin === x1) skipBottomLeft = true;
        else if (origin === x2) skipBottomRight = true;
        break;
      case St.Side.LEFT:
        if (origin === y1) skipTopLeft = true;
        else if (origin === y2) skipBottomLeft = true;
        break;
    }
  }

  cr.moveTo(x1 + borderRadius, y1);
  if (side === St.Side.TOP && rise) {
    if (skipTopLeft) {
      cr.moveTo(x1, y2 - borderRadius);
      cr.lineTo(x1, y1 - rise);
      cr.lineTo(x1 + halfBase, y1);
    } else if (skipTopRight) {
      cr.lineTo(x2 - halfBase, y1);
      cr.lineTo(x2, y1 - rise);
      cr.lineTo(x2, y1 + borderRadius);
    } else {
      cr.lineTo(origin - halfBase, y1);
      cr.lineTo(origin, y1 - rise);
      cr.lineTo(origin + halfBase, y1);
    }
  }

  if (!skipTopRight) {
    cr.lineTo(x2 - borderRadius, y1);
    cr.arc(x2 - borderRadius, y1 + borderRadius, borderRadius, 3 * Math.PI / 2, Math.PI * 2);
  }

  if (side === St.Side.RIGHT && rise) {
    if (skipTopRight) {
      cr.lineTo(x2 + rise, y1);
      cr.lineTo(x2 + rise, y1 + halfBase);
    } else if (skipBottomRight) {
      cr.lineTo(x2, y2 - halfBase);
      cr.lineTo(x2 + rise, y2);
      cr.lineTo(x2 - borderRadius, y2);
    } else {
      cr.lineTo(x2, origin - halfBase);
      cr.lineTo(x2 + rise, origin);
      cr.lineTo(x2, origin + halfBase);
    }
  }

  if (!skipBottomRight) {
    cr.lineTo(x2, y2 - borderRadius);
    cr.arc(x2 - borderRadius, y2 - borderRadius, borderRadius, 0, Math.PI / 2);
  }

  if (side === St.Side.BOTTOM && rise) {
    if (skipBottomLeft) {
      cr.lineTo(x1 + halfBase, y2);
      cr.lineTo(x1, y2 + rise);
      cr.lineTo(x1, y2 - borderRadius);
    } else if (skipBottomRight) {
      cr.lineTo(x2, y2 + rise);
      cr.lineTo(x2 - halfBase, y2);
    } else {
      cr.lineTo(origin + halfBase, y2);
      cr.lineTo(origin, y2 + rise);
      cr.lineTo(origin - halfBase, y2);
    }
  }

  if (!skipBottomLeft) {
    cr.lineTo(x1 + borderRadius, y2);
    cr.arc(x1 + borderRadius, y2 - borderRadius, borderRadius, Math.PI / 2, Math.PI);
  }

  if (side === St.Side.LEFT && rise) {
    if (skipTopLeft) {
      cr.lineTo(x1, y1 + halfBase);
      cr.lineTo(x1 - rise, y1);
      cr.lineTo(x1 + borderRadius, y1);
    } else if (skipBottomLeft) {
      cr.lineTo(x1 - rise, y2);
      cr.lineTo(x1 - rise, y2 - halfBase);
    } else {
      cr.lineTo(x1, origin + halfBase);
      cr.lineTo(x1 - rise, origin);
      cr.lineTo(x1, origin - halfBase);
    }
  }

  if (!skipTopLeft) {
    cr.lineTo(x1, y1 + borderRadius);
    cr.arc(x1 + borderRadius, y1 + borderRadius, borderRadius, Math.PI, 3 * Math.PI / 2);
  }

  const [hasColor, bgColor] = themeNode.lookup_color('-arrow-background-color', false);
  if (hasColor) {
    setSourceColor(cr, bgColor);
    cr.fillPreserve();
  }

  if (borderWidth > 0) {
    setSourceColor(cr, themeNode.get_color('-arrow-border-color'));
    cr.setLineWidth(borderWidth);
    cr.stroke();
  }

  cr.$dispose();
}
