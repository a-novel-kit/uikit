/** Twelve OKLCH colors ordered from darkest to lightest. */
export type ColorScale = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

/** Public metadata describing how the generated palette is derived and validated. */
export interface ColorSystem {
  /** WCAG contrast targets and generated measurements. */
  readonly contrast: {
    readonly accentStep: number;
    readonly inverseStep: number;
    readonly method: string;
    readonly minimumNormalText: number;
    readonly actionValues: {
      readonly brand: number;
      readonly pressure: number;
    };
    readonly values: {
      readonly brand: number;
      readonly pressure: number;
      readonly signal: number;
    };
  };
  /** Authoring color space and browser gamut-mapping target. */
  readonly gamut: {
    readonly authoring: string;
    readonly mapping: string;
    readonly target: string;
  };
  /** Hue relationships used to derive the accent families. */
  readonly harmony: {
    readonly halfTurn: number;
    readonly brandHue: number;
    readonly oppositionBias: number;
    readonly oppositionSpread: number;
    readonly gaps: readonly number[];
    readonly hues: {
      readonly brand: number;
      readonly pressure: number;
      readonly signal: number;
    };
    readonly oppositionCenter: number;
  };
  /** Human-readable name of the palette model. */
  readonly model: string;
  /** Parameters used to generate the neutral scale. */
  readonly neutral: {
    readonly chroma: number;
    readonly lightnessCurve: number;
    readonly lightnessFloor: number;
    readonly lightnessPeak: number;
  };
  /** Parameters and gamut cusps used to generate the accent scales. */
  readonly scale: {
    readonly lightnessFloor: number;
    readonly relativeChromaFloor: number;
    readonly relativeChromaPeak: number;
    readonly toneCurve: "smoothstep";
    readonly divisions: number;
    readonly multipliers: readonly number[];
    readonly peakRatios: {
      readonly pressure: {
        readonly chroma: number;
        readonly lightness: number;
      };
      readonly signal: {
        readonly chroma: number;
        readonly lightness: number;
      };
    };
    readonly peaks: {
      readonly brand: {
        readonly chroma: number;
        readonly lightness: number;
      };
      readonly pressure: {
        readonly chroma: number;
        readonly lightness: number;
      };
      readonly signal: {
        readonly chroma: number;
        readonly lightness: number;
      };
    };
  };
}

/** Frozen metadata for the generated color system. */
export const colorSystem: Readonly<ColorSystem>;

/** Frozen neutral and accent scales for tooling that consumes color values directly. */
export const palette: Readonly<{
  /** Neutral scale. */
  neutral: ColorScale;
  /** Primary interactive accent scale. */
  brand: ColorScale;
  /** Destructive and high-pressure accent scale. */
  pressure: ColorScale;
  /** Informational signal accent scale. */
  signal: ColorScale;
}>;
