import {
  type Accent,
  accentColorOverrides,
  base,
  type ColorTokens,
  type Scheme,
  schemes,
} from '../tokens/generated';

export type Theme = typeof base & {
  scheme: Scheme;
  accent: Accent;
  color: ColorTokens;
};

/** Builds the theme for one scheme × accent: base scales, the scheme's colors, then the accent's overrides. */
export function createTheme(scheme: Scheme, accent: Accent): Theme {
  const color: ColorTokens = { ...schemes[scheme].color, ...accentColorOverrides[accent][scheme] };
  return { ...base, scheme, accent, color };
}
