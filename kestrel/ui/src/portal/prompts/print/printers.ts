const STOPPED = 5;

export interface Printer {
  readonly name: string;
  readonly description: string;
  readonly location: string;
  readonly paused: boolean;
  readonly accepting: boolean;
  readonly isDefault: boolean;
  readonly media: string[];
  readonly mediaDefault: string;
  readonly sides: string[];
  readonly sidesDefault: string;
  readonly colorModes: string[];
  readonly colorModeDefault: string;
  readonly maxCopies: number;
  readonly pageRanges: boolean;
}

export interface Reported {
  name: string;
  description: string;
  location: string;
  state: number;
  accepting: boolean;
  default: boolean;
  media: string[];
  'media-default': string;
  sides: string[];
  'sides-default': string;
  'color-modes': string[];
  'color-mode-default': string;
  copies: number;
  'page-ranges': boolean;
}

export function printer(reported: Reported): Printer {
  return {
    name: reported.name,
    description: reported.description,
    location: reported.location,
    paused: reported.state === STOPPED,
    accepting: reported.accepting,
    isDefault: reported.default,
    media: reported.media,
    mediaDefault: reported['media-default'],
    sides: reported.sides,
    sidesDefault: reported['sides-default'],
    colorModes: reported['color-modes'],
    colorModeDefault: reported['color-mode-default'],
    maxCopies: reported.copies,
    pageRanges: reported['page-ranges'],
  };
}
