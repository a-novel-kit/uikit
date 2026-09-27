/** Twelve CSS oklch() strings, darkest to lightest; index 0 corresponds to CSS token step 1. */
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
    /** One-based accent step used for the text contrast measurements. */
    readonly accentStep: number;
    /** One-based neutral step used as the inverse foreground. */
    readonly inverseStep: number;
    /** Contrast algorithm name understood by Color.js. */
    readonly method: string;
    /** Minimum accepted contrast ratio for normal-size text. */
    readonly minimumNormalText: number;
    /** Measured action-background contrast against the inverse foreground. */
    readonly actionValues: {
      /** Primary action contrast ratio. */
      readonly brand: number;
      /** Destructive action contrast ratio. */
      readonly pressure: number;
    };
    /** Measured accent-step contrast ratios against the inverse foreground. */
    readonly values: {
      /** Primary accent contrast ratio. */
      readonly brand: number;
      /** Destructive accent contrast ratio. */
      readonly pressure: number;
      /** Informational accent contrast ratio. */
      readonly signal: number;
    };
  };
  /** Authoring color space and browser gamut-mapping target. */
  readonly gamut: {
    /** Perceptual color space in which the palette is authored. */
    readonly authoring: string;
    /** Gamut-mapping specification applied during conversion. */
    readonly mapping: string;
    /** Output gamut selected for rendering. */
    readonly target: string;
  };
  /** Hue relationships used to derive the accent families. */
  readonly harmony: {
    /** Angular distance to the opposing hue, in degrees. */
    readonly halfTurn: number;
    /** Starting hue of the primary accent, in degrees. */
    readonly brandHue: number;
    /** Degree offset applied to the opposing hue. */
    readonly oppositionBias: number;
    /** Degree separation between the two opposing accent families. */
    readonly oppositionSpread: number;
    /** Forward hue gaps in degrees: brand to pressure, pressure to signal, then signal to brand. */
    readonly gaps: readonly number[];
    /** Derived accent hue angles, normalized to [0, 360). */
    readonly hues: {
      /** Primary interactive hue in degrees. */
      readonly brand: number;
      /** Destructive accent hue in degrees. */
      readonly pressure: number;
      /** Informational accent hue in degrees. */
      readonly signal: number;
    };
    /** Midpoint of the opposing accent hues, in degrees. */
    readonly oppositionCenter: number;
  };
  /** Human-readable name of the palette model. */
  readonly model: string;
  /** Parameters used to generate the neutral scale. */
  readonly neutral: {
    /** Constant OKLCH chroma across the neutral scale. */
    readonly chroma: number;
    /** Exponent applied to normalized scale progress. */
    readonly lightnessCurve: number;
    /** Darkest OKLCH lightness, on the 0–1 scale. */
    readonly lightnessFloor: number;
    /** Lightest OKLCH lightness, on the 0–1 scale. */
    readonly lightnessPeak: number;
  };
  /** Parameters and gamut cusps used to generate the accent scales. */
  readonly scale: {
    /** Starting OKLCH lightness shared by accent families, on the 0–1 scale. */
    readonly lightnessFloor: number;
    /** Starting chroma fraction relative to the Display P3 boundary at the current lightness and hue. */
    readonly relativeChromaFloor: number;
    /** Ending chroma fraction relative to the Display P3 boundary at the current lightness and hue. */
    readonly relativeChromaPeak: number;
    /** Interpolation curve between the authored endpoints. */
    readonly toneCurve: "smoothstep";
    /** Number of intervals between scale endpoints. */
    readonly divisions: number;
    /** Zero-based step numbers divided by divisions to obtain normalized progress. */
    readonly multipliers: readonly number[];
    /** Family peak coordinates expressed as ratios of the primary accent peak. */
    readonly peakRatios: {
      /** Destructive-family ratios relative to brand. */
      readonly pressure: {
        /** Peak chroma divided by brand peak chroma. */
        readonly chroma: number;
        /** Peak lightness divided by brand peak lightness. */
        readonly lightness: number;
      };
      /** Informational-family ratios relative to brand. */
      readonly signal: {
        /** Peak chroma divided by brand peak chroma. */
        readonly chroma: number;
        /** Peak lightness divided by brand peak lightness. */
        readonly lightness: number;
      };
    };
    /** Highest-chroma Display P3 samples found within the authored lightness search range. */
    readonly peaks: {
      /** Primary accent cusp coordinates. */
      readonly brand: {
        /** Absolute OKLCH chroma at the sampled cusp. */
        readonly chroma: number;
        /** OKLCH lightness at the sampled cusp, on the 0–1 scale. */
        readonly lightness: number;
      };
      /** Destructive accent cusp coordinates. */
      readonly pressure: {
        /** Absolute OKLCH chroma at the sampled cusp. */
        readonly chroma: number;
        /** OKLCH lightness at the sampled cusp, on the 0–1 scale. */
        readonly lightness: number;
      };
      /** Informational accent cusp coordinates. */
      readonly signal: {
        /** Absolute OKLCH chroma at the sampled cusp. */
        readonly chroma: number;
        /** OKLCH lightness at the sampled cusp, on the 0–1 scale. */
        readonly lightness: number;
      };
    };
  };
}

/** Read-only metadata for the generated color system. The root is shallow-frozen at runtime. */
export const colorSystem: Readonly<ColorSystem>;

/**
 * Frozen neutral and accent scales for tools that consume color values directly.
 * These are build-time values; CSS token overrides do not update them.
 *
 * @example
 * ```ts
 * import { palette } from "@a-novel-kit/uikit-tokens/palette";
 * const accent = palette.brand[8]; // CSS token --color-brand-9
 * ```
 */
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
