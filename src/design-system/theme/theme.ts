import { base, type ColorTokens, type Scheme, schemes } from '../tokens/generated';

export type Theme = typeof base & {
  scheme: Scheme;
  color: ColorTokens;
};

/** Builds the theme for one scheme: the base scales plus that scheme's colors. */
export function createTheme(scheme: Scheme): Theme {
  return { ...base, scheme, color: schemes[scheme].color };
}
