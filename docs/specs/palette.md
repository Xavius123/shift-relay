# Brand palette

Status: built · 2026-09-23

Shift Relay uses blue-charcoal text, Care blue for primary navigation and actions, golden attention details, muted Plum, Sea-glass teal, and coral notifications on white or cool off-white surfaces.

## Theme choices

The product offers three accent themes. These change primary actions, links, selection indicators, focus rings, and the `accent` Badge only.

| Internal name | Display label | Role | Default |
|---------------|---------------|------|---------|
| `care` | Care blue | Clear, dependable company-adjacent primary | yes |
| `plum` | Plum | Warmer, quieter alternative | no |
| `seaGlass` | Sea glass | Calm operational alternative | no |

Coral is reserved for the fixed error/urgent family; it is not a selectable theme.

## Accent scales

| Step | Care blue | Plum | Sea glass |
|------|-----------|------|-----------|
| 200 | `#B7E2F2` | `#E2CDE8` | `#B8E2DB` |
| 300 | `#7CCAE4` | `#C9AAD3` | `#86CCC0` |
| 400 | `#43ADD4` | `#B58BC3` | `#55B3A3` |
| 500 | `#168CB8` | `#9366A3` | `#379484` |
| 600 | `#0C6F96` | `#784B88` | `#287767` |
| 700 | `#0A5878` | `#623B70` | `#205F53` |
| 800 | `#08435C` | `#4D2E59` | `#194A41` |

The `600` step is deliberately dark enough for small white text on the primary fill to meet 4.5:1. Dark mode uses each theme's `400` step with near-black foreground text.

## Neutral scale

| Step | Hex | Step | Hex |
|------|-----|------|-----|
| 0 | `#FFFFFF` | 500 | `#5E6F74` |
| 25 | `#FCFCFB` | 600 | `#506166` |
| 50 | `#F6F7F7` | 700 | `#405057` |
| 100 | `#ECEFEF` | 800 | `#303E44` |
| 200 | `#DCE1E2` | 900 | `#223137` |
| 300 | `#C3CCCE` | 950 | `#152126` |
| 400 | `#95A3A7` | | |

The cool-neutral structure keeps text and icons crisp against light and dark surfaces.

## Fixed semantic colors

Status colors do not change with the selected theme.

| Meaning | Family | Logging use |
|---------|--------|-------------|
| Error / urgent | Coral | urgent priority, failures, destructive actions |
| Warning / attention | Gold | high priority and warnings |
| Success / complete | Sea-glass green | resolved and completed work |
| Information | Care blue | informational notices |
| Pending | Warning treatment | unsigned shift log |
| Selected | Selected theme accent | active controls and navigation |
| Complete | Success treatment | signed log or completed issue |

Every state retains a text label; meaning never relies on hue alone.

## Acceptance

- `Accent` contains exactly `care | plum | seaGlass`.
- `defaultAccent` is `care`.
- Theme controls show “Care blue,” “Plum,” and “Sea glass.”
- Every light/dark × accent contrast pair passes without lowering a minimum.
- Urgent remains coral, high remains gold, and resolved remains green in all themes.
- Dashboard, Logs, detail, shell, dark mode, and design-system E2E remain green.
- Camera/proof photos remain out of scope.
