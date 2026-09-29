# Badge

Status: built (2026-09-22)

| Prop | Type | Default |
|------|------|---------|
| `variant` | `StatusVariant` = `'default' \| 'accent' \| 'success' \| 'error' \| 'warning' \| 'info'` | `'default'` |
| `children` | `string \| number` | required |
| `max` | `number` | — (numbers above show `{max}+`, as on web) |
| `testID` | `string` | — |

**Tokens:** bg/fg pairs: default `bgSubtle`/`textMuted` · accent `accent`/`accentFg` · success `successBg`/`success` · error `errorBg`/`error` · warning `warningBg`/`warning` · info `infoBg`/`info` · `radius.full` · `fontSize.xs` semibold · padding `spacing` 1/2.

**In this app:** open high-priority issues use `error`; pending logs use `warning`; signed-off logs and completed issues use `success`. The mapping lives in `features/logs`, not in Badge.

**Accessibility:** text is readable by screen readers; no color-only meaning (the label always names the priority or status).

**Verify:** design system screen shows all six variants (`testID="badge-{variant}"`).
