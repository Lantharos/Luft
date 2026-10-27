import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import type Cogl from 'gi://Cogl';
import GObject from 'gi://GObject';
import St from 'gi://St';

import { setSourceColor } from '../display/cairo.js';

const TAU = Math.PI * 2;

export class BarLevel extends St.DrawingArea {
  static [GObject.properties] = {
    'value': GObject.ParamSpec.double('value', null, null, GObject.ParamFlags.READWRITE, 0, 2, 0),
    'maximum-value': GObject.ParamSpec.double('maximum-value', null, null, GObject.ParamFlags.READWRITE, 1, 2, 1),
    'overdrive-start': GObject.ParamSpec.double('overdrive-start', null, null, GObject.ParamFlags.READWRITE, 1, 2, 1),
  };

  static {
    GObject.registerClass(this);
  }

  declare protected currentValue: number;
  declare protected maxValue: number;
  declare private overdriveStartValue: number;
  declare protected barLevelWidth: number;
  declare private barLevelHeight: number;
  declare private overdriveSeparatorWidth: number;
  declare private barLevelColor: Cogl.Color | null;
  declare private barLevelActiveColor: Cogl.Color | null;
  declare private barLevelOverdriveColor: Cogl.Color | null;
  declare protected customAccessible: St.GenericAccessible;

  _init(params: Partial<St.DrawingArea.ConstructorProps> = {}): void {
    this.maxValue = 1;
    this.currentValue = 0;
    this.overdriveStartValue = 1;
    this.barLevelWidth = 0;
    this.barLevelHeight = 0;
    this.overdriveSeparatorWidth = 0;
    this.barLevelColor = null;
    this.barLevelActiveColor = null;
    this.barLevelOverdriveColor = null;

    super._init({
      style_class: 'barlevel',
      accessible_role: Atk.Role.LEVEL_BAR,
      ...params,
    });
    this.connect('notify::allocation', () => {
      this.barLevelWidth = this.allocation.get_width();
    });

    this.customAccessible = St.GenericAccessible.new_for_actor(this);
    this.set_accessible(this.customAccessible);

    this.customAccessible.connect('get-current-value', () => this.currentValue);
    this.customAccessible.connect('get-minimum-value', () => 0);
    this.customAccessible.connect('get-maximum-value', () => this.maxValue);
    this.customAccessible.connect('set-current-value', (_actor, value) => {
      this.currentValue = value;
    });

    this.connect('notify::value', () => this.customAccessible.notify('accessible-value'));
  }

  get value(): number {
    return this.currentValue;
  }

  set value(value: number) {
    value = Math.max(Math.min(value, this.maxValue), 0);
    if (this.currentValue === value) return;

    this.currentValue = value;
    this.notify('value');
    this.queue_repaint();
  }

  get maximumValue(): number {
    return this.maxValue;
  }

  set maximumValue(value: number) {
    value = Math.max(value, 1);
    if (this.maxValue === value) return;

    this.maxValue = value;
    this.overdriveStartValue = Math.min(this.overdriveStartValue, this.maxValue);
    this.notify('maximum-value');
    this.queue_repaint();
  }

  get overdriveStart(): number {
    return this.overdriveStartValue;
  }

  set overdriveStart(value: number) {
    if (this.overdriveStartValue === value) return;
    if (value > this.maxValue)
      throw new Error(`Tried to set overdrive value to ${value}, which is a number greater than the maximum allowed value ${this.maxValue}`);

    this.overdriveStartValue = value;
    this.notify('overdrive-start');
    this.queue_repaint();
  }

  vfunc_style_changed(): void {
    const themeNode = this.get_theme_node();
    this.barLevelHeight = themeNode.get_length('-barlevel-height');
    this.overdriveSeparatorWidth = themeNode.get_length('-barlevel-overdrive-separator-width');

    this.barLevelColor = themeNode.get_color('-barlevel-background-color');
    this.barLevelActiveColor = themeNode.get_color('-barlevel-active-background-color');
    this.barLevelOverdriveColor = themeNode.get_color('-barlevel-overdrive-color');

    super.vfunc_style_changed();
  }

