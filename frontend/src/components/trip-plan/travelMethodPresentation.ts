type TravelMethodStyle = {
  hue: number;
  saturation: number;
  dotColor: string;
  capsuleClassName: string;
  capsuleHoverClassName: string;
  dotClassName: string;
  dotHoverClassName: string;
  textClassName: string;
  textHoverClassName: string;
};

const DEFAULT_TRAVEL_METHOD_STYLE: TravelMethodStyle = {
  hue: 215,
  saturation: 16,
  dotColor: '#94A3B8',
  capsuleClassName: 'bg-slate-100 ring-slate-200',
  capsuleHoverClassName:
    'group-hover:bg-slate-400 group-hover:ring-slate-400 group-focus-visible:bg-slate-400 group-focus-visible:ring-slate-400',
  dotClassName: 'bg-slate-400',
  dotHoverClassName: 'peer-hover:bg-slate-100 peer-focus-visible:bg-slate-100',
  textClassName: 'text-slate-700',
  textHoverClassName: 'peer-hover:text-white peer-focus-visible:text-white',
};

const TRAVEL_METHOD_STYLES: Record<string, TravelMethodStyle> = {
  Drive: {
    hue: 203,
    saturation: 82,
    dotColor: '#38BDF8',
    capsuleClassName: 'bg-sky-50 ring-sky-200',
    capsuleHoverClassName:
      'group-hover:bg-sky-400 group-hover:ring-sky-400 group-focus-visible:bg-sky-400 group-focus-visible:ring-sky-400',
    dotClassName: 'bg-sky-400',
    dotHoverClassName: 'peer-hover:bg-sky-50 peer-focus-visible:bg-sky-50',
    textClassName: 'text-sky-700',
    textHoverClassName: 'peer-hover:text-white peer-focus-visible:text-white',
  },
  Walk: {
    hue: 152,
    saturation: 78,
    dotColor: '#34D399',
    capsuleClassName: 'bg-emerald-50 ring-emerald-200',
    capsuleHoverClassName:
      'group-hover:bg-emerald-400 group-hover:ring-emerald-400 group-focus-visible:bg-emerald-400 group-focus-visible:ring-emerald-400',
    dotClassName: 'bg-emerald-400',
    dotHoverClassName: 'peer-hover:bg-emerald-50 peer-focus-visible:bg-emerald-50',
    textClassName: 'text-emerald-700',
    textHoverClassName: 'peer-hover:text-white peer-focus-visible:text-white',
  },
  Transit: {
    hue: 262,
    saturation: 84,
    dotColor: '#A78BFA',
    capsuleClassName: 'bg-violet-50 ring-violet-200',
    capsuleHoverClassName:
      'group-hover:bg-violet-400 group-hover:ring-violet-400 group-focus-visible:bg-violet-400 group-focus-visible:ring-violet-400',
    dotClassName: 'bg-violet-400',
    dotHoverClassName: 'peer-hover:bg-violet-50 peer-focus-visible:bg-violet-50',
    textClassName: 'text-violet-700',
    textHoverClassName: 'peer-hover:text-white peer-focus-visible:text-white',
  },
  Bicycle: {
    hue: 42,
    saturation: 88,
    dotColor: '#FBBF24',
    capsuleClassName: 'bg-amber-50 ring-amber-200',
    capsuleHoverClassName:
      'group-hover:bg-amber-400 group-hover:ring-amber-400 group-focus-visible:bg-amber-400 group-focus-visible:ring-amber-400',
    dotClassName: 'bg-amber-400',
    dotHoverClassName: 'peer-hover:bg-amber-50 peer-focus-visible:bg-amber-50',
    textClassName: 'text-amber-700',
    textHoverClassName: 'peer-hover:text-white peer-focus-visible:text-white',
  },
  'Two Wheeler': {
    hue: 342,
    saturation: 82,
    dotColor: '#FB7185',
    capsuleClassName: 'bg-rose-50 ring-rose-200',
    capsuleHoverClassName:
      'group-hover:bg-rose-400 group-hover:ring-rose-400 group-focus-visible:bg-rose-400 group-focus-visible:ring-rose-400',
    dotClassName: 'bg-rose-400',
    dotHoverClassName: 'peer-hover:bg-rose-50 peer-focus-visible:bg-rose-50',
    textClassName: 'text-rose-700',
    textHoverClassName: 'peer-hover:text-white peer-focus-visible:text-white',
  },
};

const STROKE_LIGHTNESS_SEQUENCE = [46, 56, 38, 62];

const getTravelMethodStyle = (travelMethod: string) => {
  return TRAVEL_METHOD_STYLES[travelMethod] ?? DEFAULT_TRAVEL_METHOD_STYLE;
};

export const getTravelMethodPalette = (travelMethod: string) => {
  const {
    capsuleClassName,
    capsuleHoverClassName,
    dotColor,
    dotClassName,
    dotHoverClassName,
    textClassName,
    textHoverClassName,
  } = getTravelMethodStyle(travelMethod);

  return {
    capsuleClassName,
    capsuleHoverClassName,
    dotColor,
    dotClassName,
    dotHoverClassName,
    textClassName,
    textHoverClassName,
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
