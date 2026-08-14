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

export interface ColorSystem {
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
  readonly gamut: {
    readonly authoring: string;
    readonly mapping: string;
    readonly target: string;
  };
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
  readonly model: string;
  readonly neutral: {
    readonly chroma: number;
    readonly lightnessCurve: number;
    readonly lightnessFloor: number;
    readonly lightnessPeak: number;
  };
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

export const colorSystem: Readonly<ColorSystem>;

export const palette: Readonly<{
  neutral: ColorScale;
  brand: ColorScale;
  pressure: ColorScale;
  signal: ColorScale;
}>;