  vfunc_repaint(): void {
    const cr = this.get_context();
    const themeNode = this.get_theme_node();
    const [width, height] = this.get_surface_size();
    const rtl = this.get_text_direction() === Clutter.TextDirection.RTL;
    const barHeight = this.barLevelHeight;
    const top = (height - barHeight) / 2;
    const bottom = (height + barHeight) / 2;

    const barLevelBorderRadius = Math.min(width, barHeight) / 2;
    const fgColor = themeNode.get_foreground_color();

    let endX = 0;
    if (this.maxValue > 0) {
      let progress = this.currentValue / this.maxValue;
      if (rtl) progress = 1 - progress;
      endX = barLevelBorderRadius + (width - 2 * barLevelBorderRadius) * progress;
    }

    let overdriveRatio = this.overdriveStartValue / this.maxValue;
    if (rtl) overdriveRatio = 1 - overdriveRatio;
    const overdriveSeparatorX = barLevelBorderRadius + (width - 2 * barLevelBorderRadius) * overdriveRatio;

    const overdriveActive = this.overdriveStartValue !== this.maxValue;
    const overdriveSeparatorWidth = overdriveActive ? this.overdriveSeparatorWidth : 0;

    let xcArcStart = barLevelBorderRadius;
    let xcArcEnd = width - xcArcStart;
    if (rtl) [xcArcStart, xcArcEnd] = [xcArcEnd, xcArcStart];

    if (!rtl) cr.arc(xcArcEnd, height / 2, barLevelBorderRadius, TAU * (3 / 4), TAU * (1 / 4));
    else cr.arcNegative(xcArcEnd, height / 2, barLevelBorderRadius, TAU * (3 / 4), TAU * (1 / 4));
    cr.lineTo(endX, bottom);
    cr.lineTo(endX, top);
    cr.lineTo(xcArcEnd, top);
    setSourceColor(cr, this.barLevelColor!);
    cr.fill();

    let x;
    if (!rtl) {
      x = Math.min(endX, overdriveSeparatorX - overdriveSeparatorWidth / 2);
      cr.arc(xcArcStart, height / 2, barLevelBorderRadius, TAU * (1 / 4), TAU * (3 / 4));
    } else {
      x = Math.max(endX, overdriveSeparatorX + overdriveSeparatorWidth / 2);
      cr.arcNegative(xcArcStart, height / 2, barLevelBorderRadius, TAU * (1 / 4), TAU * (3 / 4));
    }
    cr.lineTo(x, top);
    cr.lineTo(x, bottom);
    cr.lineTo(xcArcStart, bottom);
    if (this.currentValue > 0) setSourceColor(cr, this.barLevelActiveColor!);
    cr.fill();

    if (!rtl) x = Math.min(endX, overdriveSeparatorX) + overdriveSeparatorWidth / 2;
    else x = Math.max(endX, overdriveSeparatorX) - overdriveSeparatorWidth / 2;
    if (this.currentValue > this.overdriveStartValue) {
      cr.moveTo(x, top);
      cr.lineTo(endX, top);
      cr.lineTo(endX, bottom);
      cr.lineTo(x, bottom);
      cr.lineTo(x, top);
      setSourceColor(cr, this.barLevelOverdriveColor!);
      cr.fill();
    }

    if (this.currentValue > 0) {
      if (this.currentValue <= this.overdriveStartValue) setSourceColor(cr, this.barLevelActiveColor!);
      else setSourceColor(cr, this.barLevelOverdriveColor!);
      if (!rtl) {
        cr.arc(endX, height / 2, barLevelBorderRadius, TAU * (3 / 4), TAU * (1 / 4));
        cr.lineTo(Math.floor(endX), bottom);
        cr.lineTo(Math.floor(endX), top);
      } else {
        cr.arcNegative(endX, height / 2, barLevelBorderRadius, TAU * (3 / 4), TAU * (1 / 4));
        cr.lineTo(Math.ceil(endX), bottom);
        cr.lineTo(Math.ceil(endX), top);
      }
      cr.lineTo(endX, top);
      cr.fill();
    }

    if (overdriveActive) {
      const left = overdriveSeparatorX - overdriveSeparatorWidth / 2;
      const right = overdriveSeparatorX + overdriveSeparatorWidth / 2;
      cr.moveTo(left, top);
      cr.lineTo(right, top);
      cr.lineTo(right, bottom);
      cr.lineTo(left, bottom);
      cr.lineTo(left, top);
      if (this.currentValue <= this.overdriveStartValue) setSourceColor(cr, fgColor);
      else setSourceColor(cr, this.barLevelColor!);
      cr.fill();
    }

    cr.$dispose();
  }

  vfunc_get_preferred_height(_forWidth: number): [number, number] {
    const height = this.getPreferredHeight();
    return this.get_theme_node().adjust_preferred_height(height, height);
  }

  vfunc_get_preferred_width(_forHeight: number): [number, number] {
    const width = this.getPreferredWidth();
    return this.get_theme_node().adjust_preferred_width(width, width);
  }

  protected getPreferredHeight(): number {
    return this.barLevelHeight;
  }

  protected getPreferredWidth(): number {
    return this.overdriveSeparatorWidth;
  }
}
