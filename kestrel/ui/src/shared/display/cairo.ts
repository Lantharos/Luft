import type Cairo from 'cairo';
import type Cogl from 'gi://Cogl';

export function setSourceColor(cr: Cairo.Context, color: Cogl.Color): void {
  cr.setSourceRGBA(color.red / 255, color.green / 255, color.blue / 255, color.alpha / 255);
}
