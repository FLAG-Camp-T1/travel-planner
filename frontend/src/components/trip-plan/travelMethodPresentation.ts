type TravelMethodStyle = {
  hue: number;
  saturation: number;
  capsuleClassName: string;
  dotClassName: string;
  textClassName: string;
};

const DEFAULT_TRAVEL_METHOD_STYLE: TravelMethodStyle = {
  hue: 215,
  saturation: 16,
  capsuleClassName: 'bg-slate-100 ring-slate-200',
  dotClassName: 'bg-slate-400',
  textClassName: 'text-slate-700',
};

const TRAVEL_METHOD_STYLES: Record<string, TravelMethodStyle> = {
  Drive: {
    hue: 203,
    saturation: 82,
    capsuleClassName: 'bg-sky-50 ring-sky-200',
    dotClassName: 'bg-sky-400',
    textClassName: 'text-sky-700',
  },
  Walk: {
    hue: 152,
    saturation: 78,
    capsuleClassName: 'bg-emerald-50 ring-emerald-200',
    dotClassName: 'bg-emerald-400',
    textClassName: 'text-emerald-700',
  },
  Transit: {
    hue: 262,
    saturation: 84,
    capsuleClassName: 'bg-violet-50 ring-violet-200',
    dotClassName: 'bg-violet-400',
    textClassName: 'text-violet-700',
  },
  Bicycle: {
    hue: 42,
    saturation: 88,
    capsuleClassName: 'bg-amber-50 ring-amber-200',
    dotClassName: 'bg-amber-400',
    textClassName: 'text-amber-700',
  },
  'Two Wheeler': {
    hue: 342,
    saturation: 82,
    capsuleClassName: 'bg-rose-50 ring-rose-200',
    dotClassName: 'bg-rose-400',
    textClassName: 'text-rose-700',
  },
};

const STROKE_LIGHTNESS_SEQUENCE = [46, 56, 38, 62];

const getTravelMethodStyle = (travelMethod: string) => {
  return TRAVEL_METHOD_STYLES[travelMethod] ?? DEFAULT_TRAVEL_METHOD_STYLE;
};

export const getTravelMethodPalette = (travelMethod: string) => {
  const { capsuleClassName, dotClassName, textClassName } = getTravelMethodStyle(travelMethod);

  return {
    capsuleClassName,
    dotClassName,
    textClassName,
  };
};

export const getTravelMethodStrokeColor = (travelMethod: string, variantIndex = 0) => {
  const { hue, saturation } = getTravelMethodStyle(travelMethod);
  const lightness =
    STROKE_LIGHTNESS_SEQUENCE[
      ((variantIndex % STROKE_LIGHTNESS_SEQUENCE.length) + STROKE_LIGHTNESS_SEQUENCE.length) %
        STROKE_LIGHTNESS_SEQUENCE.length
    ];

  return `hsl(${hue} ${saturation}% ${lightness}%)`;
};
